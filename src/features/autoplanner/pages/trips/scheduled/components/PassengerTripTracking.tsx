import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
  Slide,
  Snackbar,
  Tooltip
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CallIcon from '@mui/icons-material/Call';
import NavigationIcon from '@mui/icons-material/Navigation';
import NearMeIcon from '@mui/icons-material/NearMe';
import GpsOffIcon from '@mui/icons-material/GpsOff';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import {
  calculateDistanceAndDuration,
  calculatePercentage,
  convertEpochToStartDateString,
  currentLocation,
  findAddress,
  metersToKilometers,
  secondsToHrMin
} from '../../../../../../utils/commonFunctions';
import { useLocation } from 'react-router-dom';
import GoogleMap from '../../../../../../common/components/maps/googlemap/GoogleMap';
import {
  map,
  updateCenter,
  updateZoom
} from '../../../../../../common/redux/reducer/commonSlices/mapSlice';
import GoogleMarkers from '../../../../../../common/components/maps/googlemarkers/GoogleMarkers';
import {
  createConnection,
  updateData
} from '../../../../../../common/redux/reducer/commonSlices/websocketSlice';
import GoogleTripDirections from '../../../../../../common/components/maps/googledirection/GoogleTripDirections';
import {
  liveTrackingAction,
  transportReachedAction
} from '../../../../../../common/redux/reducer/commonSlices/tripTrackingSlice';
import TripCompletionUI from './TripCompleted';

interface TripData {
  source: string;
  destination: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  tourName: string;
  startTimeStamp: number;
  vehicleNumber: string;
  agentName: string;
  driverContactNumber: string;
  driverName: string;
  driverRating: number;
  tripDuration: string;
  distance: string;
  token: string;
  estimatedArrival: string;
  currentLocation: string;
  progress: number;
}

