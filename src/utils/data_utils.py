import os
import numpy as np
import cv2

from glob import glob

def normalization1(image, mean, std):
    """ Normalization using mean and std
    Args :
        image : numpy array of image
        mean :
    Return :
        image : numpy array of image with values turned into standard scores
    """

    image = image / 255  # values will lie between 0 and 1.
    image = (image - mean) / std

    return image


def normalization2(image, max, min):
    """Normalization to range of [min, max]
    Args :
        image : numpy array of image
        mean :
    Return :
        image : numpy array of image with values turned into standard scores
    """
    image_new = (image - np.min(image))*(max - min)/(np.max(image)-np.min(image)) + min
    return image_new


def cropping(image, y, x, dim1, dim2):
    """crop the image and pad it to in_size
    Args :
        images : numpy array of images
        crop_size(int) : size of cropped image
        dim1(int) : vertical location of crop
        dim2(int) : horizontal location of crop
    Return :
        cropped_img: numpy array of cropped image
    """

    cropped_img = image[dim1:dim1+y, dim2:dim2+x]
    return cropped_img


def generate_texture(path, ksize=7, s=(50,150), num=300):

    image_paths = sorted(glob(os.path.join(path, "*")))[:num]
    output_dir = path + "_texture"

    os.makedirs(output_dir, exist_ok=True)
    
    for image_path in image_paths:
        file_name = os.path.basename(image_path).replace("tif","png")
        image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

        blurred = cv2.GaussianBlur(image, (ksize, ksize), 0)
        texture = cv2.Canny(blurred, s[0], s[1])
        
        output_path = os.path.join(output_dir, file_name)
        texture_image = texture / np.max(texture) * 255
        cv2.imwrite(output_path, texture_image)