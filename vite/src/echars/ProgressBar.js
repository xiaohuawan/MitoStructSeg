import React from 'react';
import { Card, CardContent, Typography, LinearProgress } from '@mui/material';

const ProgressBar = ({ title, value }) => (
  <Card sx={{ minWidth: 275, mb: 2 }}>
    <CardContent>
      <Typography variant="h6" component="div" color="text.primary">
        {title}
      </Typography>
      <LinearProgress variant="determinate" value={value} sx={{ mt: 2 }} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {value}%
      </Typography>
    </CardContent>
  </Card>
);

export default ProgressBar;
