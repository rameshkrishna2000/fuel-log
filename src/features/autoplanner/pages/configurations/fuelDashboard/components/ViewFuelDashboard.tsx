import { Icon } from '@iconify/react';
import { Box, Chip, Dialog, Typography } from '@mui/material';
import React from 'react';
import { useAppSelector } from '../../../../../../app/redux/hooks';
import { convertDriverEpochToDateTime } from '../../../../../../utils/commonFunctions';

const ViewFuelDashboard = ({ isOpen, setIsOpen, selectedValue, handleImage }: any) => {
  const { timezone } = useAppSelector(state => state.myProfile.data);

  return (
    <Dialog
      open={isOpen}
      maxWidth='sm'
      onClose={() => setIsOpen(false)}
      className='fuel-dialog-cont'
      PaperProps={{
        sx: {
          minHeight: '500px',
          padding: '10px 10px 10px 20px'
        }
      }}
      fullWidth
    >
      {' '}
      <Box className='fuel-dialog-head'>
        <Box>
          {' '}
          <Typography className='fuel-dialog-text'>Fuel Log Details</Typography>
          <Typography className='fuel-dialog-text-p'>
            View complete information for this fuel entry
          </Typography>
        </Box>
        <Box className='fuel-dialog-icon-cont'>
          <Icon
            icon='ri:close-fill'
            className='fuel-dialog-icon'
            onClick={() => setIsOpen(false)}
          />
        </Box>
      </Box>
      <Box
        sx={{
          overflow: 'scroll',
          height: '80vh',
          scrollbarWidth: 'none',
          marginTop: '5px'
        }}
      >
        {' '}
        <Box className='fuel-dialog-vehicle'>
          <Typography className='fuel-dialog-chip-text'>
            {selectedValue?.vehicleNumber}
          </Typography>
          <Chip label={selectedValue?.fuelType} className='fuel-dialog-chip-one' />
          {selectedValue?.payment && (
            <Chip
              label={selectedValue?.payment}
              variant='outlined'
              className='fuel-dialog-chip-two'
            />
          )}
        </Box>
        <Box className='fuel-dialog-content'>
          <Box className='fuel-dialog-date'>
            <Icon icon='stash:data-date-light' className='fuel-dialog-date-ic' />
            <Typography className='fuel-dialog-date-t'>
              {convertDriverEpochToDateTime(selectedValue?.dateAndTime, timezone)}
            </Typography>
          </Box>{' '}
          <Box className='fuel-dialog-date'>
            <Icon icon='bx:user' className='fuel-dialog-date-ic' />
            <Typography className='fuel-dialog-date-t'>
              {selectedValue?.driver}
            </Typography>
          </Box>
        </Box>
        <Box className='fuel-first-section'>
          <Box className='fuel-section-icon'>
            <Icon icon='lucide:fuel' className='fuel-section-ic' />
            <Typography className='fuel-section-text'>Fuel Information</Typography>
          </Box>
          <Box className='fuel-section-type'>
            {' '}
            <Box className='fuel-type-child'>
              <Typography className='fuel-type-t-one'>Fuel Type</Typography>
              <Typography className='fuel-type-t-two'>
                {selectedValue?.fuelType}
              </Typography>
            </Box>
            <Box className='fuel-type-child'>
              <Typography className='fuel-type-t-one'>Volume</Typography>
              <Typography className='fuel-type-t-two'>
                {selectedValue?.volume} Litres
              </Typography>
            </Box>
          </Box>
          <Box className='fuel-section-type'>
            {' '}
            <Box className='fuel-type-child'>
              <Typography className='fuel-type-t-one'>Price per Unit</Typography>
              <Typography className='fuel-type-t-two'>
                {selectedValue?.fuelPricePerUnit
                  ? `S$ ${selectedValue.fuelPricePerUnit}`
                  : 'NA'}
              </Typography>
            </Box>
            <Box className='fuel-type-child'>
              <Typography className='fuel-type-t-one'>Total Cost</Typography>
              <Typography className='fuel-type-t-two'>
                <Typography className='fuel-type-t-two'>
                  {selectedValue?.cost ? `S$ ${selectedValue?.cost}` : 'NA'}
                </Typography>
              </Typography>
            </Box>
          </Box>
          <Box className='fuel-section-type'>
            {' '}
            <Box className='fuel-type-child'>
              <Typography className='fuel-type-t-one'>Station Name</Typography>
              <Typography className='fuel-type-t-two'>
                {selectedValue?.fuelStation}
              </Typography>
            </Box>
            <Box className='fuel-type-child'>
              <Typography className='fuel-type-t-one'>Payment Method</Typography>
              <Box className='fuel-company'>
                <Icon icon='basil:card-outline' className='fuel-company-icon' />
                <Typography className='fuel-type-t-two'>
                  {selectedValue?.payment ?? 'NA'}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box className='fuel-notes'>
            <Typography className='fuel-type-t-one'>Notes</Typography>
            <Typography className='fuel-type-t-two'>
              {selectedValue?.notes ?? 'NA'}
            </Typography>
          </Box>
        </Box>
        <Box className='fuel-first-section'>
          <Box className='fuel-section-icon'>
            <Icon icon='proicons:drop' className='fuel-section-ic' />
            <Typography className='fuel-section-text'>AdBlue Information</Typography>
          </Box>
          <Box className='fuel-section-type'>
            {' '}
            <Box className='fuel-type-child'>
              <Typography className='fuel-type-t-one'>Volume</Typography>
              <Typography className='fuel-type-t-two'>
                {selectedValue?.adblueVolume
                  ? `${selectedValue.adblueVolume} Litres`
                  : 'NA'}
              </Typography>
            </Box>
            <Box className='fuel-type-child'>
              <Typography className='fuel-type-t-one'>Price per Unit</Typography>
              <Typography className='fuel-type-t-two'>
                {selectedValue?.adbluePricePerUnit
                  ? `S$ ${selectedValue.adbluePricePerUnit}`
                  : 'NA'}
              </Typography>
            </Box>{' '}
            <Box className='fuel-type-child'>
              <Typography className='fuel-type-t-one'>Total Cost</Typography>
              <Typography className='fuel-type-t-two'>
                {selectedValue?.adblueTotalCost
                  ? `S$ ${selectedValue.adblueTotalCost}`
                  : 'NA'}
              </Typography>
            </Box>
          </Box>
        </Box>{' '}
        <Box className='fuel-first-section'>
          <Box className='fuel-section-icon'>
            <Icon icon='ph:speedometer-light' className='fuel-section-ic' />
            <Typography className='fuel-section-text'>Odometer Information</Typography>
          </Box>
          <Box sx={{ mt: 1 }}>
            {' '}
            <Typography className='fuel-type-t-one'>Reading</Typography>
            <Typography className='fuel-type-t-two'>
              {selectedValue?.odometerReading} km
            </Typography>
          </Box>
          {selectedValue?.odometerAttachments?.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {' '}
              <Typography className='fuel-type-t-one'>Odometer Image</Typography>
              <Box
                sx={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: 2,
                  scrollbarWidth: 'none',
                  padding: '8px'
                }}
              >
                {selectedValue?.odometerAttachments?.map((file: any, index: number) => (
                  <Box
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
                      src={file.imageUrl}
                      width='100'
                      height='100'
                      style={{
                        cursor: 'pointer',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onClick={() => {
                        handleImage(file.imageUrl, file.originalFileName);
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
        {(selectedValue?.fuelReceiptAttachments?.length > 0 ||
          selectedValue?.adblueReceiptAttachments?.length > 0) && (
          <Box className='fuel-first-section'>
            <Typography className='fuel-section-text'>Receipt Attachments</Typography>
            {selectedValue?.fuelReceiptAttachments?.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {' '}
                <Typography className='fuel-type-t-one'>Fuel Receipts</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: 2,
                    scrollbarWidth: 'none',
                    padding: '8px'
                  }}
                >
                  {selectedValue?.fuelReceiptAttachments?.map(
                    (file: any, index: number) => (
                      <Box
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
                          src={file.imageUrl}
                          width='100'
                          height='100'
                          style={{
                            cursor: 'pointer',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                          onClick={() => {
                            handleImage(file.imageUrl, file.originalFileName);
                          }}
                        />
                      </Box>
                    )
                  )}
                </Box>
              </Box>
            )}
            {selectedValue?.adblueReceiptAttachments?.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography className='fuel-type-t-one'>Adblue Receipts</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: 2,
                    scrollbarWidth: 'none',
                    padding: '8px'
                  }}
                >
                  {selectedValue?.adblueReceiptAttachments?.map(
                    (file: any, index: number) => (
                      <Box
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
                          src={file.imageUrl}
                          width='100'
                          height='100'
                          style={{
                            cursor: 'pointer',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                          onClick={() => {
                            handleImage(file.imageUrl, file.originalFileName);
                          }}
                        />
                      </Box>
                    )
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}
        <Typography className='fuel-type-t-one fuel-mt'>
          Submitted on{' '}
          {convertDriverEpochToDateTime(selectedValue?.dateAndTime, timezone)}
        </Typography>
      </Box>
    </Dialog>
  );
};

export default ViewFuelDashboard;
