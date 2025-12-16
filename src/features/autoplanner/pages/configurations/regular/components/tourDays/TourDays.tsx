import { Box, Card, Divider, Grid, Typography, IconButton } from '@mui/material';
import './TourDays.scss';
import { Icon } from '@iconify/react';
import React from 'react';

const TourDays = ({ header, onClose, availability }: any) => {
  return (
    <Box className='regular-tourdays'>
      <Card className='regulartourdays-table'>
        <Box className='regulartourdays-header'>
          <Typography variant='h6' fontWeight='bold'>
            {header}
          </Typography>
          <IconButton
            tabIndex={0}
            onClick={onClose}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClose();
              }
            }}
            className='close-btn'
          >
            <Icon icon='mdi:close-circle' />
          </IconButton>
        </Box>

        <Box className='regular-tourtableheaders'>
          <Grid container>
            <Grid item xs={6}>
              <Typography className='table-head'>Day</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography className='table-head'>Availability</Typography>
            </Grid>
          </Grid>
        </Box>

        <Box className='regular-tourdatas'>
          {availability?.map(({ label, available }: any, index: number) => (
            <React.Fragment key={index}>
              <Grid
                container
                className={`data-row ${index % 2 === 0 ? 'even' : 'odd'}`}
                alignItems='center'
              >
                <Grid item xs={6} textAlign='center'>
                  <Typography className='label'>{label}</Typography>
                </Grid>
                <Grid item xs={6} textAlign='center'>
                  <Typography
                    className={`value ${
                      available === 'Yes' ? 'available' : 'unavailable'
                    }`}
                  >
                    {available}
                  </Typography>
                </Grid>
              </Grid>

              {availability?.length - 1 > index && <Divider className='divider' />}
            </React.Fragment>
          ))}
        </Box>
      </Card>
    </Box>
  );
};

export default TourDays;
