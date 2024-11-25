// import { useEffect, useState } from 'react';

// // material-ui
// import Grid from '@mui/material/Grid';

// // project imports
// import EarningCard from './EarningCard';
// import PopularCard from './PopularCard';
// import TotalOrderLineChartCard from './TotalOrderLineChartCard';
// import TotalIncomeDarkCard from './TotalIncomeDarkCard';
// import TotalIncomeLightCard from './TotalIncomeLightCard';
// import TotalGrowthBarChart from './TotalGrowthBarChart';

// import { gridSpacing } from 'store/constant';

// // assets
// import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';

// // ==============================|| DEFAULT DASHBOARD ||============================== //

// const Dashboard = () => {
//   const [isLoading, setLoading] = useState(true);

//   useEffect(() => {
//     setLoading(false);
//   }, []);

//   return (
//     <Grid container spacing={gridSpacing}>
//       <Grid item xs={12}>
//         <Grid container spacing={gridSpacing}>
//           <Grid item lg={4} md={6} sm={6} xs={12}>
//             <EarningCard isLoading={isLoading} />
//           </Grid>
//           <Grid item lg={4} md={6} sm={6} xs={12}>
//             <TotalOrderLineChartCard isLoading={isLoading} />
//           </Grid>
//           <Grid item lg={4} md={12} sm={12} xs={12}>
//             <Grid container spacing={gridSpacing}>
//               <Grid item sm={6} xs={12} md={6} lg={12}>
//                 <TotalIncomeDarkCard isLoading={isLoading} />
//               </Grid>
//               <Grid item sm={6} xs={12} md={6} lg={12}>
//                 <TotalIncomeLightCard
//                   {...{
//                     isLoading: isLoading,
//                     total: 203,
//                     label: 'Total Income',
//                     icon: <StorefrontTwoToneIcon fontSize="inherit" />
//                   }}
//                 />
//               </Grid>
//             </Grid>
//           </Grid>
//         </Grid>
//       </Grid>
//       <Grid item xs={12}>
//         <Grid container spacing={gridSpacing}>
//           <Grid item xs={12} md={8}>
//             <TotalGrowthBarChart isLoading={isLoading} />
//           </Grid>
//           <Grid item xs={12} md={4}>
//             <PopularCard isLoading={isLoading} />
//           </Grid>
//         </Grid>
//       </Grid>
//     </Grid>
//   );
// };

// export default Dashboard;


// import { useState, useEffect, useRef } from 'react';
// import { makeStyles } from '@mui/styles';
// import TextField from '@mui/material/TextField';
// import Button from '@mui/material/Button';
// import Grid from '@mui/material/Grid';
// import EarningCard from './EarningCard';
// import PopularCard from './PopularCard';
// import TotalGrowthBarChart from './TotalGrowthBarChart';
// import { gridSpacing } from 'store/constant';

// const Dashboard = () => {
//   const [isLoading, setLoading] = useState(true);
//   const [selectedPath1, setSelectedPath1] = useState('');
//   const [selectedPath2, setSelectedPath2] = useState('');
//   const [isDragActive1, setDragActive1] = useState(false);
//   const [isDragActive2, setDragActive2] = useState(false);
//   const fileDropRef1 = useRef(null);
//   const fileDropRef2 = useRef(null);

//   useEffect(() => {
//     setLoading(false);
//   }, []);

//   const handleDragOver1 = (event) => {
//     event.preventDefault();
//     setDragActive1(true);
//   };

//   const handleDragLeave1 = () => {
//     setDragActive1(false);
//   };

//   const handleDrop1 = (event) => {
//     event.preventDefault();
//     setDragActive1(false);
//     const files = event.dataTransfer.files;
//     if (files.length > 0) {
//       const file = files[0];
//       setSelectedPath1(file.path || file.name); // Fallback to file name if path is not available
//     }
//   };

//   const handlePathChange1 = (event) => {
//     setSelectedPath1(event.target.value);
//   };

//   const handleDragOver2 = (event) => {
//     event.preventDefault();
//     setDragActive2(true);
//   };

//   const handleDragLeave2 = () => {
//     setDragActive2(false);
//   };

//   const handleDrop2 = (event) => {
//     event.preventDefault();
//     setDragActive2(false);
//     const files = event.dataTransfer.files;
//     if (files.length > 0) {
//       const file = files[0];
//       setSelectedPath2(file.path || file.name); // Fallback to file name if path is not available
//     }
//   };

//   const handlePathChange2 = (event) => {
//     setSelectedPath2(event.target.value);
//   };

//   return (
//     <Grid container spacing={gridSpacing}>
//       {/* <Grid item xs={12}>
//         <EarningCard isLoading={isLoading} />
//       </Grid> */}
//       <Grid item xs={12} md={6}>
//         <div
//           ref={fileDropRef1}
//           onDrop={handleDrop1}
//           onDragOver={handleDragOver1}
//           onDragLeave={handleDragLeave1}
//           style={{ border: isDragActive1 ? '2px dashed #000' : 'none', textAlign: 'center', padding: 20, marginBottom: 20 }}
//         >
//           <TextField
//             label="Path or File 1"
//             variant="outlined"
//             fullWidth
//             value={selectedPath1}
//             onChange={handlePathChange1}
//           />
//           <div style={{ marginTop: 10 }}>
//             Drag and drop a file or folder here 
//           </div>
//         </div>
//       </Grid>
//       <Grid item xs={12} md={6}>
//         <div
//           ref={fileDropRef2}
//           onDrop={handleDrop2}
//           onDragOver={handleDragOver2}
//           onDragLeave={handleDragLeave2}
//           style={{ border: isDragActive2 ? '2px dashed #000' : 'none', textAlign: 'center', padding: 20, marginBottom: 20 }}
//         >
//           <TextField
//             label="Path or File 2"
//             variant="outlined"
//             fullWidth
//             value={selectedPath2}
//             onChange={handlePathChange2}
//           />
//           <div style={{ marginTop: 10 }}>
//             Drag and drop a file or folder here 
//           </div>
//         </div>
//       </Grid>
//       <Grid item xs={12} md={8}>
//         <TotalGrowthBarChart isLoading={isLoading} />
//       </Grid>
//       <Grid item xs={12} md={4}>
//         <PopularCard isLoading={isLoading} />
//       </Grid>
//     </Grid>
//   );
// };

// export default Dashboard;



