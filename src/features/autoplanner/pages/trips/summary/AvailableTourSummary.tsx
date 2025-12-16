import { useEffect, useState } from 'react';
import { Alert, Box, Grid, Skeleton, Typography, useMediaQuery } from '@mui/material';
import {
  convertDatetoEpoch,
  convertToEpoch,
  convertToEpoch2,
  convertToEpoch4,
  epochToDateFormatSg,
  formatDate,
  formatDateTime0,
  getTomorrowEpoch,
  useAbort
} from '../../../../../utils/commonFunctions';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import './AvailableTourSummary.scss';
import dayjs from 'dayjs';
import {
  getAvailableSummary,
  summaryDeleteAction,
  summaryInfo
} from '../../../redux/reducer/autoPlannerSlices/tourSummary';
import { getMyProfileAction } from '../../../../../common/redux/reducer/commonSlices/myProfileSlice';
import CustomBreadcrumbs from '../../../../../common/components/custombreadcrumbs/CustomBreadcrumbs';
import CustomDatePicker from '../../../../../common/components/customized/customdatetimecalendar/CustomDatePicker';
import CustomSelect from '../../../../../common/components/customized/customselect/CustomSelect';
import CustomButton from '../../../../../common/components/buttons/CustomButton';
import TourSummary from './TourSummary';
import { useAppDispatch, useAppSelector } from '../../../../../app/redux/hooks';
import { string } from 'yup';
import { Icon } from '@iconify/react';

interface Cards {
  date: number;
  passengers: number;
  trips: number;
  vehicles: number;
  status: string;
  updatedOn: number | null;
  modes: string[];
}

interface Params {
  summaryDate: string;
  status: string;
}

interface AutoPlanner {
  autoplannerID: number;
  status: string;
  tripsCount: number;
  totalPassengers: number;
  utilizedVehicles: number;
  createdAt: number | null;
  distinctModes: string[];
}

