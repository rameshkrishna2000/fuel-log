import {
  Box,
  Dialog,
  DialogContent,
  Grid,
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';
import GoogleMap from '../../../../../../common/components/maps/googlemap/GoogleMap';
import './AddRegularMode.scss';
import CustomIconButton from '../../../../../../common/components/buttons/CustomIconButton';
import AddRegularForm from './addregularform/AddRegularForm';
import { addRegularFields } from '../componentDatas/componentDatas';
import GoogleTripDirections from '../../../../../../common/components/maps/googledirection/GoogleTripDirections';
import {
  useFetchApi,
  useFormSubmission,
  useMapLocation,
  useSetFieldValues,
  useTimeHandler,
  useValidations
} from '../hooks/fieldsControl';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';
import {
  addRegularTour,
  getConfigurableVehicles,
  getDriverDetails,
  getRegularTour,
  updateRegularTour
} from '../../../../redux/reducer/autoPlannerSlices/regularSlices';
import { useAppSelector } from '../../../../../../app/redux/hooks';
import { useDynamicYupSchema } from '../../../../../../common/hooks/useDynamicSchema';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Icon } from '@iconify/react';
import CustomTooltip from '../../../../../../common/components/customtooltip/CustomTooltip';

interface AddRegularProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filteredRow: any;
  setFilteredRow: React.Dispatch<React.SetStateAction<any>>;
  setPageNo: React.Dispatch<React.SetStateAction<number>>;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
}

const AddRegularMode: React.FC<AddRegularProps> = ({
  open,
  setOpen,
  filteredRow,
  setFilteredRow,
  setPageNo,
  setPageSize
}) => {
  const { createFormFields, formFields } = useDynamicYupSchema(
    addRegularFields(null, null)
  );
  const { data: vehicleList } = useAppSelector(state => state.configurableVehicles);
  const { control, handleSubmit, setValue, getValues, setError, trigger } = useForm({
    resolver: async (data: any, context: any, options: any) => {
      const updates = addRegularFields(data, vehicleList);
      const { schema }: any = createFormFields(updates);
      return yupResolver(schema)(data, context, options);
    }
  } as any);

  const urls = [
    { url: addRegularTour, payload: null },
    { url: getRegularTour, payload: { pageNo: 1, pageSize: 10 } },
    { url: updateRegularTour, payload: null }
  ];
  const { data: driverList } = useAppSelector(state => state.regularDrivers);

  const { handleDragMarker, address, onLocationChange, setAddress } = useMapLocation(
    setValue,
    trigger
  );
  const { handleTimeChange, minTime } = useTimeHandler(
    setValue,
    setError,
    getValues,
    trigger
  );
  const { formSubmit } = useFormSubmission(
    urls,
    setOpen,
    driverList,
    filteredRow,
    setPageNo,
    setPageSize
  );
  useFetchApi({ urls: [{ url: getConfigurableVehicles }] });
  useSetFieldValues(
    filteredRow,
    setValue,
    formFields,
    setAddress,
    getDriverDetails,
    vehicleList
  );

  const { isLoading } = useAppSelector(state => state?.addRegular);
  const { isLoading: updateLoading } = useAppSelector(state => state?.updateRegular);
  const isMd = useMediaQuery('(max-width:600px)');
  const isLg = useMediaQuery('(min-width:950px)');
  const isXl = useMediaQuery('(max-width:1130px)');

  return (
    <Dialog open={open} fullWidth maxWidth={'xl'} sx={{ zIndex: 1 }}>
      <DialogContent sx={{ padding: '0px' }}>
        <Grid container>
          <Grid
            item
            lg={9}
            sx={{
              overflow: 'hidden',
              display: isMd ? 'none' : 'block',
              width: isMd ? '0px' : isLg ? '75%' : '50% !important'
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: isMd ? '0px' : '87vh',
                overflow: { xs: 'scroll', md: 'hidden' },
                borderRadius: '10px',
                padding: '16px'
              }}
            >
              <GoogleMap>
                <GoogleTripDirections
                  handleMarker={handleDragMarker}
                  locations={address}
                  isDraggable={true}
                  showPath={true}
                />
              </GoogleMap>
            </Box>
          </Grid>
          <Grid item lg={3} sx={{ width: isMd ? '100%' : isLg ? '25%' : '50%' }}>
            <Box className='regulartour-formcontainer'>
              <Typography
                className='regulartour-header'
                sx={{
                  marginLeft: isMd ? '10px' : 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                {filteredRow ? 'Update Regular Tour' : 'Add Regular Tour'}

                {/* <Tooltip
                  title={
                    <Typography
                      sx={{
                        color: '#333',
                        fontSize: '13px',
                        fontWeight: 400,
                        lineHeight: 1.5,
                        fontFamily: 'Roboto, sans-serif',
                        padding: '8px'
                      }}
                    >
                      This add or update will only reflect in schedules when rescheduled
                    </Typography>
                  }
                  arrow
                  placement='bottom'
                  enterDelay={200}
                  leaveDelay={100}
                  PopperProps={{
                    modifiers: [
                      {
                        name: 'offset',
                        options: {
                          offset: [0, 8]
                        }
                      }
                    ]
                  }}
                  slotProps={{
                    popper: {
                      sx: {
                        '& .MuiTooltip-tooltip': {
                          backgroundColor: '#fff',
                          color: '#333',
                          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          maxWidth: 220,
                          border: '2px solid #cce5ff'
                        },
                        '& .MuiTooltip-arrow': {
                          color: '#fff',
                          '&::before': {
                            border: '2px solid #cce5ff'
                          }
                        }
                      }
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <Icon icon='mdi:information-outline' width='20' height='20' />
                  </Box>
                </Tooltip> */}
                <CustomTooltip
                  content='This add or update will take effect in the schedules only upon rescheduling. Further rescheduling may be required.'
                  icon='mdi:alert-circle-outline'
                  iconSize={20}
                  placement='bottom'
                  color={'#ed6c02'}
                />
              </Typography>
              <Box className='closeIcon icon-position d-flex close-icon-index'>
                <CustomIconButton
                  category='CloseValue'
                  onClick={() => {
                    setFilteredRow(null);
                    setOpen(false);
                  }}
                />
              </Box>

              <Box
                component={'form'}
                className='addregularform'
                sx={{ height: isXl || isMd ? '70vh' : '80vh' }}
                onSubmit={handleSubmit(formSubmit)}
              >
                <AddRegularForm
                  fields={addRegularFields(null, null)}
                  address={address}
                  onLocationChange={onLocationChange}
                  control={control}
                  setValue={setValue}
                  onTimeChange={handleTimeChange}
                  getValues={getValues}
                  minTime={minTime}
                  filteredRow={filteredRow}
                  setAddress={setAddress}
                  setError={setError}
                  trigger={trigger}
                />
                <Stack className='addregular-buttons'>
                  <CustomButton
                    className='cancel'
                    category='Cancel'
                    onClick={() => {
                      setFilteredRow(null);
                      setOpen(false);
                    }}
                  />
                  <CustomButton
                    className='saveChanges'
                    category={'Save'}
                    type='submit'
                    loading={filteredRow ? updateLoading : isLoading}
                  />
                </Stack>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default AddRegularMode;
