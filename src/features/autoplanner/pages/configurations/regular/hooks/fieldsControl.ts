import { useCallback, useEffect, useRef, useState } from 'react';
import {
  updateCenter,
  updateZoom
} from '../../../../../../common/redux/reducer/commonSlices/mapSlice';
import { useAppDispatch } from '../../../../../../app/redux/hooks';
import { findAddress, formatISTtoHHMM } from '../../../../../../utils/commonFunctions';
import dayjs from 'dayjs';
import { clearDrivers } from '../../../../redux/reducer/autoPlannerSlices/regularSlices';
import { daysOfWeek } from '../componentDatas/componentDatas';
import { useDebounce } from '../../../../../../common/hooks/useDebounce';

//custom hook  to handle location fields
const useMapLocation = (setValue: any, trigger: any) => {
  const dispatch = useAppDispatch();
  const [address, setAddress] = useState([]);

  const locationAddress = async (lat: any, lng: any) => {
    let fAdd = await findAddress(lat, lng);
    return fAdd;
  };

  const onLocationChange = (field: any, place: any, name: string) => {
    const { formatted_address, geometry } = place;

    if (formatted_address) {
      const location = {
        id: field,
        address: formatted_address,
        lat: geometry?.location?.lat(),
        lng: geometry?.location?.lng(),
        name: 'trip',
        info: { Mylocation: field === 'source' ? 'Pickup location' : 'Drop location' }
      };
      setAddress((prev: any) => {
        const existingFields = prev?.map((value: any) => value?.id);
        let updatedLocations: any = prev;

        if (existingFields?.includes(field)) {
          updatedLocations = prev?.map((item: any) => {
            if (item.id === field) {
              return { ...item, ...location };
            } else return item;
          });
        } else {
          updatedLocations = [...updatedLocations, location];
        }
        return updatedLocations;
      });
      setValue(name, {
        [field]: formatted_address,
        lat: geometry?.location?.lat(),
        lng: geometry?.location?.lng()
      });
      trigger(name);
    } else {
      setAddress((prev: any) => {
        const updatedLocations = prev?.filter((item: any) => item.id !== field);
        return updatedLocations;
      });
      setValue(name, {});
    }
  };

  const handleDragMarker = async (e: any, marker: any) => {
    const location = {
      address: await locationAddress(e?.latLng?.lat(), e?.latLng?.lng()),
      lat: e?.latLng?.lat(),
      lng: e?.latLng?.lng()
    };
    setAddress((prev: any) => {
      const updatedLocations = prev?.map((item: any) => {
        if (item.id === marker) {
          return { ...item, ...location };
        } else {
          return item;
        }
      });
      return updatedLocations;
    });
  };

  useEffect(() => {
    if (address?.length > 0) {
      dispatch(updateCenter(address));
      dispatch(updateZoom(address));
    }
  }, [address]);

  return { onLocationChange, address, handleDragMarker, setAddress };
};

//custom hook to handle time
const useTimeHandler = (setValue: any, setError: any, getValues: any, trigger: any) => {
  const [minTime, setMinTime] = useState<any>();
  const handleTimeChange = (date: any, name: string) => {
    setValue(name, date);
    // trigger(name);
    const time = formatISTtoHHMM(date);
    if (name === 'startTime') {
      trigger('startTime');
      setMinTime(
        dayjs()
          .set('hour', parseFloat(time.split(':')[0]))
          .set('minute', parseFloat(time.split(':')[1]) + 60)
      );
    } else if (name === 'endTime') {
      trigger('endTime');
    }

    if (getValues('startTime') >= getValues('endTime')) {
      setError('endTime', { type: 'custom', message: 'Invalid End Time.' });
    }
  };

  return { handleTimeChange, minTime };
};

//custom hook to fetch datas
const useFetchApi = ({ urls = [], clearUrls = [] }: any) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    urls?.forEach(({ url, payload }: any) => {
      if (payload) {
        dispatch(url(payload));
      } else {
        dispatch(url());
      }
    });

    return () => {
      clearUrls.forEach((element: any) => {
        dispatch(element());
      });
    };
  }, []);
};

