import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  CardHeader,
  IconButton,
  Divider,
  Box,
  Alert,
  Menu,
  MenuItem,
  Grid,
  Tooltip,
  Zoom,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  useMediaQuery,
  Chip,
  Slide,
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Icon } from '@iconify/react';
import { GridActionsCellItem, GridCellParams } from '@mui/x-data-grid';
import constant from '../../../../../utils/constants';
import CustomDataGrid from '../../../../../common/components/customized/customdatagrid/CustomDataGrid';
import CustomButton from '../../../../../common/components/buttons/CustomButton';
import AddRouteConfigaration from './component/AddRouteConfigaration';
import { useForm } from 'react-hook-form';

import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch, useAppSelector } from '../../../../../app/redux/hooks';
import { TransitionProps } from '@mui/material/transitions';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  convertTo12HourFormat,
  debounce,
  formatISTtoTime,
  usePagination,
  useAbort
} from '../../../../../utils/commonFunctions';
import CustomTab from '../../../../../common/components/tab/CustomTab';
import CustomTextField from '../../../../../common/components/customized/customtextfield/CustomTextField';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import './RouteConfiguration.scss';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  autoFilterRoute,
  autoGetRouteAction,
  clearRouteConfigure,
  cleartourError,
  routeConfigureDeleteAction
} from '../../../redux/reducer/autoPlannerSlices/autoplannerConfigurationSlice';
import { autoPlannerRoutesAction } from '../../../redux/reducer/autoPlannerSlices/autoplanner';
import RegularMode from '../regular/RegularMode';

interface Row {
  id: number;
  TripName: string;
  PickUpLocation: string;
  DropLocation: string;
  PickUpTime: string;
  ReturnTime: string;
}

interface PaginationModel {
  page: number;
  pageSize: number;
  tourType?: string;
}

interface Route {
  routeName: string;
  source: {
    locationAddress: string;
    lat: number;
    lng: number;
  };
  destination: {
    locationAddress: string;
    lat: number;
    lng: number;
  };
  pickupTimeWindows: Array<{
    start: string;
    end: string;
  }>;
  duration: number;
  distance: number;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const RouteConfiguration = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [isDelete, setIsDelete] = useState(false);
  const [payload, setPayload] = useState<any>(null);
  const [rows, setRows] = useState<Route[]>([]);

