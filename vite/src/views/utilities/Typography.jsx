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
  Pagination
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import { TIFFViewer } from 'react-tiff';
import 'react-tiff/dist/index.css';

const Typography1 = () => {
  const [selectedFiles1, setSelectedFiles1] = useState([]);
  const [selectedFiles2, setSelectedFiles2] = useState([]);
  const [fileNames1, setFileNames1] = useState([]);
  const [fileNames2, setFileNames2] = useState([]);
  const [isDragActive1, setDragActive1] = useState(false);
  const [isDragActive2, setDragActive2] = useState(false);
  const [tiffDataUrls, setTiffDataUrls] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 2;
  const fileDropRef1 = useRef(null);
  const fileDropRef2 = useRef(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [currentTime, setCurrentTime] = useState(''); // 新增 state
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingTime, setProcessingTime] = useState('');
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
    const formData = new FormData();
    selectedFiles1.forEach((file) => {
      formData.append('images', file);
    });
    if (selectedFiles2.length > 0) {
      formData.append('model', selectedFiles2[0]);
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/segment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // const { highlight_paths, current_time } = response.data;
      // setUploadResult(highlight_paths); // Assuming this is for visualization paths
      // setCurrentTime(current_time); 
      // setError(null);
      // navigate('/visualizationSeg', { state: { imagePaths: highlight_paths, currentTime: current_time } });
      console.log("***********", current_time)
    } 
    catch (err) {
    //   console.error('Error uploading files:', err);
    //   setError('Error uploading files. Please try again.');
    //   setUploadResult(null);
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
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
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
                navigate('/visualizationSeg', { state: { imagePaths: uploadResult } });
              }}
              sx={{ padding: '8px 26px', fontSize: '0.875rem' }}
            >
              Data
            </Button>
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

export default Typography1;
