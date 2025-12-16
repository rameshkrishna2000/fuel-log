import { Alert, Box, Dialog, DialogContent, Grid, Typography } from '@mui/material';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppDispatch, useAppSelector } from '../../../../../app/redux/hooks';
import {
  convertDatetoEpoch,
  findAddress,
  formatISTtoTime,
  isValidField,
  useAbort
} from '../../../../../utils/commonFunctions';
import CustomIconButton from '../../../../../common/components/buttons/CustomIconButton';
import CustomSelect from '../../../../../common/components/customized/customselect/CustomSelect';
import CustomTextField from '../../../../../common/components/customized/customtextfield/CustomTextField';
import GoogleSearchBox from '../../../../../common/components/maps/googlesearchbox/GoogleSearchBox';
import CustomDateTimeCalendar from '../../../../../common/components/customized/customdatetimecalendar/CustomDateTimeCalendar';
import CustomDateCalendar from '../../../../../common/components/customized/customcalendar/CustomCalendar';
import CustomButton from '../../../../../common/components/buttons/CustomButton';
import CustomTimePicker from '../../../../../common/components/customized/customtimepicker/CustomTimePicker';
import GoogleMap from '../../../../../common/components/maps/googlemap/GoogleMap';
import GoogleTripDirections from '../../../../../common/components/maps/googledirection/GoogleTripDirections';
import CustomRadioButton from '../../../../../common/components/customized/customradiobutton/CustomRadioButton';
import '../../trips/bookings/components/AddTrip.scss';
import PhoneNoTextField from '../../../../../common/components/customized/customtextfield/PhoneNoTextField';
import {
  autoPlannerRoutesAction,
  clearAdhocTransferVehicle
} from '../../../redux/reducer/autoPlannerSlices/autoplanner';
import { useAdhocFormSubmission } from '../hooks/addadhoctriphook/adHocFormSubmission';
import {
  useAdHocFormOnchange,
  useAdHocUpdateHook
} from '../hooks/addadhoctriphook/adHocFormHandler';
import { useAdHocMapHandler } from '../hooks/addadhoctriphook/adHocMapHandler';
import {
  useAdHocCommonFunctions,
  useAdHocCommonStates
} from '../hooks/addadhoctriphook/adHocCommonFunction';

interface Props {
  isOpen: boolean;
  setCallApi: any;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTripMode?: any;
  selectedRow: any;
  setSelectedRow: any;
  pageDetails: { pageNo: number; pageSize: number; isAll?: boolean };
  Agents: { id: string; label: string }[];
  Routes: { id: string; label: string }[];
  selectedGroup?: any;
  mode?: string;
  filterPayload?: any;
  isViewAdhoc?: any;
}

interface Select {
  id: string;
  label: string;
}

interface UpdatePayload {
  tripID: number;
  journeyID: string;
  adultCount: number;
  agentName: string;
  childCount: number;
  date: string | null;
  destination: string | null;
  endLat: number | null;
  endLng: number | null;
  bufferTime: string | null;
  guestName: string;
  mode: string;
  refNumber: string;
  tourName: string | null;
  source: string | null;
  startLat: number | null;
  startLng: number | null;
  startTimestamp?: number | null;
  isScheduleModifying?: number;
  vehicleNumber?: string;
  isOverview?: boolean;
}

