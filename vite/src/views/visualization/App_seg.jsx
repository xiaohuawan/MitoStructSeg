import React, { Component } from 'react';
import * as echarts from 'echarts';
import geoJson from './map/china.json';
import { BorderBox1, BorderBox8, BorderBox13, Decoration1, ScrollBoard, ScrollRankingBoard } from '@jiaminghi/data-view-react';
import './index.css';
import { Button, InputNumber } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';


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
    imageFiles1: [],
    currentImageIndex1: 0,
    imageFiles2: [],
    currentImageIndex2: 0,
    imageFiles3: [],
    currentImageIndex3: 0,
    topdata: {},
    tabledata: {},
    userParameter: 2,
    isProcessing: false // 新增变量来控制按钮状态
  };

  componentDidMount() {
    this.loadImages1();
    this.loadImages2();
    this.loadImages3();
    this.initializeCharts();
    window.onresize = this.handleResize;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentImageIndex1 !== this.state.currentImageIndex1 ||
        prevState.currentImageIndex2 !== this.state.currentImageIndex2 ||
        prevState.currentImageIndex3 !== this.state.currentImageIndex3) {
      this.fetchDataAndUpdateChart();
    }
  }

  handleParameterChange = (value) => {
    this.setState({ userParameter: value });
  };

  fetchDataAndUpdateChart = () => {
    const { currentImageIndex1, imageFiles1 } = this.state;
    if (!imageFiles1 || imageFiles1.length === 0) return;
    
    const currentImagePath = imageFiles1[currentImageIndex1];
    console.log("****currentImagePath", currentImagePath);
    
    const normalizedPath = currentImagePath.replace(/\\/g, '/');
    const filenameWithExtension = normalizedPath.split('/').pop();
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
          
          this.updateTopData(class_all);
          this.updateChart(cnt_all); // 更新图表数据
        }
      })
      .catch(error => console.error('Error fetching data:', error));
  };

  updateTopData = (class_all) => {
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
  };

  updateChart = (cnt_all) => {
    const chart = echarts.init(document.getElementById('provinceMap'));
  
    chart.setOption({
      color: ['#9702fe', '#ff893b'],
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        top: 30,
        right: '20%',
        data: ['健康', '不健康'],
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 10,
        textStyle: {
          fontSize: 15,
          color: '#ffffff'
        }
      },
      series: [
        {
          name: '健康状况',
          type: 'pie',
          radius: ['50%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '30',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: cnt_all[1], name: '健康' },
            { value: cnt_all[2], name: '不健康' }
          ]
        }
      ]
    });
  };

  handleSliderChange = (event) => {
    const newIndex = parseInt(event.target.value, 10);
    this.setState({
      currentImageIndex1: newIndex,
      currentImageIndex2: newIndex,
      currentImageIndex3: newIndex,
    });
  };

  handleResize = () => {
    const { myChart1 } = this.state;
    if (myChart1) myChart1.resize();
  };

  loadImages1 = async () => {
    // const location = useLocation();
    // const { state } = location;
    // const processingTime = state?.processingTime || '';
    // console.log("*****************", processingTime)
    const svgElement = document.querySelector('svg[width="200px"][height="50px"]');
    if (svgElement) {
      svgElement.remove();
    }

    try {
      const response = await fetch('../free/seg/highlight_paths.json');
      if (!response.ok) throw new Error('Network response was not ok');

      const imagePaths1 = await response.json();
      this.setState({ imageFiles1: imagePaths1, currentImageIndex1: 0 });
    } catch (error) {
      console.error('Error loading image paths:', error);
    }
  };

  loadImages2 = async () => {
    try {
      const response = await fetch('../free/seg_source/source_paths.json');
      if (!response.ok) throw new Error('Network response was not ok');

      const imagePaths2 = await response.json();
      this.setState({ imageFiles2: imagePaths2, currentImageIndex2: 0 });
    } catch (error) {
      console.error('Error loading image paths:', error);
    }
  };

  loadImages3 = async () => {
    try {
      const response = await fetch('../free/postP/postP.json');
      if (!response.ok) throw new Error('Network response was not ok');

      const imagePaths3 = await response.json();
      this.setState({ imageFiles3: imagePaths3, currentImageIndex3: 0 }, () => {
        this.initializeCharts();
      });
    } catch (error) {
      console.error('Error loading image paths:', error);
    }
  };

  initializeCharts = () => {
    echarts.registerMap('zhongguo', geoJson);
    const dom = document.getElementById('provinceMap');
    if (dom) {
      const myChart = echarts.init(dom);
      this.setState({ myChart }, () => {
        this.fetchDataAndUpdateChart(); // 初始化完成后更新图表数据
      });
    } else {
      console.error('DOM element not found: provinceMap');
    }
  };

  handleRemoveSmallSpecks = () => {
    this.setState({ isProcessing: true }); // 设置为加载状态

    fetch('http://localhost:5000/process-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kernel_size: this.state.userParameter })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Image processing result:', data);
      // 调用 loadImages3 以刷新数据
      this.loadImages3();

      // 设置计时器来延迟5秒刷新界面
      setTimeout(() => {
        this.setState({
          isProcessing: false, // 恢复按钮状态
          currentImageIndex1: 0,
          currentImageIndex2: 0,
          currentImageIndex3: 0
        }, () => {
          this.loadImages1();
          this.loadImages2();
          window.location.reload(); // 强制刷新整个页面
        });
      }, 5000);
    })
    .catch(error => {
      console.error('Error:', error);
      this.setState({ isProcessing: false }); // 发生错误时恢复按钮状态
    });
  };

  render() {
    const { imageFiles1, imageFiles3, currentImageIndex1, currentImageIndex3, topdata, imageFiles2, currentImageIndex2, userParameter, isProcessing } = this.state;

    const currentImage1 = imageFiles1.length > 0 ? imageFiles1[currentImageIndex1] : null;
    const currentImage2 = imageFiles2.length > 0 ? imageFiles2[currentImageIndex2] : null;
    const currentImage3 = imageFiles3.length > 0 ? imageFiles3[currentImageIndex3] : null;

    return (
      <div className="data">
        <BackButton />
        <header className="header_main">
          <div className="left_bg"></div>
          <div className="right_bg"></div>
          <h3>Data Visualization</h3>
        </header>
        <div className="wrapper">
          <div className="container-fluid">
            <div className="row fill-h3" style={{ display: 'flex' }}>
              <div className="toolbar" style={{ width: '100%', padding: '10px 0', textAlign: 'center' }}>
                <InputNumber
                  min={2}  // 最小值为2
                  step={1} // 每次递增或递减1
                  max={8}
                  value={userParameter} // 绑定到state中的userParameter
                  onChange={this.handleParameterChange} // 绑定值变化的处理函数
                  style={{ margin: '0 10px' }}
                />
                <Button
                  type="primary"
                  style={{
                    margin: '0 10px',
                    backgroundColor: isProcessing ? 'blue' : '',
                    borderColor: isProcessing ? 'blue' : '',
                    color: isProcessing ? 'white' : ''
                  }}
                  onClick={this.handleRemoveSmallSpecks}
                  disabled={isProcessing}
                  loading={isProcessing}
                >
                  Morphological Opening
                </Button>
              </div>
            </div>
            <div className="row fill-h" style={{ display: 'flex' }}>
              <div className="col-lg-3 fill-h" style={{ width: '25%' }}>
                <div className="xpanel-wrapper xpanel-wrapper-5"></div>
                <div className="xpanel-wrapper xpanel-wrapper-4"></div>
              </div>
              <div className="col-lg-6 fill-h" style={{ width: '50%' }}>
                <div className="xpanel-wrapper xpanel-wrapper-5">
                  <div className="xpanel" style={{ position: 'relative' }}>
                    {currentImage1 ? (
                      <div className="class_images">
                        <div>
                          <img
                            src={currentImage2}
                            alt={`Image ${currentImageIndex2}`}
                            style={{ width: '100%', height: 'auto' }}
                          />
                        </div>
                        <div className="source_images">
                          <img
                            src={currentImage1}
                            alt={`Image ${currentImageIndex1}`}
                            style={{ width: '100%', height: 'auto' }}
                          />
                        </div>
                        <div className="postP_images">
                          <img
                            src={currentImage3}
                            alt={`Image ${currentImageIndex3}`}
                            style={{ width: '100%', height: 'auto' }}
                          />
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
                    <div style={{ height: 60, width: 200, position: 'absolute', top: 20, right: 20 }}>
                      <Decoration1 style={{ width: '100%', height: '100%' }} />
                    </div>
                    {/* <div className="fill-h" id="provinceMap"></div> */}
                  </div>
                </div>
                <div className="xpanel-wrapper xpanel-wrapper-4" style={{ display: 'flex' }}>
                  <div style={{ width: '50%', paddingRight: 8, position: 'relative' }}></div>
                  <div style={{ width: '50%', paddingLeft: 8 }}></div>
                </div>
              </div>
              <div className="col-lg-3 fill-h" style={{ width: '25%' }}>
                <div className="xpanel-wrapper xpanel-wrapper-6" style={{ position: 'relative' }}></div>
                <div className="xpanel-wrapper xpanel-wrapper-6" style={{ position: 'relative' }}></div>
                <div className="xpanel-wrapper xpanel-wrapper-4" style={{ position: 'relative' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
