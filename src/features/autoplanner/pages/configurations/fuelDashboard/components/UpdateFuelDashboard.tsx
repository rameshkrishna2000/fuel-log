import { Icon } from '@iconify/react';
import { Box, Dialog, DialogContent, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import CustomIconButton from '../../../../../../common/components/buttons/CustomIconButton';
import CustomCarousel from '../../../../../../common/components/carousel/CustomCarousel';
import {
  useConfig,
  useHandleDelete,
  useHandleFilterChange,
  useHandleImage,
  useHandleUpload,
  useMemoDialog,
  useOnSubmit,
  useUpdateFuelDropdown,
  useUpdateFuelEffects,
  useUpdateFuelStates
} from '../hooks/updateFuelDashboard';
import UpdateFuelFields from './UpdateFuelFields';
import { useDynamicYupSchema } from '../../../../../../common/hooks/useDynamicSchema';
import { formFields } from '../../driverDashboard/hooks/addDriverFuelFields';

const UpdateFuelDashboard = ({
  isUpdate,
  setIsUpdate,
  selectedValue,
  filterPayload,
  setPageNo
}: any) => {
  const {
    validationFields,
    setValidationFields,
    error,
    setError,
    validationErrors,
    setValidationErrorsMake,
    dateTime,
    setDateTime,
    overallFiles,
    setOverallFiles,
    adBlueFiles,
    setAdBlueFiles,
    fuelFiles,
    setFuelFiles,
    odometerFiles,
    setOdometerFiles,
    uploadedAdBlueFiles,
    setUploadedAdBlueFiles,
    uploadedFuelFiles,
    setUploadedFuelFiles,
    uploadedOdometerFiles,
    setUploadedOdometerFiles,
    files,
    setFiles,
    imageCard,
    setImageCard
  } = useUpdateFuelStates();
  const vehicleNumberValidation = useAppSelector(
    state => state.driverValidationDetails.vehicleNumber
  );
  const { isLoading: updateLoading } = useAppSelector(state => state.updateDriverFuel);
  const { data: typeDropdownData } = useAppSelector(state => state.getTypeDropdown);
  const { data: stationDropdownData } = useAppSelector(state => state.getStationDropdown);
  const { data: paymentDropdownData } = useAppSelector(state => state.getPaymentDropdown);
  const dispatch = useAppDispatch();
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
  const { MemoizedDialog } = useMemoDialog({ files });
  const { fuelTypeOptions, fuelStationOptions, paymentOptions } = useUpdateFuelDropdown({
    typeDropdownData,
    stationDropdownData,
    paymentDropdownData
  });
  const { uploadConfig } = useConfig({
    overallFiles,
    uploadedOdometerFiles,
    uploadedFuelFiles,
    uploadedAdBlueFiles
  });
  const { handleUpload } = useHandleUpload({
    uploadedOdometerFiles,
    uploadedFuelFiles,
    uploadedAdBlueFiles,
    setUploadedOdometerFiles,
    setValue,
    trigger,
    setUploadedFuelFiles,
    setUploadedAdBlueFiles
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
    setUploadedOdometerFiles,
    uploadedOdometerFiles,
    setValue,
    trigger,
    uploadedFuelFiles,
    setUploadedFuelFiles,
    setUploadedAdBlueFiles,
    uploadedAdBlueFiles
  });
  const { onSubmit } = useOnSubmit({
    selectedValue,
    uploadedAdBlueFiles,
    uploadedFuelFiles,
    uploadedOdometerFiles,
    overallFiles,
    dispatch,
    setIsUpdate,
    setPageNo,
    filterPayload
  });
  const { handleImage } = useHandleImage({ setImageCard, setFiles });
  const { handleFilterChange } = useHandleFilterChange({
    setValidationFields,
    dispatch,
    setError,
    trigger,
    validationErrors
  });
  useUpdateFuelEffects({
    setValidationErrorsMake,
    vehicleNumberValidation,
    error,
    trigger,
    validationErrors,
    dispatch,
    selectedValue,
    setValue,
    setDateTime,
    setAdBlueFiles,
    setFuelFiles,
    setOdometerFiles,
    setOverallFiles
  });

  return (
    <>
      <Dialog
        open={isUpdate}
        maxWidth='sm'
        onClose={() => setIsUpdate(false)}
        className='fuel-dialog-cont'
        PaperProps={{
          sx: {
            minHeight: '500px',
            padding: '10px 10px 10px 20px'
          }
        }}
        fullWidth
      >
        {' '}
        <Box className='fuel-dialog-head'>
          <Box>
            {' '}
            <Typography className='fuel-dialog-text'>Update Fuel Log</Typography>
            <Typography className='fuel-dialog-text-p'>
              Update the fuel entry information below
            </Typography>
          </Box>
          <Box className='fuel-dialog-icon-cont'>
            <Icon
              icon='ri:close-fill'
              className='fuel-dialog-icon'
              onClick={() => setIsUpdate(false)}
            />
          </Box>
        </Box>
        <UpdateFuelFields
          control={control}
          errors={errors}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          setValue={setValue}
          getValues={getValues}
          clearErrors={clearErrors}
          dateTime={dateTime}
          setDateTime={setDateTime}
          fuelStationOptions={fuelStationOptions}
          fuelTypeOptions={fuelTypeOptions}
          paymentOptions={paymentOptions}
          uploadConfig={uploadConfig}
          validationFields={validationFields}
          handleFilterChange={handleFilterChange}
          handleUpload={handleUpload}
          handleDelete={handleDelete}
          handleImage={handleImage}
          setIsUpdate={setIsUpdate}
          updateLoading={updateLoading}
        />
      </Dialog>
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
    </>
  );
};

export default UpdateFuelDashboard;
