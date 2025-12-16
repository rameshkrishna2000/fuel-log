import React from 'react';
import { Box, Dialog, Typography, Button, CircularProgress } from '@mui/material';
import { keyframes } from '@emotion/react';

import { Icon } from '@iconify/react';
import CustomButton from '../../../../../common/components/buttons/CustomButton';

interface DriverDashboardDialogProps {
  isLogout: boolean;
  setIsLogout: (val: boolean) => void;
  logoutLoader: boolean;
  handleLogout: () => void;
  isCall: boolean;
  setIsCall: (val: boolean) => void;
  phoneNo: string;
  handleWpCall: (phone: string) => void;
  handleCall: (phone: string) => void;
  isSkipDialogOpen: boolean;
  setIsSkipDialogOpen: (val: boolean) => void;
  isSkippingTrip: boolean;
  handleSkipTrip: (trip: any) => void;
  tripToSkip: any;
  showSkipSuccess: boolean;
  setShowSkipSuccess: (val: boolean) => void;
  skippedTripName: string;
}

const DriverDashboardDialogs: React.FC<DriverDashboardDialogProps> = ({
  isLogout,
  setIsLogout,
  logoutLoader,
  handleLogout,
  isCall,
  setIsCall,
  phoneNo,
  handleWpCall,
  handleCall,
  isSkipDialogOpen,
  setIsSkipDialogOpen,
  isSkippingTrip,
  handleSkipTrip,
  tripToSkip,
  showSkipSuccess,
  setShowSkipSuccess,
  skippedTripName
}) => {
  const bounceIn = keyframes`
      0% {
        transform: scale(0.3);
        opacity: 0;
      }
      50% {
        transform: scale(1.05);
      }
      70% {
        transform: scale(0.9);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    `;

  const fadeIn = keyframes`
      from { 
        opacity: 0; 
        transform: translateY(10px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    `;

  /** Skip Success Animation */
  const skipSuccessAnimation = keyframes`
      0% { 
        transform: scale(0.3) rotate(-45deg); 
        opacity: 0; 
      }
      50% { 
        transform: scale(1.1) rotate(0deg); 
        opacity: 1; 
      }
      100% { 
        transform: scale(1) rotate(0deg); 
        opacity: 1; 
      }
    `;

  /** Slide In Up Animation */
  const slideInUp = keyframes`
      0% { 
        transform: translateY(30px); 
        opacity: 0; 
      }
      100% { 
        transform: translateY(0); 
        opacity: 1; 
      }
    `;
  return (
    <Box>
      {/* Logout Dialog */}
      <Dialog open={isLogout} onClose={() => setIsLogout(false)}>
        <Box
          sx={{
            textAlign: 'center',
            padding: '5%',
            minWidth: '250px',
            maxWidth: '350px'
          }}
        >
          <Typography>Are you sure you want to logout?</Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              paddingTop: '5%',
              justifyContent: 'center'
            }}
          >
            <Box sx={{ marginRight: '12px' }}>
              <CustomButton
                className='saveChanges'
                loading={logoutLoader}
                category='Yes'
                onClick={handleLogout}
              />
            </Box>
            <CustomButton
              className='cancel'
              category='No'
              onClick={() => setIsLogout(false)}
            />
          </Box>
        </Box>
      </Dialog>

      {/* Call Dialog */}
      <Dialog open={isCall} onClose={() => setIsCall(false)}>
        <Box
          sx={{
            textAlign: 'center',
            padding: { xs: '16px', sm: '20px' },
            minWidth: { xs: '280px', sm: '250px' },
            maxWidth: { xs: '90vw', sm: '350px' },
            width: '100%'
          }}
        >
          <Typography
            sx={{ fontSize: { xs: '18px', sm: '20px' }, fontWeight: 500, mb: 2 }}
          >
            Choose Contact Method
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: { xs: 2, sm: 2.5 },
              mb: 2
            }}
          >
            <Box
              onClick={() => handleWpCall(phoneNo)}
              sx={{
                borderRadius: '12px',
                backgroundColor: '#25D366',
                p: { xs: 1.2, sm: 1.5 },
                height: 'fit-content',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '48px',
                minHeight: '48px'
              }}
            >
              <Icon
                icon='ic:outline-whatsapp'
                width='1.5rem'
                height='1.5rem'
                style={{ color: '#fff' }}
              />
            </Box>
            <Box
              onClick={() => handleCall(phoneNo)}
              sx={{
                borderRadius: '12px',
                backgroundColor: '#34B7F1',
                p: { xs: 1.2, sm: 1.5 },
                cursor: 'pointer',
                height: 'fit-content',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '48px',
                minHeight: '48px'
              }}
            >
              <Icon
                icon='proicons:call'
                width='1.5rem'
                height='1.5rem'
                style={{ color: '#fff' }}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Typography
              sx={{
                color: 'red',
                cursor: 'pointer',
                fontSize: { xs: '14px', sm: '16px' },
                padding: { xs: '8px', sm: '12px' }
              }}
              onClick={() => setIsCall(false)}
            >
              Close
            </Typography>
          </Box>
        </Box>
      </Dialog>

      {/* Skip Trip Dialog */}
      <Dialog
        open={isSkipDialogOpen}
        onClose={() => !isSkippingTrip && setIsSkipDialogOpen(false)}
        disableEscapeKeyDown={isSkippingTrip}
        PaperProps={{
          sx: {
            margin: { xs: 1, sm: 3 },
            maxHeight: { xs: 'calc(100vh - 16px)', sm: 'calc(100vh - 64px)' },
            width: { xs: 'calc(100vw - 16px)', sm: 'auto' }
          }
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            padding: { xs: '20px', sm: '30px' },
            minWidth: { xs: 'auto', sm: '300px' },
            maxWidth: { xs: '100%', sm: '400px' },
            width: '100%'
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Icon
              icon='material-symbols:warning-outline'
              width='48'
              height='48'
              style={{ color: '#f59e0b' }}
            />
          </Box>
          <Typography
            sx={{
              fontSize: { xs: '18px', sm: '20px' },
              fontWeight: 600,
              mb: 2,
              color: '#2d3748'
            }}
          >
            Skip Trip Confirmation
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '14px', sm: '16px' },
              color: '#718096',
              mb: 3,
              lineHeight: 1.5,
              wordBreak: 'break-word'
            }}
          >
            Are you sure you want to skip this trip?
            <br />
            <strong>{tripToSkip?.tourName}</strong>
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1.5, sm: 2 },
              justifyContent: 'center'
            }}
          >
            <Button
              variant='contained'
              disabled={isSkippingTrip}
              onClick={() => handleSkipTrip(tripToSkip)}
              startIcon={
                isSkippingTrip ? (
                  <CircularProgress
                    size={16}
                    sx={{
                      color: '#fff',
                      '& .MuiCircularProgress-circle': { strokeLinecap: 'round' }
                    }}
                  />
                ) : null
              }
              sx={{
                px: 3,
                py: 1,
                borderRadius: '0.5rem',
                fontSize: { xs: '13px', sm: '14px' },
                fontWeight: 500,
                textTransform: 'none',
                backgroundColor: isSkippingTrip ? '#9ca3af' : '#ef4444',
                minWidth: { xs: '100%', sm: '130px' },
                '&:hover': { backgroundColor: isSkippingTrip ? '#9ca3af' : '#dc2626' },
                '&:disabled': { backgroundColor: '#9ca3af', color: '#fff' }
              }}
            >
              {isSkippingTrip ? 'Skipping...' : 'Yes'}
            </Button>
            <Button
              variant='outlined'
              disabled={isSkippingTrip}
              onClick={() => setIsSkipDialogOpen(false)}
              sx={{
                px: 3,
                py: 1,
                borderRadius: '0.5rem',
                fontSize: { xs: '13px', sm: '14px' },
                fontWeight: 500,
                textTransform: 'none',
                borderColor: '#d1d5db',
                color: '#6b7280',
                opacity: isSkippingTrip ? 0.5 : 1,
                minWidth: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  borderColor: isSkippingTrip ? '#d1d5db' : '#9ca3af',
                  backgroundColor: isSkippingTrip ? 'transparent' : '#f9fafb'
                }
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Skip Success Dialog */}
      <Dialog
        open={showSkipSuccess}
        onClose={() => setShowSkipSuccess(false)}
        PaperProps={{
          sx: {
            borderRadius: { xs: '1rem', sm: '1.5rem' },
            padding: { xs: '16px', sm: '20px' },
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '2px solid #0ea5e9',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            animation: `${bounceIn} 0.6s ease-out`,
            margin: { xs: 1, sm: 3 },
            maxHeight: { xs: 'calc(100vh - 16px)', sm: 'calc(100vh - 64px)' },
            width: { xs: 'calc(100vw - 16px)', sm: 'auto' }
          }
        }}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(4px)' }
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            padding: { xs: '16px', sm: '20px' },
            minWidth: { xs: 'auto', sm: '320px' },
            maxWidth: { xs: '100%', sm: '400px' },
            width: '100%'
          }}
        >
          <Box
            sx={{
              mb: { xs: 2, sm: 3 },
              animation: `${skipSuccessAnimation} 0.8s ease-out`
            }}
          >
            <Box
              sx={{
                width: { xs: '64px', sm: '80px' },
                height: { xs: '64px', sm: '80px' },
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)',
                position: 'relative'
              }}
            >
              <Icon icon='material-symbols:skip-next-rounded' />
            </Box>
          </Box>

          <Typography
            sx={{
              fontSize: { xs: '20px', sm: '24px' },
              fontWeight: 700,
              mb: 2,
              color: '#0c4a6e',
              animation: `${slideInUp} 0.6s ease-out 0.2s both`
            }}
          >
            Trip Skipped Successfully!
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '14px', sm: '16px' },
              color: '#0369a1',
              mb: 2,
              fontWeight: 500,
              animation: `${slideInUp} 0.6s ease-out 0.4s both`,
              wordBreak: 'break-word'
            }}
          >
            <strong>{skippedTripName}</strong> has been skipped
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '12px', sm: '14px' },
              color: '#075985',
              opacity: 0.8,
              animation: `${slideInUp} 0.6s ease-out 0.6s both`
            }}
          >
            You can now proceed with the next trip
          </Typography>
        </Box>
      </Dialog>
    </Box>
  );
};

export default DriverDashboardDialogs;
