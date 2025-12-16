import React, { useCallback, useEffect, useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { Icon } from '@iconify/react';
import EditIcon from '@mui/icons-material/Edit';
import {
  clearExcelView,
  clearWhatsapp,
  driverDropdownAction,
  getExcelAction,
  getScheduleDriverAction,
  getStandardVehicles,
  guestContactUpdateAction,
  sendwhatsappAction
} from '../../../../redux/reducer/autoPlannerSlices/autoGenerateSlice';
import { useAppDispatch } from '../../../../../../app/redux/hooks';
import { debounce } from 'lodash';
import {
  clearContactError,
  contactNumberValidation
} from '../../../../redux/reducer/autoPlannerSlices/autoplanner';
import { getAgent } from '../../../../redux/reducer/autoPlannerSlices/agentslice';

type Column = GridColDef;

interface UseExcelColumnHookParams {
  roleAgent?: boolean;
  APsubAgent?: boolean;
  selectedTripRow?: any;
  handleMenuTripClick: (row: any) => void;
  handleUpdateTrip: () => void;
  handleAddTransfer: () => void;
  handleTransClick: () => void;
  setIsDialog: (value: string) => void;
  handleDriver: (row: any) => void;
}

export const useExcelState = () => {
  const [rows, setRows] = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);
  const [isDate, setIsDate] = useState<boolean>(true);
  const [prevSearch, setPrevSearch] = useState(false);
  const [guestContactList, setGuestContactList] = useState<
    {
      autoplannerID: number;
      guestContactNumber: string;
      journyId: string;
    }[]
  >([]);
  const [PageSize, setPageSize] = useState(20);
  const [PageNo, setPageNo] = useState(1);
  const [filterPayload, setFilterPayload] = useState<any>('');
  const [searchEvent, setSearchEvent] = useState<any>('');
  const [filter, setFilter] = useState('');
  const [rowCount, setRowCount] = useState(0);

  const [only, setOnly] = React.useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [selectedTripRow, setSelectedTripRow] = useState<any | null>(null);
  const [driverPayload, setDriverPayload] = useState<any | null>(null);
  const [excelPayload, setExcelPayload] = useState<any>(null);
  const [isDialog, setIsDialog] = useState('');
  const [transRow, setTransRow] = useState<any | null>(null);

  return {
    rows,
    setRows,
    invalidRows,
    setDriverPayload,
    driverPayload,
    setInvalidRows,
    isDate,
    setIsDate,
    prevSearch,
    setPrevSearch,
    guestContactList,
    setGuestContactList,
    PageSize,
    setPageSize,
    PageNo,
    setPageNo,
    filterPayload,
    setFilterPayload,
    searchEvent,
    setSearchEvent,
    filter,
    setFilter,
    rowCount,
    setRowCount,
    only,
    setOnly,
    anchorEl,
    setAnchorEl,
    selectedRow,
    setSelectedRow,
    selectedTripRow,
    setSelectedTripRow,
    excelPayload,
    setExcelPayload,
    isDialog,
    setIsDialog,
    transRow,
    setTransRow
  };
};

