import React from 'react';
import { Box, Typography } from '@mui/material';

interface DriverDashboardHotelViewProps {
  selectedTrip: any;
  hotelPicked: number;
  hotelCount: number;
  setSelectedHotel: (hotel: any) => void;
  setCurrentView: (view: string) => void;
  getArrivedCount: (guests: any[]) => number;
}

const DriverDashboardHotelView: React.FC<DriverDashboardHotelViewProps> = ({
  selectedTrip,
  hotelPicked,
  hotelCount,
  setSelectedHotel,
  setCurrentView,
  getArrivedCount
}) => {
  if (!selectedTrip) return null;


  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: '1200px', margin: '0 auto' }}>
      <Box
        sx={{
          backgroundColor: '#f8fafc',
          p: 1,
          borderRadius: '1rem',
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid #e2e8f0'
        }}
      >
        <Box>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748' }}>
            {hotelPicked}/{selectedTrip.hotels?.length || 0}
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#718096' }}>Picked</Typography>
        </Box>
        <Box
          sx={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: `conic-gradient(#48bb78 ${
              (hotelPicked / hotelCount) * 360
            }deg, #e2e8f0 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box
            sx={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}
          >
            {Math.round((hotelPicked / hotelCount) * 100)}%
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(300px, 1fr))' },
          gap: { xs: 1.5, sm: 2 }
        }}
      >
        {selectedTrip.hotels?.map((hotel: any) => (
          <Box
            key={hotel.id}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: { xs: 1.5, sm: 2 },
              borderRadius: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)'
              }
            }}
            onClick={() => {
              setSelectedHotel(hotel);
              setCurrentView('guests');
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  mb: 2,
                  width: 'calc(100% - 100px)'
                }}
              >
                🏨 {hotel.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  mb: 2,
                  background: 'rgba(255,255,255,0.05)',
                  p: 1,
                  borderRadius: '1rem'
                }}
              >
                🕐 {hotel.guests[0]?.tripStartTime}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography sx={{ fontSize: '0.9rem' }}>
                👥 {hotel.guests.length} Booking{hotel.guests.length > 1 && 's'}
              </Typography>
              <Box
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '1rem',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}
              >
                {getArrivedCount(hotel.guests)}/{hotel.guests.length} Onboarded
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DriverDashboardHotelView;
