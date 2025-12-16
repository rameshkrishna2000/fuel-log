import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '../../../../../app/redux/hooks';
import { getTodayEpoch } from '../../../../../utils/commonFunctions';
import { driverTripUpdateAction, getDriverDashboard } from './driverDashboardSlice';
import { useNavigate } from 'react-router-dom';
import { addLogout } from '../../../../../common/redux/reducer/commonSlices/loginSlice';
import { deleteToken, getMessaging } from 'firebase/messaging';
import { driverLogout } from '../../../../../common/redux/reducer/commonSlices/driverLoginSlice';

export const useCommanDashboardStates = () => {
  const [trips, setTrips] = useState([]);
  const [arrivedGuestID, setArrived] = useState<any>([]);

  const [noShow, setNoShow] = useState<any>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  const [selectedHotel, setSelectedHotel] = useState<any>(null);

  const [currentView, setCurrentView] = useState('tours');
  const [searchQuery, setSearchQuery] = useState('');
  const [hotelPicked, setHotelPicked] = useState(0);
  const [refreshLoader, setRefreshLoader] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [disable, setIsDisable] = useState(false);
  const [disableID, setIsDisableID] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [driverProfile, setDriverProfile] = useState<any>('');
  const [phoneNo, setPhoneNo] = useState<string>('');
  const [isLogout, setIsLogout] = useState(false);
  const [showSkipSuccess, setShowSkipSuccess] = useState(false);
  const [skippedTripName, setSkippedTripName] = useState('');
  const [isCall, setIsCall] = useState(false);
  const [isSkippingTrip, setIsSkippingTrip] = useState(false);
  const [isSkipDialogOpen, setIsSkipDialogOpen] = useState(false);
  const [tripToSkip, setTripToSkip] = useState<any>(null);
  const [hotelCount, setHotelCount] = useState(0);
  const [loadingTrips, setLoadingTrips] = useState<number | string | null>(null);

  return {
    trips,
    setTrips,
    arrivedGuestID,
    setArrived,
    noShow,
    setNoShow,
    selectedTrip,
    setSelectedTrip,
    selectedHotel,
    setSelectedHotel,
    setIsSaving,
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
    isSaving,
    disable,
    setIsDisable,
    disableID,
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
  };
};

