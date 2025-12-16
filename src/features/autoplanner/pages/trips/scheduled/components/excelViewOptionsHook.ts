import { capitalizeFirstLetter } from '../../../../../../utils/commonFunctions';

export const useExcelOptionsHook = ({
  selectedTripRow,
  transRow,
  vehicleListData,
  Agents,
  transferDrivers,
  Routes
}: any) => {
  const hotelLocationList = selectedTripRow
    ? selectedTripRow?.mainHotelResponses?.map((item: any) => ({
        id: item.coordinates.locationAddress,
        label: item.coordinates.locationAddress
      }))
    : transRow
    ? transRow?.mainHotelResponses?.map((item: any) => ({
        id: item.coordinates.locationAddress,
        label: item.coordinates.locationAddress
      }))
    : [];
  const vehicleList = vehicleListData?.map((item: any) => ({
    id: item,
    label: item?.toUpperCase()
  }));

  const agentNames =
    Agents?.map((value: string) => ({
      id: value,
      label: capitalizeFirstLetter(value)
    })) || [];

  const configuredRoute =
    Routes?.map((value: string) => ({
      id: value,
      label: value
    })) || [];

  const dropDriver =
    transferDrivers?.data?.map((driver: any) => ({
      id: driver.driverID,
      label: capitalizeFirstLetter(driver.driverName)
    })) || [];

  return {
    dropDriver,
    configuredRoute,
    agentNames,
    vehicleList,
    hotelLocationList
  };
};
