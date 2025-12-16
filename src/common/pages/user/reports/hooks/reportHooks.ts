import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../app/redux/hooks';
import { updateToast } from '../../../../../common/redux/reducer/commonSlices/toastSlice';
import {
  convertToEpoch,
  convertToEpoch2,
  formatDate,
  useAbort
} from '../../../../../utils/commonFunctions';

import dayjs from 'dayjs';
import { SubmitHandler } from 'react-hook-form';
import {
  getAutoplannerPDFExcel,
  getExternalVehicleReport,
  Payload,
  setExternalVehicle
} from '../../../../redux/reducer/commonSlices/reportSlice';

//custom hook to handle common states
const useCommonStateHandlers = () => {
  const [isDownload, setIsDownload] = useState<boolean>(false);
  const [isDateDisabled, setIsDateDisabled] = useState<boolean>(false);
  const [toDateDisabled, setToDateDisabled] = useState<boolean>(true);
  const [isDeviceDisabled, setIsDeviceDisabled] = useState<boolean>(false);
  const [report, setReportType] = useState<string>('');
  const [noLoad, setNoLoad] = useState<boolean>();
  const [payloads, setPayloads] = useState<any>();
  return {
    isDownload,
    isDeviceDisabled,
    isDateDisabled,
    toDateDisabled,
    report,
    payloads,
    setIsDeviceDisabled,
    setIsDownload,
    setIsDateDisabled,
    setToDateDisabled,
    setReportType,
    setNoLoad,
    noLoad,
    setPayloads
  };
};
//custom hook to fetch report
const useFetchReport = () => {
  const dispatch = useAppDispatch();

  //function to get Data based on report type
  const getData = async (payload: Payload) => {
    dispatch(setExternalVehicle(null));
    switch (payload.report) {
      case 'ExternalVehicle':
        await dispatch(getExternalVehicleReport(payload));
        break;
      default:
        break;
    }
  };

  return { getData };
};

//custom hook to get report types dropdown based on role
const useReportTypes = ({
  resetField,
  setValue,
  clearErrors,
  setIsDeviceDisabled,
  setToDateDisabled,
  setReportType,
  setIsDownload,
  setIsDateDisabled
}: any) => {
  const authRole = localStorage.getItem('role');
  const { category } = useAppSelector(state => state.RoleModuleAccess);
  const reportType =
    authRole === 'ROLE_OPERATOR' ||
    authRole === 'ROLE_AUTOPLANNER_ADMIN' ||
    category === 'OPERATION_USER'
      ? [{ id: 'ExternalVehicle', label: 'External Vehicle' }]
      : [
          { id: 'Alert', label: 'Alert' },
          { id: 'DeviceHealth', label: 'Device Health' },
          ...(authRole === 'ROLE_DT_ADMIN'
            ? [{ id: 'DriverIdentification', label: 'Driver Identification' }]
            : []),
          { id: 'DriverScorecard', label: 'Driver Scorecard' },
          { id: 'Engine', label: 'Engine' },
          { id: 'Idle', label: 'Idle' },
          { id: 'KM', label: 'KM' },
          { id: 'Movement', label: 'Movement' },
          { id: 'Overall', label: 'Overall' },
          { id: 'Overspeed', label: 'Overspeed' },
          { id: 'Parking', label: 'Parked' },
          { id: 'Stoppage', label: 'Stoppage' },
          { id: 'TripCompliance', label: 'Trip Compliance' },
          { id: 'TripDetails', label: 'Trip Details' },
          { id: 'VehicleDetails', label: 'Vehicle Details' },
          { id: 'VehicleGeofence', label: 'Vehicle Geofence' }
        ];

  //function to handle logics based on report type
  const handleReport = (id: string | null) => {
    setReportType(id ? id : 'Overall');
    setIsDownload(false);
    setValue('vehicle', '');

    setIsDateDisabled(id === 'DeviceHealth');

    if (id === 'DeviceHealth') {
      setToDateDisabled(true);
    }

    setIsDeviceDisabled(id === 'DeviceHealth' || id === 'DriverScorecard');

    if (id === 'DeviceHealth') {
      setValue('startDate', null);
      setValue('endDate', null);
      clearErrors('startDate');
      clearErrors('endDate');
    } else {
      resetField('startDate');
      resetField('endDate');
    }
    if (id === 'DeviceHealth' || id === 'DriverScorecard') {
      clearErrors('vehicle');
    } else {
      resetField('vehicle');
    }
  };

  return { reportType, handleReport };
};

