import { useCallback, useEffect, useState } from 'react';
import {
  capitalizeFirstLetter,
  debounce,
  findAddress
} from '../../../../../utils/commonFunctions';
import {
  autoPlannerAgentAction,
  clearContactError,
  clearDriverName,
  externalvehicleAction
} from '../../../redux/reducer/autoPlannerSlices/autoplanner';
import {
  updateCenter,
  updateZoom
} from '../../../../../common/redux/reducer/commonSlices/mapSlice';
import dayjs from 'dayjs';

export const usePvtGrpUpdateHook = () => {
  const [sourceAddress, setSourceAddress] = useState<any>(null);
  const [destinationAddress, setDestinationAddress] = useState<any>(null);
  const [tripMarker, setTripMarker] = useState<any>([]);
  const [external, setExternal] = useState<boolean>(true);
  const [isDrag, setIsDrag] = useState<boolean>(false);
  const [seatCapacity, setSeatCapacity] = useState<any>(0);
  const [validationErrors, setValidationErrorsMake] = useState<any>(null);

  return {
    sourceAddress,
    setSourceAddress,
    destinationAddress,
    setDestinationAddress,
    tripMarker,
    setTripMarker,
    external,
    setExternal,
    isDrag,
    setIsDrag,
    seatCapacity,
    setSeatCapacity,
    validationErrors,
    setValidationErrorsMake
  };
};

export const usePvtGrpOptions = ({
  AgentsDropdown,
  dropDownData,
  selectedTripRow
}: any) => {
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

  if (selectedTripRow?.vehicleNumber !== 'Unassigned') {
    const vehicleNumber = selectedTripRow?.vehicleNumber;
    if (!standardVehicles?.some((vehicle: any) => vehicle?.id === vehicleNumber)) {
      standardVehicles.push({
        id: vehicleNumber,
        label: vehicleNumber?.toUpperCase()
      });
    }
  }

  return {
    agentNames,
    standardVehicles
  };
};

