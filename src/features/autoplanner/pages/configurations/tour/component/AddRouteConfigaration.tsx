import {
  Box,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Switch,
  Typography,
  useMediaQuery
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import dayjs, { Dayjs } from 'dayjs';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import {
  findAddress,
  formatISTtoTime,
  useAbort
} from '../../../../../../utils/commonFunctions';
import CustomIconButton from '../../../../../../common/components/buttons/CustomIconButton';
import CustomTextField from '../../../../../../common/components/customized/customtextfield/CustomTextField';
import GoogleSearchBox from '../../../../../../common/components/maps/googlesearchbox/GoogleSearchBox';
import CustomTimePicker from '../../../../../../common/components/customized/customtimepicker/CustomTimePicker';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';
import './AddRouteConfigaration.scss';
import GoogleMap from '../../../../../../common/components/maps/googlemap/GoogleMap';
import GoogleTripDirections from '../../../../../../common/components/maps/googledirection/GoogleTripDirections';
// import {
//   updateCenter,
//   updateZoom
// } from '../../../../../app/redux/reducer/slices/mapSlice';
import { AddCircleOutline, Delete } from '@mui/icons-material';
import CustomSelect from '../../../../../../common/components/customized/customselect/CustomSelect';
import { Icon } from '@iconify/react';
import {
  routeConfigureAddAction,
  routeConfigureUpdateAction
} from '../../../../redux/reducer/autoPlannerSlices/autoplannerConfigurationSlice';
import {
  updateCenter,
  updateZoom
} from '../../../../../../common/redux/reducer/commonSlices/mapSlice';

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedRow: any;
  mode: string;
  setTourMode: any;
  pageDetails: { pageNo: number; pageSize: number; tourName: string };
}

