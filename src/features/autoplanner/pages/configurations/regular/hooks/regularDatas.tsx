import { GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import constant from '../../../../../../utils/constants';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Icon } from '@iconify/react';
import { useCallback, useState } from 'react';
import { useAppDispatch } from '../../../../../../app/redux/hooks';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { debounce } from 'lodash';
import { daysOfWeek } from '../componentDatas/componentDatas';
import {
  capitalizeFirstLetter,
  twelveHRformat
} from '../../../../../../utils/commonFunctions';

//custom hook to handle table rows and columns
const useTableDatas = (
  data: any,
  setOpen: any,
  urls: any,
  setPageNo: React.Dispatch<React.SetStateAction<number>>,
  setPageSize: React.Dispatch<React.SetStateAction<number>>
) => {
  const [filteredRow, setFilteredRow] = useState<any>(null);
  const [actionMessage, setActionMessage] = useState<any>({
    action: false,
    message: '',
    actionName: ''
  });

  const [availability, setAvailability] = useState<any>([]);

  const dispatch = useAppDispatch();

  const handleUpdate = (row: any) => {
    setFilteredRow(row);
    setOpen(true);
  };

  const handleDelete = async (row: any) => {
    await dispatch(urls[0](row?.tourId));
    setActionMessage({ action: false, message: '', actionName: '' });
    setFilteredRow(null);
    await dispatch(urls[2]({ pageNo: 1, pageSize: 10 }));
    setPageNo(1);
    setPageSize(10);
  };

  const handleDeactivate = async (row: any) => {
    await dispatch(urls[1](row?.tourId));
    setActionMessage({ action: false, message: '', actionName: '' });
    setFilteredRow(null);
    await dispatch(urls[2]({ pageNo: 1, pageSize: 10 }));
    setPageNo(1);
    setPageSize(10);
  };

  const handlesetDeactive = (row: any) => {
    setFilteredRow(row);
    setActionMessage({
      action: true,
      message: row?.isActive
        ? `This might impact the scheduled tours.Are you sure want to deactivate this tour?`
        : 'Are you sure want to activate this tour?',
      actionName: () => {
        handleDeactivate(row);
      }
    });
  };

  const handleViewAvilability = (row: any) => {
    setFilteredRow(row);
    const availableDays = daysOfWeek
      ?.filter(day => day?.id !== 'selectAll')
      ?.map((item: any) => ({
        ...item,
        available: row?.scheduledDays?.includes(item.id) ? 'Yes' : 'No'
      }));
    setAvailability(availableDays);
  };
  const columns = [
    {
      title: 'Actions',
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      flex: 1,
      minWidth: 80,
      maxWidth: 80,
      getActions: ({ row }: any) => {
        const isActive = row?.isActive === 1;
        return [
          <GridActionsCellItem
            key={'update'}
            showInMenu
            icon={<EditIcon sx={{ fontSize: 18, color: '#fb8c00' }} />}
            label={constant.Update}
            disabled={!isActive}
            onClick={() => {
              handleUpdate(row);
            }}
          />,
          <GridActionsCellItem
            showInMenu
            key={'active'}
            icon={
              isActive ? (
                <BlockIcon sx={{ fontSize: 18, color: '#616161' }} />
              ) : (
                <CheckCircleIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
              )
            }
            label={isActive ? constant.Deactive : constant.ActiveStatus}
            onClick={() => {
              setFilteredRow(row);
              setActionMessage({
                action: true,
                message: `Are you sure want to ${
                  isActive ? 'deactivate' : 'activate'
                } this tour?`,
                actionName: () => {
                  handleDeactivate(row);
                }
              });
            }}
          />,
          <GridActionsCellItem
            showInMenu
            key={'delete'}
            icon={<DeleteOutlineIcon sx={{ fontSize: 18, color: '#f44336' }} />}
            label={constant.Delete}
            disabled={!isActive}
            onClick={() => {
              setFilteredRow(row);
              setActionMessage({
                action: true,
                message:
                  'This might impact the scheduled tours.Are you sure want to delete this tour?',
                actionName: () => {
                  handleDelete(row);
                }
              });
            }}
          />
        ];
      }
    },
    {
      title: 'Status',
      field: 'isActive',
      headerName: 'Status',
      flex: 1,
      sortable: false,
      minWidth: 80,
      maxWidth: 80,
      renderCell: ({ value, row }: any) => (
        <IconButton
          onClick={(e: any) => {
            e.stopPropagation();
            handlesetDeactive(row);
          }}
        >
          {value == 1 ? (
            <Icon
              icon='carbon:circle-filled'
              style={{ color: '#0EBC93', fontSize: '16px' }}
              onClick={(e: any) => {
                e.stopPropagation();
                handlesetDeactive(row);
              }}
            />
          ) : (
            <Icon
              icon='carbon:circle-filled'
              style={{ color: '#FF2532', fontSize: '16px' }}
              onClick={(e: any) => {
                e.stopPropagation();
                handlesetDeactive(row);
              }}
            />
          )}
        </IconButton>
      )
    },
    {
      title: 'Availability',
      field: 'availability',
      headerName: 'Availability',
      flex: 1,
      sortable: false,
      minWidth: 100,
      maxWidth: 100,
      renderCell: ({ row }: any) => {
        return (
          <Box
            className='view-available'
            onClick={(e: any) => {
              e.stopPropagation();
              handleViewAvilability(row);
              // setFilteredRow(row);
              // setAvailability(true);
            }}
            tabIndex={0}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleViewAvilability(row);
              }
            }}
          >
            <Icon icon='mdi:calendar-clock' className='view-available-icon' />
            <Typography className='view-available-text'>View</Typography>
          </Box>
        );
      }
    },
    {
      title: 'Tour Name',
      field: 'tourName',
      headerName: 'Tour Name',
      flex: 1,
      minWidth: 160,
      maxWidth: 160
    },
    {
      title: 'Agent Name',
      field: 'agentName',
      headerName: 'Agent Name',
      flex: 1,
      minWidth: 120,
      maxWidth: 120,
      renderCell: ({ row }: any) => {
        return Boolean(row?.agentName) ? row?.agentName : '-';
      }
    },
    {
      title: 'Source Name',
      headerName: 'Source Name',
      field: 'sourcePlace',
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: ({ row }: any) => {
        return (
          <Box sx={{ width: '100%' }}>
            <Tooltip title={row?.source.place}>
              <Typography noWrap sx={{ width: '200px', fontSize: '12px' }}>
                {row?.source.place}
              </Typography>
            </Tooltip>
          </Box>
        );
      }
    },
    {
      title: 'Pickup Address',
      headerName: 'Pickup Address',
      field: 'pickup',
      sortable: false,
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: ({ row }: any) => {
        return (
          <Box sx={{ width: '200px', display: 'flex' }}>
            <Tooltip title={row?.source.locationAddress}>
              <Typography noWrap sx={{ fontSize: '12px' }}>
                {row?.source?.locationAddress}
              </Typography>
            </Tooltip>
          </Box>
        );
      }
    },
    {
      title: 'Destination Name',
      headerName: 'Destination Name',
      field: 'destinationPlace',
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: ({ row }: any) => {
        return (
          <Box sx={{ width: '200px', display: 'flex' }}>
            <Tooltip title={row?.destination?.place}>
              <Typography noWrap sx={{ fontSize: '12px' }}>
                {row?.destination.place}
              </Typography>
            </Tooltip>
          </Box>
        );
      }
    },
    {
      title: 'Drop Address',
      headerName: 'Drop Address',
      field: 'drop',
      flex: 1,
      sortable: false,
      minWidth: 200,
      maxWidth: 200,
      renderCell: ({ row }: any) => {
        return (
          <Box sx={{ width: '200px', display: 'flex' }}>
            <Tooltip title={row?.destination?.locationAddress}>
              <Typography noWrap sx={{ fontSize: '12px' }}>
                {row?.destination?.locationAddress}
              </Typography>
            </Tooltip>
          </Box>
        );
      }
    },
    {
      title: 'Trip Window',
      field: 'tripWindow',
      headerName: 'Trip Window',
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }: any) => {
        return (
          <Typography sx={{ fontSize: '12px' }}>
            {`${twelveHRformat(row?.time)} -
            ${twelveHRformat(row?.endTime)}`}
          </Typography>
        );
      }
    },
    {
      title: 'Vehicle No',
      field: 'vehicleNumber',
      headerName: 'Vehicle No',
      flex: 1,
      minWidth: 120,
      maxWidth: 120,
      renderCell: ({ row }: any) => {
        return Boolean(row?.vehicleNumber) ? row?.vehicleNumber.toUpperCase() : '-';
      }
    },
    {
      title: 'Driver Name',
      field: 'driverName',
      headerName: 'Driver Name',
      flex: 1,
      minWidth: 120,
      maxWidth: 120,
      renderCell: ({ row }: any) => {
        return Boolean(row?.driverName) ? capitalizeFirstLetter(row?.driverName) : '-';
      }
    },

    {
      title: 'Buffer Time',
      field: 'bufferTime',
      headerName: 'Buffer Time',
      flex: 1,
      minWidth: 100,
      maxWidth: 100,
      renderCell: ({ row }: any) => {
        return Boolean(row?.bufferTime) ? row?.bufferTime : '-';
      }
    },

    {
      title: 'Child Count',
      field: 'childCount',
      headerName: 'Child Count',
      flex: 1,
      sortable: false,
      minWidth: 100,
      maxWidth: 100,
      renderCell: ({ row }: any) => {
        return Boolean(row?.childCount) ? row?.childCount : '-';
      }
    },
    {
      title: 'Adult Count',
      field: 'adultCount',
      headerName: 'Adult Count',
      sortable: false,
      flex: 1,
      minWidth: 100,
      maxWidth: 100,
      renderCell: ({ row }: any) => {
        return Boolean(row?.adultCount) ? row?.adultCount : '-';
      }
    }
  ];

  const rows = data;

  return {
    columns,
    rows,
    filteredRow,
    setFilteredRow,
    actionMessage,
    setActionMessage,
    handleUpdate,
    availability,
    setAvailability
  };
};