export const useTripActions = ({
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
}: any) => {
  const dispatch = useAppDispatch();

  /** ✅ Handle Trip Status Label */
  const handleStatus = useCallback((trip: any): string => {
    let allGuests: any[] = [];

    if (trip.hotels && trip.hotels.length > 0) {
      allGuests = trip.hotels.flatMap((hotel: any) => hotel.guests || []);
    } else if (trip.guests && trip.guests.length > 0) {
      allGuests = trip.guests;
    }

    const totalGuests = allGuests.length;
    const arrivedGuests = allGuests.filter((guest: any) => guest.arrived !== null).length;

    if (trip.status === 'Skipped') return 'Skipped';
    if (arrivedGuests === 0) return 'Start Trip';
    if (arrivedGuests < totalGuests) return 'Intransit';
    return 'Completed';
  }, []);

  /** ✅ Handle Trip Completion Status Type */
  const handleTripCompleted = useCallback((trip: any) => {
    let allGuests: any[] = [];

    if (trip.hotels && trip.hotels.length > 0) {
      allGuests = trip.hotels.flatMap((hotel: any) => hotel.guests || []);
    } else if (trip.guests && trip.guests.length > 0) {
      allGuests = trip.guests;
    }

    const totalGuests = allGuests.length;
    const arrivedGuests = allGuests.filter((guest: any) => guest.arrived !== null).length;

    if (trip.status === 'Completed') return 'complete';
    if (trip.status === 'Skipped') return 'skipped';
    if (trip.status === 'Intransit' && arrivedGuests === 0) return 'started';
    return 'intransit';
  }, []);

  /** ✅ 1. Handle Passenger Arrival */
  const handlePassengerArrival = useCallback(
    (guestId: any, arrived: any) => {
      if (selectedHotel) {
        setSelectedHotel((prev: any) => ({
          ...prev,
          guests: prev.guests?.map((guest: any) =>
            guest.id === guestId ? { ...guest, arrived } : guest
          )
        }));
      } else if (selectedTrip) {
        setSelectedTrip((prev: any) => ({
          ...prev,
          guests: prev.guests?.map((guest: any) =>
            guest.id === guestId ? { ...guest, arrived } : guest
          )
        }));
      }

      if (arrived) {
        if (!arrivedGuestID.includes(guestId)) {
          arrivedGuestID.push(guestId);
        }
        if (noShow.includes(guestId)) {
          const updatedNoShow = noShow.filter((id: any) => id !== guestId);
          setNoShow(updatedNoShow);
        }
      } else {
        if (!noShow.includes(guestId)) {
          noShow.push(guestId);
        }
        setArrived((prev: any) => prev.filter((id: any) => id !== guestId));
      }

      setHasUnsavedChanges(true);
    },
    [
      selectedHotel,
      selectedTrip,
      arrivedGuestID,
      noShow,
      setSelectedHotel,
      setSelectedTrip,
      setArrived,
      setNoShow,
      setHasUnsavedChanges
    ]
  );

  /** ✅ 2. Handle Trip Status Update */
  const handleTripStatus = useCallback(
    async (trip: any) => {
      const tripId = trip.id;
      setLoadingTrips(tripId);

      const guestIds =
        trip.hotels?.flatMap((hotel: any) =>
          hotel.guests.map((guest: any) => guest.id)
        ) ?? [];
      const PVTGRPguestID = trip?.guests?.flatMap((guest: any) => guest.id) ?? [];

      const payload = {
        guestIdsForTripStatus: guestIds.length ? guestIds : PVTGRPguestID,
        tripStatus: handleStatus(trip) === 'Completed' ? 'Completed' : 'Intransit',
        date: getTodayEpoch(driverProfile.timezone)
      };

      const action = await dispatch(driverTripUpdateAction(payload));

      const payloads = {
        driverID: driverProfile.driverid,
        autoplannerID: getTodayEpoch(driverProfile.timezone)
      };

      if (action.type === driverTripUpdateAction.fulfilled.type) {
        dispatch(getDriverDashboard(payloads));
        setLoadingTrips(tripId);

        if (handleStatus(trip) === 'Start Trip') {
          if (isPVTorGRP(trip.tourName)) {
            setCurrentView('guests');
          } else {
            setCurrentView('hotels');
          }
        }
      }
    },
    [dispatch, driverProfile, setCurrentView, setLoadingTrips, handleStatus, isPVTorGRP]
  );

  /** ✅ 3. Handle Skip Trip */
  const handleSkipTrip = useCallback(
    async (trip: any) => {
      const tripId = trip.id;
      setIsSkippingTrip(true);
      setLoadingTrips(null);

      const guestIds =
        trip.hotels?.flatMap((hotel: any) =>
          hotel.guests.map((guest: any) => guest.id)
        ) ?? [];
      const PVTGRPguestID = trip?.guests?.flatMap((guest: any) => guest.id) ?? [];

      const payload = {
        skippedTripIds: guestIds.length ? guestIds : PVTGRPguestID,
        guestIdsForTripStatus: guestIds.length ? guestIds : PVTGRPguestID,
        tripStatus: 'Skipped',
        date: getTodayEpoch(driverProfile.timezone)
      };

      const action = await dispatch(driverTripUpdateAction(payload));

      const payloads = {
        driverID: driverProfile.driverid,
        autoplannerID: getTodayEpoch(driverProfile.timezone)
      };

      if (action.type === driverTripUpdateAction.fulfilled.type) {
        await dispatch(getDriverDashboard(payloads));
        setIsSkippingTrip(false);
        setLoadingTrips(null);
        setIsSkipDialogOpen(false);
        setSkippedTripName(trip.tourName);
        setShowSkipSuccess(true);

        setTimeout(() => {
          setShowSkipSuccess(false);
          setSkippedTripName('');
        }, 3000);
      }
    },
    [
      dispatch,
      driverProfile,
      setIsSkippingTrip,
      setLoadingTrips,
      setIsSkipDialogOpen,
      setSkippedTripName,
      setShowSkipSuccess
    ]
  );

  /** ✅ 4. Handle Save Arrivals / NoShows */
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setLoadingTrips('');
    setTrips((prevTrips: any) =>
      prevTrips?.map((trip: any) => {
        if (trip.id === selectedTrip?.id) {
          if (selectedHotel) {
            return {
              ...trip,
              hotels: trip.hotels?.map((hotel: any) =>
                hotel.id === selectedHotel.id ? selectedHotel : hotel
              )
            };
          } else {
            return selectedTrip;
          }
        }
        return trip;
      })
    );

    const payload = {
      ...(noShow.length > 0 && { notArrivedGuestIds: noShow }),
      ...(arrivedGuestID.length > 0 && { arrivedGuestIds: arrivedGuestID }),
      date: getTodayEpoch(driverProfile.timezone)
    };

    const action = await dispatch(driverTripUpdateAction(payload));

    const payloads = {
      driverID: driverProfile.driverid,
      autoplannerID: getTodayEpoch(driverProfile.timezone)
    };

    if (action.type === driverTripUpdateAction.fulfilled.type) {
      dispatch(getDriverDashboard(payloads));
      setHasUnsavedChanges(false);
    }

    setIsSaving(false);
    setArrived([]);
    setNoShow([]);
  }, [
    setIsSaving,
    setLoadingTrips,
    setTrips,
    selectedTrip,
    selectedHotel,
    noShow,
    arrivedGuestID,
    driverProfile,
    dispatch,
    setHasUnsavedChanges,
    setArrived,
    setNoShow
  ]);

  /** ✅ Return all functions */
  return {
    handlePassengerArrival,
    handleTripStatus,
    handleSkipTrip,
    handleStatus,
    handleTripCompleted,
    handleSave
  };
};

