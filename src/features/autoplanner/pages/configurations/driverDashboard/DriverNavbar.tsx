import { Box, Typography, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../../app/redux/hooks';
import { capitalizeFirstLetter } from '../../../../../utils/commonFunctions';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import {
  useCallActions,
  useCommanDashboardStates,
  useDashboardEffects,
  useDashboardUIActions,
  useGuestUtils,
  useTripActions,
  useTripUtils
} from './driverDashboardHook';
import { fadeIn } from './driverDashboardAnimation';
import DriverDashboardTourView from './driverDashboardInitialTourView';
import DriverDashboardHotelView from './driverDashboardHotelView';
import DriverDashboardGuestView from './driverDashboardGuestView';
import DriverDashboardDialogs from './driverDashboarDialog';
import DriverDashboardTourDetails from './driverdashboardTourDetails';
import DriverTripManager from './DriverDashboard';

export default function DriverNavbar() {
  const data = useAppSelector(state => state.driverTripData?.data);
  const load = useAppSelector(state => state.UpdateGuest?.isLoading);
  const profile = useAppSelector(state => state.myProfile);
  const { isLoading: logoutLoader } = useAppSelector(state => state.logout);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isPVTorGRP = (tourName: string) => {
    return (
      tourName.toLowerCase().includes('pvt') ||
      tourName.toLowerCase().includes('grp') ||
      tourName.toLowerCase().includes('transfer') ||
      tourName.toLowerCase().includes('rlr')
    );
  };

  const {
    setTrips,
    arrivedGuestID,
    setArrived,
    noShow,
    setIsSaving,
    setNoShow,
    selectedTrip,
    setSelectedTrip,
    selectedHotel,
    setSelectedHotel,
    currentView,
    setCurrentView,
    hotelPicked,
    setHotelPicked,
    refreshLoader,
    setRefreshLoader,
    setHasUnsavedChanges,
    setIsDisable,
    setIsDisableID,
    isLoading,
    setIsLoading,
    driverProfile,
    setDriverProfile,
    phoneNo,
    setPhoneNo,
    isLogout,
    setIsLogout,
    showSkipSuccess,
    setShowSkipSuccess,
    skippedTripName,
    setSkippedTripName,
    isCall,
    setIsCall,
    isSkippingTrip,
    setIsSkippingTrip,
    isSkipDialogOpen,
    setIsSkipDialogOpen,
    tripToSkip,
    setTripToSkip,
    setHotelCount,
    setLoadingTrips
  } = useCommanDashboardStates();

  const { handleSkipTrip } = useTripActions({
    selectedHotel,
    setSelectedHotel,
    selectedTrip,
    setSelectedTrip,
    arrivedGuestID,
    setArrived,
    noShow,
    setNoShow,
    setHasUnsavedChanges,
    driverProfile,
    setLoadingTrips,
    setCurrentView,
    setIsSkippingTrip,
    setIsSkipDialogOpen,
    setSkippedTripName,
    setShowSkipSuccess,
    setIsSaving,
    setTrips,
    isPVTorGRP
  });

  const {
    handleBackNavigation,
    getHeaderTitle,
    showBackButton,
    handleManualRefresh,
    handleLogout
  } = useDashboardUIActions({
    setPhoneNo,
    setIsCall,
    setTripToSkip,
    setLoadingTrips,
    setIsSkipDialogOpen,
    selectedHotel,
    setSelectedHotel,
    selectedTrip,
    currentView,
    setCurrentView,
    setRefreshLoader,
    setTrips,
    driverProfile,
    setIsLoading,
    profile,
    navigate,
    setIsLogout
  });
  const { handleCall, handleWpCall } = useCallActions();

  useDashboardEffects({
    data,
    selectedTrip,
    setSelectedTrip,
    setTrips,
    driverProfile,
    setDriverProfile,
    profile,
    dispatch,
    setIsLoading,
    setHotelCount,
    setHotelPicked,
    hotelPicked,
    setIsDisable,
    setIsDisableID
  });

  return (
    <Box
      sx={{
        // minHeight: '100vh',
        backgroundColor: '#f5f7fa',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible'
        // height: '100vh'
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: { xs: '0.5rem', sm: '1rem' },
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {showBackButton() && (
              <Box
                sx={{
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '0.5rem',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)'
                  }
                }}
                onClick={handleBackNavigation}
                tabIndex={0}
                role='button'
                onKeyDown={(event: any) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    handleBackNavigation();
                  }
                }}
              >
                <Icon icon='bx:arrow-back' width='24' height='24' />
              </Box>
            )}
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: '1.0rem', sm: '1.0rem' },
                  fontWeight: 'bold',
                  mb: 0.5,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {getHeaderTitle() === 'Driver Dashboard' && (
                  <Icon icon='healthicons:truck-driver' width='24' height='24' />
                )}
                {getHeaderTitle()}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', opacity: 0.9 }}>
                {driverProfile
                  ? capitalizeFirstLetter(driverProfile.displayName)
                  : 'Loading...'}{' '}
                {driverProfile.mappedVehicle
                  ? `• ${driverProfile.mappedVehicle.toUpperCase()}`
                  : ''}
              </Typography>
            </Box>
          </Box>
          {currentView === 'tours' && (
            <DriverDashboardTourView
              handleManualRefresh={handleManualRefresh}
              isLoading={isLoading}
              refreshLoader={refreshLoader}
              setIsLogout={setIsLogout}
            />
          )}
        </Box>
      </Box>
      <DriverDashboardDialogs
        isLogout={isLogout}
        setIsLogout={setIsLogout}
        logoutLoader={logoutLoader}
        handleLogout={handleLogout}
        isCall={isCall}
        setIsCall={setIsCall}
        phoneNo={phoneNo}
        handleWpCall={handleWpCall}
        handleCall={handleCall}
        isSkipDialogOpen={isSkipDialogOpen}
        setIsSkipDialogOpen={setIsSkipDialogOpen}
        isSkippingTrip={isSkippingTrip}
        handleSkipTrip={handleSkipTrip}
        tripToSkip={tripToSkip}
        showSkipSuccess={showSkipSuccess}
        setShowSkipSuccess={setShowSkipSuccess}
        skippedTripName={skippedTripName}
      />
    </Box>
  );
}