// import React, { useState, useEffect, useRef } from 'react';
// import TextField from '@mui/material/TextField';
// import Grid from '@mui/material/Grid';
// import IconButton from '@mui/material/IconButton';
// import CloseIcon from '@mui/icons-material/Close';
// import Slider from 'react-slick';
// import TotalGrowthBarChart from './TotalGrowthBarChart';
// import PopularCard from './PopularCard';
// import { gridSpacing } from 'store/constant';
// import { fromUrl } from 'geotiff';

// const Dashboard = () => {
//   const [isLoading, setLoading] = useState(true);
//   const [selectedFiles1, setSelectedFiles1] = useState([]);
//   const [fileNames1, setFileNames1] = useState([]);
//   const [selectedFiles2, setSelectedFiles2] = useState([]);
//   const [fileNames2, setFileNames2] = useState([]);
//   const [isDragActive1, setDragActive1] = useState(false);
//   const [isDragActive2, setDragActive2] = useState(false);
//   const fileDropRef1 = useRef(null);
//   const fileDropRef2 = useRef(null);

//   useEffect(() => {
//     setLoading(false);
//   }, []);

//   const handleDragOver = (event, setDragActive) => {
//     event.preventDefault();
//     setDragActive(true);
//   };

//   const handleDragLeave = (setDragActive) => {
//     setDragActive(false);
//   };

//   const handleDrop = async (event, setSelectedFiles, setFileNames, setDragActive, fileTypes) => {
//     event.preventDefault();
//     setDragActive(false);
//     const files = event.dataTransfer.files;
//     const validFiles = Array.from(files).filter((file) =>
//       fileTypes.includes(file.type) || fileTypes.some((type) => file.name.endsWith(type))
//     );

//     const newFileData = await Promise.all(
//       validFiles.map(async (file) => {
//         if (file.type === 'image/tiff' || file.name.endsWith('.tif')) {
//           const tiff = await fromUrl(URL.createObjectURL(file));
//           const image = await tiff.getImage();
//           const width = image.getWidth();
//           const height = image.getHeight();
//           const canvas = document.createElement('canvas');
//           canvas.width = width;
//           canvas.height = height;
//           const ctx = canvas.getContext('2d');
//           const data = await image.readRasters();
//           const imageData = new ImageData(new Uint8ClampedArray(data[0]), width, height);
//           ctx.putImageData(imageData, 0, 0);
//           return { src: canvas.toDataURL(), name: file.name };
//         } else {
//           return { src: URL.createObjectURL(file), name: file.name };
//         }
//       })
//     );

//     setSelectedFiles((prevFiles) => [...prevFiles, ...newFileData.map((file) => file.src)]);
//     setFileNames((prevNames) => [...prevNames, ...newFileData.map((file) => file.name)]);
//   };

//   const handleRemoveFile = (selectedFiles, setSelectedFiles, fileNames, setFileNames, index) => {
//     setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
//     setFileNames((prevNames) => prevNames.filter((_, i) => i !== index));
//   };

//   const sliderSettings = {
//     dots: true,
//     infinite: true,
//     speed: 500,
//     slidesToShow: 2,
//     slidesToScroll: 2
//   };

//   return (
    // <Grid container spacing={gridSpacing}>
      // <Grid item xs={12} md={6}>
      //   <div
      //     ref={fileDropRef1}
      //     onDrop={(event) => handleDrop(event, setSelectedFiles1, setFileNames1, setDragActive1, ['image/png', 'image/tiff'])}
      //     onDragOver={(event) => handleDragOver(event, setDragActive1)}
      //     onDragLeave={() => handleDragLeave(setDragActive1)}
      //     style={{ border: isDragActive1 ? '2px dashed #000' : '2px dashed transparent', textAlign: 'center', padding: 20, marginBottom: 20 }}
      //   >
      //     <TextField
      //       label="拖放PNG或TIF图片"
      //       variant="outlined"
      //       fullWidth
      //       value={fileNames1.join(', ')}
      //       disabled
      //     />
      //     <div style={{ marginTop: 10 }}>
      //       拖放图片到这里
      //     </div>
      //     <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 }}>
      //       {selectedFiles1.length > 3 ? (
      //         <Slider {...sliderSettings}>
      //           {selectedFiles1.map((file, index) => (
      //             <div key={index} style={{ position: 'relative', margin: 10 }}>
      //               <img src={file} alt={`Selected File ${index + 1}`} style={{ maxWidth: 100, maxHeight: 100 }} />
      //               <div>{fileNames1[index]}</div>
      //               <IconButton
      //                 style={{ position: 'absolute', top: 0, right: 0 }}
      //                 onClick={() => handleRemoveFile(selectedFiles1, setSelectedFiles1, fileNames1, setFileNames1, index)}
      //               >
      //                 <CloseIcon style={{ color: 'red' }} />
      //               </IconButton>
      //             </div>
      //           ))}
      //         </Slider>
      //       ) : (
      //         selectedFiles1.map((file, index) => (
      //           <div key={index} style={{ position: 'relative', margin: 10 }}>
      //             <img src={file} alt={`Selected File ${index + 1}`} style={{ maxWidth: 100, maxHeight: 100 }} />
      //             <div>{fileNames1[index]}</div>
      //             <IconButton
      //               style={{ position: 'absolute', top: 0, right: 0 }}
      //               onClick={() => handleRemoveFile(selectedFiles1, setSelectedFiles1, fileNames1, setFileNames1, index)}
      //             >
      //               <CloseIcon style={{ color: 'red' }} />
      //             </IconButton>
      //           </div>
      //         ))
      //       )}
      //     </div>
      //   </div>
      // </Grid>
//       <Grid item xs={12} md={6}>
//         <div
//           ref={fileDropRef2}
//           onDrop={(event) => handleDrop(event, setSelectedFiles2, setFileNames2, setDragActive2, ['application/octet-stream'])}
//           onDragOver={(event) => handleDragOver(event, setDragActive2)}
//           onDragLeave={() => handleDragLeave(setDragActive2)}
//           style={{ border: isDragActive2 ? '2px dashed #000' : '2px dashed transparent', textAlign: 'center', padding: 20, marginBottom: 20 }}
//         >
//           <TextField
//             label="拖放PT或CKPT文件"
//             variant="outlined"
//             fullWidth
//             value={fileNames2.join(', ')}
//             disabled
//           />
//           <div style={{ marginTop: 10 }}>
//             拖放文件到这里
//           </div>
          // <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 }}>
          //   {selectedFiles2.map((file, index) => (
          //     <div key={index} style={{ position: 'relative', margin: 10 }}>
          //       <div>{file}</div>
          //       <div>{fileNames2[index]}</div>
          //       <IconButton
          //         style={{ position: 'absolute', top: 0, right: 0 }}
          //         onClick={() => handleRemoveFile(selectedFiles2, setSelectedFiles2, fileNames2, setFileNames2, index)}
          //       >
          //         <CloseIcon style={{ color: 'red' }} />
          //       </IconButton>
          //     </div>
          //   ))}
          // </div>
