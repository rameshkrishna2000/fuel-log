import React from 'react';
import { Box, TextField, InputAdornment, Typography } from '@mui/material';
import { Icon } from '@iconify/react';

interface DriverDashboardGuestViewProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedTrip: any;
  selectedHotel: any;
  getArrivedCount: (guests: any[]) => number;
  filteredGuests: (guests: any[]) => any[];
  handleOpenCallOption: (contact: string) => void;
  handlePassengerArrival: (guestId: string | number, arrived: boolean) => void;
  disable: boolean;
}

const DriverDashboardGuestView: React.FC<DriverDashboardGuestViewProps> = ({
  searchQuery,
  setSearchQuery,
  selectedTrip,
  selectedHotel,
  getArrivedCount,
  filteredGuests,
  handleOpenCallOption,
  handlePassengerArrival,
  disable
}) => {
  const guests = selectedHotel ? selectedHotel.guests : selectedTrip.guests;

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: '800px', margin: '0 auto' }}>
      <TextField
        fullWidth
        placeholder='Search guests by name or contact...'
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        sx={{ mb: 1 }}
        InputProps={{
          startAdornment: <InputAdornment position='start'>🔍</InputAdornment>
        }}
      />

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
            {getArrivedCount(guests)}/{guests.length}
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#718096' }}>
            {getArrivedCount(guests) > 1 ? 'Families' : 'Family'} Picked
          </Typography>
        </Box>

        <Box
          sx={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: `conic-gradient(#48bb78 ${
              (getArrivedCount(guests) / guests.length) * 360
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
            {Math.round((getArrivedCount(guests) / guests.length) * 100)}%
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        {filteredGuests(guests).length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              p: 4,
              backgroundColor: '#fff5f5',
              borderRadius: '1rem',
              border: '2px dashed #feb2b2',
              color: '#c53030',
              mt: 2
            }}
          >
            <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1 }}>
              😕 No Guests Found
            </Typography>
            <Typography variant='body2'>
              Try changing your search terms or check the guest list.
            </Typography>
          </Box>
        ) : (
          filteredGuests(guests).map((guest: any, index: any) => (
            <Box key={guest.id}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  p: { xs: 1.5, sm: 2 },
                  gap: { xs: 1, sm: 1.5 },
                  backgroundColor: 'white',
                  borderRadius:
                    index === 0
                      ? '1rem 1rem 0 0'
                      : index ===
                        (selectedHotel
                          ? selectedHotel.guests.length
                          : selectedTrip.guests.length) -
                          1
                      ? '0 0 1rem 1rem'
                      : '0',
                  border: '1px solid #e2e8f0',
                  borderTop: index === 0 ? '1px solid #e2e8f0' : 'none'
                }}
              >
                <Box
                  sx={{
                    width: { xs: '40px', sm: '48px' },
                    height: { xs: '40px', sm: '48px' },
                    borderRadius: '50%',
                    backgroundColor: '#667eea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: { xs: '1rem', sm: '1.1rem' }
                  }}
                >
                  {guest.name.charAt(0)}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: '600',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {guest.name}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                      flexWrap: 'wrap'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        backgroundColor: '#e8f4fd',
                        px: 1,
                        py: 0.25,
                        borderRadius: '0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: '#1976d2'
                      }}
                    >
                      👨‍👩‍👧‍👦 {guest.adults} Adult{guest.adults !== 1 ? 's' : ''}
                      {guest.children > 0 &&
                        `, ${guest.children} Child${guest.children !== 1 ? 'ren' : ''}`}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexWrap: 'wrap'
                    }}
                  >
                    {guest.contact && (
                      <Typography
                        sx={{
                          fontSize: '0.8rem',
                          color: '#667eea',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                        onClick={() => handleOpenCallOption(guest.contact)}
                      >
                        📞 {guest.contact}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Typography sx={{ fontSize: '0.8rem', color: '#718096' }}>
                  {guest.arrived === 'Arrived' || guest.arrived === true ? (
                    <Icon
                      icon='teenyicons:tick-circle-outline'
                      width='24'
                      height='24'
                      style={{ color: '#48bb78' }}
                    />
                  ) : guest.arrived === 'Not Arrived' || guest.arrived === false ? (
                    <Icon
                      icon='healthicons:no-outline-24px'
                      width='24'
                      height='24'
                      style={{ color: '#f56565' }}
                    />
                  ) : (
                    <Icon
                      icon='tabler:clock'
                      width='24'
                      height='24'
                      style={{ color: 'orange' }}
                    />
                  )}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    gap: 0.5,
                    width: '100%'
                  }}
                >
                  <Box
                    sx={{
                      px: { xs: 1, sm: 1.5 },
                      py: 1,
                      borderRadius: '0.5rem',
                      width: '48%',
                      border: '1px solid #f56565',
                      cursor: disable ? 'not-allowed' : 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      textAlign: 'center',
                      backgroundColor:
                        guest.arrived === 'Not Arrived' || guest.arrived === false
                          ? '#f56565'
                          : 'transparent',
                      color:
                        guest.arrived === 'Not Arrived' || guest.arrived === false
                          ? 'white'
                          : '#f56565',
                      opacity: disable ? 0.5 : 1,
                      pointerEvents: disable ? 'none' : 'auto',
                      '&:hover': {
                        opacity: disable ? 0.5 : 0.8
                      }
                    }}
                    onClick={() => !disable && handlePassengerArrival(guest.id, false)}
                    role='button'
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        !disable && handlePassengerArrival(guest.id, false);
                      }
                    }}
                  >
                    ❌ No Show
                  </Box>
                  <Box
                    sx={{
                      px: { xs: 1, sm: 1.5 },
                      py: 1,
                      borderRadius: '0.5rem',
                      border: '1px solid #48bb78',
                      width: '48%',
                      cursor: disable ? 'not-allowed' : 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      textAlign: 'center',
                      backgroundColor:
                        guest.arrived === 'Arrived' || guest.arrived === true
                          ? '#48bb78'
                          : 'transparent',
                      color:
                        guest.arrived === 'Arrived' || guest.arrived === true
                          ? 'white'
                          : '#48bb78',
                      opacity: disable ? 0.5 : 1,
                      pointerEvents: disable ? 'none' : 'auto',
                      '&:hover': {
                        opacity: disable ? 0.5 : 0.8
                      }
                    }}
                    onClick={() => !disable && handlePassengerArrival(guest.id, true)}
                    tabIndex={0}
                    role='button'
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        !disable && handlePassengerArrival(guest.id, true);
                      }
                    }}
                  >
                    ✅ Onboarded
                  </Box>
                </Box>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default DriverDashboardGuestView;
