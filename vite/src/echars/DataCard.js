import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const DataCard = ({ title, value }) => (
  <Card sx={{ minWidth: 275, mb: 2 }}>
    <CardContent>
      <Typography variant="h6" component="div" color="text.primary">
        {title}
      </Typography>
      <Typography variant="h4" component="div" color="primary.main">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export default DataCard;
