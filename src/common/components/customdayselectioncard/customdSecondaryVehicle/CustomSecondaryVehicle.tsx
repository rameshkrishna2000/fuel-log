import React from 'react';
import { Box, Card, Typography, Grid, Divider } from '@mui/material';
import { Icon } from '@iconify/react';
import './CustomSecondaryVehicle.scss';
import { capitalizeFirstLetter } from '../../../../utils/commonFunctions';

interface CustomDaySelectionCardProps {
  onClose: () => void;
  firstName: string;
  lastName: string;
  vehicleInfoList: { vehicleNumber: string; seatingCapacity: number }[];
}

const CustomSecondaryVehicle: React.FC<CustomDaySelectionCardProps> = ({
  onClose,
  firstName,
  lastName,
  vehicleInfoList
}) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1300
      }}
    >
      <Card
        className='dayselection-card'
        elevation={4}
        sx={{
          borderRadius: 4,
          position: 'relative',
          width: '90%',
          maxWidth: 700,
          height: '70vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          boxShadow: '0px 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '2px solid #ddd',
            backgroundColor: '#1976d2',
            color: '#fff',
            borderRadius: '8px 8px 0 0'
          }}
        >
          <Typography sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
            {`${capitalizeFirstLetter(firstName)} ${
              lastName ? capitalizeFirstLetter(lastName) : ''
            }`}
          </Typography>
          <Icon
            icon='mdi:close-circle'
            style={{ cursor: 'pointer', color: '#fff', fontSize: '1.8rem' }}
            onClick={onClose}
          />
        </Box>

        <Box
          sx={{
            position: 'sticky',
            top: 0,
            backgroundColor: '#f1f1f1',
            zIndex: 10,
            padding: '10px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          <Grid container>
            <Grid item xs={6}>
              <Typography sx={{ color: '#333', fontSize: '1rem' }}>
                Vehicle Number
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography sx={{ color: '#333', fontSize: '1rem' }}>
                Seating Capacity
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            maxHeight: 'calc(70vh - 120px)',
            padding: '16px'
          }}
        >
          <Grid container spacing={2} sx={{ textAlign: 'center' }}>
            {vehicleInfoList
              ?.filter((item: any) => item.isPrimary === 0)
              ?.map((vehicle, index) => (
                <React.Fragment key={vehicle.vehicleNumber}>
                  <Grid
                    item
                    xs={6}
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#eef7ff' : '#fff',
                      borderRadius: '6px',
                      padding: '12px'
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: 'bold', color: '#1565c0', fontSize: '1rem' }}
                    >
                      {vehicle.vehicleNumber?.toUpperCase()}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={6}
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#eef7ff' : '#fff',
                      padding: '12px'
                    }}
                  >
                    <Typography sx={{ color: '#333', fontSize: '0.95rem' }}>
                      {vehicle.seatingCapacity}
                    </Typography>
                  </Grid>

                  {index < vehicleInfoList.length - 1 && (
                    <Grid item xs={12}>
                      <Divider sx={{ backgroundColor: '#ddd' }} />
                    </Grid>
                  )}
                </React.Fragment>
              ))}
          </Grid>
        </Box>
      </Card>
    </Box>
  );
};

export default CustomSecondaryVehicle;