export const usePvtGrpEffects = ({
  dispatch,
  data,
  destinationAddress,
  setValue,
  createAbort,
  sourceAddress,
  trigger,
  validationErrors,
  autoplannerID,
  tripMode,
  selectedTripRow,
  setExternal,
  setTripMarker,
  setSourceAddress,
  setDestinationAddress,
  clearErrors,
  getStandardVehicles,
  tripMarker
}: any) => {
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
    const signal = createAbort().abortCall.signal;
    dispatch(autoPlannerAgentAction(signal));
  }, []);

  useEffect(() => {
    return () => {
      dispatch(clearContactError());
    };
  }, []);

  useEffect(() => {
    if (validationErrors?.phone) trigger('phone');
    if (validationErrors?.driverNumber) trigger('driverNumber');
  }, [validationErrors]);

  useEffect(() => {
    const payload = {
      autoplannerID: autoplannerID,
      tripMode: tripMode,
      tourName: selectedTripRow?.journeyId,
      totalPassengers: selectedTripRow?.adultCount + selectedTripRow?.childCount,
      vehicleNumber:
        selectedTripRow?.vehicleNumber === 'Unassigned'
          ? ''
          : selectedTripRow?.vehicleNumber,
      journeyId: selectedTripRow?.journeyId
    };
    dispatch(getStandardVehicles(payload));
  }, []);

  useEffect(() => {
    if (selectedTripRow) {
      const timeValue = selectedTripRow?.time ?? selectedTripRow?.returnTime ?? '00:00';
      setValue(
        'time',
        dayjs()
          .set('hour', timeValue.split(':')[0].trim())
          .set('minute', timeValue.split(':')[1].trim())
      );
      setValue('agentName', selectedTripRow?.agentName);
      setValue(
        'vehicle',
        selectedTripRow?.isExternalVehicle === 1 ? 'external' : 'internal'
      );
      setExternal(selectedTripRow?.isExternalVehicle !== 1);
      setValue('driverNumber', selectedTripRow?.driverContactNumber);
      setValue('passengerCount', selectedTripRow?.seatingCapacity);
      setValue('driverName', selectedTripRow?.driverName);
      setValue('guestName', selectedTripRow?.guestName);
      setValue('adultCount', selectedTripRow?.adultCount);
      setValue('childCount', selectedTripRow?.childCount);
      setValue('refNumber', selectedTripRow?.refNumber);
      setValue('vehicleNumber', selectedTripRow?.vehicleNumber);
      setValue('tourName', selectedTripRow?.tourName);
      setValue('tourORdestination', selectedTripRow.destination);

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
            lat: () => selectedTripRow?.startLat,
            lng: () => selectedTripRow?.startLng
          }
        },
        formatted_address: selectedTripRow?.source
      });

      setDestinationAddress({
        geometry: {
          location: {
            lat: () => selectedTripRow?.endLat,
            lng: () => selectedTripRow?.endLng
          }
        },
        formatted_address: selectedTripRow?.destination
      });
    }
  }, [selectedTripRow]);

  useEffect(() => {
    if (sourceAddress) {
      setValue('sourceAddress', {
        source: sourceAddress?.formatted_address,
        startLat: sourceAddress?.geometry?.location?.lat(),
        startLng: sourceAddress?.geometry?.location?.lng()
      });
      clearErrors('sourceAddress');

      if (tripMarker?.length <= 1) {
        setTripMarker([
          {
            id: 'source',
            lat: sourceAddress?.geometry?.location?.lat(),
            lng: sourceAddress?.geometry?.location?.lng(),
            name: 'trip',
            info: { Mylocation: 'source' }
          }
        ]);
      } else {
        setTripMarker((prev: any) =>
          prev.map((marker: any) =>
            marker?.id === 'source'
              ? {
                  ...marker,
                  lat: sourceAddress?.geometry?.location?.lat(),
                  lng: sourceAddress?.geometry?.location?.lng()
                }
              : marker
          )
        );
      }
    }
  }, [sourceAddress]);

  useEffect(() => {
    if (destinationAddress) {
      setValue('destinationAddress', {
        destination: destinationAddress?.formatted_address,
        endLat: destinationAddress?.geometry?.location?.lat(),
        endLng: destinationAddress?.geometry?.location?.lng()
      });
      clearErrors('destinationAddress');

      if (tripMarker?.length <= 1) {
        setTripMarker([
          {
            id: 'destination',
            lat: destinationAddress?.geometry?.location?.lat(),
            lng: destinationAddress?.geometry?.location?.lng(),
            name: 'trip',
            info: { Mylocation: 'destination' }
          }
        ]);
      } else {
        setTripMarker((prev: any) =>
          prev.map((marker: any) =>
            marker?.id === 'destination'
              ? {
                  ...marker,
                  lat: destinationAddress?.geometry?.location?.lat(),
                  lng: destinationAddress?.geometry?.location?.lng()
                }
              : marker
          )
        );
      }
    }
  }, [destinationAddress]);

  useEffect(() => {
    if (sourceAddress && destinationAddress) {
      setTripMarker([
        {
          id: 'source',
          lat: sourceAddress?.geometry?.location?.lat(),
          lng: sourceAddress?.geometry?.location?.lng(),
          name: 'trip',
          info: { Mylocation: 'source' }
        },
        {
          id: 'destination',
          lat: destinationAddress?.geometry?.location?.lat(),
          lng: destinationAddress?.geometry?.location?.lng(),
          name: 'trip',
          info: { Mylocation: 'destination' }
        }
      ]);
    }
  }, [sourceAddress, destinationAddress]);

  return {
    setTripMarker,
    setSourceAddress,
    setDestinationAddress
  };
};

export const usePvtGrpUpdateActions = ({
  setIsOpen,
  reset,
  dispatch,
  setSourceAddress,
  setDestinationAddress,
  setValue,
  setValidationErrorsMake,
  contactNumberValidation,
  autoplannerID
}: any) => {
  const address = async (lat: any, lng: any) => {
    let fAdd = findAddress(lat, lng);
    return fAdd;
  };
  const handleClose = () => {
    setIsOpen(false);
    reset();
    dispatch(clearDriverName());
  };

  const handleMarkerDrag = async (e: any, marker: any) => {
    const lat = e?.latLng?.lat();
    const lng = e?.latLng?.lng();
    const newAddress = await address(lat, lng);

    if (marker === 'source') {
      setSourceAddress({
        geometry: {
          location: { lat: () => lat, lng: () => lng }
        },
        formatted_address: newAddress
      });
    } else if (marker === 'destination') {
      setDestinationAddress({
        geometry: {
          location: { lat: () => lat, lng: () => lng }
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
      const res = await dispatch(externalvehicleAction(payload));
      setValidationErrorsMake((prev: any) => ({
        ...prev,
        [field]:
          res?.payload?.status !== 200 && res?.payload?.status != 'Success'
            ? res?.payload?.response?.data?.message
            : 'No Error'
      }));

      if (res.type === externalvehicleAction.fulfilled.type) {
        if (res.payload.data) setValue('driverName', res.payload.data);
      }
    }),
    [dispatch, contactNumberValidation, setValidationErrorsMake, autoplannerID]
  );

  return {
    handleClose,
    handleMarkerDrag,
    handleValidate
  };
};