//custom hook to handle field validations
const useValidations = (
  getValues: any,
  vehicles: any,
  getDrivers: any,
  filteredRow: any,
  setError: any,
  setValue: any
) => {
  const [noSeats, setNoSeats] = useState<boolean>(true);

  const dispatch = useAppDispatch();

  const isSeatingAvailable = () => {
    const selectedSeats = vehicles?.find(
      (item: any) => item.id === getValues('vehicle')
    )?.seatingCapacity;

    const seatAvailable = selectedSeats
      ? Number(getValues('adultCount') ?? 0) + Number(getValues('childCount') ?? 0) <=
        selectedSeats
      : true;
    setNoSeats(seatAvailable);
    setValue('seats', seatAvailable);
    return seatAvailable;
  };

  const isDriverAvailable = useDebounce(async () => {
    const {
      tourName,
      driver,
      destinationName,
      sourceName,
      childCount,
      adultCount,

      bufferTime,
      agentName,
      seats,
      ...rest
    } = getValues();
    setValue('driver', '');
    dispatch(clearDrivers());

    if (
      Object.values(rest)?.every((item: any) => Boolean(item)) &&
      getValues('endTime') > getValues('startTime') &&
      getValues('availableDays')?.length > 0
    ) {
      const {
        vehicle,
        startTime,
        endTime,
        availableDays,
        sourceAddress: { source, lat, lng },
        destinationAddress: { destination, lat: destLat, lng: destLng }
      } = rest;

      const payload = {
        time: formatISTtoHHMM(startTime),
        endTime: formatISTtoHHMM(endTime),
        bufferTime: bufferTime ? formatISTtoHHMM(bufferTime) : '00:00',
        vehicleNumber: vehicle,
        scheduledDays: availableDays
          ?.map((item: any) => item.id)
          ?.filter((value: any) => value !== 'selectAll'),
        source: {
          lat: lat,
          lng: lng,
          locationAddress: source,
          place: sourceName
        },
        destination: {
          lat: destLat,
          lng: destLng,
          locationAddress: destination,
          place: destinationName
        },
        ...(filteredRow ? { id: filteredRow.tourId } : '')
      };
      await dispatch(getDrivers(payload));
    }
  }, 1000);

  return { noSeats, isSeatingAvailable, isDriverAvailable };
};

//custom hook to handle form submit
const useFormSubmission = (
  URLs: any,
  setOpen: any,
  driverList: any,
  filteredRow: any,
  setPageNo: React.Dispatch<React.SetStateAction<number>>,
  setPageSize: React.Dispatch<React.SetStateAction<number>>
) => {
  const dispatch = useAppDispatch();
  const formSubmit = async (data: any) => {
    const {
      tourName,
      startTime,
      endTime,
      sourceName,
      destinationName,
      sourceAddress: { lat, lng, source },
      destinationAddress: { lat: destLat, lng: destLng, destination },
      adultCount,
      childCount,
      bufferTime,
      availableDays,
      vehicle,
      agentName,
      driver
    } = data;

    const currentDriver = driverList?.find((item: any) => item.id === driver);

    const payload = {
      mode: 'RLR',
      tourName: tourName,
      time: formatISTtoHHMM(startTime),
      endTime: formatISTtoHHMM(endTime),
      bufferTime: bufferTime ? formatISTtoHHMM(bufferTime) : null,
      source: {
        lat: lat,
        lng: lng,
        locationAddress: source,
        place: sourceName
      },
      destination: {
        lat: destLat,
        lng: destLng,
        locationAddress: destination,
        place: destinationName
      },
      adultCount: adultCount,
      childCount: childCount,
      scheduledDays: availableDays
        ?.map((item: any) => item.id)
        ?.filter((value: any) => value !== 'selectAll'),
      vehicleNumber: vehicle,
      agentName: agentName,
      driverID: currentDriver?.id,
      driverName: currentDriver?.label
    };
    if (filteredRow) {
      const response = await dispatch(
        URLs[2]?.url({ id: filteredRow.tourId, ...payload })
      );
      if (response?.payload?.status === 200) {
        setOpen(false);
        dispatch(URLs[1]?.url(URLs[1]?.payload));
        setPageNo(1);
        setPageSize(10);
      }
    } else {
      const response = await dispatch(URLs[0]?.url(payload));
      if (response?.payload?.status === 200) {
        setOpen(false);
        dispatch(URLs[1]?.url(URLs[1]?.payload));
        setPageNo(1);
        setPageSize(10);
      }
    }
  };

  return { formSubmit };
};