const AddAdhocTrip = ({
  isOpen,
  setCallApi,
  setIsOpen,
  selectedRow,
  setSelectedRow,
  pageDetailss,
  autoplannerID,
  Agents,
  mode,
  selectedGroup,
  setBadgeCount
}: any) => {
  const dispatch = useAppDispatch();
  const createAbort = useAbort();

  const { isLoading: BookingUpdateLoading } = useAppSelector(
    state => state.AutoPlannerAddTrip
  );
  const { isLoading } = useAppSelector(state => state.autoPlannerRoutes);
  const { isLoading: updateAdhocLoading } = useAppSelector(
    state => state.AutoPlannerUpdateTrip
  );
  const { data } = useAppSelector(state => state.auth);
  const profile = useAppSelector(state => state.myProfile.data);
  const timezone = profile?.timezone;

  const { data: adhocVehicle, isLoading: getAdhocLoading } = useAppSelector(
    state => state.getAdhocVehicle
  );
  const { data: adhocTransferVehicle, isLoading: getTransferAdhocLoading } =
    useAppSelector(state => state.getAdhocTransferVehicle);

  const { isLoading: AddAdhocLoading } = useAppSelector(state => state.AddAdhocVehicle);
  const { isLoading: sicBookingUpdateLoading } = useAppSelector(
    state => state.sicBookingsUpdate
  );
  const { isLoading: pvtBookingUpdateLoading } = useAppSelector(
    state => state.updatePvtGrpScheduled
  );
  const { data: profileData } = useAppSelector(state => state.auth);

  const tourNames = useAppSelector(state => state.autoPlannerRoutes.data || []);

  const driverName = useAppSelector(state => state.externalvalidation?.data);

  let roletype = profileData?.role;

  const configuredRoute = tourNames?.map((value: any) => ({
    id: value.tourName,
    label: value.tourName,
    is: value.isTimeRequired
  }));

  const tripTypes = [
    { id: 'PVT', label: 'PVT' },
    { id: 'SIC', label: 'SIC' },
    { id: 'TSIC', label: 'TSIC' },
    { id: 'GRP', label: 'GRP' }
  ];

  const {
    sourceAddress,
    setSourceAddress,
    destinationAddress,
    setDestinationAddress,
    tripType,
    setTripType,
    timeReq,
    setTimeReq,
    tourName,
    setTourName,
    pvtRoute,
    setPvtRoute,
    vehicleType,
    setVehicleType,
    transferVehicleType,
    setTransferVehicleType,
    isVehicleNumberEnable,
    setIsVehicleNumberEnable,
    epocvalue,
    setEpocvalue
  } = useAdHocCommonStates();

  const APagent = roletype === 'ROLE_AGENT';
  const APsubAgent = roletype === 'ROLE_SUB_AGENT';

  const schema = () =>
    yup.object().shape({
      agentname: yup.string().required('Select agent name'),
      route: yup.string().optional(),
      phone: yup
        .string()
        .optional()
        .test('phone-error', 'Enter valid contact number', function (value: any) {
          if (validationErrors && value && validationErrors.phone !== 'no-error') {
            return this.createError({ message: validationErrors.phone });
          } else {
            return true;
          }
        }),
      referenceno: yup
        .string()
        .notRequired()
        .max(50, 'Reference no cannot exceed 50 characters'),
      guestname: yup
        .string()
        .required('Enter guest name')
        .matches(/^[A-Za-z.-]+(\s*[A-Za-z.-]+)*$/, 'Enter valid guest name')
        .min(3, 'Guest name must contain at least 3 characters')
        .max(50, 'Guest name cannot exceed 50 characters'),
      adultcount: yup
        .number()
        .typeError('Enter adult count')
        .required('Enter adult count')
        .min(1, 'Adult Count must be at least 1')
        .max(50, 'Adult Count must not exceed 50')
        .integer('Enter a valid adult count')
        .test(
          'is-whole-number',
          'Decimal values are not allowed',
          value => value === undefined || Number.isInteger(value)
        ),

      childcount: yup
        .number()
        .transform((value, originalValue) =>
          String(originalValue).trim() === '' ? undefined : value
        )
        .nullable()
        .notRequired()
        .min(0, 'Child count cannot be below 0')
        .max(50, 'Child count must not exceed 50')
        .typeError('Child count must be a number'),

      // .typeError('Child Count Cannot be Below 0'),
      triptype: yup.string().required('Select tour mode'),
      sourceAddress: yup.object().shape({
        source: yup.string().required('Select pickup location'),
        startLat: yup.number().required('Enter Latitude for Pickup Location'),
        startLng: yup.number().required('Enter Longitude for Pickup Location')
      }),
      destinationAddress: yup.object().when(['triptype'], {
        is: (triptype: any) =>
          (triptype === 'PVT' || triptype === 'GRP') && pvtRoute === 'Custom',
        then: () =>
          yup.object().shape({
            destination: yup.string().required('Select drop location'),
            endLat: yup.number().required('Enter Latitude for Drop Location'),
            endLng: yup.number().required('Enter Longitude for Drop Location')
          }),
        otherwise: () =>
          yup.object().shape({
            destination: yup.string().notRequired(),
            endLat: yup.number().notRequired(),
            endLng: yup.number().notRequired()
          })
      }),
      noSeats: yup.boolean().oneOf([true], 'Seating capacity reached').default(true),

      startdate: yup.mixed().when(['triptype', 'configuredRoute'], {
        is: (triptype: any, tourName: any) => {
          return (
            ['PVT', 'GRP'].includes(triptype) ||
            (
              ['SIC', 'TSIC'].includes(triptype) &&
              configuredRoute.find((item: any) => item.id === tourName)
            )?.is
          );
        },
        then: () =>
          yup
            .date()
            .typeError('Enter valid pickup date and time')
            .required('Select pickup date and time')
            .test('today-after-now', 'Invalid date and time', value => {
              if (!value) return false;
              const now = new Date(
                new Date().toLocaleString('en-US', { timeZone: profile?.timezone })
              );
              const selected = new Date(
                new Date(value).toLocaleString('en-US', { timeZone: profile?.timezone })
              );
              return selected.toDateString() === now.toDateString() && selected > now;
            }),
        otherwise: () => yup.mixed().notRequired()
      }),

      bufferTime: yup.object().when('triptype', {
        is: (value: any) =>
          (value === 'PVT' || value === 'GRP') && tourName == 'DISPOSAL 4 HRS',
        then: () =>
          yup
            .date()
            .optional()
            .test('is-valid-time', 'Invalid time format', value => {
              return true || null;
            }),
        otherwise: () => yup.string().notRequired()
      }),
      configuredRoute: yup.string().when('triptype', {
        is: (value: any) =>
          value === 'SIC' || value === 'TSIC' || pvtRoute === 'Standard',
        then: () => yup.string().required('Select tour name'),
        otherwise: () => yup.string().notRequired()
      }),
      tripDate: yup.string().when(['triptype', 'tourName'], {
        is: (triptype: any, tourname: any) =>
          (triptype === 'SIC' || triptype === 'TSIC') && timeReq === 0,
        then: () =>
          yup
            .string()
            .required('Select trip date')
            .matches(
              /^\d{2}\/\d{2}\/\d{4}$/,
              'Trip Date must be in the format DD/MM/YYYY'
            )
            .test('is-future-date', 'Trip date should be in present date', value => {
              const [day, month, year] = value.split('/');
              const today = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
              const selectedDate = Math.floor(
                new Date(`${year}-${month}-${day}`).setHours(0, 0, 0, 0) / 1000
              );

              return today === selectedDate;
            }),
        otherwise: () => yup.string().notRequired()
      }),
      vehicleType: yup.string().notRequired(),
      vehicleNumber: yup.string().when(['vehicleType'], {
        is: (val: string) => val === 'Internal' && !APagent && !APsubAgent,
        then: schema => schema.required('Select vehicle number'),
        otherwise: schema =>
          APagent || APsubAgent
            ? schema.notRequired()
            : schema
                .required('Enter vehicle number')
                .matches(
                  /^[A-Za-z0-9]*$/,
                  'Only letters and numbers allowed without spaces'
                )
                .test(
                  'valid-length',
                  'Enter a valid vehicle number',
                  value => (value?.length || 0) >= 4
                )
                .max(20, 'Maximum 20 characters')
                .test('has-letter', 'Must include at least one letter', value =>
                  /[A-Za-z]/.test(value || '')
                )
                .test('has-number', 'Must include at least one number', value =>
                  /[0-9]/.test(value || '')
                )
      }),

      driverName: yup.string().when('$vehicleType', {
        is: (val: string) => {
          return val !== 'Internal';
        },
        then: schema =>
          schema
            .required('Enter driver name')
            .matches(/^[a-z,A-Z\s]+$/, 'Driver name must only contain characters')
            .min(3, 'Driver name must be more than 2 characters'),
        otherwise: schema => schema.notRequired()
      }),

      isTime: yup.boolean().notRequired(),

      seatingCapacity: yup.number().when('$vehicleType', {
        is: (val: string) => {
          return val !== 'Internal';
        },
        then: schema =>
          schema
            .required('Enter seating capacity')
            .max(249, 'Maximum seating capacity is 249')
            .transform((value, originalValue) =>
              originalValue === '' ? undefined : value
            )
            .test('min-seating-capacity', function (value) {
              const parent = this.parent || {};

              const { adultcount = 0, childcount = 0 } = parent;
              const data = this.parent;
              const vehicleType = this.options.context?.vehicleType;

              if (vehicleType !== 'Internal') {
                const total = (adultcount || 0) + (childcount || 0) || 1;

                if (value === undefined || value < total) {
                  return this.createError({
                    message: `Seat Capacity must be at least ${total}`
                  });
                }
              }

              return true;
            }),
        otherwise: schema => schema.notRequired()
      }),

      contactNumber: yup.string().when('$vehicleType', {
        is: (val: string) => val !== 'Internal',
        then: schema =>
          schema
            .required('Enter driver contact number')
            .test(
              'contactNumber-error',
              'Enter a valid contact number',
              function (value: any) {
                if (value && validationErrors.contactNumber !== 'no-error') {
                  return this.createError({ message: validationErrors.contactNumber });
                } else {
                  return true;
                }
              }
            ),
        otherwise: schema => schema.notRequired()
      }),

      transferVehicleType: yup.string().notRequired(),

      transferVehicleNumber: yup
        .string()
        .when(
          ['vehicleType', '$adhocTransferDropdown', 'triptype', '$adhocTransferVehicle'],
          {
            is: (
              vehicleType: any,
              adhocTransferDropdown: any,
              triptype: any,
              adhocTransferVehicle: any
            ) => {
              return (
                vehicleType === 'Internal' &&
                adhocTransferVehicle?.length > 0 &&
                ['SIC', 'TSIC']?.includes(triptype)
              );
            },
            then: schema =>
              schema.when('$transferVehicleType', {
                is: (val: string) => val === 'Internal',
                then: schema => schema.required('Select transfer vehicle number'),
                otherwise: schema => schema.required('Enter transfer vehicle number')
              }),
            otherwise: schema => schema.notRequired()
          }
        ),

      transferDriverName: yup.string().when('$transferVehicleType', {
        is: (val: string) => val !== 'Internal',
        then: schema =>
          schema
            .required('Enter driver name')
            .matches(/^[a-zA-Z\s]+$/, 'Driver name must only contain characters')
            .min(3, 'Driver name must be more than 2 characters'),
        otherwise: schema => schema.notRequired()
      }),

      transferContactNumber: yup.string().when('$transferVehicleType', {
        is: (val: string) => val !== 'Internal',
        then: schema =>
          schema
            .required('Enter transfer contact number')
            .test(
              'transfernumber-error',
              'Enter a valid contact number',
              function (value: any) {
                if (
                  value &&
                  validationErrors.transferContactNumber &&
                  validationErrors.transferContactNumber !== 'no-error'
                ) {
                  return this.createError({
                    message: validationErrors.transferContactNumber
                  });
                } else {
                  return true;
                }
              }
            ),
        otherwise: schema => schema.notRequired()
      }),

      transferCapacity: yup.number().when('$transferVehicleType', {
        is: (val: string) => {
          return val !== 'Internal';
        },
        then: schema =>
          schema
            .required('Enter seating capacity')
            .min(1, 'Minimum seating capacity is 1')
            .max(249, 'Maximum seating capacity is 249')
            .transform((value, originalValue) => {
              return originalValue === '' ? undefined : value;
            })
            .typeError('Enter valid seating capacity'),

        otherwise: schema => schema.notRequired()
      }),
      disposalPickupWindow: yup.object().notRequired()
    });

  let role = data?.role;

  const formatDate = (date: string | Date | null) => {
    return date ? dayjs(date).format('DD/MM/YYYY') : '';
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const adhocTransferDropdown = adhocTransferVehicle?.data?.transferVehicles
    ?.map((item: any) => ({
      id: item?.vehicleNumber,
      label: `${item?.vehicleNumber?.toUpperCase()} (${item?.seatingCapacity})`,
      seatingCapacity: item?.seatingCapacity,
      group: item?.isAssignedToTour ? 'Used Vehicles (R)' : 'Unused vehicles (A)'
    }))
    .sort((a: any, b: any) => a.group.localeCompare(b.group))
    .sort((value: any) => (value.group === 'Unused vehicles (A)' ? 1 : -1));

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    getValues,
    trigger,
    reset,
    resetField,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema()),
    context: {
      vehicleType,
      transferVehicleType,
      adhocTransferDropdown,
      adhocTransferVehicle: adhocTransferVehicle?.data?.mainHotelResponses
    }
  });

  const { epochStartOfTodaySG, adhocDropdown, tripMarker, setTripMarker } =
    useAdHocCommonFunctions({
      adhocVehicle,
      adhocTransferVehicle,
      tripType,
      data,
      Agents,
      setValue
    });

  const address = async (lat: any, lng: any) => {
    let fAdd = findAddress(lat, lng);
    return fAdd;
  };

  const {
    handleValidate,
    handleClose,
    handleVehicleDropdown,
    handleTransferVehicleDropdown,
    validationErrors
  } = useAdHocFormOnchange({
    setSelectedRow,
    setIsOpen,
    reset,
    setCallApi,
    vehicleType,
    getValues,
    setIsVehicleNumberEnable,
    setValue,
    tripType,
    selectedRow,
    timezone,
    transferVehicleType,
    epochStartOfTodaySG,
    trigger,
    formatDate,
    clearErrors,
    setPvtRoute,
    setVehicleType,
    setEpocvalue,
    createAbort,
    autoplannerID,
    driverName
  });

  const { onSubmit } = useAdhocFormSubmission({
    tripType,
    formatISTtoTime,
    pvtRoute,
    timezone,
    vehicleType,
    APsubAgent,
    APagent,
    adhocTransferVehicle,
    transferVehicleType,
    selectedRow,
    handleClose,
    autoplannerID,
    setBadgeCount,
    pageDetailss,
    adhocVehicle,
    epochStartOfTodaySG,
    adhocTransferDropdown,
    adhocDropdown
  });

  const { startDate, setStartDate } = useAdHocUpdateHook({
    selectedRow,
    setValue,
    setEpocvalue,
    mode,
    profile,
    setTripType,
    selectedGroup,
    setTripMarker,
    setSourceAddress,
    setDestinationAddress,
    setVehicleType,
    epochStartOfTodaySG,
    setIsVehicleNumberEnable,
    setTransferVehicleType,
    tourNames,
    setTimeReq,
    setPvtRoute
  });

  const { handleMarkerDrag } = useAdHocMapHandler({
    setSourceAddress,
    address,
    setDestinationAddress,
    tripMarker,
    setValue,
    sourceAddress,
    clearErrors,
    setTripMarker,
    destinationAddress,
    selectedRow
  });

  return (
    <Box className='add-trip-component'>
      <Dialog
        open={isOpen}
        fullScreen
        sx={{ padding: 3, zIndex: 5, position: 'absolute' }}
        className='add-trip-dialog-auto animate__animated animate__zoomIn'
        BackdropProps={{
          invisible: true
        }}
      >
        <DialogContent
          sx={{ overflow: 'hidden', padding: 0 }}
          className='add-trip-dialog-content'
        >
          <Grid
            container
            sx={{
              flexDirection: { xs: 'column-reverse', md: 'row', sm: 'row' }
            }}
            className='add-trip-grid-container'
          >
            <Grid item xs={12} md={8} sm={8} lg={9} sx={{ overflow: 'hidden' }} p={2}>
              <Box
                sx={{
                  width: '100%',
                  height: { xs: '22vh', sm: '87vh', md: '87vh' },
                  overflow: { xs: 'scroll', md: 'hidden' },
                  borderRadius: '10px'
                }}
              >
                <GoogleMap>
                  <GoogleTripDirections
                    locations={tripMarker}
                    isDraggable={true}
                    setTripMarker={setTripMarker}
                    handleMarker={handleMarkerDrag}
                    showPath={true}
                  />
                </GoogleMap>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sm={4} lg={3} className='add-trip-grid-item'>
              <Box className='add-trip-header'>
                <Typography
                  className='add-booking-title'
                  sx={{
                    fontSize: '18px !important',
                    fontWeight: '600 !important'
                  }}
                >
                  {selectedRow?.tripID ? 'Update Ad-hoc' : 'Add Ad-hoc'}
                </Typography>
              </Box>
              <Box
                className='closeIcon icon-position d-flex close-icon-index'
                onClick={() => handleClose()}
              >
                <CustomIconButton category='CloseValue' />
              </Box>
              <Box
                className='add-trip-form animate__animated animate__zoomIn animate__slow'
                component='form'
                sx={{
                  height: 'fit-content',
                  maxHeight: { xs: '62vh', sm: '79vh', md: '79vh', lg: '79vh' },
                  overflowY: 'scroll',
                  paddingRight: '15px'
                }}
                onSubmit={handleSubmit(onSubmit)}
              >
                <CustomSelect
                  id='agent-name'
                  control={control}
                  isDisabled={
                    data?.role === 'ROLE_AGENT' || data?.role === 'ROLE_SUB_AGENT'
                  }
                  name='agentname'
                  label='Agent Name'
                  placeholder='Agent name'
                  options={Agents}
                  onChanges={(e: any, newValue: any) => {
                    setValue('agentname', newValue?.id);
                    if (!APagent && !APsubAgent) {
                      handleVehicleDropdown();
                    }
                  }}
                />
                <CustomTextField
                  id='guest-name'
                  control={control}
                  name='guestname'
                  label='Guest Name'
                  placeholder='Guest name'
                  maxlength={20}
                  onChangeCallback={e => {
                    setValue('guestname', e);
                    if (!APagent && !APsubAgent) {
                      handleVehicleDropdown();
                    }
                  }}
                />
                <Controller
                  name='phone'
                  control={control}
                  // defaultValue={selectedRow?.guestContactNumber || '+65'}
                  defaultValue={selectedRow?.guestContactNumber || ''}
                  rules={{ required: true }}
                  render={({ field }: any) => (
                    <PhoneNoTextField
                      {...field}
                      setValue={setValue}
                      isOptional={true}
                      style='share'
                      label='Contact Number'
                      error={Boolean(errors?.phone?.message)}
                      helperText={errors.phone?.message}
                      onChange={(e: any) => {
                        if (e) {
                          const emptySpace = /^.+\s.+$/g;
                          const isValid = isValidField('contactnumber', e);

                          if (e && !emptySpace.test(e) && isValid) {
                            handleValidate(e, 'phone');
                          }
                        } else {
                          setValue('phone', '');
                        }
                        trigger('phone');
                      }}
                    />
                  )}
                />
                <Grid container spacing={1} className='adult-count-field'>
                  <Grid item sm={6}>
                    <CustomTextField
                      id='adult-count'
                      control={control}
                      type='number'
                      name='adultcount'
                      label='Adult Count'
                      placeholder='Adult count'
                      isDecimal={true}
                      onChangeCallback={(e: any) => {
                        setValue('adultcount', e);
                        if (!APagent && !APsubAgent) {
                          handleVehicleDropdown();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item sm={6} className='child-count-field'>
                    <CustomTextField
                      id='child-count'
                      control={control}
                      type='number'
                      name='childcount'
                      label='Child Count'
                      isOptional={true}
                      isDecimal
                      defaultValue=''
                      placeholder='Child count'
                      onChangeCallback={(e: any) => {
                        setValue('childcount', e);
                        const value = e?.target?.value;
                        // if (value && value < 0) {
                        //   setValue('childcount', 0);
                        // } else {
                        //   setValue('childcount', value || 0);
                        // }
                        if (!APagent && !APsubAgent) {
                          handleVehicleDropdown();
                        }
                      }}
                    />
                  </Grid>
                </Grid>
                <CustomTextField
                  id='reference-no'
                  control={control}
                  name='referenceno'
                  label='Reference No'
                  placeholder='Reference no'
                  isOptional={true}
                  onChangeCallback={(e: any) => {
                    setValue('referenceno', e);
                    if (!APagent && !APsubAgent) {
                      handleVehicleDropdown();
                    }
                  }}
                />
                <CustomSelect
                  id='trip-type'
                  control={control}
                  label='Tour Mode'
                  placeholder='Tour mode'
                  options={tripTypes}
                  name='triptype'
                  onChanges={(event: any, newValue: Select) => {
                    setValue('triptype', newValue?.id);
                    setTripType(newValue?.label);
                    dispatch(
                      autoPlannerRoutesAction({
                        mode: newValue?.label,
                        currentSecond: dayjs()
                          .tz(profile.timezone)
                          .format('HH:mm:ss')
                          .split(':')
                          .map(Number)
                          .reduce((acc: any, time: any) => 60 * acc + +time)
                      })
                    );
                    clearErrors('triptype');
                    setValue('configuredRoute', '');
                    setValue('sourceAddress.source', '');
                    setSourceAddress(null);
                    setTripMarker([]);
                    setPvtRoute('Standard');
                    setValue('route', 'Standard');
                    setDestinationAddress(null);
                    setValue('configuredRoute', '');
                    setStartDate(null);
                    setValue('startdate', '');
                    // setValue('bufferTime', dayjs('00:20', 'HH:mm'));
                    if (['PVT', 'GRP']?.includes(newValue?.id)) {
                      setValue('tripDate', '');
                      setEpocvalue(null);
                    } else {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const formattedToday = formatDate(today);
                      setValue('tripDate', formattedToday);
                      clearErrors('tripDate');
                      setEpocvalue(dayjs(today).unix());
                      setValue('route', 'Standard');
                    }
                    clearErrors([
                      'tripDate',
                      'configuredRoute',
                      'bufferTime',
                      'startdate',
                      'sourceAddress'
                    ]);

                    if (!APagent && !APsubAgent) {
                      handleVehicleDropdown();
                    }
                  }}
                />
                {tripType !== null && tripType !== undefined && (
                  <GoogleSearchBox
                    id='search-source'
                    name='sourceAddress'
                    control={control}
                    label='Pickup Location'
                    placeholder='Search Location..'
                    value={sourceAddress?.formatted_address}
                    // setAddress={setSourceAddress}
                    setAddress={(place: any) => {
                      setSourceAddress(place);
                      // Set full delivery address and lat/lng from selected place
                      setValue('sourceAddress.source', place?.formatted_address || '');
                      setValue(
                        'sourceAddress.startLat',
                        place?.geometry?.location?.lat() || null
                      );
                      setValue(
                        'sourceAddress.startLng',
                        place?.geometry?.location?.lng() || null
                      );
                      if (!APagent && !APsubAgent) {
                        handleVehicleDropdown();
                      }
                    }}
                    country='sg'
                    onchange={(e: any, data: any) => {
                      if (!e?.target?.value) {
                        setValue('sourceAddress' as any, null);
                        setSourceAddress(null);
                        setTripMarker((prev: any) =>
                          prev.filter((item: any) => item?.id !== 'source')
                        );
                        if (!APagent && !APsubAgent) {
                          handleVehicleDropdown();
                        }
                      }
                    }}
                  />
                )}

                {tripType === 'PVT' || tripType === 'GRP' ? (
                  <CustomRadioButton
                    name='route'
                    control={control}
                    formlabel='Select Route Type'
                    radiobutton2='Standard'
                    radiobutton1='Custom'
                    value2='Standard'
                    value1='Custom'
                    value={pvtRoute}
                    onChangeCallback={e => {
                      setPvtRoute(e.target.value);
                      setValue('route', e.target.value);
                      setValue('configuredRoute', '');
                      setValue('destinationAddress', {
                        destination: '',
                        endLat: null,
                        endLng: null
                      });
                      setTripMarker((prev: any) =>
                        prev.filter((item: any) => item.id !== 'destination')
                      );
                      setDestinationAddress(null);
                      // setValue('startdate', '');
                      setValue('bufferTime', dayjs('00:20', 'HH:mm'));
                    }}
                  />
                ) : (
                  ''
                )}

                {(tripType === 'PVT' || tripType === 'GRP') && (
                  <>
                    {pvtRoute === 'Custom' ? (
                      <GoogleSearchBox
                        id='search-destination'
                        name='destinationAddress'
                        control={control}
                        label='Drop Location'
                        placeholder='Search Location..'
                        value={destinationAddress?.formatted_address}
                        // setAddress={setDestinationAddress}
                        country='sg'
                        onchange={(e: any) => {
                          if (!e?.target?.value) {
                            setValue('destinationAddress' as any, null);
                            setDestinationAddress(null);
                            setTripMarker((prev: any) =>
                              prev.filter((item: any) => item.id !== 'destination')
                            );
                          }
                          if (!APagent && !APsubAgent) {
                            handleVehicleDropdown();
                          }
                        }}
                        setAddress={(place: any) => {
                          setDestinationAddress(place);
                          // setValue(
                          //   'destinationAddress.destination',
                          //   place?.formatted_address || ''
                          // );
                          // setValue(
                          //   'sourceAddress.startLat',
                          //   place?.geometry?.location?.lat() || null
                          // );
                          // setValue(
                          //   'sourceAddress.startLng',
                          //   place?.geometry?.location?.lng() || null
                          // );
                          setValue('destinationAddress', {
                            destination: place?.formatted_address || '',
                            endLat: place?.geometry?.location?.lat() || null,
                            endLng: place?.geometry?.location?.lng() || null
                          });
                          if (!APagent && !APsubAgent) {
                            handleVehicleDropdown();
                          }
                        }}
                      />
                    ) : (
                      <CustomSelect
                        id='configured-route'
                        control={control}
                        label='Tour Name'
                        loading={isLoading}
                        placeholder='Select Tour Name'
                        options={configuredRoute}
                        name='configuredRoute'
                        onChanges={(event: any, newValue: any) => {
                          setValue('configuredRoute', newValue?.id);
                          setTourName(newValue?.label);
                          clearErrors('triptype');
                          if (newValue?.is === 0) {
                            setValue('isTime', false);
                            setTimeReq(0);
                          } else {
                            setValue('isTime', true);
                            setTimeReq(1);
                          }
                          setValue('startdate', '');
                          // setValue('startdate', '');
                          // setValue('bufferTime', '');
                          // setValue('tripDate', '');
                          setEpocvalue(null);
                          setStartDate(null);
                          if (!APagent && !APsubAgent) {
                            handleVehicleDropdown();
                          }
                        }}
                      />
                    )}
                  </>
                )}

                {tripType !== null && tripType !== undefined && (
                  <>
                    {tripType === 'PVT' || tripType === 'GRP' ? (
                      <>
                        <CustomDateTimeCalendar
                          id='startdate'
                          control={control}
                          name='startdate'
                          label='Pickup Date & Time'
                          disableFuture={false}
                          disablePast={true}
                          enableTodayDate={true}
                          value={startDate}
                          // minDateTime={
                          //   profile?.timezone &&
                          //   dayjs().tz(profile?.timezone).add(1, 'day').startOf('day')
                          // }
                          format='DD/MM/YYYY hh:mm a'
                          placeholder='DD/MM/YYYY HH:MM'
                          onDateChange={(e: any) => {
                            if (e) {
                              setStartDate(e?.$d);
                              setValue(
                                'startdate',
                                dayjs.unix(convertDatetoEpoch(e?.$d) / 1000)
                              );
                              clearErrors('startdate');
                            } else {
                              setValue('startdate' as any, null);
                            }
                            if (!APagent && !APsubAgent) {
                              handleVehicleDropdown();
                            }
                          }}
                        />
                        <CustomTimePicker
                          id='bufferTime'
                          name='bufferTime'
                          control={control}
                          values={getValues('bufferTime')}
                          setDefaultToTime={true}
                          minTime={dayjs('00:20', 'HH:mm')}
                          label='Buffer Time'
                          views={['hours', 'minutes']}
                          format='HH:mm'
                          isClock={false}
                          isOptional={true}
                          onTimeChange={() => {
                            if (!APagent && !APsubAgent) {
                              handleVehicleDropdown();
                            }
                          }}
                        />
                        <Alert
                          sx={{
                            marginBottom: '5px',
                            padding: '5px 10px',
                            alignItems: 'center',
                            fontSize: '12px'
                          }}
                          severity='warning'
                        >
                          By default, a buffer time of 20 minutes will be applied unless
                          specified.
                        </Alert>
                      </>
                    ) : (
                      <>
                        <CustomSelect
                          id='configured-route'
                          control={control}
                          label='Tour Name'
                          loading={isLoading}
                          placeholder='Tour name'
                          options={configuredRoute}
                          name='configuredRoute'
                          onChanges={(event: any, newValue: any) => {
                            setValue('configuredRoute', newValue?.id);
                            if (newValue?.is === 0) {
                              setValue('isTime', false);
                              setTimeReq(0);
                            } else {
                              setValue('isTime', true);
                              setTimeReq(1);
                            }
                            // setValue('startdate', '');
                            // setValue('bufferTime', '');
                            // setValue('tripDate', '');
                            // setEpocvalue(null);
                            setTourName(newValue?.label);
                            clearErrors('triptype');
                            setValue('startdate', '');
                            setStartDate(null);
                            if (!APagent && !APsubAgent) {
                              handleVehicleDropdown();
                            }
                          }}
                        />
                        {timeReq === 1 && (
                          <CustomDateTimeCalendar
                            id='startdate'
                            control={control}
                            name='startdate'
                            label='Pickup Date & Time'
                            disableFuture={false}
                            disablePast={true}
                            enableTodayDate={true}
                            // minDateTime={dayjs().add(1, 'day').startOf('day')}
                            value={startDate}
                            format='DD/MM/YYYY hh:mm a'
                            placeholder='DD/MM/YYYY HH:MM'
                            onDateChange={(e: any) => {
                              if (e) {
                                setStartDate(e?.$d);
                                setValue(
                                  'startdate',
                                  dayjs.unix(convertDatetoEpoch(e?.$d) / 1000)
                                );
                                clearErrors('startdate');
                              }
                              if (!APagent && !APsubAgent) {
                                handleVehicleDropdown();
                              }
                            }}
                          />
                        )}
                        {timeReq === 0 && (
                          <CustomDateCalendar
                            isDisabled={true}
                            id='trip-date'
                            name='tripDate'
                            control={control}
                            type='user-profile'
                            className='calendar'
                            label='Trip Date'
                            placeholder='Select Trip Date'
                            minDate={dayjs().startOf('day')}
                            maxDate={dayjs().startOf('day')}
                            disablePast={true}
                            value={epocvalue ? dayjs.unix(epocvalue) : null}
                            onDateChange={(date: any) => {
                              setStartDate(date.$d);

                              setValue('tripDate', formatDate(date?.$d));
                              clearErrors('tripDate');
                              if (!APagent && !APsubAgent) {
                                handleVehicleDropdown();
                              }
                            }}
                          />
                        )}
                      </>
                    )}
                  </>
                )}

                <>
                  {!APagent && !APsubAgent ? (
                    <>
                      <CustomRadioButton
                        name='vehicleType'
                        control={control}
                        formlabel='Select Vehicle Type'
                        radiobutton1='Internal'
                        radiobutton2='External'
                        value1='Internal'
                        value2='External'
                        value={vehicleType}
                        onChangeCallback={e => {
                          dispatch(clearAdhocTransferVehicle());
                          setVehicleType(e.target.value);
                          setValue('vehicleType', e.target?.value);
                          if (e.target.value === 'Internal') {
                            if (!APagent && !APsubAgent) {
                              handleVehicleDropdown();
                            }
                            setTransferVehicleType('Internal');
                          }
                          setValue('vehicleNumber', '');
                          setValue('driverName', '');
                          setValue('contactNumber', '');
                          resetField('seatingCapacity');
                          resetField('transferCapacity');
                          setValue('transferVehicleNumber', '');
                          setValue('transferDriverName', '');
                          setValue('transferContactNumber', '');

                          clearErrors([
                            'vehicleNumber',
                            'driverName',
                            'contactNumber',
                            'seatingCapacity',
                            'transferVehicleNumber',
                            'transferDriverName',
                            'transferContactNumber',
                            'transferCapacity'
                          ]);

                          // trigger('vehicleNumber');

                          // setPvtRoute(e.target.value);
                          // setValue('route', e.target.value);
                          // setValue('configuredRoute', '');
                          // setValue('destinationAddress', {
                          //   destination: '',
                          //   endLat: null,
                          //   endLng: null
                          // });
                          // setTripMarker((prev: any) =>
                          //   prev.filter((item: any) => item.id !== 'destination')
                          // );
                          // setDestinationAddress(null);
                          // setValue('startdate', '');
                          // setValue('bufferTime', '');
                          // setValue('tripDate', '');
                          // setEpocvalue(null);
                          // setStartDate(null);
                        }}
                      />

                      {vehicleType === 'Internal' && (
                        <Alert
                          sx={{
                            marginBottom: '5px',
                            padding: '5px 10px',
                            alignItems: 'center',
                            fontSize: '12px'
                          }}
                          severity='info'
                        >
                          R - Remaining Seating Capacity
                          <br /> A - Actual Seating Capacity
                        </Alert>
                      )}

                      {vehicleType === 'Internal' ? (
                        <CustomSelect
                          isDisabled={!isVehicleNumberEnable}
                          id='vehicle-number'
                          loading={getAdhocLoading}
                          control={control}
                          name='vehicleNumber'
                          label='Vehicle Number'
                          placeholder='Vehicle number'
                          options={adhocDropdown ?? []}
                          onChanges={(e: any, newValue: any) => {
                            handleTransferVehicleDropdown(newValue);
                            setValue(
                              'disposalPickupWindow',
                              newValue?.disposalPickupWindow
                            );

                            setTransferVehicleType('Internal');
                            setValue('transferVehicleNumber', '');
                            clearErrors('transferVehicleNumber');
                            setValue('transferDriverName', '');
                            setValue('transferContactNumber', '');
                          }}
                        />
                      ) : (
                        <>
                          <CustomTextField
                            id='vehicle-number'
                            control={control}
                            name='vehicleNumber'
                            label='Vehicle Number'
                            placeholder='Vehicle number'
                            maxlength={20}
                          />

                          <Controller
                            name='contactNumber'
                            control={control}
                            defaultValue={selectedRow?.guestContactNumber || '+65'}
                            rules={{ required: true }}
                            render={({ field }: any) => (
                              <PhoneNoTextField
                                {...field}
                                setValue={setValue}
                                country='sg'
                                style='share'
                                label='Driver Contact Number'
                                disableCountry={true}
                                error={Boolean(errors?.contactNumber?.message)}
                                helperText={errors.contactNumber?.message}
                                onChange={(e: any) => {
                                  if (e) {
                                    const emptySpace = /^.+\s.+$/g;
                                    const isValid = isValidField('contactnumber', e);
                                    if (e && !emptySpace.test(e) && isValid) {
                                      handleValidate(e, 'contactNumber');
                                    }
                                  } else {
                                    setValue('contactNumber', '');
                                  }
                                  trigger('contactNumber');
                                }}
                              />
                            )}
                          />
                          <CustomTextField
                            id='driver-name'
                            control={control}
                            name='driverName'
                            disabled={driverName ? true : false}
                            label='Driver Name'
                            placeholder='Driver name'
                            maxlength={20}
                          />
                          <CustomTextField
                            id='seating-capacity'
                            control={control}
                            type='number'
                            name='seatingCapacity'
                            label='Seating Capacity'
                            placeholder='Seating Capacity'
                            isDecimal={true}
                            onChangeCallback={(e: any) => {
                              setValue('seatingCapacity', e);
                            }}
                          />
                        </>
                      )}
                    </>
                  ) : (
                    ''
                  )}
                </>

                {/* transfer vehicle fields  */}
                {adhocTransferVehicle?.data?.mainHotelResponses?.length > 0 &&
                  vehicleType === 'Internal' &&
                  ['SIC', 'TSIC']?.includes(tripType) && (
                    <>
                      <CustomRadioButton
                        name='transferVehicleType'
                        control={control}
                        formlabel='Select Transfer Vehicle Type'
                        radiobutton1='Internal'
                        radiobutton2='External'
                        value1='Internal'
                        value2='External'
                        value={transferVehicleType}
                        onChangeCallback={e => {
                          // setVehicleType(e.target.value);
                          setTransferVehicleType(e.target.value);
                          setValue('transferVehicleNumber', '');
                          clearErrors('transferVehicleNumber');
                          setValue('transferDriverName', '');
                          setValue('transferContactNumber', '');
                        }}
                      />
                      {transferVehicleType === 'Internal' ? (
                        <CustomSelect
                          loading={getTransferAdhocLoading}
                          id='transfer-vehicle-number'
                          control={control}
                          name='transferVehicleNumber'
                          label='Transfer Vehicle Number'
                          placeholder='Transfer vehicle number'
                          options={adhocTransferDropdown || []}
                          onChanges={(e: any, newValue: any) =>
                            setValue('transferVehicleNumber', newValue?.id)
                          }
                        />
                      ) : (
                        <>
                          <CustomTextField
                            id='vehicle-number'
                            control={control}
                            name='transferVehicleNumber'
                            label='Vehicle Number'
                            placeholder='Vehicle number'
                            maxlength={20}
                            onChangeCallback={e => setValue('transferVehicleNumber', e)}
                          />

                          <Controller
                            name='transferContactNumber'
                            control={control}
                            defaultValue={selectedRow?.guestContactNumber || '+65'}
                            rules={{ required: true }}
                            render={({ field }: any) => (
                              <PhoneNoTextField
                                {...field}
                                setValue={setValue}
                                country='sg'
                                style='share'
                                label='Driver Contact Number'
                                disableCountry={true}
                                error={Boolean(errors?.transferContactNumber?.message)}
                                helperText={errors.transferContactNumber?.message}
                                onChange={(e: any) => {
                                  if (e) {
                                    const emptySpace = /^.+\s.+$/g;
                                    if (e && !emptySpace.test(e)) {
                                      handleValidate(e, 'transferContactNumber');
                                    } else {
                                      setValue('transferContactNumber', '');
                                    }
                                    trigger('transferContactNumber');
                                  }
                                }}
                              />
                            )}
                          />
                          <CustomTextField
                            id='driver-vname'
                            control={control}
                            name='transferDriverName'
                            label='Driver Name'
                            disabled={driverName ? true : false}
                            placeholder='Driver name'
                            maxlength={20}
                            onChangeCallback={e => setValue('transferDriverName', e)}
                          />
                          <CustomTextField
                            id='transfer-capacity'
                            control={control}
                            type='number'
                            name='transferCapacity'
                            label='Seating capacity'
                            placeholder='Seating Capacity'
                            isDecimal={true}
                            onChangeCallback={(e: any) => {
                              setValue('transferCapacity', e);
                            }}
                          />
                        </>
                      )}
                      <Alert
                        sx={{
                          marginBottom: '5px',
                          padding: '5px 10px',
                          alignItems: 'center',
                          fontSize: '12px'
                        }}
                        severity='warning'
                      >
                        {`Main Hotel -
                          ${adhocTransferVehicle?.data?.mainHotelResponses[0]?.coordinates?.locationAddress}`}
                      </Alert>
                    </>
                  )}

                <Box mt={3} sx={{ textAlign: 'right' }}>
                  <CustomButton
                    category='Cancel'
                    className='cancel'
                    sx={{ marginRight: '10px' }}
                    onClick={() => handleClose()}
                  />
                  <CustomButton
                    category={selectedRow?.tripID ? 'Save' : 'Save'}
                    loading={
                      // updateData?.isLoading ||
                      // addData?.isLoading ||
                      updateAdhocLoading ||
                      BookingUpdateLoading ||
                      AddAdhocLoading ||
                      sicBookingUpdateLoading ||
                      pvtBookingUpdateLoading
                    }
                    className='saveChanges'
                    type='submit'
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AddAdhocTrip;