//custom hook to handle date fields in reports
const useReportsDateHandler = ({
  setValue,
  clearErrors,
  trigger,
  setToDateDisabled
}: any) => {
  const dispatch = useAppDispatch();

  const [getStartDate, setGetStartDate] = useState<Date | null>(null);
  const [getEndDate, setGetEndDate] = useState<Date | null>(null);
  const [fromTimestamp, setFromTimeStamp] = useState<number | null>(null);
  const [toTimeStamp, setToTimeStamp] = useState<number | null>(null);
  const [currentTimestamp, setCurrentTimeStamp] = useState<number | null>(null);

  const currentDate = new Date();
  //function to handle Custom date options in From date field
  const handleCustomFrom = (start: Date, end: Date) => {
    if (start) {
      setToDateDisabled(false);
    }
    setValue('startDate', start);
    setGetStartDate(start);
    setValue('endDate', end);
    clearErrors('startDate');
    clearErrors('endDate');
    setGetEndDate(end);
  };

  //function to handle Custom date options in To date field
  const handleCustomTo = (start: Date, end: Date) => {
    setValue('startDate', start);
    setGetStartDate(start);
    setValue('endDate', end);
    setGetEndDate(end);
    clearErrors('startDate');
    clearErrors('endDate');
  };

  //function to handle From date
  const handleFromDate = (date: any) => {
    if (!date && date?.$d == 'Invalid Date') return;
    setGetStartDate(date?.$d);
    const fromDate: number | null = convertToEpoch2(date?.$d);
    setFromTimeStamp(fromDate);
    setCurrentTimeStamp(convertToEpoch(currentDate));
    setValue('startDate', date?.$d);

    setGetEndDate(new Date(date?.$d?.getTime() + 1000 * 600));
    setValue('endDate', new Date(date?.$d?.getTime() + 1000 * 600));
    trigger('startDate');
    trigger('endDate');
    if (date) {
      setToDateDisabled(false);
    }
  };

  //function to handle To date
  const handleToDate = (date: any) => {
    if (getStartDate === null) {
      setGetEndDate(date?.$d);
      setValue('endDate', date?.$d);
      trigger('endDate');
      dispatch(
        updateToast({
          show: true,
          message: 'Please select "From Date"',
          severity: 'error'
        })
      );
    } else {
      setGetEndDate(date.$d);
      setValue('endDate', date?.$d);
      trigger('endDate');
    }
    const toDate: number | null = convertToEpoch2(date?.$d);
    setToTimeStamp(toDate);
  };

  return {
    handleCustomFrom,
    handleCustomTo,
    handleFromDate,
    handleToDate,
    getStartDate,
    getEndDate,
    setGetEndDate,
    setGetStartDate
  };
};

//custom hook to send mail
const useSendMail = ({ mailResetField, payloads }: any) => {
  const [mailLoad, setMailLoad] = useState(false);
  const [newMail, setNewMail] = useState(null);
  const [drawer, setDrawer] = useState(false);

  const role = localStorage.getItem('role');

  const dispatch = useAppDispatch();

  //function to send Mail
  const sendMail = async (data: any) => {
    setMailLoad(true);
    let payload = data?.email
      ? {
          mail: data?.email,
          reportType: payloads?.report,
          vehicleNumbers: !Boolean(payloads.deviceID) ? [] : [payloads?.deviceID],
          startDate: payloads?.startDate,
          endDate: payloads?.endDate,
          format: data?.document,
          sortBy: 'DESC'
        }
      : {
          reportType: payloads?.report,
          vehicleNumbers: !Boolean(payloads.deviceID) ? [] : [payloads?.deviceID],
          startDate: payloads?.startDate,
          endDate: payloads?.endDate,
          format: data?.document,
          sortBy: 'DESC'
        };
    setNewMail(data?.email);

    const result: any = await dispatch(
      getAutoplannerPDFExcel({ ...payload, report: payloads?.report })
    );

    if (result.payload.status == 200) {
      mailResetField('document');
      mailResetField('email');
      setDrawer(false);
      setNewMail(null);
    }

    setMailLoad(false);
  };

  return { mailLoad, newMail, drawer, setDrawer, sendMail, setNewMail };
};