//custom hook to handle set values while update
const useSetFieldValues = (
  filteredRow: any,
  setValue: any,
  formFields: any,
  setAddress: any,
  getDriver: any,
  vehicles: any
) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (filteredRow && vehicles) {
      const {
        tourName,
        adultCount,
        agentName,
        childCount,
        driverID,
        source: { place, locationAddress, lat, lng },
        destination: {
          place: destName,
          locationAddress: destAddress,
          lat: destLat,
          lng: destLng
        },
        vehicleNumber,
        scheduledDays,
        bufferTime,
        time,
        endTime
      } = filteredRow;
      setValue('tourName', tourName);
      setValue('adultCount', adultCount);
      setValue('agentName', agentName);
      setValue('childCount', childCount);
      setValue('sourceName', place);
      setValue('destinationName', destName);
      setValue('sourceAddress', {
        source: locationAddress,
        lat: lat,
        lng: lng
      });
      setValue('destinationAddress', {
        destination: destAddress,
        lat: destLat,
        lng: destLng
      });
      setValue('vehicle', vehicleNumber === 'Unassigned' ? null : vehicleNumber);
      setValue('driver', driverID);
      const [selectAll, ...restDays] = daysOfWeek;
      const isAlldays = restDays?.every((item: any) => scheduledDays?.includes(item?.id));
      const availableDays = [
        ...(isAlldays ? [{ id: 'selectAll', label: 'Select All' }] : []),
        ...daysOfWeek?.filter((item: any) => scheduledDays?.includes(item?.id))
      ];
      setValue('availableDays', availableDays);
      setValue(
        'bufferTime',
        bufferTime
          ? (
              dayjs()
                .set('hour', parseFloat(bufferTime?.split(':')[0]))
                .set('minute', parseFloat(bufferTime?.split(':')[1])) as any
            ).$d
          : null
      );
      setValue(
        'startTime',
        (
          dayjs()
            .set('hour', parseFloat(time?.split(':')[0]))
            .set('minute', parseFloat(time?.split(':')[1])) as any
        ).$d
      );
      setValue(
        'endTime',
        (
          dayjs()
            .set('hour', parseFloat(endTime?.split(':')[0]))
            .set('minute', parseFloat(endTime?.split(':')[1])) as any
        ).$d
      );
      const vehicle = vehicles?.find((item: any) => item?.id === vehicleNumber) || {};

      const seatingCapacity = vehicle.seatingCapacity ?? 0;

      const seats =
        seatingCapacity > 0
          ? Number(adultCount ?? 0) + Number(childCount ?? 0) < seatingCapacity
          : true;

      setValue('seats', seats);
      setAddress([
        {
          id: 'source',
          address: locationAddress,
          lat: lat,
          lng: lng,
          name: 'trip',
          info: { Mylocation: 'Pickup location' }
        },
        {
          id: 'destination',
          address: destAddress,
          lat: destLat,
          lng: destLng,
          name: 'trip',
          info: { Mylocation: 'Drop location' }
        }
      ]);
      const { source, destination, tourId } = filteredRow;
      if (vehicleNumber !== 'Unassigned') {
        dispatch(
          getDriver({
            time,
            endTime,
            vehicleNumber,
            scheduledDays,
            bufferTime,
            source,
            destination,
            id: tourId
          })
        );
      }
    }
  }, [filteredRow, vehicles]);
};

export {
  useMapLocation,
  useTimeHandler,
  useFetchApi,
  useValidations,
  useFormSubmission,
  useSetFieldValues
};
