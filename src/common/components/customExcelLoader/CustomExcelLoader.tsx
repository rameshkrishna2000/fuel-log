import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  linearProgressClasses,
  styled,
  IconButton
} from '@mui/material';
import Draggable from 'react-draggable';
import { Icon } from '@iconify/react';
import { useAppSelector } from '../../../app/redux/hooks';
import './CustomExcelLoader.scss';

const BorderLinearProgress = styled(LinearProgress)(() => ({
  height: 10,
  borderRadius: 5,
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundImage: 'linear-gradient(to right, #1a90ff, #ff7eb3)'
  }
}));

const CustomExcelLoader = () => {
  const [currentDate, setCurrentDate] = useState<number | string>(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isShow, setIsShow] = useState(false);
  const [isSaved, setIsSaved] = useState<string | null>(null);

  const { data: excelLoader, connection } = useAppSelector(state => state.websocket);

  const {
    data: asyncSuccessData,
    isLoading: asyncSuccessLoading,
    error: asyncSuccessError
  } = useAppSelector((state: any) => state.asyncSuccess);

  useEffect(() => {
    if (parseFloat(excelLoader?.progress) >= 0 && excelLoader?.action === 'ExcelUpload') {
      setIsShow(true);
      setCurrentDate(excelLoader?.date);
      setUploadProgress(excelLoader?.progress);
    }
    if (excelLoader?.progress === 'FAILED' && excelLoader?.action === 'ExcelUpload') {
      setIsSaved('No');
    } else if (isNaN(excelLoader?.progress) && excelLoader?.action === 'ExcelUpload') {
      if (connection) connection.close();
      setIsSaved('Yes');
      setUploadProgress(100);
    }
  }, [excelLoader, connection]);

  useEffect(() => {
    if (
      parseFloat(asyncSuccessData?.progress) >= 0 &&
      asyncSuccessData?.action === 'CommenceJobSheetProcessingEvent'
    ) {
      setIsShow(true);
      setCurrentDate(asyncSuccessData?.date);
      setUploadProgress(asyncSuccessData?.progress);
    }
    if (
      (asyncSuccessData?.progress === 'FAILED' &&
        asyncSuccessData?.action === 'CommenceJobSheetProcessingEvent') ||
      asyncSuccessError
    ) {
      setIsSaved('No');
    } else if (
      asyncSuccessData?.progress === '100' &&
      asyncSuccessData?.action === 'CommenceJobSheetProcessingEvent'
    ) {
      setIsSaved('Yes');
      setUploadProgress(100);
    }
  }, [asyncSuccessData, asyncSuccessError]);

  useEffect(() => {
    if (isSaved !== null) {
      setTimeout(() => {
        setIsShow(false);
        setIsSaved(null);
        setIsVisible(true);
      }, 3000);
    }
  }, [isSaved]);

  return (
    <>
      {isShow && (
        <Box className='excel-loader-wrapper'>
          <Box className={`excel-loader-component ${isVisible ? 'show' : 'hide'}`}>
            <Draggable bounds='parent' handle='.drag-handle'>
              <Box className='excel-loader-container'>
                <Box className='excel-upload-icon'>
                  <Icon
                    icon={
                      isSaved === 'Yes'
                        ? 'typcn:tick'
                        : isSaved === 'No'
                        ? 'ix:cloud-fail'
                        : 'line-md:cloud-alt-upload-filled-loop'
                    }
                    className='upload-icon'
                  />
                </Box>
                <Box className='upload-excel-content'>
                  <Typography className='upload-date'>
                    {currentDate === 'Loading'
                      ? 'Loading...'
                      : `Import for ${currentDate}`}
                  </Typography>
                  <Typography className='upload-process'>
                    {isSaved === 'Yes'
                      ? 'Uploaded'
                      : isSaved === 'No'
                      ? 'Failed'
                      : `Uploading... ${uploadProgress}%`}
                  </Typography>
                  <BorderLinearProgress
                    variant='determinate'
                    value={uploadProgress}
                    className='upload-progress'
                  />
                </Box>
                <IconButton className='hide-button' onClick={() => setIsVisible(false)}>
                  <Icon icon='weui:arrow-filled' />
                </IconButton>
              </Box>
            </Draggable>
          </Box>

          {!isVisible && (
            <Box className='show-button' onClick={() => setIsVisible(true)}>
              <Icon icon='mdi:chevron-left' className='arror-icon' />
            </Box>
          )}
        </Box>
      )}
    </>
  );
};

export default CustomExcelLoader;
