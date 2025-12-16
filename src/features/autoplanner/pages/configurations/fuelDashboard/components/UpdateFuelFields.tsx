import { Box, Grid, Typography } from '@mui/material';
import CustomTextField from '../../../../../../common/components/customized/customtextfield/CustomTextField';
import {
  convertDatetoEpoch,
  isValidField
} from '../../../../../../utils/commonFunctions';
import dayjs from 'dayjs';
import CustomSelect from '../../../../../../common/components/customized/customselect/CustomSelect';
import CustomDateTimeCalendar from '../../../../../../common/components/customized/customdatetimecalendar/CustomDateTimeCalendar';
import { DriverImage } from '../../driverDashboard/DriverImage';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';

const UpdateFuelFields = ({
  control,
  errors,
  handleSubmit,
  onSubmit,
  setValue,
  getValues,
  clearErrors,
  dateTime,
  setDateTime,
  fuelStationOptions,
  fuelTypeOptions,
  paymentOptions,
  uploadConfig,
  validationFields,
  handleFilterChange,
  handleUpload,
  handleDelete,
  handleImage,
  setIsUpdate,
  updateLoading
}: any) => {
  return (
    <Box
      component='form'
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        overflow: 'scroll',
        height: '80vh',
        scrollbarWidth: 'none',
        marginTop: '5px'
      }}
    >
      <Grid container spacing={1} mt={1}>
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <Typography className='update-fuel-bold'>Vehicle Details</Typography>{' '}
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mt: 0.5 }}>
          <CustomTextField
            name='vehicleNumber'
            id='vehicleNumber'
            control={control}
            placeholder='Vehicle Number'
            label='Vehicle Number'
            loading={
              'vehicleNumber' === Object.keys(validationFields)?.[0] &&
              validationFields.vehicleNumber.status
            }
            onChangeCallback={(e: any) => {
              const valid = isValidField('vehicleNumber', e);
              if (valid) {
                handleFilterChange(e, 'vehicleNumber');
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mt: 0.5 }}>
          <CustomSelect
            name='fuelStation'
            id='fuelStation'
            control={control}
            placeholder='Fuel Station'
            label='Fuel Station'
            options={fuelStationOptions}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <CustomDateTimeCalendar
            name='dateTime'
            id='dateTime'
            control={control}
            disablePast={true}
            disableFuture={true}
            isDisabled={true}
            placeholder='Date & Time'
            label='Date & Time'
            value={dateTime}
            onDateChange={(e: any) => {
              if (e?.$d && e?.$d != 'Invalid Date') {
                setDateTime(e?.$d);
                setValue('dateTime' as any, dayjs.unix(convertDatetoEpoch(e?.$d) / 1000));
                clearErrors('dateTime');
              } else {
                setDateTime(null);
                setValue('dateTime' as any, null);
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mt: 0.5 }}>
          <CustomTextField
            name='reading'
            id='reading'
            control={control}
            placeholder='Reading (km)'
            label='Reading (km)'
          />
        </Grid>
      </Grid>
      <Grid container spacing={1} mt={0.5}>
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <Typography className='update-fuel-bold'>Fuel Information</Typography>{' '}
        </Grid>
        <Grid item xs={6} sm={4} md={4} lg={6}>
          <CustomSelect
            name='fuelType'
            id='fuelType'
            control={control}
            placeholder='Fuel Type'
            label='Fuel Type'
            options={fuelTypeOptions}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={4} lg={6}>
          <CustomTextField
            name='volume'
            id='volume'
            control={control}
            placeholder='Volume (L)'
            label='Volume (L)'
            onChangeCallback={(e: any) => {
              setValue('volume', e);
              if (getValues('price')) {
                const data = getValues('price')! * e;
                setValue('total', data);
              }
            }}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={4} lg={6}>
          <CustomTextField
            name='price'
            id='price'
            control={control}
            placeholder='Price / Unit (S$)'
            isOptional={true}
            label='Price / Unit (S$)'
            onChangeCallback={(e: any) => {
              setValue('price', e);
              if (getValues('volume')) {
                const data = getValues('volume') * e;
                setValue('total', data);
              }
            }}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={4} lg={6}>
          <CustomTextField
            name='total'
            id='total'
            isOptional={true}
            control={control}
            disabled={true}
            placeholder='Total (S$)'
            label='Total (S$)'
          />
        </Grid>
        <Grid item xs={12} sm={4} md={4} lg={12}>
          <CustomSelect
            name='paymentMethod'
            id='paymentMethod'
            isOptional={true}
            control={control}
            placeholder='Payment Method'
            label='Payment Method'
            options={paymentOptions}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={4} lg={12}>
          <CustomTextField
            name='notes'
            id='notes'
            control={control}
            placeholder='Notes (Optional)'
            label='Notes (Optional)'
            isOptional={true}
          />
        </Grid>
      </Grid>
      <Grid container spacing={1} mt={0.5}>
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <Typography className='update-fuel-bold'>AdBlue (Optional)</Typography>{' '}
        </Grid>
        <Grid item xs={4} sm={4} md={4} lg={4}>
          <CustomTextField
            name='adBlueVolume'
            id='adBlueVolume'
            control={control}
            placeholder='Volume (L)'
            label='Volume (L)'
            isOptional={true}
            onChangeCallback={(e: any) => {
              setValue('adBlueVolume', e);
              if (getValues('adBluePrice')) {
                const data = getValues('adBluePrice')! * e;
                setValue('adBlueTotal', data);
              }
            }}
          />
        </Grid>
        <Grid item xs={4} sm={4} md={4} lg={4}>
          <CustomTextField
            name='adBluePrice'
            id='adBluePrice'
            control={control}
            placeholder='Price / Unit (S$)'
            label='Price / Unit (S$)'
            isOptional={true}
            onChangeCallback={(e: any) => {
              setValue('adBluePrice', e);
              if (getValues('adBlueVolume')) {
                const data = getValues('adBlueVolume')! * e;
                setValue('adBlueTotal', data);
              }
            }}
          />
        </Grid>{' '}
        <Grid item xs={4} sm={4} md={4} lg={4}>
          <CustomTextField
            name='adBlueTotal'
            id='adBlueTotal'
            control={control}
            disabled={true}
            placeholder='Total (S$)'
            label='Total (S$)'
            isOptional={true}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} className='driver-grid-two'>
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
            <CustomButton
              className='cancel'
              category='Cancel'
              onClick={() => setIsUpdate(false)}
            />
            <CustomButton
              type='submit'
              className='saveChanges'
              loading={updateLoading}
              category={'Update Fuel Log'}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UpdateFuelFields;
