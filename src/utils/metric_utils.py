import torch
import numpy as np
from PIL import Image
from scipy import ndimage
import torch.nn as nn
import torch.nn.functional as F

def dice_coeff(pred, target):
    ims = [pred, target]
    np_ims = []
    for item in ims:
        if 'str' in str(type(item)):
            item = np.array(Image.open(item))
        elif 'PIL' in str(type(item)):
            item = np.array(item)
        elif 'torch' in str(type(item)):
            item = item.numpy()
        np_ims.append(item)

    pred = np_ims[0]
    target = np_ims[1]

    smooth = 0.000001

    m1 = pred.flatten() 
    m2 = target.flatten() 
    intersection = (m1 * m2).sum()
    intersection = np.float64(intersection)

    bing = (np.uint8(m1) | np.uint8(m2)).sum()
    bing = bing.astype('float')
    jac = (intersection + smooth) / (bing + smooth)

    dice = (2. * intersection + smooth) / (m1.sum() + m2.sum() + smooth)

    return dice, jac