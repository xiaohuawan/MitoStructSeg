
import shutil
import json
from datetime import datetime
import os
import cv2
import yaml
import time
import argparse
import numpy as np
import tifffile as tif
import pandas as pd
import torch

from tqdm import tqdm
from attrdict import AttrDict
from collections import OrderedDict
from PIL import Image
from model.AMM_Seg import AMM_Seg
from dataset.target_dataset import targetDataSet_val, Evaluation
from utils.train_utils import inference_results
from utils import core
from datetime import datetime
import json
import traceback
import warnings
warnings.filterwarnings("ignore")

class Segment(core.MiTo):
    def __init__(self, path_data, path_weights):
        super().__init__()
        self.path_data = path_data
        self.path_weights = path_weights
        self.path_weights = self._find_latest_ckpt() 
        print(f"Initialized Segment with path_data: {self.path_data} and path_weights: {self.path_weights}")
        self.cfg_file_path = os.path.join(os.path.dirname(__file__), 'config', 'patient1_config.yaml')

    def _find_latest_ckpt(self):
        ckpt_files = [f for f in os.listdir(self.path_weights) if f.endswith('.ckpt')]
        if not ckpt_files:
            raise ValueError(f"No checkpoint files found in the directory: {self.path_weights}")
        latest_ckpt = max(ckpt_files, key=lambda f: os.path.getmtime(os.path.join(self.path_weights, f)))
        return os.path.join(self.path_weights, latest_ckpt)

    def cover_cfg(self, cfg):
        """
        Override default configuration file
        """
        cfg.DATA.data_dir_val = self.path_data

 
    def launch(self):
        num = 40
        try:
            print(f"Path to weights: {self.path_weights}")
            print(f"Path to data: {self.path_data}")

            with open(self.cfg_file_path, 'rb') as f:
                cfg = AttrDict(yaml.load(f, Loader=yaml.FullLoader))

            # Load model
            device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
            # device = torch.device('cpu')

            model = AMM_Seg(n_channels=cfg.MODEL.input_nc, n_classes=cfg.MODEL.output_nc).to(device)
            checkpoint = torch.load(self.path_weights, map_location=device)

            new_state_dict = OrderedDict()
            state_dict = checkpoint['model_weights']
            for k, v in state_dict.items():
                new_state_dict[k] = v
            model.load_state_dict(new_state_dict)
            model.eval()

            # Process images
            image_files = [f for f in os.listdir(self.path_data) if f.endswith(('.png', '.tif'))]
            if not image_files:
                raise ValueError(f"No image files found in the directory: {self.path_data}")

            # val_data = targetDataSet_val(cfg.DATA.data_dir_target,
            #                                     crop_size=(cfg.DATA.input_size_target, cfg.DATA.input_size_target),
            #                                     stride=cfg.DATA.target_stride, mode="test")
            val_data = targetDataSet_val(self.path_data,
                                    crop_size=(cfg.DATA.input_size_target, cfg.DATA.input_size_target),
                                    stride=cfg.DATA.target_stride, mode="test")

            valid_provider = torch.utils.data.DataLoader(val_data, batch_size=1, shuffle=False)

            self.out_path = os.path.join(os.path.dirname(__file__), '..', 'inference')
            self.out_path = os.path.abspath(self.out_path)
            os.makedirs(self.out_path, exist_ok=True)
            target_stride = cfg.DATA.target_stride

            preds_int = np.zeros((len(val_data) + 1, 800, 800), dtype=np.uint8)
            preds = np.zeros((len(val_data) + 1, 800, 800), dtype=np.float32)
            current_imgs = []
            aux_imgs = []
            t1 = time.time()
            for i_pic, (cimg, _, aimg, _, _, current_img, aux_img, current_filter, aux_filter) in tqdm(enumerate(valid_provider), ncols=80):
                cimg = cimg.to(device)
                aimg = aimg.to(device)
                cfilter = current_filter.to(device)
                afilter = aux_filter.to(device)
                img_cat = torch.cat([cimg, aimg], dim=1)
                filter_cat = torch.cat([cfilter,afilter], dim=1)
                with torch.no_grad():
                    cpred, apred = model(img_cat, filter_cat, diff=False)
                preds_int[i_pic] = inference_results(cpred, preds_int[i_pic])
                preds_int[i_pic+target_stride] = inference_results(apred, preds_int[i_pic+target_stride])

                current_imgs.append(current_img)
                aux_imgs.append(aux_img)
            t2 = time.time()
            print('Prediction time (s):', (t2 - t1))

            current_time = datetime.now().strftime("%Y%m%d_%H%M%S")
            current_path = os.getcwd()
            # Save results
            highlight_paths = []
            highlight_paths2 = []
            current_path = os.getcwd()
            print("8888888888888888", current_path)
            self.json_dir = os.path.join(current_path, '..', 'vite', 'public', current_time)
            self.json_dir = os.path.abspath(self.json_dir)
            self.json_dir2 = os.path.join(current_path, '..', 'vite', 'public', 'seg')
            self.json_dir3 = os.path.join(current_path, '..', 'vite', 'public', 'seg')
            self.json_dir4 = os.path.join(current_path, '..', 'vite', 'public')

            if os.path.exists(self.json_dir):
                shutil.rmtree(self.json_dir)
            os.makedirs(self.json_dir, exist_ok=True)

            if os.path.exists(self.json_dir2):
                shutil.rmtree(self.json_dir2)
            os.makedirs(self.json_dir2, exist_ok=True)

            if os.path.exists(os.path.join(self.json_dir4, 'postP')):
                shutil.rmtree(os.path.join(self.json_dir4, 'postP'))
                os.makedirs(os.path.join(self.json_dir4, 'postP'), exist_ok=True)

            seg_source_path = os.path.abspath(os.path.join(current_path, '..','vite', 'public', f"{current_time}_source"))
            if os.path.exists(seg_source_path):
                shutil.rmtree(seg_source_path)
            os.makedirs(seg_source_path, exist_ok=True)

            seg_source_path2 = os.path.abspath(os.path.join(current_path, '..','vite', 'public', 'seg_source'))
            if os.path.exists(seg_source_path2):
                shutil.rmtree(seg_source_path2)
            os.makedirs(seg_source_path2, exist_ok=True)
            

            original_image_paths = []  
            png_paths = []

            original_image_paths2 = []  
            png_paths2 = []

            original_image_paths3 = []  
            png_paths3 = []

            original_image_paths4 = []  
            png_paths4 = []


            for i, (pred, current_img) in enumerate(zip(preds_int, current_imgs)):
                file_name = os.path.basename(current_img[0]).split(".tif")[0]

                original_image_path = os.path.join(seg_source_path, f"{file_name}.png")
                original_image = Image.open(current_img[0]).convert('RGBA')
                original_image.save(original_image_path)

                original_image_path2 = os.path.join(seg_source_path2, f"{file_name}.png")
                original_image2 = Image.open(current_img[0]).convert('RGBA')
                original_image2.save(original_image_path2)

                modified_original_path = f"/free/{current_time}_source/{file_name}.png"
                original_image_paths.append(modified_original_path)

                modified_original_path2 = f"/free/seg_source/{file_name}.png"
                original_image_paths2.append(modified_original_path2)

                tif_path = os.path.join(self.json_dir, "tif")
                os.makedirs(tif_path, exist_ok=True)
                tif_path = os.path.join(tif_path, f"{file_name}.tif")
                tif.imsave(tif_path, pred)

                tif_path2 = os.path.join(self.json_dir2, "tif")
                os.makedirs(tif_path2, exist_ok=True)
                tif_path2 = os.path.join(tif_path2, f"{file_name}.tif")
                tif.imsave(tif_path2, pred)

                png_path = os.path.join(self.json_dir, "png")
                os.makedirs(png_path, exist_ok=True)
                image = Image.fromarray(pred * 255)
                image.save(os.path.join(png_path, f"{file_name}.png"))

                png_path2 = os.path.join(self.json_dir2, "png")
                os.makedirs(png_path2, exist_ok=True)
                image = Image.fromarray(pred * 255)
                image.save(os.path.join(png_path2, f"{file_name}.png"))

                png_path3 = os.path.join(self.json_dir2, "postP")
                os.makedirs(png_path3, exist_ok=True)
                image = Image.fromarray(pred * 255)
                image.save(os.path.join(png_path3, f"{file_name}.png"))

                png_path4 = os.path.join(self.json_dir4, "postP")
                os.makedirs(png_path4, exist_ok=True)
                image = Image.fromarray(pred * 255)
                image.save(os.path.join(png_path4, f"{file_name}.png"))

                highlight_path = os.path.join(self.json_dir, "highlight")
                os.makedirs(highlight_path, exist_ok=True)
                maroon_color = np.array([128, 0, 0], dtype=np.uint16)
                pred_colored = np.tile(pred[:, :, np.newaxis], [1, 1, 3])
                pred_colored = pred_colored * maroon_color
                pred_colored = pred_colored.astype(np.uint8)
                pred_img = Image.fromarray(pred_colored)
                mask = Image.fromarray(pred * 255).convert('L')
                highlighted_image = Image.composite(pred_img, original_image, mask)
                highlighted_file_name = f"{file_name}.png"
                highlighted_path = os.path.join(highlight_path, highlighted_file_name)
                highlighted_image.save(highlighted_path)
                
                highlight_path2 = os.path.join(self.json_dir2, "highlight")
                os.makedirs(highlight_path2, exist_ok=True)
                maroon_color = np.array([128, 0, 0], dtype=np.uint16)
                pred_colored = np.tile(pred[:, :, np.newaxis], [1, 1, 3])
                pred_colored = pred_colored * maroon_color
                pred_colored = pred_colored.astype(np.uint8)
                pred_img = Image.fromarray(pred_colored)
                mask = Image.fromarray(pred * 255).convert('L')
                highlighted_image2 = Image.composite(pred_img, original_image, mask)
                highlighted_file_name2 = f"{file_name}.png"
                highlighted_path2 = os.path.join(highlight_path2, highlighted_file_name2)
                highlighted_image2.save(highlighted_path2)
                modified_highlight_path2 = f"../free/seg/highlight/{highlighted_file_name}"
                highlight_paths2.append(modified_highlight_path2)


                png_path = f"http://localhost:3000/free/{current_time}/png/{highlighted_file_name}"
                png_paths.append(png_path)

                png_path2 = f"http://localhost:3000/free/seg/png/{highlighted_file_name}"
                png_paths2.append(png_path2)

                png_path3 = f"http://localhost:3000/free/seg/postP/{highlighted_file_name}"
                png_paths3.append(png_path3)

                png_path4 = f"http://localhost:3000/free/postP/{highlighted_file_name}"
                png_paths4.append(png_path4)


            source_file_path = os.path.join(seg_source_path, 'source_paths.json')
            with open(source_file_path, 'w') as source_file:
                json.dump(original_image_paths, source_file)

            source_file_path2 = os.path.join(seg_source_path2, 'source_paths.json')
            with open(source_file_path2, 'w') as source_file:
                json.dump(original_image_paths2, source_file)

            json_file_path = os.path.join(self.json_dir, 'highlight_paths.json')
            with open(json_file_path, 'w') as json_file:
                json.dump(highlight_paths, json_file)

            json_file_path2 = os.path.join(self.json_dir2, 'highlight_paths.json')
            with open(json_file_path2, 'w') as json_file:
                json.dump(highlight_paths2, json_file)

            png_file_path = os.path.join(self.json_dir, 'png_paths.json')
            with open(png_file_path, 'w') as png_file:
                json.dump(png_paths, png_file)

            png_file_path2 = os.path.join(self.json_dir2, 'png_paths.json')
            with open(png_file_path2, 'w') as png_file:
                json.dump(png_paths2, png_file)
            
            png_file_path3 = os.path.join(self.json_dir3, 'postP_paths.json')
            with open(png_file_path3, 'w') as png_file:
                json.dump(png_paths3, png_file)
            
            png_file_path4 = os.path.join(self.json_dir4, 'postP', 'postP.json')
            with open(png_file_path4, 'w') as png_file:
                json.dump(png_paths4, png_file)

            return {
                "highlight_paths": highlight_paths,
                "current_time": current_time 
                }

        except Exception as e:
            print(f"An error occurred during segmentation: {e}")
            traceback.print_exc()
            raise

