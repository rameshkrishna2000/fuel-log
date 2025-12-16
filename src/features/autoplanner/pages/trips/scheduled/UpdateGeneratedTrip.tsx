import { Box, Dialog, DialogContent, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  capitalizeFirstLetter,
  convertDateTimetoEpoch,
  debounce,
  findAddress,
  formatISTtoTime,
  getTimeRange,
  isValidField,
  useAbort
} from '../../../../../utils/commonFunctions';

import {
  getExcelAction,
  getStandardVehicles,
  scheduleTripsAction,
  sicBookingsUpdate,
  switchTripsAction
} from '../../../redux/reducer/autoPlannerSlices/autoGenerateSlice';
import './UpdateScheduleTrip.scss';
import {
  updateCenter,
  updateZoom
} from '../../../../../common/redux/reducer/commonSlices/mapSlice';
import GoogleMap from '../../../../../common/components/maps/googlemap/GoogleMap';
import GoogleTripDirections from '../../../../../common/components/maps/googledirection/GoogleTripDirections';
import CustomIconButton from '../../../../../common/components/buttons/CustomIconButton';
import CustomSelect from '../../../../../common/components/customized/customselect/CustomSelect';
import CustomTextField from '../../../../../common/components/customized/customtextfield/CustomTextField';
import PhoneNoTextField from '../../../../../common/components/customized/customtextfield/PhoneNoTextField';
import CustomRadioButton from '../../../../../common/components/customized/customradiobutton/CustomRadioButton';
import CustomTimePicker from '../../../../../common/components/customized/customtimepicker/CustomTimePicker';
import CustomButton from '../../../../../common/components/buttons/CustomButton';
import { useAppDispatch, useAppSelector } from '../../../../../app/redux/hooks';
import {
  autoPlannerAgentAction,
  clearContactError,
  clearDriverName,
  contactNumberValidation,
  externalvehicleAction
} from '../../../redux/reducer/autoPlannerSlices/autoplanner';

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  autoplannerID: any;
  setTripMode?: any;
  excelPayload?: any;
  tripMode?: any;
  selectedRow: any;
  selectedTripRow: any;
  setSelectedTripRow: any;
  setPageSize?: any;
  pageDetail: { pageNo: number; pageSize: number };
  Agents: { id: string; label: string }[];
  Routes: { id: string; label: string }[];
  filterPayload?: any;
  setSearchValue?: any;
  filterClear?: any;
}

interface Select {
  id: string;
  label: string;
}

interface UpdatePayload {
  agentName: string;
  guestName: string;
  adultCount: number;
  childCount: number;
  refNumber: string;
  vehicleNumber?: string;
  source: string | null;
  startLat: number | null;
  startLng: number | null;
  tourName: string | null;
  time: string | null;
  driverName: string;
  passengerCount: number;
  driverNumber: number;
}

