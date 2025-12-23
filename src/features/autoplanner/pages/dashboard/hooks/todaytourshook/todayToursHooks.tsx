import { useAppDispatch } from '../../../../../../app/redux/hooks';
import {
  autoPlannerDeleteAction,
  contactNumberValidation,
  externalvehicleAction,
  GetGrpBookings
} from '../../../../redux/reducer/autoPlannerSlices/autoplanner';
import { useCallback, useEffect, useState } from 'react';
import {
  clearExcelView,
  getExcelAction
} from '../../../../redux/reducer/autoPlannerSlices/autoGenerateSlice';
import {
  clearTodayTour,
  getTodayTours
} from '../../../../redux/reducer/autoPlannerSlices/todayToursSlice';
import { styled, Switch } from '@mui/material';
import {
  debounce,
  getTodayEpoch,
  useAbort
} from '../../../../../../utils/commonFunctions';

// Common States to handle the Common functionality of the Today tours Module
export const useCommonStates = () => {
  const [invalidRows, setInvalidRows] = useState([]);

  const [PageSize, setPageSize] = useState(20);

  const [PageNo, setPageNo] = useState(1);

  const [selectedRow, setSelectedRow] = useState<any>('');

  const [searchEvent, setSearchEvent] = useState<any>('');

  const [scheduleDate, setScheduleDate] = useState<number>(0);

  const [timeZone, setTimeZone] = useState<string>('UTC');

  const [refresh, setRefresh] = useState(false);

  const [groupView, setGroupView] = useState(true);

  const [isDialog, setIsDialog] = useState<any>('');

  const [selectedTripRow, setSelectedTripRow] = useState<any | null>(null);

  const [sendWhatsApp, setSendWhatsApp] = useState(false);

  const [validationErrors, setValidationErrorsMake] = useState<any>({
    driverNumber: '',
    phone: ''
  });

  const [callApi, setCallApi] = useState<boolean>(false);

  const [refreshLoader, setRefreshLoader] = useState<boolean>(false);

  const [badgeCount, setBadgeCount] = useState<number>(0);

  return {
    invalidRows,
    setInvalidRows,
    PageSize,
    setPageSize,
    PageNo,
    setPageNo,
    selectedRow,
    setSelectedRow,
    searchEvent,
    setSearchEvent,
    scheduleDate,
    setScheduleDate,
    timeZone,
    setTimeZone,
    refresh,
    setRefresh,
    groupView,
    setGroupView,
    isDialog,
    setIsDialog,
    selectedTripRow,
    setSelectedTripRow,
    sendWhatsApp,
    setSendWhatsApp,
    validationErrors,
    setValidationErrorsMake,
    callApi,
    setCallApi,
    refreshLoader,
    setRefreshLoader,
    badgeCount,
    setBadgeCount
  };
};

