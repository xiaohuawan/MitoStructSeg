import cv2
import os
import numpy as np
import json
import requests
from loguru import logger

class PostProcess:
    def __init__(self, data_url, json_url, save_path) -> None:
        self.data_url = data_url
        self.json_url = json_url
        self.save_path = save_path

    def download_images(self):
        # 下载图像路径JSON文件
        response = requests.get(self.json_url)
        if response.status_code != 200:
            logger.error(f"Failed to download JSON from {self.json_url}")
            return []

        image_paths = response.json()
        
        # 下载图像到本地目录
        if not os.path.exists(self.save_path):
            os.makedirs(self.save_path)
        else:
            # 清空目录中的旧文件
            for f in os.listdir(self.save_path):
                os.remove(os.path.join(self.save_path, f))

        path_list = []

        for url in image_paths:
            filename = os.path.basename(url)
            local_path = os.path.join(self.save_path, filename)
            
            response = requests.get(url)
            if response.status_code == 200:
                with open(local_path, 'wb') as f:
                    f.write(response.content)
                path_list.append(local_path)
                logger.info(f"Downloaded {url} to {local_path}")
            else:
                logger.error(f"Failed to download {url}")

        return path_list

    def del_dot_byOpen(self, kernel_size: int, path_list):
        """
        对分割的结果进行开运算, 去除小点
        """
        save_path = self.save_path
        base_url = "http://localhost:3000/free/postP"
        processed_paths = []

        for path in path_list:
            file_name = os.path.basename(path)
            logger.info(f"Processing image: {path}")

            # 读取图像
            image = cv2.imread(path, cv2.IMREAD_UNCHANGED)
            if image is None:
                logger.error(f"Failed to read image: {path}")
                continue

            # 设置形态学操作的核大小，根据您的小点大小进行调整
            kernel = np.ones((kernel_size, kernel_size), np.uint8)
            logger.info(f"Kernel size: {kernel_size}")

            # 进行开运算，去除小点
            opening = cv2.morphologyEx(image, cv2.MORPH_OPEN, kernel)

            # 保存处理后的图像
            result_path = os.path.join(save_path, file_name)
            cv2.imwrite(result_path, opening)
            logger.info(f"Processed {file_name} and saved to {result_path}")

            # 添加到处理后的路径列表
            processed_url = f"{base_url}/{file_name}"
            processed_paths.append(processed_url)

        # 将处理后的路径写入 JSON 文件
        with open(os.path.join(save_path, 'postP.json'), 'w') as f:
            json.dump(processed_paths, f, indent=4)
            logger.info(f"Processed paths written to {os.path.join(save_path, 'postP.json')}")

    def del_dot_byArea(self, min_area: int, path_list):
        save_path = self.save_path
        base_url = "http://localhost:3000/free/postP"
        processed_paths = []

        for path in path_list:
            file_name = os.path.basename(path)
            logger.info(f"Processing image: {path}")

            # 读取图像
            image = cv2.imread(path, cv2.IMREAD_UNCHANGED)
            if image is None:
                logger.error(f"Failed to read image: {path}")
                continue

            # 寻找所有的连通组件
            num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(image, connectivity=8)
            logger.info(f"Found {num_labels} components")

            # 过滤掉小的连通组件
            for i in range(1, num_labels):  # 跳过背景
                if stats[i, cv2.CC_STAT_AREA] < min_area:
                    image[labels == i] = 0

            # 保存处理后的图像
            result_path = os.path.join(save_path, file_name)
            cv2.imwrite(result_path, image)
            logger.info(f"Processed {file_name} and saved to {result_path}")

            # 添加到处理后的路径列表
            processed_url = f"{base_url}/{file_name}"
            processed_paths.append(processed_url)

        # 将处理后的路径写入 JSON 文件
        with open(os.path.join(save_path, 'postP.json'), 'w') as f:
            json.dump(processed_paths, f, indent=4)
            logger.info(f"Processed paths written to {os.path.join(save_path, 'postP.json')}")

if __name__ == "__main__":
    # 指定路径
    json_url = "http://localhost:3000/free/seg/png_paths.json"
    current_path = os.getcwd()
    save_path = os.path.abspath(os.path.join(current_path, '..', '..', 'vite', 'public', 'postP')) 
    # 设置处理类型和参数
    process_type = "opening"  # "opening" 或 "area"
    param = 8  # 对于 "opening"，参数范围应在[2,8]，步长为1；对于 "area"，参数范围应在[10,100]，步长为10

    # 初始化PostProcess实例
    process = PostProcess(data_url=None, json_url=json_url, save_path=save_path)

    # 下载图像
    path_list = process.download_images()

    if process_type == "opening":
        process.del_dot_byOpen(param, path_list)
    elif process_type == "area":
        process.del_dot_byArea(param, path_list)

