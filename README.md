# Segmentation 

## :book:Table Of Contents

- [Update](#update)
- [Installation](#installation)
- [Dataset](#segmentation_data)
- [Pretrained Models](#pretrained_models)
- [Data Tree](#datatree)
- [Train](#train)
- [Inference](#inference)
- [GUI](#usage)
- [3D Visualization](#visualization)

## <a name="update"></a>:new:Update

- **2024.08.30**: This repo is released.

## <a name="installation"></a>:gear:Installation

```shell
# clone this repo
git clone https://github.com/xiaohuawan/MitoStructSeg.git
cd MitoStructSeg

# create environment
conda create -n MitoStructSeg python=3.9.19
conda activate MitoStructSeg
pip install -r requirements.txt
```

## <a name="segmentation_data"></a>ℹ️Dataset

<table class="table-auto w-full border-collapse">
  <!-- 表头 -->
  <thead>
    <tr class="bg-gray-100">
      <th class="border px-4 py-2 text-left font-bold">Dataset</th>
      <th class="border px-4 py-2 text-left font-bold">Dataset Name</th>
      <th colspan="2" class="border px-4 py-2 text-center font-bold">Source Domain</th>
      <th colspan="2" class="border px-4 py-2 text-center font-bold">Target Domain</th>
      <th colspan="2" class="border px-4 py-2 text-center font-bold">Validation</th>
    </tr>
    <tr class="bg-gray-100">
      <th class="border px-4 py-2 text-left font-bold"></th>
      <th class="border px-4 py-2 text-left font-bold"></th>
      <th class="border px-4 py-2 text-center font-bold">Quark Cloud Disk</th>
      <th class="border px-4 py-2 text-center font-bold">Google Cloud Disk</th>
      <th class="border px-4 py-2 text-center font-bold">Quark Cloud Disk</th>
      <th class="border px-4 py-2 text-center font-bold">Google Cloud Disk</th>
      <th class="border px-4 py-2 text-center font-bold">Quark Cloud Disk</th>
      <th class="border px-4 py-2 text-center font-bold">Google Cloud Disk</th>
    </tr>
  </thead>
  <!-- 表格内容 -->
  <tbody>
    <!-- 病人的心肌细胞线粒体（合并源域链接） -->
    <tr>
      <th rowspan="3" class="border px-4 py-2 bg-blue-50 font-bold text-center">Human Myocardium Dataset</th>
      <td class="border px-4 py-2 font-bold">Patient#1</td>
      <!-- 源域链接：三个Patient共享，仅显示一次 -->
      <td class="border px-4 py-2 text-center" rowspan="3"><a href="https://pan.quark.cn/s/dcb88aa73c49?pwd=84J2" target="_blank" class="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
      <td class="border px-4 py-2 text-center" rowspan="3"><a href="https://drive.google.com/drive/folders/1FUkabspbYWQMlD52IzZ0C-uhBRZG4hSL?usp=drive_link" target="_blank" class="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
      <!-- 目标域和验证集链接保留独立 -->
      <td class="border px-4 py-2 text-center"><a href="https://pan.quark.cn/s/056b849eb0c2?pwd=8Thb" target="_blank" class="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
      <td class="border px-4 py-2 text-center"><a href="https://drive.google.com/drive/folders/1q8lXrCagIiYcnAtMvyDSIelYxjEIcKsU?usp=drive_link" target="_blank" class="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
      <td class="border px-4 py-2 text-center"><a href="https://pan.quark.cn/s/6c07a6a5f065?pwd=1SCJ" target="_blank" class="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
      <td class="border px-4 py-2 text-center"><a href="https://drive.google.com/drive/folders/1OzDbBzn7qHXn6-2BcuHs3CnWWUdwscFL?usp=drive_link" target="_blank" class="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
    </tr>
    <tr>
      <td class="border px-4 py-2 font-bold">Patient#2</td>
      <!-- 源域链接通过rowspan合并，此处不重复显示 -->
      <td class="border px-4 py-2 text-center"><a href="https://pan.quark.cn/s/312f08d717b8?pwd=kpUc" target="_blank" class="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
      <td class="border px-4 py-2 text-center"><a href="https://drive.google.com/drive/folders/17nScKn5o4Ms5DQdcdUjPjSgesCkkADtN?usp=drive_link" target="_blank" class="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
      <td class="border px-4 py-2 text-center"><a href="https://pan.quark.cn/s/419da953dd64?pwd=1ZyX" target="_blank" class="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
      <td class="border px-4 py-2 text-center"><a href="https://drive.google.com/drive/folders/12v9CG1N-dlobQof0-f4uHyOSF88OUsP9?usp=drive_link" target="_blank" class="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
    </tr>
    <tr>
      <td class="border px-4 py-2 font-bold">Patient#3</td>
      <!-- 源域链接通过rowspan合并，此处不重复显示 -->
      <td class="border px-4 py-2 text-center"><a href="https://pan.quark.cn/s/60d56940b661?pwd=yZDD" target="_blank" class="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
      <td class="border px-4 py-2 text-center"><a href="https://drive.google.com/drive/folders/1-2TIn_4RRyykjpnEZgCk68FLQCSzYt0V?usp=drive_link" target="_blank" class="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
      <td class="border px-4 py-2 text-center"><a href="https://pan.quark.cn/s/128e56a52b63?pwd=vAsu" target="_blank" class="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
      <td class="border px-4 py-2 text-center"><a href="https://drive.google.com/drive/folders/1C44ypskqb6VplI2CyG9DxQbPBs5ZjQc6?usp=drive_link" target="_blank" class="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
    </tr>
    <!-- 分隔线 -->
    <tr>
      <td colspan="8" class="border-t-2 border-gray-300"></td>
    </tr>
    <!-- 小鼠的线粒体（保持不变） -->
    <tr>
      <th rowspan="2" class="border px-4 py-2 bg-green-50 font-bold text-center">Mouse Kidney Dataset</th>
      <td rowspan="2" class="border px-4 py-2 font-bold">Mouse Kidney</td>
      <td class="border px-4 py-2 text-center"><a href="https://pan.quark.cn/s/936686812cd3?pwd=4Apx" target="_blank" class="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
      <td class="border px-4 py-2 text-center"><a href="https://drive.google.com/drive/folders/1vJkPMhCcefSfWCx_zbuTHxyiFi8GIbuw?usp=drive_link" target="_blank" class="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
      <td class="border px-4 py-2 text-center"><a href="https://pan.quark.cn/s/c224765868e6?pwd=H6Kq" target="_blank" class="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
      <td class="border px-4 py-2 text-center"><a href="https://drive.google.com/drive/folders/1KMhgTbYsC79zKuP0AMqGqcHWDXw9pvEi?usp=drive_link" target="_blank" class="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
      <td class="border px-4 py-2 text-center"><a href="https://pan.quark.cn/s/2e1b809916f8?pwd=TgmZ" target="_blank" class="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
      <td class="border px-4 py-2 text-center"><a href="https://drive.google.com/drive/folders/1a94VNx0lLUF27ZeWfG50QqixQ-6ltswk?usp=drive_link" target="_blank" class="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"><i class="fa fa-download mr-2"></i>Download</a></td>
    </tr>
  </tbody>
</table>


## <a name="pretrained_models"></a>:dna:Pretrained Models

| Model Name | Description |  Quark Cloud Disk | Google Cloud Disk |  
| :---------: | :----------: | :----------: | :----------: |
| Patient#1.ckpt | MitoStructSeg trained on Patient#1  | [download](https://pan.quark.cn/s/5f233e1f1c78)<br>(pwd: xdJe) | [download](https://drive.google.com/file/d/1qtjoYP_fgBqAlzwT7f4V4NSbFhfkoHaS/view?usp=drive_link) |
| Patient#2.ckpt | MitoStructSeg trained on Patient#2 | [download](https://pan.quark.cn/s/273efdbd0429)<br>(pwd: L82x) | [download](https://drive.google.com/file/d/1vyqp5L1Xc1s7IMkUx58HNsmvt67TJ5Zt/view?usp=drive_link) |
| Patient#3.ckpt | MitoStructSeg trained on Patient#3 | [download](https://pan.quark.cn/s/b00e1a8fc24e)<br>(pwd: kpdH) | [download](https://drive.google.com/file/d/1f5-q3rx9PDeAmgErk4YMnRopuq4pHJif/view?usp=drive_link) |
| Mouse Kidney.ckpt | MitoStructSeg trained on Mouse Kidney | [download](https://pan.quark.cn/s/d74097a3f304)<br>(pwd: b5Nb) | [download](https://drive.google.com/file/d/1YXqNwpOJ9sicekGvRQheIoUO8s2dAeFa/view?usp=drive_link) |
| classification.pt | model for evaluating classification | [download](https://pan.quark.cn/s/8b4f1c58d9a8)<br>(pwd: NEMP) | [download](https://drive.google.com/file/d/1WJ_3EXh0RcMn1LyFHTq7W3Y9vw2hBU5x/view?usp=drive_link) |


## <a name="datatree"></a>:crossed_swords:Data Tree

    ├── data
    │   ├── patient1
    │   │   ├── Source_domain
    │   │   │   ├── data_block1
    │   │   │   ├── data_block2
    │   │   │   ├── label_block1
    │   │   │   └── label_block2
    │   │   ├── Target_domain
    │   │   │   └── data
    │   │   └── Valid
    │   │       ├── data
    │   │       └── label
    ├── models
    │   ├── Patient#1_config.ckpt
    │   ├── Patient#2_config.ckpt
    │   ├── Patient#3_config.ckpt
    │   └── Mouse_Kidney.ckpt
    ├── src
    │   ├── config
    │   ├── dataset
    │   ├── model
    │   ├── scripts
    │   └── utils


## <a name="train"></a>:stars:Train

1. Fill in the [training configuration file](/src/config/Patient#1_config.yaml) with appropriate values.

2. Start training!

    ```shell
    cd /MitoStructSeg/src
    python main.py
    ```


## <a name="inference"></a>:crossed_swords:Inference

**We store our trained models at [GoogleDrive](https://drive.google.com/drive/folders/1plJ0fyeCqIekUGNxKloY3YGMGnmOcsw9?usp=drive_link) or [Quark Cloud](https://pan.quark.cn/s/962f18419644?pwd=4S11)**    

1. Fill in the [training configuration file](/src/config/Patient#1_config.yaml) with appropriate values.
2. Start inference!
   
    ```shell
    cd /MitoStructSeg/src
    python inference.py 
    ```


## <a name="usage"></a>📽️:GUI

  The system is divided into four main sections: classification assessment, image segmentation, precise calculation. 
  
1.Configuration

- Download Node.js 18.17.1 
- Create Symbolic Links

    ```shell
    ln -s /root/node-v18.17.1-linux-x64/bin/node /usr/local/bin/node
    ```
- Edit the Environment Configuration File

    ```shell
    export NODEJS_HOME=/usr/local/lib/node/nodejs 
    export PATH=$NODEJS_HOME/bin:$PATH

    ```
-  Verify the Installation

    ```shell
        node -v
        npm -v

    ```

2.Usage

  -For Windows:

  -Run the following command directly in the terminal:

      ```shell

      python start_win.py

        ```
  -For Linux:

  -Run the following command directly in the terminal:

      ```shell

      python start_linux.py

        ```


<p align="center">
    <img src="images/classify.png"/> <br />
    <em> 
    Figure 1. Mitochondrial Health Assessment Interface.
    </em>
</p>

<p align="center">
    <img src="images/segment.png"/> <br />
    <em> 
    Figure 2. Segmentation of 2D Images Interface.
    </em>
</p>

<p align="center">
    <img src="images/com.jpg"/> <br />
    <em> 
    Figure 3. Membrane Structure Calculation Interface.
    </em>
</p>


https://github.com/user-attachments/assets/e5b32981-9ba9-4b80-80d5-9e84bb63c476



## <a name="visualization"></a>📽️ 3D Visualization

> **3D visualization of segmentation results** in 800×800×400 voxel blocks  
> 🟢 **Green**: Healthy mitochondria | 🔴 **Red**: Damaged mitochondria


### 🫀 Human Myocardium

<div align="center">

**Patient #1**

https://github.com/user-attachments/assets/b85e7707-c626-4d58-964d-108532d5a389

---

**Patient #2**

https://github.com/user-attachments/assets/538c905c-cd12-424b-a251-fef1ddff8e3b

---

**Patient #3**

https://github.com/user-attachments/assets/a2fb0f46-d915-4789-9b78-10aa733ff2cc

</div>

---

### 🐭 Mouse Kidney

<div align="center">

https://github.com/user-attachments/assets/a79d8bbc-d49e-43d4-9604-64a294f05dcc

</div>

---



This program is built upon a set of great works:
- [DA-ISC](https://github.com/weih527/DA-ISC)
- [berry-free-react-admin-template](https://github.com/codedthemes/berry-free-react-admin-template)




  
  
  



