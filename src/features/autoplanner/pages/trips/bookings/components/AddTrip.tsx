import { Alert, Box, Dialog, DialogContent, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import {
  convertDatetoEpoch,
  convertEpochToTime,
  convertSecondsToTimes,
  convertTo12HourFormat,
  convertToEpoch3,
  debounce,
  findAddress,
  formatISTtoTime,
  getTomorrowEpoch,
  isValidField,
  useAbort
} from '../../../../../../utils/commonFunctions';
import CustomIconButton from '../../../../../../common/components/buttons/CustomIconButton';
import CustomSelect from '../../../../../../common/components/customized/customselect/CustomSelect';
import CustomTextField from '../../../../../../common/components/customized/customtextfield/CustomTextField';
import GoogleSearchBox from '../../../../../../common/components/maps/googlesearchbox/GoogleSearchBox';
import CustomDateTimeCalendar from '../../../../../../common/components/customized/customdatetimecalendar/CustomDateTimeCalendar';
import CustomDateCalendar from '../../../../../../common/components/customized/customcalendar/CustomCalendar';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';
import CustomTimePicker from '../../../../../../common/components/customized/customtimepicker/CustomTimePicker';
import GoogleMap from '../../../../../../common/components/maps/googlemap/GoogleMap';
import GoogleTripDirections from '../../../../../../common/components/maps/googledirection/GoogleTripDirections';
import CustomRadioButton from '../../../../../../common/components/customized/customradiobutton/CustomRadioButton';
import PhoneNoTextField from '../../../../../../common/components/customized/customtextfield/PhoneNoTextField';
import {
  autoPlannerAddTripsAction,
  autoPlannerAgentAction,
  autoPlannerRoutesAction,
  autoPlannerUpdateTripsAction,
  clearContactError,
  contactNumberValidation
} from '../../../../redux/reducer/autoPlannerSlices/autoplanner';
import {
  updateCenter,
  updateZoom
} from '../../../../../../common/redux/reducer/commonSlices/mapSlice';
import { gettimeConfiguration } from '../../../../redux/reducer/autoPlannerSlices/autoplannerConfigurationSlice';
import './AddTrip.scss';

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTripMode?: any;
  selectedRow: any;
  pageDetails: { pageNo: number; pageSize: number; isAll?: boolean };
  Agents: { id: string; label: string }[];
  Routes: { id: string; label: string }[];
  selectedGroup?: any;
  mode?: string;
  filterPayload?: any;
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
}