//custom hook to handle pagination,search,sort ,filter
const usePagination = ({
  pageno = 1,
  pagesize = 10,
  searchValue = '',
  url,
  payloads
}: any) => {
  const [pageNo, setPageNo] = useState(pageno);
  const [pageSize, setPageSize] = useState(pagesize);
  const [search, setSearch] = useState(searchValue);
  const [sort, setSorting] = useState<any>(null);

  const dispatch = useAppDispatch();
  const handlePagination = async (newModel: any) => {
    const { page: newPageNo, pageSize: newPageSize } = newModel;
    setPageNo(newPageNo + 1);
    setPageSize(newPageSize);
    await dispatch(url({ pageNo: newPageNo + 1, pageSize: newPageSize, ...payloads }));
  };

  const handleSearchChange = debounce(async (value: any) => {
    setSearch(value);
    setPageNo(1);
    await dispatch(url({ pageNo: 1, pageSize: pageSize, search: value, ...payloads }));
  }, 1000);

  const handleSortChange = async (sortModel: any) => {
    const [{ field, sort }] = sortModel;
    setSorting({
      sortBy: sort.toUpperCase(),
      sortField: field
    });
    await dispatch(
      url({
        pageNo: 1,
        pageSize: pageSize,
        search: search,
        sortBy: sort.toUpperCase(),
        sortField: field
      })
    );
  };

  return {
    pageNo,
    pageSize,
    search,
    sort,
    setPageNo,
    setPageSize,
    setSearch,
    setSorting,
    handlePagination,
    handleSearchChange,
    handleSortChange
  };
};

export { useTableDatas, usePagination };
