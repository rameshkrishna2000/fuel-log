import { Box, Dialog, Grid, Typography } from '@mui/material';
import CustomDataGrid from '../../../../../common/components/customized/customdatagrid/CustomDataGrid';
import { Icon } from '@iconify/react';
import CustomButton from '../../../../../common/components/buttons/CustomButton';
import AddVehicle from './components/AddVehicle';
import { useAppDispatch, useAppSelector } from '../../../../../app/redux/hooks';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CustomTextField from '../../../../../common/components/customized/customtextfield/CustomTextField';
import { useForm } from 'react-hook-form';
import constant from '../../../../../utils/constants';
import ConfirmationPopup from '../../../../../common/components/confirmationpopup/ConfirmationPopup';
import {
  useCommonStateHooks,
  useDataGridActionsHooks,
  useRowHook
} from './vehicleOnboardHook';
import '../../configurations/vehicleconfiguration/VehicleConfiguration.scss';

const VehicleOnboard = () => {
  const dispatch = useAppDispatch();

  const vechileData = useAppSelector(state => state.vechileconfiguration);
  const { data } = useAppSelector(state => state.auth);
  const { isLoading: deactivateLoading } = useAppSelector(state => state.activateVehicle);
  const { isLoading: deleteLoading } = useAppSelector(state => state.DeleteAutoVehicle);
  const { category } = useAppSelector(state => state.RoleModuleAccess);

  let roletype = data?.role;

  const { control } = useForm();

  const APoperator = roletype === 'ROLE_OPERATOR';

  const operatorUser = category === 'OPERATION_USER';

  const isAPadminOrOperator =
    roletype === 'ROLE_AUTOPLANNER_ADMIN' ||
    roletype === 'ROLE_OPERATOR' ||
    category === 'OPERATION_USER';

  const {
    vechileRows,
    setVechileRows,
    pageNo,
    setPageNo,
    anchorEl,
    setAnchorEl,
    pageSize,
    setIsDialog,
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
  } = useCommonStateHooks();

  const {
    handleUpdateVehicle,
    handleMenuClose,
    handleFilterChange,
    handlePaginationModelChange,
    handleSortModelChange,
    handleDeactivate,
    columns,
    handleDeleteVehicle
  } = useDataGridActionsHooks({
    setSelected,
    dispatch,
    setSelectedRow,
    setAnchorEl,
    setOpen,
    setFilter,
    setPayload,
    operatorUser,
    APoperator,
    payload,
    pageSize,
    setPageSize,
    setPageNo,
    setSortModel,
    setDrawer,
    selectedRow,
    pageNo,
    setIsDialog
  });
  useRowHook(dispatch, payload, vechileData, setVechileRows);

  return (
    <Box>
      {!APoperator && !operatorUser && (
        <Box className='agent-header-btn'>
          <CustomButton
            className='saveChanges'
            category='Add Vehicle'
            onClick={() => {
              setOpen(true);
              setSelectedRow(null);
              //   setselectedAgents(null);
            }}
          />
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'right', margin: '0', width: '100%' }}>
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
          if (row?.isActive === 1) {
            handleUpdateVehicle();
          }

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
            {selectedRow?.driverDetails && selectedRow?.driverDetails?.length > 0 ? (
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
      {open && (
        <AddVehicle
          setOpen={setOpen}
          open={open}
          selectedRow={selectedRow}
          payloads={payload}
        />
      )}

      {/* Deactivate Popup  */}
      {isDialog === 'dialog' ? (
        <Dialog open={isDialog === 'dialog'}>
          <Box
            sx={{
              textAlign: 'center',
              padding: '5%',
              // width: '350px'
              minWidth: '350px'
            }}
          >
            <Typography>
              {selectedRow.isActive === 1
                ? constant.VehicleDeactivate
                : constant.Activate}
            </Typography>
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
                  loading={deactivateLoading}
                  category='Yes'
                  onClick={handleDeactivate}
                />
              </Box>
              <CustomButton
                className='cancel'
                category='No'
                onClick={() => {
                  setIsDialog('');
                }}
              />
            </Box>
          </Box>
        </Dialog>
      ) : (
        <ConfirmationPopup
          open={isDialog === 'dialog'}
          loading={deactivateLoading}
          onClose={() => {
            setIsDialog('');
          }}
          onConfirm={handleDeactivate}
          title='Deactivate Vehicle'
          messages={[
            'You are about to deactivate this vehicle.',
            'This action may affect scheduled trips and vehicle availability.'
          ]}
          confirmText='Yes, Deactivate'
          cancelText='Cancel'
        />
      )}

      {/* Delete Popup */}
      {isDialog === 'Delete' && (
        <Dialog open={isDialog === 'Delete'}>
          <Box
            sx={{
              textAlign: 'center',
              padding: '5%',
              minWidth: '350px'
            }}
          >
            <Typography>
              {isAPadminOrOperator
                ? constant.VehicleDeleteConfirmation
                : constant.DeleteConfirmation}
            </Typography>
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
                  loading={deleteLoading}
                  onClick={() => {
                    handleDeleteVehicle();
                  }}
                />
              </Box>
              <CustomButton
                className='cancel'
                category='No'
                onClick={() => setIsDialog('')}
              />
            </Box>
          </Box>
        </Dialog>
      )}
    </Box>
  );
};

export default VehicleOnboard;
