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

from utils.data_utils import normalization2, cropping, generate_texture
from dataset.data_aug import aug_img_lab,aug_img




def get_source_data(dir):

    data_path = ["label_100_20230912", "label_100_20231117"]
    source_data = defaultdict(dict)
    for path in data_path:
        path = os.path.join(dir, path)
        data_name = path.split("/")[-1]
        data = sorted(glob(f"{path}/data/*.tif"))
        label = sorted(glob(f"{path}/label/*.tif"))
        
        if not os.path.exists(os.path.join(path, "data_texture")) or len(glob(os.path.join(path, "data_texture", "*"))) == 0:
            generate_texture(os.path.join(path, "data"))
            
        data_texture = sorted(glob(f"{path}/data_texture/*.png"))
        source_data[data_name] = {
            "data" : data,
            "label": label,
            "data_texture" : data_texture
        }
        
    return source_data



class sourceDataSet(data.Dataset):
    def __init__(self, source_data, crop_size=(800, 800), stride=1, train_num=100):
        self.source_data = source_data
        self.crop_size = crop_size
        self.stride = stride
        self.train_num = train_num

    def __len__(self):
        return 400000
    
    def __getitem__(self, index):
        rand_num = random.random()
        if  rand_num > 0.6:
            root_img = self.source_data["label_100_20230912"]["data"][:self.train_num]
            root_label = self.source_data["label_100_20230912"]["label"][:self.train_num]
            root_texture = self.source_data["label_100_20230912"]["data_texture"][:self.train_num]
        else:
            root_img = self.source_data["label_100_20231117"]["data"][:self.train_num]
            root_label = self.source_data["label_100_20231117"]["label"][:self.train_num]
            root_texture = self.source_data["label_100_20231117"]["data_texture"][:self.train_num]

        k = random.randint(0, len(root_img)-2-self.stride)
        current_img = np.asarray(Image.open(root_img[k]), dtype=np.uint8)
        aux_img = np.asarray(Image.open(root_img[k + self.stride]), dtype=np.uint8)

        current_label = np.asarray(Image.open(root_label[k]), dtype=np.uint8)
        aux_label = np.asarray(Image.open(root_label[k + self.stride]), dtype=np.uint8)
        
        current_texture = np.asarray(Image.open(root_texture[k]), dtype=np.uint8)
        aux_texture = np.asarray(Image.open(root_texture[k + self.stride]), dtype=np.uint8)

        current_img = normalization2(current_img.astype(np.float32), max=1, min=0)
        aux_img = normalization2(aux_img.astype(np.float32), max=1, min=0)
        current_texture = normalization2(current_texture.astype(np.float32), max=1, min=0)
        aux_texture = normalization2(aux_texture.astype(np.float32), max=1, min=0)
        

        current_img, current_label = aug_img_lab(current_img, current_label, self.crop_size)
        # current_texture, current_label = aug_img_lab(current_texture, current_label, self.crop_size)
        aux_img, aux_label = aug_img_lab(aux_img, aux_label, self.crop_size)
        # aux_texture, aux_label = aug_img_lab(aux_texture, aux_label, self.crop_size)

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