const UpdateGeneratedTrip = ({
  isOpen,
  setIsOpen,
  selectedRow,
  selectedTripRow,
  excelPayload,
  setSelectedTripRow,
  pageDetail,
  autoplannerID,
  tripMode,
  setTripMode,
  setPageSize,
  filterPayload,
  Agents,
  Routes,
  setSearchValue,
  filterClear
}: Props) => {
  const [sourceAddress, setSourceAddress] = useState<any>(null);
  const [destinationAddress, setDestinationAddress] = useState<any>(null);
  const [tripType, setTripType] = useState<any>(null);
  const [startDate, setStartDate] = useState();
  const [tripMarker, setTripMarker] = useState<any>([]);
  const [destinationMarker, setDestinationMarker] = useState<any>([]);
  const [external, setExternal] = useState<boolean>(true);
  const [isDrag, setIsDrag] = useState<boolean>(false);
  const [seatCapacity, setSeatCapacity] = useState<any>(0);

  const dispatch = useAppDispatch();
  const createAbort = useAbort();

  const addData = useAppSelector(state => state.AutoPlannerAddTrip);
  const updateData = useAppSelector(state => state.AutoPlannerUpdateTrip);
  const driverName = useAppSelector(state => state.externalvalidation.data);
  const { data: dropDownData, isLoading: dropdownLoading } = useAppSelector(
    state => state.getStandardVehicles
  );
  const contactError = useAppSelector(state => state.ContactNumberValidation);
  const { isLoading: updateLoading } = useAppSelector(state => state.sicBookingsUpdate);
  const { data } = useAppSelector(state => state.auth);
  const AgentsDropdown = useAppSelector(state => state.autoPlannerAgent.data || []);
  const [validationErrors, setValidationErrorsMake] = useState<any>(null);

  let role = data?.role;

  const epocvalue: number = convertDateTimetoEpoch(
    selectedRow?.startTimestamp ? selectedRow?.startTimestamp : ''
  );

  const formatDate = (date: string | null) => {
    return date ? dayjs(date).format('DD/MM/YYYY') : '';
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const schema = () =>
    yup.object().shape({
      agentName: yup
        .string()
        .required('Select Agent Name')
        .matches(/^[a-zA-Z0-9\s.-]*$/, 'Agent Name Can Only Contain Letters and Numbers'),
      guestName: yup.string().required('Enter Guest Name'),
      phone: yup
        .string()
        .optional()
        .test('basic-contact', 'Invalid contact number', value => {
          if (!value) return true;
          const phoneRegex = /^\+?[0-9]{1,4}[- ]?[0-9]{7,15}$/;
          return phoneRegex.test(value);
        })
        .test('phone-error', 'Invalid contact number', function (value: any, field: any) {
          if (
            validationErrors?.phone &&
            value &&
            validationErrors?.phone !== 'No Error'
          ) {
            return this.createError({ message: validationErrors?.phone });
          } else {
            return true;
          }
        }),
      adultCount: yup
        .number()
        .required('Enter Adult Count')
        .min(1, 'Adult Count Must be Atleast 1')
        .max(50, 'Adult Count Must Not Exceed 50')
        .typeError('Enter Adult Count'),
      childCount: yup
        .number()
        .notRequired()
        .min(0, 'Child Count Cannot be Below 0')
        .max(50, 'Child Count Must Not Exceed 50')
        .typeError('Child Count Cannot be Below 0'),
      refNumber: yup.string().notRequired(),
      vehicle: yup.string().oneOf(['internal', 'external']).notRequired(),
      vehicleNumber: yup.string().when('vehicle', {
        is: 'internal',
        then: () => yup.string().required('Select vehicle number'),
        otherwise: () =>
          yup
            .string()
            .required('Enter vehicle number')
            .matches(/^[A-Za-z0-9]*$/, 'Only letters and numbers allowed without spaces')
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
      driverName: yup.string().when('vehicle', {
        is: 'external',
        then: () => yup.string().required('Enter Driver Name'),
        otherwise: () => yup.string().notRequired()
      }),
      passengerCount: yup.string().when('vehicle', {
        is: 'external',
        then: () =>
          yup
            .number()
            .required('Enter Seat Capacity')
            .min(
              selectedTripRow?.adultCount || selectedTripRow?.childCount
                ? selectedTripRow?.adultCount + selectedTripRow?.childCount
                : 1,
              `Seat Capacity Must be Minimum ${
                selectedTripRow?.adultCount + selectedTripRow?.childCount
              }`
            )
            .max(250, 'Seat Capacity must be less than or equal to 250')
            .typeError('Enter Seat Capacity'),
        // .typeError(
        //   `Seat Capacity Must be Minimum ${
        //     selectedTripRow?.adultCount + selectedTripRow?.childCount
        //   }`
        // ),
        otherwise: () => yup.string().notRequired()
      }),
      driverNumber: yup.string().when('vehicle', {
        is: 'external',
        then: () =>
          yup
            .string()
            .required('Enter Contact Number')
            .test('basic-contact', 'Invalid contact number', value => {
              if (!value) return true;
              const phoneRegex = /^\+?[0-9]{1,4}[- ]?[0-9]{7,15}$/;
              return phoneRegex.test(value);
            })
            .test('phone-error', 'Invalid contact number', function (value: any) {
              if (
                validationErrors?.driverNumber &&
                value &&
                validationErrors?.driverNumber !== 'No Error'
              ) {
                return this.createError({ message: validationErrors?.driverNumber });
              } else {
                return true;
              }
            }),
        otherwise: () => yup.string().notRequired()
      }),
      sourceAddress: yup.object().shape({
        source: yup.string().required('Enter Pickup Location'),
        startLat: yup.number().required('Enter Latitude for Pickup Location'),
        startLng: yup.number().required('Enter Longitude for Pickup Location')
      }),
      tourName: yup.string().required('Select Tour Name'),
      time: yup.object().required('Select Time')
    });

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    getValues,
    trigger,
    reset,
    formState: { errors }
  } = useForm<any>({
    resolver: yupResolver(schema())
  });

  const agentNames =
    AgentsDropdown?.map((value: string) => ({
      id: value,
      label: capitalizeFirstLetter(value)
    })) || [];

  const standardVehicles =
    dropDownData?.length > 0
      ? dropDownData?.map((value: string, index: number) => ({
          id: value,
          label: value.toUpperCase()
        }))
      : [];
  // const vehicleNumber = selectedTripRow?.vehicleNumber;

  // if (!standardVehicles?.some((vehicle: any) => vehicle?.id === vehicleNumber)) {
  //   standardVehicles.push({
  //     id: vehicleNumber,
  //     label: vehicleNumber?.toUpperCase()
  //   });
  // }

  const address = async (lat: any, lng: any) => {
    let fAdd = findAddress(lat, lng);
    return fAdd;
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedTripRow(null);
    reset();
    dispatch(clearDriverName());
  };

  const onSubmit = async (params: any) => {
    let payload: any = {
      id: selectedTripRow.id,
      agentName: params.agentName,
      guestName: params.guestName,
      source: params.sourceAddress.source,
      startLat: params.sourceAddress.startLat,
      startLng: params.sourceAddress.startLng,
      destination: selectedTripRow.destination,
      endLat: selectedTripRow.endLat,
      returnTime: selectedTripRow?.pickupWindow
        ? selectedTripRow.returnTime
        : formatISTtoTime(params.time),
      endLng: selectedTripRow.endLng,
      time: formatISTtoTime(params.time),
      childCount: params.childCount,
      ...(selectedTripRow?.pickupWindow
        ? { pickupWindow: getTimeRange(formatISTtoTime(params.time)) }
        : {}),
      adultCount: params.adultCount,
      refNumber: params.refNumber,
      vehicleNumber: params.vehicleNumber,
      driverName: params.driverName ? params.driverName : selectedTripRow?.driverName,
      isExternalVehicle: external ? 0 : 1,
      modifyVehicleDriver: 0,
      driverId: selectedTripRow?.driverId,
      ...(params.phone &&
        params.phone.includes('-') &&
        params.phone.split('-')[1] && { guestContactNumber: params.phone }),
      driverContactNumber: '9822681878',
      externalVehicleView: external
        ? null
        : {
            vehicleNumber: params.vehicleNumber,
            driverName: params.driverName,
            mobileNumber: params.driverNumber,
            driverID: `${params?.driverName}${params?.driverNumber}`,
            isExternalVehicle: 1,
            seatingCapacity: params.passengerCount,
            isActive: selectedTripRow?.externalVehicleView?.isActive
          },
      transferInstance: selectedTripRow.transferInstance,
      isReturnTrip: selectedTripRow.isReturnTrip,
      tourName: selectedTripRow.tourName,
      journeyId: selectedTripRow.journeyId || selectedTripRow.journeyID,
      mainHotelResponses: selectedTripRow.mainHotelResponses
    };

    const pageDetails = {
      // ...filterPayload,
      autoplannerID: autoplannerID,
      tripMode: tripMode,
      id: selectedRow?.id,
      PageNo: pageDetail.pageNo,
      PageSize: pageDetail.pageSize
    };
    const data = { payload, pageDetails };
    const paramss = { ...pageDetails };
    const action = await dispatch(sicBookingsUpdate(data as any));
    if (action.type === sicBookingsUpdate.fulfilled.type) {
      handleClose();
      setSearchValue('search', '');
      dispatch(clearDriverName());
      filterClear();
      setPageSize(20);
      if (excelPayload) {
        dispatch(getExcelAction(excelPayload));
      }
    }
    if (action.type === sicBookingsUpdate.fulfilled.type) {
      handleClose();
      setSearchValue('search', '');
      filterClear();
      setSelectedTripRow(null);
      if (selectedTripRow?.time && !excelPayload) {
        await dispatch(switchTripsAction(paramss));
      } else if (!excelPayload) {
        await dispatch(
          scheduleTripsAction({
            date: data.pageDetails.autoplannerID,
            mode: data.pageDetails.tripMode,
            id: data.pageDetails.id
          } as any)
        );
      }
    }
  };

  const handleMarkerDrag = async (e: any, marker: any) => {
    if (marker === 'source') {
      const newAddress = await address(e?.latLng?.lat(), e?.latLng?.lng());
      setSourceAddress({
        geometry: {
          location: {
            lat: () => {
              return e?.latLng?.lat();
            },
            lng: () => {
              return e?.latLng?.lng();
            }
          }
        },
        formatted_address: newAddress
      });
    } else if (marker === 'destination') {
      const newAddress = await address(e?.latLng?.lat(), e?.latLng?.lng());
      setDestinationAddress({
        geometry: {
          location: {
            lat: () => {
              return e?.latLng?.lat();
            },
            lng: () => {
              return e?.latLng?.lng();
            }
          }
        },
        formatted_address: newAddress
      });
    }
  };

  const handleValidate = useCallback(
    debounce(async (event: any, field: any) => {
      setValue('driverName', '');
      const payload = {
        mobileNumber: event,
        autoplannerId: autoplannerID
      };
      let action1: any = await dispatch(externalvehicleAction(payload));

      setValidationErrorsMake((prev: any) => ({
        ...prev,
        [field]:
          action1?.payload?.status !== 200 && action1?.payload?.status != 'Success'
            ? action1?.payload?.response?.data?.message
            : 'no-error'
      }));

      if (action1.type === externalvehicleAction.fulfilled.type) {
        if (action1.payload.data) setValue('driverName', action1.payload.data);
      }
    }),
    [autoplannerID]
  );

  useEffect(() => {
    return () => {
      dispatch(clearContactError());
    };
  }, []);

  useEffect(() => {
    if (validationErrors?.phone) {
      trigger('phone');
    }
    if (validationErrors?.driverNumber) {
      trigger('driverNumber');
    }
  }, [validationErrors]);

  useEffect(() => {
    const signal = createAbort().abortCall.signal;
    dispatch(autoPlannerAgentAction(signal));
  }, []);

  useEffect(() => {
    if (selectedTripRow) {
      if (selectedTripRow?.time && selectedTripRow?.time !== '') {
        const time = selectedTripRow?.time !== null ? selectedTripRow?.time : '00:00';
        setValue(
          'time',
          dayjs()
            .set('hour', time?.split(':')[0])
            .set('minute', time.split('-')[0].split(':')[1])
        );
      } else if (selectedTripRow?.returnTime) {
        const time = selectedTripRow?.time !== null ? selectedTripRow?.time : '00:00';
        setValue(
          'time',
          dayjs().set('hour', time?.split(':')[0]).set('minute', time?.split(':')[1])
        );
      }
      setValue('agentName', selectedTripRow?.agentName);
      setValue('sourceAddress', selectedTripRow?.source);
      setValue('guestName', selectedTripRow?.guestName);
      setValue('adultCount', selectedTripRow?.adultCount);
      setValue('childCount', selectedTripRow?.childCount);
      setValue('refNumber', selectedTripRow?.refNumber);
      setValue('vehicleNumber', selectedTripRow?.vehicleNumber);
      setValue('driverName', selectedTripRow?.driverName);
      setValue('passengerCount', selectedTripRow?.seatingCapacity);
      setValue('driverNumber', selectedTripRow?.driverContactNumber);
      setValue(
        'vehicle',
        selectedTripRow?.isExternalVehicle === 1 ? 'external' : 'internal'
      );
      if (selectedTripRow?.isExternalVehicle === 1) {
        setExternal(false);
      }
      setValue('tourName', selectedTripRow?.tourName);
      setTripMarker([
        {
          id: 'source',
          lat: selectedTripRow?.startLat,
          lng: selectedTripRow?.startLng,
          name: 'trip',
          info: { Mylocation: 'source' }
        }
      ]);
      setSourceAddress({
        geometry: {
          location: {
            lat: () => {
              return selectedTripRow?.startLat;
            },
            lng: () => {
              return selectedTripRow?.startLng;
            }
          }
        },
        formatted_address: selectedTripRow?.source
      });
      // setStartDate(
      //   selectedTripRow?.startTimestamp &&
      //     dayjs.unix(convertDateTimetoEpoch(selectedTripRow?.startTimestamp) / 1000)
      // );
    }
  }, [selectedTripRow]);

  useEffect(() => {
    setValue('sourceAddress', {
      source: sourceAddress?.formatted_address,
      startLat: sourceAddress?.geometry?.location?.lat(),
      startLng: sourceAddress?.geometry?.location?.lng()
    });

    clearErrors('sourceAddress');
    const prevMarkers = tripMarker;
    if (prevMarkers?.length <= 1 && sourceAddress) {
      setTripMarker([
        {
          id: 'source',
          lat: sourceAddress?.geometry?.location?.lat(),
          lng: sourceAddress?.geometry?.location?.lng(),
          name: 'trip',
          info: { Mylocation: 'source' }
        }
      ]);
    } else if (sourceAddress) {
      setTripMarker((prev: any) => {
        let updatedMarkers = prev?.map((marker: any) =>
          marker?.id === 'source'
            ? {
                ...marker,
                lat: sourceAddress?.geometry?.location?.lat(),
                lng: sourceAddress?.geometry?.location?.lng()
              }
            : marker
        );
        return updatedMarkers;
      });
    }
  }, [sourceAddress]);

  useEffect(() => {
    if (tripMarker[0]?.lat && tripMarker[0]?.lng) {
      dispatch(updateCenter(tripMarker));
      dispatch(updateZoom(tripMarker));
    }
  }, [tripMarker]);

  useEffect(() => {
    if (data?.userId && data?.role === 'ROLE_AGENT') setValue('agentName', data?.userId);
  }, [data]);

  useEffect(() => {
    const payload = {
      autoplannerID: autoplannerID,
      tripMode: tripMode,
      tourName: selectedRow?.tourName ? selectedRow?.tourName : selectedTripRow?.tourName,
      totalPassengers: selectedRow?.netCount
        ? selectedRow?.netCount
        : selectedTripRow?.totalCount,
      vehicleNumber: selectedRow?.vehicleNumber
        ? selectedRow?.vehicleNumber
        : selectedTripRow?.vehicleNumber,
      journeyId: selectedTripRow?.journeyId
    };
    dispatch(getStandardVehicles(payload));
  }, []);

  return (
    <Box className='add-trip-component'>
      <Dialog
        open={isOpen}
        fullScreen
        sx={{ padding: 3, zIndex: 1, position: 'absolute' }}
        className='add-trip-dialog animate__animated animate__zoomIn'
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
                  height: '87vh',
                  overflow: { xs: 'scroll', md: 'hidden' },
                  borderRadius: '10px'
                }}
              >
                <GoogleMap>
                  <GoogleTripDirections
                    locations={tripMarker}
                    isDraggable={false}
                    setTripMarker={setTripMarker}
                    handleMarker={handleMarkerDrag}
                    showPath={true}
                  />
                </GoogleMap>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sm={4} lg={3} className='add-trip-grid-item'>
              <Box className='add-trip-header'>
                <Typography className='add-booking-title'>
                  {'Update Scheduled Booking'}
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
                  maxHeight: '82vh',
                  overflowY: 'auto',
                  paddingRight: '15px'
                }}
                onSubmit={handleSubmit(onSubmit)}
              >
                <CustomSelect
                  id='agent-name'
                  control={control}
                  name='agentName'
                  label='Agent Name'
                  placeholder='Select Agent Name'
                  options={agentNames}
                  isDisabled={
                    data?.role !== 'ROLE_OPERATOR' &&
                    data?.role !== 'ROLE_AUTOPLANNER_ADMIN'
                  }
                />
                <CustomTextField
                  id='guest-name'
                  control={control}
                  name='guestName'
                  label='Guest Name'
                  placeholder='Enter Guest Name'
                />
                <Controller
                  name='phone'
                  control={control}
                  defaultValue={selectedTripRow?.guestContactNumber || ''}
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
                            handleValidate(e, field?.name);
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
                      name='adultCount'
                      label='Adult Count'
                      placeholder='Enter Count'
                      isDecimal={true}
                    />
                  </Grid>
                  <Grid item sm={6} className='child-count-field'>
                    <CustomTextField
                      id='child-count'
                      control={control}
                      isDecimal={true}
                      type='number'
                      name='childCount'
                      label='Child Count'
                      placeholder='Enter Count'
                      isOptional={true}
                      defaultValue='0'
                      onChangeCallback={(e: any) => {
                        const value = e?.target?.value;
                        if (value && value < 0) {
                          setValue('childCount', 0);
                        } else {
                          setValue('childCount', value || 0);
                        }
                      }}
                    />
                  </Grid>
                </Grid>
                <CustomTextField
                  id='reference-no'
                  control={control}
                  name='refNumber'
                  label='Reference No.'
                  placeholder='Enter Reference No.'
                  isOptional={true}
                />
                <CustomRadioButton
                  name='vehicle'
                  control={control}
                  radiobutton1='Internal Vehicle'
                  radiobutton2='External Vehicle'
                  value={getValues('vehicle')}
                  value1='internal'
                  value2='external'
                  onChangeCallback={(e: any) => {
                    setValue('vehicle', e.target.value);

                    clearErrors('vehicleNumber');
                    if (e.target.value === 'internal') {
                      setExternal(true);
                      setIsDrag(false);
                      // setValue('vehicleNumber', selectedTripRow?.vehicleNumber);
                      setValue('vehicleNumber', '');
                      setValue('driverName', '');
                      setValue('passengerCount', '');
                      setValue('driverNumber', '');
                    } else {
                      setExternal(false);
                      setValidationErrorsMake((prev: any) => ({
                        ...prev,
                        driverNumber: null
                      }));
                      clearErrors('driverNumber');
                      setIsDrag(true);
                      // setValue('vehicleNumber', selectedTripRow?.vehicleNumber);
                      // setValue('driverName', selectedTripRow?.driverName);
                      // setValue('passengerCount', selectedTripRow?.seatingCapacity);
                      // setValue('driverNumber', selectedTripRow?.driverContactNumber);
                      setValue('vehicleNumber', '');
                      setValue('driverName', '');
                      setValue('passengerCount', '');
                      setValue('driverNumber', '');
                    }
                  }}
                />
                {external ? (
                  <CustomSelect
                    id='vehicleNumber'
                    control={control}
                    name='vehicleNumber'
                    label=' Vehicle Number'
                    placeholder='Select vehicle number'
                    options={standardVehicles}
                  />
                ) : (
                  <>
                    <Box>
                      <Box sx={{ marginBottom: '10px' }}>
                        <CustomTextField
                          id='vehicleNumber'
                          control={control}
                          name='vehicleNumber'
                          label='Vehicle Number'
                          placeholder='Enter vehicle number'
                          onChangeCallback={e => {
                            setValue('vehicleNumber', e);
                          }}
                        />
                      </Box>

                      <Box sx={{ marginBottom: '10px' }}>
                        <CustomTextField
                          id='count'
                          control={control}
                          type='number'
                          name='passengerCount'
                          label='Seat Capacity'
                          placeholder='Count'
                          onChangeCallback={e => {
                            setSeatCapacity(e);
                            setValue('passengerCount', e);
                            clearErrors('passengerCount');
                          }}
                        />
                      </Box>
                      <Box sx={{ marginBottom: '10px' }}>
                        <Controller
                          name='driverNumber'
                          control={control}
                          defaultValue={selectedTripRow?.driverNumber || '+65'}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <PhoneNoTextField
                              {...field}
                              setValue={setValue}
                              country={'sg'}
                              disableCountry={true}
                              style='share'
                              label='Contact Number'
                              error={errors?.driverNumber?.message ? true : false}
                              helperText={errors?.driverNumber?.message}
                              onChange={(e: any) => {
                                if (e) {
                                  const emptySpace = /^.+\s.+$/g;
                                  const isValid = isValidField('contactnumber', e);
                                  if (e && !emptySpace.test(e) && isValid) {
                                    handleValidate(e, field?.name);
                                  }
                                } else {
                                  setValue('driverNumber', '');
                                }
                                trigger('driverNumber');
                              }}
                            />
                          )}
                        />

                        {/* {errors.driverNumber && (
                          <Typography
                            sx={{
                              color: '#d32f2f',
                              display: 'flex',
                              justifyContent: 'flex-start',
                              fontSize: '12px',
                              fontWeight: 300
                            }}
                          >
                            {(errors as any).driverNumber.message}
                          </Typography>
                        )} */}
                      </Box>
                      <Box sx={{ marginBottom: '10px' }}>
                        <CustomTextField
                          id='driverName'
                          control={control}
                          name='driverName'
                          disabled={driverName ? true : false}
                          label='Driver Name'
                          placeholder='Enter driver name'
                          onChangeCallback={e => {
                            setValue('driverName', e);
                          }}
                        />
                      </Box>
                    </Box>
                  </>
                )}
                {/* <GoogleSearchBox
                  id='search-source'
                  name='sourceAddress'
                  control={control}
                  isDisable={true}
                  label='Pickup Location'
                  placeholder='Search Location..'
                  value={sourceAddress?.formatted_address}
                  setAddress={setSourceAddress}
                  country='sg'
                /> */}

                <CustomTextField
                  id='sourceAddresss'
                  control={control}
                  name='sourceAddresss'
                  label='Pickup Location'
                  defaultValue={selectedTripRow?.source}
                  value={selectedTripRow?.source}
                  placeholder='Select Pickup Location'
                  disabled={true}
                />
                <CustomTextField
                  id='tourName'
                  control={control}
                  name='tourName'
                  label=' Tour Name'
                  isOptional={true}
                  placeholder='Select Tour Name'
                  disabled={true}
                />
                <CustomTimePicker
                  id='time'
                  name='time'
                  isDisabled={true}
                  control={control}
                  label='Time'
                  values={getValues('time')}
                />
                <Box mt={3} mb={2} sx={{ textAlign: 'right' }}>
                  <CustomButton
                    category='Cancel'
                    className='cancel'
                    sx={{ marginRight: '10px' }}
                    onClick={() => handleClose()}
                  />
                  <CustomButton
                    category={'Save'}
                    loading={updateLoading}
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

export default UpdateGeneratedTrip;