const AvailableTourSummary = () => {
  const [view, setView] = useState<boolean>(false);
  const [summaryDate, setSummaryDate] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedMode, setSelectedMode] = useState<string[]>([]);

  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [getStartDate, setGetStartDate] = useState<Date | null | any>(null);
  const [getEndDate, setGetEndDate] = useState<Date | null | any>(null);
  const [isDateDisabled, setIsDateDisabled] = useState<boolean>(false);
  const [toDateDisabled, setToDateDisabled] = useState<boolean>(true);
  const [isDefault, setIsDefault] = useState<boolean>(true);
  const [fromTimestamp, setFromTimeStamp] = useState<number | null>(null);
  const [toTimeStamp, setToTimeStamp] = useState<number | null>(null);
  const [flippedStates, setFlippedStates] = useState<number>(0);
  const [payloads, setPayloads] = useState<any>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const createAbort = useAbort();

  const { data, isLoading } = useAppSelector(state => state.availableSummary);
  const { isLoading: dltLoader } = useAppSelector(state => state.deleteSummary);
  const profile = useAppSelector(
    state => state.myProfile.data || { timezone: 'UTC', userName: '' }
  );
  const { isLoading: profileLoader } = useAppSelector(state => state.myProfile);

  const { control, handleSubmit, setValue, clearErrors, getValues } = useForm<any>({});

  const status = [
    { id: 'ALL', label: 'All' },
    { id: 'SCHEDULED', label: 'Scheduled' },
    { id: 'UNSCHEDULED', label: 'UnScheduled' }
  ];

  const xSDevices = useMediaQuery('(max-width:610px)');
  const SmallDevices = useMediaQuery('(max-width:900px)');

  const handleViewSummary = (date: number) => {
    setView(true);
    setSummaryDate(date);
  };

  const onFilter = (params: any) => {
    if (errorMessage !== '') return;
    if (
      !params.status &&
      params.startDate === undefined &&
      params.endDate === undefined
    ) {
      setErrorMessage('Please fill at least one field!');
      return;
    } else if (params.startDate === undefined && params.endDate !== undefined) {
      setErrorMessage('Select from date!');
      return;
    } else if (params.endDate === undefined && params.endDate !== undefined) {
      setErrorMessage('Select to date!');
      return;
    } else if (params.startDate === null || params?.endDate === null) {
      // setIsDefault(!isDefault);
      clearFilter();
    } else {
      setErrorMessage('');
      setIsFiltered(true);
      const payload = {
        startDate: convertToEpoch4(formatDateTime0(params.startDate), profile?.timezone),
        endDate: convertToEpoch4(formatDateTime0(params.endDate), profile?.timezone),
        status: params.status === 'ALL' ? null : params.status
      };
      dispatch(getAvailableSummary(payload));
      setPayloads(payload);
      handleFlip(0);
    }
  };

  const clearFilter = () => {
    setErrorMessage('');
    setIsFiltered(false);
    if (isFiltered) {
      setIsDefault(!isDefault);
      handleFlip(0);
    }
  };

  const handleNavigate = (date: number) => {
    navigate('/trips/autoplannertrips/scheduled-tour', {
      state: { date: date }
    });
  };

  const handleFlip = (index: number, modes?: string[]) => {
    if (modes) setSelectedMode(modes);
    setFlippedStates(index);
  };

  const handleDelete = async ({ date }: any) => {
    const payload = {
      date: date,
      modes: selectedMode.join(','),
      params: payloads
    };
    await dispatch(summaryDeleteAction(payload));
    handleFlip(0);
  };

  const Card = ({
    date,
    passengers,
    trips,
    vehicles,
    status,
    updatedOn,
    modes
  }: Cards) => {
    const disable = status === 'Unscheduled';
    return (
      <Box
        className='summary-card'
        role='button'
        tabIndex={0}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          event.stopPropagation();
          if (event.key === 'Enter' || event.key === ' ') {
            handleFlip(date, modes);
          }
        }}
      >
        <Box className='summary-card-head'>
          <Box className='summary-card-header'>
            <Box>
              <Typography variant={'h2'} className='highlight-date'>
                {epochToDateFormatSg(date, profile?.timezone)}
              </Typography>
              <Typography className='summary-card-content'>Summary Date</Typography>
            </Box>
            <Icon
              icon='ic:baseline-delete'
              className='summary-delete-icon'
              onClick={() => handleFlip(date, modes)}
            />
          </Box>
        </Box>
        <Box className='summary-card-body'>
          <Typography className='content'>
            Total Passengers: <strong>{passengers}</strong>
          </Typography>
          <Typography className='content'>
            Total Bookings: <strong>{trips}</strong>
          </Typography>
          <Typography className='content'>
            Utilized Vehicles: <strong>{vehicles}</strong>
          </Typography>
          <Typography className='content'>
            Scheduled On:
            <strong style={{ fontSize: '12px' }}>
              {updatedOn ? formatDate(updatedOn * 1000) : '-'}
            </strong>
          </Typography>
        </Box>
        <Grid container spacing={1} className='card-footer'>
          <Grid item xs={6}>
            <Box
              role='button'
              tabIndex={0}
              className='card-re-schedule card-foot-box'
              onClick={(event: any) => {
                event.stopPropagation();
                dispatch(summaryInfo(null));
                handleViewSummary(date);
              }}
              onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
                event.stopPropagation();
                if (event.key === 'Enter' || event.key === ' ') {
                  dispatch(summaryInfo(null));
                  handleViewSummary(date);
                }
              }}
            >
              {disable ? 'Schedule' : 'Reschedule'}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              role='button'
              tabIndex={0}
              className={`card-foot-box ${
                disable ? 'card-view-disable' : 'card-view-schedule'
              }`}
              onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
                event.stopPropagation();
                // Trigger click behavior on Enter or Space
                if (!disable && (event.key === 'Enter' || event.key === ' ')) {
                  handleNavigate(date);
                }
              }}
              onClick={(event: any) => {
                event.stopPropagation();
                if (!disable) handleNavigate(date);
              }}
            >
              View Schedule
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const CardBack = ({ date, modes }: any) => {
    const chooseMode = (mode: string) => {
      setSelectedMode((prev: string[]) =>
        selectedMode?.length === 0
          ? modes
          : prev.includes(mode) && prev.length > 1
          ? prev.filter(m => m !== mode)
          : prev.length >= 1
          ? [...prev, mode]
          : [...prev]
      );
    };

    return (
      <Box className='summary-card'>
        <Box className='summary-card-head'>
          <Box className='summary-card-header'>
            <Typography variant={'h2'} className='highlight-date'>
              {epochToDateFormatSg(date, profile?.timezone)}
            </Typography>
            <Typography className='summary-card-content'>Summary Date</Typography>
          </Box>
        </Box>
        <Box className='summary-card-body'>
          <Grid container spacing={1} className='card-footer'>
            {modes?.map((mode: string) => (
              <Grid item xs={3} key={mode} onClick={() => chooseMode(mode)}>
                <Box
                  role='button'
                  tabIndex={0}
                  onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
                    event.stopPropagation();
                    if (event.key === 'Enter' || event.key === ' ') {
                      chooseMode(mode);
                    }
                  }}
                  className={`choose-btn ${
                    selectedMode?.includes(mode) ? 'active' : 'passive'
                  }`}
                >
                  {mode}
                </Box>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box className='summary-warning'>
              <Icon icon='cuida:warning-outline' className='summary-warning-icon' />
            </Box>
          </Box>
          <Typography className='summary-delete-msg'>
            Are you sure you want to delete ?
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              paddingTop: '10px',
              justifyContent: 'center'
            }}
          >
            <CustomButton
              className='cancel small-btn'
              category='No'
              onClick={() => handleFlip(0)}
            />
            <Box sx={{ marginLeft: '12px' }}>
              <CustomButton
                className='saveChanges small-btn padding-btn'
                category='Yes'
                loading={dltLoader}
                onClick={() => handleDelete({ date })}
              />
            </Box>
          </Box>
          <Typography className='summary-delete-note'>
            <b>Note</b>: This action will permanently delete the selected mode along with
            the uploaded Excel file.
          </Typography>
        </Box>
      </Box>
    );
  };

  const Loader = () => {
    return (
      <Grid container spacing={2} className='card-list-loader'>
        {[...Array(8)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Box className='card'>
              <Box>
                <Skeleton className='head' variant='rectangular' />
              </Box>
              <Box className='card-body'>
                <Skeleton
                  variant='text'
                  className='text-loader'
                  sx={{ fontSize: '1.2rem' }}
                />
                <Skeleton
                  variant='text'
                  className='text-loader'
                  sx={{ fontSize: '1.2rem' }}
                />
                <Skeleton
                  variant='text'
                  className='text-loader'
                  sx={{ fontSize: '1.2rem' }}
                />
                <Skeleton
                  variant='text'
                  className='text-loader'
                  sx={{ fontSize: '1.2rem' }}
                />
              </Box>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Skeleton className='head-2' variant='rectangular' />
                </Grid>
                <Grid item xs={6}>
                  <Skeleton className='head-2' variant='rectangular' />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  };

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
    if (date === null) return;
    setGetStartDate(date?.$d);
    const fromDate: number | null = convertToEpoch2(date?.$d);
    setFromTimeStamp(fromDate);
    setValue('startDate', date?.$d);
    clearErrors('startDate');
    clearErrors('endDate');
    setGetEndDate(new Date(date?.$d?.getTime() + 1000 * 600));
    setValue('endDate', new Date(date?.$d?.getTime() + 1000 * 600));
    setErrorMessage('');
    if (date) {
      setToDateDisabled(false);
    }
    if (fromDate === null) {
      setErrorMessage('From date is Invalid!');
    }
  };

  //function to handle To date
  const handleToDate = (date: any, fromDate?: any, start?: number) => {
    if (getStartDate === null && fromDate === null) {
      setGetEndDate(date?.$d);
      setValue('endDate', date?.$d);
      clearErrors('endDate');
      setErrorMessage('Please select From Date!');
    } else {
      setGetEndDate(date?.$d);
      setValue('endDate', date?.$d);
      clearErrors('endDate');
      setErrorMessage('');
    }
    const toDate: number | null = convertToEpoch2(date?.$d);
    setToTimeStamp(toDate);
    if (
      (start && toDate && toDate < start) ||
      (!start && toDate && fromTimestamp != null && toDate < fromTimestamp)
    ) {
      setErrorMessage('To Date is invalid!');
      setValue('endDate', date?.$d);
      clearErrors('endDate');
    }
  };

  useEffect(() => {
    if (profile?.timezone !== 'UTC') {
      const start = getTomorrowEpoch(profile?.timezone);
      const end = getTomorrowEpoch(profile?.timezone);
      const payload = {
        startDate: start,
        endDate: end,
        status: null
      };
      dispatch(getAvailableSummary(payload));
      setPayloads(payload);
      const fromDate = dayjs
        .unix(start || 0)
        .tz(profile?.timezone)
        .toDate()
        .toString();
      setGetStartDate(fromDate);
      handleFromDate(dayjs.unix(start || 0).tz(profile?.timezone));
      handleToDate(dayjs.unix(end || 0).tz(profile?.timezone), fromDate, start);
      setValue('status', 'ALL');
    }
  }, [profile?.timezone, isDefault]);

  useEffect(() => {
    dispatch(
      summaryInfo(
        <Box sx={{ maxWidth: '400px' }}>
          <Alert severity='warning'>RLR need to be added before scheduling.</Alert>
        </Box>
      )
    );
  }, []);

  // useEffect(() => {
  //   dispatch(getMyProfileAction(createAbort().abortCall.signal));
  //   return () => {
  //     createAbort().abortCall.abort();
  //   };
  // }, []);

  return (
    <Box className='available-tour-summary'>
      <Box className='bread-crumbs'>
        {!view && (
          <CustomBreadcrumbs
            className='tracking-heading'
            itemOne={'Tour Summary'}
            itemTwo={`${epochToDateFormatSg(summaryDate, profile?.timezone)}`}
            itemTwoState={view}
            setView={setView}
          />
        )}

        {!view && (
          <Box
            component='form'
            className='summary-filter'
            onSubmit={handleSubmit(onFilter)}
            sx={{ width: SmallDevices ? '100%' : 'auto' }}
          >
            <Box
              sx={{
                width: xSDevices ? '100%' : SmallDevices ? '32%' : '200px',
                marginBottom: xSDevices ? '5px' : 0
              }}
            >
              <CustomDatePicker
                id='select-startdate'
                name='startDate'
                control={control}
                disableFuture={false}
                disablePast={false}
                value={getStartDate}
                format='DD/MM/YYYY'
                placeholder='From Date'
                getStartDate={getStartDate}
                isDisabled={isDateDisabled}
                onDateSelect={(start: Date, end: Date) => handleCustomFrom(start, end)}
                onDateChange={(date: any) => {
                  if (date?.$d && date?.$d != 'Invalid Date') {
                    handleFromDate(date);
                  } else {
                    setValue('startDate', null);
                  }
                }}
                type='summary'
                timeZone={profile?.timezone !== 'UTC' ? profile?.timezone : null}
              />
              {errorMessage && (
                <Typography className='error-msg'>{errorMessage}</Typography>
              )}
            </Box>
            <Box
              sx={{
                width: xSDevices ? '100%' : SmallDevices ? '32%' : '200px',
                marginBottom: xSDevices ? '5px' : 0,
                marginLeft: !xSDevices ? '10px' : 0
              }}
            >
              <CustomDatePicker
                id='select-enddate'
                name='endDate'
                control={control}
                placeholder='To Date'
                format='DD/MM/YYYY'
                disableFuture={false}
                disablePast={false}
                getStartDate={getStartDate}
                value={getEndDate}
                onDateSelect={(start: Date, end: Date) => handleCustomTo(start, end)}
                onDateChange={(date: any) => {
                  if (date?.$d && date?.$d != 'Invalid Date') {
                    handleToDate(date, getStartDate);
                  } else {
                    setValue('endDate', null);
                  }
                }}
                minDateTime={getStartDate !== null ? dayjs(getStartDate) : null}
                isDisabled={toDateDisabled}
                type='summary'
                timeZone={profile?.timezone !== 'UTC' ? profile?.timezone : null}
              />
            </Box>
            <Box
              sx={{
                width: xSDevices ? '100%' : SmallDevices ? '32%' : '200px',
                marginLeft: !xSDevices ? '10px' : 0
              }}
            >
              <CustomSelect
                id='status'
                control={control}
                name='status'
                placeholder='Select status'
                options={status}
                isOptional={true}
                onChanges={(e: any) => {
                  if (e) {
                    setErrorMessage('');
                  }
                }}
              />
            </Box>
            <Box className='filter-btns'>
              <Box sx={{ marginLeft: '10px', marginTop: '-1px' }}>
                <CustomButton className='saveChanges' category='Filter' type='submit' />
              </Box>
              <Box sx={{ marginLeft: '10px' }}>
                <CustomButton
                  className='saveChanges clear-filter'
                  category='Clear filter'
                  onClick={clearFilter}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
      {!view ? (
        <>
          {isLoading || profileLoader ? (
            <Loader />
          ) : (
            <>
              {data?.length === 0 ? (
                <Box className='no-available'>
                  <Typography className='text'>
                    No summary available at the moment
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2} className='flip-card-wrapper'>
                  {data
                    ?.slice()
                    .reverse()
                    ?.map((item: AutoPlanner, index: number) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Box className='flip-card-container'>
                          <Box
                            className={`flip-card ${
                              flippedStates === item.autoplannerID ? 'flipped' : ''
                            }`}
                          >
                            <Box className='flip-card-front'>
                              <Card
                                date={item.autoplannerID}
                                passengers={item.totalPassengers}
                                trips={item.tripsCount}
                                vehicles={item.utilizedVehicles}
                                status={item.status}
                                updatedOn={item.createdAt}
                                modes={item.distinctModes}
                              />
                            </Box>
                            <Box className='flip-card-back'>
                              <CardBack
                                date={item.autoplannerID}
                                index={item.autoplannerID}
                                modes={item.distinctModes}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                </Grid>
              )}
            </>
          )}
        </>
      ) : (
        <TourSummary
          summaryDate={summaryDate}
          view={view}
          setView={setView}
          timeZone={profile?.timezone}
        />
      )}
    </Box>
  );
};

export default AvailableTourSummary;
