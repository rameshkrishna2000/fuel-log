import { Box, Grid, Typography } from '@mui/material';
import React from 'react';
import CustomRadioButton from '../../../../../common/components/customized/customradiobutton/CustomRadioButton';
import CustomSelect from '../../../../../common/components/customized/customselect/CustomSelect';
import CustomTextField from '../../../../../common/components/customized/customtextfield/CustomTextField';
import { Controller } from 'react-hook-form';
import PhoneNoTextField from '../../../../../common/components/customized/customtextfield/PhoneNoTextField';
import CustomTimePicker from '../../../../../common/components/customized/customtimepicker/CustomTimePicker';
import { formatISTtoTime } from '../../../../../utils/commonFunctions';
import dayjs from 'dayjs';
import { useAppSelector } from '../../../../../app/redux/hooks';

const UpdateScheduledTripFields = ({
  control,
  getValues,
  setValue,
  clearErrors,
  setExternal,
  standardVehicles,
  dropdownLoading,
  external,
  errors,
  handleValidate,
  trigger,
  selectedRow,
  handleMinTime,
  timeDif,
  minPickTime,
  maxPickTime
}: any) => {
  const driverName = useAppSelector(state => state.externalvalidation.data);
  const driverNumberLoading = useAppSelector(state => state.externalvalidation.isLoading);
  return (
    <Box>
      <Box>
        <CustomRadioButton
          name='vehicle'
          control={control}
          radiobutton1='Internal Vehicle'
          radiobutton2='External Vehicle'
          value={getValues('vehicle')}
          value1='internal'
          value2='external'
          onChangeCallback={(e: any) => {
            setValue('vehicle', e.target.value);
            clearErrors();
            if (e.target.value === 'internal') {
              setExternal(true);
              // setValue('vehicleNumber', selectedRow?.vehicleNumber);
              setValue('vehicleNumber', '');
              setValue('driverName', '');
              setValue('passengerCount', '');
              setValue('driverNumber', '');
            } else {
              setExternal(false);
              // setValue('vehicleNumber', selectedRow?.vehicleNumber);
              // setValue('driverName', selectedRow.driverName);
              // setValue('passengerCount', selectedRow.seatingCapacity);
              // setValue('driverNumber', selectedRow.driverContactNumber);
              setValue('vehicleNumber', '');
              setValue('driverName', '');
              setValue('passengerCount', '');
              setValue('driverNumber', '');
            }
          }}
        />
        {external ? (
          <>
            <CustomSelect
              id='vehicleNumber'
              control={control}
              name='vehicleNumber'
              label=' Vehicle Number'
              placeholder='Select vehicle number'
              options={standardVehicles}
              loading={dropdownLoading}
            />
          </>
        ) : (
          <>
            <Box>
              <Box sx={{ marginBottom: '10px' }}>
                <CustomTextField
                  id='vehicleNumber'
                  control={control}
                  name='vehicleNumber'
                  label='Vehicle Number'
                  placeholder='Enter external vehicle number'
                  onChangeCallback={e => {
                    setValue('vehicleNumber', e);
                  }}
                />
              </Box>

              <Box sx={{ marginBottom: '10px' }}>
                <CustomTextField
                  id='count'
                  control={control}
                  type='number'
                  name='passengerCount'
                  maxlength={249}
                  label='Seat Capacity'
                  placeholder='Count'
                  onChangeCallback={e => {
                    setValue('passengerCount', e);
                    clearErrors('passengerCount');
                  }}
                />
              </Box>
              <Box sx={{ marginBottom: '10px' }}>
                <Controller
                  name='driverNumber'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <PhoneNoTextField
                      {...field}
                      setValue={setValue}
                      country={'sg'}
                      style='share'
                      label='Contact Number'
                      loading={driverNumberLoading}
                      error={Boolean(errors?.driverNumber?.message)}
                      helperText={errors.driverNumber?.message}
                      onChange={(e: any) => {
                        if (e) {
                          const emptySpace = /^.+\s.+$/g;

                          if (e && !emptySpace.test(e)) {
                            handleValidate(e, 'driverNumber');
                          }
                        } else {
                          setValue('driverNumber', '');
                        }
                        trigger('driverNumber');
                      }}
                    />
                  )}
                />
              </Box>
              <Box sx={{ marginBottom: '10px' }}>
                <CustomTextField
                  id='driverName'
                  control={control}
                  name='driverName'
                  disabled={driverName ? true : false}
                  label='Driver Name'
                  placeholder='Enter driver name'
                  onChangeCallback={e => {
                    setValue('driverName', e);
                  }}
                />
              </Box>
            </Box>
          </>
        )}
      </Box>
      {Object.keys(selectedRow).includes('pickupWindow') ? (
        <Box
          sx={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#f9f9f9',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography sx={{ mb: 2, fontWeight: 'bold' }}>PickUp Windows</Typography>
          <Grid container spacing={2}>
            <Grid item sm={6}>
              <CustomTimePicker
                id='time'
                name='picktime1'
                control={control}
                values={getValues('picktime1')}
                label='From'
                onTimeChange={(event: any) => {
                  if (event !== null && event.$d) {
                    handleMinTime(event.$d, 'pickup');
                    const startTime: any = formatISTtoTime(event.$d);
                    if (startTime)
                      setValue(
                        'picktime2',
                        dayjs()
                          .set('hour', startTime?.split(':')[0])
                          .set('minute', startTime?.split(':')[1])
                          .add(timeDif, 'minute')
                          .toDate()
                      );
                  }
                }}
              />
            </Grid>
            <Grid item sm={6}>
              <CustomTimePicker
                id='time'
                name='picktime2'
                control={control}
                values={getValues('picktime2')}
                label='To'
                isDisabled={true}
                minTime={minPickTime}
                maxTime={maxPickTime}
                onTimeChange={(event: any) => {
                  if (event !== null && event.$d) handleMinTime(event.$d, 'drop');
                }}
              />
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box>
          <Grid item sm={12}>
            <CustomTimePicker
              id='returnTime'
              values={getValues('returnTime')}
              name='returnTime'
              control={control}
              label='Return Time'
            />
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default UpdateScheduledTripFields;
