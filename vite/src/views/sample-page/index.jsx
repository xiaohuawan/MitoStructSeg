import React, { useState, useRef } from 'react';
import { Container, Typography, Paper, TextField, Button, Box, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainCard from 'ui-component/cards/MainCard';

const FileUploadAndPreview = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);  // New state for data readiness

  const fileDropRef = useRef(null);
  const navigate = useNavigate();

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragActive(false);
    const files = Array.from(event.dataTransfer.files);
    // Allow both .tif and .png files
    const filteredFiles = files.filter(file => file.type === 'image/tiff' || file.type === 'image/png');
    setSelectedFiles(filteredFiles);
    setFileNames(filteredFiles.map(file => file.name));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleFileInput = (event) => {
    const files = Array.from(event.target.files);
    // Allow both .tif and .png files
    const filteredFiles = files.filter(file => file.type === 'image/tiff' || file.type === 'image/png');
    setSelectedFiles(filteredFiles);
    setFileNames(filteredFiles.map(file => file.name));
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setFileNames(updatedFiles.map(file => file.name));
  };

  async function handleRun() {
    setIsProcessing(true);  // Set processing to true
  
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('files', file));
  
    try {
      const response = await axios.post('http://127.0.0.1:5000/compute', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Success:', response.data);
      setIsDataReady(true);  // Set data ready to true
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsProcessing(false);  // Always set processing to false
    }
  }
  

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 2,
        }}
      >
        <Paper
          ref={fileDropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={{
            border: isDragActive ? '2px dashed #3f51b5' : 'none',
            padding: 2,
            textAlign: 'center',
            backgroundColor: isDragActive ? '#f0f0f0' : '#fafafa',
            marginBottom: 2,
            width: '100%',
            maxWidth: 600,
          }}
        >
          <TextField
            label="拖放TIF或PNG图片"
            variant="outlined"
            fullWidth
            value={fileNames.join(', ')}
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
                    accept=".tif,.tiff,.png"
                    onChange={handleFileInput}
                  />
                </Button>
              ),
            }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: 2 }}>
            {selectedFiles.map((file, index) => (
              <Box key={index} sx={{ position: 'relative', margin: 1 }}>
                <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                <IconButton
                  sx={{ position: 'absolute', top: 0, right: 0 }}
                  onClick={() => handleRemoveFile(index)}
                >
                  <CloseIcon style={{ color: 'red' }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRun}
            disabled={isProcessing}
            sx={{ padding: '8px 20px', fontSize: '0.875rem' }}
          >
            {isProcessing ? 'Processing...' : 'Run'}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/visualizationCom')}
            disabled={!isDataReady}  // Disable button if data is not ready
            sx={{ padding: '8px 20px', fontSize: '0.875rem' }}
          >
            Data
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default FileUploadAndPreview;









