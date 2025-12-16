import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  convertDatetoEpoch,
  convertISTToTimeZone,
  convertToEpoch3,
  formatISTtoTime
} from '../../../../../../utils/commonFunctions';
import { useAppDispatch } from '../../../../../../app/redux/hooks';
import {
  autoPlannerAgentAction,
  autoPlannerRoutesAction,
  clearAdhocTransferVehicle,
  clearAdhocVehicle,
  contactNumberValidation,
  externalvehicleAction,
  getAdhocTransferVehicle,
  getAdhocVehicle
} from '../../../../redux/reducer/autoPlannerSlices/autoplanner';
import { debounce } from 'lodash';
import { updateToast } from '../../../../../../common/redux/reducer/commonSlices/toastSlice';

// Form Handling functionality for Add adhoc Trip
export const useAdHocUpdateHook = ({
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
}: any) => {
  const dispatch = useAppDispatch();
  const [startDate, setStartDate] = useState<any>();

  useEffect(() => {
    if (selectedRow?.tripID) {
      if (selectedRow?.bufferTime) {
        const bufferTime = selectedRow.bufferTime ?? '00:00';
        setValue(
          'bufferTime',
          dayjs()
            .set('hour', bufferTime.split(':')[0])
            .set('minute', bufferTime.split(':')[1])
        );
      } else {
        setValue('bufferTime', dayjs('00:20', 'HH:mm'));
      }

      setEpocvalue(convertToEpoch3(selectedRow?.date ?? ''));

      setValue('agentname', selectedRow?.agentName?.toLowerCase() ?? '');
      setValue('triptype', selectedRow?.mode ?? mode);

      dispatch(
        autoPlannerRoutesAction({
          mode: selectedRow?.mode ?? mode,
          currentSecond: dayjs()
            .tz(profile.timezone)
            .format('HH:mm:ss')
            .split(':')
            .map(Number)
            .reduce((acc: any, time: any) => 60 * acc + +time)
        })
      );

      setValue('referenceno', selectedRow?.refNumber ?? '');
      setValue('guestname', selectedRow?.guestName ?? '');
      setValue('adultcount', selectedRow?.adultCount ?? 0);
      setValue('childcount', selectedRow?.childCount ?? 0);
      setTripType(selectedRow?.mode ?? mode);
      setValue(
        'vehicleType',
        selectedRow?.isExternalVehicle === 0 ? 'Internal' : 'External'
      );

      setValue('route', selectedRow?.isCustomRoute === 1 ? 'Custom' : 'Standard');
      setValue('configuredRoute', selectedRow?.tourName ?? selectedGroup?.tourName);
      setValue(
        'vehicleNumber',
        selectedRow?.vehicleNumber ?? selectedGroup?.vehicleNumber
      );

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
            lat: () => selectedRow?.startLat,
            lng: () => selectedRow?.startLng
          }
        },
        formatted_address: selectedRow?.source ?? ''
      });

      if (selectedRow?.destination !== selectedRow?.tourName) {
        setDestinationAddress({
          geometry: {
            location: {
              lat: () => selectedRow?.endLat,
              lng: () => selectedRow?.endLng
            }
          },
          formatted_address: selectedRow?.destination ?? ''
        });
      }

      // Optional: handle startTimestamp if available in future
      // if (selectedRow?.startTimestamp) {
      //   setValue(
      //     'startdate',
      //     dayjs.unix(convertDateTimetoEpoch(selectedRow.startTimestamp) / 1000)
      //   );
      //   setStartDate(
      //     dayjs.unix(convertDateTimetoEpoch(selectedRow.startTimestamp) / 1000)
      //   );
      // }

      const todayDate = dayjs().format('DD-MM-YYYY');

      setStartDate(dayjs.unix(selectedRow?.startTimestamp));

      setValue('startdate', dayjs.unix(selectedRow?.startTimestamp));

      setVehicleType(selectedRow?.isExternalVehicle ? 'External' : 'Internal');

      const payloadAdhocData = {
        adultCount: selectedRow?.adultCount ?? 0,
        agentName: selectedRow?.agentName ?? '',
        childCount: selectedRow?.childCount ?? 0,
        date: dayjs().format('DD/MM/YYYY'),

        ...((selectedRow?.destination && selectedRow?.isCustomRoute) ||
        selectedRow?.transferInstance?.to
          ? {
              destination:
                selectedRow?.destination ??
                selectedRow?.transferInstance?.to?.locationAddress ??
                '',
              endLat: selectedRow?.endLat ?? selectedRow?.transferInstance?.to?.lat ?? '',
              endLng: selectedRow?.endLng ?? selectedRow?.transferInstance?.to?.lng ?? ''
            }
          : {}),

        ...(selectedRow?.guestContactNumber && {
          guestContactNumber: selectedRow.guestContactNumber
        }),

        source:
          selectedRow?.source ??
          selectedRow?.transferInstance?.from?.locationAddress ??
          '',
        startLat: selectedRow?.startLat ?? selectedRow?.transferInstance?.from?.lat ?? '',
        startLng: selectedRow?.startLng ?? selectedRow?.transferInstance?.from?.lng ?? '',

        guestName: selectedRow?.guestName ?? '',
        mode: selectedRow?.mode ?? '',
        refNumber: selectedRow?.refNumber ?? '',
        tourName: selectedRow?.tourName ?? '',

        isCustomRoute: selectedRow?.isCustomRoute ?? 0,

        time: selectedRow?.time ?? selectedRow?.transferInstance?.time ?? null,
        startTimestamp: selectedRow?.startTimestamp ?? null,
        bufferTime: selectedRow?.bufferTime ?? '',
        ...(selectedRow?.journeyId ? { journeyId: selectedRow?.journeyId } : {})
      };

      const payload = {
        date: epochStartOfTodaySG,
        ...(selectedRow?.journeyId ? { journeyId: selectedRow?.journeyId } : {}),
        data: payloadAdhocData
      };

      setIsVehicleNumberEnable(true);
      dispatch(getAdhocVehicle(payload));

      if (selectedRow?.transferInstance) {
        const payloadData = {
          adultCount: selectedRow?.adultCount ?? 0,
          agentName: selectedRow?.agentName ?? '',
          childCount: selectedRow?.childCount ?? 0,
          date: dayjs().format('DD/MM/YYYY'),

          destination:
            selectedRow?.destination ??
            selectedRow?.transferInstance?.to?.locationAddress ??
            '',
          endLat: selectedRow?.endLat ?? selectedRow?.transferInstance?.to?.lat ?? '',
          endLng: selectedRow?.endLng ?? selectedRow?.transferInstance?.to?.lng ?? '',

          ...(selectedRow?.guestContactNumber && {
            guestContactNumber: selectedRow.guestContactNumber
          }),

          source:
            selectedRow?.source ??
            selectedRow?.transferInstance?.from?.locationAddress ??
            '',
          startLat:
            selectedRow?.startLat ?? selectedRow?.transferInstance?.from?.lat ?? '',
          startLng:
            selectedRow?.startLng ?? selectedRow?.transferInstance?.from?.lng ?? '',

          guestName: selectedRow?.guestName ?? '',
          mode: selectedRow?.mode ?? '',
          refNumber: selectedRow?.refNumber ?? '',
          tourName: selectedRow?.tourName ?? '',
          isCustomRoute: selectedRow?.isCustomRoute ?? 0,

          time: selectedRow?.time ?? selectedRow?.transferInstance?.time ?? null,
          startTimestamp: selectedRow?.startTimestamp ?? null,
          bufferTime: selectedRow?.bufferTime ?? '',

          isExternalVehicle: selectedRow?.isExternalVehicle ?? 0,
          vehicleNumber: selectedRow?.vehicleNumber ?? '',
          seatingCapacity: selectedRow?.seatingCapacity ?? 0,

          driverId: selectedRow?.driverId ?? '',
          driverName: selectedRow?.driverName ?? '',
          driverContactNumber: selectedRow?.driverContactNumber ?? '',
          ...(selectedRow?.journeyId ? { journeyId: selectedRow?.journeyId } : {}),
          ...(selectedRow?.disposalPickupWindow
            ? { disposalPickupWindow: selectedRow?.disposalPickupWindow }
            : {})
        };

        const payload = {
          date: epochStartOfTodaySG,
          ...(selectedRow?.journeyId ? { journeyId: selectedRow?.journeyId } : {}),
          data: payloadData
        };

        if (['SIC', 'TSIC'].includes(selectedRow?.mode)) {
          dispatch(getAdhocTransferVehicle(payload));
        }
      }
      setIsVehicleNumberEnable(true);

      setValue('transferVehicleNumber', selectedRow?.transferInstance?.vehicleNumber);
      setValue('driverName', selectedRow?.driverName);
      setTransferVehicleType(
        selectedRow?.transferInstance?.isExternalVehicle ? 'External' : 'Internal'
      );
      setValue(
        'transferVehicleType',
        selectedRow?.transferInstance?.isExternalVehicle ? 'External' : 'Internal'
      );
      setValue('contactNumber', selectedRow?.driverContactNumber);
      setValue('seatingCapacity', selectedRow?.seatingCapacity);
    }
  }, [selectedRow]);

  useEffect(() => {
    if (selectedRow && tourNames?.length > 0) {
      const time = tourNames?.find(
        (item: any) => item?.tourName === selectedRow?.tourName
      );
      setValue('isTime', Boolean(time?.isTimeRequired));
      setTimeReq(time?.isTimeRequired);
    }
  }, [selectedRow, tourNames]);

  useEffect(() => {
    if (selectedRow?.tourName) {
      setPvtRoute('Standard');
    } else {
      setPvtRoute('Custom');
    }
  }, [selectedRow]);

  return {
    startDate,
    setStartDate
  };
};

