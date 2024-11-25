import PropTypes from 'prop-types';
import React, { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Menu from '@mui/material/Menu'; // 确保导入 Menu 组件
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';

// assets
import EarningIcon from 'assets/images/icons/earning.svg';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

// ===========================|| DASHBOARD DEFAULT - EARNING CARD ||=========================== //

const EarningCard = ({ isLoading }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [value, setValue] = useState('');

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <TextField
      label="Enter path"
      variant="outlined"
      fullWidth
      value={value}
      onChange={handleChange}
      disabled={isLoading}
      InputProps={{
        startAdornment: (
          <IconButton
            edge="start"
            onClick={handleClick}
            aria-controls="menu-earning-card"
            aria-haspopup="true"
            color="inherit"
          >
            {isLoading ? <img src={EarningIcon} alt="Earning Icon" style={{ width: 20, height: 20 }} /> : <MoreHorizIcon />}
          </IconButton>
        ),
        endAdornment: (
          <Menu
            id="menu-earning-card"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
          >
            <MenuItem onClick={handleClose}>Import Card</MenuItem>
            <MenuItem onClick={handleClose}>Copy Data</MenuItem>
            <MenuItem onClick={handleClose}>Export</MenuItem>
            <MenuItem onClick={handleClose}>Archive File</MenuItem>
          </Menu>
        )
      }}
    />
  );
};

EarningCard.propTypes = {
  isLoading: PropTypes.bool
};

export default EarningCard;