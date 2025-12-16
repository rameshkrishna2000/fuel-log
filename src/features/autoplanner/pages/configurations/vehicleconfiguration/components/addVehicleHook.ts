import { useEffect, useState } from 'react';
import {
  imeiDropdownAction,
  planIdDropdownAction,
  simDropdownAction,
  vehicleMakeDropdownAction,
  vehicleModelDropdownAction
} from './vehicleOnboard';

export const useDropdownOptions = ({
  IMEI,
  planID,
  SIM,
  vehicleMakeDrop,
  year,
  vehicleModelDrop,
  subtypeDropdown
}: any) => {
  const vehicleType = (() => [
    { id: 'coach', label: 'Coach' },
    { id: 'bus', label: 'Bus' },
    { id: 'mini van', label: 'Mini van' },
    { id: 'comfy', label: 'Comfy' }
  ])();

  const mode = (() => [
    { id: 'selectAll', label: 'Select All', checked: false },
    { id: 'PVT', label: 'PVT' },
    { id: 'SIC', label: 'SIC' },
    { id: 'TSIC', label: 'TSIC' },
    { id: 'GRP', label: 'GRP' },
    { id: 'RLR', label: 'RLR' },
    { id: 'TRANSFER', label: 'TRANSFER' }
  ])();

  const mapToDropdown = (arr: any) => arr?.map((v: any) => ({ id: v, label: v })) ?? [];

  const imeiNumber = mapToDropdown(IMEI);
  const planIdDropdown = mapToDropdown(planID);
  const simNumber = mapToDropdown(SIM);
  const dropdownMake = mapToDropdown(vehicleMakeDrop);
  const yearDrop = mapToDropdown(year);
  const vehiModel = mapToDropdown(vehicleModelDrop);
  const subtype = mapToDropdown(subtypeDropdown);

  return ((o: any) => o)({
    vehicleType,
    mode,
    subtype,
    vehiModel,
    yearDrop,
    dropdownMake,
    simNumber,
    planIdDropdown,
    imeiNumber
  });
};

export const useSliderFunctions = ({ setValue, trigger }: any) => {
  const [freewaySpeedLimit, setFreewaySpeedLimit] = useState(90.0);
  const [nonFreewaySpeedLimit, setNonFreewaySpeedLimit] = useState(70.0);

  const handleFreewaySpeedChange = (newValue: any) => {
    setFreewaySpeedLimit(newValue);
    setValue('freewaySpeedLimit', newValue);

    trigger('freewaySpeedLimit');
  };

  const handleNonFreewaySpeedChange = (newValue: any) => {
    setNonFreewaySpeedLimit(newValue);
    setValue('nonFreewaySpeedLimit', newValue);

    trigger('nonFreewaySpeedLimit');
  };

  return {
    handleFreewaySpeedChange,
    setFreewaySpeedLimit,
    setNonFreewaySpeedLimit,
    handleNonFreewaySpeedChange,
    freewaySpeedLimit,
    nonFreewaySpeedLimit
  };
};

export const useCommanVehicleAddHook = () => {
  const [istracking, setistracking] = useState('notIstracking');
  const [vehicleMake, setVehicleMake] = useState('');
  const [seatCapacity, setSeatCapacity] = useState(0);
  const [absoluteSeating, setAbsoluteSeating] = useState(0);
  const [vehicleModel, setVehicleModel] = useState('');

  return (() => ({
    istracking,
    setistracking,
    vehicleMake,
    setVehicleMake,
    seatCapacity,
    setSeatCapacity,
    absoluteSeating,
    setAbsoluteSeating,
    vehicleModel,
    setVehicleModel
  }))();
};

