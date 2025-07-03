import cv2
import os
import sys
import math
import torch
import random
from torch.utils import data
import numpy as np
import os.path as osp
from PIL import Image
from random import randint
from utils.data_utils import normalization2, cropping
from dataset.data_aug import aug_img, aug_img_lab
from utils.metric_utils import dice_coeff
from glob import glob
from loguru import logger
from sklearn.metrics import average_precision_score
from sklearn.metrics import f1_score
from sklearn.metrics import matthews_corrcoef
from skimage import io, segmentation, morphology, exposure

from utils.data_utils import generate_texture



class targetDataSet(data.Dataset):
    def __init__(self, root_img, crop_size=(800, 800), stride=1, num=200, s=(50,150)):
        self.root_img = sorted(glob(f"{root_img}/data_all/*.tif"))[:num]
        if not os.path.join(root_img, "data_all_texture") or len(sorted(glob(f"{root_img}/data_all_texture/*.png"))) < 200:
            generate_texture(os.path.join(root_img, "data_all"), s=s)
            
        self.root_texture = sorted(glob(f"{root_img}/data_all_texture/*.png"))[:num]
        
        # if num != -1:
        #     assert len(self.root_texture) == num
        
        self.crop_size = crop_size
        self.stride = stride
        self.length = len(self.root_img)


    def __len__(self):
        return 400000

    def __getitem__(self, index):
        k = random.randint(0, len(self.root_img)-2-self.stride)
        current_img = np.asarray(Image.open(self.root_img[k]), dtype=np.uint8)
        aux_img = np.asarray(Image.open(self.root_img[k+self.stride]), dtype=np.uint8)
        current_texture = np.asarray(Image.open(self.root_texture[k]), dtype=np.uint8)
        aux_texture = np.asarray(Image.open(self.root_texture[k+self.stride]), dtype=np.uint8)
        
        current_img = self.data_process(current_img)
        aux_img = self.data_process(aux_img)

        current_img = normalization2(current_img.astype(np.float32), max=1, min=0)
        aux_img = normalization2(aux_img.astype(np.float32), max=1, min=0)
        current_texture = normalization2(current_texture.astype(np.float32), max=1, min=0)
        aux_texture = normalization2(aux_texture.astype(np.float32), max=1, min=0)

        current_img = aug_img(current_img, self.crop_size)
        current_texture = aug_img(current_texture, self.crop_size)
        aux_img = aug_img(aux_img, self.crop_size)
        aux_texture = aug_img(aux_texture, self.crop_size)

        size = current_img.shape
        y_loc = randint(0, size[0] - self.crop_size[0])
        x_loc = randint(0, size[1] - self.crop_size[1])
        current_img = cropping(current_img, self.crop_size[0], self.crop_size[1], y_loc, x_loc)
        aux_img = cropping(aux_img, self.crop_size[0], self.crop_size[1], y_loc, x_loc)

        current_img = np.expand_dims(current_img, axis=0) 
        current_img = torch.from_numpy(current_img.astype(np.float32)).float()
        aux_img = np.expand_dims(aux_img, axis=0)  
        aux_img = torch.from_numpy(aux_img.astype(np.float32)).float()

        current_texture = np.expand_dims(current_texture, axis=0)  
        current_texture = torch.from_numpy(current_texture.astype(np.float32)).float()
        aux_texture = np.expand_dims(aux_texture, axis=0)  
        aux_texture = torch.from_numpy(aux_texture.astype(np.float32)).float()

        data_len = len(current_img)
        return current_img, [0]*data_len, aux_img, [0]*data_len, [0]*data_len,current_texture,aux_texture
    
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