// OnChange functionalities in Add-Adhoc Form
export const useAdHocFormOnchange = ({
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
}: any) => {
  const dispatch = useAppDispatch();
  const [validationErrors, setValidationErrorsMake] = useState<any>({
    phone: 'no-error',
    contactNumber: 'no-error',
    transferContactNumber: 'no-error'
  });

  const handleValidate = useCallback(
    debounce(async (event: any, field: string) => {
      setValue('driverName', '');
      const payload = {
        mobileNumber: event,
        autoplannerId: autoplannerID
      };
      const response: any = await dispatch(externalvehicleAction(payload));
      setValidationErrorsMake((prev: any) => ({
        ...prev,
        [field]:
          response?.payload?.status !== 200 && response?.payload?.status != 'Success'
            ? response?.payload?.response?.data?.message
            : 'no-error'
      }));
      if (response.type === externalvehicleAction.fulfilled.type) {
        if (field == 'driverName') {
          if (response.payload.data) setValue('driverName', response.payload.data);
        } else {
          if (response.payload.data)
            setValue('transferDriverName', response.payload.data);
        }
      }
    }, 200),
    [autoplannerID]
  );

  const handleClose = () => {
    dispatch(clearAdhocTransferVehicle());
    setSelectedRow(null);
    setValidationErrorsMake({ phone: '', contactNumber: '', transferContactNumber: '' });
    setIsOpen(false);
    reset();
    setCallApi(false);
  };

  const handleVehicleDropdown = async () => {
    dispatch(clearAdhocVehicle());
    dispatch(clearAdhocTransferVehicle());

    if (vehicleType === 'Internal') setValue('vehicleNumber', '');
    setIsVehicleNumberEnable(false);
    const SICTSICFields = [
      'agentname',
      'adultcount',
      getValues('isTime') ? 'startdate' : 'tripDate',
      'guestname',
      'triptype',
      'configuredRoute',
      'sourceAddress'
    ];

    const PVTGRPCustomFields: any = [
      'agentname',
      'adultcount',
      'guestname',
      'triptype',
      'sourceAddress',
      'route',
      'destinationAddress',
      'startdate'
    ];

    const PVTGRPStandardFields: any = [
      'agentname',
      'adultcount',
      'guestname',
      'triptype',
      'sourceAddress',
      'route',
      'configuredRoute',
      getValues('isTime') ? 'startdate' : 'tripDate'
    ];
    const fields = ['SIC', 'TSIC'].includes(getValues('triptype'))
      ? SICTSICFields
      : getValues('route') === 'Custom'
      ? PVTGRPCustomFields
      : PVTGRPStandardFields;

    const callApi = fields?.every((item: any) => {
      return Boolean(
        getValues(item) &&
          (['sourceAddress', 'destinationAddress']?.includes(item)
            ? Object.values(getValues(item))?.every(Boolean)
            : true) &&
          (['adultcount']?.includes(item) ? Boolean(Number(getValues(item))) : true)
      );
    });

    if (callApi && getValues('vehicleType')) {
      const standard = tripType === 'SIC' || tripType === 'TSIC';
      const bufferTimeFormatted =
        !standard && getValues('bufferTime' as any)?.$d
          ? formatISTtoTime(getValues('bufferTime' as any)?.$d)
          : null;
      const payloadData = {
        adultCount: getValues('adultcount'),
        agentName: getValues('agentname') ? getValues('agentname') : 0,
        childCount: getValues('childcount') ? getValues('childcount') : 0,
        date: getValues('tripDate') ? getValues('tripDate') : '',
        ...(getValues('destinationAddress' as any) &&
        !(tripType === 'SIC' || tripType === 'TSIC')
          ? {
              destination: getValues('destinationAddress' as any)?.destination || '',
              endLat: getValues('destinationAddress' as any)?.endLat || ' ',
              endLng: getValues('destinationAddress' as any)?.endLng || ''
            }
          : {}),
        ...(getValues('phone') &&
          getValues('phone')?.includes('-') &&
          getValues('phone')?.split('-')[1] && {
            guestContactNumber: getValues('phone')
          }),
        source: getValues('sourceAddress')?.source ?? '',
        startLat: getValues('sourceAddress')?.startLat ?? '',
        startLng: getValues('sourceAddress')?.startLng ?? '',
        guestName: getValues('guestname') ?? '',
        mode: getValues('triptype') ?? '',
        refNumber: getValues('referenceno') ?? '',
        tourName: getValues('configuredRoute') ?? '',

        ...(['PVT', 'GRP']?.includes(tripType)
          ? { isCustomRoute: getValues('route') === 'Custom' ? 1 : 0 }
          : { isCustomRoute: 0 }),
        time: getValues('startdate')
          ? // ? convertTimeFormat(formatISTtoHHMM(getValues('startdate' as any)?.$d))
            convertISTToTimeZone(getValues('startdate' as any)?.$d, timezone)
          : null,
        startTimestamp: getValues('startdate')
          ? convertDatetoEpoch(getValues('startdate' as any)?.$d) / 1000
          : null,
        bufferTime: bufferTimeFormatted,
        ...(selectedRow?.journeyId ? { journeyId: selectedRow?.journeyId } : {})
      };
      const payload = {
        date: epochStartOfTodaySG,
        ...(selectedRow?.journeyId ? { journeyId: selectedRow?.journeyId } : {}),
        data: payloadData
      };
      setIsVehicleNumberEnable(true);
      if (vehicleType === 'Internal') {
        const res: any = await dispatch(getAdhocVehicle(payload));
        if (res?.payload?.data?.length === 0) {
          dispatch(
            updateToast({
              show: true,
              message:
                'Internal vehicle is not available. Please add an external vehicle.',
              severity: 'warning'
            })
          );
        }
      }
    }
  };

  const handleTransferVehicleDropdown = async (params: any) => {
    const standard = tripType === 'SIC' || tripType === 'TSIC';
    const bufferTimeFormatted =
      !standard && getValues('bufferTime' as any)?.$d
        ? formatISTtoTime(getValues('bufferTime' as any)?.$d)
        : null;

    const payloadData = {
      adultCount: getValues('adultcount'),
      agentName: getValues('agentname') ? getValues('agentname') : 0,
      childCount: getValues('childcount') ? getValues('childcount') : 0,
      date: getValues('tripDate') ? getValues('tripDate') : '',
      ...(getValues('destinationAddress' as any)
        ? {
            destination: getValues('destinationAddress' as any)?.destination || '',
            endLat: getValues('destinationAddress' as any)?.endLat || ' ',
            endLng: getValues('destinationAddress' as any)?.endLng || ''
          }
        : {}),
      ...(getValues('phone') &&
        getValues('phone')?.includes('-') &&
        getValues('phone')?.split('-')[1] && {
          guestContactNumber: getValues('phone')
        }),
      source: getValues('sourceAddress')?.source ?? '',
      startLat: getValues('sourceAddress')?.startLat ?? '',
      startLng: getValues('sourceAddress')?.startLng ?? '',
      guestName: getValues('guestname') ?? '',
      mode: getValues('triptype') ?? '',
      refNumber: getValues('referenceno') ?? '',
      tourName: getValues('configuredRoute') ?? '',
      ...(['PVT', 'GRP']?.includes(tripType)
        ? { isCustomRoute: getValues('route') === 'Custom' ? 1 : 0 }
        : { isCustomRoute: 0 }),
      time: getValues('startdate')
        ? // ? convertTimeFormat(formatISTtoHHMM(getValues('startdate' as any)?.$d))
          convertISTToTimeZone(getValues('startdate' as any)?.$d, timezone)
        : null,
      startTimestamp: getValues('startdate')
        ? convertDatetoEpoch(getValues('startdate' as any)?.$d) / 1000
        : null,
      bufferTime: bufferTimeFormatted,
      isExternalVehicle: vehicleType === 'Internal' ? 0 : 1,
      vehicleNumber: params?.id,
      seatingCapacity: params?.seatingCapacity,
      ...(selectedRow?.journeyId ? { journeyId: selectedRow?.journeyId } : {}),
      ...(params?.disposalPickupWindow
        ? { disposalPickupWindow: params?.disposalPickupWindow }
        : {})
    };

    const payload = {
      date: epochStartOfTodaySG,
      ...(selectedRow?.journeyId ? { journeyId: selectedRow?.journeyId } : {}),
      data: payloadData
    };

    if (
      (tripType === 'SIC' || tripType === 'TSIC') &&
      transferVehicleType === 'Internal'
    ) {
      const res: any = await dispatch(getAdhocTransferVehicle(payload));

      if (
        res?.payload?.data?.mainHotelResponses?.length > 0 &&
        res?.payload?.data?.transferVehicles?.length === 0
      ) {
        dispatch(
          updateToast({
            show: true,
            message:
              'Internal Transfer vehicle is not available. Please add an external vehicle.',
            severity: 'warning'
          })
        );
      }
    }
  };

  useEffect(() => {
    if (validationErrors.phone) {
      trigger('phone');
    }
  }, [validationErrors.phone]);

  useEffect(() => {
    if (validationErrors.contactNumber) {
      trigger('contactNumber');
    }
  }, [validationErrors.contactNumber]);

  useEffect(() => {
    if (validationErrors.transferContactNumber) {
      trigger('transferContactNumber');
    }
  }, [validationErrors.transferContactNumber]);

  useEffect(() => {
    if (driverName) setValue('driverName', driverName);
  }, [driverName]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const formattedToday = formatDate(today);
    setValue('tripDate', formattedToday);
    clearErrors('tripDate');
    setEpocvalue(dayjs(today).unix());
    if (!selectedRow) {
      setValue('route', 'Standard');
      setVehicleType('Internal');
      setValue('vehicleType', 'Internal');
      setPvtRoute('Standard');
      setValue('bufferTime', dayjs('00:20', 'HH:mm'));
    }
    const abortController = createAbort().abortCall;
    dispatch(autoPlannerAgentAction(abortController?.signal));
  }, []);

  return {
    handleValidate,
    handleClose,
    handleVehicleDropdown,
    handleTransferVehicleDropdown,
    validationErrors,
    setValidationErrorsMake
  };
};
