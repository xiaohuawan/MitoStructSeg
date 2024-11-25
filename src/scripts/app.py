import os
import requests
import shutil
import json
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from classification import run_classification
import uuid
from inference import Segment
from compute import MitoCompute
from postProcess import PostProcess
import sys
import os

# 将 src 目录添加到 Python 路径中
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))



app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Configuration
UPLOAD_FOLDER = 'uploaded_files'
SEGMENT_UPLOAD_FOLDER = 'segment_files'
ALLOWED_EXTENSIONS = {'png', 'tif', 'tiff', 'pt', 'ckpt'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SEGMENT_UPLOAD_FOLDER'] = SEGMENT_UPLOAD_FOLDER

# Ensure directories exist
if os.path.exists(UPLOAD_FOLDER):
    shutil.rmtree(UPLOAD_FOLDER)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

if os.path.exists(SEGMENT_UPLOAD_FOLDER):
    shutil.rmtree(SEGMENT_UPLOAD_FOLDER)
os.makedirs(SEGMENT_UPLOAD_FOLDER, exist_ok=True)

progress_data = {}

def allowed_file(filename, extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in extensions

@app.route('/upload', methods=['POST'])
def upload_files():
    task_id = str(uuid.uuid4())
    progress_data[task_id] = 0  # Initialize progress

    try:
        if 'images' not in request.files or 'model' not in request.files:
            return jsonify({'error': 'Missing files'}), 400

        images = request.files.getlist('images')
        model_file = request.files['model']

        if not all(allowed_file(image.filename, {'png', 'tif', 'mrc'}) for image in images):
            return jsonify({'error': 'Invalid image file format'}), 400

        if not allowed_file(model_file.filename, {'pt'}):
            return jsonify({'error': 'Invalid model file format'}), 400

        image_paths = [save_file(image, UPLOAD_FOLDER) for image in images]
        model_path = save_file(model_file, UPLOAD_FOLDER)

        # Call the classification function
        result = run_classification(image_paths, model_path, task_id, progress_data)
        return jsonify({'result': result, 'task_id': task_id})

    except Exception as e:
        print("Error uploading files:", e)
        traceback.print_exc()  # Print the stack trace for debugging
        return jsonify({'error': str(e)}), 500


def save_file(file, directory):
    if not os.path.exists(directory):
        os.makedirs(directory)
    filepath = os.path.join(directory, file.filename)
    file.save(filepath)
    return filepath

@app.route('/segment', methods=['POST'])
def segment_files():
    if 'images' not in request.files or 'model' not in request.files:
        return jsonify({'error': 'Missing files'}), 400

    images = request.files.getlist('images')
    model_file = request.files['model']

    if not all(allowed_file(image.filename, {'png', 'tif'}) for image in images):
        return jsonify({'error': 'Invalid image file format'}), 400

    if not allowed_file(model_file.filename, {'ckpt'}):
        return jsonify({'error': 'Invalid model file format'}), 400

    # Clear and recreate segment folder
    shutil.rmtree(SEGMENT_UPLOAD_FOLDER, ignore_errors=True)
    os.makedirs(SEGMENT_UPLOAD_FOLDER)

    image_paths = [save_file(image, SEGMENT_UPLOAD_FOLDER) for image in images]
    model_path = save_file(model_file, SEGMENT_UPLOAD_FOLDER)

    try:
        seg = Segment(path_data=SEGMENT_UPLOAD_FOLDER, path_weights=SEGMENT_UPLOAD_FOLDER)
        highlight_paths = seg.launch()
        return jsonify({'highlight_paths': highlight_paths}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/compute', methods=['POST'])
def compute():
    if request.content_type != 'application/json':
        return jsonify({"error": "Unsupported Media Type"}), 415

    try:
        json_url = 'http://localhost:3000/free/seg/png_paths.json'
        
        response = requests.get(json_url)
        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch JSON file"}), 400

        json_data = response.json()
        print("JSON Data:", json_data)

        image_paths = json_data
        if not isinstance(image_paths, list) or not image_paths:
            return jsonify({"error": "No image paths found in JSON"}), 400
        
        downloaded_files = []
        for url in image_paths:
            filename = url.split('/')[-1]
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            img_response = requests.get(url, stream=True)
            if img_response.status_code == 200:
                with open(file_path, 'wb') as f:
                    shutil.copyfileobj(img_response.raw, f)
                downloaded_files.append(file_path)
            else:
                return jsonify({"error": f"Failed to download image: {url}"}), 400

        mito_compute = MitoCompute(file_paths=downloaded_files)  # 修改这里
        mito_compute.handle()

        return jsonify({"status": "success"})
    except Exception as e:
        print("Error processing request:", e)
        traceback.print_exc()
        return jsonify({"error": "Internal server error"}), 500


@app.route('/process-images', methods=['POST'])
def process_images():
    data = request.json
    if data is None:
        return jsonify({"error": "No JSON data provided"}), 400

    kernel_size = data.get('kernel_size', 2)

    data_url = "http://localhost:3000/free/seg/png"
    json_url = "http://localhost:3000/free/seg/png_paths.json"
    current_path = os.getcwd()
    save_path = os.path.abspath(os.path.join(current_path, '..', '..', 'vite', 'public', 'postP')) 
    process = PostProcess(data_url=data_url, json_url=json_url, save_path=save_path)

    path_list = process.download_images()
    process.del_dot_byOpen(kernel_size, path_list)

    return jsonify({"message": "Processing complete", "kernel_size": kernel_size})

@app.route('/progress', methods=['GET'])
def progress():
    task_id = request.args.get('task_id')
    if not task_id or task_id not in progress_data:
        return jsonify({'error': 'Invalid task_id'}), 400
    return jsonify({'progress': progress_data[task_id]})

if __name__ == "__main__":
    app.run(debug=True)



