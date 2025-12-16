import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useAppDispatch } from '../../../../../../../../app/redux/hooks';
import {
  autoPlannerDeleteAction,
  GetGrpBookings
} from '../../../../../../redux/reducer/autoPlannerSlices/autoplanner';
import {
  convertEpochToDateString,
  debounce
} from '../../../../../../../../utils/commonFunctions';

interface PaginationModel {
  page: number;
  pageSize: number;
}

export const useCommonStatesGRP = ({ pageSizes }: any) => {
  const [pageNo, setPageNo] = useState(1);
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(pageSizes || 20);
  const [view, setView] = useState<boolean>(false);
  const [tripsGroupRows, setGroupTripsRows] = useState<any[]>([]);
  const [tripPayload, setTripPayload] = useState({ pageNo, pageSize });
  return {
    pageNo,
    setPageNo,
    rows,
    setRows,
    pageSize,
    setPageSize,
    view,
    setView,
    tripsGroupRows,
    setGroupTripsRows,
    tripPayload,
    setTripPayload
  };
};

export const useCommonFunctionsGRP = ({
  setPageSize,
  setPageNo,
  tripPayload,
  setTripPayload,

  rows,
  pageSize,
  setPageSizes
}: any) => {
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState('');

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
    const payload = {
      ...tripPayload,
      sortBy: model[0]?.sort,
      sortByField: model[0]?.field
    };
    setTripPayload(payload);
  };

  const handleFilterChange = useCallback(
    debounce((event: string) => {
      setFilter(event);
      if (rows) {
        const payloadGRP = {
          ...tripPayload,
          tripMode: 'GRP',
          search: event
        };
        setTripPayload(payloadGRP);
        dispatch(GetGrpBookings(payloadGRP));
      }
    }),
    [tripPayload]
  );

  useEffect(() => {
    if (tripPayload) {
      const payloadSIC = {
        ...tripPayload,
        tripMode: 'GRP'
      };
      dispatch(GetGrpBookings(payloadSIC));
    }
  }, [tripPayload]);

  useEffect(() => {
    if (pageSize) setPageSizes(pageSize);
  }, [pageSize]);

  return {
    handleFilterChange,
    handleSortModelChange,
    handlePaginationModelChange,
    filter,
    setFilter
  };
};

export const useMenuActionControllerGRP = ({ pageNo, pageSize, payloads }: any) => {
  const dispatch = useAppDispatch();
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDialog, setIsDialog] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (row: any) => {
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUpdateTrip = () => {
    handleMenuClose();
    setIsOpen(true);
  };
  const handleDeleteTrip = async () => {
    if (selectedRow) {
      const payload = {
        selectedRow: selectedRow,
        mode: 'GRP',
        pageDetails: { pageNo, pageSize, autoplannerID: payloads.autoplannerID }
      };
      const res = await dispatch(autoPlannerDeleteAction(payload));
      if (res?.meta?.requestStatus === 'fulfilled') {
        setIsDialog('');
      }
    }
  };

  return {
    handleMenuClick,
    handleMenuClose,
    handleUpdateTrip,
    handleDeleteTrip,
    selectedRow,
    setSelectedRow,
    isOpen,
    setIsOpen,
    isDialog,
    setIsDialog,
    anchorEl,
    setAnchorEl
  };
};

export const useCommonUseEffectsGRP = ({
  tripsData,
  rows,
  setRows,

  setGroupTripsRows,
  setBreadCrumbs,
  view,
  setView,
  setPageNo,
  setPageSize,
  tripPayload,
  payloads,
  setTripPayload
}: any) => {
  const [rowCount, setRowCount] = useState(0);

  useLayoutEffect(() => {
    if (tripsData?.data?.data !== null && tripsData?.data?.data?.customTours) {
      setRows(tripsData.data.data.customTours);
      setRowCount(tripsData.data.data.count || 0);
    } else {
      setRowCount(0);
      setRows([]);
    }
  }, [tripsData?.data]);

  useEffect(() => {
    if (rows?.length > 0) {
      const data = rows?.map((item: any, index: number) => ({
        ...item,
        sno: index + 1,
        id: index + 1,
        mode: 'GRP',
        from: item.from.locationAddress,
        to: item.to.locationAddress,
        // startTimestamp: convertEpochToDateString(item.startTimestamp),
        endTimestamp: item.endTimestamp
          ? convertEpochToDateString(item.endTimestamp)
          : '-'
      }));
      setGroupTripsRows(data);
    } else setGroupTripsRows([]);
  }, [rows]);

  useEffect(() => {
    setBreadCrumbs({
      setViews: setView,
      views: view,
      setPageNo: setPageNo,
      setPageSize: setPageSize
    });
  }, [view, setPageNo, setPageSize]);

  useEffect(() => {
    const payload = {
      ...tripPayload,
      ...payloads
    };
    setTripPayload(payload);
  }, [payloads]);

  return {
    rowCount,
    setRowCount
  };
};
