import { Grid, Typography } from '@mui/material';
import CustomTextField from '../../../../../../common/components/customized/customtextfield/CustomTextField';
import CustomSelect from '../../../../../../common/components/customized/customselect/CustomSelect';
import CustomDateTimeCalendar from '../../../../../../common/components/customized/customdatetimecalendar/CustomDateTimeCalendar';

const FuelEntryFormFields = ({
  isXs,
  state,
  control,
  validationFields,
  isValidField,
  handleFilterChange,
  fuelStationOptions,
  dateTime,
  setDateTime,
  setValue,
  clearErrors,
  convertDatetoEpoch,
  dayjs,
  fuelTypeOptions,
  getValues,
  paymentOptions
}: any) => {
  return (
    <Grid item xs={12} sm={12} md={12} lg={7.9} className='driver-grid-one'>
      <Typography className={isXs ? 'driver-grid-head-c' : 'driver-grid-head'}>
        {state?.selectedRow ? 'Update Fuel Entry' : 'New Fuel Entry'}
      </Typography>
      <Typography className={isXs ? 'driver-content-c' : ''}>
        Fill in all the required information about your fuel and AdBlue refill
      </Typography>
      <Grid container spacing={1} mt={1}>
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <Typography>Vehicle Details</Typography>{' '}
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} sx={{ mt: 0.5 }}>
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
        <Grid item xs={12} sm={6} md={3} lg={3} sx={{ mt: 0.5 }}>
          <CustomSelect
            name='fuelStation'
            id='fuelStation'
            control={control}
            placeholder='Fuel Station'
            label='Fuel Station'
            options={fuelStationOptions}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
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
        <Grid item xs={12} sm={6} md={3} lg={3} sx={{ mt: 0.5 }}>
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
          <Typography>Fuel Information</Typography>{' '}
        </Grid>
        <Grid item xs={6} sm={4} md={4} lg={4}>
          <CustomSelect
            name='fuelType'
            id='fuelType'
            control={control}
            placeholder='Fuel Type'
            label='Fuel Type'
            options={fuelTypeOptions}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={4} lg={4}>
          <CustomTextField
            name='volume'
            id='volume'
            control={control}
            placeholder='Volume (L)'
            label='Volume (L)'
            onChangeCallback={(e: any) => {
              setValue('volume', e);
              if (getValues('price')) {
                const data = Math.round(getValues('price')! * e * 100) / 100;
                setValue('total', data);
              }
            }}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={4} lg={4}>
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
                const data = Math.round(getValues('volume')! * e * 100) / 100;
                setValue('total', data);
              }
            }}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={4} lg={4}>
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
        <Grid item xs={12} sm={4} md={4} lg={4}>
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
        <Grid item xs={12} sm={4} md={4} lg={4}>
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
          <Typography>AdBlue (Optional)</Typography>{' '}
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
                const data = Math.round(getValues('adBluePrice')! * e * 100) / 100;
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
                const data = Math.round(getValues('adBlueVolume')! * e * 100) / 100;
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
      </Grid>
    </Grid>
  );
};

export default FuelEntryFormFields;
