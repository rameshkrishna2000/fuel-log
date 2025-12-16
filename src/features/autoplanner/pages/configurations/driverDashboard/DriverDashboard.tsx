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

export default function DriverTripManager() {
  const data = useAppSelector(state => state.driverTripData?.data);
  const load = useAppSelector(state => state.UpdateGuest?.isLoading);
  const profile = useAppSelector(state => state.myProfile);
  const { isLoading: logoutLoader } = useAppSelector(state => state.logout);

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
    trips,
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
    searchQuery,
    setSearchQuery,
    hotelPicked,
    setHotelPicked,
    refreshLoader,
    setRefreshLoader,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    disable,
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
    hotelCount,
    setHotelCount,
    loadingTrips,
    setLoadingTrips
  } = useCommanDashboardStates();

  const {
    handlePassengerArrival,
    handleTripStatus,
    handleSkipTrip,
    handleStatus,
    handleTripCompleted,
    handleSave
  } = useTripActions({
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
    handleOpenCallOption,
    handleSkipButtonClick,
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

  const { getArrivedCount, filteredGuests } = useGuestUtils(searchQuery);

  const { shouldDisableStartButton } = useTripUtils();

  // useDashboardEffects({
  //   data,
  //   selectedTrip,
  //   setSelectedTrip,
  //   setTrips,
  //   driverProfile,
  //   setDriverProfile,
  //   profile,
  //   dispatch,
  //   setIsLoading,
  //   setHotelCount,
  //   setHotelPicked,
  //   hotelPicked,
  //   setIsDisable,
  //   setIsDisableID
  // });

  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        paddingBottom: hasUnsavedChanges ? '100px' : '20px'
      }}
    >
      {currentView === 'tours' && (
        <DriverDashboardTourDetails
          handleStatus={handleStatus}
          shouldDisableStartButton={shouldDisableStartButton}
          trips={trips}
          loadingTrips={loadingTrips}
          handleTripStatus={handleTripStatus}
          setSelectedTrip={setSelectedTrip}
          handleTripCompleted={handleTripCompleted}
          isSkippingTrip={isSkippingTrip}
          handleSkipButtonClick={handleSkipButtonClick}
          setCurrentView={setCurrentView}
          isPVTorGRP={isPVTorGRP}
          fadeIn={fadeIn}
          isLoading={isLoading}
          driverProfile={driverProfile}
        />
      )}

      {currentView === 'hotels' && selectedTrip && (
        <DriverDashboardHotelView
          selectedTrip={selectedTrip}
          hotelPicked={hotelPicked}
          hotelCount={hotelCount}
          setSelectedHotel={setSelectedHotel}
          setCurrentView={setCurrentView}
          getArrivedCount={getArrivedCount}
        />
      )}

      {currentView === 'guests' && (selectedTrip || selectedHotel) && (
        <DriverDashboardGuestView
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedTrip={selectedTrip}
          selectedHotel={selectedHotel}
          getArrivedCount={getArrivedCount}
          filteredGuests={filteredGuests}
          handleOpenCallOption={handleOpenCallOption}
          handlePassengerArrival={handlePassengerArrival}
          disable={disable}
        />
      )}

      {hasUnsavedChanges && (
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 20, sm: 30 },
            right: { xs: 20, sm: 30 },
            zIndex: 1000
          }}
        >
          <Box
            onClick={load ? undefined : handleSave}
            tabIndex={0}
            role='button'
            onKeyDown={e => {
              if (!load && (e.key === 'Enter' || e.key === ' ')) {
                handleSave();
              }
            }}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 3,
              py: 1.5,
              borderRadius: '2rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#fff',
              background: load
                ? 'linear-gradient(135deg, #a0aec0 0%, #718096 100%)'
                : 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)',
              boxShadow: load
                ? '0 4px 15px rgba(113, 128, 150, 0.4)'
                : '0 6px 20px rgba(56, 161, 105, 0.4)',
              cursor: load ? 'not-allowed' : 'pointer',
              opacity: load ? 0.8 : 1,
              transition: 'all 0.3s ease',
              pointerEvents: load ? 'none' : 'auto',
              '&:hover': {
                transform: load ? 'none' : 'translateY(-2px)',
                boxShadow: load
                  ? '0 4px 15px rgba(113, 128, 150, 0.4)'
                  : '0 8px 24px rgba(56, 161, 105, 0.5)'
              }
            }}
          >
            {load ? (
              <>
                <CircularProgress size={18} sx={{ color: 'white' }} />
                Saving...
              </>
            ) : (
              <>💾 Save </>
            )}
          </Box>
        </Box>
      )}
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
