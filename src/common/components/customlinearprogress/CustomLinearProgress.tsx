import { Box, LinearProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

const CustomLinearProgress = ({ totalFiles, progressCount }: any) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let newCount = (progressCount / totalFiles) * 100;
    setCount(newCount);
  }, [totalFiles, progressCount]);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {' '}
      <Typography>{'Files Uploaded'}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '200px', mr: 1 }}>
          <LinearProgress variant='determinate' value={count} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {totalFiles}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CustomLinearProgress;
