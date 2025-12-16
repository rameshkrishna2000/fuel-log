import { useState } from 'react';
import CustomDataGrid from '../../../../../../common/components/customized/customdatagrid/CustomDataGrid';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';

import * as yup from 'yup';
import nodata from '../../../../../../app/assets/images/nodata.png.png';
import { Box, Dialog, Switch, Typography } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import UpdateGeneratedTrip from '../UpdateGeneratedTrip';
import CustomSelect from '../../../../../../common/components/customized/customselect/CustomSelect';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';
import UpdatePVTGRP from '../UpdatePvtGrp';
import AddExternalVehicle from './AddExternalVehicle';
import CustomIconButton from '../../../../../../common/components/buttons/CustomIconButton';
import CustomTextField from '../../../../../../common/components/customized/customtextfield/CustomTextField';

import {
  useExcelAction,
  useExcelColumnHook,
  useExcelDataGridAction,
  useExcelEffects,
  useExcelState
} from './excelViewHook';
import { useExcelImportHook, useInvalidColumn } from './scheduledExcelImportHook';
import { useExcelOptionsHook } from './excelViewOptionsHook';
interface Props {
  scheduleDate: number;
  initialLoad: boolean;
  tripPayload: any;
  agent: any;
  guest: any;
  tour: any;
  vehicle: any;
  setSearchPayload: any;
  filterClear?: any;
}

interface Column {
  field: string;
  headerName: string;
  minWidth: number;
  flex: number;
  align?: string;
  renderCell?: (params: { row: any }) => any;
  textAlign?: string;
  sortable: boolean;
}