export const useRenderHook = ({ selectedRow, dispatch, VehicleMakeApi, model }: any) => {
  const [vehicleMakeDrop, setVehicleMakeDrop] = useState<any>([]);
  const [vehicleModelDrop, setVehicleModelDrop] = useState<any>([]);
  const [year, setYear] = useState<any>([]);
  const [subtypeDropdown, setSubtypeDropdown] = useState<any>([]);

  // useEffect(() => {
  //   const payload = {
  //     vehicleNumber: selectedRow?.vehicleNumber || ''
  //   };
  //   dispatch(imeiDropdownAction(payload));
  //   dispatch(simDropdownAction(payload));
  //   dispatch(planIdDropdownAction());
  //   dispatch(vehicleMakeDropdownAction());
  // }, []);
  useEffect(() => {
    if (VehicleMakeApi?.vehicleMake) {
      setVehicleMakeDrop(VehicleMakeApi?.vehicleMake);
    }
  }, [VehicleMakeApi?.vehicleMake]);

  useEffect(() => {
    if (model?.vehicleModel) {
      setVehicleModelDrop(model?.vehicleModel);
    }
  }, [model]);

  useEffect(() => {
    if (model?.manufacturedYear) {
      setYear(model?.manufacturedYear);
    }
  }, [model]);

  useEffect(() => {
    if (model?.subType) {
      setSubtypeDropdown(model?.subType);
    }
  }, [model]);

  useEffect(() => {
    if (selectedRow) {
      const payload = {
        vehicleMake: selectedRow?.vehicleMake || ''
      };
      dispatch(vehicleModelDropdownAction(payload));
      const payloads = {
        vehicleMake: selectedRow.vehicleMake || '',
        vehicleModel: selectedRow.vehicleModel || ''
      };
      dispatch(vehicleModelDropdownAction(payloads));
      const payloadss = {
        vehicleMake: selectedRow.vehicleMake || '',
        vehicleModel: selectedRow.vehicleModel || '',
        manufacturedyear: selectedRow.manufacturedYear || ''
      };
      dispatch(vehicleModelDropdownAction(payloadss));
    }
  }, [selectedRow]);

  return {
    vehicleMakeDrop,
    year,
    vehicleModelDrop,
    subtypeDropdown
  };
};

export const useSetvalue = ({
  setValue,
  selectedRow,
  setistracking,
  trigger,
  setAbsoluteSeating,
  setSeatCapacity,
  setFreewaySpeedLimit,
  setNonFreewaySpeedLimit
}: any) => {
  useEffect(() => {
    if (selectedRow?.id) {
      setValue('vehicleNumber', selectedRow?.vehicleNumber);
      const seatingPercentage = Math.round(
        (selectedRow?.preferredSeating / selectedRow?.absoluteSeating) * 100
      );
      const tripModes = selectedRow?.tripModes?.map((mode: string) => ({
        id: mode,
        label: mode
      }));
      setistracking(selectedRow.isTracking ? 'istracking' : 'notIstracking');
      setValue('istracking', selectedRow.isTracking ? 'istracking' : 'notIstracking');
      setValue('tripMode', tripModes);
      setValue('vehicleType', selectedRow?.vehicleType);
      setValue('imeiNumber', selectedRow?.imeiNumber || '');
      setValue('simNumber', selectedRow?.simNumber || '');
      setValue('planId', selectedRow?.planId || '');
      setValue('vehicleMake', selectedRow?.vehicleMake || '');
      setValue('vehicleModel', selectedRow?.vehicleModel || '');
      setValue('manufacturedYear', selectedRow?.manufacturedYear || '');
      setValue('subType', selectedRow?.subType || '');
      trigger('tripMode');
      setValue('absoluteSeating', selectedRow?.absoluteSeating);
      setValue('seating', selectedRow?.preferredSeating);
      setSeatCapacity(seatingPercentage);
      setAbsoluteSeating(selectedRow?.absoluteSeating);
      setValue('averageSpeed', selectedRow?.standardSpeedLimit);
      setValue('freewaySpeedLimit', selectedRow?.freewaySpeedLimit);
      setValue('nonFreewaySpeedLimit', selectedRow?.nonFreewaySpeedLimit);
      setFreewaySpeedLimit(selectedRow?.freewaySpeedLimit);
      setNonFreewaySpeedLimit(selectedRow?.nonFreewaySpeedLimit);
    } else {
      setValue('vehicleNumber', '');
      setValue('tripMode', []);
      setValue('vehicleType', '');
    }
  }, [selectedRow, open]);
};
