import React from 'react';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, Typography } from '@mui/material';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const Chart = ({ data, title }) => (
  <Card sx={{ minWidth: 275, mb: 2 }}>
    <CardContent>
      <Typography variant="h6" component="div" color="text.primary">
        {title}
      </Typography>
      <Line data={data} />
    </CardContent>
  </Card>
);

export default Chart;