//custom hook to handle report generation
const useReportSubmit = ({
  setIsDeviceDisabled,
  setIsDownload,
  setIsDateDisabled,
  setToDateDisabled,
  setPageNo,
  setPageSize,
  setPayloads
}: any) => {
  const [vehicleNo, setVehicleNo] = useState<string | undefined>('');
  const [vehicle, setVehicle] = useState<string | null>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [difference, setDifference] = useState<Boolean>(false);

  const [selectedReportType, setSelectedReportType] = useState<string>('');

  const createAbort = useAbort();

  //custom hook to fetch report
  const { getData } = useFetchReport();
  //function to get report details
  const handleGetReportClick: SubmitHandler<any> = async data => {
    setVehicle(data.vehicle === 'selectAll' ? null : data.vehicle);
    setSelectedReportType(data.report ?? 'Overall');
    setIsDeviceDisabled(false);
    setIsDateDisabled(false);
    setPageNo(1);
    setPageSize(10);
    setIsDownload(true);
    if (data?.startDate && data.endDate) {
      let is7Days = [
        Boolean(dayjs(data?.endDate).diff(dayjs(data?.startDate), 'day') <= 7),
        Boolean(dayjs(data?.endDate).diff(dayjs(data?.startDate), 'hour') <= 168),
        Boolean(dayjs(data?.endDate).diff(dayjs(data?.startDate), 'minute') <= 10800)
      ];

      if (is7Days.every((item: any) => item)) {
        setDifference(true);
      } else {
        setDifference(false);
      }
    }

    const signal = createAbort().abortCall.signal;
    const payload =
      data.report !== 'DeviceHealth'
        ? {
            report: data.report,
            deviceID: data.vehicle === 'selectAll' ? null : data.vehicle,
            startDate: convertToEpoch(data.startDate),
            endDate: convertToEpoch(data.endDate),
            pageno: 1,
            pagesize: 10,
            toast: true,
            signal: signal
          }
        : {
            report: data.report,
            pageno: 1,
            pagesize: 10,
            toast: true,
            signal: signal
          };

    setPayloads(payload);
    getData(payload);
    let startTime = data.startDate !== null ? formatDate(data.startDate) : '';
    setStartDate(startTime);
    let endTime = data.endDate !== null ? formatDate(data.endDate) : '';
    setEndDate(endTime);
    let vehicleNumber =
      data.vehicle === 'selectAll' ? 'All Vehicles' : data.vehicle?.toUpperCase();
    setVehicleNo(vehicleNumber);
  };

  return {
    handleGetReportClick,
    selectedReportType,
    startDate,
    endDate,
    vehicle,
    vehicleNo,
    difference,
    setPayloads,
    createAbort
  };
};

//custom hook for  dynamic report payloads
const useReportPayload = ({ setPayloads, getData, payloads, setNoLoad }: any) => {
  const handleReportPayload = ({ pageNo, pageSize }: any) => {
    const payload = { ...payloads, pageno: pageNo, pagesize: pageSize, toast: false };
    setPayloads(payload);
    getData(payload);
    setNoLoad(false);
  };

  return { handleReportPayload };
};

//custom hook to  handle  side effect events
const useHandleSideEffects = ({
  mountEvents,
  cleanUpEvents,
  reset,
  mailResetField,
  setDrawer,
  setNewMail,
  setMailValues,
  email,
  newMail,
  drawer
}: any) => {
  const { category } = useAppSelector(state => state.RoleModuleAccess);
  const role: any = localStorage.getItem('role');
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (
      !['ROLE_OPERATOR', 'ROLE_AUTOPLANNER_ADMIN']?.includes(role) &&
      category !== 'OPERATION_USER'
    ) {
      dispatch(mountEvents[0].url());
    }

    reset();
    return cleanUpEvents;
  }, [role]);

  // useEffect(() => {
  //   if (data?.data?.message) {
  //     mailResetField('document');
  //     setDrawer(false);
  //     setNewMail(null);
  //   }
  // }, [data]);

  useEffect(() => {
    if (drawer) {
      newMail ? setMailValues('email', newMail) : setMailValues('email', email);
    }
  }, [email, newMail, drawer]);
};

export {
  useFetchReport,
  useReportTypes,
  useReportsDateHandler,
  useSendMail,
  useCommonStateHandlers,
  useReportSubmit,
  useReportPayload,
  useHandleSideEffects
};
