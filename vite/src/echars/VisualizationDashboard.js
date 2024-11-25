import React from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import DataCard from 'DataCard';
import Chart from 'Chart';
import ProgressBar from 'ProgressBar';

// 示例数据
const chartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Sales',
      data: [65, 59, 80, 81, 56, 55],
      fill: false,
      borderColor: '#1976d2',
    },
  ],
};

const App = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        数据可视化大屏
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <DataCard title="总销售额" value="$123,456" />
        </Grid>
        <Grid item xs={12} md={4}>
          <DataCard title="用户数量" value="789" />
        </Grid>
        <Grid item xs={12} md={4}>
          <DataCard title="任务完成率" value="87%" />
        </Grid>
        <Grid item xs={12} md={6}>
          <Chart title="销售趋势" data={chartData} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ProgressBar title="任务进度" value={60} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default App;
