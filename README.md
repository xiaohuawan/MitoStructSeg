# Segmentation 

## :book:Table Of Contents

- [Update](#update)
- [Installation](#installation)
- [Dataset](#segmentation_data)
- [Pretrained Models](#pretrained_models)
- [GUI](#Usage)
- [Inference](#inference)
- [visualization](#visualization)
- [Citation](#Citation)

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

| Dataset Name | Quark Cloud Disk | Google Cloud Disk |
| :---------: | :----------: | :----------: |
| patient1 | [download](https://pan.quark.cn/s/a42ead7affe3)<br>(pwd: p8FQ) | [download](https://drive.google.com/drive/folders/1bPkDxMU8nW0xIE1LyLdTCyvABHjfkNHq?usp=drive_link) | 
| patient2 | [download](https://pan.quark.cn/s/88b45e11fc11)<br>(pwd: dR3a) | [download](https://drive.google.com/drive/folders/1t5eYnyOY06gwRo-xQdVn-rOXE_P-K4N4?usp=drive_link) |
| patient3 | [download](https://pan.quark.cn/s/0153311a7b18)<br>(pwd: KP3P) | [download](https://drive.google.com/drive/folders/1zyUfF5EDRAMEm78bgWoQHL31krvavqC6?usp=drive_link) |

## <a name="pretrained_models"></a>:dna:Pretrained Models

| Model Name | Description |  Quark Cloud Disk | Google Cloud Disk |  
| :---------: | :----------: | :----------: | :----------: |
| patient1.ckpt | AMM-Seg trained on patient1  | [download](https://pan.quark.cn/s/5f233e1f1c78)<br>(pwd: xdJe) | [download](https://drive.google.com/file/d/1qtjoYP_fgBqAlzwT7f4V4NSbFhfkoHaS/view?usp=drive_link) |
| patient2.ckpt | AMM-Seg trained on patient2 | [download](https://pan.quark.cn/s/273efdbd0429)<br>(pwd: L82x) | [download](https://drive.google.com/file/d/1vyqp5L1Xc1s7IMkUx58HNsmvt67TJ5Zt/view?usp=drive_link) |
| patient3.ckpt | AMM-Seg trained on patient3 | [download](https://pan.quark.cn/s/b00e1a8fc24e)<br>(pwd: kpdH) | [download](https://drive.google.com/file/d/1f5-q3rx9PDeAmgErk4YMnRopuq4pHJif/view?usp=drive_link) |
| classification.pt | model for evaluating classification | [download](https://pan.quark.cn/s/0ae19c46bb04)<br>(pwd: 7MeU) | [download](https://drive.google.com/file/d/1WJ_3EXh0RcMn1LyFHTq7W3Y9vw2hBU5x/view?usp=drive_link) |

## <a name="inference"></a>:crossed_swords:Inference
    

    python inference.py -model MitoStructSeg -c patient1_config


## <a name="train"></a>:stars:Train

<a name="gen_file_list"></a>
1. Generate file list of validation set, a file list looks like:

    ```txt
    /path/to/patient1/data
    /path/to/patient2/data
    /path/to/patient3/data
    ...
    ```

2. Fill in the [training configuration file](/src/config/patient1_config.yaml) with appropriate values.

3. Start training!

    ```shell
    python main.py \
    -c patient1_config
    ```

## <a name="Usage"></a>📽️:GUI

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

- Method1

    - First, open an Administrator Command Prompt and use the `cd` command to navigate to the `MitoStructSeg/vite/` directory of your project. Then, type `npm start` to run the project. This will open a browser and navigate to [http://localhost:3000/free](http://localhost:3000/free).

    - Next, open a new command prompt and use the `cd` command to navigate to the `MitoStructSeg/src/` directory. Then, enter `python app.py`. This will start the backend server running locally at `127.0.0.1:5000`.

- Method2
  
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


<p align="center">
    <a href="https://github.com/xiaohuawan/MitoStructSeg1/blob/main/video/presentation%20workflow.mp4">
        <img src="https://img.shields.io/badge/Watch%20Video-presentation%20workflow.mp4-blue?style=for-the-badge" />
    </a> <br />
</p>


- For detailed usage instructions, please refer to the user manual.([User manual](https://github.com/xiaohuawan/MitoStructSeg1/blob/main/User%20Manual.pdf))

## <a name="3D visualization"></a>📽️:3D visualization

- 3D visualization of segmentation results for three patient datasets in an 800x800x400 voxel block, with green representing healthy mitochondria and red representing damaged mitochondria.

- [Watch 3D Visualization Video](https://github.com/xiaohuawan/MitoStructSeg1/blob/main/video/3D%20visualization.mp4)



## Citation



  
  
  



