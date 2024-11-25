// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import VisualizationDashboard from './VisualizationDashboard';
import { Container, Button, Typography } from '@mui/material';

const App = () => {
  return (
    <Router>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          文件上传与数据可视化
        </Typography>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/free/visualization" element={<VisualizationDashboard />} />
        </Routes>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/visualization"
          sx={{ mt: 4 }}
        >
          去数据可视化大屏
        </Button>
      </Container>
    </Router>
  );
};

export default App;