export const useDashboardUIActions = ({
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
}: any) => {
  const dispatch = useAppDispatch();
  const routerNavigate = useNavigate();
  const messaging = getMessaging();

  /** ✅ Open Call Option */
  const handleOpenCallOption = useCallback(
    (phoneNumber: string) => {
      setPhoneNo(phoneNumber);
      setIsCall(true);
    },
    [setPhoneNo, setIsCall]
  );

  /** ✅ Skip Button Click */
  const handleSkipButtonClick = useCallback(
    (event: any, trip: any) => {
      event?.stopPropagation();
      setTripToSkip(trip);
      setLoadingTrips(null);
      setIsSkipDialogOpen(true);
    },
    [setTripToSkip, setLoadingTrips, setIsSkipDialogOpen]
  );

  /** ✅ Back Navigation */
  const handleBackNavigation = useCallback(() => {
    if (selectedHotel) {
      setSelectedHotel(null);
      setCurrentView('hotels');
    } else if (currentView === 'hotels' || currentView === 'guests') {
      setCurrentView('tours');
    }
  }, [selectedHotel, currentView, setSelectedHotel, setCurrentView]);

  /** ✅ Get Header Title */
  const getHeaderTitle = useCallback(() => {
    if (selectedHotel) return `🏨 ${selectedHotel.name}`;
    if (currentView === 'hotels' && selectedTrip) return `🏨 ${selectedTrip.tourName}`;
    if (currentView === 'guests' && selectedTrip)
      return `👥 ${selectedTrip.tourName} - Guests`;
    return 'Dashboard';
  }, [selectedHotel, selectedTrip, currentView]);

  /** ✅ Show Back Button */
  const showBackButton = useCallback(() => currentView !== 'tours', [currentView]);

  /** ✅ Manual Refresh */
  const handleManualRefresh = useCallback(() => {
    setRefreshLoader(true);
    setTrips([]);

    if (driverProfile.timezone) {
      const payload = {
        driverID: driverProfile.driverid,
        autoplannerID: getTodayEpoch(driverProfile.timezone)
      };

      setIsLoading(true);
      if (!profile.isLoading) {
        dispatch(getDriverDashboard(payload)).finally(() => {
          setIsLoading(false);
          setRefreshLoader(false);
        });
      }
    }
  }, [
    driverProfile,
    dispatch,
    setIsLoading,
    setRefreshLoader,
    setTrips,
    profile.isLoading
  ]);

  /** ✅ Logout Handler */
  const handleLogout = useCallback(async () => {
    const fireBasetoken = localStorage.getItem('firebaseToken');
    await dispatch(driverLogout({ fireBaseToken: fireBasetoken }));

    const key = localStorage.getItem('isKeepSignedIn');
    if (key === 'false') {
      localStorage.setItem('isKeepSignedIn', 'false');
      localStorage.clear();
    }

    localStorage.removeItem('lastVisitedPage');
    localStorage.removeItem('token');

    await deleteToken(messaging);

    (navigate || routerNavigate)('/');

    dispatch({ type: 'RESET' });
    setIsLogout(false);
  }, [dispatch, navigate, routerNavigate, setIsLogout]);

  return {
    handleOpenCallOption,
    handleSkipButtonClick,
    handleBackNavigation,
    getHeaderTitle,
    showBackButton,
    handleManualRefresh,
    handleLogout
  };
};