export const useExcelColumnHook = ({
  roleAgent,
  APsubAgent,
  selectedTripRow,
  handleMenuTripClick,
  handleUpdateTrip,
  handleAddTransfer,
  handleTransClick,
  setIsDialog,
  handleDriver
}: UseExcelColumnHookParams) => {
  const columns: Column[] = [
    ...(!roleAgent && !APsubAgent
      ? [
          {
            field: 'actions',
            headerName: 'Action',
            type: 'actions',
            minWidth: 100,
            maxWidth: 100,
            flex: 1,
            sortable: false,
            getActions: (params: any) => {
              const rowData = params?.row;
              const isAddTrans =
                !rowData?.isReturnTrip &&
                rowData?.mainHotelResponses?.length !== 0 &&
                !rowData?.transferInstance &&
                rowData?.mode !== 'PVT' &&
                rowData?.mode !== 'GRP';

              const isTrans =
                !rowData?.isReturnTrip &&
                rowData?.mainHotelResponses?.length !== 0 &&
                rowData?.transferInstance &&
                rowData?.mode !== 'PVT' &&
                rowData?.mode !== 'GRP';

              return params?.row?.mode === 'RLR'
                ? [
                    <GridActionsCellItem
                      key='lock'
                      sx={{ marginLeft: '10px' }}
                      icon={
                        <Tooltip title='RLR Tour cannot be Updated'>
                          <span>
                            <Icon
                              icon='ic:round-lock'
                              className='menu-icon update'
                              color='grey'
                              height='20'
                              width='20'
                            />
                          </span>
                        </Tooltip>
                      }
                      label='Not Editable'
                    />
                  ]
                : [
                    <GridActionsCellItem
                      key='update'
                      icon={<EditIcon sx={{ fontSize: 18, color: '#fb8c00' }} />}
                      label='Update'
                      onClick={() => {
                        handleMenuTripClick(params.row);
                        handleUpdateTrip();
                      }}
                      showInMenu
                    />,
                    isAddTrans ? (
                      <GridActionsCellItem
                        key='add-transfer'
                        icon={
                          <Icon
                            icon='fluent:tab-add-20-filled'
                            className='menu-icon transfer'
                          />
                        }
                        label='Add Transfer'
                        onClick={() => {
                          handleMenuTripClick(params.row);
                          handleAddTransfer();
                        }}
                        showInMenu
                      />
                    ) : null,
                    isTrans ? (
                      <GridActionsCellItem
                        key='trans-details'
                        icon={
                          <Icon
                            icon='fluent:vehicle-car-profile-16-filled'
                            className='menu-icon transfer'
                          />
                        }
                        label='Transfer Details'
                        onClick={() => {
                          handleMenuTripClick(params.row);
                          handleTransClick();
                        }}
                        showInMenu
                      />
                    ) : null
                  ].filter(Boolean);
            }
          }
        ]
      : []),

    {
      field: 'time',
      headerName: 'Time',
      minWidth: 100,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => {
        let timeStr = params.value;
        if (!timeStr) return '';
        let [hours, minutes] = timeStr.split(':').map(Number);
        let period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
      }
    },

    { field: 'agentName', headerName: 'Agent', minWidth: 150, flex: 1, sortable: false },
    { field: 'mode', headerName: 'Mode', minWidth: 100, flex: 1, sortable: false },
    {
      field: 'refNumber',
      headerName: 'Ref No.',
      minWidth: 150,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => {
        const value = params.value || '-';
        return value === '-' ? (
          <span>{value}</span>
        ) : (
          <Tooltip title={value}>
            <span>{value}</span>
          </Tooltip>
        );
      }
    },

    {
      field: 'guestName',
      headerName: 'Guest',
      minWidth: 220,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => {
        const value = params.value || '';
        return !value ? (
          <span>{value}</span>
        ) : (
          <Tooltip title={value}>
            <span>{value}</span>
          </Tooltip>
        );
      }
    },
    {
      field: 'guestContactNumber',
      headerName: 'Guest Contact Number',
      minWidth: 200,
      flex: 1,
      valueGetter: (params: any) => (params.value ? params.value : '-')
    },
    {
      field: 'adultCount',
      headerName: 'Adult Count',
      minWidth: 100,
      flex: 1,
      sortable: false
    },
    {
      field: 'childCount',
      headerName: 'Child Count',
      minWidth: 100,
      flex: 1,
      sortable: false
    },
    {
      field: 'source',
      headerName: 'From',
      minWidth: 250,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => (
        <Tooltip title={params.row.source} arrow>
          <Box
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}
          >
            {params.row.source}
          </Box>
        </Tooltip>
      )
    },
    {
      field: 'destination',
      headerName: 'To',
      minWidth: 250,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => (
        <Tooltip title={params.row.destination} arrow>
          <Box
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}
          >
            {params.row.destination}
          </Box>
        </Tooltip>
      )
    },
    {
      field: 'trfOrGuide',
      headerName: 'Transfer / Guide',
      minWidth: 300,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => (
        <Tooltip title={params.row.trfOrGuide} arrow>
          <Box sx={{ fontWeight: 'bold' }}>{params.row.trfOrGuide ?? '-'}</Box>
        </Tooltip>
      )
    },
    {
      field: 'driverName',
      headerName: 'Driver Name',
      minWidth: 150,
      flex: 1,
      sortable: false,
      cellClassName: (params: any) => {
        const isDriverChanges = params.row.driverModified;
        if (isDriverChanges) return 'super-app-theme--cell';
      },
      renderCell: (params: any) => {
        const isDriverChanges = params.row.driverModified;
        const tooltipTitle = 'Driver details has been modified.';

        const handleKeyPress = (event: React.KeyboardEvent, row: any) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (row?.vehicleNumber && row?.vehicleNumber !== 'Unassigned') {
              setIsDialog('changeDriver');
              handleDriver(row);
            }
          }
        };

        const cellContent = (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {!roleAgent && !APsubAgent && params?.row?.mode !== 'RLR' ? (
              <Tooltip
                title={
                  params?.row?.vehicleNumber === 'Unassigned'
                    ? `Can't update driver without assigning vehicle.`
                    : 'Change driver'
                }
                placement='top'
                arrow
              >
                <span>
                  <IconButton
                    size='small'
                    aria-label='Change driver'
                    disabled={params?.row?.vehicleNumber === 'Unassigned'}
                    onClick={event => {
                      event.stopPropagation();
                      if (
                        params?.row?.vehicleNumber &&
                        params?.row?.vehicleNumber !== 'Unassigned'
                      ) {
                        setIsDialog('changeDriver');
                        handleDriver(params.row);
                      }
                    }}
                    onKeyDown={(event: any) => handleKeyPress(event, params.row)}
                    sx={{ color: '#232323', fontSize: '25px', marginRight: '10px' }}
                  >
                    <Icon icon='ph:user-switch' />
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
              !roleAgent &&
              !APsubAgent && (
                <Tooltip
                  title='Unable to change the driver for RLR mode.'
                  placement='top'
                  arrow
                >
                  <span>
                    <IconButton
                      size='small'
                      aria-label='Info: Cannot change driver in RLR mode'
                      disabled
                      sx={{ color: '#7c7c7c', fontSize: '20px', marginRight: '10px' }}
                    >
                      <Icon icon='material-symbols:info-rounded' />
                    </IconButton>
                  </span>
                </Tooltip>
              )
            )}

            <Typography sx={{ fontSize: '0.75rem' }}>{params.value}</Typography>
          </Box>
        );

        return isDriverChanges ? (
          <Tooltip title={tooltipTitle} placement='top' arrow>
            <span>{cellContent}</span>
          </Tooltip>
        ) : (
          cellContent
        );
      }
    },
    {
      field: 'vehicleNumber',
      headerName: 'Vehicle No',
      minWidth: 100,
      flex: 1,
      sortable: false,
      cellClassName: (params: any) => {
        const isVehicleChanges = params.row.vehicleModified;
        return isVehicleChanges ? 'super-app-theme--cell' : '';
      },
      renderCell: (params: any) => {
        const isVehicleChanges = params.row.vehicleModified;
        const tooltipTitle = 'Vehicle details has been modified.';
        const displayValue =
          params.value?.toLowerCase() === 'unassigned'
            ? 'Unassigned'
            : params.value?.toUpperCase();

        return isVehicleChanges ? (
          <Tooltip title={tooltipTitle} placement='top' arrow>
            <span>{displayValue}</span>
          </Tooltip>
        ) : (
          <span>{displayValue}</span>
        );
      }
    },
    {
      field: 'driverContactNumber',
      headerName: 'Driver Contact No',
      minWidth: 150,
      flex: 1,
      sortable: false
    }
  ].map((item: any) => ({ ...item, sortable: false }));

  return { columns };
};

