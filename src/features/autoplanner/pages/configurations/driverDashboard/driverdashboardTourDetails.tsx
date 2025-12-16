import { Typography, Box, Button, CircularProgress } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { CheckCircleIcon, CheckIcon } from 'lucide-react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { getCurrentDate } from '../../../../../utils/commonFunctions';
import { keyframes } from '@emotion/react';

const DriverDashboardTourDetails = ({
  handleStatus,
  shouldDisableStartButton,
  trips,
  loadingTrips,
  handleTripStatus,
  setSelectedTrip,
  handleTripCompleted,
  isSkippingTrip,
  handleSkipButtonClick,
  setCurrentView,
  isPVTorGRP,
  isLoading,
  driverProfile
}: any) => {
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

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: '1200px', margin: '0 auto' }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.8rem' },
              fontWeight: 'bold',
              color: '#2d3748'
            }}
          >
            Today's Tours
          </Typography>
        </Box>
        <Typography
          variant='body1'
          sx={{
            opacity: 0.9,
            fontWeight: 300,
            fontSize: '0.9rem'
          }}
        >
          {getCurrentDate(driverProfile.timezone)}
        </Typography>
      </Box>

      {isLoading && (
        <Box
          sx={{
            height: '50vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',

            animation: `${fadeIn} 0.6s ease-in-out`
          }}
        >
          <CircularProgress size={70} thickness={5} sx={{ color: '#black', mb: 3 }} />
          <Typography
            variant='h6'
            sx={{
              fontWeight: 500,
              letterSpacing: 1,
              fontSize: '1.3rem',
              textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}
          >
            🔄 Loading trips...
          </Typography>
        </Box>
      )}

      {!isLoading && (!trips || trips.length === 0) && (
        <Box
          sx={{
            height: '50vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeSlideIn 0.6s ease-in-out',
            textAlign: 'center'
          }}
        >
          <Typography
            variant='h6'
            sx={{
              fontSize: '1.3rem',
              color: '#4a5568',
              fontWeight: 600,
              mb: 1
            }}
          >
            🚫 No Trips Assigned Today
          </Typography>
          <Typography
            sx={{
              fontSize: '1rem',
              color: '#718096'
            }}
          >
            Please check back later or contact your coordinator.
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(auto-fit, minmax(280px, 1fr))',
            md: 'repeat(auto-fit, minmax(320px, 1fr))'
          },
          gap: { xs: 1, sm: 1.5, md: 2 },
          px: { xs: 1, sm: 2 },
          py: { xs: 1, sm: 2 }
        }}
      >
        {trips?.map((trip: any) => (
          <Box
            key={trip.id}
            sx={{
              background: 'white',
              p: { xs: 1.5, sm: 2, md: 2.5 },
              borderRadius: { xs: '0.75rem', sm: '1rem' },
              boxShadow: {
                xs: '0 2px 12px rgba(0,0,0,0.06)',
                sm: '0 4px 20px rgba(0,0,0,0.08)'
              },
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid #e2e8f0',
              minHeight: { xs: 'auto', sm: '200px' },
              '&:hover': {
                transform: { xs: 'none', sm: 'translateY(-2px)' },
                boxShadow: {
                  xs: '0 4px 16px rgba(102, 126, 234, 0.12)',
                  sm: '0 8px 30px rgba(102, 126, 234, 0.15)'
                }
              },
              '&:active': {
                transform: { xs: 'scale(0.98)', sm: 'translateY(-2px)' },
                transition: 'transform 0.1s ease'
              }
            }}
            onClick={() => {
              setSelectedTrip(trip);
              if (isPVTorGRP(trip.tourName)) {
                setCurrentView('guests');
              } else {
                setCurrentView('hotels');
              }
            }}
            role='button'
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedTrip(trip);
                if (isPVTorGRP(trip.tourName)) {
                  setCurrentView('guests');
                } else {
                  setCurrentView('hotels');
                }
              }
            }}
          >
            <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: { xs: 0.5, sm: 1 },
                  mb: { xs: 1, sm: 1.5 },
                  flexDirection: { xs: 'column', sm: 'row' }
                }}
              >
                <Typography
                  sx={{
                    color: '#667eea',
                    fontSize: {
                      xs:
                        trip.tourName === 'PVT' ||
                        trip.tourName === 'GRP' ||
                        trip.tourName === 'TRANSFER' ||
                        trip.tourName === 'RLR'
                          ? '0.75rem'
                          : '0.9rem',
                      sm:
                        trip.tourName === 'PVT' ||
                        trip.tourName === 'GRP' ||
                        trip.tourName === 'TRANSFER' ||
                        trip.tourName === 'RLR'
                          ? '0.8rem'
                          : '1rem'
                    },
                    fontWeight: 'bold',
                    lineHeight: 1.2,
                    wordBreak: 'break-word',
                    width: { xs: '100%', sm: '82%' },
                    mb: { xs: 0.5, sm: 0 }
                  }}
                >
                  {trip.tourName === 'PVT' ||
                  trip.tourName === 'GRP' ||
                  trip.tourName === 'TRANSFER' ||
                  trip.tourName === 'RLR'
                    ? `${trip.fromLocation} ➜ ${trip.toLocation}`
                    : trip.tourName}
                </Typography>
                <Typography
                  sx={{
                    color: '#667eea',
                    fontSize: { xs: '0.85rem', sm: '1rem' },
                    fontWeight: 'bold',
                    alignSelf: { xs: 'flex-start', sm: 'flex-start' }
                  }}
                >
                  {`[${trip.mode}]`}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: { xs: 1.5, sm: 1 },
                  flexWrap: 'wrap'
                }}
              >
                <Box
                  sx={{
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 0.4, sm: 0.5 },
                    borderRadius: '1rem',
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  🕐 {trip.timeFrom}
                </Box>
              </Box>

              {loadingTrips !== 'Driver' && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: { xs: 1, sm: 1 },
                    flexWrap: { xs: 'wrap', sm: 'nowrap' }
                  }}
                >
                  <Typography
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: '#718096',
                      fontSize: { xs: '0.85rem', sm: '0.9rem' },
                      flex: '0 0 auto'
                    }}
                  >
                    👥 {trip.totalGuests} Guests
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: { xs: 0.5, sm: 1 },
                      alignItems: 'center',
                      flex: '0 0 auto'
                    }}
                  >
                    {loadingTrips !== trip.id &&
                      handleStatus(trip) === 'Start Trip' &&
                      trip.status !== 'Intransit' &&
                      trip.status !== 'Skipped' && (
                        <Button
                          variant='outlined'
                          disabled={
                            shouldDisableStartButton(trips, trip) || isSkippingTrip
                          }
                          onClick={event => handleSkipButtonClick(event, trip)}
                          sx={{
                            background:
                              'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                            color: '#6c757d',
                            border: '2px solid #dee2e6',
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 0.8, sm: 1 },
                            borderRadius: '1rem',
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            fontWeight: 600,
                            textTransform: 'none',
                            transition: 'all 0.3s ease',
                            width: { xs: 'auto', sm: 'auto' },
                            minWidth: { xs: '80px', sm: '100px' },
                            boxShadow: '0 2px 8px rgba(108, 117, 125, 0.2)',
                            position: 'relative',
                            padding: '8px !important',
                            overflow: 'hidden',
                            opacity: isSkippingTrip ? 0.7 : 1,
                            '&:hover': {
                              background: isSkippingTrip
                                ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                                : 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
                              borderColor: isSkippingTrip ? '#dee2e6' : '#adb5bd',
                              color: isSkippingTrip ? '#6c757d' : '#495057',
                              transform: {
                                xs: 'none',
                                sm: isSkippingTrip ? 'none' : 'translateY(-1px)'
                              },
                              boxShadow: isSkippingTrip
                                ? '0 2px 8px rgba(108, 117, 125, 0.2)'
                                : '0 4px 12px rgba(108, 117, 125, 0.3)'
                            },
                            '&:active': {
                              transform: { xs: 'scale(0.98)', sm: 'translateY(0)' },
                              boxShadow: '0 2px 4px rgba(108, 117, 125, 0.2)'
                            }
                          }}
                        >
                          ⏭️ Skip
                        </Button>
                      )}

                    {handleTripCompleted(trip) === 'complete' ||
                    handleTripCompleted(trip) === 'started' ||
                    handleTripCompleted(trip) === 'skipped' ? (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: { xs: 'center', sm: 'flex-start' },
                          gap: 1,
                          color:
                            handleTripCompleted(trip) === 'skipped'
                              ? '#f59e0b'
                              : '#28a745',
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          fontWeight: 600,
                          opacity: 0.8,
                          p: { xs: 1, sm: 0 }
                        }}
                      >
                        {handleTripCompleted(trip) === 'complete' ? (
                          <CheckCircleIcon />
                        ) : handleTripCompleted(trip) === 'skipped' ? (
                          <SkipNextIcon
                            sx={{
                              fontSize: { xs: '1rem', sm: '1.2rem' },
                              color: '#f59e0b',
                              animation: 'skipPulse 2s infinite',
                              '@keyframes skipPulse': {
                                '0%, 100%': {
                                  transform: 'scale(1)',
                                  opacity: 1
                                },
                                '50%': {
                                  transform: 'scale(1.1)',
                                  opacity: 0.7
                                }
                              }
                            }}
                          />
                        ) : (
                          <DirectionsCarIcon
                            sx={{
                              fontSize: { xs: '1rem', sm: '1.2rem' },
                              color: '#28a745',
                              animation: 'bounce 1.5s infinite',
                              '@keyframes bounce': {
                                '0%, 20%, 50%, 80%, 100%': {
                                  transform: 'translateY(0)'
                                },
                                '40%': { transform: 'translateY(-4px)' },
                                '60%': { transform: 'translateY(-2px)' }
                              }
                            }}
                          />
                        )}

                        <Typography
                          variant='body2'
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            color:
                              handleTripCompleted(trip) === 'skipped'
                                ? '#f59e0b'
                                : '#6c757d',
                            textAlign: { xs: 'center', sm: 'left' }
                          }}
                        >
                          {handleTripCompleted(trip) === 'complete'
                            ? 'Trip Completed'
                            : handleTripCompleted(trip) === 'skipped'
                            ? 'Trip Skipped'
                            : 'Intransit'}
                        </Typography>
                      </Box>
                    ) : (handleStatus(trip) === 'Completed' ||
                        handleStatus(trip) === 'Start Trip') &&
                      handleTripCompleted(trip) !== 'complete' &&
                      handleTripCompleted(trip) !== 'started' &&
                      handleTripCompleted(trip) !== 'skipped' ? (
                      <Button
                        variant='contained'
                        disabled={shouldDisableStartButton(trips, trip)}
                        startIcon={
                          loadingTrips === trip.id ? (
                            <CircularProgress size={16} sx={{ color: '#fff' }} />
                          ) : handleStatus(trip) === 'Start Trip' ? (
                            <PlayArrowIcon />
                          ) : (
                            <CheckIcon />
                          )
                        }
                        onClick={(event: any) => {
                          event.stopPropagation();
                          if (!shouldDisableStartButton(trips, trip)) {
                            handleTripStatus(trip);
                            setSelectedTrip(trip);
                          }
                        }}
                        sx={{
                          backgroundColor:
                            handleStatus(trip) === 'Start Trip'
                              ? '#007bff'
                              : handleStatus(trip) === 'Intransit'
                              ? '#6c757d'
                              : '#198754',
                          '&:hover:not(:disabled)': {
                            backgroundColor:
                              handleStatus(trip) === 'Start Trip'
                                ? '#0056b3'
                                : handleStatus(trip) === 'Intransit'
                                ? '#5a6268'
                                : '#157347'
                          },
                          borderRadius: '8px',
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: '0.85rem',
                          minWidth: 100,
                          px: 2,
                          py: 1,
                          textTransform: 'none',
                          transition: '0.3s ease',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                      >
                        {loadingTrips === trip.id
                          ? handleStatus(trip) === 'Start Trip'
                            ? 'Starting...'
                            : 'Completing...'
                          : shouldDisableStartButton(trips, trip) &&
                            handleStatus(trip) === 'Start Trip'
                          ? 'Upcoming...'
                          : handleStatus(trip) === 'Start Trip'
                          ? 'Start Trip'
                          : 'Complete'}
                      </Button>
                    ) : handleStatus(trip) === 'Intransit' ? (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: { xs: 'center', sm: 'flex-start' },
                          gap: 1,
                          color: '#ff6b35',
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          fontWeight: 600,
                          position: 'relative',
                          p: { xs: 1, sm: 0 }
                        }}
                      >
                        <DirectionsCarIcon
                          sx={{
                            fontSize: { xs: '1rem', sm: '1.2rem' },
                            color: '#28a745',
                            animation: 'bounce 1.5s infinite',
                            '@keyframes bounce': {
                              '0%, 20%, 50%, 80%, 100%': {
                                transform: 'translateY(0)'
                              },
                              '40%': { transform: 'translateY(-4px)' },
                              '60%': { transform: 'translateY(-2px)' }
                            }
                          }}
                        />
                        <Typography
                          variant='body2'
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            animation: 'fadeInOut 2s infinite',
                            '@keyframes fadeInOut': {
                              '0%, 100%': { opacity: 1 },
                              '50%': { opacity: 0.6 }
                            }
                          }}
                        >
                          {handleStatus(trip)}
                        </Typography>
                      </Box>
                    ) : handleStatus(trip) === 'Skipped' ? (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: { xs: 'center', sm: 'flex-start' },
                          gap: 1,
                          color: '#f59e0b',
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          fontWeight: 600,
                          position: 'relative',
                          p: { xs: 1, sm: 0 }
                        }}
                      >
                        <SkipNextIcon
                          sx={{
                            fontSize: { xs: '1rem', sm: '1.2rem' },
                            color: '#f59e0b',
                            animation: 'skipGlow 3s infinite',
                            '@keyframes skipGlow': {
                              '0%, 100%': {
                                filter: 'drop-shadow(0 0 5px rgba(245, 158, 11, 0.5))',
                                transform: 'scale(1)'
                              },
                              '50%': {
                                filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.8))',
                                transform: 'scale(1.05)'
                              }
                            }
                          }}
                        />
                        <Typography
                          variant='body2'
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            animation: 'skipTextGlow 3s infinite',
                            '@keyframes skipTextGlow': {
                              '0%, 100%': {
                                textShadow: '0 0 5px rgba(245, 158, 11, 0.3)'
                              },
                              '50%': {
                                textShadow: '0 0 10px rgba(245, 158, 11, 0.6)'
                              }
                            }
                          }}
                        >
                          {handleStatus(trip)}
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: { xs: 'center', sm: 'flex-start' },
                          gap: 1,
                          color: '#495057',
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          fontWeight: 600,
                          position: 'relative',
                          p: { xs: 1, sm: 0 }
                        }}
                      >
                        <AccessTimeIcon
                          sx={{
                            fontSize: { xs: '1rem', sm: '1.2rem' },
                            color: '#6c757d',
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                              '0%': { opacity: 1, transform: 'scale(1)' },
                              '50%': { opacity: 0.7, transform: 'scale(1.1)' },
                              '100%': { opacity: 1, transform: 'scale(1)' }
                            }
                          }}
                        />
                        <Typography
                          variant='body2'
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            animation: 'glow 3s infinite',
                            '@keyframes glow': {
                              '0%, 100%': {
                                textShadow: '0 0 5px rgba(73, 80, 87, 0.3)'
                              },
                              '50%': {
                                textShadow: '0 0 10px rgba(73, 80, 87, 0.6)'
                              }
                            }
                          }}
                        >
                          {handleStatus(trip)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DriverDashboardTourDetails;
