import { Box, Typography } from '@mui/material';
import './CustomSwitch.scss';
import React, { useState } from 'react';

interface SwitchProps {
  option1: string;
  option2: string;
  onChange: (option: string) => void;
}

const CustomSwitch = ({ option1, option2, onChange }: SwitchProps) => {
  const [tripActive, setTripActive] = useState(true);

  return (
    <Box
      className='custom-switchbox'
      role='button'
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          setTripActive(!tripActive);
          onChange(tripActive ? option2 : option1);
        }
      }}
    >
      {/* Sliding background */}
      <Box className={`slider ${tripActive ? 'left' : 'right'}`} />

      {/* Trips option */}
      <Box
        className={tripActive ? 'tripsbox-active' : 'tripsbox-inactive'}
        onClick={() => {
          setTripActive(true);
          onChange(option1);
        }}
      >
        <Typography className='tripsbox-typo'>{option1}</Typography>
      </Box>

      {/* Orders option */}
      <Box
        className={!tripActive ? 'ordersbox-active' : 'ordersbox-inactive'}
        onClick={() => {
          setTripActive(false);
          onChange(option2);
        }}
      >
        <Typography className='ordersbox-typo'>{option2}</Typography>
      </Box>
    </Box>
  );
};

export default CustomSwitch;