const ExcelView = ({
  scheduleDate,
  initialLoad,
  tripPayload,
  agent,
  vehicle,
  guest,
  tour,
  setPayload,
  setSearchPayload,
  filterClear
}: any) => {
  const {
    rows,
    setRows,
    invalidRows,
    setInvalidRows,
    isDate,
    setSelectedRow,
    setIsDate,
    setGuestContactList,
    PageSize,
    setIsDialog,
    setFilter,
    setPageSize,
    PageNo,
    setPageNo,
    filterPayload,
    setFilterPayload,
    searchEvent,
    filter,
    rowCount,
    setRowCount,
    only,
    setOnly,
    setAnchorEl,
    selectedRow,
    selectedTripRow,
    setSelectedTripRow,
    driverPayload,
    excelPayload,
    setExcelPayload,
    setPrevSearch,
    isDialog,
    setSearchEvent,
    setDriverPayload,
    transRow,
    setTransRow
  } = useExcelState();
  const autoplannerID = scheduleDate;

  const Agents = useAppSelector(state => state.autoPlannerAgent.data || []);
  const { data: role } = useAppSelector(state => state.auth);
  const { isLoading: changeLoad } = useAppSelector(state => state.changeDriver);
  const [bookingUpdate, IsbookingsUpdate] = useState(false);
  const transferDrivers = useAppSelector(state => state.Driverdrop || []);
  const Routes = useAppSelector(state => state.autoPlannerRoutes.data || []);
  const sendwhatsapp = useAppSelector(state => state.sendwhatsapp);

  const { isLoading: vehicleLoading, data: vehicleListData } = useAppSelector(
    state => state.getStandardVehicles
  );

  const Driver = () =>
    yup.object().shape({
      driver: yup.string().required('Select Driver Name')
    });

  let roletype = role?.role;
  const roleAgent = roletype === 'ROLE_AGENT';
  const APsubAgent = roletype === 'ROLE_SUB_AGENT';

  const { data, count, isLoading } = useAppSelector(state => state.getExcel);
  const dispatch = useAppDispatch();

  const { dropDriver, configuredRoute, agentNames, vehicleList, hotelLocationList } =
    useExcelOptionsHook({
      selectedTripRow,
      transRow,
      vehicleListData,
      Agents,
      transferDrivers,
      Routes
    });

  const {
    control,
    setValue,
    formState: { errors }
  } = useForm({});
  const {
    control: driverControl,
    handleSubmit: driverHandleSubmit,
    reset
  } = useForm({
    resolver: yupResolver(Driver())
  });

  const { handleClose, handleInvalidClose } = useExcelImportHook({
    setAnchorEl,
    setIsDialog,
    reset,
    setOnly,
    tripPayload,
    filterPayload,
    PageSize,
    scheduleDate,
    agent,
    guest,
    tour,
    vehicle
  });

  const {
    handleMenuClose,
    handleUpdateTrip,
    handleMenuTripClick,
    handleChange,
    handleSkip
  } = useExcelDataGridAction({
    setSelectedTripRow,
    IsbookingsUpdate,
    setAnchorEl,
    scheduleDate,
    setIsDialog,
    driverPayload,
    setOnly,
    only
  });

  const {
    onChangeDriverSubmit,
    handleUpdateTransfer,
    handlePaginationModelChange,
    handleUpdateContact,
    handleGuestContactChange,
    handleTransClick,
    handleAddTransfer,
    handleDriver,
    handleFilterChange
  } = useExcelAction({
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
  });

  const { columns } = useExcelColumnHook({
    roleAgent,
    APsubAgent,
    selectedTripRow,
    handleMenuTripClick,
    handleUpdateTrip,
    handleAddTransfer,
    handleTransClick,
    setIsDialog,
    handleDriver
  });

  const { invalidColumns } = useInvalidColumn({
    control,
    setValue,
    handleGuestContactChange
  });

  useExcelEffects({
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
  });

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'right', width: '100%' }}>
        {(rows?.length > 0 || filter) && (
          <Box sx={{ width: 200 }}>
            <CustomTextField
              name='search'
              control={control}
              id='filter-input'
              placeholder='Search...'
              value={filter}
              variant='standard'
              icon={<SearchOutlinedIcon color='primary' />}
              onChangeCallback={(e: any) => handleFilterChange(e)}
            />
          </Box>
        )}
      </Box>
      {isLoading && data?.length === 0 ? (
        <Box className='blue-circle-loader big-screen'>
          <Box className='blue-circle-spinner'></Box>
        </Box>
      ) : data?.length > 0 && rows ? (
        <CustomDataGrid
          rows={rows}
          columns={columns}
          type='logistics'
          onPaginationModelChange={handlePaginationModelChange}
          pageNo={PageNo}
          rowCount={rowCount}
          loading={isLoading}
          pageSize={PageSize}
          paginationModel={{
            page: PageNo ? PageNo - 1 : 0,
            pageSize: PageSize || 20
          }}
        />
      ) : (
        <Box className='no-report-img'>
          <Box
            component='img'
            src={nodata}
            alt='No Report Found'
            className='no-report-found'
          />
        </Box>
      )}
      {bookingUpdate &&
      (selectedTripRow.mode === 'SIC' || selectedTripRow.mode === 'TSIC') ? (
        <UpdateGeneratedTrip
          isOpen={bookingUpdate}
          setIsOpen={IsbookingsUpdate}
          selectedTripRow={selectedTripRow}
          setSelectedTripRow={setSelectedTripRow}
          setPageSize={setPageSize}
          selectedRow={selectedRow}
          excelPayload={excelPayload}
          autoplannerID={scheduleDate}
          pageDetail={{ pageNo: PageNo, pageSize: PageSize }}
          tripMode={selectedTripRow?.mode}
          Agents={agentNames}
          Routes={configuredRoute}
          setSearchValue={setValue}
          filterClear={filterClear}
        />
      ) : (
        ''
      )}
      {bookingUpdate &&
      (selectedTripRow.mode === 'PVT' || selectedTripRow.mode === 'GRP') ? (
        <UpdatePVTGRP
          isOpen={bookingUpdate}
          setIsOpen={IsbookingsUpdate}
          filterPayload={filterPayload}
          selectedTripRow={selectedTripRow}
          selectedRow={selectedRow}
          excelPayload={excelPayload}
          autoplannerID={scheduleDate}
          setPageSize={setPageSize}
          pageDetail={{ pageNo: PageNo, pageSize: PageSize }}
          tripMode={selectedTripRow?.mode}
          Agents={agentNames}
          setSearchValue={setValue}
          setFilterPayload={setFilterPayload}
          filterClear={filterClear}
        />
      ) : (
        ''
      )}
      <Dialog
        open={isDialog === 'changeDriver'}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(to bottom, #ffffff, #f0f8ff)',
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden'
          }
        }}
      >
        <Box
          padding={3}
          width={400}
          component={'form'}
          onSubmit={driverHandleSubmit(onChangeDriverSubmit)}
        >
          <Typography sx={{ fontWeight: '600', fontSize: '18px' }}>
            Change Driver
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '5px',
              marginRight: '10px'
            }}
          >
            <Typography>Changes only applicable for this tour </Typography>

            <Switch
              checked={only}
              onChange={handleChange}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          </Box>
          <CustomSelect
            id='driver'
            control={driverControl}
            name='driver'
            label='Driver Name'
            placeholder='Select Driver Name'
            options={dropDriver}
            loading={transferDrivers.isLoading}
          />
          <Box sx={{ textAlign: 'right', padding: '10px' }}>
            <CustomButton
              category='Cancel'
              className='cancel'
              sx={{ marginRight: '10px' }}
              onClick={() => handleClose()}
            />
            <CustomButton
              category={'Save'}
              className='saveChanges'
              type='submit'
              loading={changeLoad}
            />
          </Box>
        </Box>
      </Dialog>
      {isDialog === 'Transfer' && (
        <Dialog
          open={isDialog === 'Transfer'}
          onClose={handleClose}
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: 'linear-gradient(to bottom, #ffffff, #f0f8ff)',
              boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden'
            }
          }}
        >
          <Box padding={3} width={400} position='relative'>
            <Box
              className='closeIcon icon-position d-flex close-icon-index'
              onClick={() => handleClose()}
            >
              <CustomIconButton category='CloseValue' />
            </Box>

            <Typography
              variant='h6'
              sx={{
                marginBottom: 2,
                fontWeight: 'bold',
                color: '#333',
                textAlign: 'center',
                textTransform: 'uppercase',
                borderBottom: '2px solid #007bff',
                paddingBottom: 1
              }}
            >
              Transfer Details
            </Typography>

            <Box sx={{ marginY: 2 }}>
              <Typography variant='body1' sx={{ fontSize: '1rem', color: '#555' }}>
                <strong>Transfer From:</strong>{' '}
                {transRow?.transferInstance?.from?.locationAddress}
              </Typography>
            </Box>

            <Box sx={{ marginY: 2 }}>
              <Typography variant='body1' sx={{ fontSize: '1rem', color: '#555' }}>
                <strong>Transfer To:</strong>{' '}
                {transRow?.transferInstance?.to?.locationAddress}
              </Typography>
            </Box>

            <Box sx={{ marginY: 2 }}>
              <Typography variant='body1' sx={{ fontSize: '1rem', color: '#555' }}>
                <strong>Total Count:</strong> {transRow?.transferInstance?.totalCount}
              </Typography>
            </Box>

            <Box sx={{ marginY: 2 }}>
              <Typography variant='body1' sx={{ fontSize: '1rem', color: '#555' }}>
                <strong>Driver Name:</strong> {transRow?.transferInstance?.driverName}
              </Typography>
            </Box>

            <Box sx={{ marginY: 2 }}>
              <Typography variant='body1' sx={{ fontSize: '1rem', color: '#555' }}>
                <strong>Contact Number:</strong>{' '}
                {transRow?.transferInstance?.contactNumber}
              </Typography>
            </Box>

            <Box sx={{ marginY: 2 }}>
              <Typography variant='body1' sx={{ fontSize: '1rem', color: '#555' }}>
                <strong>Vehicle Number:</strong>{' '}
                {transRow?.transferInstance?.vehicleNumber?.toUpperCase()}
              </Typography>
            </Box>
            <Box sx={{ ml: '280px' }}>
              <CustomButton
                className='saveChanges'
                category='Update'
                onClick={() => {
                  handleUpdateTransfer();
                }}
              />
            </Box>
          </Box>
        </Dialog>
      )}
      {isDialog == 'Nocontact' && (
        <Dialog
          open={isDialog == 'Nocontact'}
          onClose={handleClose}
          maxWidth='xl'
          fullWidth
          PaperProps={{
            sx: {
              width: '90vw',
              maxWidth: '1400px',
              height: '85vh',
              maxHeight: '800px',
              borderRadius: '16px',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.15)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              overflow: 'hidden'
            }
          }}
        >
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                padding: '10px 32px ',
                borderBottom: '1px solid #e2e8f0',
                background: 'linear-gradient(90deg, #f1f5f9 0%, #ffffff 100%)',
                position: 'relative',
                flexShrink: 0
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fed7aa',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  boxShadow: '0 2px 4px rgba(251, 191, 36, 0.1)'
                }}
              >
                <Box
                  sx={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#f59e0b',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  !
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant='body1'
                    sx={{
                      color: '#92400e',
                      fontSize: '12px',
                      lineHeight: 1.6,
                      fontWeight: 500,
                      margin: 0
                    }}
                  >
                    Some of these bookings do not have contact numbers. You may either add
                    the missing numbers or proceed by clicking the 'Skip' button to send
                    WhatsApp messages to the bookings with valid contact numbers.
                  </Typography>
                </Box>

                <CustomButton
                  className='skip'
                  category='Skip & Send'
                  onClick={() => {
                    handleSkip();
                  }}
                  sx={{
                    minWidth: '100px',
                    height: '36px',
                    borderRadius: '6px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.825rem',
                    border: '2px solid #f59e0b',
                    color: '#f59e0b',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 2px 4px rgba(245, 158, 11, 0.15)',
                    '&:hover': {
                      backgroundColor: '#fef3c7',
                      borderColor: '#d97706',
                      color: '#d97706',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(245, 158, 11, 0.25)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                />
              </Box>
            </Box>
            <Box
              sx={{
                flex: 1,
                // padding: 'px 28px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  height: '200vh',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  background: '#ffffff',
                  overflow: 'auto'
                }}
              >
                <Box
                  key={invalidRows?.length}
                  sx={{
                    height: '100%',
                    width: '100%',
                    '& .MuiDataGrid-root': {
                      border: 'none',
                      height: '100%'
                    },
                    '& .MuiDataGrid-main': {
                      overflow: 'visible'
                    },
                    '& .MuiDataGrid-virtualScroller': {
                      overflow: 'auto !important',
                      height: 'auto !important'
                    },
                    '& .MuiDataGrid-footerContainer': {
                      minHeight: '52px',
                      borderTop: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc'
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: '#f1f5f9'
                    }
                  }}
                >
                  <CustomDataGrid
                    rows={invalidRows}
                    columns={invalidColumns}
                    loading={isLoading}
                    rowHeight={40}
                    type={'noPageNation'}
                    paginationMode={'client'}
                  />
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                padding: '20px 32px 24px',
                borderTop: '1px solid #e2e8f0',
                background: 'linear-gradient(90deg, #ffffff 0%, #f8fafc 100%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}
            >
              <Box sx={{ display: 'flex', gap: '16px' }}>
                <CustomButton
                  className='cancel'
                  category='Cancel'
                  onClick={() => {
                    reset();
                    handleInvalidClose();
                  }}
                  sx={{
                    minWidth: '120px',
                    height: '44px',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.925rem',
                    border: '2px solid #e2e8f0',
                    color: '#64748b',
                    backgroundColor: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      borderColor: '#cbd5e1',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                />

                <CustomButton
                  className='saveChanges'
                  type='submit'
                  disabled={invalidRows?.some((item: any) => item?.isError)}
                  category='Update'
                  onClick={() => handleUpdateContact()}
                  sx={{
                    minWidth: '120px',
                    height: '44px',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.925rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)'
                    },
                    transition: 'all 0.2s ease',
                    '&:disabled': {
                      background: '#94a3b8',
                      transform: 'none',
                      boxShadow: 'none'
                    }
                  }}
                />
              </Box>

              {invalidRows?.some((item: any) => item?.isError) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Box
                    sx={{
                      width: 15,
                      height: 15,
                      borderRadius: '50%',
                      backgroundColor: '#ff07078c'
                    }}
                  />
                  <p
                    style={{
                      color: '#5e5c5cff',
                      fontSize: '14px',
                      fontWeight: 600,
                      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                    }}
                  >
                    Invalid Contact Numbers :{' '}
                    {invalidRows?.filter((item: any) => item?.isError)?.length}
                  </p>
                </Box>
              )}
            </Box>
          </Box>
        </Dialog>
      )}

      {isDialog === 'addTransfer' && (
        <AddExternalVehicle
          selectedRow={selectedTripRow}
          isDialog={isDialog}
          transRow={transRow}
          setTransRow={setTransRow}
          setAnchorEl={setAnchorEl}
          setIsDialog={setIsDialog}
          hotelLocationList={hotelLocationList}
          vehicleList={vehicleList}
          tripMode={'ALL'}
          scheduleDate={scheduleDate}
        />
      )}
    </>
  );
};

export default ExcelView;
