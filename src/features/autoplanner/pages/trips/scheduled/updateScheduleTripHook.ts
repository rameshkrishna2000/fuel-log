import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { getStandardVehicles } from '../../../redux/reducer/autoPlannerSlices/autoGenerateSlice';
import { formatISTtoTime } from '../../../../../utils/commonFunctions';
import { debounce } from 'lodash';
import { useAppDispatch } from '../../../../../app/redux/hooks';
import {
  clearDriverName,
  contactNumberValidation,
  externalvehicleAction
} from '../../../redux/reducer/autoPlannerSlices/autoplanner';

export const useUpdateScheduledStates = () => {
  const [minPickTime, setMinPickTime] = useState<Dayjs | undefined>(undefined);
  const [maxPickTime, setMaxPickTime] = useState<Dayjs | undefined>(undefined);
  const [external, setExternal] = useState<boolean>(true);
  const [timeDif, setTimeDif] = useState<number>(0);
  const [validationErrors, setValidationErrorsMake] = useState<any>({
    driverNumber: 'no-error'
  });

  return {
    minPickTime,
    setMinPickTime,
    maxPickTime,
    setMaxPickTime,
    external,
    setExternal,
    timeDif,
    setTimeDif,
    validationErrors,
    setValidationErrorsMake
  };
};

export const useUpdateScheduleEffect = ({
  validationErrors,
  trigger,
  autoplannerID,
  tripMode,
  selectedRow,
  dispatch,
  setTimeDif,
  getTimeDifferenceInMinutes,
  setValue,
  setExternal,
  getValues,
  handleMinTime
}: any) => {
  useEffect(() => {
    if (validationErrors.driverNumber) {
      trigger('driverNumber');
    }
  }, [validationErrors.driverNumber]);

  useEffect(() => {
    const payload = {
      autoplannerID: autoplannerID,
      tripMode: tripMode,
      tourName: selectedRow?.tourName,
      totalPassengers: selectedRow?.netCount,
      vehicleNumber: selectedRow?.vehicleNumber.toUpperCase(),
      journeyId: selectedRow?.journeyId ? selectedRow?.journeyId : ''
    };
    dispatch(getStandardVehicles(payload));
  }, []);

  useEffect(() => {
    if (selectedRow?.id) {
      const pickupWindow = selectedRow?.pickupWindow;
      if (pickupWindow) {
        const [startTime, endTime] = pickupWindow?.split('-');
        setTimeDif(getTimeDifferenceInMinutes(startTime, endTime));
        if (startTime && endTime) {
          setValue(
            'picktime1',
            dayjs()
              .set('hour', startTime?.split(':')[0])
              .set('minute', startTime?.split(':')[1])
              .toDate()
          );
          setValue(
            'picktime2',
            dayjs()
              .set('hour', endTime?.split(':')[0])
              .set('minute', endTime?.split(':')[1])
              .toDate()
          );
        }
        setValue(
          'vehicle',
          selectedRow.isExternalVehicle === 1 ? 'external' : 'internal'
        );
        if (selectedRow.isExternalVehicle === 1) {
          setExternal(false);
        }
        if (selectedRow.vehicleNumberUpper?.toLowerCase() !== 'unassigned') {
          setValue('vehicleNumber', selectedRow.vehicleNumberUpper?.toLowerCase());
        }
        if (selectedRow.driverName?.toLowerCase() !== 'unassigned') {
          setValue('driverName', selectedRow.driverName);
        }
        setValue('passengerCount', selectedRow.seatingCapacity);
        if (selectedRow.driverContactNumber?.toLowerCase() !== 'unassigned') {
          setValue('driverNumber', selectedRow.driverContactNumber);
        }
      }

      const returnTime =
        selectedRow?.returnTime !== null ? selectedRow?.returnTime : '00:00';
      setValue(
        'returnTime',
        dayjs()
          .set('hour', returnTime?.split(':')[0])
          .set('minute', returnTime?.split(':')[1])
      );

      // setValue('vehicleNumber', selectedRow.vehicleNumberUpper);
    }
  }, [selectedRow]);

  useEffect(() => {
    if (getValues('picktime1')) {
      const initialPickTime: any = getValues('picktime1');
      handleMinTime(initialPickTime, 'pickup');
    }
  }, [getValues('picktime1')]);
};

export const useUpdateScheduleTripActions = ({
  setValidationErrorsMake,
  setIsUpdate,
  reset,
  setMinPickTime,
  setMaxPickTime,
  setValue,
  autoplannerID
}: any) => {
  const dispatch = useAppDispatch();
  const handleClose = () => {
    setValidationErrorsMake({ driverNumber: '' });
    reset();
    setIsUpdate(false);
    dispatch(clearDriverName());
  };

  const handleValidate = useCallback(
    debounce(async (event: any, field: string) => {
      setValue('driverName', '');
      const payload = {
        mobileNumber: event,
        autoplannerId: autoplannerID
      };
      const response: any = await dispatch(externalvehicleAction(payload));
      if (response.type === externalvehicleAction.fulfilled.type) {
        if (response.payload.data) setValue('driverName', response.payload.data);
      }
      setValidationErrorsMake((prev: any) => ({
        ...prev,
        [field]:
          response?.payload?.status !== 200 && response?.payload?.status != 'Success'
            ? response?.payload?.response?.data?.message
            : 'no-error'
      }));
    }, 200),
    [autoplannerID]
  );

  const handleMinTime = (event: string, type: string) => {
    const time = formatISTtoTime(event);
    if (type === 'pickup') {
      setMinPickTime(
        dayjs()
          .set('hour', parseFloat(time.split(':')[0]))
          .set('minute', parseFloat(time.split(':')[1]) + 30)
      );
      setMaxPickTime(
        dayjs()
          .set('hour', parseFloat(time.split(':')[0]))
          .set('minute', parseFloat(time.split(':')[1]) + 30)
      );
    }
  };
  return {
    handleClose,
    handleMinTime,
    handleValidate
  };
};

export const useUpdateScheduleOptions = (data: any) => {
  const standardVehicles =
    data?.length > 0
      ? data?.map((value: string, index: number) => ({
          id: value,
          label: value.toUpperCase()
        }))
      : [];

  return {
    standardVehicles
  };
};
