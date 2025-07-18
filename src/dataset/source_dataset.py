import os
import torch
import random
import numpy as np

from PIL import Image
from loguru import logger
from glob import glob
from random import randint
from torch.utils import data
from collections import defaultdict
from skimage import io, segmentation, morphology, exposure

from utils.data_utils import normalization2, cropping, generate_texture
from dataset.data_aug import aug_img_lab,aug_img

def get_source_data(dir, s, task=None):
    source_data = defaultdict(dict)
    
    source_domain_path = os.path.join(dir, "Source_domain")
    
    if os.path.exists(source_domain_path):
        data_blocks = sorted([d for d in os.listdir(source_domain_path) 
                             if d.startswith('data_block') and os.path.isdir(os.path.join(source_domain_path, d))])
        
        label_blocks = sorted([d for d in os.listdir(source_domain_path) 
                              if d.startswith('label_block') and os.path.isdir(os.path.join(source_domain_path, d))])
        
        for i, (data_block, label_block) in enumerate(zip(data_blocks, label_blocks)):
            data_path = os.path.join(source_domain_path, data_block)
            label_path = os.path.join(source_domain_path, label_block)
            
            data = sorted(glob(f"{data_path}/*.tif"))
            if task == None:
                label = sorted(glob(f"{label_path}/*.tif"))
            else:
                label = sorted(glob(f"{label_path}_{task}/*"))
            
            texture_path = data_path + "_texture"
            if not os.path.exists(texture_path) or len(glob(os.path.join(texture_path, "*"))) == 0:
                generate_texture(data_path, s=s)
                
            data_texture = sorted(glob(f"{texture_path}/*.png"))
            
            if len(data) > 0 and len(label) > 0:
                min_len = min(len(data), len(label))
                data = data[:min_len]
                label = label[:min_len]
                
                if len(data_texture) < min_len:
                    generate_texture(data_path, s=s)
                    data_texture = sorted(glob(f"{texture_path}/*.png"))[:min_len]
                else:
                    data_texture = data_texture[:min_len]
                
                block_name = f"block_{i+1}"
                source_data[block_name] = {
                    "data": data,
                    "label": label,
                    "data_texture": data_texture
                }
        
    return source_data



class sourceDataSet(data.Dataset):
    def __init__(self, source_data, crop_size=(800, 800), stride=1, train_num=100, aug=True):
        self.source_data = source_data
        self.crop_size = crop_size
        self.stride = stride
        self.train_num = train_num
        self.aug = aug

    def __len__(self):
        return 400000
    
    def __getitem__(self, index):
        block_names = list(self.source_data.keys())
        
        selected_block = random.choice(block_names)
        
        root_img = self.source_data[selected_block]["data"][:self.train_num]
        root_label = self.source_data[selected_block]["label"][:self.train_num]
        root_texture = self.source_data[selected_block]["data_texture"][:self.train_num]

        k = random.randint(0, len(root_img)-2-self.stride)
        current_img = np.asarray(Image.open(root_img[k]), dtype=np.uint8)
        aux_img = np.asarray(Image.open(root_img[k + self.stride]), dtype=np.uint8)

        current_label = np.asarray(Image.open(root_label[k]), dtype=np.uint8)
        aux_label = np.asarray(Image.open(root_label[k + self.stride]), dtype=np.uint8)
        
        current_texture = np.asarray(Image.open(root_texture[k]), dtype=np.uint8)
        aux_texture = np.asarray(Image.open(root_texture[k + self.stride]), dtype=np.uint8)
        
        if self.aug:
            current_img = self.data_process(current_img)
            aux_img = self.data_process(aux_img)
            current_label = self.label_process(current_label)
            aux_label = self.data_process(aux_label)
        
        

        current_img = normalization2(current_img.astype(np.float32), max=1, min=0)
        aux_img = normalization2(aux_img.astype(np.float32), max=1, min=0)
        current_texture = normalization2(current_texture.astype(np.float32), max=1, min=0)
        aux_texture = normalization2(aux_texture.astype(np.float32), max=1, min=0)
        

        current_img, current_label = aug_img_lab(current_img, current_label, self.crop_size)
        current_texture, current_label = aug_img_lab(current_texture, current_label, self.crop_size)
        aux_img, aux_label = aug_img_lab(aux_img, aux_label, self.crop_size)
        aux_texture, aux_label = aug_img_lab(aux_texture, aux_label, self.crop_size)

        current_img = np.expand_dims(current_img, axis=0)  
        current_img = torch.from_numpy(current_img.astype(np.float32)).float()
        aux_img = np.expand_dims(aux_img, axis=0)  
        aux_img = torch.from_numpy(aux_img.astype(np.float32)).float()
        current_texture = np.expand_dims(current_texture, axis=0) 
        current_texture = torch.from_numpy(current_texture.astype(np.float32)).float()
        aux_texture = np.expand_dims(aux_texture, axis=0) 
        aux_texture = torch.from_numpy(aux_texture.astype(np.float32)).float()

        current_label = (current_label).astype(np.bool_)
        aux_label = (aux_label).astype(np.bool_)
        diff = np.bitwise_xor(current_label, aux_label)
        current_label = torch.from_numpy(current_label.astype(np.float32)).long()
        aux_label = torch.from_numpy(aux_label.astype(np.float32)).long()
        diff = torch.from_numpy(diff.astype(np.float32)).long()

        return current_img, current_label, aux_img, aux_label, diff, current_texture, aux_texture

    def data_process(self, img_data):
        """
        augment data
        """
        
        if len(img_data.shape) == 2:
            img_data = np.repeat(np.expand_dims(img_data, axis=-1), 3, axis=-1)
        elif len(img_data.shape) == 3 and img_data.shape[-1] > 3:
            img_data = img_data[:,:, :3]
        else:
            pass
        
        pre_img_data = np.zeros(img_data.shape, dtype=np.uint8)
        for i in range(3):
            img_channel_i = img_data[:,:,i]
            if len(img_channel_i[np.nonzero(img_channel_i)])>0:
                pre_img_data[:,:,i] = self.normalize_channel(img_channel_i, lower=1, upper=99)
        return self.rgb_to_grayscale(pre_img_data)
        
    def normalize_channel(self, img, lower=1, upper=99):
        non_zero_vals = img[np.nonzero(img)]
        percentiles = np.percentile(non_zero_vals, [lower, upper])
        if percentiles[1] - percentiles[0] > 0.001:
            img_norm = exposure.rescale_intensity(img, in_range=(percentiles[0], percentiles[1]), out_range='uint8')
        else:
            img_norm = img
        return img_norm.astype(np.uint8)
    
    def rgb_to_grayscale(self, image):
        grayscale_image = 0.2989 * image[:, :, 0] + 0.5870 * image[:, :, 1] + 0.1140 * image[:, :, 2]
        return grayscale_image.astype(np.uint8)  
    
    def label_process(self, label_data):
        # create interior-edge map
        boundary = segmentation.find_boundaries(label_data, mode='inner')
        boundary = morphology.binary_dilation(boundary, morphology.disk(1))

        interior_temp = np.logical_and(~boundary, label_data > 0)
        # interior_temp[boundary] = 0
        interior_temp = morphology.remove_small_objects(interior_temp, min_size=16)
        interior = np.zeros_like(label_data, dtype=np.uint8)
        interior[interior_temp] = 255
        interior[boundary] = 255
        return interior
    
    
