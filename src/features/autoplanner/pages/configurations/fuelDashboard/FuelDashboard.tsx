import { Box, DialogContent, Typography, useMediaQuery } from '@mui/material';
import './FuelDashboard.scss';
import CustomTextField from '../../../../../common/components/customized/customtextfield/CustomTextField';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CustomDataGrid from '../../../../../common/components/customized/customdatagrid/CustomDataGrid';
import { useAppDispatch, useAppSelector } from '../../../../../app/redux/hooks';
import CustomIconButton from '../../../../../common/components/buttons/CustomIconButton';
import CustomCarousel from '../../../../../common/components/carousel/CustomCarousel';
import CustomDeletePopup from '../../../../../common/components/customdelete/CustomDeletePopup';
import UpdateFuelDashboard from './components/UpdateFuelDashboard';
import { useNavigate } from 'react-router-dom';
import CustomToolbar from '../../../../../common/components/customized/customtoolbar/CustomToolbar';
import {
  useFuelCardData,
  useFuelDropdowns,
  useFuelEffects,
  useFuelStates,
  useGetToday,
  useHandleClear,
  useHandleCustom,
  useHandleDate,
  useHandleDelete,
  useHandleImage,
  useHandleMap,
  useHandlePagination,
  useHandleSearch,
  useHandleSettings,
  useHandleSort,
  useMemoDialog,
  useOnSubmit,
  useReportDownload
} from './hooks/fuelDashboard';
import { useFuelFilterColumns } from './components/FuelFilterFields';
import ViewFuelDashboard from './components/ViewFuelDashboard';
import ViewFuelMap from './components/ViewFuelMap';
import FuelFilter from './components/FuelFilter';
import FuelDashboardCard from './components/FuelDashboardCard';
import { useDynamicYupSchema } from '../../../../../common/hooks/useDynamicSchema';
import { FuelDashboardFormData } from './hooks/fuelDashboardData';
const FuelDashboard = () => {
  const { dataMetric, data, count, isLoading } = useAppSelector(
    state => state.getAllDriverFuelDashboard
  );
  const { timezone } = useAppSelector(state => state.myProfile.data);
  const { data: vehicleDriverData } = useAppSelector(state => state.getVehicleDriver);
  const { isLoading: deleteLoading } = useAppSelector(state => state.deleteDriverFuel);
  const { data: typeDropdownData } = useAppSelector(state => state.getTypeDropdown);
  const { data: stationDropdownData } = useAppSelector(state => state.getStationDropdown);
  const { data: paymentDropdownData } = useAppSelector(state => state.getPaymentDropdown);
  const { isLoading: excelLoading } = useAppSelector(state => state.addFuelExcel);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isXs = useMediaQuery('(max-width:600px)');
  const { createFormFields } = useDynamicYupSchema(null);
  const { schema } = createFormFields(FuelDashboardFormData());
  const { handleSubmit, control, setValue, clearErrors, trigger, getValues } =
    useForm<any>({
      resolver: yupResolver(schema)
    });
  const {
    isDelete,
    setIsDelete,
    selectedId,
    setSelectedId,
    isOpen,
    setIsOpen,
    isUpdate,
    setIsUpdate,
    imageCard,
    setImageCard,
    files,
    setFiles,
    clearLoading,
    setClearLoading,
    filterLoading,
    setFilterLoading,
    isDateDisabled,
    setIsDateDisabled,
    selectedValue,
    setSelectedValue,
    filterPayload,
    setFilterPayload,
    pageNo,
    setPageNo,
    dataLoading,
    setDataLoading,
    gpsLocation,
    setGpsLocation,
    load,
    setLoad,
    report,
    setReport,
    format,
    setFormat,
    pageSize,
    setPageSize,
    searchValue,
    setSearchValue,
    sorting,
    setSorting,
    excelDownloadUrl,
    setExcelDownloadUrl,
    isMap,
    setIsMap,
    getStartDate,
    setGetStartDate,
    getEndDate,
    setGetEndDate,
    toDateDisabled,
    setToDateDisabled
  } = useFuelStates();
  const { MemoizedDialog } = useMemoDialog({ files });
  const {
    vehicleDropdown,
    driverDropdown,
    fuelTypeOptions,
    fuelStationOptions,
    paymentOptions
  } = useFuelDropdowns({
    vehicleDriverData,
    typeDropdownData,
    stationDropdownData,
    paymentDropdownData
  });
  const { handleMap } = useHandleMap({ setGpsLocation, dispatch });
  const { arr } = useFuelCardData({ dataMetric });
  const { columns } = useFuelFilterColumns({
    setIsMap,
    handleMap,
    setSelectedValue,
    setIsOpen,
    setIsDelete,
    setSelectedId,
    setIsUpdate
  });
  const { onSubmit } = useOnSubmit({
    setPageNo,
    setValue,
    setSearchValue,
    setSorting,
    setFilterLoading,
    setClearLoading,
    pageSize,
    setFilterPayload,
    dispatch,
    setIsDateDisabled
  });
  const { handleImage } = useHandleImage({ setImageCard, setFiles });
  const { getToday } = useGetToday({
    setPageNo,
    timezone,
    setGetStartDate,
    setValue,
    setGetEndDate,
    pageSize,
    setFilterPayload,
    dispatch
  });
  const { handleDelete } = useHandleDelete({
    dispatch,
    getToday,
    setIsDelete,
    filterPayload,
    setPageNo
  });
  const { handleClear } = useHandleClear({
    setClearLoading,
    setFilterLoading,
    getToday,
    setValue
  });
  const { handleCustomFrom, handleCustomTo } = useHandleCustom({
    setToDateDisabled,
    setValue,
    setGetStartDate,
    clearErrors,
    setGetEndDate
  });
  const { handleFromDate, handleToDate } = useHandleDate({
    setGetStartDate,
    setValue,
    setGetEndDate,
    trigger,
    setToDateDisabled,
    getStartDate,
    dispatch
  });
  const { handleSettings } = useHandleSettings({ navigate });
  const { reportDownload } = useReportDownload({
    setFormat,
    setLoad,
    setReport,
    dispatch,
    filterPayload
  });
  const { handlePagination } = useHandlePagination({
    setDataLoading,
    setPageNo,
    setPageSize,
    filterPayload,
    searchValue,
    sorting,
    dispatch
  });
  const { handleSearchChange } = useHandleSearch({
    setSearchValue,
    setValue,
    setPageNo,
    filterPayload,
    pageSize,
    sorting,
    dispatch,
    setDataLoading
  });
  const { handleSortChange } = useHandleSort({
    setDataLoading,
    setPageNo,
    setSorting,
    filterPayload,
    pageSize,
    searchValue,
    dispatch
  });
  useFuelEffects({ getToday, dispatch });

  return (
    <Box className='fuel-dashboard-container'>
      <Box className={isXs ? 'fuel-header-xs' : 'fuel-header'}>
        <Typography className={isXs ? 'fuel-head-text-xs' : 'fuel-head-text'}>
          Fuel & Adblue Management Portal
        </Typography>
      </Box>
      <Box className='fuel-dash-scroll'>
        <FuelFilter
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          control={control}
          getValues={getValues}
          setValue={setValue}
          vehicleDropdown={vehicleDropdown}
          driverDropdown={driverDropdown}
          getStartDate={getStartDate}
          handleCustomFrom={handleCustomFrom}
          handleCustomTo={handleCustomTo}
          handleFromDate={handleFromDate}
          handleToDate={handleToDate}
          getEndDate={getEndDate}
          toDateDisabled={toDateDisabled}
          fuelStationOptions={fuelStationOptions}
          paymentOptions={paymentOptions}
          fuelTypeOptions={fuelTypeOptions}
          handleSettings={handleSettings}
          handleClear={handleClear}
          isLoading={isLoading}
          filterLoading={filterLoading}
          dataLoading={dataLoading}
          clearLoading={clearLoading}
        />
        <FuelDashboardCard isLoading={isLoading} dataLoading={dataLoading} arr={arr} />
        <Box className={isXs ? 'fuel-excel-xs' : 'fuel-excel'}>
          {isXs && (
            <Typography className='fuel-entries-xs'>All Entries ({count})</Typography>
          )}
        </Box>
        <Box className='fuel-entries-cont'>
          {!isXs && (
            <Typography className='fuel-entries'>All Entries ({count})</Typography>
          )}
          {data?.length > 0 && (
            <Box sx={{ display: 'flex', gap: '20px', justifyContent: 'flex-end' }}>
              <Box sx={{ width: 200 }}>
                <CustomTextField
                  control={control}
                  name='search'
                  placeholder='Search...'
                  id='search'
                  variant={'standard'}
                  icon={<SearchOutlinedIcon color='primary' />}
                  onChangeCallback={e => {
                    handleSearchChange(e);
                  }}
                />
              </Box>
              <Box sx={{ marginTop: '5px' }}>
                <CustomToolbar reportDownload={reportDownload} label='Download' />
              </Box>
            </Box>
          )}
          <CustomDataGrid
            rows={data ?? []}
            columns={columns}
            loading={isLoading}
            rowCount={count}
            sortingMode='server'
            onPaginationModelChange={handlePagination}
            pageNo={pageNo}
            pageSize={pageSize}
            paginationModel={{
              page: pageNo && count ? pageNo - 1 : 0,
              pageSize: pageSize ?? 5
            }}
            onSortModelChange={handleSortChange}
            type={'logistics'}
          />
        </Box>
      </Box>
      {isOpen && (
        <ViewFuelDashboard
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          selectedValue={selectedValue}
          handleImage={handleImage}
        />
      )}
      {isDelete && (
        <CustomDeletePopup
          open={isDelete}
          setOpen={setIsDelete}
          handleClose={() => setIsDelete(false)}
          message={'Are you sure want to delete this fuel entry'}
          handleDelete={() => handleDelete(selectedId)}
          isLoading={deleteLoading}
        />
      )}
      {isUpdate && (
        <UpdateFuelDashboard
          isUpdate={isUpdate}
          setIsUpdate={setIsUpdate}
          filterPayload={filterPayload}
          setPageNo={setPageNo}
          selectedValue={selectedValue}
        />
      )}
      {imageCard && (
        <MemoizedDialog
          open={true}
          fullWidth
          fullScreen
          maxWidth='md'
          className='dialog'
          onClose={() => setImageCard(false)}
          PaperProps={{
            style: {
              backgroundColor: 'transparent',
              boxShadow: 'none'
            }
          }}
        >
          <DialogContent
            className='dialogContent'
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Box className='closeIcon icon-position d-flex'>
              <CustomIconButton
                category='CloseValue'
                onClick={() => {
                  setImageCard(false);
                }}
              />
            </Box>
            <CustomCarousel image={files} />
          </DialogContent>
        </MemoizedDialog>
      )}
      {isMap && (
        <ViewFuelMap isMap={isMap} setIsMap={setIsMap} gpsLocation={gpsLocation} />
      )}
    </Box>
  );
};

export default FuelDashboard;
