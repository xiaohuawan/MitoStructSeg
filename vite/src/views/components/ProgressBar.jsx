import React from 'react';
import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material';

const ProgressBar = ({ title, value }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress variant="determinate" value={value} />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">{`${Math.round(value)}%`}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProgressBar;