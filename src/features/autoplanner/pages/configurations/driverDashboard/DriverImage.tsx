import React from 'react';
import { Icon } from '@iconify/react';
import { Box, Typography, Dialog, DialogContent, Button } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { DriverFuelCamera } from './DriverFuelCamera';

export const DriverImage = ({
  title,
  type,
  overallFiles,
  uploadedFiles,
  handleUpload,
  handleDelete,
  handleImage,
  errors
}: any) => {
  const isXs = useMediaQuery('(max-width:600px)');
  const [showOptions, setShowOptions] = React.useState(false);
  const [cameraOpen, setCameraOpen] = React.useState(false);

  const fieldName =
    type === 'Odometer'
      ? 'odometer'
      : type === 'Fuel'
      ? 'fuel'
      : type === 'AdBlue'
      ? 'adBlue'
      : '';

  const handleUploadClick = () => {
    if (isXs) {
      setShowOptions(true);
    } else {
      handleUpload(type);
    }
  };

  const handleGalleryUpload = () => {
    setShowOptions(false);
    handleUpload(type);
  };

  const handleCameraOpen = () => {
    setShowOptions(false);
    setCameraOpen(true);
  };

  const handleCameraCapture = (file: File) => {
    handleUpload(type, file);
  };

  return (
    <>
      {title === 'Fuel Receipt' && (
        <Typography
          style={{
            marginTop: '10px',
            fontWeight: 600,
            fontSize: '14px',
            color: '#374151'
          }}
        >
          Receipts (Optional)
        </Typography>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1
        }}
      >
        <Typography
          sx={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginTop: '10px' }}
        >
          {title}
          {title === 'Odometer' && (
            <span style={{ color: 'red', marginLeft: '4px', fontWeight: 'bold' }}>*</span>
          )}
        </Typography>
        {errors?.[fieldName] && (
          <Typography
            sx={{
              color: '#EF4444',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Icon icon='mdi:alert-circle' width='14' height='14' />
            {errors[fieldName]?.message}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          minHeight: '76px',
          alignItems: 'center'
        }}
      >
        {overallFiles.length === 0 && uploadedFiles.length === 0 ? (
          <Box
            onClick={handleUploadClick}
            sx={{
              width: '100%',
              height: '76px',
              border: '2px dashed #D1D5DB',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: '#F9FAFB',
              '&:hover': {
                borderColor: '#6366F1',
                backgroundColor: '#EEF2FF'
              }
            }}
          >
            <Icon
              icon='material-symbols:upload'
              width='24'
              height='24'
              color='#9CA3AF'
              style={{ marginBottom: '4px' }}
            />
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#6B7280'
              }}
            >
              Click to upload (Maximum 2 file)
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                cursor: 'pointer',
                padding: '8px',
                minWidth: 'fit-content'
              }}
            >
              <Box
                onClick={handleUploadClick}
                sx={{
                  width: '60px',
                  height: '60px',
                  border: '2px dashed #D1D5DB',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#F9FAFB',
                  '&:hover': {
                    borderColor: '#6366F1',
                    backgroundColor: '#EEF2FF'
                  }
                }}
              >
                <Icon icon='basil:add-outline' width='32' height='32' color='#9CA3AF' />
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                overflowX: 'auto',
                gap: 2,
                scrollbarWidth: 'none',
                padding: '8px'
              }}
            >
              {overallFiles.map((file: any, index: number) => (
                <Box
                  key={`${type}Overall-${index}`}
                  sx={{
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #E5E7EB',
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)'
                    },
                    '&:hover .zoom-icon': {
                      opacity: 1
                    }
                  }}
                >
                  <img
                    src={file.fileUrl}
                    width='60'
                    height='60'
                    style={{
                      cursor: 'pointer',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onClick={() => {
                      handleImage(file.fileUrl, file.fileName);
                    }}
                  />
                  <Icon
                    icon='material-symbols:close'
                    width='18'
                    height='18'
                    style={{
                      cursor: 'pointer',
                      color: '#FFFFFF',
                      position: 'absolute',
                      background: 'rgba(239, 68, 68, 0.9)',
                      borderRadius: '50%',
                      padding: '2px',
                      top: 4,
                      right: 4,
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleDelete(file, `Old${type}`)}
                  />
                  <Icon
                    icon='material-symbols:zoom-in-map'
                    className='zoom-icon'
                    width='18'
                    height='18'
                    style={{
                      cursor: 'pointer',
                      position: 'absolute',
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '50%',
                      padding: '2px',
                      bottom: 4,
                      right: 4,
                      opacity: 0,
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => {
                      handleImage(file.fileUrl, file.fileName);
                    }}
                  />
                </Box>
              ))}

              {uploadedFiles.map((file: any, index: number) => (
                <Box
                  key={`${type}Uploaded-${index}`}
                  sx={{
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #E5E7EB',
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)'
                    },
                    '&:hover .zoom-icon': {
                      opacity: 1
                    }
                  }}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    width='60'
                    height='60'
                    style={{
                      cursor: 'pointer',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onClick={() => {
                      handleImage(URL.createObjectURL(file), file.name);
                    }}
                  />
                  <Icon
                    icon='material-symbols:close'
                    width='18'
                    height='18'
                    style={{
                      cursor: 'pointer',
                      color: '#FFFFFF',
                      position: 'absolute',
                      background: 'rgba(239, 68, 68, 0.9)',
                      borderRadius: '50%',
                      padding: '2px',
                      top: 4,
                      right: 4,
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleDelete(file, type)}
                  />
                  <Icon
                    icon='material-symbols:zoom-in-map'
                    className='zoom-icon'
                    width='18'
                    height='18'
                    style={{
                      cursor: 'pointer',
                      position: 'absolute',
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '50%',
                      padding: '2px',
                      bottom: 4,
                      right: 4,
                      opacity: 0,
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => {
                      handleImage(URL.createObjectURL(file), file.name);
                    }}
                  />
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>

      <Dialog
        open={showOptions}
        onClose={() => setShowOptions(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: '8px',
            minWidth: '280px'
          }
        }}
      >
        <DialogContent sx={{ padding: '16px' }}>
          <Typography
            sx={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '16px',
              textAlign: 'center'
            }}
          >
            Choose Option
          </Typography>

          <Button
            fullWidth
            onClick={handleCameraOpen}
            startIcon={
              <Icon icon='material-symbols:photo-camera' width='24' height='24' />
            }
            sx={{
              justifyContent: 'flex-start',
              padding: '12px 16px',
              marginBottom: '8px',
              textTransform: 'none',
              fontSize: '16px',
              color: '#374151',
              backgroundColor: '#F9FAFB',
              '&:hover': {
                backgroundColor: '#EEF2FF'
              }
            }}
          >
            Take Photo
          </Button>

          <Button
            fullWidth
            onClick={handleGalleryUpload}
            startIcon={
              <Icon icon='material-symbols:photo-library' width='24' height='24' />
            }
            sx={{
              justifyContent: 'flex-start',
              padding: '12px 16px',
              textTransform: 'none',
              fontSize: '16px',
              color: '#374151',
              backgroundColor: '#F9FAFB',
              '&:hover': {
                backgroundColor: '#EEF2FF'
              }
            }}
          >
            Upload from Gallery
          </Button>
        </DialogContent>
      </Dialog>

      <DriverFuelCamera
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
        type={type}
      />
    </>
  );
};
