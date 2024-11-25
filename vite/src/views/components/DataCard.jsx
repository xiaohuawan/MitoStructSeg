// DataCard.js
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const DataCard = ({ title, value }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DataCard;