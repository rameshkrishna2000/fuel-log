import { Dialog, DialogProps, styled } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import {
  capitalizeFirstLetter,
  convertToEpoch2,
  debounce
} from '../../../../../../utils/commonFunctions';
import dayjs from 'dayjs';
import {
  map,
  updateCenter,
  updateZoom
} from '../../../../../../common/redux/reducer/commonSlices/mapSlice';
import {
  addFuelExcel,
  deleteDriverFuel,
  getAllDriverFuelDashboard,
  getPaymentDropdown,
  getStationDropdown,
  getTypeDropdown,
  getVehicleDriver
} from '../../../../../../common/redux/reducer/commonSlices/driverFuelSlice';
import { updateToast } from '../../../../../../common/redux/reducer/commonSlices/toastSlice';

export const useMemoDialog = ({ files }: any) => {
  const BlurryDialog = styled(Dialog)<DialogProps>(({ theme }) => ({
    backgroundColor: 'rgba(60, 60, 60, 0.5)'
  }));
  const MemoizedDialog = useCallback(BlurryDialog, [files?.length]);
  return { MemoizedDialog };
};

export const useFuelStates = () => {
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<any>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [imageCard, setImageCard] = useState<boolean>(false);
  const [files, setFiles] = useState<any[]>([]);
  const [clearLoading, setClearLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [isDateDisabled, setIsDateDisabled] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<any>();
  const [filterPayload, setFilterPayload] = useState<any>();
  const [pageNo, setPageNo] = useState(1);
  const [dataLoading, setDataLoading] = useState(true);
  const [gpsLocation, setGpsLocation] = useState<any>();
  const [load, setLoad] = useState<boolean>(false);
  const [report, setReport] = useState('');
  const [format, setFormat] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [searchValue, setSearchValue] = useState('');
  const [sorting, setSorting] = useState<any>(null);
  const [excelDownloadUrl, setExcelDownloadUrl] = useState<string>('');
  const [isMap, setIsMap] = useState(false);
  const [getStartDate, setGetStartDate] = useState<Date | null>(null);
  const [getEndDate, setGetEndDate] = useState<Date | null>(null);
  const [toDateDisabled, setToDateDisabled] = useState<boolean>(true);
  return {
    isDelete,
    setIsDelete,
    selectedId,
    setSelectedId,
    isOpen,
    setIsOpen,
    isUpdate,
    setIsUpdate,
    imageCard,
    setImageCard,
    files,
    setFiles,
    clearLoading,
    setClearLoading,
    filterLoading,
    setFilterLoading,
    isDateDisabled,
    setIsDateDisabled,
    selectedValue,
    setSelectedValue,
    filterPayload,
    setFilterPayload,
    pageNo,
    setPageNo,
    dataLoading,
    setDataLoading,
    gpsLocation,
    setGpsLocation,
    load,
    setLoad,
    report,
    setReport,
    format,
    setFormat,
    pageSize,
    setPageSize,
    searchValue,
    setSearchValue,
    sorting,
    setSorting,
    excelDownloadUrl,
    setExcelDownloadUrl,
    isMap,
    setIsMap,
    getStartDate,
    setGetStartDate,
    getEndDate,
    setGetEndDate,
    toDateDisabled,
    setToDateDisabled
  };
};

export const useFuelDropdowns = ({
  vehicleDriverData,
  typeDropdownData,
  stationDropdownData,
  paymentDropdownData
}: any) => {
  const vehicleDropdown =
    vehicleDriverData?.internalVehicleNumbers?.map((item: any) => ({
      id: item,
      label: item.toUpperCase()
    })) ?? [];

  const driverDropdown =
    vehicleDriverData?.internalDrivers?.map((item: any) => ({
      id: item,
      label: capitalizeFirstLetter(item)
    })) ?? [];

  const fuelTypeOptions =
    typeDropdownData?.map((item: any) => ({
      id: item?.name,
      label: capitalizeFirstLetter(item?.name)
    })) ?? [];

  const fuelStationOptions =
    stationDropdownData?.map((item: any) => ({
      id: item?.name,
      label: capitalizeFirstLetter(item?.name)
    })) ?? [];

  const paymentOptions =
    paymentDropdownData?.map((item: any) => ({
      id: item?.name,
      label: capitalizeFirstLetter(item?.name)
    })) ?? [];
  return {
    vehicleDropdown,
    driverDropdown,
    fuelTypeOptions,
    fuelStationOptions,
    paymentOptions
  };
};

export const useHandleMap = ({ setGpsLocation, dispatch }: any) => {
  const handleMap = (value: any) => {
    setGpsLocation({
      gpsLatitude: value?.gpsLatitude,
      gpsLongitude: value?.gpsLongitude
    });
    const marker = [
      {
        id: 'Gps Location',
        name: 'fuel',
        lat: value?.gpsLatitude,
        lng: value?.gpsLongitude,
        info: {
          Mylocation: `${value?.vehicleNumber}`
        }
      }
    ];
    dispatch(map(marker));
    dispatch(updateZoom(marker));
    dispatch(updateCenter(marker));
  };
  return { handleMap };
};

export const useFuelCardData = ({ dataMetric }: any) => {
  const arr = [
    {
      title: 'Total Entries',
      data: dataMetric?.totalFuelEntries ? dataMetric?.totalFuelEntries : 0,
      litres: 'Entries Logged',
      icon: 'streamline:graph-arrow-increase',
      gradient: 'linear-gradient(135deg, #fff3e8 0%, #ffefdf 100%)',
      iconColor: '#e07a3f'
    },
    {
      title: 'Total Quantity',
      data: dataMetric?.fuelLiters ? dataMetric?.fuelLiters : '0 L',
      litres: 'Total Volume',
      icon: 'lucide:fuel',
      gradient: 'linear-gradient(135deg, #eef5ff 0%, #e8f2ff 100%)',
      iconColor: '#4a7dc4'
    },
    {
      title: 'AdBlue Quantity',
      data: dataMetric?.adblueLiters ? dataMetric?.adblueLiters : '0 L',
      litres: 'Total Volume',
      icon: 'proicons:drop',
      gradient: 'linear-gradient(135deg, #fffbeb 0%, #fff7e0 100%)',
      iconColor: '#d4a017'
    },
    {
      title: 'Total Fuel Cost',
      data: dataMetric?.totalFuelCost ? `S$ ${dataMetric?.totalFuelCost}` : 'S$ 0',
      litres: 'Total Spent',
      icon: 'streamline:graph-arrow-increase',
      gradient: 'linear-gradient(135deg, #f5edff 0%, #f0e8ff 100%)',
      iconColor: '#8b5fc4'
    }
  ];
  return { arr };
};

export const useOnSubmit = ({
  setPageNo,
  setValue,
  setSearchValue,
  setSorting,
  setFilterLoading,
  setClearLoading,
  pageSize,
  setFilterPayload,
  dispatch,
  setIsDateDisabled
}: any) => {
  const onSubmit = async (data: any) => {
    setPageNo(1);
    setValue('search', '');
    setSearchValue('');
    setSorting(null);
    setFilterLoading(true);
    setClearLoading(false);
    const payload = {
      vehicleNumbers: data?.vehicleNumber?.map((item: any) => item.id) ?? [],
      drivers: data?.driver?.map((item: any) => item.id) ?? [],
      startTime: convertToEpoch2(data?.fromDate),
      endTime: convertToEpoch2(data?.toDate),
      paymentMethods: data?.paymentMethod?.map((item: any) => item.id) ?? [],
      fuelTypes: data?.fuelType?.map((item: any) => item.id) ?? [],
      fuelStations: data?.fuelStation?.map((item: any) => item.id) ?? [],
      pageNo: 1,
      pageSize: pageSize
    };
    setFilterPayload(payload);
    await dispatch(getAllDriverFuelDashboard(payload));
    setIsDateDisabled(false);
  };
  return { onSubmit };
};

export const useHandleImage = ({ setImageCard, setFiles }: any) => {
  const handleImage = (fileUrl: any, fileName: any) => {
    setImageCard(true);
    setFiles([{ url: fileUrl, name: fileName }]);
  };
  return { handleImage };
};

export const useHandleDelete = ({
  dispatch,
  getToday,
  setIsDelete,
  filterPayload,
  setPageNo
}: any) => {
  const handleDelete = async (id: any) => {
    if (id) {
      const action = await dispatch(deleteDriverFuel(id));
      if (deleteDriverFuel.fulfilled.type === action.type) {
        setPageNo(1);
        await dispatch(getAllDriverFuelDashboard(filterPayload));
        setIsDelete(false);
      }
    }
  };
  return { handleDelete };
};

export const useGetToday = ({
  setPageNo,
  timezone,
  setGetStartDate,
  setValue,
  setGetEndDate,
  pageSize,
  setFilterPayload,
  dispatch
}: any) => {
  const getToday = async () => {
    setPageNo(1);
    const today = dayjs().tz(timezone);
    const start = today.startOf('day').toDate();
    const end = today.toDate();
    setGetStartDate(start);
    setValue('fromDate', start);
    setGetEndDate(end);
    setValue('toDate', end);
    const payload = {
      pageNo: 1,
      pageSize: pageSize,
      startTime: convertToEpoch2(start),
      endTime: convertToEpoch2(end)
    };
    setFilterPayload(payload);
    await dispatch(getAllDriverFuelDashboard(payload));
  };
  return { getToday };
};

export const useHandleClear = ({
  setClearLoading,
  setFilterLoading,
  getToday,
  setValue
}: any) => {
  const handleClear = () => {
    setClearLoading(true);
    setFilterLoading(false);
    getToday();
    setValue('vehicleNumber', null);
    setValue('driver', null);
    setValue('fuelType', null);
    setValue('fuelStation', null);
    setValue('paymentMethod', null);
  };
  return { handleClear };
};

export const useHandleCustom = ({
  setToDateDisabled,
  setValue,
  setGetStartDate,
  clearErrors,
  setGetEndDate
}: any) => {
  const handleCustomFrom = (start: Date, end: Date) => {
    if (start) {
      setToDateDisabled(false);
    }
    setValue('fromDate', start);
    setGetStartDate(start);
    setValue('toDate', end);
    clearErrors('fromDate');
    clearErrors('toDate');
    setGetEndDate(end);
  };

  const handleCustomTo = (start: Date, end: Date) => {
    setValue('fromDate', start);
    setGetStartDate(start);
    setValue('toDate', end);
    setGetEndDate(end);
    clearErrors('fromDate');
    clearErrors('toDate');
  };
  return { handleCustomFrom, handleCustomTo };
};

export const useHandleDate = ({
  setGetStartDate,
  setValue,
  setGetEndDate,
  trigger,
  setToDateDisabled,
  getStartDate,
  dispatch
}: any) => {
  const handleFromDate = (date: any) => {
    if (!date && date?.$d == 'Invalid Date') return;
    setGetStartDate(date?.$d);
    const fromDate: number | null = convertToEpoch2(date?.$d);
    setValue('fromDate', date?.$d);

    setGetEndDate(new Date(date?.$d?.getTime() + 1000 * 600));
    setValue('toDate', new Date(date?.$d?.getTime() + 1000 * 600));
    trigger('toDate');
    trigger('toDate');
    if (date) {
      setToDateDisabled(false);
    }
  };

  const handleToDate = (date: any) => {
    if (getStartDate === null) {
      setGetEndDate(date?.$d);
      setValue('toDate', date?.$d);
      trigger('toDate');
      dispatch(
        updateToast({
          show: true,
          message: 'Please select "From Date"',
          severity: 'error'
        })
      );
    } else {
      setGetEndDate(date.$d);
      setValue('toDate', date?.$d);
      trigger('toDate');
    }
    const toDate: number | null = convertToEpoch2(date?.$d);
  };
  return { handleFromDate, handleToDate };
};

export const useHandleSettings = ({ navigate }: any) => {
  const handleSettings = () => {
    navigate('/fuel-settings');
  };
  return { handleSettings };
};

export const useReportDownload = ({
  setFormat,
  setLoad,
  setReport,
  dispatch,
  filterPayload
}: any) => {
  const reportDownload = async (docType: string) => {
    setFormat(docType);
    setLoad(true);
    setReport('Fuel');

    await dispatch(addFuelExcel(filterPayload));
    setLoad(false);
  };
  return { reportDownload };
};

export const useHandlePagination = ({
  setDataLoading,
  setPageNo,
  setPageSize,
  filterPayload,
  searchValue,
  sorting,
  dispatch
}: any) => {
  const handlePagination = async (newModel: any) => {
    setDataLoading(false);
    const { page: newPageNo, pageSize: newPageSize } = newModel;
    setPageNo(newPageNo + 1);
    setPageSize(newPageSize);
    const payload = {
      ...filterPayload,
      pageNo: newPageNo + 1,
      pageSize: newPageSize,
      search: searchValue,
      sortBy: sorting?.sortBy,
      sortByField: sorting?.sortByField
    };
    await dispatch(getAllDriverFuelDashboard(payload));
  };
  return { handlePagination };
};

export const useHandleSearch = ({
  setSearchValue,
  setValue,
  setPageNo,
  filterPayload,
  pageSize,
  sorting,
  dispatch,
  setDataLoading
}: any) => {
  const debouncedSearch = debounce(async (value: any) => {
    setSearchValue(value);
    setValue('search', value);
    setPageNo(1);
    const payload = {
      ...filterPayload,
      pageNo: 1,
      pageSize: pageSize,
      search: value,
      sortBy: sorting?.sortBy,
      sortByField: sorting?.sortByField
    };
    await dispatch(getAllDriverFuelDashboard(payload));
  }, 1000);

  const handleSearchChange = (value: any) => {
    setDataLoading(false);
    debouncedSearch(value);
  };
  return { handleSearchChange };
};

export const useHandleSort = ({
  setDataLoading,
  setPageNo,
  setSorting,
  filterPayload,
  pageSize,
  searchValue,
  dispatch
}: any) => {
  const handleSortChange = async (sortModel: any) => {
    setDataLoading(false);
    if (sortModel.length === 0) {
      setSorting(null);
      setPageNo(1);
      const payload = {
        ...filterPayload,
        pageNo: 1,
        pageSize: pageSize,
        search: searchValue
      };
      await dispatch(getAllDriverFuelDashboard(payload));
      return;
    }
    const [{ field, sort }] = sortModel;
    setPageNo(1);
    setSorting({
      sortBy: sort.toUpperCase(),
      sortByField: field
    });
    const payload = {
      ...filterPayload,
      pageNo: 1,
      pageSize: pageSize,
      search: searchValue,
      sortBy: sort.toUpperCase(),
      sortByField: field
    };
    await dispatch(getAllDriverFuelDashboard(payload));
  };
  return { handleSortChange };
};

export const useFuelEffects = ({ getToday, dispatch }: any) => {
  useEffect(() => {
    getToday();
    dispatch(getVehicleDriver());
    dispatch(getTypeDropdown());
    dispatch(getStationDropdown());
    dispatch(getPaymentDropdown());
  }, []);
};