  const [deleteError, setDeleteError] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const openMenu = Boolean(anchorEl);
  const [errorMessage, setErrorMessage] = useState('');
  const [rowCount, setRowCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [sortModel, setSortModel] = useState<any>([]);
  const [tabValue, setTabValue] = useState(0);
  const [tripMode, setTripMode] = useState<string>('TWO_WAY_TOUR');
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState('');
  const dispatch = useAppDispatch();
  const createAbort = useAbort();
  const routes = useAppSelector(state => state.autoGetRoute);
  const deleteRoute = useAppSelector(state => state.deleteRouteConfigure);
  const filterRoute = useAppSelector(state => state.filterRouteDetails);
  const Routes = useAppSelector(state => state.autoPlannerRoutes.data || []);
  const { data } = useAppSelector(state => state.auth);

  let roletype = data?.role;

  const { handleSubmit, control, getValues, reset, watch, setValue } = useForm();

  // Watch all form fields to clear error if any field is filled
  const watchedFields = watch([
    'route',
    'pickup',
    'droplocation',
    'picktime1',
    'picktime2',
    'droptime'
  ]);

  // Clear the error message when any field is filled
  useEffect(() => {
    const { route, pickup, droplocation, picktime1, picktime2, droptime } = getValues();
    if (route || pickup || droplocation || picktime1 || picktime2 || droptime) {
      setErrorMessage('');
    }
  }, [watchedFields, getValues]);

  useEffect(() => {
    if (deleteRoute?.error == 'Something went wrong') {
      setDeleteError(true);
    }
  }, [deleteRoute?.error]);

  const onSubmit = (data: any) => {
    const filter = {
      ...data,
      pageNo,
      pageSize,
      picktime1: data.picktime1 ? formatISTtoTime(data.picktime1) : undefined,
      picktime2: data.picktime2 ? formatISTtoTime(data.picktime2) : undefined,
      droptime: data.droptime ? formatISTtoTime(data.droptime) : undefined
    };
    dispatch(autoFilterRoute(filter));
    const { route, pickup, droplocation, picktime1, picktime2, droptime } = getValues();
    // Check if all fields are empty or zero
    if (!(route || pickup || droplocation || picktime1 || picktime2 || droptime)) {
      setErrorMessage('Please fill in at least one field!');
      return;
    }
    setErrorMessage('');
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, row: Row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddRouteConfiguration = () => {
    setIsOpen(true);
    setSelectedRow(null);
  };

  const handleUpdateRoute = () => {
    setIsOpen(true);
    handleMenuClose();
  };

  const onclose = () => {
    setDeleteError(false);
    dispatch(cleartourError());
  };

  const handleTrip = async (e: any, newValue: any) => {
    setTabValue(newValue);
    setPageNo(1);
    setPageSize(10);
    switch (newValue) {
      case 0:
        setTripMode('TWO_WAY_TOUR');
        setValue('search', '');
        setFilter('');
        await dispatch(
          autoGetRouteAction({
            pageNo: 1,
            pageSize: 10,
            tourType: 'TWO_WAY_TOUR'
          })
        );
        break;

      case 1:
        setTripMode('DISPOSAL');
        setValue('search', '');
        setFilter('');
        await dispatch(
          autoGetRouteAction({
            pageNo: 1,
            pageSize: 10,
            isRoundTour: 0,
            tourType: 'DISPOSAL'
          })
        );
        break;
      default:
        break;

      case 2:
        setTripMode('REGULAR');
        // setValue('search', '');
        // setFilter('');

        break;
    }
  };

  let tripList = ['Two Way Tour', 'Disposal / Round Tour', 'Regular Tour'];

  const clearFilter = () => {
    reset({
      route: '',
      pickup: '',
      drop: '',
      triptype: '',
      startTime: null,
      endTime: null,
      tranfer: '',
      transferTime: null
    });

    const payload = { pageNo, pageSize };
    dispatch(autoGetRouteAction(payload));
    setErrorMessage('');
  };

  const handleToggle = () => {
    setExpanded(!expanded);
    if (expanded) clearFilter();
  };

  const handlePaginationModelChange = async (newPaginationModel: PaginationModel) => {
    const { pageSize: newPageSize, page: newPageNo } = newPaginationModel;
    setPageSize(newPageSize);
    setPageNo(newPageNo + 1);
    const newPage = newPageNo + 1;
    const params = {
      ...payload,
      pageNo: newPage,
      pageSize: newPageSize,
      tourType: tripMode,
      searchFor: filter,
      isRoundTour: tripMode === 'RoundTrip' ? 1 : 0
    };
    setPayload(params);
    await dispatch(autoGetRouteAction(params));
  };

  const columns = [
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 100,
      flex: 1,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <Box className='actions'>
          <Tooltip title='Menu' placement='right' arrow>
            <IconButton
              id='basic-button'
              aria-haspopup='true'
              onClick={event => {
                event.stopPropagation();
                handleMenuClick(event, params.row);
              }}
            >
              <Icon icon='eva:menu-2-outline' className='menu-bg' />
            </IconButton>
          </Tooltip>
          <Menu
            id='basic-menu'
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button'
            }}
          >
            <MenuItem className='menu-dialog' onClick={handleUpdateRoute} key='update'>
              <Icon icon='ic:baseline-edit' className='menu-icon update' />
              {constant.Update}
            </MenuItem>
            <MenuItem
              className='menu-dialog'
              onClick={() => {
                setIsDelete(true);
                handleMenuClose();
              }}
              key='delete'
            >
              <Icon
                icon='ic:outline-delete'
                className='menu-icon'
                style={{ color: '#FF4343' }}
              />
              {constant.Delete}
            </MenuItem>
          </Menu>
        </Box>
      )
    },
    {
      field: 'tourName',
      name: 'tourName',
      headerName: 'Tour Name',
      width: 350
    },
    {
      field: 'aliasesView',
      name: 'aliases',
      headerName: 'Aliases',
      width: 300,
      renderCell: ({ row }: any) => {
        return (
          <Tooltip title={row?.value}>
            <Typography sx={{ width: '300px', fontSize: '12px' }} noWrap>
              {row?.value}
            </Typography>
          </Tooltip>
        );
      }
    },
    {
      field: 'mode',
      name: 'mode',
      headerName: 'Tour Mode',
      width: 100
    },
    {
      field: 'pickupWindow',
      name: 'pickupTimeWindows',
      headerName: 'Pickup Window',
      width: 250
    },
    {
      field: 'duration',
      name: 'duration',
      headerName: 'Time Duration',
      width: 200,
      editable: true
    }
  ];

  const TowWaycolumns = [
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      minWidth: 100,
      flex: 1,
      sortable: false,
      getActions: (params: GridCellParams) => {
        return [
          <GridActionsCellItem
            key={'update'}
            showInMenu
            icon={<EditIcon sx={{ fontSize: 18, color: '#fb8c00' }} />}
            label={constant.Update}
            onClick={event => {
              handleMenuClick(event, params?.row);
              handleUpdateRoute();
            }}
          />,
          <GridActionsCellItem
            showInMenu
            key={'delete'}
            icon={<DeleteOutlineIcon sx={{ fontSize: 18, color: '#f44336' }} />}
            label={constant.Delete}
            onClick={event => {
              setIsDelete(true);
              handleMenuClick(event, params.row);
            }}
          />
        ];
      }
    },
    {
      field: 'tourName',
      name: 'tourName',
      headerName: 'Tour Name',
      width: 300,
      renderCell: (params: GridCellParams) => (
        <Tooltip title={String(params.value ?? '')} arrow>
          <span>{String(params.value ?? '')}</span>
        </Tooltip>
      )
    },
    {
      field: 'aliasesView',
      headerName: 'Aliases',
      name: 'aliases',
      width: 300,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <Tooltip
          title={String(params.value && params.value !== '-' ? params.value : '')}
          arrow
        >
          <Typography sx={{ width: '300px', fontSize: '12px' }} noWrap>
            {String(params.value ?? '')}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'mode',
      name: 'mode',
      headerName: 'Tour Mode',
      width: 100,
      renderCell: (params: GridCellParams) => (
        <Tooltip title={String(params.value ?? '')} arrow>
          <span>{String(params.value ?? '')}</span>
        </Tooltip>
      )
    },
    {
      field: 'pickupWindow',
      name: 'pickupTimeWindows',
      headerName: 'Pickup Window',
      width: 180,
      // renderCell: (params: GridCellParams) => (
      //   <Tooltip title={String(params.value ?? '')} arrow>
      //     <span>{String(params.value ?? '')}</span>
      //   </Tooltip>
      // )

      renderCell: (params: GridCellParams) => {
        const value = params.value ?? '-';
        return (
          <Tooltip title={String(value !== '-' ? value : '')} arrow>
            <span>{String(value)}</span>
          </Tooltip>
        );
      }
    },
    {
      field: 'returnDuration',
      name: 'returnTime',
      headerName: 'Return Time',
      width: 100,
      editable: true,
      renderCell: (params: GridCellParams) => (
        <Tooltip title={String(params.value ?? '')} arrow>
          <span>{String(params.value ?? '')}</span>
        </Tooltip>
      )
    },
    {
      field: 'location',
      name: 'location',
      headerName: 'Location',
      width: 350,
      renderCell: (params: GridCellParams) => (
        <Tooltip title={String(params.value ?? '')} arrow>
          <span>{String(params.value ?? '')}</span>
        </Tooltip>
      )
    }
  ];

  const OneWayColumn = [
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 100,
      flex: 1,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <Box className='actions'>
          <Tooltip title='Menu' placement='right' arrow>
            <IconButton
              id='basic-button'
              aria-haspopup='true'
              onClick={event => {
                event.stopPropagation();
                handleMenuClick(event, params.row);
              }}
            >
              <Icon icon='eva:menu-2-outline' className='menu-bg' />
            </IconButton>
          </Tooltip>
          <Menu
            id='basic-menu'
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button'
            }}
          >
            <MenuItem className='menu-dialog' onClick={handleUpdateRoute} key='update'>
              <Icon icon='ic:baseline-edit' className='menu-icon update' />
              {constant.Update}
            </MenuItem>
            <MenuItem
              className='menu-dialog'
              onClick={() => {
                setIsDelete(true);
                handleMenuClose();
              }}
              key='delete'
            >
              <Icon
                icon='ic:outline-delete'
                className='menu-icon'
                style={{ color: '#FF4343' }}
              />
              {constant.Delete}
            </MenuItem>
          </Menu>
        </Box>
      )
    },
    {
      field: 'tourName',
      name: 'tourName',
      headerName: 'Tour Name',
      width: 300
    },
    {
      field: 'aliasesView',
      name: 'aliases',
      headerName: 'Aliases',
      width: 300,
      sortable: false
    },
    {
      field: 'mode',
      name: 'mode',
      headerName: 'Tour Mode',
      width: 100
    },
    {
      field: 'pickupWindow',
      name: 'pickupTimeWindows',
      headerName: 'Pickup Window',
      width: 200
    },
    {
      field: 'returnDuration',
      name: 'returnTime',
      headerName: 'Return Time',
      width: 100,
      editable: true
    },
    {
      field: 'location',
      name: 'location',
      headerName: 'Location',
      width: 350
    }
  ];

  const DisposalColumn = [
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      minWidth: 100,
      flex: 1,
      sortable: false,
      getActions: (params: GridCellParams) => {
        return [
          <GridActionsCellItem
            key={'update'}
            showInMenu
            icon={<EditIcon sx={{ fontSize: 18, color: '#fb8c00' }} />}
            label={constant.Update}
            onClick={event => {
              handleMenuClick(event, params.row);
              handleUpdateRoute();
            }}
          />,
          <GridActionsCellItem
            showInMenu
            key={'delete'}
            icon={<DeleteOutlineIcon sx={{ fontSize: 18, color: '#f44336' }} />}
            label={constant.Delete}
            onClick={event => {
              setIsDelete(true);
              handleMenuClick(event, params.row);
            }}
          />
        ];
      }
      // renderCell: (params: GridCellParams) => (
      //   <Box className='actions'>
      //     <Tooltip title='Menu' placement='right' arrow>
      //       <IconButton
      //         id='basic-button'
      //         aria-haspopup='true'
      //         onClick={event => {
      //           event.stopPropagation();
      //           handleMenuClick(event, params.row);
      //         }}
      //       >
      //         <Icon icon='eva:menu-2-outline' className='menu-bg' />
      //       </IconButton>
      //     </Tooltip>
      //     <Menu
      //       id='basic-menu'
      //       anchorEl={anchorEl}
      //       open={openMenu}
      //       onClose={handleMenuClose}
      //       MenuListProps={{
      //         'aria-labelledby': 'basic-button'
      //       }}
      //     >
      //       <MenuItem className='menu-dialog' onClick={handleUpdateRoute} key='update'>
      //         <Icon icon='ic:baseline-edit' className='menu-icon update' />
      //         {constant.Update}
      //       </MenuItem>
      //       <MenuItem
      //         className='menu-dialog'
      //         onClick={() => {
      //           setIsDelete(true);
      //           handleMenuClose();
      //         }}
      //         key='delete'
      //       >
      //         <Icon
      //           icon='ic:outline-delete'
      //           className='menu-icon'
      //           style={{ color: '#FF4343' }}
      //         />
      //         {constant.Delete}
      //       </MenuItem>
      //     </Menu>
      //   </Box>
      // )
    },
    {
      field: 'tourName',
      name: 'tourName',
      headerName: 'Tour Name',
      width: 300,
      renderCell: (params: GridCellParams) => (
        <Tooltip title={String(params.value ?? '')} arrow>
          <span>{String(params.value ?? '')}</span>
        </Tooltip>
      )
    },
    {
      field: 'aliasesView',
      name: 'aliases',
      headerName: 'Aliases',
      width: 300,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <Tooltip title={String(params.value ?? '')} arrow>
          <Typography sx={{ width: '300px', fontSize: '12px' }} noWrap>
            {String(params.value ?? '')}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'pickupWindow',
      name: 'pickupTimeWindows',
      headerName: 'Pickup Window',
      width: 250,
      renderCell: (params: GridCellParams) => {
        const value = params.value ?? '-';
        return (
          <Tooltip title={String(value)} arrow>
            <span>{String(value)}</span>
          </Tooltip>
        );
      }
    },
    {
      field: 'mode',
      name: 'mode',
      headerName: 'Tour Mode',
      width: 100,
      renderCell: (params: GridCellParams) => (
        <Tooltip title={String(params.value ?? '')} arrow>
          <span>{String(params.value ?? '')}</span>
        </Tooltip>
      )
    },
    {
      field: 'destinationDetailsWrapper',
      name: 'destinationDetailsWrapper',
      headerName: 'Location',
      width: 300,
      renderCell: (params: GridCellParams) => {
        const destinationWrapper = (params.value as { destinations?: any[] }) ?? {};
        const destinations = destinationWrapper.destinations ?? [];

        if (destinations.length === 0) {
          return <span>-</span>;
        }

        const locationText = destinations
          .map((d: any) => d.location?.locationAddress ?? 'Unknown')
          .join(', ');

        return (
          <Tooltip title={locationText} arrow>
            <span>{locationText}</span>
          </Tooltip>
        );
      }
    },
    {
      field: 'duration',
      name: 'duration',
      headerName: 'Duration',
      width: 200,
      renderCell: (params: GridCellParams) => (
        <Tooltip title={String(params.value ?? '')} arrow>
          <span>{String(params.value ?? '')}</span>
        </Tooltip>
      )
    }
  ];

  const configuredRoute =
    Routes?.map((value: string) => ({
      id: value,
      label: value
    })) || [];

  const handleDeleteTour = async () => {
    const params = {
      ...payload,
      ...selectedRow,
      pageNo: pageNo,
      pageSize: pageSize,
      tourType: tripMode,
      searchFor: filter,
      isRoundTour: tripMode === 'RoundTrip' ? 1 : 0
    };
    setPayload(params);
    if (selectedRow) await dispatch(routeConfigureDeleteAction({ params }));

    setIsDelete(false);
  };

  useEffect(() => {
    const payload = {
      pageNo,
      pageSize,
      isRoundTour: tripMode === 'RoundTrip' ? 1 : 0,
      tourType: 'TWO_WAY_TOUR'
    };
    dispatch(autoGetRouteAction(payload));
    dispatch(autoPlannerRoutesAction({ mode: 'TWO_WAY_TOUR' }));
    return () => {
      createAbort().abortCall.abort();
    };
  }, []);

  const handleSortModelChange = (model: any, column: any) => {
    setSortModel(model);
    const fieldName = model[0]?.field;
    const columnMatch = column.find((col: any) => col.field === fieldName);
    const payloads = {
      ...payload,
      sortBy: model[0]?.sort?.toUpperCase(),
      sortByField: columnMatch?.name || fieldName,
      pageNo: pageNo,
      pageSize: pageSize,
      tourType: tripMode,
      searchFor: filter
    };
    setPayload(payloads);
    dispatch(autoGetRouteAction(payloads));
  };

  const handleFilterChange = useCallback(
    debounce(async (event: string, trip: string) => {
      setFilter(event);
      const payloads = {
        ...payload,
        pageNo: 1,
        pageSize: pageSize,
        searchFor: event,
        tourType: tripMode,
        isRoundTour: trip === 'RoundTrip' ? 1 : 0
      };
      setPayload(payloads);
      if (rows) {
        await dispatch(autoGetRouteAction(payloads));
      }
    }),
    [tripMode, pageSize, payload]
  );

  useEffect(() => {
    clearRouteConfigure();
    setRows([]);
    if (routes?.data?.data !== null && routes?.data?.data?.standardTourView) {
      const routedata = routes?.data?.data?.standardTourView.map(
        (item: any, index: number) => ({
          ...item,
          id: item.id,
          tourName: item.tourName,
          location: item.location?.locationAddress,
          pickupWindow: item?.pickupTimeWindows?.start
            ? `${convertTo12HourFormat(
                item.pickupTimeWindows.start
              )} - ${convertTo12HourFormat(item.pickupTimeWindows.end)}`
            : null,
          pickupWindowFrom: item?.pickupTimeWindows?.start
            ? item?.pickupTimeWindows?.start
            : 'N/A',
          pickupWindowTo: item?.pickupTimeWindows?.end,
          timeDuration: item.duration,
          returnDuration: item?.returnTime
            ? convertTo12HourFormat(item?.returnTime)
            : null,
          locations: item.location,
          aliasesView: item?.aliases?.length > 0 ? item?.aliases?.join(', ') : '-'
        })
      );
      setRowCount(routes.data.data.count);
      setRows(routedata);
    } else {
      setRows([]);
    }
  }, [routes?.data, tripMode]);

  return (
    <Box className='route-configuration'>
      {tripMode !== 'REGULAR' && (
        <Box className='add-tour'>
          <CustomButton
            className='saveChanges'
            category='Add New Tour'
            onClick={handleAddRouteConfiguration}
          />
        </Box>
      )}
      <Box className='route-configure-header'>
        <Box sx={{ padding: '20px', maxWidth: '100%' }}>
          <CustomTab onChange={handleTrip} value={tabValue} tabList={tripList} />
        </Box>
        {tripMode !== 'REGULAR' && (
          <Box className='route-search'>
            <Box sx={{ width: 200 }}>
              <CustomTextField
                name='search'
                control={control}
                id='filter-input'
                placeholder='Search...'
                value={filter}
                variant='standard'
                icon={<SearchOutlinedIcon color='primary' />}
                onChangeCallback={(e: any) => handleFilterChange(e, tripMode)}
              />
            </Box>
          </Box>
        )}
      </Box>
      {tripMode === 'ROUND_TOUR' ? (
        <CustomDataGrid
          rows={rows}
          columns={columns}
          onPaginationModelChange={handlePaginationModelChange}
          loading={routes?.isLoading}
          rowCount={rowCount}
          onSortModelChange={(model: any) => handleSortModelChange(model, columns)}
          pageNo={pageNo}
          onRowClick={(id, row) => {
            handleUpdateRoute();
            setSelectedRow(row);
          }}
          type='logistics'
          pageSize={pageSize}
          paginationModel={{
            page: pageNo ? pageNo - 1 : 0,
            pageSize: pageSize || 10
          }}
        />
      ) : tripMode === 'TWO_WAY_TOUR' ? (
        <CustomDataGrid
          rows={rows}
          columns={TowWaycolumns}
          sortingMode='server'
          onPaginationModelChange={handlePaginationModelChange}
          loading={routes?.isLoading}
          onSortModelChange={(model: any) => handleSortModelChange(model, TowWaycolumns)}
          rowCount={rowCount}
          onRowClick={(id, row) => {
            handleUpdateRoute();
            setSelectedRow(row);
          }}
          pageNo={pageNo}
          type='logistics'
          pageSize={pageSize}
          paginationModel={{
            page: pageNo ? pageNo - 1 : 0,
            pageSize: pageSize || 10
          }}
        />
      ) : tripMode === 'ONE_WAY_TOUR' ? (
        <CustomDataGrid
          rows={rows}
          columns={OneWayColumn}
          onPaginationModelChange={handlePaginationModelChange}
          loading={routes?.isLoading}
          rowCount={rowCount}
          pageNo={pageNo}
          type='logistics'
          onRowClick={(id, row) => {
            handleUpdateRoute();
            setSelectedRow(row);
          }}
          pageSize={pageSize}
          paginationModel={{
            page: pageNo ? pageNo - 1 : 0,
            pageSize: pageSize || 10
          }}
        />
      ) : tripMode === 'REGULAR' ? (
        <RegularMode />
      ) : tripMode === 'DISPOSAL' ? (
        <CustomDataGrid
          rows={rows}
          columns={DisposalColumn}
          sortingMode='server'
          onRowClick={(id, row) => {
            handleUpdateRoute();
            setSelectedRow(row);
          }}
          onSortModelChange={(model: any) => handleSortModelChange(model, DisposalColumn)}
          onPaginationModelChange={handlePaginationModelChange}
          loading={routes?.isLoading}
          rowCount={rowCount}
          pageNo={pageNo}
          type='logistics'
          pageSize={pageSize}
          paginationModel={{
            page: pageNo ? pageNo - 1 : 0,
            pageSize: pageSize || 10
          }}
        />
      ) : null}

      {isOpen && (
        <AddRouteConfigaration
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          selectedRow={selectedRow}
          pageDetails={{ ...payload, pageNo, pageSize, searchFor: filter }}
          mode={tripMode}
          setTourMode={handleTrip}
        />
      )}

      <Dialog
        open={deleteError}
        onClose={onclose}
        maxWidth='xs'
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: 5,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(255, 107, 107, 0.25)',
            backdropFilter: 'blur(12px)',
            boxShadow:
              '0 25px 50px rgba(255, 107, 107, 0.25), 0 10px 20px rgba(0, 0, 0, 0.1)'
          }
        }}
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(6px)'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box
            sx={{
              height: 6,
              background: 'linear-gradient(90deg, #ff4e50, #f9d423)'
            }}
          />

          <Box sx={{ p: 3, pb: 2.5, position: 'relative' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ErrorOutlineIcon sx={{ color: '#ff4e50', fontSize: 28 }} />
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    color: '#e74c3c',
                    letterSpacing: 0.5
                  }}
                >
                  Unable to Delete
                </Typography>
              </Box>

              <IconButton
                onClick={onclose}
                sx={{
                  width: 38,
                  height: 38,
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  color: '#2c3e50',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255,107,107,0.15)',
                    color: '#e74c3c'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ pl: 0.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  mb: 1.5,
                  gap: 1.5
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    mt: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#e74c3c'
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    color: '#2c3e50',
                    lineHeight: 1.5
                  }}
                >
                  This tour has been assigned in some of the bookings, so it cannot be
                  deleted.
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    mt: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#e74c3c'
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    color: '#2c3e50',
                    lineHeight: 1.5
                  }}
                >
                  To delete this tour, please remove the bookings under the tour name
                  first.
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={isDelete}>
        <Box
          sx={{
            textAlign: 'center',
            padding: '5%',
            minWidth: '350px'
          }}
        >
          <Typography>Are You Sure You Want to Delete This Tour?</Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              paddingTop: '5%',
              justifyContent: 'center'
            }}
          >
            <Box sx={{ marginRight: '12px' }}>
              <CustomButton
                className='saveChanges'
                category='Yes'
                onClick={() => {
                  handleDeleteTour();
                }}
                loading={deleteRoute.isLoading}
              />
            </Box>
            <CustomButton
              className='cancel'
              category='No'
              onClick={() => {
                setIsDelete(false);
                createAbort().abortCall.abort();
              }}
            />
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default RouteConfiguration;
