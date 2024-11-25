import albumentations as albu
import numpy as np
import cv2
from albumentations import *


def convert_image_dtype(image, **kwargs):
    return image.astype('uint8')

def strong_aug(p=.5, cropsize=[512, 512]):
    return Compose([
        Flip(), 
        Transpose(),
        Rotate(), 
        OneOf(  
            [
            Resize(p=0.2, height=cropsize[0], width=cropsize[1]),
           
            RandomSizedCrop(((400, 800)), p=0.2, height=cropsize[0], width=cropsize[1], interpolation=2),
            ], 
            p=0.2
            ),
        # RandomBrightnessContrast(),
        # MotionBlur(p=0.2),
        # ElasticTransform(p=0.3),
        # GaussNoise(p=0.2),
        # RandomGamma(),
        # Lambda(image=convert_image_dtype),
        # CLAHE(p=0.2),
    ], p=p)


def create_transformer(transformations, images):
    target = {}
    for i, image in enumerate(images[1:]):
        target['image' + str(i)] = 'image'
    return albu.Compose(transformations, p=0.5, additional_targets=target)(image=images[0],
                                                                           mask=images[1]
                                                                           )


def aug_img_lab(img, lab, cropsize, p=0.5):
    images = [img, lab]
    transformed = create_transformer(strong_aug(p=p, cropsize=cropsize), images)
    return transformed['image'], transformed['mask']

def strong_aug_img(p=.5):
    return albu.Compose([
        RandomBrightnessContrast(),
        MotionBlur(p=0.2),
        ElasticTransform(p=0.3),
        Sharpen(alpha=(0.05, 0.65), p=0.3),
    ], p=p)


def aug_img(img, p=0.5):
    transformed_img = strong_aug_img(p=0.5)(image=img)
    return transformed_img["image"]
