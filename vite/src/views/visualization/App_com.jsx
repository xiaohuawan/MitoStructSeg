import React, { Component } from 'react'
import * as echarts from 'echarts';
import geoJson from './map/china.json'
import { BorderBox1 ,BorderBox8,Decoration1 } from '@jiaminghi/data-view-react'
import './index2.css'
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import Papa from 'papaparse';
import npyjs from 'npyjs';
import * as d3 from 'd3';
import { height } from '@mui/system';


function BackButton() {
  const navigate = useNavigate();
  return (
    <Button 
      type="primary" 
      style={{ position: 'absolute', top: '15px', left: '70px', zIndex: 1000 }}
      onClick={() => navigate(-1)}
    >
      返回
    </Button>
  );
}

class App extends Component {
  

  state = {
    chartData: [],
    labelData: null, // 当前标签对应的数据
    totalData: [],
    imageFiles1: [],
    currentImageIndex1: 0,
    imageFiles2: [],
    currentImageIndex2: 0,
    topdata: {},
    tabledata: {},
    tableData2: [], 
    labelValue: null, // 当前线粒体标签值
    tooltipStyle: { display: 'none', position: 'absolute', top: 0, left: 0 },
    tooltipContent: ''
  };
  
  async componentDidMount() {
    try {
      await Promise.all([this.loadImages1(), this.loadImages2(), this.loadCSVSingle(), this.loadCSVTotal()]);
      this.initializeCharts();
    } catch (error) {
      console.error('Error during component mount:', error);
    }

    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  async loadCSVSingle() {
    try {
      const response = await fetch('../free/outputs/single_info.csv');
      const csvData = await response.text();
      Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          this.setState({ chartData: result.data }, this.updateChart1);
        },
        error: (error) => console.error('解析CSV文件出错:', error),
      });
    } catch (error) {
      console.error('Error fetching single CSV:', error);
    }
  }

  async loadCSVTotal() {
    try {
      const response = await fetch('../free/outputs/total_info.csv');
      const csvData = await response.text();
      Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          this.setState({ totalData: result.data }, this.updateChart2);
          this.setState({ totalData: result.data }, this.updateChart4);
        },
        error: (error) => console.error('解析CSV文件出错:', error),
      });
    } catch (error) {
      console.error('Error fetching total CSV:', error);
    }
  }
  async loadImages1() {
    try {
      const response = await fetch('../free/outputs/seg.json');
      // const response = await fetch('/free/seg/png_paths.json');
      if (!response.ok) throw new Error('Network response was not ok');
      const imagePaths1 = await response.json();
      this.setState({ imageFiles1: imagePaths1, currentImageIndex1: 0 });
    } catch (error) {
      console.error('Error loading image paths:', error);
    }
  }

  async loadImages2() {
    try { 
      // const response = await fetch('/free/seg_source/source_paths.json');
      const response = await fetch('../free/com_source/com_source.json');
      if (!response.ok) throw new Error('Network response was not ok');
      const imagePaths2 = await response.json();
      this.setState({ imageFiles2: imagePaths2, currentImageIndex2: 0 });
    } catch (error) {
      console.error('Error loading source image paths:', error);
    }
  }

  async fetchLabelFromNpy(x, y) {
    try {
      const imageName = this.state.imageFiles1[this.state.currentImageIndex1];
      if (!imageName) throw new Error('当前图像文件名未定义');
  
      const fileName = imageName.split('/').pop().replace(/\.[^/.]+$/, '');
      const filePath = `/free/outputs/${fileName}.npy`;
      const npy = new npyjs();
  
      const response = await fetch(filePath);
      const buffer = await response.arrayBuffer();
      const npyData = await npy.load(buffer);
  
      if (!npyData || !npyData.data) throw new Error('npyData 或 npyData.data 不存在');
  
      const width = 800;
      // const height = 800;
  
      const index = y * width + x;
      if (index < 0 || index >= npyData.data.length) {
        console.error('索引超出数据范围:', index);
        return null;
      }
  
      return npyData.data[index];
    } catch (error) {
      console.error('获取 npy 文件出错:', error);
      return null;
    }
  }
  
  

  handleMouseMove = async (event) => {
    const img = event.currentTarget.querySelector('img');
    const rect = img.getBoundingClientRect();
    
    // 鼠标在缩放后的图像上的位置
    const mouseXInImg = event.clientX - rect.left;
    const mouseYInImg = event.clientY - rect.top;
    
    // 图像的缩放比例
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    
    // 将鼠标位置转换为原始图像上的位置
    const xIndex = Math.floor(mouseXInImg * scaleX);
    const yIndex = Math.floor(mouseYInImg * scaleY);
  
    try {
      const labelValue = await this.fetchLabelFromNpy(xIndex, yIndex);
      
      this.setState({
        tooltipStyle: {
          visibility: 'visible',
          opacity: 1,
          position: 'absolute',
          top: (event.clientY - rect.top) + 10 + 'px', // 距离鼠标稍微偏移
          left: (event.clientX - rect.left) + 10 + 'px', // 距离鼠标稍微偏移
          backgroundColor: '#333',
          color: '#fff',
          padding: '5px',
          borderRadius: '3px',
          pointerEvents: 'none',
          zIndex: 1000
        },
        tooltipContent: labelValue !== null ? `Mito_${labelValue}` : '无标签'
      });
    } catch (error) {
      console.error('获取标签值时出错:', error);
      this.setState({
        tooltipStyle: {
          visibility: 'hidden',
          opacity: 0
        },
        tooltipContent: ''
      });
    }
  }
  handleMouseLeave = () => {
    this.setState({
      tooltipStyle: {
        visibility: 'hidden',
        opacity: 0
      },
      tooltipContent: ''
    });
  }

  

  async fetchDataForLabel() {
    const { chartData, labelValue, imageFiles1, currentImageIndex1 } = this.state;
    if (chartData.length === 0) return;
    
    let currentData = null;

    try {
      // Getting the current image URL
      const imageUrl = imageFiles1[currentImageIndex1];
      if (!imageUrl) throw new Error('当前图像文件名未定义');

      // Extracting the filename from the URL.
      const fileName = imageUrl.split('/').pop().replace(/\.[^/.]+$/, '') + '.png';
      
      // Searching the data row corresponding to the image.
      const dataRow = chartData.find(data => data.image_name === fileName);
      if (dataRow) {
        if (labelValue === 0) {
          // Display all data if the label is 0
          currentData = { ...dataRow };
        } else {
          // For labels 1 to 14, extract the corresponding extral and insider data
          currentData = {
            extral: dataRow[`label_${labelValue}_extral`],
            insider: dataRow[`label_${labelValue}_insider`]
          };
        }
      } else {
        console.error('未找到对应图像的数据:', fileName);
      }
    } catch (error) {
      console.error('获取标签数据时出错:', error);
    }

    // Calculate the sum of extralData and insiderData
    const extralSum = (currentData?.extral || []).reduce((sum, value) => sum + (value || 0), 0);
    const insiderSum = (currentData?.insider || []).reduce((sum, value) => sum + (value || 0), 0);

    // For debugging: log the calculated sums and new table data
    console.log('Extral Sum:', extralSum);
    console.log('Insider Sum:', insiderSum);
    console.log('Image Name:', imageFiles1[currentImageIndex1]);

    this.setState({ 
      labelData: currentData,
      tableData2: [{ 
        images_name: imageFiles1[currentImageIndex1], 
        extralData_sum: extralSum, 
        insiderData_sum: insiderSum 
      }]
    });
  };
  
  handleClick = async (event) => {
    const img = event.currentTarget.querySelector('img'); // 获取图片元素
    const rect = img.getBoundingClientRect(); // 获取图片的边界矩形
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    // 计算缩放比例
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
  
    // 缩放坐标
    const xIndex = Math.floor(x * scaleX);
    const yIndex = Math.floor(y * scaleY);
  
    const labelValue = await this.fetchLabelFromNpy(xIndex, yIndex);
    
    this.setState({
      labelValue,
      labelData: {
        extral: labelValue !== null ? `Extral for ${labelValue}` : '无标签', // Replace with your logic
        insider: labelValue !== null ? `Insider for ${labelValue}` : '无标签' // Replace with your logic
      }
    }, this.updateChart4);
  }
  
  
  updateChart1 = () => {
    const svgElement = document.querySelector('svg[width="200px"][height="50px"]');

    // 如果找到，则删除该元素
    if (svgElement) {
        svgElement.remove();
    }
    const { chartData, currentImageIndex1 } = this.state;
    const currentData = chartData[currentImageIndex1];
  
    console.log('当前图表数据:', currentData); // 确保数据存在
  
    if (!currentData) return;
  
    // 生成 X 轴的标签名称
    const labels = Object.keys(currentData)
      .filter(key => key.endsWith('_extral'))
      .map(key => key.replace('_extral', ''));

    const formattedLabels = labels.map((label, index) => `Mito_${index + 1}`);
  
    console.log('X轴标签:', labels);
  
    // 提取 extral 和 insider 的数据
    const extralData = labels.map(label => (currentData[`${label}_extral`] / 1000000));
    const insiderData = labels.map(label => (currentData[`${label}_insider`] / 1000000));
  
    console.log('Extral数据:', extralData);
    console.log('Insider数据:', insiderData);
      // 计算 extralData 和 insiderData 的总和
    const extralData_sum = extralData.reduce((sum, value) => sum + (value || 0), 0);
    const insiderData_sum = insiderData.reduce((sum, value) => sum + (value || 0), 0);

    console.log('Extral数据总和:', extralData_sum);
    console.log('Insider数据总和:', insiderData_sum);
    this.setState({
      currentLabels: labels,
      currentExtralData: extralData,
      currentInsiderData: insiderData,
      currentExtralSum: extralData_sum,
      currentInsiderSum: insiderData_sum
    });
  
    const chart = echarts.init(document.getElementById('mainMap2'));
  
    chart.setOption({
      title: {
        show: true,
        x: 'center',
        textStyle: {
          fontSize: 20,
          color: '#01c4f7', // 与 updateChart2 一致
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function (params) {
          let tooltipText = '';
          params.forEach(item => {
            tooltipText += `${item.marker} ${item.seriesName}: ${item.value} nm<br />`;
          });
          return tooltipText;
        }
      },
      legend: {
        data: ['Outer Membrane Surface', 'Inner Cristae Surface'],
        textStyle: {
          fontSize: 10, // 缩小图例字体大小
          color: '#ffffff'
        },
        orient: 'horizontal',  // 设置图例为水平方向
        bottom: '-3%',          // 将图例放置在坐标轴下方
        left: 'center',         // 水平居中
        itemWidth: 16,          // 缩小图例项的宽度
        itemHeight: 10,         // 缩小图例项的高度
        itemGap: 8              // 缩小图例项的间隔
      },
      
      grid: {
        left: '10%',
        right: '5%',
        bottom: '20%', 
        top: '10%'
      },
      xAxis: {
        type: 'category',
        data: formattedLabels,
        axisLabel: {
          textStyle: {
            color: '#c3dbff',
            fontSize: 8
          },
          rotate: 45, 
          interval: 0 
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#07234d']
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value} μm²',
          textStyle: {
            color: '#c3dbff',
            fontSize: 12
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#07234d']
          }
        }
      },
      series: [
        {
          name: 'Outer Membrane Surface',
          type: 'bar',
          data: extralData,
          itemStyle: {
            color: '#9702fe',
          }
        },
        {
          name: 'Inner Cristae Surface',
          type: 'bar',
          data: insiderData,
          itemStyle: {
            color: '#ff893b',
          }
        }
      ],
    });
  };

  updateChart4 = () => {
    const svgElement = document.querySelector('svg[width="200px"][height="50px"]');

    // 如果找到，则删除该元素
    if (svgElement) {
        svgElement.remove();
    }
    const { totalData, labelValue } = this.state;
    const currentData2 = totalData[labelValue - 1];
    console.log('labelValue:', labelValue); // 确保数据存在
  
    console.log('currentData2:', currentData2); // 确保数据存在
  
    if (!currentData2) return;
  
        // 提取 extral 和 insider 的数据
    const current_extralData_sum = (currentData2[`out_memb_area`] / 1000000);
    const current_insiderData_sum = (currentData2[`inside_memb_area`] / 1000000);
    const volume = (currentData2[`volume`] / 1000000000);
    const volume_all = (currentData2[`volume_all`] / 1000000000);
    console.log('33333:', current_extralData_sum); // 确保数据存在
    this.setState({
      currentLabels: labelValue,
      current_extralData_sum: current_extralData_sum,
      current_insiderData_sum: current_insiderData_sum,
      volume: volume,
      volume_all: volume_all
    });

    // console.log('1:', current_extralData_sum);
    // console.log('2:', current_insiderData_sum);
  }
  
  



  updateChart3 = async () => {
    const { imageFiles1, currentImageIndex1 } = this.state;
  
    // 如果当前图片索引无效，则不执行
    if (currentImageIndex1 < 0) return;
  
    let current_extralSum = 0;
    let current_insiderSum = 0;
  
    try {
      const imageUrl = imageFiles1[currentImageIndex1];
      if (!imageUrl) throw new Error('当前图像文件名未定义');
  
      const csvFilePath = '../free/outputs/total_info.csv';
      const data = await d3.csv(csvFilePath);
  
      const dataRow = data.find(row => parseInt(row.label, 10) === currentImageIndex1);
  
      if (dataRow) {
        current_extralSum = parseFloat(dataRow.out_memb_area) || 0;
        current_insiderSum = parseFloat(dataRow.inside_memb_area) || 0;
        console.log('提取的数据:', { current_extralSum, current_insiderSum })
  
        // 更新状态
        this.setState({
          labelData: { current_extralSum, current_insiderSum },
          tableData3: [{
            images_name: imageFiles1[currentImageIndex1],
            current_extralData_sum: current_extralSum,
            current_insiderData_sum: current_insiderSum
          }]
        });
      } else {
        console.error('未找到对应 label 的数据:', currentImageIndex1);
      }
    } catch (error) {
      console.error('获取标签数据时出错:', error);
    }
  
    // 检查数据是否存在
    if (!current_extralSum && !current_insiderSum) {
      console.warn('extralSum 和 insiderSum 数据为空');
    }
  };
  
  updateChart2 = async () => {
    const { imageFiles1 } = this.state;
  
    let labels = [];
    let extralSums = [];
    let insiderSums = [];
    let volume = [];
    let volume_all = [];
  
    try {
      const csvFilePath = '../free/outputs/total_info.csv';
      const data = await d3.csv(csvFilePath);
  
      // 遍历 CSV 文件中的所有数据
      data.forEach(row => {
        const label = parseInt(row.label, 10);
        const mitoLabel = `Mito_${label}`;
        const extralSum = (parseFloat(row.out_memb_area) || 0 ) / 1000000; // μm²
        const insiderSum = (parseFloat(row.inside_memb_area) || 0) / 1000000; // μm²
        const vol = (parseFloat(row.volume) || 0 ) / 1000000000; // μm³
        const vol_all = (parseFloat(row.volume_all) || 0) / 1000000000; // μm³
  
        labels.push(mitoLabel);
        extralSums.push(extralSum);
        insiderSums.push(insiderSum);
        volume.push(vol);
        volume_all.push(vol_all);
      });
  
      // 更新状态
      this.setState({
        tableData2: data.map(row => ({
          images_name: imageFiles1[parseInt(row.label, 10)],
          extralData_sum: parseFloat(row.out_memb_area) || 0,
          insiderData_sum: parseFloat(row.inside_memb_area) || 0,
          volume: parseFloat(row.volume) || 0,
          volume_all: parseFloat(row.volume_all) || 0
        }))
      });
    } catch (error) {
      console.error('获取 CSV 数据时出错:', error);
      return;
    }
  
    // 设置图表配置
    const chart = echarts.init(document.getElementById('mainMap3'));
  
    chart.setOption({
      title: {
        show: true,
        x: 'center',
        textStyle: { fontSize: 20, color: '#01c4f7' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: params => {
            return params.map(item => {
                let value = item.value;
                let unit = 'μm²'; // 默认单位是平方微米
    
                // 如果系列名称为 'Solid Volume' 或 'Total Volume'，则单位改为 'μm³'
                if (item.seriesName.includes('Volume')) {
                    value = value / 1; // 将立方微米转换为微米平方
                    unit = 'μm³';
                }
    
                return `${item.marker} ${item.seriesName}: ${value} ${unit}<br />`;
            }).join('');
        }
    },
      legend: {
        data: ['Outer Membrane Surface', 'Inner Cristae Surface', 'Solid Volume', 'Total Volume'],
        textStyle: { fontSize: 10, color: '#ffffff' },
        bottom: '-3%',  // 将图例放置在坐标轴下方
        left: 'center',  // 水平居中
        itemWidth: 16,
        itemHeight: 10,
        itemGap: 8,
        orient: 'horizontal'  // 水平排列
      },
      
      grid: { 
        left: '10%', 
        right: '10%', 
        bottom: '20%', 
        top: '10%' 
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { textStyle: { color: '#c3dbff', fontSize: 8 }, rotate: 45, interval: 0 },
        splitLine: {
          show: true,
          lineStyle: { color: ['#07234d'] }
        }
      },
      yAxis: [
        { // Left Y Axis (for Extral and Insider)
          type: 'value',
          axisLabel: { formatter: '{value} μm²', textStyle: { color: '#c3dbff', fontSize: 12 } },
          splitLine: {
            show: true,
            lineStyle: { color: ['#07234d'] }
          }
        },
        { // Right Y Axis (for Volume and Volume_all)
          type: 'value',
          axisLabel: { formatter: '{value} μm³', textStyle: { color: '#c3dbff', fontSize: 12 } },
          position: 'right',
          splitLine: {
            show: true,
            lineStyle: { color: ['#07234d'] }
          }
        }
      ],
      series: [
        {
          name: 'Outer Membrane Surface',
          type: 'bar',
          data: extralSums,
          itemStyle: { color: '#9702fe' },
          yAxisIndex: 0  // Link to left Y Axis
        },
        {
          name: 'Inner Cristae Surface',
          type: 'bar',
          data: insiderSums,
          itemStyle: { color: '#ff893b' },
          yAxisIndex: 0  // Link to left Y Axis
        },
        {
          name: 'Solid Volume',
          type: 'bar',
          data: volume,
          itemStyle: { color: '#02fe8b' },
          yAxisIndex: 1  // Link to right Y Axis
        },
        {
          name: 'Total Volume',
          type: 'bar',
          data: volume_all,
          itemStyle: { color: '#ffb800' },
          yAxisIndex: 1  // Link to right Y Axis
        }
      ]
    });
  };
  
  
  componentDidUpdate(prevProps, prevState) {
    // 如果索引发生变化，更新图表
    if (prevState.currentImageIndex1 !== this.state.currentImageIndex1 || 
        prevState.currentImageIndex2 !== this.state.currentImageIndex2) {
      this.updateChart1();
      this.updateChart2();
      this.fetchDataAndUpdateChart();
      // this.updateChart2();
    }
  }

// 获取轮播图和线粒体健康状况pie图
  fetchDataAndUpdateChart() {
    const { currentImageIndex, imageFiles } = this.state;
    if (!imageFiles || imageFiles.length === 0) return;
    
    const currentImagePath = imageFiles[currentImageIndex];
    console.log("****currentImagePath", currentImagePath);
    
    // Normalize path separators (just in case)
    const normalizedPath = currentImagePath.replace(/\\/g, '/');
    
    // Extract filename
    const filenameWithExtension = normalizedPath.split('/').pop();
    
    // Remove file extension
    const filenameWithoutExtension = filenameWithExtension.split('.').slice(0, -1).join('.');
    
    console.log("Filename without extension:", filenameWithoutExtension);
    const newFilePath = `/free/class_predict/${filenameWithoutExtension}.txt`;
    console.log("New file path:", newFilePath);
    
    fetch(newFilePath)
      .then(response => response.text())
      .then(text => {
        const classAllMatch = text.match(/class_all:\s*\[(.*?)\]/);
        const cntAllMatch = text.match(/cnt_all:\s*\[(.*?)\]/);
        
        if (classAllMatch && cntAllMatch) {
          const class_all = classAllMatch[1].split(/\s+/).map(Number);
          const cnt_all = cntAllMatch[1].split(/\s+/).map(Number);
          
          // Process the data
          this.updateTopData(class_all);
          this.updateChart(cnt_all)
        }
      })
      .catch(error => console.error('Error fetching data:', error));
  }
  
  updateTopData(class_all) {
    const topdata = {
        data: class_all.map((value, index) => ({
            name: `mitochondrion ${index + 1}`,
            value: value === 0 ? '健康' : '不健康'
        })),
        carousel: 'page',
        scrollSpeed: 5
    };

    this.setState({ topdata });
    console.log("更新后的 topdata:", topdata);
}


  handleSliderChange = (event) => {
    const newIndex = parseInt(event.target.value, 10);
    this.setState({
      currentImageIndex1: newIndex,
      currentImageIndex2: newIndex,
    });
  };

  handleResize = () => {
    const { myChart1, myChart2, myChart3, myChart4, myChart5, myChart6 } = this.state;
    [myChart1, myChart2, myChart3, myChart4, myChart5, myChart6].forEach(chart => {
      if (chart) chart.resize();
    });
  };


  initializeCharts = () => {
    if (
      document.getElementById('mainMap2') && document.getElementById('mainMap3')) {
      this.fetchDataAndUpdateChart();
      // this.initialECharts4();
      // this.initialECharts5();
    } else {
      console.error('必要的 DOM 元素未加载');
    }
  };
    // ------------------------------------------------------------
  
  initialECharts = () => {
    echarts.registerMap('zhongguo', geoJson)
    const flyGeo = {
      洛阳: [112.460299, 34.62677]
    }

    
    const flyVal = [
      [{ name: '洛阳' }, { name: '洛阳', value: 100 }]
    ]
    const convertFlyData = function(data) {
      let res = []
      for (let i = 0; i < data.length; i++) {
        let dataItem = data[i]
        let toCoord = flyGeo[dataItem[0].name]
        let fromCoord = flyGeo[dataItem[1].name]
        if (fromCoord && toCoord) {
          res.push({
            fromName: dataItem[1].name,
            toName: dataItem[0].name,
            coords: [fromCoord, toCoord]
          })
        }
      }
      return res
    }
    //报表配置
    const originName = '浙江'
    const flySeries = []
    ;[[originName, flyVal]].forEach(function(item, i) {
      flySeries.push(
        {
          name: item[0],
          type: 'lines',
          zlevel: 1,
          symbol: ['none', 'none'],
          symbolSize: 0,
          effect: {
            //特效线配置
            show: true,
            period: 5, //特效动画时间，单位s
            trailLength: 0.1, //特效尾迹的长度，从0到1
            symbol: 'arrow',
            symbolSize: 5
          },
          lineStyle: {
            normal: {
              color: '#f19000',
              width: 1,
              opacity: 0.6,
              curveness: 0.2 //线的平滑度
            }
          },
          data: convertFlyData(item[1])
        },
        {
          name: item[0],
          type: 'effectScatter',
          coordinateSystem: 'geo',
          zlevel: 2,
          rippleEffect: {
            //涟漪特效
            period: 5, //特效动画时长
            scale: 4, //波纹的最大缩放比例
            brushType: 'stroke' //波纹的绘制方式：stroke | fill
          },
          label: {
            normal: {
              show: false,
              position: 'right',
              formatter: '{b}'
            }
          },
          symbol: 'circle',
          symbolSize: function(val) {
            //根据某项数据值设置符号大小
            return val[2] / 10
          },
          itemStyle: {
            normal: {
              color: '#f19000'
            }
          },
          data: item[1].map(function(dataItem) {
            return {
              name: dataItem[1].name,
              value: flyGeo[dataItem[1].name].concat([dataItem[1].value])
            }
          })
        },
        {
          //与上层的点叠加
          name: item[0],
          type: 'scatter',
          coordinateSystem: 'geo',
          zlevel: 3,
          symbol: 'circle',
          symbolSize: function(val) {
            //根据某项数据值设置符号大小
            return val[2] / 15
          },
          itemStyle: {
            normal: {
              color: '#f00'
            }
          },
          data: item[1].map(function(dataItem) {
            return {
              name: dataItem[1].name,
              value: flyGeo[dataItem[1].name].concat([dataItem[1].value])
            }
          })
        }
      )
    })

    this.setState(
      { myChart1: echarts.init(document.getElementById('mainMap')) },
      () => {
        this.state.myChart1.setOption({
          tooltip: {
            trigger: 'item'
          },
        })
      }
    )
  }

  render() {
    const {
      tooltipStyle,
      tooltipContent,
      labelValue,
      // labelData,
      imageFiles1,
      currentImageIndex1,
      imageFiles2,
      currentImageIndex2,
      currentExtralSum,
      currentInsiderSum,
      currentExtralData,
      currentInsiderData,
      current_extralData_sum,
      current_insiderData_sum,
      volume,
      volume_all
    } = this.state;
  
    const currentImage1 = imageFiles1 && imageFiles1.length > 0 ? imageFiles1[currentImageIndex1] : null;
  
    const containerStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '80%',
      marginTop: '20px',
    };
  
    const tableStyle = {
      width: '80%',
      height: '100%',
      margin: '0 auto',
      borderCollapse: 'collapse',
      fontSize: '14px',
      textAlign: 'center',
      marginTop: '50px',
    };
  
    const thStyle = {
      border: '1px solid #dddddd',
      padding: '8px',
      backgroundColor: '#333',
      color: 'white',
    };
  
    const tdStyle = {
      border: '1px solid #dddddd',
      padding: '8px',
    };
  
    const tooltipDefaultStyle = {
      position: 'absolute',
      backgroundColor: '#333',
      color: '#fff',
      padding: '5px',
      borderRadius: '3px',
      pointerEvents: 'none',
      zIndex: 1000,
    };


    const containerStyle1 = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '80%',
      marginTop: '20px',
    };
    
    const tableStyle1 = {
      width: '80%', // 增加表格宽度以使其更宽
      margin: '0 auto',
      borderCollapse: 'collapse',
      fontSize: '13px',
      textAlign: 'center',
      marginTop: '25px',
    };
    
    const thStyle1 = {
      width: '20%',
      border: '1px solid #dddddd',
      padding: '8px',
      backgroundColor: '#333',
      color: 'white',
    };
    
    const tdStyle1 = {
      border: '1px solid #dddddd',
      padding: '8px',
    };
    
    return (
      <div className="data">
        <header className="header_main">
          <div className="left_bg"></div>
          <div className="right_bg"></div>
          <h3>Data Visualization</h3>
        </header>
        <BackButton />
        <div className="wrapper">
          <div className="container-fluid">
            <div className="row fill-h" style={{ display: 'flex' }}>
              <div className="col-lg-3 fill-h" style={{ width: '25%' }}>
                <div className="xpanel-wrapper xpanel-wrapper-5">
                    <BorderBox1>
                    <div className="content_title" style={{ fontSize: "16px" }}>
                      Single Image Analysis:<br />
                      Mito_{labelValue}
                    </div>
                      <div className="xpanel">
                        <div className="fill-h2">
                          {labelValue !== null ? (
                            <div style={containerStyle1}>
                              <table style={tableStyle1}>
                                <thead>
                                  <tr>
                                    {/* <th style={thStyle1}>Mito</th> */}
                                    <th style={thStyle1}>Outer Membrane Surface <span style={{ fontSize: '10px' }}>(μm<sup>2</sup>)</span></th>
                                    <th style={thStyle1}>Inner Cristae Surface <span style={{ fontSize: '10px' }}>(μm<sup>2</sup>)</span></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr style={{  }}>
                                    {/* <td style={tdStyle1}>{labelValue}</td> */}
                                    <td style={tdStyle1}>{currentExtralData && !isNaN(currentExtralData[labelValue - 1]) ? Number(currentExtralData[labelValue - 1]).toFixed(3) : '无数据'} </td>
                                    <td style={tdStyle1}>{currentInsiderData && !isNaN(currentInsiderData[labelValue - 1]) ? Number(currentInsiderData[labelValue - 1]).toFixed(3) : '无数据'} </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          ) : ''}
                        </div>
                      </div>
                    </BorderBox1>
                </div>
              </div>
  
              <div className="col-lg-6 fill-h" style={{ width: '50%' }}>
                <div className="xpanel-wrapper xpanel-wrapper-5">
                  <div className="xpanel" style={{ position: 'relative' }}>
                    {currentImage1 ? (
                      <div className="class_images">
                        <div>
                          <img
                            src={imageFiles2[currentImageIndex2]}
                            alt={`Image ${currentImageIndex2}`}
                            style={{ width: '100%', height: 'auto' }}
                          />
                        </div>
                        <div
                          className="source_images"
                          onMouseMove={this.handleMouseMove}
                          onClick={this.handleClick}
                          onMouseLeave={this.handleMouseLeave}
                          // onMouseLeave={this.handleMouseLeave}
                        >
                          <img
                            src={imageFiles1[currentImageIndex1]}
                            alt={`Image ${currentImageIndex1}`}
                            style={{ width: '100%', height: 'auto' }}
                          />
                          <div
                            style={{ ...tooltipDefaultStyle, ...tooltipStyle }} // 合并样式
                            className="tooltip"
                          >
                            {tooltipContent}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={imageFiles1.length - 1}
                          value={currentImageIndex1}
                          onChange={this.handleSliderChange}
                          style={{ width: '100%' }}
                        />
                      </div>
                    ) : (
                      <div>正在加载图片...</div>
                    )}
                    {/* <div style={{ height: 60, width: 200, position: 'absolute', bottom: 20, left: 20 }}>
                      {labelValue !== null ? `标签值: ${labelValue}` : '点击获取标签'}
                    </div> */}
                    <div style={{ height: 60, width: 200, position: 'absolute', top: 20, right: 20 }}>
                      <Decoration1 style={{ width: '100%', height: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>
  
              {/* 右侧的部分 */}
              <div className="col-lg-3 fill-h" style={{ width: '25%'}}>
                <div className="xpanel-wrapper xpanel-wrapper-6" style={{ position: 'relative' }}>
                  <BorderBox1>
                  <div style={containerStyle}>
                    <div className="fill-h5">
                    <div className="content_title">
                      <p style={{ margin: 0, fontSize: "16px" }}>Total images Analysis:</p>
                      <p style={{ margin: 0, fontSize: "16px" }}>Mito_{labelValue}</p>
                    </div>
                      <table style={tableStyle}>
                        <thead>
                          <tr>
                            <th style={thStyle}>
                              Outer Membrane Surface <span style={{ fontSize: '10px' }}> (μm<sup>2</sup>)</span>
                            </th>
                            <th style={thStyle}>
                              Inner Cristae Surface <span style={{ fontSize: '10px' }}> (μm<sup>2</sup>)</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={tdStyle}>{isNaN(current_extralData_sum) ? '无数据' : (current_extralData_sum ).toFixed(3)} </td>
                            <td style={tdStyle}>{isNaN(current_insiderData_sum) ? '无数据' : (current_insiderData_sum ).toFixed(3)}</td>
                          </tr>
                        </tbody>
                          <tr>
                            <th style={thStyle}>
                            Solid Volume  <span style={{ fontSize: '10px' }}>  (μm<sup>3</sup>)</span>
                            </th>
                            <th style={thStyle}>
                            Total Volume <span style={{ fontSize: '10px' }}> (μm<sup>3</sup>)</span>
                            </th>
                          </tr>
                        <tbody>
                          <tr>
                            <td style={tdStyle}>{isNaN(volume) ? '无数据' : (volume).toFixed(3)} </td>
                            <td style={tdStyle}>{isNaN(volume_all) ? '无数据' : (volume_all).toFixed(3)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  </BorderBox1>
                </div>
              </div>
            </div>
  
            <div className="row fill-h0" style={{ display: 'flex' }}>
            </div>
  
            <div className="row fill-h1" style={{ display: 'flex' }}>
              <div className="col-lg-6 fill-h1_0" style={{ width: '50%' }}>
                <BorderBox8>
                  <div className="content_title" style={{ fontSize: '16px' }}>
                  Single Image Analysis:
                  </div>
                  <div className="xpanel2">
                    <div className="fill-h" id="mainMap2"></div>
                  </div>
                </BorderBox8>
              </div>
  
              <div className="col-lg-6 fill-h1_0" style={{ width: '50%' }}>
                <BorderBox8>
                <div className="content_title" style={{ fontSize: '16px' }}>
                  Total images Analysis:
                </div>
                  <div className="xpanel2">
                    <div className="fill-h" id="mainMap3"></div>
                  </div>
                </BorderBox8>
              </div>
            </div>
          </div>
        </div>
      </div>
    );   
  }
  }

  export default App;