const AddTrip = ({
  isOpen,
  setIsOpen,
  selectedRow,
  pageDetails,
  setTripMode,
  Agents,
  Routes,
  mode,
  selectedGroup,
  filterPayload
}: Props) => {
  const [sourceAddress, setSourceAddress] = useState<any>(null);

  const [destinationAddress, setDestinationAddress] = useState<any>(null);
  const [tripType, setTripType] = useState<any>(null);
  const [timeReq, setTimeReq] = useState<any>(0);
  const [tourName, setTourName] = useState<any>(null);
  const [startDate, setStartDate] = useState<any>();
  const [hotelName, setHotelName] = useState('');
  const [tripMarker, setTripMarker] = useState<any>([]);
  const [pvtRoute, setPvtRoute] = useState<any>('Custom');
  const [destinationMarker, setDestinationMarker] = useState<any>([]);
  const tourNames = useAppSelector(state => state.autoPlannerRoutes.data || []);
  const [epocvalue, setEpocvalue] = useState<number | null>(null);
  const [validationErrors, setValidationErrorsMake] = useState<any>();
  const dispatch = useAppDispatch();
  const createAbort = useAbort();

  const dataDate = new Date(new Date().setDate(new Date().getDate() + 1));

  const tommorowDate = new Date(dataDate.setHours(0, 0, 0, 0));

  const tourNameArray: string[] = tourNames.map((item: any) => item.tourName);
  const Timedata = useAppSelector((state: any) => state.ConfiguredTime.data);

  const configuredRoute = tourNames?.map((value: any) => ({
    id: value.tourName,
    label: value.tourName,
    is: value.isTimeRequired
  }));

  const addData = useAppSelector(state => state.AutoPlannerAddTrip);
  const { isLoading } = useAppSelector(state => state.autoPlannerRoutes);
  const updateData = useAppSelector(state => state.AutoPlannerUpdateTrip);
  const { data } = useAppSelector(state => state.auth);
  const profile = useAppSelector(state => state.myProfile.data);
  const contactError = useAppSelector(state => state.ContactNumberValidation);
  const formatDate = (date: string | null) => {
    return date ? dayjs(date).format('DD/MM/YYYY') : '';
  };

  const cutoffTime = Timedata?.data?.cutoffTime;

  const { updatedTime } = convertSecondsToTimes(cutoffTime);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: profileData } = useAppSelector(state => state.auth);

  let roletype = profileData?.role;

  const APagent = roletype === 'ROLE_AGENT';
  const APsubAgent = roletype === 'ROLE_SUB_AGENT';

  const schema = () =>
    yup.object().shape({
      agentname: yup.string().required('Select Agent Name'),
      route: yup.string().optional(),
      phone: yup
        .string()
        .optional()
        .test('basic-contact', 'Invalid contact number', value => {
          if (!value) return true;
          const phoneRegex = /^\+?[0-9]{1,4}[- ]?[0-9]{7,15}$/;
          return phoneRegex.test(value);
        })
        .test('phone-error', 'Enter valid contact number', function (value: any) {
          if (validationErrors && value && validationErrors.status !== 200) {
            return this.createError({ message: validationErrors });
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
        .required('Enter Guest Name')
        .matches(/^[A-Za-z.-]+(\s*[A-Za-z.-]+)*$/, 'Enter valid Guest Name')
        .min(3, 'Guest name must contain at least 3 characters')
        .max(50, 'Guest name cannot exceed 50 characters'),
      adultcount: yup
        .number()
        .typeError('Enter Adult Count')
        .required('Enter Adult Count')
        .min(1, 'Adult Count must be at least 1')
        .max(50, 'Adult Count must not exceed 50')
        .integer('Enter a valid whole number')
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
        .min(0, 'Child Count cannot be below 1')
        .max(50, 'Child Count must not exceed 50')
        .typeError('Child Count must be a number'),

      triptype: yup.string().required('Select Tour Mode'),
      sourceAddress: yup.object().shape({
        source: yup.string().required('Enter Pickup Location'),
        startLat: yup.number().required('Enter Latitude for Pickup Location'),
        startLng: yup.number().required('Enter Longitude for Pickup Location')
      }),
      destinationAddress: yup.object().when(['triptype', 'sourceAddress'], {
        is: (triptype: any, sourceAddress: any) =>
          (triptype === 'PVT' || triptype === 'GRP') && pvtRoute === 'Custom',
        then: () =>
          yup
            .object()
            .shape({
              destination: yup.string().required('Enter Drop Location'),
              endLat: yup.number().required('Enter Latitude for Drop Location'),
              endLng: yup.number().required('Enter Longitude for Drop Location')
            })
            .test(
              'different-source-destination',
              'Pickup and drop should not be the same',
              function (value) {
                const { startLat, startLng } = this.parent?.sourceAddress || {};
                if (
                  startLat &&
                  startLng &&
                  value?.endLat === startLat &&
                  value?.endLng === startLng
                ) {
                  return false;
                }
                return true;
              }
            ),
        otherwise: () =>
          yup.object().shape({
            destination: yup.string().notRequired(),
            endLat: yup.number().notRequired(),
            endLng: yup.number().notRequired()
          })
      }),

      startdate: yup.mixed().when(['triptype', 'tourName'], {
        is: (value: any) => value === 'PVT' || value === 'GRP',
        then: () =>
          yup
            .date()
            .typeError('Enter valid pickup date and time')
            .required('Select pickup date and time')
            .test('tomorrow-or-future', function (value) {
              if (!value) return this.createError({ message: 'Select a trip date.' });

              const now = new Date(
                new Date().toLocaleString('en-US', { timeZone: profile?.timezone })
              );

              const today = new Date(now);
              today.setHours(0, 0, 0, 0);

              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);

              // Selected date in profile timezone
              const selected = new Date(
                new Date(value).toLocaleString('en-US', { timeZone: profile?.timezone })
              );
              selected.setHours(0, 0, 0, 0);

              if (selected < tomorrow) {
                return this.createError({
                  message: 'Trip date must be from tomorrow onwards.'
                });
              }
              const isAPAgent = roletype === 'ROLE_AGENT';
              const isAPSubAgent = roletype === 'ROLE_SUB_AGENT';

              if (
                (isAPAgent || isAPSubAgent) &&
                selected.getTime() === tomorrow.getTime()
              ) {
                const secondsNow =
                  now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

                if (secondsNow >= cutoffTime) {
                  const cutoffHour = String(Math.floor(cutoffTime / 3600)).padStart(
                    2,
                    '0'
                  );
                  const cutoffMin = String(Math.floor((cutoffTime % 3600) / 60)).padStart(
                    2,
                    '0'
                  );
                  return this.createError({
                    message: `Tomorrow's booking is closed after ${convertTo12HourFormat(
                      `${cutoffHour}:${cutoffMin}`
                    )}. Please choose a later date.`
                  });
                }
              }

              return true;
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
        then: () => yup.string().required('Select Tour Name'),
        otherwise: () => yup.string().notRequired()
      }),
      tripDate: yup.string().when(['triptype', 'tourName'], {
        is: (triptype: any, tourname: any) =>
          (triptype === 'SIC' || triptype === 'TSIC') && timeReq === 0,
        then: () =>
          yup
            .string()
            .required('Select Trip Date')
            .matches(
              /^\d{2}\/\d{2}\/\d{4}$/,
              'Trip Date must be in the format DD/MM/YYYY'
            )
            .test('is-valid-trip-date', function (value) {
              if (!value) {
                return this.createError({ message: 'Select Trip Date.' });
              }

              const [day, month, year] = value.split('/');
              const selectedDate = new Date(`${year}-${month}-${day}T00:00:00`);

              // Current time in Singapore
              const now = new Date();
              const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
              const singaporeMillis = utcMillis + 8 * 60 * 60 * 1000;
              const singaporeNow = new Date(singaporeMillis);

              const today = new Date(singaporeNow);
              today.setHours(0, 0, 0, 0);

              if (selectedDate <= today) {
                return this.createError({
                  message: 'Trip date must be from tomorrow onwards.'
                });
              }

              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);

              // ✅ Apply cutoff validation only for ROLE_AGENT / ROLE_SUB_AGENT
              const isAPAgent = roletype === 'ROLE_AGENT';
              const isAPSubAgent = roletype === 'ROLE_SUB_AGENT';

              if (
                (isAPAgent || isAPSubAgent) &&
                selectedDate.getTime() === tomorrow.getTime()
              ) {
                const secondsNow =
                  singaporeNow.getHours() * 3600 +
                  singaporeNow.getMinutes() * 60 +
                  singaporeNow.getSeconds();

                if (secondsNow >= cutoffTime) {
                  const cutoffHour = String(Math.floor(cutoffTime / 3600)).padStart(
                    2,
                    '0'
                  );
                  const cutoffMin = String(Math.floor((cutoffTime % 3600) / 60)).padStart(
                    2,
                    '0'
                  );

                  return this.createError({
                    message: `Tomorrow's booking is closed after ${convertTo12HourFormat(
                      `${cutoffHour}:${cutoffMin}`
                    )}. Please choose a later date.`
                  });
                }
              }

              return true;
            }),
        otherwise: () => yup.string().notRequired()
      })
    });

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    clearErrors,
    getValues,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema())
  });

  const address = async (lat: any, lng: any) => {
    let fAdd = findAddress(lat, lng);
    return fAdd;
  };
  const handleClose = () => {
    clearErrors('phone');
    setIsOpen(false);
    reset();
  };

  const onSubmit = async (params: any) => {
    const standard = tripType === 'SIC' || tripType === 'TSIC';
    const bufferTimeFormatted =
      !standard && params.bufferTime ? formatISTtoTime(params.bufferTime) : null;
    const payload = {
      adultCount: params.adultcount,
      agentName: params?.agentname ? params?.agentname : 0,
      childCount: params.childcount ? params.childcount : 0,
      date: params.tripDate ? params.tripDate : null,
      destination:
        pvtRoute === 'Custom' || !standard
          ? params.destinationAddress?.destination
          : null,
      endLat:
        pvtRoute === 'Custom' || !standard ? params.destinationAddress?.endLat : null,
      endLng:
        pvtRoute === 'Custom' || !standard ? params.destinationAddress?.endLng : null,
      guestName: params.guestname,
      mode: params.triptype,
      refNumber: params?.referenceno ? params?.referenceno : '',
      tourName: params?.configuredRoute ? params?.configuredRoute : null,
      source: `${hotelName} ${params.sourceAddress?.source}`,
      startLat: params.sourceAddress?.startLat,
      ...(params.phone &&
        params.phone.includes('-') &&
        params.phone.split('-')[1] && { guestContactNumber: params.phone }),

      startLng: params.sourceAddress?.startLng,
      isCustomRoute: pvtRoute === 'Custom' && ['PVT', 'GRP']?.includes(tripType) ? 1 : 0,
      time: params.startdate ? convertEpochToTime(params.startdate) : null,
      startTimestamp: params.startdate
        ? convertDatetoEpoch(params.startdate) / 1000
        : null,
      bufferTime: bufferTimeFormatted ? bufferTimeFormatted : '00:20'
    };
    const addTrip = { payload, pageDetails };
    if (selectedRow?.trip_id) {
      const payloads: UpdatePayload = {
        ...payload,
        tripID: selectedRow?.trip_id,
        journeyID: selectedRow?.journey_id,
        isScheduleModifying: 0,
        mode: params.triptype,
        vehicleNumber: ''
      };
      const updateTrip = {
        ...filterPayload,
        payload: payloads,
        pageDetails,
        selectedRow: selectedRow,
        mode: params.triptype,
        APagent: APagent,
        APsubAgent: APsubAgent
      };
      const action1 = await dispatch(autoPlannerUpdateTripsAction(updateTrip));
      if (action1.type === autoPlannerUpdateTripsAction.fulfilled.type) {
        handleClose();
      }
    } else {
      const action2 = await dispatch(autoPlannerAddTripsAction(addTrip));
      if (action2.type === autoPlannerAddTripsAction.fulfilled.type) {
        handleClose();
      }
    }
    if (setTripMode && !pageDetails.isAll)
      setTripMode(
        null,
        payload.mode === 'SIC'
          ? 0
          : payload.mode === 'TSIC'
          ? 1
          : payload.mode === 'PVT'
          ? 2
          : 3
      );
  };

  const tripTypes = [
    { id: 'PVT', label: 'PVT' },
    { id: 'SIC', label: 'SIC' },
    { id: 'TSIC', label: 'TSIC' },
    { id: 'GRP', label: 'GRP' }
  ];

  const handleValidate = useCallback(
    debounce((event: any) => {
      dispatch(contactNumberValidation(event));
    }),
    []
  );

  useEffect(() => {
    setValidationErrorsMake(contactError?.data);
  }, [contactError]);

  useEffect(() => {
    return () => {
      dispatch(clearContactError());
    };
  }, []);

  useEffect(() => {
    if (validationErrors) {
      trigger('phone');
    }
  }, [validationErrors]);

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

  useEffect(() => {
    if (selectedRow?.trip_id) {
      if (selectedRow?.buffer_time) {
        const bufferTime =
          selectedRow?.buffer_time !== null ? selectedRow?.buffer_time : '00:00';
        setValue(
          'bufferTime',
          dayjs()
            .set('hour', bufferTime.split(':')[0])
            .set('minute', bufferTime.split(':')[1])
        );
      }
      setEpocvalue(convertToEpoch3(selectedRow?.date ? selectedRow?.date : ''));
      setValue('agentname', selectedRow?.agent_name.toLowerCase());
      setValue('triptype', selectedRow?.mode ? selectedRow?.mode : mode);
      dispatch(
        autoPlannerRoutesAction({ mode: selectedRow?.mode ? selectedRow?.mode : mode })
      );
      setValue('referenceno', selectedRow?.ref_number);
      setValue('guestname', selectedRow?.guest_name);
      setValue('adultcount', selectedRow?.adult_count);
      setValue('route', selectedRow?.tourName ? 'Standard' : 'Custom');
      setValue('childcount', selectedRow?.child_count);
      setValue(
        'configuredRoute',
        selectedRow.tourName ? selectedRow.tourName : selectedGroup?.tourName
      );
      // setValue(
      //   'startdate',
      //   dayjs.unix(convertDateTimetoEpoch(selectedRow?.startTimestamp) / 1000)
      // );
      // setValue('startdate', selectedRow?.startTimestamp);
      setValue('tripDate', selectedRow?.date);
      setTripType(selectedRow?.mode ? selectedRow?.mode : mode);
      setTripMarker([
        {
          id: 'source',
          lat: selectedRow?.startLat,
          lng: selectedRow?.startLng,
          name: 'trip',
          info: { Mylocation: 'source' }
        }
      ]);
      setSourceAddress({
        geometry: {
          location: {
            lat: () => {
              return selectedRow?.startLat;
            },
            lng: () => {
              return selectedRow?.startLng;
            }
          }
        },
        formatted_address: selectedRow?.source
      });
      if (selectedRow?.destination !== selectedRow?.tourName)
        setDestinationAddress({
          geometry: {
            location: {
              lat: () => {
                return selectedRow?.endLat;
              },
              lng: () => {
                return selectedRow?.endLng;
              }
            }
          },
          formatted_address: selectedRow?.destination
        });
      // setStartDate(
      //   selectedRow?.startTimestamp &&
      //     dayjs.unix(convertDateTimetoEpoch(selectedRow?.startTimestamp) / 1000)
      // );
    }
  }, [selectedRow]);

  useEffect(() => {
    if (selectedRow && tourNames) {
      const time = tourNames?.find(
        (item: any) => item?.tourName === selectedRow?.tourName
      );
      setTimeReq(time?.isTimeRequired);

      const value: any = dayjs.unix(selectedRow?.startTimestamp);
      setStartDate(value?.$d);
      setValue('startdate', dayjs.unix(convertDatetoEpoch(value?.$d) / 1000));
    }
  }, [selectedRow, tourNames]);
  useEffect(() => {
    if (selectedRow) {
      if (selectedRow?.tourName) {
        setPvtRoute('Standard');
      } else {
        setPvtRoute('Custom');
      }
    }
  }, [selectedRow]);

  useEffect(() => {
    setValue('sourceAddress', {
      source: sourceAddress?.formatted_address,
      startLat: sourceAddress?.geometry?.location?.lat(),
      startLng: sourceAddress?.geometry?.location?.lng()
    });
    clearErrors('sourceAddress');
    const prevMarkers = tripMarker;
    if (prevMarkers?.length <= 1 && sourceAddress) {
      // setTripMarker([
      //   {
      //     id: 'source',
      //     lat: sourceAddress?.geometry?.location?.lat(),
      //     lng: sourceAddress?.geometry?.location?.lng(),
      //     name: 'trip',
      //     info: { Mylocation: 'source' }
      //   }
      // ]);
      setTripMarker((prev: any[]) => {
        const destinationMarker = prev?.find(marker => marker.id === 'destination');

        const sourceMarker = {
          id: 'source',
          lat: sourceAddress?.geometry?.location?.lat() ?? 0,
          lng: sourceAddress?.geometry?.location?.lng() ?? 0,
          name: 'trip',
          info: { Mylocation: 'source' }
        };

        const updatedMarkers = destinationMarker
          ? [sourceMarker, destinationMarker]
          : [sourceMarker];

        return updatedMarkers;
      });
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
    setValue('destinationAddress', {
      destination: destinationAddress?.formatted_address,
      endLat: destinationAddress?.geometry?.location?.lat(),
      endLng: destinationAddress?.geometry?.location?.lng()
    });
    // trigger('destinationAddress');
    clearErrors('destinationAddress');
    const prevMarkers = tripMarker;
    const isDestinationMarker = prevMarkers?.some(
      (marker: any) => marker.id === 'destination'
    );
    if (destinationAddress?.geometry?.location?.lat()) {
      let lat = destinationAddress?.geometry?.location?.lat();
      let lng = destinationAddress?.geometry?.location?.lng();
      let destinationMarker = {
        id: 'destination',
        lat: lat,
        lng: lng,
        name: 'trip',
        info: { Mylocation: 'Destination' }
      };
      if (!isDestinationMarker) {
        setTripMarker((prev: any) => [...prev, destinationMarker]);
      } else {
        setTripMarker((marker: any) => {
          let updatedMarker = marker?.map((item: any) =>
            item?.id === 'destination'
              ? {
                  ...destinationMarker
                }
              : item
          );
          return updatedMarker;
        });
      }
    } else if (isDestinationMarker && destinationAddress) {
      setTripMarker((marker: any) => {
        let updatedMarkers = marker?.filter((item: any) => item?.id !== 'destination');
        return updatedMarkers;
      });
    }
  }, [destinationAddress, selectedRow]);

  useEffect(() => {
    if (tripType === 'SIC' || tripType === 'TSIC') {
      if (tripMarker.length === 2)
        setDestinationMarker(
          tripMarker?.filter((item: any) => item?.id === 'destination')
        );
      setTripMarker((marker: any) => {
        let updatedMarkers = marker?.filter((item: any) => item?.id !== 'destination');
        return updatedMarkers;
      });
    } else if (destinationMarker.length > 0) {
      setTripMarker((prev: any) => [...prev, ...destinationMarker]);
    }
  }, [tripType]);

  useEffect(() => {
    if (tripMarker[0]?.lat && tripMarker[0]?.lng) {
      dispatch(updateCenter(tripMarker));
      dispatch(updateZoom(tripMarker));
    }
  }, [tripMarker]);

  useEffect(() => {
    dispatch(gettimeConfiguration());
  }, []);

  useEffect(() => {
    if (
      (data?.userId && data?.role === 'ROLE_AGENT') ||
      (data?.userId && data?.role === 'ROLE_SUB_AGENT')
    )
      setValue('agentname', Agents[0]?.id);
  }, [data, Agents]);

  const placeId = sourceAddress?.place_id ? sourceAddress?.place_id : null;

  useEffect(() => {
    if (!window.google && !sourceAddress) return;

    if (window?.google?.maps) {
      const map = new window.google.maps.Map(document.createElement('div'));
      const service = new window.google.maps.places.PlacesService(map);

      service.getDetails(
        {
          placeId,
          fields: ['name', 'formatted_address', 'geometry']
        },
        (place: any, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            setHotelName(place.name);
          }
        }
      );
    }
  }, [sourceAddress]);

  useEffect(() => {
    const abortController = createAbort().abortCall;
    dispatch(autoPlannerAgentAction(abortController?.signal));
  }, []);

  return (
    <Box className='add-trip-component'>
      <Dialog
        open={isOpen}
        fullScreen
        sx={{ padding: 3, zIndex: 1, position: 'absolute' }}
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
              // overflowY: 'scroll',
              // maxHeight:'89vh'
            }}
            className='add-trip-grid-container'
          >
            <Grid item xs={12} md={8} sm={8} lg={9} sx={{ overflow: 'hidden' }} p={2}>
              <Box
                sx={{
                  width: '100%',
                  height: { xs: '18vh', sm: '87vh', md: '87vh' },
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
              <Box className='add-trip-header' mb={'16px'}>
                <Typography
                  className='add-booking-title'
                  sx={{
                    fontWeight: 500,
                    fontSize: '18px !important'
                  }}
                >
                  {selectedRow?.trip_id ? 'Update Booking' : 'Add Booking'}
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
                  maxHeight: { xs: '68vh', sm: '79vh', md: '79vh', lg: '79vh' },
                  overflowY: 'scroll',
                  paddingRight: '15px'
                }}
                onSubmit={handleSubmit(onSubmit)}
              >
                <CustomSelect
                  id='agent-name'
                  control={control}
                  name='agentname'
                  isDisabled={APagent || APsubAgent}
                  label='Agent Name'
                  placeholder='Select Agent Name'
                  options={Agents}
                />
                <CustomTextField
                  id='guest-name'
                  control={control}
                  name='guestname'
                  label='Guest Name'
                  placeholder='Enter Guest Name'
                  maxlength={20}
                />
                <Controller
                  name='phone'
                  control={control}
                  defaultValue={selectedRow?.guestContactNumber || ''}
                  rules={{ required: true }}
                  render={({ field }: any) => (
                    <PhoneNoTextField
                      {...field}
                      setValue={setValue}
                      // country='sg'
                      isOptional={true}
                      style='share'
                      label='Contact Number'
                      // disableCountry={true}
                      error={Boolean(errors?.phone?.message)}
                      helperText={errors.phone?.message}
                      onChange={(e: any) => {
                        if (e) {
                          const emptySpace = /^.+\s.+$/g;
                          const isValid = isValidField('contactnumber', e);
                          if (e && !emptySpace.test(e) && isValid) {
                            handleValidate(e);
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
                      placeholder='Adult Count'
                      isDecimal={true}
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
                      isDecimal={true}
                      defaultValue=''
                      placeholder='Child Count'
                      onChangeCallback={(e: any) => {
                        const value = e?.target?.value;
                        if (value && value < 0) {
                          setValue('childcount', 0);
                        } else {
                          setValue('childcount', value || 0);
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
                  placeholder='Enter Reference No'
                  isOptional={true}
                />
                <CustomSelect
                  id='trip-type'
                  control={control}
                  label='Tour Mode'
                  placeholder='Select Tour Mode'
                  options={tripTypes}
                  name='triptype'
                  onChanges={(event: any, newValue: Select) => {
                    setTripType(newValue?.label);
                    dispatch(autoPlannerRoutesAction({ mode: newValue?.label }));
                    clearErrors('triptype');
                    setValue('configuredRoute', '');
                    setValue('sourceAddress.source', '');
                    setSourceAddress(null);
                    setTripMarker([]);
                    setPvtRoute('Custom');
                    setDestinationAddress(null);
                    setValue('configuredRoute', '');
                    setStartDate(null);
                    setValue('startdate', '');
                    setValue('bufferTime', '');
                    setValue('tripDate', '');
                    setEpocvalue(null);
                  }}
                />
                {tripType !== null && tripType !== undefined && (
                  <GoogleSearchBox
                    id='search-source'
                    name='sourceAddress'
                    control={control}
                    label='Pickup Location'
                    placeholder='Search Location..'
                    // value={sourceAddress?.formatted_address}
                    value={
                      hotelName || sourceAddress?.formatted_address
                        ? `${hotelName ?? ''} ${sourceAddress?.formatted_address}`
                        : undefined
                    }
                    setAddress={setSourceAddress}
                    country='sg'
                    onchange={(e: any) => {
                      if (!e?.target?.value) {
                        setSourceAddress(null);
                        setTripMarker((prev: any) =>
                          prev.filter((item: any) => item?.id !== 'source')
                        );
                      }
                    }}
                  />
                )}

                {tripType === 'PVT' || tripType === 'GRP' ? (
                  <CustomRadioButton
                    name='route'
                    control={control}
                    formlabel='Select Route Type'
                    radiobutton1='Custom'
                    radiobutton2='Standard'
                    value1='Custom'
                    value2='Standard'
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
                      setValue('startdate', '');
                      setValue('bufferTime', '');
                      setValue('tripDate', '');
                      setEpocvalue(null);
                      setStartDate(null);
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
                        setAddress={setDestinationAddress}
                        country='sg'
                        onchange={(e: any) => {
                          if (!e?.target?.value) {
                            setDestinationAddress(null);
                            setTripMarker((prev: any) =>
                              prev.filter((item: any) => item.id !== 'destination')
                            );
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
                        onChanges={(event: any, newValue: Select) => {
                          setTourName(newValue?.label);
                          clearErrors('triptype');
                          setValue('startdate', '');
                          setValue('bufferTime', '');
                          setValue('tripDate', '');
                          setEpocvalue(null);
                          setStartDate(null);
                        }}
                      />
                    )}
                  </>
                )}

                {tripType !== null && tripType !== undefined && (
                  <>
                    {tripType === 'PVT' || tripType === 'GRP' ? (
                      <>
                        {(APsubAgent || APagent) && (
                          <Alert
                            severity='info'
                            sx={{
                              marginBottom: '5px',
                              padding: '5px 10px',
                              alignItems: 'center',
                              fontSize: '12px'
                            }}
                          >
                            {/* Cut-off for tomorrow’s booking:{' '}
                            <b>{cutoffTime ? updatedTime : '00:00'}</b>. Complete all
                            entries before then. */}
                            Tomorrow’s bookings must be Added before{' '}
                            <b>{cutoffTime ? updatedTime : '00:00'}</b>
                          </Alert>
                        )}
                        <CustomDateTimeCalendar
                          id='startdate'
                          control={control}
                          name='startdate'
                          label='Pickup Date & Time'
                          disableFuture={false}
                          disablePast={true}
                          value={getValues('startdate')}
                          minDateTime={
                            profile?.timezone &&
                            dayjs().tz(profile?.timezone).add(1, 'day').startOf('day')
                          }
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
                          placeholder='Select Tour Name'
                          options={configuredRoute}
                          name='configuredRoute'
                          onChanges={(event: any, newValue: any) => {
                            if (newValue?.is === 0) {
                              setTimeReq(0);
                            } else {
                              setTimeReq(1);
                            }
                            setValue('startdate', '');
                            setValue('bufferTime', '');
                            setValue('tripDate', '');
                            setEpocvalue(null);
                            setStartDate(null);
                            setTourName(newValue?.label);
                            clearErrors('triptype');
                          }}
                        />
                        {timeReq === 1 && (
                          <>
                            {(APsubAgent || APagent) && (
                              <Alert
                                severity='info'
                                sx={{
                                  marginBottom: '5px',
                                  padding: '5px 10px',
                                  alignItems: 'center',
                                  fontSize: '12px'
                                }}
                              >
                                Tomorrow’s bookings must be Added before{' '}
                                <b>{cutoffTime ? updatedTime : '00:00'}</b>
                              </Alert>
                            )}
                            <CustomDateTimeCalendar
                              id='startdate'
                              control={control}
                              name='startdate'
                              label='Pickup Date & Time'
                              disableFuture={false}
                              disablePast={true}
                              minDateTime={dayjs().add(1, 'day').startOf('day')}
                              value={getValues('startdate')}
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
                              }}
                            />
                          </>
                        )}
                        {timeReq === 0 && (
                          <>
                            {(APsubAgent || APagent) && (
                              <Alert
                                severity='info'
                                sx={{
                                  marginBottom: '5px',
                                  padding: '5px 10px',
                                  alignItems: 'center',
                                  fontSize: '12px'
                                }}
                              >
                                Tomorrow’s bookings must be Added before{' '}
                                <b>{cutoffTime ? updatedTime : '00:00'}</b>
                              </Alert>
                            )}
                            <CustomDateCalendar
                              id='trip-date'
                              name='tripDate'
                              control={control}
                              type='user-profile'
                              className='calendar'
                              label='Trip Date'
                              placeholder='Select Trip Date'
                              minDate={dayjs().add(1, 'day').startOf('day')}
                              disablePast={true}
                              value={epocvalue ? dayjs.unix(epocvalue) : null}
                              onDateChange={(date: any) => {
                                setValue('tripDate', formatDate(date?.$d));
                                clearErrors('tripDate');
                              }}
                            />
                          </>
                        )}
                      </>
                    )}
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
                    category={selectedRow?.trip_id ? 'Save' : 'Save'}
                    loading={updateData?.isLoading || addData?.isLoading}
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

export default AddTrip;
