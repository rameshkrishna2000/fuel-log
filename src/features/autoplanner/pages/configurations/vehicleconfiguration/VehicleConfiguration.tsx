import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Dialog, Grid, styled, BadgeProps, Badge } from '@mui/material';
import { Icon } from '@iconify/react';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { useAppDispatch, useAppSelector } from '../../../../../app/redux/hooks';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { debounce } from '../../../../../utils/commonFunctions';
import CustomDataGrid from '../../../../../common/components/customized/customdatagrid/CustomDataGrid';
import CustomTextField from '../../../../../common/components/customized/customtextfield/CustomTextField';
import { useForm } from 'react-hook-form';
import AddVehicleConfiguration from './components/AddVehicleConfiguration';
import { autoGetVechicleAction } from '../../../redux/reducer/autoPlannerSlices/autoplannerConfigurationSlice';
import './VehicleConfiguration.scss';

interface Row {
  id: number;
  vehicleNumber: string;
  vehicleType: string;
  tripModes: string;
  services: string;
  absoluteSeating: string;
  preferredSeating: string;
  operatingTimeWindows: { start: string; end: string }[] | null;
  driverDetails: any[] | null;
}

interface PaginationModel {
  page: number;
  pageSize: number;
}

const VehicleConfiguration: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [vechileRows, setVechileRows] = useState<Row[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortModel, setSortModel] = useState<any>([]);
  const [payload, setPayload] = useState<any>({ pageNo, pageSize });
  const [filter, setFilter] = useState('');

  const dispatch = useAppDispatch();
  const { control } = useForm();
  const vechileData = useAppSelector(state => state.vechileconfiguration);

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

  const handleMenuClick = (row: Row) => {
    setSelectedRow(row);
  };

  const handleDriverDetails = (row: Row) => {
    setSelectedRow(row);
    setDrawer(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUpdateVehicle = () => {
    setOpen(true);
    handleMenuClose();
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
    }),
    [pageSize, payload]
  );

  const handleSortModelChange = (model: any) => {
    setSortModel(model);
    const payloads = {
      ...payload,
      sortBy: model[0]?.sort,
      sortByField: model[0]?.field
    };
    setPayload(payloads);
  };

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

  const columns = [
    {
      field: 'actions',
      headerName: 'Action',
      type: 'actions',
      minWidth: 100,
      maxWidth: 100,
      flex: 1,
      getActions: (params: any) => {
        return [
          <GridActionsCellItem
            icon={<Icon icon='ic:baseline-edit' className='menu-icon update' />}
            label={'Update'}
            onClick={() => {
              handleMenuClick(params.row as Row);
              handleUpdateVehicle();
            }}
            showInMenu
          />
        ];
      }
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
      width: 300
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
                  className='view-driver'
                  onClick={event => {
                    event.stopPropagation();
                    handleDriverDetails(params?.row);
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
  ];

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
          tripModesJoin: item?.tripModes?.length > 0 && item.tripModes.join(', ')
        })
      );
      setVechileRows(data);
    } else setVechileRows([]);
  }, [vechileData?.data]);

  return (
    <Box className='vehicle-configuration'>
      <Box sx={{ display: 'flex', justifyContent: 'right', width: '100%' }}>
        <Box sx={{ width: 200 }}>
          <CustomTextField
            name='search'
            control={control}
            id='filter-input'
            placeholder='Search....'
            value={filter}
            variant='standard'
            icon={<SearchOutlinedIcon color='primary' />}
            onChangeCallback={(e: any) => handleFilterChange(e)}
          />
        </Box>
      </Box>
      <CustomDataGrid
        rows={vechileRows}
        loading={vechileData?.isLoading}
        columns={columns}
        rowCount={vechileData?.data?.data?.count}
        onPaginationModelChange={handlePaginationModelChange}
        onRowClick={(id, row) => {
          handleUpdateVehicle();
          setSelectedRow(row);
        }}
        type='logistics'
        pageNo={pageNo}
        pageSize={pageSize}
        sortingMode='server'
        onSortModelChange={handleSortModelChange}
        paginationModel={{
          page: pageNo ? pageNo - 1 : 0,
          pageSize: pageSize ? pageSize : 10
        }}
      />
      <AddVehicleConfiguration
        open={open}
        setOpen={setOpen}
        selectedRow={selectedRow}
        pageDetails={{ ...payload, pageNo, pageSize }}
      />
      <Dialog open={drawer} className='driver-dialog'>
        <Box className='driver-view'>
          <Box className='driver-view-header'>
            <Typography
              variant='h6'
              sx={{
                color: '#333',
                fontWeight: 600
              }}
            >
              Driver
            </Typography>
            <Box className='driver-close' onClick={() => setDrawer(false)}>
              <Icon icon='ic:round-close' className='driver-close-icon' />
            </Box>
          </Box>
          <Box className='driver-details'>
            {selectedRow?.driverDetails && selectedRow.driverDetails.length > 0 ? (
              <Grid container spacing={2} className='driver-details-values'>
                <Grid item sm={6} className='driver-values head'>
                  Name
                </Grid>
                <Grid item sm={6} className='driver-values head'>
                  Contact No
                </Grid>
              </Grid>
            ) : (
              ''
            )}
            {selectedRow?.driverDetails && selectedRow.driverDetails.length > 0 ? (
              selectedRow.driverDetails.map((driver: any, index: any) => (
                <Grid container key={index} spacing={2} className='driver-details-values'>
                  <Grid item sm={6} className='driver-values'>
                    {index + 1}. {driver.driverName}
                  </Grid>
                  <Grid item sm={6} className='driver-values'>
                    {driver.contactPhone}
                  </Grid>
                </Grid>
              ))
            ) : (
              <Box>
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: '#777',
                    textAlign: 'center',
                    marginBottom: '15px'
                  }}
                >
                  No driver assigned
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default VehicleConfiguration;