const PassengerTripTracking = () => {
  const [tripData, setTripData] = useState<any | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [finish, setFinish] = useState<boolean>(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [distance, setDistance] = useState<number | any>('-');
  const [duration, setDuration] = useState<number | any>('-');
  const [progress, setProgress] = useState<number>(0);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [myLocation, setMyLocation] = useState<string>('Loading...');
  const [tripID, setTripID] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentLocations, setCurrentLocations] = useState<string>('loading...');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const sm = useMediaQuery(theme.breakpoints.down('md'));

  const liveTracking = useAppSelector(state => state.liveTracking);
  const { connection, data } = useAppSelector(state => state.websocket);

  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const tripId = query.get('id');

  if (tripID === null && !!tripId) setTripID(tripId);

  const dispatch = useAppDispatch();

  const isMobileDevice = () => {
    return /Mobi|Android|iPhone/i.test(navigator.userAgent);
  };

  const viewVehiclelocation = () => {
    dispatch(updateCenter([vehicleData]));
    dispatch(updateZoom([vehicleData]));
  };

  const viewMylocation = () => {
    if (location !== null) {
      setLocation(null);
      return;
    } else {
      currentLocation()
        .then((res: any) => {
          const myLocation = {
            id: 1,
            name: 'you',
            type: 'youAreHere',
            lat: res?.coords?.latitude,
            lng: res?.coords?.longitude,
            info: {
              head: 'You Are Here'
            }
          };
          setLocation(myLocation);
        })
        .catch(error => {
          return;
        });
    }
  };

  const PhoneButton = ({ phoneNumber }: { phoneNumber: string }) => {
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(phoneNumber);
        setCopied(true);
      } catch (error) {}
    };
    const handleClose = () => setCopied(false);
    return isMobileDevice() ? (
      <Button
        variant='contained'
        startIcon={<CallIcon />}
        fullWidth
        component='a'
        href={`tel:${phoneNumber.replace(/\s+/g, '')}`}
        sx={{
          borderRadius: 8,
          textTransform: 'none',
          background: 'linear-gradient(90deg, #4caf50 0%, #43a047 100%)',
          py: 1,
          '&:hover': {
            background: 'linear-gradient(90deg, #43a047 0%, #388e3c 100%)'
          }
        }}
      >
        Call Now
      </Button>
    ) : (
      <>
        <Tooltip title='Click to copy' arrow>
          <Button
            variant='contained'
            startIcon={<CallIcon />}
            fullWidth
            onClick={handleCopy}
            sx={{
              borderRadius: 8,
              textTransform: 'none',
              background: 'linear-gradient(90deg, #4caf50 0%, #43a047 100%)',
              py: 1,
              '&:hover': {
                background: 'linear-gradient(90deg, #43a047 0%, #388e3c 100%)'
              }
            }}
          >
            {phoneNumber}
          </Button>
        </Tooltip>
        <Snackbar
          open={copied}
          autoHideDuration={2000}
          onClose={handleClose}
          message='Phone number copied!'
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </>
    );
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    const data = [location, vehicleData].filter(Boolean);
    if (data.length > 0) {
      dispatch(map(data));
      if (location) {
        dispatch(updateCenter(data));
        dispatch(updateZoom(data));
      }
    } else {
      dispatch(map([]));
    }
  }, [location, vehicleData]);

  useEffect(() => {
    currentLocation()
      .then((res: any) => {
        const getAdrress = async () => {
          const address = await findAddress(
            res?.coords?.latitude,
            res?.coords?.longitude
          );
          setMyLocation(address);
        };
        getAdrress();
      })
      .catch(error => {
        setMyLocation('loading..');
        return;
      });
  }, []);

  useEffect(() => {
    if (connection) {
      connection.onopen = () => {};
      connection.onmessage = (e: any) => {
        dispatch(updateData(JSON.parse(e?.data)));
      };
      connection.onclose = () => {};
    }
    return () => {
      if (connection) connection.close();
    };
  }, [connection]);

  const getAdrress = async () => {
    if (vehicleData) {
      const address = await findAddress(vehicleData.lat, vehicleData.lng);
      setCurrentLocations(address);
    }
  };

  useEffect(() => {
    if (
      vehicleData !== null &&
      liveTracking?.data?.data !== null &&
      liveTracking?.data?.data !== undefined
    ) {
      const routePoints = [
        { lat: vehicleData.lat, lng: vehicleData.lng },
        {
          lat: liveTracking?.data?.data?.startLat,
          lng: liveTracking.data.data?.startLng
        }
      ];
      const value = calculateDistanceAndDuration(routePoints);
      setDistance(value.distance);
      setDuration(value.duration);
      setProgress(
        calculatePercentage(liveTracking?.data?.data?.distance, value.distance)
      );
    }
    getAdrress();
  }, [vehicleData, liveTracking]);

  useEffect(() => {
    if (liveTracking?.data?.data !== null && liveTracking?.data?.data !== undefined) {
      const routePoints = [
        {
          lat: liveTracking?.data?.data?.startLat,
          lng: liveTracking.data.data?.startLng
        },
        {
          lat: liveTracking?.data?.data?.endLat,
          lng: liveTracking.data.data?.endLng
        }
      ];
      const value = calculateDistanceAndDuration(routePoints);
      setTotalDistance(value.distance);
      setTotalDuration(value.duration);
    }
  }, [liveTracking]);

  useEffect(() => {
    if (liveTracking?.data?.data !== null && liveTracking?.data?.data !== undefined) {
      if (connection !== null) connection.close();
      if (liveTracking?.data?.data?.token)
        dispatch(
          createConnection({
            deviceID: liveTracking?.data?.data?.vehicleNumber?.toLowerCase(),
            token: liveTracking?.data?.data?.token
          })
        );
      const trip = {
        ...liveTracking?.data?.data,
        vehicleNumber: liveTracking?.data?.data?.vehicleNumber?.toUpperCase(),
        tripDuration: secondsToHrMin(liveTracking?.data?.data?.duration),
        distance: metersToKilometers(liveTracking?.data?.data?.distance)
      };
      setTripData(trip);
      const locationData = [
        {
          id: 'source',
          name: 'trips',
          lat: vehicleData?.lat,
          lng: vehicleData?.lng,
          info: {
            Mylocation: currentLocations,
            heading: 'Started at :',
            Time: convertEpochToStartDateString(liveTracking.data.data.startTimeStamp)
          }
        },
        {
          id: 'destination',
          name: 'trips',
          lat: liveTracking.data.data?.startLat,
          lng: liveTracking.data.data?.startLng,
          info: {
            Mylocation: liveTracking.data.data.source?.toUpperCase(),
            heading: 'Expected Arrival :',
            Time: `distance ${distance}`
          }
        }
      ];
      if (locationData[0].lat !== undefined && locationData[0].lng !== undefined) {
        setLocations(locationData);
        dispatch(updateZoom(locationData));
        dispatch(updateCenter(locationData));
      }
    }
  }, [liveTracking]);

  useEffect(() => {
    if (liveTracking?.data?.data !== null && liveTracking?.data?.data !== undefined) {
      const locationData = [
        {
          id: 'source',
          name: 'trips',
          lat: vehicleData?.lat,
          lng: vehicleData?.lng,
          info: {
            Mylocation: currentLocations,
            heading: 'Started at :',
            Time: convertEpochToStartDateString(liveTracking.data.data.startTimeStamp)
          }
        },
        {
          id: 'destination',
          name: 'trips',
          type: 'busStop',
          lat: liveTracking.data.data?.startLat,
          lng: liveTracking.data.data?.startLng,
          info: {
            Mylocation: liveTracking.data.data.source?.toUpperCase(),
            heading: 'Expected Arrival :',
            Time: ` ${metersToKilometers(distance)} | ${secondsToHrMin(duration)}`
          }
        }
      ];
      if (locationData[0].lat !== undefined && locationData[0].lng !== undefined) {
        setLocations(locationData);
      }
    }
  }, [liveTracking, vehicleData]);

  useEffect(() => {
    if (data && [data].length > 0) {
      if (data && [data].length > 0) {
        const convertedData = [data].map((item: any) => ({
          id: item.vehicle_number,
          lat: parseFloat(item.latitude),
          lng: parseFloat(item.longitude),
          name: 'bus',
          type: item.vehicle_type || 'bus',
          status: 'online',
          info: {
            speed: `${item.speed} kmph`
          }
        }));
        setVehicleData(convertedData[0]);
      }
    }
  }, [data]);

  useEffect(() => {
    if (tripID) {
      const payload = {
        journeyId: tripID
      };
      dispatch(liveTrackingAction(payload));
    }
  }, [tripID]);

  useEffect(() => {
    if (
      duration === 0 &&
      liveTracking?.data?.data !== null &&
      liveTracking?.data?.data !== undefined
    ) {
      const timeout = setTimeout(() => {
        const payload = {
          uniqueId: liveTracking.data.data.uniqueId,
          date: liveTracking.data.data.tripDate
        };
        if (connection) connection.close();
        dispatch(transportReachedAction(payload));
        setFinish(true);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [duration, liveTracking]);

  if (finish)
    return (
      <TripCompletionUI
        PhoneButton={PhoneButton}
        driverName={tripData?.driverName || 'Loading...'}
        phoneNo={tripData?.driverContactNumber || 'Loading...'}
      />
    );

  if (!tripData)
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: '#f5f7fa'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f2f5 100%)'
          }}
        >
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
            <DirectionsBusIcon sx={{ color: 'white', fontSize: 30 }} />
          </Box>
          <Typography variant='h6' sx={{ fontWeight: 'medium', color: '#1976d2', mb: 1 }}>
            Dear Passenger
          </Typography>
          <Typography variant='body2' sx={{ color: '#666' }}>
            Loading your journey details, just a moment...
          </Typography>
        </Paper>
      </Box>
    );

  if (
    liveTracking?.data?.data?.message === 'trip not valid' ||
    liveTracking?.data?.data?.message === 'trip link expired' ||
    liveTracking?.data?.data?.message === 'id not found' ||
    liveTracking?.data?.data?.message === 'trip completed'
  )
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: '#f5f7fa'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f2f5 100%)'
          }}
        >
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
            <DirectionsBusIcon sx={{ color: 'white', fontSize: 30 }} />
          </Box>
          <Typography variant='h6' sx={{ fontWeight: 'medium', color: '#1976d2', mb: 1 }}>
            Dear Passenger
          </Typography>
          <Typography variant='body2' sx={{ color: '#666' }}>
            {liveTracking?.data?.data?.message === 'trip not valid'
              ? 'Your trip tracking link will be available 10 minutes before the start of your journey.'
              : 'This tracking link is no longer available.'}
          </Typography>
        </Paper>
      </Box>
    );

  if (vehicleData === null) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: '#f5f7fa'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f2f5 100%)'
          }}
        >
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
            <DirectionsBusIcon sx={{ color: 'white', fontSize: 30 }} />
          </Box>
          <Typography variant='h6' sx={{ fontWeight: 'medium', color: '#1976d2', mb: 1 }}>
            Dear Passenger
          </Typography>
          <Typography variant='body2' sx={{ color: '#666' }}>
            Loading your journey details, just a moment...
          </Typography>
        </Paper>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f7fa',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header Bar */}
      <Paper
        elevation={1}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: 0,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          width: '100%'
        }}
      >
        <Box
          sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: '#1976d2',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mr: 1.5
            }}
          >
            <DirectionsBusIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Box width='calc(100% - 50px)'>
            <Typography
              variant={isMobile ? 'body1' : 'h6'}
              sx={{ fontWeight: 'bold', color: '#1976d2', lineHeight: 1.2 }}
            >
              {tripData.tourName}
            </Typography>
            <Typography variant='caption' sx={{ color: '#666' }}>
              {tripData.source} → {tripData.destination}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Google Map Component for Live Tracking */}
      <Box
        sx={{
          borderRadius: 0,
          overflow: 'hidden',
          position: 'relative',
          mt: 7,
          height: '65vh'
        }}
      >
        <GoogleMap legend='dashboard' isTracking={true}>
          <GoogleTripDirections
            locations={locations}
            isDraggable={false}
            showPath={true}
            hideSource={true}
          />
          <GoogleMarkers />
        </GoogleMap>

        {/* Map Control Buttons */}
        <Box
          sx={{
            position: 'absolute',
            bottom: expanded ? 'calc(44vh + 16px)' : 'calc(10vh + 16px)',
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <IconButton
            sx={{
              bgcolor: 'white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
            onClick={viewMylocation}
          >
            {location !== null ? (
              <GpsOffIcon sx={{ color: '#1976d2' }} />
            ) : (
              <MyLocationIcon sx={{ color: '#1976d2' }} />
            )}
          </IconButton>
          <IconButton
            sx={{
              bgcolor: 'white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
            onClick={viewVehiclelocation}
          >
            <NavigationIcon sx={{ color: '#1976d2' }} />
          </IconButton>
        </Box>

        {/* ETA Indicator */}
        <Paper
          elevation={2}
          sx={{
            position: 'absolute',
            top: 55,
            left: '50%',
            transform: 'translateX(-50%)',
            px: 2,
            py: 1,
            borderRadius: 5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(5px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}
        >
          <NearMeIcon sx={{ color: '#1976d2', fontSize: 20 }} />
          <Typography variant='body2' fontWeight='medium'>
            ETA: {secondsToHrMin(duration)}
          </Typography>
        </Paper>
      </Box>

      {/* Trip Details Bottom Sheet */}
      <Slide direction='up' in={true} mountOnEnter unmountOnExit>
        <Paper
          elevation={5}
          sx={{
            borderRadius: '24px 24px 0 0',
            backgroundColor: '#fff',
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: expanded ? '70vh' : '35vh',
            overflow: 'hidden',
            transition: 'all 0.3s ease-in-out',
            boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Drag Handle */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%'
            }}
            onClick={toggleExpanded}
          >
            <Box
              sx={{
                width: 40,
                height: 4,
                bgcolor: '#e0e0e0',
                borderRadius: 5,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#1976d2'
                }
              }}
            />
          </Box>
          {/* Panel Content */}
          <Box sx={{ overflow: 'auto', flex: 1, p: isMobile ? 2 : 3, pt: 1 }}>
            {/* Live Tracking Badge */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  bgcolor: '#e3f2fd',
                  px: 2,
                  py: 0.5,
                  borderRadius: 5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#4caf50',
                    animation: 'blink 1.5s infinite',
                    '@keyframes blink': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.4 },
                      '100%': { opacity: 1 }
                    }
                  }}
                />
                <Typography variant='caption' fontWeight='medium' color='#1976d2'>
                  LIVE TRACKING
                </Typography>
              </Box>
            </Box>

            {/* Trip Progress */}
            <Box sx={{ mb: 3, px: isMobile ? 1 : 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}
                >
                  <Typography variant='body2' color='text.secondary'>
                    Transport
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: sm ? '10px' : '14px'
                    }}
                    fontWeight='medium'
                  >
                    {currentLocations}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end'
                  }}
                >
                  <Typography variant='body2' color='text.secondary'>
                    Boarding Point
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: sm ? '10px' : '14px'
                    }}
                    fontWeight='medium'
                  >
                    {tripData.source}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  position: 'relative',
                  height: 5,
                  bgcolor: '#eeeeee',
                  borderRadius: 4,
                  mb: 1,
                  mt: 2
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    CURRENT LOCATION
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: sm ? '10px' : '14px'
                    }}
                    fontWeight='medium'
                    color='#1976d2'
                  >
                    {myLocation}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant='caption' color='text.secondary'>
                    ARRIVAL
                  </Typography>
                  <Typography variant='body2' fontWeight='medium' color='#4caf50'>
                    {secondsToHrMin(duration)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Trip Stats */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-around',
                mb: 3,
                px: isMobile ? 0 : 2
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: '#f8f9fa',
                  minWidth: 80
                }}
              >
                <Typography variant='caption' color='text.secondary'>
                  DISTANCE
                </Typography>
                <Typography variant='body2' fontWeight='medium'>
                  {isNaN(tripData.distance)
                    ? metersToKilometers(totalDistance)
                    : metersToKilometers(tripData.distance)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: '#f8f9fa',
                  minWidth: 80
                }}
              >
                <Typography variant='caption' color='text.secondary'>
                  DURATION
                </Typography>
                <Typography variant='body2' fontWeight='medium'>
                  {isNaN(tripData.tripDuration)
                    ? secondsToHrMin(totalDuration)
                    : secondsToHrMin(tripData.tripDuration)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: '#f8f9fa',
                  minWidth: 80
                }}
              >
                <Typography variant='caption' color='text.secondary'>
                  VEHICLE
                </Typography>
                <Typography variant='body2' fontWeight='medium'>
                  {tripData.vehicleNumber}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ px: isMobile ? 0 : 1 }}>
              {/* Driver Details */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: '#f8f9fa',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <Typography
                    variant='subtitle1'
                    sx={{ fontWeight: 'bold', mb: 2, color: '#555' }}
                  >
                    Your Driver
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50,
                        bgcolor: '#1976d2',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant='body2' fontWeight='medium'>
                        {tripData.driverName}
                      </Typography>
                    </Box>
                  </Box>
                  <PhoneButton phoneNumber={tripData.driverContactNumber} />
                </Paper>
              </Grid>

              {/* Vehicle Details - Only for larger screens in non-expanded view */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: '#f8f9fa',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                    border: '1px solid #e0e0e0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography
                    variant='subtitle1'
                    sx={{ fontWeight: 'bold', mb: 2, color: '#555' }}
                  >
                    Vehicle Details
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'rgba(25, 118, 210, 0.1)',
                          width: 36,
                          height: 36
                        }}
                      >
                        <DirectionsCarIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          VEHICLE NUMBER
                        </Typography>
                        <Typography variant='body2' fontWeight='medium'>
                          {tripData.vehicleNumber}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'rgba(25, 118, 210, 0.1)',
                          width: 36,
                          height: 36
                        }}
                      >
                        <DirectionsBusIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          VEHICLE TYPE
                        </Typography>
                        <Typography variant='body2' fontWeight='medium'>
                          Seater
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Additional Info in expanded view */}
            <Paper
              elevation={0}
              sx={{
                mt: 3,
                p: 2,
                bgcolor: '#fffde7',
                borderRadius: 2,
                border: '1px solid #fff9c4',
                mx: isMobile ? 1 : 0
              }}
            >
              <Typography
                variant='subtitle2'
                sx={{ fontWeight: 'medium', color: '#ff8f00', mb: 1 }}
              >
                Trip Notes
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Please arrive at the boarding point at least 10 minutes early.
              </Typography>
            </Paper>
          </Box>
        </Paper>
      </Slide>
    </Box>
  );
};

export default PassengerTripTracking;
