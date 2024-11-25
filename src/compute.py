import os
import cv2
import pandas as pd
import numpy as np
from tqdm import tqdm
from glob import glob
from scipy import ndimage
from loguru import logger
from PIL import Image, ImageDraw, ImageFont
import requests
from io import BytesIO
import zipfile
import shutil
import json
import csv
from urllib.parse import urlparse

class MitoCompute:
    def __init__(self, file_paths) -> None:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(script_dir)
        self.mito_segment_path = os.path.join(script_dir)
        print("**********", self.mito_segment_path)

        # 创建用于保存图像的png目录
        self.save_image_dir = os.path.join(self.mito_segment_path, 'local_outputs')
        if os.path.exists(self.save_image_dir):
            shutil.rmtree(self.save_image_dir)
        os.makedirs(self.save_image_dir)
        # if not os.path.exists(self.save_image_dir):
        #     os.makedirs(self.save_image_dir)

        # 本地目录保存中间文件
        self.local_save_dir = os.path.join(self.mito_segment_path, 'local_outputs')
        # if not os.path.exists(self.local_save_dir):
        #     os.makedirs(self.local_save_dir)

        self.lable_dir = os.path.join(self.mito_segment_path, 'local_outputs')
        # if not os.path.exists(self.lable_dir):
        #     os.makedirs(self.lable_dir)
        target_directory = os.path.join(os.path.abspath('../vite/public/outputs'))
        if os.path.exists(target_directory):
            shutil.rmtree(target_directory)
        os.makedirs(target_directory)

        self.com_source = os.path.join(os.path.abspath('../vite/public/com_source'))
        if os.path.exists(self.com_source):
            shutil.rmtree(self.com_source)
        os.makedirs(self.com_source)


        self.all_imageName = []
        self.imgList = []
        self.images = []
        self.cntLabel = 0
        self.filtered_num_features = 0
        self.labeled_array = []
        self.images_labeled = []
        self.filtered_len_out = []
        self.filtered_len_inside = []
        self.filtered_labeled_array = []
        self.filtered_images_labeled = []
        self.filtered_single = []
        self.img_shape = (800, 800)

        print("local_save_dir", self.local_save_dir)

        # Initialize imgList from the paths provided during initialization
        if isinstance(file_paths, list):
            self.imgList = file_paths
        else:
            print("file_paths should be a list of paths.")
            return

        # Ensure each image can be read, raise an error if not readable
        self.check_image_paths(self.imgList)

    def is_url(self, path):
        """
        检查路径是否为URL
        """
        parsed = urlparse(path)
        return parsed.scheme in ('http', 'https')

    def check_image_paths(self, paths):
        """
        Validates and filters out invalid image paths
        """
        valid_img_formats = ['png', 'jpg', 'jpeg', 'bmp', 'tiff', 'tif']
        validated_paths = []

        for path in paths:
            if os.path.exists(path) and path.split('.')[-1].lower() in valid_img_formats:
                validated_paths.append(path)
            else:
                logger.error(f"Invalid or unreadable image path: {path}")

        self.imgList = validated_paths
        if not self.imgList:
            raise FileNotFoundError("No valid images found in the provided paths.")

        print("Validated image list: ", self.imgList)

    def handle(self):
        """
        处理图像，存储计算结果到本地，然后复制到目标目录
        """
        self.getContours()
        len_out, len_inside, single_len_out, single_len_inside = self.calculate(self.labeled_array, self.images_labeled, self.cntLabel)
        self.filtered(self.cntLabel, len_out, len_inside, single_len_out, single_len_inside)

        # # 存储结果到本地
        # pix_length = 5
        # pix_height = 10
        # self.filtered_len_out = [i * pix_length * pix_height for i in self.filtered_len_out]
        # self.filtered_len_inside = [i * pix_length * pix_height for i in self.filtered_len_inside]
        # total_df = pd.DataFrame({
        #     "label_name": [i + 1 for i in range(self.cntLabel_filtered)],
        #     "total_extral": self.filtered_len_out,
        #     "total_inside": self.filtered_len_inside
        # })

        # 保存每个图像的线粒体的计算结果
        single_cols = ["image_name"]
        for i in range(self.filtered_num_features):
            single_cols += [f"label_{i + 1}_extral", f"label_{i + 1}_insider", f"label_{i+1}_volume", f"label_{i+1}_volume_all"]

        # print(f"数据长度: {len(self.adjust_single)}, 列名数量: {len(single_cols)}")
        # print(f"数据示例: {self.adjust_single[:3]}")  # 打印部分数据内容
        # print(f"列名: {single_cols}")

        print("Data Length:", len(self.adjust_single))
        print("Data Columns:", len(self.adjust_single[0]) if len(self.adjust_single) > 0 else 0)
        print("Columns Length:", len(single_cols))


        single_df = pd.DataFrame(data=self.adjust_single, columns=single_cols)
        single_df.to_csv(os.path.join(self.local_save_dir, "single_info.csv"), index=False)

        # total_df.to_csv(os.path.join(self.local_save_dir, "total_info.csv"), index=False)
        # logger.info("total_df saved locally!")

        # 存储结果
        header = ['label','out_memb_area', 'inside_memb_area', 'volume', 'volume_all']
        pix_length = 5
        pix_height = 10
        with open(os.path.join(self.local_save_dir, "total_info.csv"), 'a', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(header)
            for i in range(0, len(self.filtered_len_inside)):
                writer.writerow([i+1, self.filtered_len_out[i]*pix_length*pix_height, self.filtered_len_inside[i]*pix_length*pix_height,
                                self.filtered_volume[i]*pix_length*pix_length*pix_height, self.filtered_volume_all[i]*pix_length*pix_length*pix_height] )

        # 保存处理后的图像到png目录中，并生成seg.json文件
        image_urls = []
        image_urls2 = []
        for img_index, img_name in enumerate(self.all_imageName):
            filename_without_extension = os.path.splitext(img_name)[0]
            filename = f"{filename_without_extension}.npy"
            filepath = os.path.join(self.lable_dir, filename)
            np.save(filepath, arr=self.filtered_labeled_array[img_index])

            # 保存每张处理后的图像到png目录中
            img_save_path = os.path.join(self.save_image_dir, f"{filename_without_extension}.png")
            self.filtered_images_labeled.append(cv2.imread(img_save_path))
            cv2.imwrite(img_save_path, self.filtered_images_labeled[img_index])
            
            # 生成对应的 URL
            image_url = f"../free/outputs/{filename_without_extension}.png"
            image_urls.append(image_url)
            image_url2 = f"../free/com_source/{filename_without_extension}.png"
            image_urls2.append(image_url2)

        # 保存seg.json
        with open(os.path.join(self.save_image_dir, 'seg.json'), 'w') as f:
            json.dump(image_urls, f, indent=4)

        with open(os.path.join(self.com_source, 'com_source.json'), 'w') as f:
            json.dump(image_urls2, f, indent=4)
        
        logger.info("seg.json saved locally!")

        # 复制文件到目标目录
        self.copy_to_local_directory("single_info.csv")
        self.copy_to_local_directory("total_info.csv")
        for file_name in os.listdir(self.lable_dir):
            self.copy_to_local_directory(file_name)
        # 如果需要复制保存的图像
        for file_name in os.listdir(self.save_image_dir):
            self.copy_to_local_directory(file_name)

        self.source_directory = os.path.join(self.mito_segment_path, 'compute_files')
        for file_name in os.listdir(self.source_directory):
            self.copy_to_source_directory(file_name)

    def copy_to_local_directory(self, file_name):
        """
        复制文件到指定的本地目录
        """
        source_file_path = os.path.join(self.local_save_dir, file_name)
        # target_directory = r"C:\Users\39767\Desktop\app1\berry-free-react-admin-template-main8.23\vite\public\outputs"
        target_directory = os.path.join(os.path.abspath('../vite/public/outputs'))
        target_file_path = os.path.join(target_directory, file_name)
        try:
            shutil.copy(source_file_path, target_file_path)
            logger.info(f"{file_name} copied successfully to {target_directory}!")
        except FileNotFoundError as e:
            logger.error(f"File not found: {e}")
        except PermissionError as e:
            logger.error(f"Permission error: {e}")
        except Exception as e:
            logger.error(f"Exception occurred while copying {file_name}: {str(e)}")

    def copy_to_source_directory(self, file_name):
        source_file_path2 = os.path.join(self.source_directory, file_name)
        # target_directory = r"C:\Users\39767\Desktop\app1\berry-free-react-admin-template-main8.23\vite\public\outputs"
        target_directory2 = os.path.join(os.path.abspath('../vite/public/com_source'))
        target_file_path2 = os.path.join(target_directory2, file_name)

        try:
            shutil.copy(source_file_path2, target_file_path2)
            logger.info(f"{file_name} copied successfully to {target_directory2}!")
        except FileNotFoundError as e:
            logger.error(f"File not found: {e}")
        except PermissionError as e:
            logger.error(f"Permission error: {e}")
        except Exception as e:
            logger.error(f"Exception occurred while copying {file_name}: {str(e)}")


    def getContours(self):
        """
        获取连通域数量，给每张图片打上连通域序号标签
        """
        # 获取图片
        for imgindex, imgpath in enumerate(self.imgList):
            imgname = imgpath.split(os.sep)[-1]
            self.all_imageName.append(imgname)
            img = cv2.imread(imgpath, cv2.IMREAD_GRAYSCALE)
            if img is None:
                logger.error(f"Failed to read image: {imgpath}")
                continue
            self.images.append(img)
        
        if not self.images:
            raise ValueError("No valid images to process")
        
        self.img_shape = self.images[0].shape
        
        # 获取外侧轮廓并填充，寻找连通域
        imgs_fill = []
        for img in self.images:
            filled_image = np.copy(img)
            contours, _ = cv2.findContours(filled_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for contour in contours:
                cv2.drawContours(filled_image, [contour], 0, (255, 255, 255), thickness=cv2.FILLED)
            imgs_fill.append(filled_image)

        stacked_image_fill = np.stack(imgs_fill)
        self.labeled_array, self.cntLabel = ndimage.label(stacked_image_fill)
        logger.info(f"所有连通域数量为{self.cntLabel}")

        # 设置标签对应图片列表
        for index, labeled in enumerate(self.labeled_array):
            img_labeled = np.zeros(self.img_shape, dtype=np.uint8)
            img_labeled[labeled != 0] = 255
            img_labeled[self.images[index] == 0] = 0
            self.images_labeled.append(img_labeled)

    def calculate(self, labeled_array, images_labeled, cntLabel):
        """
        计算膜长度信息
        """
        len_out = np.zeros(cntLabel + 1)
        len_inside = np.zeros(cntLabel + 1)
        self.volume = np.zeros(cntLabel+1)
        self.volume_all = np.zeros(cntLabel+1)



        single_len_out = np.zeros((len(self.imgList), cntLabel + 1))
        single_len_inside = np.zeros((len(self.imgList), cntLabel + 1))
        self.single_v = np.zeros((len(self.imgList), cntLabel+1))
        self.single_v_all = np.zeros((len(self.imgList), cntLabel+1))

        with tqdm(total=self.labeled_array.shape[0], desc="calculating", unit="images") as pbar:
            for img_index, labeled in enumerate(labeled_array):
                labels = np.unique(labeled[labeled != 0])
                np.sort(labels)
                for label in labels:
                    if label >= len(len_out):
                        logger.error(f"Label {label} exceeds the size of len_out array with size {len(len_out)}.")
                        continue

                    label_img = np.zeros(self.img_shape, dtype=np.uint8)
                    label_img_fill = np.zeros(self.img_shape, dtype=np.uint8)
                    label_img[labeled == label] = 255
                    label_img_fill[labeled == label] = 255
                    label_img[images_labeled[img_index] == 0] = 0
                    label_img = label_img.astype(np.uint8)
                    img_all_contours, _ = cv2.findContours(label_img, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
                    img_out_contours, _ = cv2.findContours(label_img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                    # 长度计算
                    len_img_out = cv2.arcLength(np.concatenate(img_out_contours), True)
                    len_img_allcontours = cv2.arcLength(np.concatenate(img_all_contours), True)
                    len_img_inside = len_img_allcontours - len_img_out
                    single_len_out[img_index][label] = len_img_out
                    single_len_inside[img_index][label] = len_img_inside

                    self.single_v[img_index][label] = label_img[labeled == label].sum()/255
                    self.single_v_all[img_index][label] = label_img_fill[labeled == label].sum()/255

                    # 加和
                    len_out[label] += len_img_out
                    len_inside[label] += len_img_inside
                    self.volume[label] += label_img[labeled == label].sum()/255
                    self.volume_all[label] += label_img_fill[labeled == label].sum()/255
                pbar.update()
        return len_out, len_inside, single_len_out, single_len_inside

    def filtered(self, cntLabel, len_out, len_inside, single_len_out, single_len_inside):
        """
        去除内膜为0的部分，并在图像上标注每个线粒体的标签并绘制外膜颜色
        """
        filtered_labels = []
        self.filtered_volume = []
        self.filtered_volume_all = []
        for i in range(1, cntLabel + 1):
            if len_inside[i] != 0 and len_out[i] != 0:
                filtered_labels.append(i)
                self.filtered_len_out.append(len_out[i])
                self.filtered_len_inside.append(len_inside[i])
                self.filtered_volume.append(self.volume[i])
                self.filtered_volume_all.append(self.volume_all[i])
        self.filtered_num_features = len(filtered_labels)
        logger.info(f"剔除内膜为0的连通域后，连通域数量为{self.filtered_num_features}")

        # 参考映射 filter_refer[a]=b 表示原始标签为a的现在标签值是b
        filter_refer = np.zeros(cntLabel + 1)
        for index, label in enumerate(filtered_labels):
            filter_refer[label] = int(index) + 1
        filter_refer = filter_refer.astype(int)

        # 修改新的标签值
        self.filtered_labeled_array = np.copy(self.labeled_array)
        with tqdm(total=self.filtered_labeled_array.shape[0], desc="Processing", unit="images") as pbar:
            for index, img in enumerate(self.filtered_labeled_array):
                img[~np.isin(img, filtered_labels)] = 0
                img[:] = np.vectorize(lambda x: filter_refer[x])(img)
                pbar.update()

        # 标签图片相对应，并标注标签
        for index, labeled in enumerate(self.filtered_labeled_array):
            # 创建彩色图像用于绘制轮廓和标注
            img_labeled_color = cv2.cvtColor(self.images[index], cv2.COLOR_GRAY2BGR)

            # 生成每个线粒体的随机颜色
            np.random.seed(42)  # 固定随机种子，确保每次生成的颜色相同
            colors = {label: np.random.randint(0, 255, 3).tolist() for label in np.unique(labeled) if label != 0}

            # 获取每个线粒体的中心位置，并标注标签
            unique_labels = np.unique(labeled)
            for label in unique_labels:
                if label == 0:
                    continue  # 跳过背景标签

                # 创建mask并计算中心
                mask = np.zeros_like(labeled, dtype=np.uint8)
                mask[labeled == label] = 255

                # 找到外膜轮廓并绘制颜色
                contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                cv2.drawContours(img_labeled_color, contours, -1, colors[label], 2)

                moments = cv2.moments(mask)
                if moments["m00"] != 0:
                    cX = int(moments["m10"] / moments["m00"])
                    cY = int(moments["m01"] / moments["m00"])

                    # 在彩色图像上绘制红色标签
                    label_text = f"{label}"
                    cv2.putText(img_labeled_color, label_text, (cX, cY), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

            # 保存每张带编号的图像, 使用原始文件名
            filename_without_extension = os.path.splitext(self.all_imageName[index])[0]
            img_save_path = os.path.join(self.save_image_dir, f"{filename_without_extension}.png")
            self.filtered_images_labeled.append(img_labeled_color)
            cv2.imwrite(img_save_path, img_labeled_color)

        # 处理单个线粒体计算结果
        filtered_single_len_out = single_len_out[:, filtered_labels]
        filtered_single_len_inside = single_len_inside[:, filtered_labels]
        filtered_single_v = self.single_v[:, filtered_labels]
        filtered_single_v_all = self.single_v_all[:, filtered_labels]

        self.adjust_single = []
        for i, iname in enumerate(self.all_imageName):
            row = [iname]
            for j in range(self.filtered_num_features):
                row.append(filtered_single_len_out[i][j])
                row.append(filtered_single_len_inside[i][j])
                row.append(filtered_single_v[i][j])
                row.append(filtered_single_v_all[i][j])
            self.adjust_single.append(row)

if __name__ == "__main__":
    # This should be a list of file paths or URLs for the images to be processed
    file_path = ["http://localhost:3000/free/seg/png/data000.png"]  # Replace with actual file paths or URLs
    mito_compute = MitoCompute(file_path = file_path)
    mito_compute.handle()



