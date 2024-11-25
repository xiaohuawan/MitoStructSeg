import React, { Component } from 'react'
import * as echarts from 'echarts';
import geoJson from './map/china.json'
import { BorderBox1 ,BorderBox8 ,BorderBox13,Decoration1 ,ScrollBoard,ScrollRankingBoard } from '@jiaminghi/data-view-react'
import './index1.css'
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; 

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
    topdata: {},
    tabledata: {}
  };

  componentDidMount() {
    this.loadImages1();
    this.loadImages2();
    this.initializeCharts();
    window.onresize = this.handleResize;
  }

  // 线粒体健康/不健康pie图
  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentImageIndex1 !== this.state.currentImageIndex1 && this.state.imageFiles1.length > 0) {
      this.fetchDataAndUpdateChart();
    }
  }

// 获取轮播图和线粒体健康状况pie图
  fetchDataAndUpdateChart() {
    const { currentImageIndex1, imageFiles1 } = this.state;
    if (!imageFiles1 || imageFiles1.length === 0) return;
    
    const currentImagePath1 = imageFiles1[currentImageIndex1];
    console.log("****currentImagePath", currentImagePath1);
    
    // Normalize path separators (just in case)
    const normalizedPath = currentImagePath1.replace(/\\/g, '/');
    
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
              value: value === 0 ? 'healthy' : 'unhealthy'
          })),
          carousel: false, // 确保不启用轮播
          scrollSpeed: 0   // 设置滚动速度为 0
      };

      this.setState({ topdata });
      console.log("更新后的 topdata:", topdata);
}


  
  updateChart(cnt_all) {
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
        data: ['healthy', 'unhealthy'],
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 20,  // 调整图例项之间的距离
        padding: [0, -30, -30, -30],  // 调整图例与饼图之间的整体间距
        textStyle: {
          fontSize: 15,
          color: '#ffffff'
        }
      },
      series: [
        {
          name: 'health condition',
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
            { value: cnt_all[1], name: 'healthy' },
            { value: cnt_all[2], name: 'unhealthy' }
          ]
        }
      ]
    });
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


  loadImages1 = async () => {
    try {
      const response = await fetch('/free/class_predict/image_paths.json');
      if (!response.ok) throw new Error('Network response was not ok');
      
      const imagePaths1 = await response.json();
      this.setState({ imageFiles1: imagePaths1, currentImageIndex1: 0 }, () => {
        this.fetchDataAndUpdateChart(); // 初始化图表
      });
    } catch (error) {
      console.error('Error loading image paths:', error);
    }
  };
  loadImages2 = async () => {
    const svgElement = document.querySelector('svg[width="200px"][height="50px"]');

    // 如果找到，则删除该元素
    if (svgElement) {
        svgElement.remove();
    }
    try {
      const response = await fetch('/free/class_source/class_source.json');
      if (!response.ok) throw new Error('Network response was not ok');
      
      const imagePaths2 = await response.json();
      this.setState({ imageFiles2: imagePaths2, currentImageIndex2: 0 }, () => {
        // this.fetchDataAndUpdateChart(); // 初始化图表
      });
    } catch (error) {
      console.error('Error loading image paths:', error);
    }
  };

  initializeCharts = () => {
    this.fetchDataAndUpdateChart();

  };
    // ------------------------------------------------------------


  render() {

    const { imageFiles1, currentImageIndex1, topdata, tabledata, imageFiles2, currentImageIndex2 } = this.state;
  
    const currentImage1 = imageFiles1 && imageFiles1.length > 0 
        ? imageFiles1[currentImageIndex1] 
        : null;
    console.log('&&&&Current image:', currentImage1);

    const currentImage2 = imageFiles2 && imageFiles2.length > 0 
    ? imageFiles2[currentImageIndex2] 
    : null;
    console.log('&&&&Current image:', currentImage2);

    console.log("", topdata)


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
            <div className="row fill-h0" style={{ display: 'flex' }}>
            </div>
            <div className="row fill-h" style={{ display: 'flex' }}>
              {/* <div className="col-lg-3 fill-h" style={{ width: '25%' }}>
                <div className="xpanel-wrapper xpanel-wrapper-5">

                </div>
                <div className="xpanel-wrapper xpanel-wrapper-4">
                </div>
              </div> */}
              <div className="col-lg-2 fill-h" style={{ width: '13%' }}></div>
              <div className="col-lg-8 fill-h" style={{ width: '70%' }}>
                <div className="xpanel-wrapper xpanel-wrapper-5">
                  <div
                    className="xpanel"
                    style={{
                      position: 'relative'
                    }}
                  >
                    {currentImage1 ? (
                      <div className="class_images">
                        {/* <img src={currentImage} alt="当前显示" style={{ maxWidth: '100%', maxHeight: '500px' }} /> */}
                        <div>
                        <img
                              src={imageFiles2[currentImageIndex2]}
                              alt={`Image ${currentImageIndex2}`}
                              style={{ width: '100%', height: 'auto' }}
                            />

                        </div>
                      <div className="source_images">
                        <img
                              src={imageFiles1[currentImageIndex1]}
                              alt={`Image ${currentImageIndex1}`}
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
                      <div>loading...</div>
                    )}

                    <div
                      style={{
                        height: 60,
                        width: 200,
                        position: 'absolute',
                        top: 20,
                        right: 20
                      }}
                    >
                      <Decoration1 style={{ width: '100%', height: '100%' }} />
                    </div>

                    {/* <div className="fill-h" id="mainMap"></div> */}
                  </div>
                </div>
                <div
                  className="xpanel-wrapper xpanel-wrapper-4"
                  style={{ display: 'flex' }}
                >
                  <div
                    style={{
                      width: '50%',
                      paddingRight: 8,
                      position: 'relative'
                    }}
                  >
                  </div>
                  <div style={{ width: '50%', paddingLeft: 8 }}>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 fill-h" style={{ width: '30%' }}>
                <div
                  className="xpanel-wrapper xpanel-wrapper-6"
                  style={{ position: 'relative' }}
                >
                  <div className="content_title">mitochondrial condition proportion</div>
                  <BorderBox1>
                    <div className="xpanel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <div className="fill-h" id="provinceMap" style={{ width: '100%', maxWidth: '400px' }}></div>
                    </div>
                  </BorderBox1>
                </div>
              </div>
              <div className="col-lg-2 fill-h" style={{ width: '15%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  }

  export default App;