class targetDataSet_val(data.Dataset):
    def __init__(self, root_img, crop_size=[800, 800], stride=1, num=40, mode="train", reverse=False):

        self.root_img = sorted(glob(f"{root_img}/data_all/*.tif"))[:num]
        if not os.path.exists(os.path.join(root_img, "data_all_texture")) or len(sorted(glob(f"{root_img}/data_all_texture/*.png"))) == 0:
            generate_texture(os.path.join(root_img, "data_all"))
            
        self.root_texture = sorted(glob(f"{root_img}/data_all_texture/*.png"))[:num]
        
        if reverse:
            self.root_img = [self.root_img[0]] + self.root_img
            self.root_texture = [self.root_texture[0]] + self.root_texture
        
   
        self.root_img.append(self.root_img[-1])
        self.root_texture.append(self.root_texture[-1])
        self.iters = len(self.root_img)
        self.stride = stride
        self.mode = mode

    def __len__(self):
        return self.iters-1

    def __getitem__(self, index):

        datafiles1 = self.root_img[index]
        datafiles2 = self.root_img[index+self.stride]

        current_img = Image.open(datafiles1)
        current_img = np.asarray(current_img, np.float32)
        current_img = self.data_process(current_img)
        current_img = normalization2(current_img, max=1, min=0)

        current_texture = np.asarray(Image.open(self.root_texture[index]), dtype=np.uint8)
        aux_texture = np.asarray(Image.open(self.root_texture[index+self.stride]), dtype=np.uint8)
        current_texture = normalization2(current_texture.astype(np.float32), max=1, min=0)
        aux_texture = normalization2(aux_texture.astype(np.float32), max=1, min=0)
        
        aux_img = Image.open(datafiles2)
        aux_img = np.asarray(aux_img, np.float32)
        aux_img = self.data_process(aux_img)
        aux_img = normalization2(aux_img, max=1, min=0)
        

        current_img = np.expand_dims(current_img, axis=0)
        current_img = torch.from_numpy(current_img.astype(np.float32)).float()
        aux_img = np.expand_dims(aux_img, axis=0)
        aux_img = torch.from_numpy(aux_img.astype(np.float32)).float()

        current_texture = np.expand_dims(current_texture, axis=0)  # add additional dimension
        current_texture = torch.from_numpy(current_texture.astype(np.float32)).float()
        aux_texture = np.expand_dims(aux_texture, axis=0)  # add additional dimension
        aux_texture = torch.from_numpy(aux_texture.astype(np.float32)).float()

        data_len = len(current_img)
        if self.mode == "train":
            return current_img, [0]*data_len, aux_img, [0]*data_len, [0]*data_len,current_texture,aux_texture
        else:
            return current_img, [0]*data_len, aux_img, [0]*data_len, [0]*data_len, datafiles1, datafiles2,current_texture,aux_texture

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
    
    


class Evaluation(object):
    def __init__(self, data_dir, num=40):
        # self.root_image = sorted(glob(f"{data_dir}/axis_22_label/*.png"))[:20]
        self.root_image = sorted(glob(f"{data_dir}/*"))[:num]
        if len(self.root_image) == 0:
            self.root_image = sorted(glob(f"{data_dir}/*.png"))[:num]
        self.labels = []
        for image_path in self.root_image:
            lb = np.asarray(Image.open(image_path).convert('L'))
            lb = np.where(lb==0, 0, 255)
            lb = (lb / 255).astype(np.uint8)
            self.labels.append(lb)
        self.labels = np.asarray(self.labels, dtype=np.uint8)
        self.length = len(self.root_image)

    def metric_dice(self, preds):
        assert preds.shape[0] == self.length, "Prediction ERROR!"
        dices = []
        jacs = []
        for k in range(self.length):
            dice, jac = dice_coeff(preds[k], self.labels[k])
            dices.append(dice)
            jacs.append(jac)
        dice_avg = sum(dices) / len(dices)
        jac_avg = sum(jacs) / len(jacs)
        return dice_avg, jac_avg
    
    def metric_map(self, preds):
        assert preds.shape[0] == self.length, "Prediction ERROR!"
        total_mAP = []
        total_F1 = []
        total_MCC = []
        total_IoU = []
        for i in range(self.length):
            pred_temp = preds[i]
            gt_temp = self.labels[i]
            
            serial_segs = gt_temp.reshape(-1)
            mAP = average_precision_score(serial_segs, pred_temp.reshape(-1))

            bin_segs = pred_temp
            bin_segs[bin_segs>=0.5] = 1
            bin_segs[bin_segs<0.5] = 0
            serial_bin_segs = bin_segs.reshape(-1)

            intersection = np.logical_and(serial_segs==1, serial_bin_segs==1)
            union = np.logical_or(serial_segs==1, serial_bin_segs==1)
            IoU = np.sum(intersection) / np.sum(union)

            F1 = f1_score(serial_segs, serial_bin_segs)
            MCC = matthews_corrcoef(serial_segs, serial_bin_segs)
            
            total_mAP.append(mAP)
            total_F1.append(F1)
            total_MCC.append(MCC)
            total_IoU.append(IoU)

        return total_mAP,total_F1,total_MCC,total_IoU
    

    def get_gt(self):
        return self.labels
