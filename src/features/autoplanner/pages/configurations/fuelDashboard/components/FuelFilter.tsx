import { Box, Grid } from '@mui/material';
import dayjs from 'dayjs';
import CustomMultiSelect from '../../../../../../common/components/customized/custommultiselect/CustomMultiSelect';
import CustomDateTimeCalendar from '../../../../../../common/components/customized/customdatetimecalendar/CustomDateTimeCalendar';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';
import { FilterAlt, FilterAltOff, Settings } from '@mui/icons-material';

const FuelFilter = ({
  handleSubmit,
  onSubmit,
  control,
  getValues,
  setValue,
  vehicleDropdown,
  driverDropdown,
  getStartDate,
  handleCustomFrom,
  handleCustomTo,
  handleFromDate,
  handleToDate,
  getEndDate,
  toDateDisabled,
  fuelStationOptions,
  paymentOptions,
  fuelTypeOptions,
  handleSettings,
  handleClear,
  isLoading,
  filterLoading,
  dataLoading,
  clearLoading
}: any) => {
  return (
    <Grid
      container
      spacing={2}
      className='fuel-grid-filter'
      component='form'
      onSubmit={handleSubmit(onSubmit)}
    >
      <Grid item xs={6} sm={3} md={3} lg={1.7} mt={0.5}>
        <CustomMultiSelect
          name='vehicleNumber'
          id='vehicleNumber'
          control={control}
          initialValue={getValues('vehicleNumber')?.map((item: any) => item.id)}
          isOptional={true}
          setValue={setValue}
          options={vehicleDropdown}
          placeholder='Vehicle Number'
          label='Vehicle Number'
        />
      </Grid>
      <Grid item xs={6} sm={3} md={3} lg={1.7} mt={0.5}>
        <CustomMultiSelect
          name='driver'
          id='driver'
          control={control}
          initialValue={getValues('driver')?.map((item: any) => item.id)}
          setValue={setValue}
          options={driverDropdown}
          isOptional={true}
          placeholder='Driver'
          label='Driver'
        />
      </Grid>
      <Grid item xs={6} sm={3} md={3} lg={1.7}>
        <CustomDateTimeCalendar
          name='fromDate'
          id='fromDate'
          control={control}
          isOptional={true}
          disablePast={false}
          disableFuture={true}
          format='DD/MM/YYYY hh:mm a'
          placeholder='From Date'
          label='From Date'
          value={getStartDate}
          getStartDate={getStartDate}
          type='report'
          onDateSelect={(start: Date, end: Date) => handleCustomFrom(start, end)}
          onDateChange={(date: Date) => handleFromDate(date)}
        />
      </Grid>
      <Grid item xs={6} sm={3} md={3} lg={1.7}>
        <CustomDateTimeCalendar
          name='toDate'
          id='toDate'
          control={control}
          isOptional={true}
          disablePast={false}
          disableFuture={false}
          format='DD/MM/YYYY hh:mm a'
          placeholder='To Date'
          label='To Date'
          value={getEndDate}
          type='report'
          getStartDate={getStartDate}
          onDateSelect={(start: Date, end: Date) => handleCustomTo(start, end)}
          onDateChange={(date: Date) => handleToDate(date)}
          minDateTime={
            getStartDate !== null ? dayjs(getStartDate?.getTime() + 1000 * 600) : null
          }
          maxDateTime={dayjs()
            .set('hour', new Date().getHours())
            .set('minutes', new Date().getMinutes())
            .startOf('minute')}
          isDisabled={toDateDisabled}
        />
      </Grid>{' '}
      <Grid item xs={6} sm={3} md={3} lg={1.7} mt={0.5}>
        <CustomMultiSelect
          name='fuelType'
          id='fuelType'
          control={control}
          initialValue={getValues('fuelType')?.map((item: any) => item.id)}
          isOptional={true}
          setValue={setValue}
          placeholder='Fuel Type'
          label='Fuel Type'
          options={fuelTypeOptions}
        />
      </Grid>{' '}
      <Grid item xs={6} sm={3} md={3} lg={1.7} mt={0.5}>
        <CustomMultiSelect
          name='paymentMethod'
          id='paymentMethod'
          control={control}
          initialValue={getValues('paymentMethod')?.map((item: any) => item.id)}
          isOptional={true}
          setValue={setValue}
          placeholder='Payment Method'
          label='Payment Method'
          options={paymentOptions}
        />
      </Grid>{' '}
      <Grid item xs={6} sm={3} md={3} lg={1.7} mt={0.5}>
        <CustomMultiSelect
          name='fuelStation'
          id='fuelStation'
          control={control}
          initialValue={getValues('fuelStation')?.map((item: any) => item.id)}
          setValue={setValue}
          isOptional={true}
          placeholder='Fuel Station'
          label='Fuel Station'
          options={fuelStationOptions}
        />
      </Grid>{' '}
      <Grid item xs={12} sm={12} md={12} lg={12}>
        {' '}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <CustomButton
            className='cancel fuel-cancel'
            onClick={handleSettings}
            startIcon={<Settings />}
            category='Settings'
          />
          <Box sx={{ display: 'flex', gap: '20px', marginRight: '10px' }}>
            <CustomButton
              className='cancel fuel-cancel'
              onClick={handleClear}
              startIcon={<FilterAltOff />}
              loading={isLoading && clearLoading && dataLoading}
              category='Clear'
            />
            <CustomButton
              type='submit'
              className='saveChanges fuel-filter'
              startIcon={<FilterAlt />}
              loading={isLoading && filterLoading && dataLoading}
              category='Filter'
            />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default FuelFilter;