export const useExcelAction = ({
  selectedRow,
  driverPayload,
  only,
  filterPayload,
  scheduleDate,
  PageNo,
  PageSize,
  searchEvent,
  invalidRows,
  autoplannerID,
  transRow,
  selectedTripRow,
  agent,
  guest,
  tour,
  vehicle,
  tripPayload,

  setSelectedRow,
  setDriverPayload,
  setPageSize,
  setPageNo,
  setSelectedTripRow,
  setTransRow,
  setGuestContactList,
  setInvalidRows,
  setIsDialog,
  setFilter,
  setPrevSearch,
  setSearchEvent,
  setFilterPayload,
  setSearchPayload,

  handleClose,
  handleMenuClose,
  reset
}: any) => {
  const dispatch = useAppDispatch();

  const onChangeDriverSubmit = async (params: any) => {
    const payload = {
      ...selectedRow,
      ...driverPayload,
      modifyVehicleDriver: only ? 0 : 1,
      driverID: params.driver
    };

    const action = await dispatch(getScheduleDriverAction(payload));

    if (action.type === getScheduleDriverAction.fulfilled.type) {
      const paramss = {
        ...filterPayload,
        autoplannerID: scheduleDate,
        tripMode: 'ALL',
        PageNo: PageNo,
        PageSize: PageSize
      };
      handleClose();
      setSelectedTripRow(null);
      await dispatch(getExcelAction(paramss));
    }
    handleClose();
    reset();
  };

  const handleUpdateTransfer = async () => {
    setIsDialog('addTransfer');
    const payload = {
      autoplannerID: scheduleDate,
      journeyId: transRow?.journeyId,
      tripMode: 'TRANSFER',
      tourName: transRow?.tourName,
      totalPassengers: transRow?.totalCount,
      vehicleNumber: transRow?.transferInstance?.vehicleNumber || ''
    };

    await dispatch(getStandardVehicles(payload));
  };

  const handleDriver = (row: any) => {
    setSelectedRow(row);

    const payload = {
      mode: row?.mode,
      date: scheduleDate,
      journeyId: row?.journeyId,
      vehicleNumber: row?.vehicleNumber,
      tourName: row?.tourName,
      radio: only
    };

    setDriverPayload(payload);
    dispatch(driverDropdownAction(payload));
  };

  const handleFilterChange = useCallback(
    debounce((event: string) => {
      setFilter(event);
      setPrevSearch(true);
      const payload = {
        ...tripPayload,
        ...filterPayload,
        PageNo: 1,
        PageSize,
        autoplannerID: scheduleDate,
        tripMode: 'ALL',
        agentName: agent,
        guestName: guest,
        tourName: tour,
        vehicleNumber: vehicle,
        searchFor: event
      };

      setSearchEvent(event);
      dispatch(getExcelAction(payload));

      const filters = {
        autoplannerID: scheduleDate,
        tripMode: 'ALL',
        PageNo: 1,
        PageSize,
        agentName: agent,
        guestName: guest,
        tourName: tour,
        vehicleNumber: vehicle,
        searchFor: event
      };

      const search = {
        autoplannerID: scheduleDate,
        tripMode: 'ALL',
        PageNo: 1,
        PageSize,
        searchFor: event
      };

      setFilterPayload(filters);
      setSearchPayload(search);
    }, 500),
    [scheduleDate, tripPayload, PageNo, PageSize, filterPayload]
  );

  const handlePaginationModelChange = async (newPaginationModel: any) => {
    const { pageSize: newPageSize, page: newPageNo } = newPaginationModel;
    setPageSize(newPageSize);
    setPageNo(newPageNo + 1);
    const newPage = newPageNo + 1;
    const payload = {
      ...filterPayload,
      PageNo: newPage,
      PageSize: newPageSize,
      autoplannerID: scheduleDate,
      tripMode: 'ALL',
      searchFor: searchEvent || ''
    };
    dispatch(getExcelAction(payload));
  };

  const handleUpdateContact = async () => {
    const filteredRows = invalidRows?.filter((item: any) => item?.contactNumber);

    const payloadData = filteredRows?.map((item: any) => ({
      autoplannerID,
      guestContactNumber: item?.contactNumber,
      journyId: item?.journeyID
    }));

    await dispatch(guestContactUpdateAction(payloadData));
    setGuestContactList([]);

    const payload = { autoplannerId: scheduleDate };
    dispatch(sendwhatsappAction(payload));
  };

  const handleGuestContactChange = debounce(async (event: any, journey: any) => {
    if (!event) {
      handleGuestContactChange.cancel();
      setInvalidRows((prev: any) =>
        prev?.map((item: any) => ({
          ...item,
          color: item?.journeyID === journey ? '' : item?.color,
          contactNumber: item?.journeyID === journey ? '' : item?.contactNumber,
          isError: item?.journeyID === journey ? false : item?.isError
        }))
      );
    } else {
      const action1 = await dispatch(contactNumberValidation(event));

      if (action1?.payload) {
        setInvalidRows((prev: any) =>
          prev?.map((item: any) => ({
            ...item,
            color:
              item?.journeyID === journey
                ? action1?.payload?.status !== 200
                  ? '#ff07078c'
                  : ''
                : item?.color,
            contactNumber: item?.journeyID === journey ? event : item?.contactNumber,
            isError:
              item?.journeyID === journey && event
                ? action1?.payload?.status !== 200
                : item?.isError
          }))
        );
      }
    }
  }, 500);

  const handleTransClick = () => {
    handleMenuClose();
    const row = selectedTripRow;
    setSelectedTripRow(null);
    setTransRow(row);
    setIsDialog('Transfer');
  };

  const handleAddTransfer = async () => {
    handleMenuClose();
    const row = selectedTripRow;
    setIsDialog('addTransfer');
    const payload = {
      autoplannerID: scheduleDate,
      journeyId: row?.journeyId,
      tripMode: 'TRANSFER',
      totalPassengers: row?.totalCount,
      vehicleNumber: row?.vehicleNumber,
      tourName: row?.tourName
    };
    await dispatch(getStandardVehicles(payload));
  };

  return {
    onChangeDriverSubmit,
    handleUpdateTransfer,
    handleDriver,
    handleFilterChange,
    handlePaginationModelChange,
    handleUpdateContact,
    handleGuestContactChange,
    handleTransClick,
    handleAddTransfer
  };
};

