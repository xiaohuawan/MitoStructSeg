import cv2
import os
import numpy as np
import json
import requests
from loguru import logger
from datetime import datetime

class PostProcess:
    def __init__(self, data_url, json_url, save_path) -> None:
        self.data_url = data_url
        self.json_url = json_url
        self.save_path = save_path

    def download_images(self):
       
        response = requests.get(self.json_url)
        if response.status_code != 200:
            logger.error(f"Failed to download JSON from {self.json_url}")
            return []

        image_paths = response.json()
        
       
        if not os.path.exists(self.save_path):
            os.makedirs(self.save_path)
        else:
            
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
 
        save_path = self.save_path
        base_url = "http://localhost:3000/free/postP"
        # base_url = "http://localhost:3000/free/seg/postP"
        processed_paths = []
        processed_paths2 = []
        processed_paths3 = []

        for path in path_list:
            file_name = os.path.basename(path)
            logger.info(f"Processing image: {path}")

            
            image = cv2.imread(path, cv2.IMREAD_UNCHANGED)
            if image is None:
                logger.error(f"Failed to read image: {path}")
                continue

           
            kernel = np.ones((kernel_size, kernel_size), np.uint8)
            logger.info(f"Kernel size: {kernel_size}")

            
            opening = cv2.morphologyEx(image, cv2.MORPH_OPEN, kernel)

          
            result_path = os.path.join(save_path, file_name)
            cv2.imwrite(result_path, opening)
            logger.info(f"Processed {file_name} and saved to {result_path}")
            
            current_time = datetime.now().strftime("%Y%m%d_%H%M%S")
            current_path = os.getcwd()

            
            save_path2 = os.path.abspath(os.path.join(current_path, '..', 'vite', 'public', f"postP_{current_time}")) 
            if not os.path.exists(save_path2):
                os.makedirs(save_path2)

            result_path2 = os.path.join(save_path2, file_name)
            cv2.imwrite(result_path2, image)
            logger.info(f"Processed {file_name} and saved to {result_path2}")

            # save_path3 = os.path.abspath(os.path.join(current_path, '..', 'vite', 'public', 'seg', 'postP')) 
            # if not os.path.exists(save_path3):
            #     os.makedirs(save_path3)

            # result_path3 = os.path.join(save_path3, file_name)
            # cv2.imwrite(result_path3, image)
            # logger.info(f"Processed {file_name} and saved to {result_path3}")

           
            processed_url = f"{base_url}/{file_name}"
            processed_paths.append(processed_url)

            processed_url2 = f"{base_url}/{file_name}"
            processed_paths2.append(processed_url2)

            # processed_url3 = f"{base_url2}/{file_name}"s
            # processed_paths3.append(processed_url3)

        
        with open(os.path.join(save_path, 'postP.json'), 'w') as f:
            json.dump(processed_paths, f, indent=4)
            logger.info(f"Processed paths written to {os.path.join(save_path, 'postP.json')}")
        
        # with open(os.path.join(save_path3, 'postP_paths.json'), 'w') as f:
        #     json.dump(processed_paths3, f, indent=4)
        #     logger.info(f"Processed paths written to {os.path.join(save_path3, 'postP_paths.json')}")
    

        # with open(os.path.join(save_path2, 'postP.json'), 'w') as f:
        #     json.dump(processed_paths2, f, indent=4)
        #     logger.info(f"Processed paths written to {os.path.join(save_path2, 'postP.json')}")

    def del_dot_byArea(self, min_area: int, path_list):
        save_path = self.save_path
        # base_url = "http://localhost:3000/free/postP"
        base_url = "http://localhost:3000/free/seg/postP"

        processed_paths = []

        for path in path_list:
            file_name = os.path.basename(path)
            logger.info(f"Processing image: {path}")

           
            image = cv2.imread(path, cv2.IMREAD_UNCHANGED)
            if image is None:
                logger.error(f"Failed to read image: {path}")
                continue

           
            num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(image, connectivity=8)
            logger.info(f"Found {num_labels} components")

            
            for i in range(1, num_labels): 
                if stats[i, cv2.CC_STAT_AREA] < min_area:
                    image[labels == i] = 0

            
            result_path = os.path.join(save_path, file_name)
            cv2.imwrite(result_path, image)
            logger.info(f"Processed {file_name} and saved to {result_path}")

          
            processed_url = f"{base_url}/{file_name}"
            processed_paths.append(processed_url)

        
        with open(os.path.join(save_path, 'postP.json'), 'w') as f:
            json.dump(processed_paths, f, indent=4)
            logger.info(f"Processed paths written to {os.path.join(save_path, 'postP.json')}")

if __name__ == "__main__":
    
    json_url = "http://localhost:3000/free/seg/png_paths.json"
    current_path = os.getcwd()
    # print("888888888888", current_path)
    save_path = os.path.abspath(os.path.join(current_path, 'AMM-Seg', 'vite', 'public', 'seg', 'postP')) 
   
    process_type = "opening"  # "opening" 或 "area"
    param = 8  
 
    process = PostProcess(data_url=None, json_url=json_url, save_path=save_path)

   
    path_list = process.download_images()

    if process_type == "opening":
        process.del_dot_byOpen(param, path_list)
    elif process_type == "area":
        process.del_dot_byArea(param, path_list)
