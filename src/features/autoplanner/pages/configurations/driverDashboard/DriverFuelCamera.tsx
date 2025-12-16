import React from 'react';
import { Icon } from '@iconify/react';
import { Box, Dialog, DialogContent, IconButton } from '@mui/material';

export const DriverFuelCamera = ({ open, onClose, onCapture, type }: any) => {
  const videoPlayer = React.useRef<HTMLVideoElement>(null);
  const camera = React.useRef<HTMLCanvasElement>(null);
  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [frontCamera, setFrontCamera] = React.useState(false);

  const constraints = {
    video: {
      facingMode: frontCamera ? 'user' : 'environment'
    },
    audio: false
  };

  React.useEffect(() => {
    if (open) {
      openCamera();
    }
    return () => {
      if (cameraOpen && videoPlayer.current?.srcObject) {
        const stream = videoPlayer.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [open, frontCamera]);

  const openCamera = () => {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (stream) {
        setCameraOpen(true);
        if (videoPlayer.current) {
          videoPlayer.current.srcObject = stream;
          videoPlayer.current.play();
        }
      })
      .catch(function (err) {
        setCameraOpen(false);
        alert('Unable to access camera. Please check permissions.');
      });
  };

  const closeCamera = () => {
    if (videoPlayer.current?.srcObject) {
      const stream = videoPlayer.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraOpen(false);
    }
    onClose();
  };

  const captureImage = () => {
    if (camera.current && videoPlayer.current) {
      const context = camera.current.getContext('2d');
      if (context) {
        context.drawImage(videoPlayer.current, 0, 0, 640, 480);
        camera.current.toBlob(
          blob => {
            if (blob) {
              const file = new File([blob], `camera-${Date.now()}.jpg`, {
                type: 'image/jpeg'
              });
              onCapture(file);
              closeCamera();
            }
          },
          'image/jpeg',
          0.95
        );
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={closeCamera}
      fullScreen
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: '#000',
          margin: 0,
          maxHeight: '100%'
        }
      }}
    >
      <DialogContent
        sx={{
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={closeCamera}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 10,
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.7)'
            }
          }}
        >
          <Icon icon='material-symbols:close' width='24' height='24' />
        </IconButton>

        {/* Camera Toggle */}
        <IconButton
          onClick={() => {
            if (videoPlayer.current?.srcObject) {
              const stream = videoPlayer.current.srcObject as MediaStream;
              stream.getTracks().forEach(track => track.stop());
            }
            setFrontCamera(!frontCamera);
          }}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 10,
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.7)'
            }
          }}
        >
          <Icon icon='material-symbols:flip-camera-ios' width='24' height='24' />
        </IconButton>

        {/* Video Preview */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <video
            ref={videoPlayer}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </Box>

        {/* Capture Button */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10
          }}
        >
          <IconButton
            onClick={captureImage}
            sx={{
              width: 72,
              height: 72,
              backgroundColor: 'white',
              border: '4px solid rgba(255,255,255,0.5)',
              '&:hover': {
                backgroundColor: '#f0f0f0'
              }
            }}
          >
            <Icon icon='material-symbols:camera' width='32' height='32' color='#000' />
          </IconButton>
        </Box>

        {/* Hidden Canvas */}
        <canvas ref={camera} width='640' height='480' style={{ display: 'none' }} />
      </DialogContent>
    </Dialog>
  );
};
