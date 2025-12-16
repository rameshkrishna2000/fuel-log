import { Box, Typography, Avatar } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PersonIcon from '@mui/icons-material/Person';

interface Props {
  PhoneButton: any;
  driverName: string;
  phoneNo: string;
}

const TripCompletionUI = ({ PhoneButton, driverName, phoneNo }: Props) => {
  return (
    <Box
      sx={{
        width: '100%',
        mx: 'auto',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: '#1976d2',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto 16px',
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%': {
                boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)'
              },
              '70%': {
                boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)'
              },
              '100%': {
                boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)'
              }
            }
          }}
        >
          <DirectionsBusIcon
            sx={{
              fontSize: '30px',
              color: 'white'
            }}
          />
        </Box>

        <Typography
          variant='h5'
          sx={{
            fontWeight: 'bold',
            mb: 1
          }}
        >
          Your transport has arrived!
        </Typography>

        <Typography
          variant='subtitle1'
          sx={{
            mb: 3,
            color: 'text.secondary'
          }}
        >
          Ready for your journey
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            gap: 1
          }}
        >
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <PersonIcon />
          </Avatar>
          <Typography variant='body1' fontWeight='medium'>
            Driver: {driverName}
          </Typography>
        </Box>

        <PhoneButton phoneNumber={phoneNo} />
      </Box>
    </Box>
  );
};

export default TripCompletionUI;