def main_from_cli():
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', type=str, default='AMM-Seg', help='config file')
    parser.add_argument('-c', '--cfg', type=str, default='patient1_config', help='config file')
    args = parser.parse_args()
    
    cfg_file = args.cfg + '.yaml'
    print('cfg_file: ' + cfg_file)
    with open('./config/' + cfg_file, 'r') as f:
        cfg = AttrDict(yaml.load(f, Loader=yaml.FullLoader))
    
    num = 40
    device = cfg.TRAIN.device
    model = AMM_Seg(n_channels=cfg.MODEL.input_nc, n_classes=cfg.MODEL.output_nc).to(device)
    
    os.makedirs(cfg.TEST.pred_dir, exist_ok=True)
    checkpoint = torch.load(cfg.TEST.ckpt_path)
    new_state_dict = OrderedDict()
    state_dict = checkpoint['model_weights']
    for k, v in state_dict.items():
        name = k
        new_state_dict[name] = v
    model.load_state_dict(new_state_dict)
    model = model.to(device)
    model.eval()
    
    val_data = targetDataSet_val(cfg.DATA.data_dir_target,
                                 crop_size=(cfg.DATA.input_size_target, cfg.DATA.input_size_target),
                                 stride=cfg.DATA.target_stride, num=num, mode="test")
    valid_provider = torch.utils.data.DataLoader(val_data, batch_size=1, shuffle=False)
    if cfg.TEST.if_evaluate:
        target_evaluation = Evaluation(cfg.DATA.data_dir_target_label, num=num)
    print('Begin inference...')
    f_valid_txt = open(os.path.join(cfg.TEST.pred_dir, 'scores.txt'), 'a')
    target_stride = cfg.DATA.target_stride
    preds_int = np.zeros((len(val_data)+1, 800, 800), dtype=np.uint8)
    preds = np.zeros((len(val_data)+1, 800, 800), dtype=np.float32)
    current_imgs = []

    t1 = time.time()
    for i_pic, (cimg, _, aimg, _, _, current_img, aux_img, current_filter, aux_filter) in tqdm(enumerate(valid_provider), ncols=80):
        cimg = cimg.to(device)
        aimg = aimg.to(device)
        cfilter = current_filter.to(device)
        afilter = aux_filter.to(device)
        img_cat = torch.cat([cimg, aimg], dim=1)
        filter_cat = torch.cat([cfilter,afilter], dim=1)
        with torch.no_grad():
            cpred, apred = model(img_cat, filter_cat, diff=False)
        preds_int[i_pic] = inference_results(cpred, preds_int[i_pic])
        preds_int[i_pic+target_stride] = inference_results(apred, preds_int[i_pic+target_stride])
        current_imgs.append(current_img)
    t2 = time.time()
    print('Prediction time (s):', (t2 - t1))

    for file in ["predict", "highlight"]:
        file_path = os.path.join(cfg.TEST.pred_dir, file)
        if not os.path.exists(file_path):
            os.mkdir(file_path)
    
    file_names = []
    for i, (pred, current_img) in enumerate(zip(preds_int, current_imgs)):
        file_name = current_img[0].split(os.sep)[-1].split(".tif")[0]
        file_names.append(file_name)
        image = Image.fromarray(pred * 255)
        image.save(f"{cfg.TEST.pred_dir}/predict/{file_name}.png")
        maroon_color = np.array([128, 0, 0], dtype=np.uint8)
        pred_colored = np.tile(pred[:, :, np.newaxis], [1, 1, 3])
        pred_colored = pred_colored * maroon_color
        pred_colored = pred_colored.astype(np.uint8)
        pred_img = Image.fromarray(pred_colored)

        mask = Image.fromarray(pred * 255).convert('L')
        original_image = np.array(Image.open(current_img[0]))
        scaled_data = ((original_image - original_image.min()) / (original_image.max() - original_image.min()) * 255).astype(np.uint8)
        original_image = Image.fromarray(scaled_data).convert("RGBA")
        pred_img = Image.fromarray(pred_colored).convert('RGBA')
        highlighted_image = Image.composite(pred_img, original_image, mask)
        highlighted_image.save(f'{cfg.TEST.pred_dir}/highlight/{file_name}.png')

    if cfg.TEST.if_evaluate:
        print('Measure on mAP, F1, MCC, and IoU...')
        t3 = time.time()
        total_mAP, total_F1, total_MCC, total_IoU = target_evaluation.metric_map(preds_int[:-1])
        
        mean_mAP = sum(total_mAP) / len(total_mAP)
        mean_F1 = sum(total_F1) / len(total_F1)
        mean_MCC = sum(total_MCC) / len(total_MCC)
        mean_IoU = sum(total_IoU) / len(total_IoU)
        
        t4 = time.time()
        print('mAP=%.4f, F1=%.4f, MCC=%.4f, IoU=%.4f' % (mean_mAP, mean_F1, mean_MCC, mean_IoU))
        print('Measurement time (s):', (t4 - t3))
        f_valid_txt.write('mAP=%.4f, F1=%.4f, MCC=%.4f, IoU=%.4f' % (mean_mAP, mean_F1, mean_MCC, mean_IoU))
        f_valid_txt.write('\n')
        
        eval_result = {
            "method" : [args.model]*len(total_F1),
            "file_name": file_names,
            "mAP" : total_mAP,
            "F1" : total_F1,
            "MCC" : total_MCC,
            "IoU" : total_IoU
        }
        df_eval = pd.DataFrame(eval_result)
        df_eval.to_csv(os.path.join(cfg.TEST.pred_dir, f"{args.model}.csv"), index=False)

    print('Done')


if __name__ == '__main__':
    main_from_cli()

