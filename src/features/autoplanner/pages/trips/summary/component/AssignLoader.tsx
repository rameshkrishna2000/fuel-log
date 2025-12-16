import React, { useEffect } from 'react';
import { Box, CircularProgress, CircularProgressProps, Typography } from '@mui/material';
import './AssignLoader.scss';

interface Props {
  assigning: boolean;
  setAssigning: React.Dispatch<React.SetStateAction<boolean>>;
  setStopLoader: React.Dispatch<React.SetStateAction<boolean>>;
  progress: number;
  stopLoader: boolean;
  proceedLoading: boolean;
  resultLoading: boolean;
  waitShow: boolean;
}
const AssignLoader = ({
  assigning,
  setAssigning,
  progress,
  stopLoader,
  setStopLoader,
  proceedLoading,
  resultLoading,
  waitShow
}: Props) => {
  function CircularProgressWithLabel(props: CircularProgressProps & { value: number }) {
    return (
      <Box className='assign-loader-progress'>
        <CircularProgress
          variant='determinate'
          {...props}
          size={50}
          sx={{
            color: 'rgba(171, 171, 171, 0.69)',
            position: 'absolute'
          }}
          value={100}
        />
        <CircularProgress
          variant='determinate'
          {...props}
          size={50}
          sx={{
            color: 'transparent',
            svg: {
              circle: {
                stroke: 'url(#blue-gradient)',
                strokeLinecap: 'round'
              }
            }
          }}
        />
        <svg width='0' height='0'>
          <linearGradient id='blue-gradient' x1='1' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='#3239ea' />
            <stop offset='100%' stopColor='#3239ea' />
          </linearGradient>
        </svg>
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography component='div' sx={{ color: 'text.secondary', fontSize: '12px' }}>
            {`${Math.round(props.value)}%`}
          </Typography>
        </Box>
      </Box>
    );
  }

  function GradientCircularProgress() {
    return (
      <React.Fragment>
        <svg width={0} height={0}>
          <defs>
            <linearGradient id='my_gradient' x1='0%' y1='0%' x2='0%' y2='100%'>
              <stop offset='0%' stopColor='#3239ea' />
              <stop offset='100%' stopColor='#3239ea' />
            </linearGradient>
          </defs>
        </svg>
        <CircularProgress
          sx={{ 'svg circle': { stroke: 'url(#my_gradient)', strokeLinecap: 'round' } }}
          size={50}
        />
      </React.Fragment>
    );
  }

  useEffect(() => {
    if (stopLoader) {
      setAssigning(false);
      setStopLoader(false);
    }
  }, [stopLoader]);

  return (
    <>
      {assigning && (
        <Box className='assign-loader-component'>
          {proceedLoading || resultLoading || progress === 0 ? (
            <Box>
              <GradientCircularProgress />
              {waitShow && <Typography className='wait-text'>Please wait</Typography>}
            </Box>
          ) : !stopLoader && progress > 0 ? (
            <CircularProgressWithLabel value={progress} />
          ) : (
            ''
          )}
        </Box>
      )}
    </>
  );
};

export default AssignLoader;