export const useExcelDataGridAction = ({
  setSelectedTripRow,
  IsbookingsUpdate,
  setAnchorEl,
  scheduleDate,
  setIsDialog,
  driverPayload,
  setOnly,
  only
}: any) => {
  const dispatch = useAppDispatch();
  const handleMenuTripClick = (row: any) => {
    setSelectedTripRow(row);
  };

  const handleUpdateTrip = () => {
    IsbookingsUpdate(true);
    handleMenuClose();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSkip = async () => {
    console.log(scheduleDate, 'scheduleDate');

    const payload = {
      autoplannerId: scheduleDate,
      skippingPhoneNumber: true
    };
    await dispatch(sendwhatsappAction(payload));
    dispatch(clearWhatsapp());
    setIsDialog('');
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setOnly(isChecked);
    const payload = {
      ...driverPayload,
      radio: isChecked,
      modifyVehicleDriver: only
    };
    dispatch(driverDropdownAction(payload));
  };
  return {
    handleMenuClose,
    handleUpdateTrip,
    handleMenuTripClick,
    handleSkip,
    handleChange
  };
};

export const useExcelEffects = ({
  data,
  sendwhatsapp,
  initialLoad,
  scheduleDate,
  PageNo,
  PageSize,
  setRows,
  isDate,
  setRowCount,
  setInvalidRows,
  setPageNo,
  setPageSize,
  setIsDate,
  setExcelPayload,
  setPayload,
  setValue,
  setIsDialog,
  setFilterPayload,
  tripPayload,
  agent,
  guest,
  tour,
  vehicle,
  count
}: any) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (data?.length === 0) {
      setRows([]);
    }

    if (data?.length > 0) {
      const getExcel = data?.map((item: any, index: number) => ({
        ...item,
        id: index + 1,
        driver: item.driverName + ' - ' + item.driverContactNumber,
        totalCount: item?.adultCount + item?.childCount,
        color: `#${item?.colour?.substring(2)}`,
        trfOrGuide:
          item.transferInstance !== null
            ? `TRF BY ${
                item.transferInstance?.driverName
              } ${item.transferInstance?.vehicleNumber?.toUpperCase()} ${
                item?.transferInstance.contactNumber
              }`
            : item.guideName
            ? `GUIDE ${item.guideName} ${item.guideContactNumber}`
            : '-'
      }));
      dispatch(getAgent);
      setRows(getExcel);
      setRowCount(count);
    } else {
      setRows([]);
    }
  }, [data]);

  useEffect(() => {
    if (sendwhatsapp?.data?.data?.length === 0) {
      setRows([]);
    }

    if (sendwhatsapp?.data?.data?.length > 0) {
      const invalidContact = sendwhatsapp?.data?.data?.map(
        (item: any, index: number) => ({
          ...item,
          id: index + 1,
          isError: false,
          contactNumber: '',
          color: `#fff`
        })
      );

      setInvalidRows(invalidContact);
    } else {
      setInvalidRows([]);
    }
  }, [sendwhatsapp?.data?.data]);

  useEffect(() => {
    if (initialLoad) {
      setPageNo(1);
      setPageSize(20);
    }
  }, [initialLoad]);

  useEffect(() => {
    setIsDate(true);
  }, [scheduleDate]);
  // useEffect(() => {
  //   if (scheduleDate !== 0 && isDate) {
  //     const payload = {
  //       autoplannerID: scheduleDate,
  //       tripMode: 'ALL',
  //       PageNo: PageNo,
  //       PageSize: PageSize
  //     };
  //     setExcelPayload(payload);
  //     dispatch(getExcelAction(payload));
  //   }
  //   return () => {
  //     dispatch(clearExcelView());
  //   };
  // }, [isDate, scheduleDate]);
  useEffect(() => {
    setPayload({ pageNo: PageNo, pageSize: PageSize });
  }, [PageNo, PageSize]);

  useEffect(() => {
    setValue('search', '');
  }, [scheduleDate]);

  useEffect(() => {
    if (sendwhatsapp?.data?.count > 0) {
      setIsDialog('Nocontact');
    }
  }, [sendwhatsapp]);

  useEffect(() => {
    const filter = {
      ...tripPayload,
      autoplannerID: scheduleDate,
      tripMode: 'ALL',
      PageNo: PageNo,
      PageSize: PageSize,
      agentName: agent,
      guestName: guest,
      tourName: tour,
      vehicleNumber: vehicle
    };
    setFilterPayload(filter);
  }, [agent, guest, tour, vehicle]);

  useEffect(() => {
    return () => {
      dispatch(clearContactError());
    };
  }, []);

  useEffect(() => {
    return () => {
      dispatch(clearWhatsapp());
    };
  }, []);
};
