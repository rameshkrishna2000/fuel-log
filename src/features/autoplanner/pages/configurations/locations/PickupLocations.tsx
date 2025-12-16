import { Box, Dialog, Typography } from '@mui/material';
import CustomDataGrid from '../../../../../common/components/customized/customdatagrid/CustomDataGrid';
import { usePagination } from '../../../../../utils/commonFunctions';
import { useAppSelector } from '../../../../../app/redux/hooks';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CustomTextField from '../../../../../common/components/customized/customtextfield/CustomTextField';
import { useForm } from 'react-hook-form';
import GoogleMap from '../../../../../common/components/maps/googlemap/GoogleMap';
import GoogleMarkers from '../../../../../common/components/maps/googlemarkers/GoogleMarkers';
import CustomIconButton from '../../../../../common/components/buttons/CustomIconButton';
import {
  map,
  updateCenter,
  updateZoom
} from '../../../../../common/redux/reducer/commonSlices/mapSlice';
import {
  getPickupLocationAction,
  pickupConfigureUpdateAction
} from '../../../redux/reducer/autoPlannerSlices/pickupConfigurationSlice';
import './PickupLocations.scss';
import { PickupLocationColumn } from './componentDatas/PickupLocationColumn';
import {
  useEffectLocationHook,
  useLocationFunctionHooks,
  useStateHook
} from './hooks/locationHooks';

interface Pickup {
  id: number;
  latitude: number;
  longitude: number;
  locationAddress: string;
  isMain: 0 | 1;
}

const PickupLocations = () => {
  const { control } = useForm();
  const urls = {
    map,
    updateZoom,
    updateCenter,
    pickupConfigureUpdateAction,
    getPickupLocationAction
  };

  const { data: pickupLocation, isLoading: pickupLocationIsLoading } = useAppSelector(
    (state: any) => state.pickupLocation
  );

  const updatePickupConfigure = useAppSelector(
    (state: any) => state.updatePickupConfigure
  );

  const { pageSize, pageNo, pagination, setPageNo, setPageSize } = usePagination(10);

  const {
    selectedRows,
    setSelectedRows,
    pickupRows,
    setPickupRows,
    filter,
    setFilter,
    isOpen,
    setIsOpen,
    dispatch
  } = useStateHook();

  const {
    handleCloseDetails,
    handleFilterChange,
    handlePaginationModelChange,
    handleSelectionChange,
    handleViewLocation
  } = useLocationFunctionHooks({
    setIsOpen,
    selectedRows,
    pickupLocation,
    pageNo,
    pageSize,
    filter,
    pagination,
    setFilter,
    setPageNo,
    dispatch,
    urls
  });

  useEffectLocationHook({
    pickupLocation,
    setPickupRows,
    setSelectedRows,
    pageNo,
    pageSize,
    filter,
    dispatch,
    urls
  });

  return (
    <Box className='location-container'>
      <Box className='location-search'>
        <Box className='pickup-location-heading'>
          <Typography className='header'>Main pickup locations</Typography>
          <Typography className='badge'>
            {pickupLocation?.data?.totalCount - pickupLocation?.data?.notMainCount || 0}
          </Typography>
        </Box>
        <Box className='pickup-search'>
          <Box sx={{ width: 200 }}>
            <CustomTextField
              name='search'
              control={control}
              id='filter-input'
              placeholder='Search Address'
              value={filter}
              variant='standard'
              icon={<SearchOutlinedIcon color='primary' />}
              onChangeCallback={(e: any) => handleFilterChange(e)}
            />
          </Box>
        </Box>
      </Box>
      <Box className='pickup-locations-table'>
        <CustomDataGrid
          rows={pickupRows}
          columns={PickupLocationColumn(handleViewLocation)}
          checkboxSelection={true}
          onRowSelectionModelChange={handleSelectionChange}
          type='logistics'
          rowCount={pickupLocation?.data?.totalCount || 0}
          onPaginationModelChange={handlePaginationModelChange}
          pageNo={pageNo}
          pageSize={pageSize}
          paginationModel={{
            page: pageNo ? pageNo - 1 : 0,
            pageSize: pageSize ? pageSize : 10
          }}
          loading={
            updatePickupConfigure?.isLoading ||
            pickupLocation?.isLoading ||
            pickupLocationIsLoading
          }
          selection={selectedRows}
          disableSelectAll={true}
        />
      </Box>
      {isOpen && (
        <Dialog
          open={isOpen}
          fullScreen
          onClose={() => handleCloseDetails()}
          sx={{ margin: '20px' }}
          className='pickup-location-view'
        >
          <Box className='close-pickup-location' onClick={handleCloseDetails}>
            <CustomIconButton
              category='CloseValue'
              onClick={() => handleCloseDetails()}
            />
          </Box>
          <Box className='view-pickup-location'>
            <GoogleMap>
              <GoogleMarkers />
            </GoogleMap>
          </Box>
        </Dialog>
      )}
    </Box>
  );
};

export default PickupLocations;
