import { useCallback, useEffect, useState } from 'react';
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
}
interface PaginationModel {
  page: number;
  pageSize: number;
}
export const useCommonStatesTSIC = ({ pageSizes }: any) => {
  const [view, setView] = useState<boolean>(false);
  const [isDialog, setIsDialog] = useState('');
  const [pageSize, setPageSize] = useState(pageSizes || 20);
  const [rows, setRows] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [tripPayload, setTripPayload] = useState({ pageNo, pageSize });
  const [bookingsPayload, setBookingsPayload] = useState<any>(null);
  return {
    view,
    setView,
    isDialog,
    setIsDialog,
    pageSize,
    setPageSize,
    rows,
    setRows,
    pageNo,
    setPageNo,
    tripPayload,
    setTripPayload,
    bookingsPayload,
    setBookingsPayload
  };
};

export const useCommonFunctionTSIC = ({
  rows,
  tripPayload,
  setTripPayload,
  bookingsPayload,
  setPageSize,
  setPageNo
}: any) => {
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState('');
  const [IspageNo, setIsPageNo] = useState(1);
  const [sortModel, setSortModel] = useState<any>([]);
  const [tripsGroupRows, setGroupTripsRows] = useState<Row[]>([]);

  const [IspageSize, setIsPageSize] = useState(20);

  const handleFilterChange = useCallback(
    debounce((event: string) => {
      setFilter(event);
      if (rows) {
        const payloadTSIC = {
          ...tripPayload,
          tripMode: 'TSIC',
          search: event
        };
        setTripPayload(payloadTSIC);
        dispatch(autoPlannerTripsAction(payloadTSIC));
      }
    }),
    [tripPayload]
  );

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

  const handleSortModelChange = (model: any) => {
    setSortModel(model);
    const payload = {
      ...tripPayload,
      sortBy: model[0]?.sort,
      sortByField: model[0]?.field
    };
    setTripPayload(payload);
  };

  useEffect(() => {
    if (rows?.length > 0) {
      const data = rows?.map((item: any, index: number) => {
        const [startTime, endTime] =
          typeof item?.pickupWindow === 'string' && item.pickupWindow.includes('-')
            ? item.pickupWindow.split('-')
            : ['', ''];

        return {
          ...item,
          sno: index + 1,
          id: index + 1,
          // startTimestamp: convertEpochToDateString(item.startTimestamp),
          pickupWindow: startTime
            ? `${convertTo12HourFormat(startTime)} - ${convertTo12HourFormat(endTime)}`
            : '-',
          returnTime: item.returnTime ? convertTo12HourFormat(item.returnTime) : '-'
        };
      });
      setGroupTripsRows(data);
    } else setGroupTripsRows([]);
  }, [rows]);

  useEffect(() => {
    if (tripPayload) {
      const payloadSIC: any = {
        ...tripPayload,
        tripMode: 'TSIC'
      };

      if (payloadSIC?.autoplannerID) {
        dispatch(autoPlannerTripsAction(payloadSIC));
      }
    }
  }, [tripPayload]);

  return {
    handleFilterChange,
    handleBookingsPaginationModelChange,
    handlePaginationModelChange,
    handleSortModelChange,
    filter,
    setFilter,
    IspageSize,
    setIsPageSize,
    IspageNo,
    setIsPageNo,
    sortModel,
    setSortModel,
    tripsGroupRows,
    setGroupTripsRows
  };
};

export const useMenuActionControllerTSIC = ({
  pageNo,
  pageSize,
  setIsDialog,
  setBookingsPayload,
  agentName,
  setView,
  setPageSizes
}: any) => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
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
        tripMode: 'TSIC',
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
        // startTimestamp: selectedGroup.startTimestamp,
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

  const handleViewGroupTrip = (event: React.MouseEvent<HTMLElement>, params: any) => {
    if (params !== null) {
      setSelectedGroup(params);
      const payload = {
        pageNo: 1,
        pageSize: 20,
        tourName: params.tourName,
        mode: 'TSIC',
        data: params.date,
        agentName: agentName
      };
      setBookingsPayload(payload);
      dispatch(autoPlannerBookingAction(payload));
      setView(true);
    }
  };

  useEffect(() => {
    if (pageSize) setPageSizes(pageSize);
  }, [pageSize]);

  return {
    handleMenuClose,
    handleViewTrip,
    handleUpdateTrip,
    handleDeleteTrip,
    handleMenuClick,
    handleViewGroupTrip,
    isOpen,
    setIsOpen,
    viewOpen,
    setViewOpen,
    selectedGroup,
    setSelectedGroup,
    anchorEl,
    setAnchorEl,
    selectedRow,
    setSelectedRow
  };
};

export const useCommonUseeffectTSIC = ({
  setBreadCrumbs,
  setView,
  view,
  setPageNo,
  setPageSize,
  tripPayload,
  payloads,
  setTripPayload,
  BookingData,
  tripsData,
  setRows
}: any) => {
  const [tripsRows, setTripsRows] = useState<Row[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [IsrowCount, setIsRowCount] = useState(0);

  useEffect(() => {
    setBreadCrumbs({
      setViews: setView,
      views: view,
      setPageNo: setPageNo,
      setPageSize: setPageSize
    });
  }, [view]);

  useEffect(() => {
    const payload = {
      ...tripPayload,
      ...payloads
    };
    setTripPayload(payload);
  }, [payloads]);

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
          reference: item.ref_number ? item.ref_number : '-',
          transferPickup: item.source ? item.source : '-',
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

  useEffect(() => {
    if (tripsData?.data?.data !== null && tripsData?.data?.data?.groupedTrips) {
      setRows(tripsData.data.data.groupedTrips);
      setRowCount(tripsData.data.data.count || 0);
    } else {
      setRowCount(0);
      setRows([]);
    }
  }, [tripsData?.data]);

  return {
    setTripsRows,
    tripsRows,
    rowCount,
    setRowCount,
    IsrowCount,
    setIsRowCount
  };
};
