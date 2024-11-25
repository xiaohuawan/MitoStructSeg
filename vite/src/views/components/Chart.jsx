import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const Chart = ({ title, data }) => (
  <Card>
    <CardContent>
      <Typography variant="h5" component="div">
        {title}
      </Typography>
      <Line data={data} />
    </CardContent>
  </Card>
);

export default Chart;