//         </div>
//       </Grid>
//     </Grid>
//   );
// };

// export default Dashboard;





// *******************
// *******************
// *******************
// 前端没有问题

// import React, { useState, useEffect, useRef } from 'react';
// import TextField from '@mui/material/TextField';
// import Grid from '@mui/material/Grid';
// import IconButton from '@mui/material/IconButton';
// import CloseIcon from '@mui/icons-material/Close';
// import Slider from 'react-slick';
// import TotalGrowthBarChart from './TotalGrowthBarChart';
// import PopularCard from './PopularCard';
// import { gridSpacing } from 'store/constant';
// import Button from '@mui/material/Button'; 
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// const Dashboard = () => {
//   const [isLoading, setLoading] = useState(true);

//   const [selectedFiles1, setSelectedFiles1] = useState([]);
//   const [fileNames1, setFileNames1] = useState([]);
//   const [selectedFiles2, setSelectedFiles2] = useState([]);
//   const [fileNames2, setFileNames2] = useState([]);
//   const [isDragActive1, setDragActive1] = useState(false);
//   const [isDragActive2, setDragActive2] = useState(false);
//   const fileDropRef1 = useRef(null);
//   const fileDropRef2 = useRef(null);

//   useEffect(() => {
//     setLoading(false);
//   }, []);

//   const handleDragOver = (event, ref, setDragActive) => {
//     event.preventDefault();
//     setDragActive(true);
//   };

//   const handleDragLeave = (setDragActive) => {
//     setDragActive(false);
//   };

//   const handleDrop = (event, setSelectedFiles, setDragActive, fileTypes) => {
//     event.preventDefault();
//     setDragActive(false);
//     const files = event.dataTransfer.files;
//     const validFiles = Array.from(files).filter((file) =>
//       fileTypes.includes(file.type) || fileTypes.some((type) => file.name.endsWith(type))
//     );
//     setSelectedFiles((prevFiles) => [
//       ...prevFiles,
//       ...validFiles.map((file) => URL.createObjectURL(file))
//     ]);
//   };

//   const handleRemoveFile = (selectedFiles, setSelectedFiles, index) => {
//     setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
//   };

//   const handleButtonClick = () => {
//     alert('Button clicked!');
//   };

//   const sliderSettings = {
//     dots: true,
//     infinite: false,
//     speed: 500,
//     slidesToShow: 2,
//     slidesToScroll: 2,
//   };

//   return (
//     <Grid container spacing={gridSpacing}>
//       <Grid item xs={12} md={6}>
//         <div
//           ref={fileDropRef1}
//           onDrop={(event) => handleDrop(event, setSelectedFiles1, setDragActive1, ['image/png', 'image/tiff'])}
//           onDragOver={(event) => handleDragOver(event, fileDropRef1, setDragActive1)}
//           onDragLeave={() => handleDragLeave(setDragActive1)}
//           style={{ border: isDragActive1 ? '2px dashed #000' : 'none', textAlign: 'center', padding: 20, marginBottom: 20 }}
//         >
//           <TextField
//             label="拖放PNG或TIF图片"
//             variant="outlined"
//             fullWidth
//             value={fileNames1.join(', ')}
//             disabled
//           />
//           <div style={{ marginTop: 10 }}>
//             拖放图片到这里
//           </div>
//           {selectedFiles1.length > 2 ? (
//             <Slider {...sliderSettings}>
//               {selectedFiles1.map((file, index) => (
//                 <div key={index} style={{ position: 'relative', margin: 10 }}>
//                   <img src={file} alt={`Selected File ${index + 1}`} style={{ maxWidth: 100, maxHeight: 100 }} />
//                   <IconButton
//                     style={{ position: 'absolute', top: 0, right: 0 }}
//                     onClick={() => handleRemoveFile(selectedFiles1, setSelectedFiles1, index)}
//                   >
//                     <CloseIcon style={{ color: 'purple' }} />
//                   </IconButton>
//                 </div>
//               ))}
//             </Slider>
//           ) : (
//             <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 10 }}>
//               {selectedFiles1.map((file, index) => (
//                 <div key={index} style={{ position: 'relative', margin: 10 }}>
//                   <img src={file} alt={`Selected File ${index + 1}`} style={{ maxWidth: 100, maxHeight: 100 }} />
//                   <IconButton
//                     style={{ position: 'absolute', top: 0, right: 0 }}
//                     onClick={() => handleRemoveFile(selectedFiles1, setSelectedFiles1, index)}
//                   >
//                     <CloseIcon style={{ color: 'purple' }} />
//                   </IconButton>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </Grid>
//       <Grid item xs={12} md={6}>
//         <div
//           ref={fileDropRef2}
//           onDrop={(event) => handleDrop(event, setSelectedFiles2, setDragActive2, ['.pt', '.ckpt'])}
//           onDragOver={(event) => handleDragOver(event, fileDropRef2, setDragActive2)}
//           onDragLeave={() => handleDragLeave(setDragActive2)}
//           style={{ border: isDragActive2 ? '2px dashed #000' : 'none', textAlign: 'center', padding: 20, marginBottom: 20 }}
//         >
//           <TextField
//             label="拖放PT或CKPT文件"
//             variant="outlined"
//             fullWidth
//             value={fileNames2.join(', ')}
//             disabled
//           />
//           <div style={{ marginTop: 10 }}>
//             拖放文件到这里
//           </div>
//           <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 10 }}>
//             {selectedFiles2.map((file, index) => (
//               <div key={index} style={{ position: 'relative', margin: 10 }}>
//                 <div>{file}</div>
//                 <IconButton
//                   style={{ position: 'absolute', top: 0, right: 0 }}
//                   onClick={() => handleRemoveFile(selectedFiles2, setSelectedFiles2, index)}
//                 >
//                   <CloseIcon style={{ color: 'purple' }} />
//                 </IconButton>
//               </div>
//             ))}
//           </div>
//         </div>
//       </Grid>
//       <Grid item xs={12} style={{ marginTop: 'auto', textAlign: 'center', padding: 20 }}>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={handleButtonClick}
//         >
//           Run
//         </Button>
//       </Grid>
//     </Grid>
//   );
// };

