import { Icon } from '@iconify/react';
import { Box, Dialog, Typography } from '@mui/material';
import React from 'react';
import GoogleMap from '../../../../../../common/components/maps/googlemap/GoogleMap';
import GoogleMarkers from '../../../../../../common/components/maps/googlemarkers/GoogleMarkers';

const ViewFuelMap = ({ isMap, setIsMap, gpsLocation }: any) => {
  return (
    <Dialog
      open={isMap}
      maxWidth='sm'
      onClose={() => setIsMap(false)}
      className='fuel-map-cont'
      PaperProps={{
        sx: {
          minHeight: '500px',
          padding: '10px 10px 10px 20px'
        }
      }}
      fullWidth
    >
      <Box className='fuel-map-head'>
        <Box>
          <Typography className='fuel-map-text'>Location Details</Typography>
        </Box>
        <Box className='fuel-map-icon-cont'>
          <Icon
            icon='ri:close-fill'
            className='fuel-map-icon'
            onClick={() => setIsMap(false)}
          />
        </Box>
      </Box>

      <Box className='fuel-map-coordinates'>
        <Box className='fuel-map-coordinate-item'>
          <Typography className='fuel-map-coordinate-label'>Latitude</Typography>
          <Box className='fuel-map-coordinate-value'>
            <Icon icon='mdi:map-marker' className='fuel-map-location-icon' />
            <Typography className='fuel-map-coordinate-text'>
              {gpsLocation?.gpsLatitude}
            </Typography>
          </Box>
        </Box>

        <Box className='fuel-map-divider'></Box>

        <Box className='fuel-map-coordinate-item'>
          <Typography className='fuel-map-coordinate-label'>Longitude</Typography>
          <Box className='fuel-map-coordinate-value'>
            <Icon icon='mdi:map-marker' className='fuel-map-location-icon' />
            <Typography className='fuel-map-coordinate-text'>
              {gpsLocation?.gpsLongitude}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box className='fuel-map-container'>
        <GoogleMap>
          <GoogleMarkers />
        </GoogleMap>
      </Box>
    </Dialog>
  );
};

export default ViewFuelMap;
