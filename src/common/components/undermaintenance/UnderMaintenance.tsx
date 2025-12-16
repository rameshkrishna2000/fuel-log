import { Box, Typography } from '@mui/material';
import maintenance from '../app/assets/images/maintenace.png';
import './UnderMaintenance.scss';

function Maintenance() {
  return (
    <Box className='maintenance-box'>
      <Box
        component='img'
        src={maintenance}
        sx={{ height: '350px' }}
        alt='Under maintenance'
      />
      <Typography variant='h3'>Page Under Maintenance</Typography>
    </Box>
  );
}

export default Maintenance;
