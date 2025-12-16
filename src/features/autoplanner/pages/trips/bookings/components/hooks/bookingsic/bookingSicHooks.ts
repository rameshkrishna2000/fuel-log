import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useAppDispatch } from '../../../../../../../../app/redux/hooks';
import {
  autoPlannerBookingAction,
  autoPlannerDeleteAction,
  autoPlannerTripsAction
} from '../../../../../../redux/reducer/autoPlannerSlices/autoplanner';
import {
  convertEpochToDateString,
  convertTo12HourFormat,
  debounce
} from '../../../../../../../../utils/commonFunctions';

interface Row {
  id: number;
  agentname: string;
  guestname: string;
  fromlocation: string;
  tolocation: string;
  startDateTime: string;
  adultcount: number;
  childcount: number;
  referenceid: number;
  tripType: string;
  source: string;
  startLat: number;
  startLng: number;
  target: string;
  passengerJourneys: any[];
  targetLat: number;
  targetLng: number;
  groupId: string;
  startTimestamp?: number;
}

interface PaginationModel {
  page: number;
  pageSize: number;
}

export const useCommonStatesSIC = ({ pageSizes }: any) => {
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [isDialog, setIsDialog] = useState('');
  const [pageSize, setPageSize] = useState(pageSizes || 20);
  const [tripsRows, setTripsRows] = useState<Row[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [IsrowCount, setIsRowCount] = useState(0);
  const [sortModel, setSortModel] = useState<any>([]);
  const [tripsGroupRows, setGroupTripsRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState('');

  return {
    selectedGroup,
    setSelectedGroup,
    isDialog,
    setIsDialog,
    pageSize,
    setPageSize,
    tripsRows,
    setTripsRows,
    pageNo,
    setPageNo,
    IsrowCount,
    setIsRowCount,
    sortModel,
    setSortModel,
    tripsGroupRows,
    setGroupTripsRows,
    filter,
    setFilter
  };
};

export const useCommonFunctionSIC = ({
  setSelectedGroup,
  agentName,
  setSortModel,
  payloads,
  setPageNo,
  setPageSize,
  setFilter,
  pageSize,
  setPageSizes,
  setBreadCrumbs,
  tripsData,
  pageNo
}: any) => {
  const dispatch = useAppDispatch();
  const [view, setView] = useState<boolean>(false);
  const [rows, setRows] = useState([]);
  const [IspageNo, setIsPageNo] = useState(1);
  const [IspageSize, setIsPageSize] = useState(20);
  const [tripPayload, setTripPayload] = useState<any>({ pageNo, pageSize });
  const [rowCount, setRowCount] = useState(0);
  const [bookingsPayload, setBookingsPayload] = useState<any>(null);

  const handleViewGroupTrip = (event: React.MouseEvent<HTMLElement>, params: any) => {
    if (params !== null) {
      setSelectedGroup(params);
      const payload = {
        pageNo: 1,
        pageSize: 20,
        tourName: params.tourName,
        mode: 'SIC',
        data: params.date,
        agentName: agentName
      };
      setBookingsPayload(payload);
      dispatch(autoPlannerBookingAction(payload));
      setView(true);
    }
  };

  const handleSortModelChange = (model: any) => {
    setSortModel(model);

    const payload = {
      ...tripPayload,
      sortBy: model[0]?.sort,
      sortByField: model[0]?.field
    };
    setTripPayload(payload);
  };

  const handleBookingsPaginationModelChange = (newPaginationModel: PaginationModel) => {
    const { pageSize: newPageSize, page: newPageNo } = newPaginationModel;
    setIsPageSize(newPageSize);
    setIsPageNo(newPageNo + 1);
    const newPage = newPageNo + 1;
    const payload = {
      ...bookingsPayload,
      pageNo: newPage,
      pageSize: newPageSize
    };
    dispatch(autoPlannerBookingAction(payload));
  };

  const handlePaginationModelChange = (newPaginationModel: PaginationModel) => {
    const { pageSize: newPageSize, page: newPageNo } = newPaginationModel;
    setPageSize(newPageSize);
    setPageNo(newPageNo + 1);
    const newPage = newPageNo + 1;
    const payload = {
      ...tripPayload,
      pageNo: newPage,
      pageSize: newPageSize
    };
    setTripPayload(payload);
  };

  const handleFilterChange = useCallback(
    debounce((event: string) => {
      setFilter(event);
      if (rows) {
        const payloadSIC = {
          ...tripPayload,
          tripMode: 'SIC',
          search: event
        };
        setTripPayload(payloadSIC);
        dispatch(autoPlannerTripsAction(payloadSIC));
      }
    }),
    [tripPayload]
  );

  const handleBookings = async (tripPayload: any) => {
    await dispatch(autoPlannerTripsAction(tripPayload));
  };

  useEffect(() => {
    if (pageSize) setPageSizes(pageSize);
  }, [pageSize]);

  useEffect(() => {
    setBreadCrumbs({
      setViews: setView,
      views: view,
      setPageNo: setPageNo,
      setPageSize: setPageSize
    });
  }, [view, setPageNo, setPageSize]);

  useEffect(() => {
    if (
      tripsData?.data?.data !== null &&
      tripsData?.data?.data?.groupedTrips?.length > 0
    ) {
      setRows(tripsData?.data?.data?.groupedTrips);
      setRowCount(tripsData?.data?.data?.count || 0);
    } else {
      setRowCount(0);
      setRows([]);
    }
  }, [tripsData?.data]);

  useEffect(() => {
    if (tripPayload) {
      const payloadSIC = {
        ...tripPayload,
        tripMode: 'SIC'
      };

      if (tripPayload?.autoplannerID) {
        handleBookings(payloadSIC);
      }
    }
  }, [tripPayload]);

  useEffect(() => {
    const payload = {
      ...tripPayload,
      ...payloads
    };
    setTripPayload(payload);
  }, [payloads]);

  return {
    handleViewGroupTrip,
    handleSortModelChange,
    handleBookingsPaginationModelChange,
    handlePaginationModelChange,
    handleBookings,
    handleFilterChange,
    view,
    setView,
    rows,
    setRows,
    IspageNo,
    setIsPageNo,
    IspageSize,
    setIsPageSize,
    tripPayload,
    setTripPayload,
    rowCount,
    setRowCount,
    bookingsPayload,
    setBookingsPayload
  };
};

export const useMenuActionControllerSIC = ({
  pageNo,
  pageSize,
  setIsDialog,
  selectedGroup
}: any) => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewTrip = () => {
    handleMenuClose();
    setViewOpen(true);
  };

  const handleUpdateTrip = () => {
    handleMenuClose();
    setIsOpen(true);
  };

  const handleDeleteTrip = async () => {
    if (selectedRow) {
      const payload = {
        selectedRow: selectedRow,
        tripMode: 'SIC',
        pageDetails: { pageNo, pageSize }
      };
      await dispatch(autoPlannerDeleteAction(payload));
      setIsDialog('');
    }
  };

  const handleMenuClick = (row: Row) => {
    if (selectedGroup !== null) {
      const value = {
        source: row.source,
        startLat: row.startLat,
        startLng: row.startLng,
        // startTimestamp: row.startTimestamp,
        destination: selectedGroup.destination,
        endLat: selectedGroup.endLat,
        endLng: selectedGroup.endLng,
        endTimestamp: selectedGroup.endTimestamp,
        tripTotalDuration: selectedGroup.tripTotalDuration,
        mode: selectedGroup.mode
      };
      setSelectedRow({ ...row, ...value, ...selectedGroup });
    }
  };
  return {
    handleMenuClose,
    handleViewTrip,
    handleUpdateTrip,
    handleDeleteTrip,
    handleMenuClick,
    isOpen,
    setIsOpen,
    viewOpen,
    setViewOpen,
    anchorEl,
    setAnchorEl,
    selectedRow,
    setSelectedRow
  };
};

export const useCommonUseffectsSIC = ({
  BookingData,
  setTripsRows,
  setIsRowCount,
  rows,
  setGroupTripsRows
}: any) => {
  useEffect(() => {
    if (
      BookingData?.data?.data !== null &&
      BookingData?.data?.data?.passengerJourneyInfoList
    ) {
      const data = BookingData?.data?.data?.passengerJourneyInfoList?.map(
        (item: any, index: number) => ({
          ...item,
          sno: index + 1,
          id: item.trip_id,
          transferLocation: item.transfer_info?.pickupCoordinates,
          transferTripInfo: item.transfer_info ? 'Yes' : 'No',
          transferPickup: item.source ? item.source : '-',
          reference: item.ref_number ? item.ref_number : '-',
          pickupTimestamp: item.transfer_info
            ? convertEpochToDateString(item.transfer_info.pickupTimestamp)
            : '-'
        })
      );
      setTripsRows(data);
      setIsRowCount(BookingData?.data?.data.count);
    } else {
      setTripsRows([]);
    }
  }, [BookingData]);

  useLayoutEffect(() => {
    if (rows?.length > 0) {
      const data = rows?.map((item: any, index: number) => {
        const [startTime, endTime] =
          typeof item?.pickupWindow === 'string' && item.pickupWindow?.includes('-')
            ? item?.pickupWindow.split('-')
            : ['', ''];

        return {
          ...item,
          sno: index + 1,
          id: index + 1,
          pickupWindow: startTime
            ? `${convertTo12HourFormat(startTime)} - ${convertTo12HourFormat(endTime)}`
            : '-',
          returnTime: item?.returnTime ? convertTo12HourFormat(item?.returnTime) : '-'
        };
      });

      setGroupTripsRows(data);
    } else {
      setGroupTripsRows([]);
    }
  }, [rows]);
};
