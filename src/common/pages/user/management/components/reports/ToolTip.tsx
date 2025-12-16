import { Box, Tooltip, Typography } from '@mui/material';
import React from 'react';

const ToolTip = (data: any) => {
  return (
    <Box>
      <Tooltip title={data} arrow>
        <Typography noWrap sx={{ maxWidth: 135, fontSize: '0.75rem' }}>
          {data}
        </Typography>
      </Tooltip>
    </Box>
  );
};

export default ToolTip;