// Common Functionalities for the Today tours
export const useCommonFunctions = ({
  setRefreshLoader,
  setPageSize,
  setPageNo,
  scheduleDate,
  searchEvent,
  isOverview,
  PageSize,
  setSearchEvent,
  PageNo,
  timeZone,
  setGroupView,
  setValue,
  selectedTripRow,
  APagent,
  APsubAgent,
  setIsDialog,
  autoplannerID,
  setBadgeCount,
  setValidationErrorsMake,
  currentDatas,
  callApi,
  setScheduleDate,
  APoperator,
  APsuperAdmin,
  APOperationUser,
  groupView,
  profileData,
  setTimeZone,
  setSendWhatsApp,
  restToggle,
  setCallApi,
  clearErrors,
  setVehicleValue,
  validationErrors,
  trigger
}: any) => {
  const dispatch = useAppDispatch();
  const createAbort = useAbort();
  const [filter, setFilter] = useState('');
  const [zone, setZone] = useState<boolean>(true);
  const [isViewAdhoc, setIsViewAdhoc] = useState<boolean>(false);

  const AntSwitch = styled(Switch)(() => ({
    width: 28,
    height: 16,
    padding: 0,
    display: 'flex',

    '& .MuiSwitch-switchBase': {
      padding: 2,
      '&.Mui-checked': {
        transform: 'translateX(12px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: '#3239EA'
        }
      }
    },
    '& .MuiSwitch-thumb': {
      width: 12,
      height: 12,
      borderRadius: 6
    },
    '& .MuiSwitch-track': {
      borderRadius: 16 / 2,
      opacity: 1,
      backgroundColor: '#000',
      boxSizing: 'border-box'
    }
  }));

  const handlePaginationModelChange = async (newPaginationModel: any) => {
    setRefreshLoader(true);

    const { pageSize: newPageSize, page: newPageNo } = newPaginationModel;
    setPageSize(newPageSize);
    setPageNo(newPageNo + 1);
    const newPage = newPageNo + 1;
    const payload = {
      PageNo: newPage,
      PageSize: newPageSize,
      autoplannerID: scheduleDate,
      tripMode: 'ALL',
      searchFor: searchEvent ? searchEvent : ''
    };

    if (isOverview) {
      await dispatch(getTodayTours(payload));
    } else {
      await dispatch(getExcelAction(payload));
    }
    setRefreshLoader(false);
  };

  const handleFilterChange = useCallback(
    debounce(async (event: string) => {
      const payload = {
        PageNo: 1,
        PageSize: PageSize,
        autoplannerID: scheduleDate,
        tripMode: 'ALL',
        searchFor: event
      };
      setSearchEvent(event);
      setFilter(event);
      setPageNo(1);
      if (isOverview) {
        await dispatch(getTodayTours(payload));
      } else {
        await dispatch(getExcelAction(payload));
      }
    }),
    [PageNo, PageSize, scheduleDate, isOverview]
  );

  //function to handle group view
  const handleGroupView = async (e: any) => {
    dispatch(clearTodayTour());
    dispatch(clearExcelView());
    setSearchEvent('');
    setFilter('');
    setValue('search', '');
    setGroupView(e);
    setPageNo(1);
    setPageSize(20);
    if (!isOverview) {
      await dispatch(
        getTodayTours({
          PageNo: 1,
          PageSize: 20,
          autoplannerID: scheduleDate,
          searchFor: '',
          tripMode: 'ALL'
        })
      );
    } else {
      await dispatch(
        getExcelAction({
          PageNo: 1,
          PageSize: 20,
          autoplannerID: scheduleDate,
          searchFor: '',
          tripMode: 'ALL'
        })
      );
    }
    setPageNo(1);
    setPageSize(20);
  };

  // Get current date for display
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timeZone: timeZone
    });
  };

  const getStatusColor = (status: string) => {
    const normalized = status?.toLowerCase();

    if (['upcoming', 'yet to onboard'].includes(normalized)) {
      return 'orange';
    }
    if (['completed', 'onboarded'].includes(normalized)) {
      return '#00b25c';
    }
    if (['in-transit'].includes(normalized)) {
      return '#c7a107';
    }
    if (['no show'].includes(normalized)) {
      return 'rgb(255, 0, 4)';
    }
    if (['skipped', 'trip skipped'].includes(normalized)) {
      return '#6c757d';
    }

    return '#c7a107';
  };

  const handleDeleteDriver = async () => {
    const payload = {
      selectedRow: selectedTripRow,
      pageDetails: { PageNo, PageSize },
      APagent: APagent,
      APsubAgent: APsubAgent
    };
    const res = await dispatch(autoPlannerDeleteAction(payload));
    if (res?.meta?.requestStatus === 'fulfilled') {
      setIsDialog('');
      // await dispatch(getDriver({ ...payload, pageNo, pageSize }));
      const res: any = await dispatch(
        GetGrpBookings({
          mode: 'ALL',
          pageNo: 1,
          pageSize: 20,
          autoplannerID: autoplannerID,
          isAdhoc: true
        })
      );
      setBadgeCount(res?.payload?.data?.count ?? 0);
    }
  };

  const handleValidate = useCallback(
    debounce(async (event: any, field: any) => {
      const payload = {
        mobileNumber: event,
        autoplannerId: scheduleDate
      };
      setVehicleValue('driverName', '');
      const res: any = await dispatch(externalvehicleAction(payload));

      if (res.type === externalvehicleAction.fulfilled.type) {
        if (res.payload.data) setVehicleValue('driverName', res.payload.data);
      }
      setValidationErrorsMake((prev: any) => ({
        ...prev,
        [field]:
          res?.payload?.status !== 200 && res?.payload?.status != 'Success'
            ? res?.payload?.response?.data?.message
            : 'no-error'
      }));
    }),

    [dispatch, scheduleDate]
  );

  useEffect(() => {
    if (validationErrors) trigger('driverNumber');
  }, [validationErrors]);

  useEffect(() => {
    dispatch(
      GetGrpBookings({
        mode: 'ALL',
        pageNo: PageNo,
        pageSize: PageSize,
        autoplannerID: autoplannerID,
        isAdhoc: true
      })
    );
  }, [scheduleDate]);

  useEffect(() => {
    if (!callApi && !currentDatas.isLoading && !isViewAdhoc) {
      if (PageNo === 1) {
        const interval = setInterval(async () => {
          const payload: any = {
            PageNo: PageNo,
            PageSize: PageSize,
            autoplannerID: scheduleDate
          };
          if (filter) {
            payload.searchFor = filter;
          }
          if (isOverview) {
            dispatch(getTodayTours(payload));
          } else {
            payload.tripMode = 'ALL';
            dispatch(getExcelAction(payload));
          }
          const res: any = await dispatch(
            GetGrpBookings({
              mode: 'ALL',
              pageNo: 1,
              pageSize: 20,
              autoplannerID: autoplannerID,
              isAdhoc: true
            })
          );
          setBadgeCount(res?.payload?.data?.count ?? 0);
        }, 10000);
        return () => clearInterval(interval);
      }
    }
  }, [
    PageNo,
    PageSize,
    scheduleDate,
    filter,
    isOverview,
    callApi,
    currentDatas.isLoading,
    isViewAdhoc
  ]);

  useEffect(() => {
    dispatch(
      GetGrpBookings({
        mode: 'ALL',
        pageNo: PageNo,
        pageSize: PageSize,
        autoplannerID: autoplannerID,
        isAdhoc: true
      })
    );
  }, [scheduleDate]);

  useEffect(() => {
    const abortController = createAbort().abortCall;
    // dispatch(getMyProfileAction(abortController?.signal));
    // dispatch(autoPlannerAgentAction(abortController?.signal));
    return () => {
      dispatch(clearTodayTour());
      dispatch(clearExcelView());
      abortController?.abort();
    };
  }, []);

  useEffect(() => {
    if (timeZone !== 'UTC') {
      const epochTime = getTodayEpoch(timeZone);
      setScheduleDate(epochTime);
      // setScheduleDate(1753718400);

      if (APoperator || APsuperAdmin || APOperationUser) {
        dispatch(
          getTodayTours({
            PageNo: 1,
            PageSize: 20,
            autoplannerID: epochTime,
            searchFor: '',
            tripMode: 'ALL'
          })
        );
      } else {
        dispatch(
          getExcelAction({
            PageNo: 1,
            PageSize: 20,
            autoplannerID: epochTime,
            tripMode: 'ALL',
            searchFor: ''
          })
        );
      }
      // dispatch(
      //   getExcelAction({
      //     PageNo: 1,
      //     PageSize: 20,
      //     autoplannerID: epochTime,
      //     tripMode: 'ALL',
      //     searchFor: ''
      //   })
      // );
    }
  }, [timeZone, APsuperAdmin, APoperator, groupView]);

  useEffect(() => {
    if (profileData.timezone !== '' && zone) {
      setTimeZone(profileData.timezone);
      if (profileData?.timezone) setZone(false);
    }
  }, [profileData, zone]);

  return {
    AntSwitch,
    handlePaginationModelChange,
    handleFilterChange,
    getCurrentDate,
    getStatusColor,
    handleGroupView,
    handleDeleteDriver,
    handleValidate,
    setFilter,
    filter,
    zone,
    setZone,
    isViewAdhoc,
    setIsViewAdhoc
  };
};