// export default Dashboard;





// ***************
// ***************
// ***************
// import React, { useState, useEffect, useRef } from 'react';
// import TextField from '@mui/material/TextField';
// import Grid from '@mui/material/Grid';
// import IconButton from '@mui/material/IconButton';
// import CloseIcon from '@mui/icons-material/Close';
// import Slider from 'react-slick';
// import Button from '@mui/material/Button';
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import axios from 'axios';

// const Dashboard = () => {
//   const [selectedFiles1, setSelectedFiles1] = useState([]);
//   const [selectedFiles2, setSelectedFiles2] = useState([]);
//   const [fileNames1, setFileNames1] = useState([]);
//   const [fileNames2, setFileNames2] = useState([]);
//   const [isDragActive1, setDragActive1] = useState(false);
//   const [isDragActive2, setDragActive2] = useState(false);
//   const fileDropRef1 = useRef(null);
//   const fileDropRef2 = useRef(null);
//   const [uploadResult, setUploadResult] = useState(null);

//   useEffect(() => {
//     // Optionally handle loading state
//   }, []);

//   const handleDragOver = (event, ref, setDragActive) => {
//     event.preventDefault();
//     setDragActive(true);
//   };

//   const handleDragLeave = (setDragActive) => {
//     setDragActive(false);
//   };

//   const handleDrop = (event, setSelectedFiles, setFileNames, fileTypes) => {
//     event.preventDefault();
//     const files = event.dataTransfer.files;
//     const validFiles = Array.from(files).filter((file) =>
//       fileTypes.includes(file.type) || fileTypes.some((type) => file.name.endsWith(type))
//     );
//     setSelectedFiles((prevFiles) => [
//       ...prevFiles,
//       ...validFiles
//     ]);
//     setFileNames((prevFileNames) => [
//       ...prevFileNames,
//       ...validFiles.map((file) => file.name)
//     ]);
//   };
  

//   const handleRemoveFile = (selectedFiles, setSelectedFiles, setFileNames, index) => {
//     setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
//     setFileNames((prevFileNames) => prevFileNames.filter((_, i) => i !== index));
//   };

//   const sliderSettings = {
//     dots: true,
//     infinite: false,
//     speed: 500,
//     slidesToShow: 2,
//     slidesToScroll: 2,
//   };

//   // const handleSubmit = async () => {
//   //   const formData = new FormData();
  
//   //   selectedFiles1.forEach((file) => {
//   //     formData.append('images', file);
//   //   });
  
//   //   if (selectedFiles2.length > 0) {
//   //     formData.append('model', selectedFiles2[0]);
//   //   }
  
//   //   try {
//   //     const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
//   //       headers: {
//   //         'Content-Type': 'multipart/form-data'
//   //       }
//   //     });
//   //     console.log('Response:', response.data);
//   //   } catch (error) {
//   //     console.error('Error uploading files:', error);
//   //     if (error.response) {
//   //       console.error('Response error data:', error.response.data);
//   //       console.error('Response error status:', error.response.status);
//   //       console.error('Response error headers:', error.response.headers);
//   //     } else if (error.request) {
//   //       console.error('Request error:', error.request);
//   //     } else {
//   //       console.error('Error message:', error.message);
//   //     }
//   //     console.error('Error config:', error.config);
//   //   }
//   // };

//   const handleSubmit = async () => {
//     const formData = new FormData();
//     selectedFiles1.forEach((file) => {
//       formData.append('images', file);
//     });
//     if (selectedFiles2.length > 0) {
//       formData.append('model', selectedFiles2[0]);
//     }
  
//     try {
//       const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
  
//       // 将响应的 result 内容设置到状态中
//       setUploadResult(response.data.result);
//       setError(null);
//     } catch (err) {
//       console.error('Error uploading files:', err);
//       setError('Error uploading files. Please try again.');
//       setUploadResult(null);
//     }
//   };
  
//   return (
//     <Grid container spacing={2}>
//       <Grid item xs={12} md={6}>
//         <div
//           ref={fileDropRef1}
//           onDrop={(event) => handleDrop(event, setSelectedFiles1, setFileNames1, ['image/png', 'image/tiff'])}
//           onDragOver={(event) => handleDragOver(event, fileDropRef1, setDragActive1)}
//           onDragLeave={() => handleDragLeave(setDragActive1)}
//           style={{ border: isDragActive1 ? '2px dashed #000' : 'none', textAlign: 'center', padding: 20, marginBottom: 20 }}
//         >
//           <TextField
//             label="拖放PNG或TIF图片"
//             variant="outlined"
//             fullWidth
//             value={fileNames1.join(', ')}
//             disabled
//           />
//           <div style={{ marginTop: 10 }}>
//             拖放图片到这里
//           </div>
//           {selectedFiles1.length > 2 ? (
//             <Slider {...sliderSettings}>
//               {selectedFiles1.map((file, index) => (
//                 <div key={index} style={{ position: 'relative', margin: 10 }}>
//                   <img src={URL.createObjectURL(file)} alt={`Selected File ${index + 1}`} style={{ maxWidth: 100, maxHeight: 100 }} />
//                   <IconButton
//                     style={{ position: 'absolute', top: 0, right: 0 }}
//                     onClick={() => handleRemoveFile(selectedFiles1, setSelectedFiles1, setFileNames1, index)}
//                   >
//                     <CloseIcon style={{ color: 'purple' }} />
//                   </IconButton>
//                 </div>
//               ))}
//             </Slider>
//           ) : (
//             <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 10 }}>
//               {selectedFiles1.map((file, index) => (
//                 <div key={index} style={{ position: 'relative', margin: 10 }}>
//                   <img src={URL.createObjectURL(file)} alt={`Selected File ${index + 1}`} style={{ maxWidth: 100, maxHeight: 100 }} />
//                   <IconButton
//                     style={{ position: 'absolute', top: 0, right: 0 }}
//                     onClick={() => handleRemoveFile(selectedFiles1, setSelectedFiles1, setFileNames1, index)}
//                   >
//                     <CloseIcon style={{ color: 'purple' }} />
//                   </IconButton>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </Grid>
//       <Grid item xs={12} md={6}>
//         <div
//           ref={fileDropRef2}
//           onDrop={(event) => handleDrop(event, setSelectedFiles2, setFileNames2, ['.pt', '.ckpt'])}
//           onDragOver={(event) => handleDragOver(event, fileDropRef2, setDragActive2)}
//           onDragLeave={() => handleDragLeave(setDragActive2)}
//           style={{ border: isDragActive2 ? '2px dashed #000' : 'none', textAlign: 'center', padding: 20, marginBottom: 20 }}
//         >
//           <TextField
//             label="拖放模型文件（.pt 或 .ckpt）"
//             variant="outlined"
//             fullWidth
//             value={fileNames2.join(', ')}
//             disabled
//           />
//           <div style={{ marginTop: 10 }}>
//             拖放模型文件到这里
//           </div>
//           {selectedFiles2.map((file, index) => (
//             <div key={index} style={{ position: 'relative', margin: 10 }}>
//               <span>{file.name}</span>
//               <IconButton
//                 style={{ position: 'absolute', top: 0, right: 0 }}
//                 onClick={() => handleRemoveFile(selectedFiles2, setSelectedFiles2, setFileNames2, index)}
//               >
//                 <CloseIcon style={{ color: 'purple' }} />
//               </IconButton>
//             </div>
//           ))}
//         </div>
//       </Grid>
//       <Grid item xs={12} style={{ marginTop: 'auto', textAlign: 'center', padding: 20 }}>
//       <Button variant="contained" onClick={handleSubmit}>
//         提交
//       </Button>
//     </Grid>
    
