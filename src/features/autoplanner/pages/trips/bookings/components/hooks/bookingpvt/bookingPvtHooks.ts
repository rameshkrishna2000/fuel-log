import { Tooltip } from '@mui/material';
import {
  convertEpochToDateString,
  convertEpoctoTimeZoneDate,
  debounce
} from '../../../../../../../../utils/commonFunctions';
import { GridActionsCellItem } from '@mui/x-data-grid';

import constant from '../../../../../../../../utils/constants';
import { useAppDispatch } from '../../../../../../../../app/redux/hooks';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  autoPlannerDeleteAction,
  GetGrpBookings
} from '../../../../../../redux/reducer/autoPlannerSlices/autoplanner';

interface PaginationModel {
  page: number;
  pageSize: number;
}

export const useCommonStates = ({ pageSizes }: any) => {
  const [pageNo, setPageNo] = useState(1);
  const [rows, setRows] = useState([]);
  const [isDialog, setIsDialog] = useState('');
  const [pageSize, setPageSize] = useState(pageSizes || 20);
  const [rowCount, setRowCount] = useState(0);
  const [view, setView] = useState<boolean>(false);
  const [tripsGroupRows, setGroupTripsRows] = useState<any[]>([]);
  const [tripPayload, setTripPayload] = useState({ pageNo, pageSize });
  return {
    pageNo,
    setPageNo,
    rows,
    setRows,
    isDialog,
    setIsDialog,
    pageSize,
    setPageSize,
    rowCount,
    setRowCount,
    view,
    setView,
    tripsGroupRows,
    setGroupTripsRows,
    tripPayload,
    setTripPayload
  };
};
export const useCommonFunctions = ({
  rows,
  tripPayload,
  filterPayload,
  setTripPayload,
  setPageNo,
  setPageSize,
  payloads,
  urls
}: any) => {
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState('');

  const handleFilterChange = useCallback(
    debounce((event: string) => {
      setFilter(event);
      if (rows) {
        const payloadPVT = {
          ...tripPayload,
          ...filterPayload,
          tripMode: 'PVT',
          search: event
        };
        setTripPayload(payloadPVT);
        dispatch(GetGrpBookings(payloadPVT));
      }
    }),
    [tripPayload, filterPayload]
  );

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

  useEffect(() => {
    const payload = {
      ...tripPayload,
      ...payloads
    };
    setTripPayload(payload);
  }, [payloads]);

  return {
    handleFilterChange,
    handlePaginationModelChange,
    handleSortModelChange,
    filter,
    setFilter
  };
};

export const useCommonUseEffects = ({
  tripPayload,
  urls,
  tripsData,
  setRows,
  setRowCount,
  rows,
  setGroupTripsRows,
  setBreadCrumbs,
  setView,
  view,
  setPageNo,
  setPageSize,
  pageSize,
  setPageSizes
}: any) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (tripPayload) {
      const payloadSIC = {
        ...tripPayload,
        tripMode: 'PVT'
      };
      dispatch(GetGrpBookings(payloadSIC));
    }
  }, [tripPayload]);

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
        mode: 'PVT',
        from: item.from.locationAddress,
        to: item.to.locationAddress,
        // startTimestamp: item.startTimestamp
        //   ? dayjs
        //       .unix(item.startTimestamp)
        //       .tz(profile?.timeZone)
        //       .format('DD-MM-YYYY HH:mm A')
        //   : '-',
        startTimestamp: item.startTimestamp,
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
    if (pageSize) setPageSizes(pageSize);
  }, [pageSize]);
};

export const useMenuActionController = ({
  setIsDialog,
  pageNo,
  pageSize,
  payloads,
  urls
}: any) => {
  const dispatch = useAppDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const handleMenuClick = (row: any) => {
    setSelectedRow(row);
  };

  const handleUpdateTrip = () => {
    handleMenuClose();
    setIsOpen(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteTrip = async () => {
    if (selectedRow) {
      const payload = {
        selectedRow: selectedRow,
        mode: 'PVT',
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
    handleUpdateTrip,
    handleMenuClose,
    handleDeleteTrip,
    selectedRow,
    setSelectedRow,
    isOpen,
    setIsOpen,
    anchorEl,
    setAnchorEl
  };
};
