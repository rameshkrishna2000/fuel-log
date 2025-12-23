import { useEffect, useState } from 'react';

//Common Functionalities for the Adhoc Component
export const useAdHocCommonFunctions = ({
  adhocVehicle,
  tripType,
  data,
  Agents,
  setValue
}: any) => {
  const [tripMarker, setTripMarker] = useState<any>([]);
  const [destinationMarker, setDestinationMarker] = useState<any>([]);

  //Today time zone (SG)
  const epochStartOfTodaySG = Math.floor(
    new Date(
      new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore' }).format(
        new Date()
      ) + 'T00:00:00+08:00'
    ).getTime() / 1000
  );

  const adhocDropdown = adhocVehicle?.data
    ?.map((item: any) => ({
      id: item?.vehicleNumber,
      label: `${item?.vehicleNumber?.toUpperCase()} (${item?.seatingCapacity})`,
      seatingCapacity: item?.seatingCapacity,
      disposalPickupWindow: item?.disposalPickupWindow,
      // disposalPickupWindow: { start: '12:00', end: '12:30' },
      group: item?.isAssignedToTour ? 'Used Vehicles (R)' : 'Unused vehicles (A)'
    }))
    .sort((a: any, b: any) => a.group.localeCompare(b.group))
    .sort((value: any) => (value.group === 'Unused vehicles (A)' ? 1 : -1));

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
    if (
      data?.userId &&
      (data?.role === 'ROLE_AGENT' || data?.role === 'ROLE_SUB_AGENT')
    ) {
      // setValue('agentname', data?.userId);
      setValue('agentname', Agents[0]?.id);
    }
  }, [data, Agents]);

  return {
    epochStartOfTodaySG,
    adhocDropdown,
    tripMarker,
    setTripMarker,
    destinationMarker,
    setDestinationMarker
  };
};

// Common States for Addhoc compoenent
export const useAdHocCommonStates = () => {
  const [sourceAddress, setSourceAddress] = useState<any>(null);
  const [destinationAddress, setDestinationAddress] = useState<any>(null);
  const [tripType, setTripType] = useState<any>(null);
  const [timeReq, setTimeReq] = useState<any>(0);
  const [tourName, setTourName] = useState<any>(null);
  const [pvtRoute, setPvtRoute] = useState<any>('Custom');
  const [vehicleType, setVehicleType] = useState<any>('Internal');
  const [transferVehicleType, setTransferVehicleType] = useState<any>('Internal');
  const [isVehicleNumberEnable, setIsVehicleNumberEnable] = useState<any>(false);
  const [epocvalue, setEpocvalue] = useState<number | null>(null);

  return {
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
  };
};