const AddRouteConfiguration = ({
  isOpen,
  setIsOpen,
  selectedRow,
  setTourMode,
  pageDetails,
  mode
}: Props) => {
  const [destinationAddress, setDestinationAddress] = useState<any>([]);
  const [tripMarker, setTripMarker] = useState<any>([]);
  const [only, setOnly] = React.useState(false);
  const [aliases, setaliases] = useState<any>([]);
  const [tripMode, setTripMode] = useState<string>('');
  const [disposalTime, setdisposalTime] = useState<string>('');
  const [minPickTime, setMinPickTime] = useState<Dayjs | undefined>(undefined);
  const [maxPickTime, setMaxPickTime] = useState<Dayjs | undefined>(undefined);
  const [minDropTime, setMinDropTime] = useState<Dayjs | undefined>(undefined);
  const [tourType, setTourType] = useState<string>('TWO_WAY_TOUR');
  const [pickTime1, setPickTime1] = useState<any>();

  const dispatch = useAppDispatch();

  const createAbort = useAbort();
  const addRoute = useAppSelector(state => state.addRouteConfigure);
  const updateRoute = useAppSelector(state => state.updateRouteConfigure);

  const isMd = useMediaQuery('(max-width:600px)');
  const isLg = useMediaQuery('(min-width:950px)');

  //schema for validation
  const schema = yup.object({
    tourname: yup
      .string()
      .required('Enter tour name')
      .matches(/^[A-Za-z0-9-\s]+$/, 'Tour name must contain letters or numbers only')
      .test(
        'at-least-one-letter',
        'Tour name must contain at least one alphabet',
        value => /[A-Za-z]/.test(value || '')
      )
      .min(3, 'Tour name must contain at least 3 characters')
      .max(50, 'Tour name cannot exceed 50 characters'),
    picktime1: yup.date().when(['tourType', 'tripMode'], {
      is: (tourType: string, tripMode: string) => {
        return (
          (tourType === 'TWO_WAY_TOUR' && tripMode !== 'PVT' && tripMode !== 'GRP') ||
          (tripMode !== 'PVT' && tripMode !== 'GRP' && only)
        );
      },
      then: () =>
        yup
          .date()
          .required('Choose from time')
          .test('is-valid-time', 'Invalid time format', value => {
            return true || null;
          }),
      otherwise: () => yup.date().notRequired()
    }),
    bufferTime: yup.object().notRequired(),
    picktime2: yup.date().when(['tourType', 'tripMode'], {
      is: (tourType: string, tripMode: string) => {
        return (
          (tourType === 'TWO_WAY_TOUR' && tripMode !== 'PVT' && tripMode !== 'GRP') ||
          (tripMode !== 'PVT' && tripMode !== 'GRP' && only)
        );
      },
      then: () =>
        yup
          .date()
          .required('Choose to time')
          .test(
            'is-after-picktime1',
            'Pickup time  must be within 30 min',
            function (value) {
              const { picktime1 } = this.parent;
              if (!picktime1 || !value) {
                return true || null;
              }

              const pickTime1Date = new Date(picktime1);

              const pickTime2Date = new Date(value);
              pickTime2Date.setSeconds(0);
              const pickTime130: any = new Date(pickTime1Date.getTime());
              pickTime130.setMinutes(pickTime130.getMinutes() + 30);
              return pickTime2Date >= pickTime1Date && pickTime2Date <= pickTime130;
            }
          ),
      otherwise: () => yup.date().notRequired()
    }),
    returnTime: yup.date().when('tourType', {
      is: 'TWO_WAY_TOUR',
      then: () =>
        yup
          .date()
          .required('Choose return time')
          .test(
            'is-after-picktime2',
            'Return time to must be after pickup Time',
            function (value) {
              const { picktime2 } = this.parent;
              if (!picktime2 || !value) {
                return true || null;
              }
              return value >= picktime2;
            }
          ),
      otherwise: () => yup.date().notRequired()
    }),
    aliases: yup.array().of(
      yup.object().shape({
        aliases: yup.string().required('Enter aliases')
      })
    ),
    locations: yup.mixed().when('tourType', {
      is: 'DISPOSAL',
      then: () =>
        yup
          .array()
          .of(
            yup.object().shape({
              destination: yup.object().shape({
                destination: yup.string().notRequired(),
                endLat: yup.string().notRequired(),
                endLng: yup.string().notRequired()
              }),
              destinationAliases: yup.array().of(
                yup.object().shape({
                  destinationAlias: yup.string().optional()
                })
              )
            })
          )
          .optional(),
      otherwise: () => yup.array().notRequired()
    }),

    time: yup.date().when('tourType', {
      is: (value: any) => {
        return value === 'ROUND_TOUR' || value === 'DISPOSAL';
      },
      then: () => yup.date().required('Choose expected duration'),
      otherwise: () => yup.date().notRequired()
    }),
    tripMode: yup.string().required('Select tour Mode'),
    tourType: yup.string().required('Select tour type'),
    destinationAddress: yup.object().when('tourType', {
      is: (value: any) => {
        return value === 'TWO_WAY_TOUR';
      },
      then: () =>
        yup.object().shape({
          destination: yup.string().required('Enter location'),
          endLat: yup.number().required('Enter location'),
          endLng: yup.number().required('Enter location')
        }),
      otherwise: () =>
        yup.object().shape({
          destination: yup.string().notRequired(),
          endLat: yup.number().notRequired(),
          endLng: yup.number().notRequired()
        })
    })
  });

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    reset,
    getValues,
    trigger,
    register,
    resetField,
    formState: { errors }
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: {
      locations: [{ destinationAliases: [{ destinationAlias: '' }] }]
    }
  });

  const { fields, append, remove, update } = useFieldArray({ name: 'aliases', control });
  const address = async (lat: any, lng: any) => {
    let fAdd = findAddress(lat, lng);
    return fAdd;
  };

  const tourTypes = [
    { id: 'TWO_WAY_TOUR', label: 'Two Way Tour' },
    { id: 'DISPOSAL', label: 'Disposal' }
  ];

  const tripModes = [
    { id: 'SIC', label: 'SIC' },
    { id: 'TSIC', label: 'TSIC' }
  ];

  if (tourType === 'DISPOSAL' && only) {
    tripModes.push({ id: 'PVT', label: 'PVT' }, { id: 'GRP', label: 'GRP' });
  }

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  const onSubmit = async (params: any) => {
    const bufferTimeFormatted = params.bufferTime
      ? formatISTtoTime(params.bufferTime)
      : null;

    const payload: any = {
      tourName: params?.tourname,
      ...(tourType === 'TWO_WAY_TOUR' && {
        returnTime: formatISTtoTime(params?.returnTime)
      }),
      aliases: params.aliases.map((item: any) => item.aliases),
      mode: params?.tripMode,
      isRoundTour: only ? 1 : 0,
      bufferTime: params.bufferTime ? bufferTimeFormatted : null,
      tourType: params?.tourType,
      ...((tourType === 'TWO_WAY_TOUR' ||
        tourType === 'ONE_WAY_TOUR' ||
        tourType === 'DISPOSAL') &&
        params?.destinationAddress?.endLat &&
        params?.destinationAddress?.endLng &&
        params?.destinationAddress?.destination && {
          location: {
            lat: params.destinationAddress.endLat,
            lng: params.destinationAddress.endLng,
            locationAddress: params.destinationAddress.destination
          }
        }),
      ...((tourType === 'ROUND_TOUR' || tourType === 'DISPOSAL') && {
        estimatedDuration: formatISTtoTime(params?.time)
      }),
      ...(params.tourType === 'DISPOSAL' &&
        params.locations[0].destination.endLat !== undefined && {
          disposalDestinationDetails: params.locations.map((loc: any) => ({
            location: {
              lat: loc.destination.endLat,
              lng: loc.destination.endLng,
              locationAddress: loc.destination.destination
            },
            location_aliases: loc.destinationAliases
              ? loc.destinationAliases.map((alias: any) => alias.destinationAlias)
              : []
          }))
        }),
      pickupWindow: params?.picktime1
        ? {
            start: formatISTtoTime(params?.picktime1),
            end: formatISTtoTime(params?.picktime2)
          }
        : null
    };
    if (selectedRow?.id) {
      const param = {
        payload: {
          ...payload,
          id: selectedRow?.id,
          isActive: selectedRow?.isActive ? selectedRow?.isActive : 0
        },
        pageDetails: pageDetails,
        signal: createAbort().abortCall.signal
      };
      const actionUpdate = await dispatch(routeConfigureUpdateAction(param));
      if (actionUpdate.type === routeConfigureUpdateAction.fulfilled.type) {
        setTourMode(null, params.tourType === 'DISPOSAL' ? 1 : 0);
        handleClose();
      }
    } else {
      const param = {
        payload: payload,
        pageDetails: pageDetails,
        mode: mode !== 'Twoway',
        signal: createAbort().abortCall.signal
      };
      const actionAdd = await dispatch(routeConfigureAddAction(param));
      if (actionAdd.type === routeConfigureAddAction.fulfilled.type) {
        setTourMode(null, params.tourType === 'DISPOSAL' ? 1 : 0);
        handleClose();
      }
    }
  };
  // Function to handle marker update based on movement or selection
  const handleMarkerDrag = async (e: any, marker: any) => {
    if (marker === 'tour') {
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

  const handleMinTime = (event: string, type: string) => {
    const time = formatISTtoTime(event);
    if (type === 'pickup') {
      setMinPickTime(
        dayjs()
          .set('hour', parseFloat(time.split(':')[0]))
          .set('minute', parseFloat(time.split(':')[1]))
      );
      setMaxPickTime(
        dayjs()
          .set('hour', parseFloat(time.split(':')[0]))
          .set('minute', parseFloat(time.split(':')[1]) + 30)
      );
      setMinDropTime(
        dayjs()
          .set('hour', parseFloat(time.split(':')[0]))
          .set('minute', parseFloat(time.split(':')[1]))
      );
    } else if (type === 'drop')
      setMinDropTime(
        dayjs()
          .set('hour', parseFloat(time.split(':')[0]))
          .set('minute', parseFloat(time.split(':')[1]))
      );
  };

  //funtion for update to get value from selected row
  useEffect(() => {
    if (selectedRow?.id) {
      setValue('tourname', selectedRow?.tourName);
      setValue('tripMode', selectedRow?.mode);
      const bufferTime =
        selectedRow?.bufferTime !== null ? selectedRow?.bufferTime : '00:00';
      setValue(
        'bufferTime',
        dayjs()
          .set('hour', bufferTime.split(':')[0])
          .set('minute', bufferTime.split(':')[1])
      );
      setTripMode(selectedRow?.mode);
      setOnly(selectedRow.isRoundTour);
      const startTime = selectedRow?.pickupTimeWindows?.start;
      const endTime = selectedRow?.pickupTimeWindows?.end;
      const dropTime = selectedRow?.duration !== null ? selectedRow?.duration : '00:00';
      const returnTime =
        selectedRow?.returnTime !== null ? selectedRow?.returnTime : '00:00';
      setTourType(selectedRow.tourType);
      if (startTime) {
        setValue(
          'picktime1',
          dayjs()
            .set('hour', startTime.split(':')[0])
            .set('minute', startTime.split(':')[1])
        );
        setPickTime1(
          dayjs()
            .set('hour', startTime?.split(':')[0])
            .set('minute', startTime?.split(':')[1])
            .toDate()
        );
      }
      if (endTime)
        setValue(
          'picktime2',
          dayjs().set('hour', endTime.split(':')[0]).set('minute', endTime.split(':')[1])
        );
      if (dropTime)
        setValue(
          'time',
          dayjs()
            .set('hour', dropTime.split(':')[0])
            .set('minute', dropTime.split(':')[1])
        );
      if (returnTime)
        setValue(
          'returnTime',
          dayjs()
            .set('hour', returnTime.split(':')[0])
            .set('minute', returnTime.split(':')[1])
        );
      setaliases(
        selectedRow?.aliases?.map((item: any, index: number) => ({
          ...item,
          aliases: item
        }))
      );
      setValue('tourType', selectedRow.tourType);
      if (selectedRow?.locations !== null) {
        setDestinationAddress({
          geometry: {
            location: {
              lat: () => selectedRow?.locations.lat,
              lng: () => selectedRow?.locations.lng
            }
          },
          formatted_address: selectedRow?.locations.locationAddress
        });
        setValue('destinationAddress', {
          destination: selectedRow?.locations.locationAddress,
          endLat: selectedRow?.locations?.lat,
          endLng: selectedRow?.locations?.lng
        });
      }
    }
  }, [selectedRow]);

  //funtion for mark drop location on map when we type address manually
  useEffect(() => {
    setValue('destinationAddress', {
      destination: destinationAddress?.formatted_address,
      endLat: destinationAddress?.geometry?.location?.lat(),
      endLng: destinationAddress?.geometry?.location?.lng()
    });
    clearErrors('destinationAddress');
    let destinationMarker = {
      id: 'tour',
      lat: destinationAddress?.geometry?.location?.lat(),
      lng: destinationAddress?.geometry?.location?.lng(),
      name: 'trip',
      info: { Mylocation: 'Tour Location' }
    };
    setTripMarker([destinationMarker]);
  }, [destinationAddress]);

  useEffect(() => {
    if (tripMarker[0]?.lat && tripMarker[0]?.lng) {
      dispatch(updateCenter(tripMarker));
      dispatch(updateZoom(tripMarker));
    }
  }, [tripMarker]);

  useEffect(() => {
    if (aliases.length > 0) {
      aliases.map((item: any, index: number) => {
        update(index, { aliases: item.aliases });
      });
    }
  }, [aliases]);

  useEffect(() => {
    let destinationMarker = {
      id: 'tour',
      lat: destinationAddress?.geometry?.location?.lat(),
      lng: destinationAddress?.geometry?.location?.lng(),
      name: 'trip',
      info: { Mylocation: 'Tour Location' }
    };
    if (tourType === 'ROUND_TOUR') setTripMarker([]);
    else setTripMarker([destinationMarker]);
  }, [tourType]);

  useEffect(() => {
    if (getValues('picktime1')) {
      const initialPickTime: any = getValues('picktime1');
      handleMinTime(initialPickTime, 'pickup');
    }
  }, [getValues('picktime1')]);

  useEffect(() => {
    setValue('tourType', mode);
    setTourType(mode);
  }, [mode]);

  const {
    fields: locationFields,
    append: addLocation,
    update: updateLocation,
    remove: removeLocation
  } = useFieldArray<any>({
    control,
    name: 'locations'
  });

  const handleAddAlias = (locIndex: number) => {
    const aliases = getValues(`locations.${locIndex}.destinationAliases`) || [];

    updateLocation(locIndex, {
      ...locationFields[locIndex],

      destinationAliases: [...aliases, { destinationAlias: '' }]
    });
  };

  const handleRemoveAlias = (locIndex: number, aliasIndex: number) => {
    const aliases = getValues(`locations.${locIndex}.destinationAliases`) || [];

    if (aliases.length > 1) {
      aliases.splice(aliasIndex, 1);
      setValue(`locations.${locIndex}.locationAliases`, aliases);
      trigger(`locations.${locIndex}.locationAliases`);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const timestamp = new Date(disposalTime);

    const hours = timestamp.getHours();
    const isChecked = event.target.checked;
    setOnly(isChecked);
    if (!isChecked) setValue('time', undefined);
    if (isChecked && tourType === 'DISPOSAL') {
      setValue('tourname', '');
    } else {
      setValue('tourname', `DISPOSAL ${hours ? hours : 0} HRS`);
    }
  };

  // useEffect(() => {
  //   if (locationFields.length === 0) {
  //     addLocation({ destinationAddress: '', locationAliases: [''] });
  //   }
  // }, [locationFields, addLocation]);

  const initializeFormValues = (destinations: any[]) => {
    if (destinations && destinations.length) {
      const formattedLocations = destinations.map((destination: any) => ({
        destination: {
          endLat: destination.location.lat,
          endLng: destination.location.lng,
          destination: destination.location.locationAddress
        },
        destinationAliases: destination.location_aliases.map((alias: any) => ({
          destinationAlias: alias
        }))
      }));

      setValue('locations', formattedLocations);
    }
  };

  useEffect(() => {
    if (selectedRow?.destinationDetailsWrapper?.destinations) {
      initializeFormValues(selectedRow.destinationDetailsWrapper.destinations);
    }
  }, [selectedRow]);

  useEffect(() => {
    const timestamp = new Date(disposalTime);

    const hours = timestamp.getHours();

    if (!only && tourType === 'DISPOSAL') {
      setValue('tourname', `DISPOSAL ${hours ? hours : 0} HRS`);
    } else if (selectedRow?.tourName) {
      setValue('tourname', selectedRow.tourName);
    } else if (!only) {
      setValue('tourname', '');
    }
  }, [disposalTime, tourType, selectedRow]);

  return (
    <Box>
      <Dialog
        open={isOpen}
        fullScreen
        sx={{ padding: 3, zIndex: 0, position: 'absolute' }}
        className='add-route-dialog'
      >
        <DialogContent
          sx={{ overflow: 'hidden', padding: 0 }}
          className='add-route-dialog-content'
        >
          <Grid
            container
            sx={{
              flexDirection: { xs: 'column-reverse', md: 'row', sm: 'row' }
              // overflowY: 'scroll',
              // maxHeight:'89vh'
            }}
          >
            <Grid
              // item
              // sx={{
              //   overflow: 'hidden',
              //   display: isMd ? 'none' : 'block',
              //   width: isMd ? '0px' : isLg ? '75%' : '50% !important'
              // }}
              item
              xs={12}
              md={8}
              sm={8}
              lg={9}
              sx={{ overflow: 'hidden' }}
              p={2}
            >
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
                  />
                </GoogleMap>
              </Box>
            </Grid>
            <Grid
              item
              sx={{ width: isMd ? '100%' : isLg ? '25%' : '50%' }}
              className='add-route-grid-item'
            >
              <Box className='add-route-header'>
                <Typography
                  className='add-route-tittle'
                  sx={{ marginLeft: isMd ? '10px' : 0 }}
                >
                  {selectedRow?.id ? 'Update' : 'Add New'} Tour
                </Typography>
                <Box
                  className='closeIcon icon-position d-flex close-icon-index'
                  onClick={handleClose}
                  aria-label='Close'
                >
                  <CustomIconButton category='CloseValue' />
                </Box>
              </Box>
              <Box
                className='add-route-form'
                component='form'
                onSubmit={handleSubmit(onSubmit)}
                px={1}
                mt={1}
                sx={{
                  height: 'fit-content',
                  maxHeight: { xs: '62vh', sm: '79vh', md: '79vh', lg: '79vh' },
                  overflowY: 'scroll',
                  paddingRight: '15px'
                }}
              >
                <Box mt={2}>
                  <CustomTextField
                    id='tour-name'
                    control={control}
                    disabled={tourType === 'DISPOSAL' && !only ? true : false}
                    name='tourname'
                    label='Tour Name'
                    placeholder='Tour name'
                  />
                  {fields?.map((field, index) => (
                    <Grid
                      container
                      key={field.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-end'
                      }}
                    >
                      <Grid item xs={11}>
                        <CustomTextField
                          key={field.id}
                          id={`aliases${index + 1}`}
                          name={`aliases.${index}.aliases`}
                          control={control}
                          label={`Aliases ${index + 1}`}
                          placeholder={`aliases ${index + 1}`}
                          value={getValues(`aliases.${index}.aliases`)}
                        />
                      </Grid>
                      <Grid item xs={1} pb={1.5}>
                        <IconButton
                          onClick={() => {
                            remove(index);
                          }}
                        >
                          <Icon icon='mdi:delete' style={{ color: '#ff4343' }} />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                  {only || tourType === 'TWO_WAY_TOUR' ? (
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <CustomButton
                          className='custom-button-another'
                          category='Add aliases'
                          variant='outlined'
                          fullWidth
                          disabled={fields?.length >= 6}
                          startIcon={<AddCircleOutline />}
                          onClick={() => {
                            append({});
                          }}
                        />
                      </Grid>
                    </Grid>
                  ) : (
                    ''
                  )}
                  <Box my={2} />
                  <CustomSelect
                    id='tourType'
                    control={control}
                    name='tourType'
                    label='Tour Type'
                    placeholder='Select Tour Type'
                    isDisabled={selectedRow?.id}
                    options={tourTypes}
                    defaultValue={mode}
                    onChanges={(e: any, newValue: any) => {
                      setTourType(newValue?.id);
                    }}
                  />
                  {tourType === 'DISPOSAL' ? (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: '10px',
                        marginRight: '20px',
                        marginBottom: '10px'
                      }}
                    >
                      <Switch
                        checked={only}
                        onChange={handleChange}
                        inputProps={{ 'aria-label': 'controlled' }}
                      />
                      <Typography className='roundText'>is Round Tour</Typography>
                    </Box>
                  ) : (
                    ''
                  )}
                  <CustomSelect
                    id='trip-mode'
                    options={tripModes}
                    control={control}
                    name='tripMode'
                    label='Tour Mode'
                    placeholder='Tour mode'
                    onChanges={(e: any, newValue: any) => setTripMode(newValue?.id)}
                  />
                  {tripMode !== 'PVT' &&
                  tripMode !== 'GRP' &&
                  ((tourType === 'DISPOSAL' && only) || tourType === 'TWO_WAY_TOUR') ? (
                    <Box className='pickup-windows'>
                      <Typography className='pickup-title'>Pickup Windows</Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={12} md={6}>
                          <CustomTimePicker
                            id='time1'
                            name='picktime1'
                            control={control}
                            values={getValues('picktime1')}
                            isOptional={tourType === 'DISPOSAL' && !only ? true : false}
                            label='From'
                            setDefaultToTime={true}
                            onTimeChange={(event: any) => {
                              if (event !== null && event.$d) {
                                handleMinTime(event.$d, 'pickup');
                                const date = new Date(event.$d);
                                const hr = date.getHours();
                                const min = date.getMinutes();
                                // setValue(
                                //   'picktime2',
                                //   dayjs().set('hour', hr).set('minute', min)
                                // );
                                // setValue(
                                //   'returnTime',
                                //   dayjs().set('hour', hr).set('minute', min)
                                // );
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <CustomTimePicker
                            id='time2'
                            name='picktime2'
                            values={getValues('picktime2')}
                            control={control}
                            label='To'
                            // minTime={minPickTime}
                            isOptional={tourType === 'DISPOSAL' && !only ? true : false}
                            // maxTime={maxPickTime}
                            setDefaultToTime={true}
                            onTimeChange={(event: any) => {
                              if (event !== null && event.$d) {
                                handleMinTime(event.$d, 'drop');
                                const date = new Date(event.$d);
                                const hr = date.getHours();
                                const min = date.getMinutes();
                                // setValue(
                                //   'returnTime',
                                //   dayjs().set('hour', hr).set('minute', min)
                                // );
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    ''
                  )}
                  {tourType === 'ROUND_TOUR' || tourType === 'DISPOSAL' ? (
                    <Box sx={{ marginTop: '10px', width: '100%' }}>
                      <CustomTimePicker
                        id='time3'
                        name='time'
                        control={control}
                        values={getValues('time')}
                        label='Expected Duration'
                        views={only ? ['hours', 'minutes'] : ['hours']}
                        format='HH:mm'
                        isClock={false}
                        onTimeChange={(event: any) => {
                          if (event !== null && event.$d) {
                            setdisposalTime(event.$d);
                          } else {
                            setValue('tourname', selectedRow?.tourName);
                          }
                        }}
                      />
                    </Box>
                  ) : (
                    ''
                  )}
                  {tourType === 'TWO_WAY_TOUR' && (
                    <Grid sx={{ marginTop: '10px', width: '100%' }}>
                      <CustomTimePicker
                        id='returnTime'
                        name='returnTime'
                        values={getValues('returnTime')}
                        control={control}
                        // minTime={minDropTime}
                        label='Return Time'
                      />
                    </Grid>
                  )}
                  {tourType === 'TWO_WAY_TOUR' ? (
                    <Box sx={{ marginTop: '10px' }}>
                      <GoogleSearchBox
                        id='destinationAddress'
                        name='destinationAddress'
                        control={control}
                        label='Location'
                        placeholder='Search Location...'
                        setAddress={setDestinationAddress}
                        value={destinationAddress?.formatted_address || ''}
                        country='sg'
                        onchange={(e: any) => {
                          if (!e?.target?.value) {
                            resetField('destinationAddress');
                          }
                        }}
                      />
                    </Box>
                  ) : (
                    ''
                  )}
                  {tourType === 'DISPOSAL' ? (
                    <Box>
                      {locationFields.map((location: any, locIndex) => (
                        <Box
                          // key={location.id}
                          sx={{
                            p: 3,
                            mb: 2,
                            border: '1px solid #ddd',
                            borderRadius: 2,
                            backgroundColor: '#f9f9f9'
                          }}
                        >
                          <Typography variant='h6' gutterBottom>
                            Location Details {locIndex + 1}
                          </Typography>

                          <Box sx={{ mb: 2 }}>
                            <GoogleSearchBox
                              id={`locations.${locIndex}.destination`}
                              name={`locations.${locIndex}.destination`}
                              control={control}
                              isOptional={true}
                              label='Location'
                              placeholder='Search Location...'
                              value={
                                getValues(
                                  `locations.${locIndex}.destination.destination`
                                ) || ''
                              }
                              setAddress={setDestinationAddress}
                              onchange={(e: any) => {
                                if (!e.target.value) {
                                  updateLocation(locIndex, {
                                    ...locationFields[locIndex],
                                    destination: {
                                      endLat: null,
                                      endLng: null,
                                      destination: ''
                                    }
                                  });
                                }
                              }}
                              onChangeCallback={(e: any) => {
                                let prevDestinationAddress: any = [...destinationAddress];
                                prevDestinationAddress[locIndex] = {
                                  destinationName: `locations${locIndex + 1}`,
                                  endLat: e?.geometry?.location?.lat(),
                                  endLng: e?.geometry?.location?.lng(),
                                  destinationAddress: e?.formatted_address
                                };
                                // setValue(`locations.${locIndex}.destination`, {
                                //   endLat: e?.geometry?.location?.lat(),
                                //   endLng: e?.geometry?.location?.lng(),
                                //   destination: e?.formatted_address
                                // });
                                // updateLocation(locIndex, {
                                //   ...locationFields[locIndex],
                                //   destination: {}
                                // });
                                updateLocation(locIndex, {
                                  ...locationFields[locIndex],
                                  destination: {
                                    endLat: e?.geometry?.location?.lat(),
                                    endLng: e?.geometry?.location?.lng(),
                                    destination: e?.formatted_address
                                  }
                                });
                                setDestinationAddress(prevDestinationAddress);
                                clearErrors(`locations.${locIndex}.destination `);
                              }}
                              country='sg'
                            />
                          </Box>

                          <Box sx={{ mt: 2 }}>
                            <Typography variant='subtitle1' gutterBottom>
                              Location Aliases
                            </Typography>

                            {location.destinationAliases?.map(
                              (alias: any, aliasIndex: any) => (
                                <Grid
                                  container
                                  key={aliasIndex}
                                  spacing={1}
                                  sx={{ mb: 1, position: 'relative' }}
                                >
                                  <Grid item xs={aliasIndex === 0 ? 12 : 11}>
                                    <CustomTextField
                                      id={`locations.${locIndex}.destinationAliases.${aliasIndex}.destinationAlias`}
                                      name={`locations.${locIndex}.destinationAliases.${aliasIndex}.destinationAlias`}
                                      control={control}
                                      label={`Alias ${aliasIndex + 1}`}
                                      placeholder={`Enter alias ${aliasIndex + 1}`}
                                      isOptional
                                      value={alias}
                                      onChangeCallback={(e: any) => {
                                        const aliases = getValues(
                                          `locations.${locIndex}.locationAliases`
                                        );
                                        // aliases[aliasIndex] = e?.target?.value;
                                        setValue(
                                          `locations.${locIndex}.locationAliases`,
                                          aliases
                                        );
                                      }}
                                    />
                                  </Grid>
                                  {aliasIndex > 0 && (
                                    <Grid item xs={1}>
                                      <IconButton
                                        onClick={() =>
                                          handleRemoveAlias(locIndex, aliasIndex)
                                        }
                                        className='delete-aliasis'
                                      >
                                        <Icon icon='ic:baseline-delete' />
                                      </IconButton>
                                      {/* <CustomIconButton
                                        category='Delete'
                                        onClick={() =>
                                          handleRemoveAlias(locIndex, aliasIndex)
                                        }
                                      /> */}
                                    </Grid>
                                  )}
                                </Grid>
                              )
                            )}

                            <CustomButton
                              category='Add aliases'
                              variant='outlined'
                              fullWidth
                              startIcon={<AddCircleOutline />}
                              onClick={() => handleAddAlias(locIndex)}
                              sx={{ mt: 1 }}
                            />
                          </Box>

                          {locationFields.length > 1 && (
                            <Box sx={{ mt: 2 }}>
                              <CustomButton
                                category='Remove Location'
                                variant='outlined'
                                color='error'
                                fullWidth
                                onClick={() => {
                                  setDestinationAddress((prev: any) =>
                                    prev?.filter(
                                      (item: any, index: number) => index !== locIndex
                                    )
                                  );

                                  removeLocation(locIndex);
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      ))}

                      {/* Add Location Button */}
                      <CustomButton
                        category='Add Location'
                        className='addLocation'
                        fullWidth
                        variant='contained'
                        color='primary'
                        startIcon={<AddCircleOutline />}
                        onClick={() =>
                          addLocation({
                            destinationAddress: '',
                            destinationAliases: [{ destinationAlias: '' }]
                          })
                        }
                      />
                    </Box>
                  ) : (
                    ''
                  )}

                  <CustomTimePicker
                    id='bufferTime'
                    name='bufferTime'
                    control={control}
                    values={getValues('bufferTime')}
                    label='Buffer Time'
                    views={['hours', 'minutes']}
                    format='HH:mm'
                    isClock={false}
                    isOptional={true}
                  />
                  <Box mt={3} sx={{ textAlign: 'right' }}>
                    <CustomButton
                      category='Cancel'
                      className='cancel'
                      sx={{ marginRight: '10px' }}
                      onClick={() => {
                        handleClose();
                      }}
                    />

                    <CustomButton
                      category={'Save'}
                      className='saveChanges'
                      type='submit'
                      loading={addRoute.isLoading || updateRoute.isLoading}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AddRouteConfiguration;
