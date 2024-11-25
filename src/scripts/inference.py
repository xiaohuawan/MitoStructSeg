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
import shutil
import json

from model.AMM_Seg import AMM_Seg
from dataset.target_dataset import targetDataSet_val, Evaluation
from utils.train_utils import inference_results
from utils import core




import warnings
warnings.filterwarnings("ignore")
class Segment(core.MiTo):
    def __init__(self, path_data, path_weights):
        super().__init__()
        self.path_data = path_data
        self.path_weights = path_weights
        self.path_weights = self._find_latest_ckpt() 
        print(f"Initialized Segment with path_data: {self.path_data} and path_weights: {self.path_weights}")
        self.cfg_file_path = os.path.join(os.path.dirname(__file__), 'config', 'patient70.yaml')

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

        if not isinstance(self.path_weights, str):
            raise ValueError("path_weights should be a string")

        with open(self.cfg_file_path, 'rb') as f:
            cfg = AttrDict(yaml.load(f, Loader=yaml.FullLoader))

        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        model = AMM_Seg(n_channels=cfg.MODEL.input_nc, n_classes=cfg.MODEL.output_nc).to(device)
        checkpoint = torch.load(self.path_weights, map_location=device)

        new_state_dict = OrderedDict()
        state_dict = checkpoint['model_weights']
        for k, v in state_dict.items():
            name = k
            new_state_dict[name] = v
        model.load_state_dict(new_state_dict)
        model.eval()

        image_files = [f for f in os.listdir(self.path_data) if f.endswith(('.png', '.tif'))]
        if not image_files:
            raise ValueError(f"No image files found in the directory: {self.path_data}")

        val_data = targetDataSet_val(cfg.DATA.data_dir_target,
                                            crop_size=(cfg.DATA.input_size_target, cfg.DATA.input_size_target),
                                            stride=cfg.DATA.target_stride, num=num, mode="test")

        valid_provider = torch.utils.data.DataLoader(val_data, batch_size=1, shuffle=False)

        self.out_path = os.path.join(os.path.dirname(__file__), '..', 'inference')
        self.out_path = os.path.abspath(self.out_path)
        os.makedirs(self.out_path, exist_ok=True)

        preds_int = np.zeros((len(val_data) + 1, 800, 800), dtype=np.uint8)
        preds = np.zeros((len(val_data) + 1, 800, 800), dtype=np.float32)
        current_imgs = []
        aux_imgs = []
        t1 = time.time()
        for i_pic, (cimg, _, aimg, _, _, current_img, aux_img) in enumerate(valid_provider):
            print(f"pic_idx={i_pic}")
            cimg = cimg.to(device)
            aimg = aimg.to(device)
            img_cat = torch.cat([cimg, aimg], dim=1)
            with torch.no_grad():
                cpred, apred = model(img_cat, diff=False)
            preds_int[i_pic] = inference_results(cpred, preds_int[i_pic])
            preds_int[i_pic + cfg.DATA.target_stride] = inference_results(apred, preds_int[i_pic + cfg.DATA.target_stride])
            current_imgs.append(current_img)
            aux_imgs.append(aux_img)
        t2 = time.time()
        print('Prediction time (s):', (t2 - t1))

        highlight_paths = []

        current_path = os.getcwd()
        self.json_dir = os.path.join(current_path, '..', '..', 'vite', 'public', 'seg')
        self.json_dir = os.path.abspath(self.json_dir)
        
        if os.path.exists(self.json_dir):
            shutil.rmtree(self.json_dir)
        os.makedirs(self.json_dir, exist_ok=True)

        seg_source_path = os.path.abspath(os.path.join(current_path, '..', '..', 'vite', 'public', 'seg_source'))
        if os.path.exists(seg_source_path):
            shutil.rmtree(seg_source_path)
        os.makedirs(seg_source_path, exist_ok=True)

        original_image_paths = []  
        png_paths = []

        for i, (pred, current_img) in enumerate(zip(preds_int, current_imgs)):
            file_name = os.path.basename(current_img[0]).split(".tif")[0]

            original_image_path = os.path.join(seg_source_path, f"{file_name}.png")
            original_image = Image.open(current_img[0]).convert('RGBA')
            original_image.save(original_image_path)

            modified_original_path = f"/free/seg_source/{file_name}.png"
            original_image_paths.append(modified_original_path)

            tif_path = os.path.join(self.json_dir, "tif")
            os.makedirs(tif_path, exist_ok=True)
            tif_path = os.path.join(tif_path, f"{file_name}.tif")
            tif.imsave(tif_path, pred)

            png_path = os.path.join(self.json_dir, "png")
            os.makedirs(png_path, exist_ok=True)
            image = Image.fromarray(pred * 255)
            image.save(os.path.join(png_path, f"{file_name}.png"))

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
            
            modified_highlight_path = f"/free/seg/highlight/{highlighted_file_name}"
            highlight_paths.append(modified_highlight_path)

            png_path = f"http://localhost:3000/free/seg/png/{highlighted_file_name}"
            png_paths.append(png_path)

        source_file_path = os.path.join(seg_source_path, 'source_paths.json')
        with open(source_file_path, 'w') as source_file:
            json.dump(original_image_paths, source_file)

        json_file_path = os.path.join(self.json_dir, 'highlight_paths.json')
        with open(json_file_path, 'w') as json_file:
            json.dump(highlight_paths, json_file)

        png_file_path = os.path.join(self.json_dir, 'png_paths.json')
        with open(png_file_path, 'w') as png_file:
            json.dump(png_paths, png_file)

        return highlight_paths  

