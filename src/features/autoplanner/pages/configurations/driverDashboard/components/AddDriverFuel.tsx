import { Box, DialogContent, Grid, useMediaQuery } from '@mui/material';
import './AddDriverFuel.scss';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';
import CustomIconButton from '../../../../../../common/components/buttons/CustomIconButton';
import CustomCarousel from '../../../../../../common/components/carousel/CustomCarousel';
import { DriverImage } from '../DriverImage';
import dayjs from 'dayjs';
import {
  convertDatetoEpoch,
  isValidField
} from '../../../../../../utils/commonFunctions';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import {
  useAddDriverEffects,
  useAddDriverStates,
  useDriverDropdowns,
  useHandleClose,
  useHandleDelete,
  useHandleFilter,
  useHandleImage,
  useHandleUpload,
  useMemoDialog,
  useOnSubmit,
  useUploadConfig
} from '../hooks/addDriverFuel';
import FuelEntryFormFields from './FuelEntryFormFields';
import { formFields } from '../hooks/addDriverFuelFields';
import { useDynamicYupSchema } from '../../../../../../common/hooks/useDynamicSchema';

const AddDriverFuel = () => {
  const vehicleNumberValidation = useAppSelector(
    state => state.driverValidationDetails.vehicleNumber
  );
  const { isLoading: addLoading } = useAppSelector(state => state.addDriverFuel);
  const { isLoading: updateLoading } = useAppSelector(state => state.updateDriverFuel);
  const { data: typeDropdownData } = useAppSelector(state => state.getTypeDropdown);
  const { data: stationDropdownData } = useAppSelector(state => state.getStationDropdown);
  const { data: paymentDropdownData } = useAppSelector(state => state.getPaymentDropdown);
  const { timezone } = useAppSelector(state => state.myProfile.data);
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isXs = useMediaQuery('(max-width:600px)');
  const {
    odometerFiles,
    setOdometerFiles,
    fuelFiles,
    setFuelFiles,
    adBlueFiles,
    setAdBlueFiles,
    overallFiles,
    setOverallFiles,
    imageCard,
    setImageCard,
    files,
    setFiles,
    uploadedOdometerFiles,
    setUploadedOdometerFiles,
    uploadedFuelFiles,
    setUploadedFuelFiles,
    uploadedAdBlueFiles,
    setUploadedAdBlueFiles,
    location,
    setLocation,
    dateTime,
    setDateTime,
    validationErrors,
    setValidationErrorsMake,
    validationFields,
    setValidationFields,
    error,
    setError
  } = useAddDriverStates();
  const { MemoizedDialog } = useMemoDialog({ files });
  const { handleImage } = useHandleImage({ setImageCard, setFiles });
  const { createFormFields } = useDynamicYupSchema(null);
  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    getValues,
    reset,
    trigger,
    resetField,
    formState: { errors }
  } = useForm<any>({
    resolver: async (data: any, context: any, options: any) => {
      const updates = formFields({ validationErrors, ...data });
      const { schema }: any = createFormFields(updates);
      return yupResolver(schema)(data, context, options);
    }
  });
  const { fuelTypeOptions, fuelStationOptions, paymentOptions } = useDriverDropdowns({
    typeDropdownData,
    stationDropdownData,
    paymentDropdownData
  });
  const { handleUpload } = useHandleUpload({
    uploadedOdometerFiles,
    uploadedFuelFiles,
    uploadedAdBlueFiles,
    setUploadedOdometerFiles,
    setUploadedFuelFiles,
    setUploadedAdBlueFiles,
    trigger,
    setValue
  });
  const { handleDelete } = useHandleDelete({
    odometerFiles,
    setOdometerFiles,
    overallFiles,
    setOverallFiles,
    fuelFiles,
    setFuelFiles,
    adBlueFiles,
    setAdBlueFiles,
    uploadedOdometerFiles,
    setUploadedOdometerFiles,
    uploadedFuelFiles,
    setUploadedFuelFiles,
    uploadedAdBlueFiles,
    setUploadedAdBlueFiles,
    setValue,
    trigger
  });
  const { onSubmit } = useOnSubmit({
    location,
    state,
    uploadedOdometerFiles,
    uploadedFuelFiles,
    uploadedAdBlueFiles,
    overallFiles,
    dispatch,
    navigate
  });
  const { handleClose } = useHandleClose({ navigate });
  const { uploadConfig } = useUploadConfig({
    overallFiles,
    uploadedOdometerFiles,
    uploadedFuelFiles,
    uploadedAdBlueFiles
  });
  const { handleFilterChange } = useHandleFilter({
    dispatch,
    trigger,
    validationErrors,
    setValidationFields,
    setError
  });
  useAddDriverEffects({
    vehicleNumberValidation,
    error,
    trigger,
    validationErrors,
    setValidationErrorsMake,
    setLocation,
    dispatch,
    state,
    setValue,
    setDateTime,
    setAdBlueFiles,
    setFuelFiles,
    setOdometerFiles,
    setOverallFiles,
    timezone
  });

  return (
    <Box className='driver-fuel-container'>
      <Grid container gap={1} component='form' onSubmit={handleSubmit(onSubmit)}>
        <FuelEntryFormFields
          isXs={isXs}
          state={state}
          control={control}
          validationFields={validationFields}
          isValidField={isValidField}
          handleFilterChange={handleFilterChange}
          fuelStationOptions={fuelStationOptions}
          dateTime={dateTime}
          setDateTime={setDateTime}
          setValue={setValue}
          clearErrors={clearErrors}
          convertDatetoEpoch={convertDatetoEpoch}
          dayjs={dayjs}
          fuelTypeOptions={fuelTypeOptions}
          getValues={getValues}
          paymentOptions={paymentOptions}
        />
        <Grid item xs={12} sm={12} md={12} lg={4} className='driver-grid-two'>
          {uploadConfig.map((item: any, index: number) => (
            <DriverImage
              key={index}
              title={item.title}
              type={item.type}
              overallFiles={item.overallFiles}
              uploadedFiles={item.uploadedFiles}
              handleUpload={handleUpload}
              handleDelete={handleDelete}
              handleImage={handleImage}
              errors={errors}
            />
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }} gap={2}>
            {' '}
            <CustomButton className='cancel' category='Cancel' onClick={handleClose} />
            <CustomButton
              type='submit'
              className='saveChanges'
              loading={state?.selectedRow ? updateLoading : addLoading}
              category={state?.selectedRow ? 'Update Fuel Log' : 'Add Fuel Log'}
            />
          </Box>
        </Grid>
      </Grid>
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
    </Box>
  );
};

export default AddDriverFuel;
