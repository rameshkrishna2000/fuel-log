import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '../../../../../app/redux/hooks';
import { autoGetVechicleAction } from '../../../redux/reducer/autoPlannerSlices/autoplannerConfigurationSlice';
import { debounce } from 'lodash';
import {
  deactivateVehicleAction,
  vehicleDeleteAction
} from './components/vehicleOnboard';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import CustomIconButton from '../../../../../common/components/buttons/CustomIconButton';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { Icon } from '@iconify/react';
import constant from '../../../../../utils/constants';
import { Badge, BadgeProps, Box, IconButton, styled, Typography } from '@mui/material';

interface PaginationModel {
  page: number;
  pageSize: number;
}

//Hook for States
export const useCommonStateHooks = () => {
  const [vechileRows, setVechileRows] = useState<any[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [pageSize, setPageSize] = useState(10);
  const [payload, setPayload] = useState<any>({ pageNo, pageSize });
  const [open, setOpen] = useState<boolean>(false);
  const [drawer, setDrawer] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [filter, setFilter] = useState('');
  const [isDialog, setIsDialog] = useState('');
  const [sortModel, setSortModel] = useState<any>([]);
  const [selected, setSelected] = useState(true);
  const [isDialogsortModel, setIsDialogsortModel] = useState(true);

  return {
    vechileRows,
    setIsDialog,
    setVechileRows,
    pageNo,
    setPageNo,
    anchorEl,
    setAnchorEl,
    pageSize,
    setPageSize,
    payload,
    setPayload,
    open,
    setOpen,
    drawer,
    setDrawer,
    selectedRow,
    setSelectedRow,
    filter,
    setFilter,
    isDialog,
    setIsDialogsortModel,
    setSortModel,
    selected,
    setSelected
  };
};

//Hook for Datagrid Actions
export const useDataGridActionsHooks = ({
  setSelected,
  dispatch,
  setSelectedRow,
  setAnchorEl,
  APoperator,
  setOpen,
  setFilter,
  setPayload,
  payload,
  pageSize,
  setPageSize,
  operatorUser,
  setPageNo,
  setSortModel,
  setDrawer,
  selectedRow,
  pageNo,
  setIsDialog
}: any) => {
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleUpdateVehicle = () => {
    setOpen(true);
    // handleMenuClose();
  };

  const handleFilterChange = useCallback(
    debounce((event: string) => {
      setFilter(event);
      const payloads = {
        ...payload,
        pageNo: 1,
        pageSize: pageSize,
        vehicleNumber: event
      };
      setPayload(payloads);
      dispatch(autoGetVechicleAction(payloads));
    }, 500),
    [pageSize, payload]
  );

  const handlePaginationModelChange = (newPaginationModel: PaginationModel) => {
    const { pageSize: newPageSize, page: newPageNo } = newPaginationModel;
    setPageSize(newPageSize);
    setPageNo(newPageNo + 1);
    const newPage = newPageNo + 1;
    const params = {
      ...payload,
      pageNo: newPage,
      pageSize: newPageSize
    };
    setPayload(params);
  };

  const handleSortModelChange = (model: any) => {
    setSortModel(model);
    const payloads = {
      ...payload,
      sortBy: model[0]?.sort,
      sortByField: model[0]?.field === 'tripModesJoin' ? 'tripModes' : model[0]?.field
    };
    setPayload(payloads);
  };

  const handleDeactivate = async () => {
    await dispatch(deactivateVehicleAction(selectedRow.vehicleNumber));
    setPageNo(pageNo);
    setPageSize(pageSize);
    setIsDialog('');
    await dispatch(autoGetVechicleAction(payload));
  };

  const handleDeleteVehicle = async () => {
    const payloads = { vehicleNumber: selectedRow.vehicleNumber };
    await dispatch(vehicleDeleteAction(payloads));
    setIsDialog('');
    await dispatch(autoGetVechicleAction(payload));
  };

  const handleMenuClick = (row: any) => {
    setSelectedRow(row);
  };

  const handleDriverDetails = (row: any) => {
    setSelectedRow(row);
    setDrawer(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const StyledBadge = styled(Badge)<BadgeProps>(({ theme }: any) => ({
    '& .MuiBadge-badge': {
      right: -4,
      top: 10,
      border: `2px solid ${(theme.vars ?? theme).palette.background.paper}`,
      padding: '0 6px',
      fontSize: '11px',
      fontWeight: 600,
      backgroundColor: '#3239ea',
      color: '#fff',
      boxShadow: '0 0 4px rgba(0, 0, 0, 0.2)'
    }
  }));

  const columns = [
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      minWidth: 100,
      maxWidth: 100,
      flex: 1,
      getActions: (params: any) => {
        const row = params?.row;

        if (APoperator || operatorUser) {
          return [
            <GridActionsCellItem
              key='update'
              disabled={row?.isActive === 0}
              icon={<EditIcon sx={{ fontSize: 18, color: '#fb8c00' }} />}
              label='Update'
              onClick={() => {
                handleMenuClick(params.row);
                handleUpdateVehicle();
              }}
              showInMenu
            />
          ];
        }

        // 👇 Otherwise (other roles): show all actions
        return [
          <GridActionsCellItem
            key='update'
            disabled={row?.isActive === 0}
            icon={<EditIcon sx={{ fontSize: 18, color: '#fb8c00' }} />}
            label='Update'
            onClick={() => {
              handleMenuClick(params.row);
              handleUpdateVehicle();
            }}
            showInMenu
          />,
          row?.isActive === 0 ? (
            <GridActionsCellItem
              key='activate'
              icon={<CustomIconButton showTooltip={false} category='Active' />}
              label='Activate'
              onClick={() => {
                setIsDialog('dialog');
                setSelectedRow(row);
              }}
              showInMenu
            />
          ) : (
            <GridActionsCellItem
              key='deactivate'
              icon={<CustomIconButton showTooltip={false} category='Deactive' />}
              label='Deactivate'
              onClick={() => {
                setIsDialog('dialog');
                setSelectedRow(row);
              }}
              showInMenu
            />
          ),
          <GridActionsCellItem
            key='delete'
            disabled={row?.isActive === 0}
            icon={<DeleteOutlineIcon sx={{ fontSize: 18, color: '#f44336' }} />}
            label={constant.Delete}
            onClick={() => {
              handleMenuClick(params.row);
              setIsDialog('Delete');
              handleMenuClose();
            }}
            showInMenu
          />
        ];
      }
    },

    {
      field: 'isActive',
      headerName: 'Active',
      flex: 1,
      minWidth: 100,
      sortable: false,
      maxWidth: 100,
      renderCell: (params: any) => (
        <IconButton
          onClick={(event: any) => {
            event.stopPropagation();
            setIsDialog('dialog');
            setSelected(true);
            setSelectedRow(params?.row);
            handleClose();
          }}
        >
          {params?.row?.isActive === 1 ? (
            <Icon
              icon='carbon:circle-filled'
              style={{ color: '#0EBC93', fontSize: '16px' }}
              onClick={event => {
                event.stopPropagation();
                setIsDialog('dialog');
                setSelected(true);
                setSelectedRow(params?.row);
                handleClose();
              }}
            />
          ) : (
            <Icon
              icon='carbon:circle-filled'
              style={{ color: '#FF2532', fontSize: '16px' }}
              onClick={event => {
                event.stopPropagation();
                setIsDialog('dialog');
                setSelected(true);
                setSelectedRow(params?.row);
                handleClose();
              }}
            />
          )}
        </IconButton>
      )
    },
    {
      field: 'isTracking',
      headerName: 'Tracking Status',
      flex: 1,
      sortable: false,
      minWidth: 120,
      renderCell: ({ row }: any) => (
        <Icon
          icon={row?.isTracking ? 'simple-icons:ticktick' : 'zondicons:close-outline'}
          style={{ color: row?.isTracking ? '#0EBC93' : '#FF2532', fontSize: '16px' }}
        />
      )
    },
    {
      field: 'vehicleNumber',
      headerName: 'Vehicle Number',
      width: 150
    },
    {
      field: 'vehicleType',
      headerName: 'Vehicle Type',
      width: 100,
      renderCell: ({ value }: any) => value?.toUpperCase()
    },
    {
      field: 'tripModesJoin',
      headerName: 'Tour Modes',
      width: 250
    },
    {
      field: 'absoluteSeating',
      headerName: 'Absolute Seating',
      width: 150
    },
    {
      field: 'preferredSeating',
      headerName: 'Preferred Seating',
      width: 150
    },
    {
      field: 'standardSpeedLimit',
      headerName: 'Standard Speed Limit',
      width: 150
    },
    {
      field: 'viewdriver',
      headerName: 'Driver Details',
      minWidth: 100,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => {
        const count = params?.row?.driverDetails?.length;
        return (
          <>
            {count > 0 ? (
              <StyledBadge badgeContent={count} color='primary'>
                <Box
                  tabIndex={0}
                  className='view-driver'
                  onClick={event => {
                    event.stopPropagation();
                    handleDriverDetails(params?.row);
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleDriverDetails(params?.row);
                    }
                  }}
                >
                  <Icon icon='healthicons:truck-driver' className='view-driver-icon' />
                  <Typography className='view-driver-text'>View</Typography>
                </Box>
              </StyledBadge>
            ) : (
              <Typography className='no-driver-assigned'>No Driver</Typography>
            )}
          </>
        );
      }
    }
  ]?.map((item: any) => ({
    ...item,
    headerAlign: ['isTracking']?.includes(item?.field) ? 'center' : 'left',
    align: ['isTracking']?.includes(item?.field) ? 'center' : 'left'
  }));

  return {
    handleMenuClose,
    handleUpdateVehicle,
    handleFilterChange,
    handlePaginationModelChange,
    handleSortModelChange,
    columns,
    handleDeactivate,
    handleDeleteVehicle
  };
};

//hook for initial API Call and Useeffects
export const useRowHook = (
  dispatch: any,
  payload: any,
  vechileData: any,
  setVechileRows: any
) => {
  useEffect(() => {
    if (payload) dispatch(autoGetVechicleAction(payload));
  }, [payload]);

  useEffect(() => {
    if (
      vechileData?.data?.data !== null &&
      vechileData?.data?.data?.vehicleConfigViews.length > 0
    ) {
      const data = vechileData.data?.data?.vehicleConfigViews.map(
        (item: any, index: number) => ({
          ...item,
          id: index + 1,
          vehicleNumber: item.vehicleNumber.toUpperCase(),
          services: item.services !== null ? item.services : '-',
          tripModesJoin: item?.tripModes?.length > 0 && item?.tripModes.join(', ')
        })
      );
      setVechileRows(data);
    } else setVechileRows([]);
  }, [vechileData?.data]);
};