export const useCallActions = () => {
  /** ✅ Direct Phone Call */
  const handleCall = useCallback((phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  }, []);

  /** ✅ WhatsApp Call */
  const handleWpCall = useCallback((phoneNumber: string) => {
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedNumber}`, '_blank');
  }, []);

  return { handleCall, handleWpCall };
};

export const useGuestUtils = (searchQuery: string) => {
  /** ✅ Count Arrived Guests */
  const getArrivedCount = useCallback((guests: any[]) => {
    return guests?.filter(
      guest => guest?.arrived === true || guest?.arrived === 'Arrived'
    ).length;
  }, []);

  /** ✅ Filter Guests by Name or Contact */
  const filteredGuests = useCallback(
    (guests: any[]) => {
      if (!searchQuery) return guests;
      return guests?.filter(
        guest =>
          guest.name.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
          guest.contact?.includes(searchQuery)
      );
    },
    [searchQuery]
  );

  return { getArrivedCount, filteredGuests };
};

export const useTripUtils = () => {
  /** ✅ Determine if Start Button Should Be Disabled */
  const shouldDisableStartButton = useCallback((trips: any[], currentTrip: any) => {
    if (!currentTrip) return true;

    if (currentTrip.status === 'Intransit' || currentTrip.status === 'Completed') {
      return false;
    }

    if (currentTrip.status === 'Skipped') {
      return true;
    }

    const hasIntransit = trips.some(trip => trip.status === 'Intransit');
    if (hasIntransit) return true;

    const currentTripIndex = trips.findIndex(trip => trip.id === currentTrip.id);
    for (let i = 0; i < currentTripIndex; i++) {
      const previousTrip = trips[i];
      if (previousTrip.status !== 'Completed' && previousTrip.status !== 'Skipped') {
        return true;
      }
    }

    return false;
  }, []);

  return { shouldDisableStartButton };
};

export const useDashboardEffects = ({
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
}: any) => {
  // 1️⃣ Sync trips and selectedTrip
  useEffect(() => {
    setTrips(data);
    if (selectedTrip) {
      const [trip] = data.filter((trip: any) => trip?.id === selectedTrip.id);
      setSelectedTrip(trip);
    }
  }, [data]);

  // 2️⃣ Fetch dashboard when driverProfile changes
  useEffect(() => {
    if (driverProfile?.timezone) {
      const payload = {
        driverID: driverProfile.driverid,
        autoplannerID: getTodayEpoch(driverProfile.timezone)
      };

      if (!profile.isLoading) {
        setIsLoading(true);
        dispatch(getDriverDashboard(payload)).finally(() => {
          setIsLoading(false);
        });
      }
    }
  }, [driverProfile, dispatch, profile]);

  // 3️⃣ Calculate hotel count & picked hotels
  useEffect(() => {
    if (selectedTrip) {
      let pickedHotelsCount = 0;
      const totalHotelCount = selectedTrip?.hotels?.length || 0;
      setHotelCount(totalHotelCount);

      selectedTrip.hotels?.forEach((hotel: any) => {
        const totalGuests = hotel.guests?.length || 0;
        const arrivedGuests = hotel.guests?.filter(
          (guest: any) => guest.arrived != null
        ).length;

        if (arrivedGuests === totalGuests && totalGuests > 0) {
          pickedHotelsCount += 1;
        }
      });

      setHotelPicked(pickedHotelsCount);
    }
  }, [selectedTrip]);

  // 4️⃣ Disable/Enable actions based on selectedTrip status
  useEffect(() => {
    if (selectedTrip) {
      const status = selectedTrip.status;
      if (status === 'Completed' || status === 'Upcoming' || status === 'Skipped') {
        setIsDisable(true);
        setIsDisableID(selectedTrip.id);
      } else {
        setIsDisable(false);
        setIsDisableID('');
      }
    }
  }, [selectedTrip]);

  // 5️⃣ Update driverProfile from profile
  useEffect(() => {
    if (profile?.data) {
      setDriverProfile(profile.data);
    }
  }, [profile]);

  // 6️⃣ Prevent browser zoom (ctrl + wheel or ctrl + keys)
  useEffect(() => {
    const preventZoom = (e: KeyboardEvent | WheelEvent) => {
      const isCtrl = (e as any).ctrlKey;
      if (isCtrl) {
        e.preventDefault();
        if ('key' in e) {
          const key = (e as KeyboardEvent).key;
          if (['+', '-', '=', '0'].includes(key)) {
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('wheel', preventZoom, { passive: false });
    document.addEventListener('keydown', preventZoom);

    return () => {
      document.removeEventListener('wheel', preventZoom);
      document.removeEventListener('keydown', preventZoom);
    };
  }, []);
};