//     <Grid item xs={12} style={{ marginTop: 20, textAlign: 'center' }}>
//       {uploadResult && (
//         <div>
//           {uploadResult.error ? (
//             <div style={{ color: 'red' }}>{uploadResult.error}</div>
//           ) : (
//             <div>
//               <h3>上传结果:</h3>
//               <pre>{uploadResult.Result}</pre>
//             </div>
//           )}
//         </div>
//       )}
//     </Grid>
//   </Grid>
// );
// };

// export default Dashboard;



import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Pagination,
  LinearProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import { TIFFViewer } from 'react-tiff';
import 'react-tiff/dist/index.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [selectedFiles1, setSelectedFiles1] = useState([]);
  const [selectedFiles2, setSelectedFiles2] = useState([]);
  const [fileNames1, setFileNames1] = useState([]);
  const [fileNames2, setFileNames2] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 2;
  const [isDragActive1, setDragActive1] = useState(false);
  const [isDragActive2, setDragActive2] = useState(false);
  const [tiffDataUrls, setTiffDataUrls] = useState({});
  const fileDropRef1 = useRef(null);
  const fileDropRef2 = useRef(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Add state for progress
  const navigate = useNavigate();

  const handleDragOver = (event, setDragActive) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (setDragActive) => {
    setDragActive(false);
  };

  const handleDrop = (event, setSelectedFiles, setFileNames, fileTypes, setDragActive) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    const validFiles = Array.from(files).filter((file) =>
      fileTypes.includes(file.type) || fileTypes.some((type) => file.name.endsWith(type))
    );
    setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles]);
    setFileNames((prevFileNames) => [...prevFileNames, ...validFiles.map((file) => file.name)]);
    setDragActive(false);
  };

  const handleFileInput = (event, setSelectedFiles, setFileNames, fileTypes) => {
    const files = event.target.files;
    const validFiles = Array.from(files).filter((file) =>
      fileTypes.includes(file.type) || fileTypes.some((type) => file.name.endsWith(type))
    );
    setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles]);
    setFileNames((prevFileNames) => [...prevFileNames, ...validFiles.map((file) => file.name)]);
  };

  const handleRemoveFile = (setSelectedFiles, setFileNames, index, fileArray) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setFileNames((prevFileNames) => prevFileNames.filter((_, i) => i !== index));
    setTiffDataUrls((prevUrls) => {
      const newUrls = { ...prevUrls };
      delete newUrls[fileArray[index].name];
      return newUrls;
    });
    
    // 如果删除的是最后一页的最后一个图片，减少当前页码
    if ((currentPage - 1) * filesPerPage >= fileArray.length - 1) {
      setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    }
  };
  const handleSubmit = async () => {
    setLoading(true);
    setUploadProgress(0); // Reset progress
    const formData = new FormData();
    selectedFiles1.forEach((file) => {
      formData.append('images', file);
    });
    if (selectedFiles2.length > 0) {
      formData.append('model', selectedFiles2[0]);
    }
  
    try {
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted); // Update progress
        }
      });
  
      const imagePaths = response.data.result.map(res => res.image);
      // 存储图像路径到状态中
      setUploadResult(imagePaths);
      setError(null);
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Error uploading files. Please try again.');
      setUploadResult(null);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    const newTiffDataUrls = {};
    selectedFiles1.forEach((file) => {
      if (file.type === 'image/tiff' || file.name.endsWith('.tif')) {
        const reader = new FileReader();
        reader.onload = () => {
          newTiffDataUrls[file.name] = reader.result;
          setTiffDataUrls((prevUrls) => ({ ...prevUrls, ...newTiffDataUrls }));
        };
        reader.readAsDataURL(file);
      }
    });
  }, [selectedFiles1]);

  const renderPreview = (file) => {
    if (file.type === 'image/tiff' || file.name.endsWith('.tif')) {
      return tiffDataUrls[file.name] ? (
        <div
          key={file.name}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '200px',
            height: '200px',
            overflow: 'hidden',
          }}
        >
          <TIFFViewer tiff={tiffDataUrls[file.name]} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      ) : (
        <CircularProgress key={file.name} />
      );
    } else {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={`Selected File ${file.name}`}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            display: 'block',
            margin: '10px auto',
          }}
          key={file.name}
        />
      );
    }
  };


  const renderUploadResult = () => {
    if (Array.isArray(uploadResult)) {
      return (
        <Box>
          {uploadResult.map((result, index) => (
            <Box key={index} mb={2}>
              <Typography variant="h6">Result {index + 1}</Typography>
              <Typography variant="body2">{result.result}</Typography>
              <img src={`data:image/png;base64,${result.image}`} alt={`Result ${index + 1}`} />
            </Box>
          ))}
        </Box>
      );
    }
    return <Typography variant="body2">{uploadResult}</Typography>;
  };

  const currentFiles = selectedFiles1.slice(
    (currentPage - 1) * filesPerPage,
    currentPage * filesPerPage
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
      File Upload and Preview
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper
            ref={fileDropRef1}
            onDrop={(event) => handleDrop(event, setSelectedFiles1, setFileNames1, ['image/png', 'image/tiff'], setDragActive1)}
            onDragOver={(event) => handleDragOver(event, setDragActive1)}
            onDragLeave={() => handleDragLeave(setDragActive1)}
            sx={{
              border: isDragActive1 ? '2px dashed #3f51b5' : 'none',
              padding: 2,
              textAlign: 'center',
              backgroundColor: isDragActive1 ? '#f0f0f0' : '#fafafa',
              marginBottom: 2
            }}
          >
            <TextField
              label="拖放PNG或TIF图片"
              variant="outlined"
              fullWidth
              value={fileNames1.join(', ')}
              disabled
              InputProps={{
                endAdornment: (
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{ padding: '4px 14px', fontSize: '0.875rem' }}
                  >
                    选择
                    <input
                      type="file"
                      hidden
                      multiple
                      accept=".png,.jpg,.jpeg,.tif,.tiff"
                      onChange={(event) => handleFileInput(event, setSelectedFiles1, setFileNames1, ['image/png', 'image/tiff'])}
                    />
                  </Button>
                ),
              }}
            />
            <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
              拖放图片到这里
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: 2 }}>
              {currentFiles.map((file, index) => (
                <Box key={index} sx={{ position: 'relative', margin: 1 }}>
                  {renderPreview(file)}
                  <IconButton
                    sx={{ position: 'absolute', top: 0, right: 0 }}
                    onClick={() => handleRemoveFile(setSelectedFiles1, setFileNames1, (currentPage - 1) * filesPerPage + index, selectedFiles1)}
                  >
                    <CloseIcon style={{ color: 'red' }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
            <Grid item xs={12}>
              {selectedFiles1.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                  <Pagination
                    count={Math.ceil(selectedFiles1.length / 2)} // 计算分页数量
                    page={currentPage}
                    onChange={handlePageChange}
                    sx={{ display: 'flex', justifyContent: 'center' }}
                  />
                </Box>
              )}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            ref={fileDropRef2}
            onDrop={(event) => handleDrop(event, setSelectedFiles2, setFileNames2, ['.ckpt'], setDragActive2)}
            onDragOver={(event) => handleDragOver(event, setDragActive2)}
            onDragLeave={() => handleDragLeave(setDragActive2)}
            sx={{
              border: isDragActive2 ? '2px dashed #3f51b5' : 'none',
              padding: 2,
              textAlign: 'center',
              backgroundColor: isDragActive2 ? '#f0f0f0' : '#fafafa',
              marginBottom: 2
            }}
          >
            <TextField
              label="拖放模型文件"
              variant="outlined"
              fullWidth
              value={fileNames2.join(', ')}
              disabled
              InputProps={{
                endAdornment: (
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{ padding: '4px 14px', fontSize: '0.875rem' }}
                  >
                    选择
                    <input
                      type="file"
                      hidden
                      accept=".pt,.ckpt"
                      onChange={(event) => handleFileInput(event, setSelectedFiles2, setFileNames2, ['.pt', '.ckpt'])}
                    />
                  </Button>
                ),
              }}
            />
            <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
              拖放模型文件到这里
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: 2 }}>
              {selectedFiles2.map((file, index) => (
                <Box key={index} sx={{ position: 'relative', margin: 1 }}>
                  <Paper
                    variant="outlined"
                    sx={{ padding: 1, display: 'flex', alignItems: 'center', position: 'relative' }}
                  >
                    <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </Typography>
                    <IconButton
                      sx={{ position: 'absolute', top: 0, right: 0 }}
                      onClick={() => handleRemoveFile(setSelectedFiles2, setFileNames2, index, selectedFiles2)}
                    >
                      <CloseIcon style={{ color: 'red' }} />
                    </IconButton>
                  </Paper>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexDirection: 'column', alignItems: 'center' }}>
            {loading && !error && (
              <Box sx={{ width: '100%', maxWidth: 600 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" sx={{ textAlign: 'center', marginTop: 1 }}>
                  Upload Progress: {uploadProgress}%
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={24} /> : <CloudUploadIcon />}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? '处理中...' : 'Run'}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  navigate('/visualizationCla', { state: { imagePaths: uploadResult } });
                }}
                sx={{ padding: '8px 26px', fontSize: '0.875rem' }}
              >
                Data
              </Button>
            </Box>
          </Box>
        </Grid>
        {uploadResult && (
          <Grid container justifyContent="center" alignItems="center" style={{ height: '30vh' }}>
            <Grid item xs={12}>
              <Paper sx={{ padding: 2, marginTop: 2, textAlign: 'center' }}>
                <Typography
                  variant="h3"
                  gutterBottom
                  sx={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#01c4f7',
                  }}
                >
                  已完成线粒体分割, 点击data按钮查看分割数据
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
        {error && (
          <Grid item xs={12}>
            <Typography variant="body2" color="error" gutterBottom>
              {error}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;

// import React, { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Box,
//   Button,
//   Container,
//   Grid,
//   IconButton,
//   Paper,
//   TextField,
//   Typography,
//   CircularProgress,
//   Pagination,
//   LinearProgress
// } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// import axios from 'axios';
// import { TIFFViewer } from 'react-tiff';
// import 'react-tiff/dist/index.css';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';
// import { Link } from 'react-router-dom';
// import { v4 as uuidv4 } from 'uuid'; 

// const Dashboard = () => {
//   const [selectedFiles1, setSelectedFiles1] = useState([]);
//   const [selectedFiles2, setSelectedFiles2] = useState([]);
//   const [fileNames1, setFileNames1] = useState([]);
//   const [fileNames2, setFileNames2] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const filesPerPage = 2;
//   const [isDragActive1, setDragActive1] = useState(false);
//   const [isDragActive2, setDragActive2] = useState(false);
//   const [tiffDataUrls, setTiffDataUrls] = useState({});
//   const fileDropRef1 = useRef(null);
//   const fileDropRef2 = useRef(null);
//   const [uploadResult, setUploadResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [taskId, setTaskId] = useState(null);
//   const navigate = useNavigate();

//   const handleDragOver = (event, setDragActive) => {
//     event.preventDefault();
//     setDragActive(true);
//   };

//   const handleDragLeave = (setDragActive) => {
//     setDragActive(false);
//   };

//   const handleDrop = (event, setSelectedFiles, setFileNames, fileTypes, setDragActive) => {
//     event.preventDefault();
//     const files = event.dataTransfer.files;
//     const validFiles = Array.from(files).filter((file) =>
//       fileTypes.includes(file.type) || fileTypes.some((type) => file.name.endsWith(type))
//     );
//     setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles]);
//     setFileNames((prevFileNames) => [...prevFileNames, ...validFiles.map((file) => file.name)]);
//     setDragActive(false);
//   };

//   const handleFileInput = (event, setSelectedFiles, setFileNames, fileTypes) => {
//     const files = event.target.files;
//     const validFiles = Array.from(files).filter((file) =>
//       fileTypes.includes(file.type) || fileTypes.some((type) => file.name.endsWith(type))
//     );
//     setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles]);
//     setFileNames((prevFileNames) => [...prevFileNames, ...validFiles.map((file) => file.name)]);
//   };

//   const handleRemoveFile = (setSelectedFiles, setFileNames, index, fileArray) => {
//     setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
//     setFileNames((prevFileNames) => prevFileNames.filter((_, i) => i !== index));
//     setTiffDataUrls((prevUrls) => {
//       const newUrls = { ...prevUrls };
//       delete newUrls[fileArray[index].name];
//       return newUrls;
//     });

//     if ((currentPage - 1) * filesPerPage >= fileArray.length - 1) {
//       setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
//     }
//   };

//   const handleSubmit = async () => {
//     const newTaskId = uuidv4();
//     setTaskId(newTaskId);
//     setLoading(true);
//     setUploadProgress(0);

//     const formData = new FormData();
//     selectedFiles1.forEach((file) => {
//       formData.append('images', file);
//     });
//     if (selectedFiles2.length > 0) {
//       formData.append('model', selectedFiles2[0]);
//     }

//     try {
//       const response = await axios.post(`http://127.0.0.1:5000/upload?task_id=${newTaskId}`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//         onUploadProgress: (progressEvent) => {
//           const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//           setUploadProgress(percentCompleted * 0.5); // Upload takes 50% of the progress
//         }
//       });

//       const imagePaths = response.data.result.map(res => res.image);
//       setUploadResult(imagePaths);
//       setError(null);
//       pollTaskProgress(newTaskId); // Start polling task progress immediately after upload
//     } catch (err) {
//       console.error('Error uploading files:', err);
//       setError('Error uploading files. Please try again.');
//       setUploadResult(null);
//       setLoading(false); // Move this inside catch block to prevent early termination of loading state
//     }
//   }

//   const pollTaskProgress = async (taskId) => {
//     try {
//       const response = await axios.get(`http://127.0.0.1:5000/progress?task_id=${taskId}`);
//       if (response.data.progress !== undefined) {
//         setUploadProgress(response.data.progress);
//       }
//     } catch (err) {
//       console.error('Error polling progress:', err);
//     }
//   };

//   useEffect(() => {
//     let progressInterval;
//     if (taskId && loading) {
//       progressInterval = setInterval(() => pollTaskProgress(taskId), 1000);
//     }
//     return () => clearInterval(progressInterval);
//   }, [taskId, loading]);

//   useEffect(() => {
//     const newTiffDataUrls = {};
//     selectedFiles1.forEach((file) => {
//       if (file.type === 'image/tiff' || file.name.endsWith('.tif')) {
//         const reader = new FileReader();
//         reader.onload = () => {
//           newTiffDataUrls[file.name] = reader.result;
//           setTiffDataUrls((prevUrls) => ({ ...prevUrls, ...newTiffDataUrls }));
//         };
//         reader.readAsDataURL(file);
//       }
//     });
//   }, [selectedFiles1]);

//   const renderPreview = (file) => {
//     if (file.type === 'image/tiff' || file.name.endsWith('.tif')) {
//       return tiffDataUrls[file.name] ? (
//         <div
//           key={file.name}
//           style={{
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             width: '200px',
//             height: '200px',
//             overflow: 'hidden',
//           }}
//         >
//           <TIFFViewer tiff={tiffDataUrls[file.name]} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
//         </div>
//       ) : (
//         <CircularProgress key={file.name} />
//       );
//     } else {
//       return (
//         <img
//           src={URL.createObjectURL(file)}
//           alt={`Selected File ${file.name}`}
//           style={{
//             maxWidth: '100%',
//             maxHeight: '100%',
//             objectFit: 'contain',
//             display: 'block',
//             margin: '10px auto',
//           }}
//           key={file.name}
//         />
//       );
//     }
//   };

//   const renderUploadResult = () => {
//     if (Array.isArray(uploadResult)) {
//       return (
//         <Box>
//           {uploadResult.map((result, index) => (
//             <Box key={index} mb={2}>
//               <Typography variant="h6">Result {index + 1}</Typography>
//               <Typography variant="body2">{result.result}</Typography>
//               <img src={`data:image/png;base64,${result.image}`} alt={`Result ${index + 1}`} />
//             </Box>
//           ))}
//         </Box>
//       );
//     }
//     return <Typography variant="body2">{uploadResult}</Typography>;
//   };

//   const currentFiles = selectedFiles1.slice(
//     (currentPage - 1) * filesPerPage,
//     currentPage * filesPerPage
//   );

//   const handlePageChange = (event, value) => {
//     setCurrentPage(value);
//   };

//   return (
//     <Container maxWidth="lg">
//       <Typography variant="h4" gutterBottom>
//         文件上传和预览
//       </Typography>
//       <Grid container spacing={2}>
//         <Grid item xs={12} md={6}>
//           <Paper
//             ref={fileDropRef1}
//             onDrop={(event) => handleDrop(event, setSelectedFiles1, setFileNames1, ['image/png', 'image/tiff', 'image/jpeg'], setDragActive1)}
//             onDragOver={(event) => handleDragOver(event, setDragActive1)}
//             onDragLeave={() => handleDragLeave(setDragActive1)}
//             sx={{
//               border: isDragActive1 ? '2px dashed #3f51b5' : '2px dashed #ccc',
//               padding: 2,
//               textAlign: 'center',
//               backgroundColor: isDragActive1 ? '#f0f0f0' : '#fafafa',
//               marginBottom: 2,
//             }}
//           >
//             <TextField
//               label="拖放PNG或TIF图片"
//               variant="outlined"
//               fullWidth
//               value={fileNames1.join(', ')}
//               disabled
//               InputProps={{
//                 endAdornment: (
//                   <Button
//                     variant="contained"
//                     component="label"
//                     startIcon={<CloudUploadIcon />}
//                     sx={{ padding: '4px 14px', fontSize: '0.875rem' }}
//                   >
//                     选择
//                     <input
//                       type="file"
//                       hidden
//                       multiple
//                       accept=".png,.jpg,.jpeg,.tif,.tiff"
//                       onChange={(event) => handleFileInput(event, setSelectedFiles1, setFileNames1, ['image/png', 'image/tiff', 'image/jpeg'])}
//                     />
//                   </Button>
//                 ),
//               }}
//             />
//             <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
//               拖放图片到这里
//             </Typography>
//             <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: 2 }}>
//               {currentFiles.map((file, index) => (
//                 <Box key={index} sx={{ position: 'relative', margin: 1 }}>
//                   {renderPreview(file)}
//                   <IconButton
//                     sx={{ position: 'absolute', top: 0, right: 0 }}
//                     onClick={() => handleRemoveFile(setSelectedFiles1, setFileNames1, (currentPage - 1) * filesPerPage + index, selectedFiles1)}
//                   >
//                     <CloseIcon style={{ color: 'red' }} />
//                   </IconButton>
//                 </Box>
//               ))}
//             </Box>
//             <Grid item xs={12}>
//               {selectedFiles1.length > 0 && (
//                 <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
//                   <Pagination
//                     count={Math.ceil(selectedFiles1.length / filesPerPage)} // 计算分页数量
//                     page={currentPage}
//                     onChange={handlePageChange}
//                     sx={{ display: 'flex', justifyContent: 'center' }}
//                   />
//                 </Box>
//               )}
//             </Grid>
//           </Paper>
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <Paper
//             ref={fileDropRef2}
//             onDrop={(event) => handleDrop(event, setSelectedFiles2, setFileNames2, ['application/octet-stream', '.pt', '.ckpt'], setDragActive2)}
//             onDragOver={(event) => handleDragOver(event, setDragActive2)}
//             onDragLeave={() => handleDragLeave(setDragActive2)}
//             sx={{
//               border: isDragActive2 ? '2px dashed #3f51b5' : '2px dashed #ccc',
//               padding: 2,
//               textAlign: 'center',
//               backgroundColor: isDragActive2 ? '#f0f0f0' : '#fafafa',
//               marginBottom: 2,
//             }}
//           >
//             <TextField
//               label="拖放模型文件"
//               variant="outlined"
//               fullWidth
//               value={fileNames2.join(', ')}
//               disabled
//               InputProps={{
//                 endAdornment: (
//                   <Button
//                     variant="contained"
//                     component="label"
//                     startIcon={<CloudUploadIcon />}
//                     sx={{ padding: '4px 14px', fontSize: '0.875rem' }}
//                   >
//                     选择
//                     <input
//                       type="file"
//                       hidden
//                       accept=".pt,.ckpt"
//                       onChange={(event) => handleFileInput(event, setSelectedFiles2, setFileNames2, ['application/octet-stream', '.pt', '.ckpt'])}
//                     />
//                   </Button>
//                 ),
//               }}
//             />
//             <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
//               拖放模型文件到这里
//             </Typography>
//             <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: 2 }}>
//               {selectedFiles2.length > 0 && selectedFiles2.map((file, index) => (
//                 <Box key={index} sx={{ position: 'relative', margin: 1 }}>
//                   <Paper
//                     variant="outlined"
//                     sx={{ padding: 1, display: 'flex', alignItems: 'center', position: 'relative' }}
//                   >
//                     <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                       {file.name}
//                     </Typography>
//                     <IconButton
//                       sx={{ position: 'absolute', top: 0, right: 0 }}
//                       onClick={() => handleRemoveFile(setSelectedFiles2, setFileNames2, index, selectedFiles2)}
//                     >
//                       <CloseIcon style={{ color: 'red' }} />
//                     </IconButton>
//                   </Paper>
//                 </Box>
//               ))}
//             </Box>
//           </Paper>
//         </Grid>
//         <Grid item xs={12}>
//           <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexDirection: 'column', alignItems: 'center' }}>
//             {loading && !error && (
//               <Box sx={{ width: '100%', maxWidth: 600 }}>
//                 <LinearProgress variant="determinate" value={uploadProgress} />
//                 <Typography variant="body2" sx={{ textAlign: 'center', marginTop: 1 }}>
//                   上传进度: {uploadProgress}%
//                 </Typography>
//               </Box>
//             )}
//             <Box sx={{ display: 'flex', gap: 2 }}>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 startIcon={loading ? <CircularProgress size={24} /> : <CloudUploadIcon />}
//                 onClick={handleSubmit}
//                 disabled={loading}
//               >
//                 {loading ? '处理中...' : '上传文件'}
//               </Button>
//               <Button
//                 variant="contained"
//                 color="secondary"
//                 onClick={() => {
//                   navigate('/visualizationCla', { state: { imagePaths: uploadResult } });
//                 }}
//                 disabled={!uploadResult}
//                 sx={{ padding: '8px 26px', fontSize: '0.875rem' }}
//               >
//                 查看数据
//               </Button>
//             </Box>
//           </Box>
//         </Grid>
//         {uploadResult && (
//           <Grid container justifyContent="center" alignItems="center" style={{ height: '30vh' }}>
//             <Grid item xs={12}>
//               <Paper sx={{ padding: 2, marginTop: 2, textAlign: 'center' }}>
//                 <Typography
//                   variant="h3"
//                   gutterBottom
//                   sx={{
//                     fontFamily: 'Roboto, sans-serif',
//                     color: '#01c4f7',
//                   }}
//                 >
//                   已完成线粒体分割, 点击"查看数据"按钮查看分割结果
//                 </Typography>
//               </Paper>
//             </Grid>
//           </Grid>
//         )}
//         {error && (
//           <Grid item xs={12}>
//             <Typography variant="body2" color="error" gutterBottom>
//               {error}
//             </Typography>
//           </Grid>
//         )}
//       </Grid>
//     </Container>
//   );
// };

// export default Dashboard;





