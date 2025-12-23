import React from 'react';
import { Controller } from 'react-hook-form';
import { Box, Grid } from '@mui/material';
import CustomSelect from '../../../../../common/components/customized/customselect/CustomSelect';
import CustomTextField from '../../../../../common/components/customized/customtextfield/CustomTextField';
import PhoneNoTextField from '../../../../../common/components/customized/customtextfield/PhoneNoTextField';
import CustomRadioButton from '../../../../../common/components/customized/customradiobutton/CustomRadioButton';
import GoogleSearchBox from '../../../../../common/components/maps/googlesearchbox/GoogleSearchBox';
import CustomTimePicker from '../../../../../common/components/customized/customtimepicker/CustomTimePicker';
import { isValidField } from '../../../../../utils/commonFunctions';
import { useAppSelector } from '../../../../../app/redux/hooks';

const UpdatePvtGrpFields = ({
  control,
  errors,
  setValue,
  trigger,
  getValues,
  clearErrors,
  agentNames,
  standardVehicles,
  dropdownLoading,
  external,
  setExternal,
  setIsDrag,
  setValidationErrorsMake,
  selectedTripRow,
  selectedRow,
  setSeatCapacity,
  sourceAddress,
  handleValidate,
  setSourceAddress
}: any) => {
  const driverName = useAppSelector(state => state.externalvalidation.data);
  const driverNumberLoading = useAppSelector(state => state.externalvalidation.isLoading);
  return (
    <Box>
      <CustomSelect
        id='agent-name'
        control={control}
        name='agentName'
        label='Agent Name'
        placeholder='Select Agent Name'
        options={agentNames}
        isDisabled={
          selectedTripRow?.role !== 'ROLE_OPERATOR' &&
          selectedTripRow?.role !== 'ROLE_AUTOPLANNER_ADMIN'
        }
      />
      <CustomTextField
        id='guest-name'
        control={control}
        name='guestName'
        label='Guest Name'
        placeholder='Enter Guest Name'
      />
      <Controller
        name='phone'
        control={control}
        defaultValue={selectedTripRow?.guestContactNumber || ''}
        rules={{ required: true }}
        render={({ field }: any) => (
          <PhoneNoTextField
            {...field}
            setValue={setValue}
            isOptional={true}
            style='share'
            label='Contact Number'
            error={Boolean(errors?.phone?.message)}
            helperText={errors.phone?.message}
            onChange={(e: any) => {
              if (e) {
                const emptySpace = /^.+\s.+$/g;
                const isValid = isValidField('contactnumber', e);
                if (e && !emptySpace.test(e) && isValid) {
                  handleValidate(e, field?.name);
                }
              } else {
                setValue('phone', '');
              }
              trigger('phone');
            }}
          />
        )}
      />
      <Grid container spacing={1} className='adult-count-field'>
        <Grid item sm={6}>
          <CustomTextField
            id='adult-count'
            control={control}
            type='number'
            name='adultCount'
            label='Adult Count'
            placeholder='Enter Count'
          />
        </Grid>
        <Grid item sm={6} className='child-count-field'>
          <CustomTextField
            id='child-count'
            control={control}
            type='number'
            name='childCount'
            label='Child Count'
            placeholder='Enter Count'
          />
        </Grid>
      </Grid>
      <CustomTextField
        id='reference-no'
        control={control}
        name='refNumber'
        label='Reference No.'
        placeholder='Enter Reference No.'
      />
      <CustomRadioButton
        name='vehicle'
        control={control}
        radiobutton1='Internal Vehicle'
        radiobutton2='External Vehicle'
        value1='internal'
        value2='external'
        value={getValues('vehicle')}
        onChangeCallback={(e: any) => {
          setValue('vehicle', e.target.value);
          clearErrors('vehicleNumber');
          if (e.target.value === 'internal') {
            setExternal(true);
            setIsDrag(false);
            setValue('vehicleNumber', '');
            setValue('driverName', '');
            setValue('passengerCount', '');
            setValue('driverNumber', '');
          } else {
            setValidationErrorsMake((prev: any) => ({
              ...prev,
              driverNumber: null
            }));
            clearErrors('driverNumber');
            setExternal(false);
            setIsDrag(true);
            setValue('vehicleNumber', '');
            setValue('driverName', '');
            setValue('passengerCount', '');
            setValue('driverNumber', '');
          }
        }}
      />
      {external ? (
        <CustomSelect
          id='vehicleNumber'
          control={control}
          name='vehicleNumber'
          label=' Vehicle Number'
          placeholder='Select vehicle number'
          options={standardVehicles}
          loading={dropdownLoading}
        />
      ) : (
        <Box>
          <Box sx={{ marginBottom: '10px' }}>
            <CustomTextField
              id='vehicleNumber'
              control={control}
              name='vehicleNumber'
              label='Vehicle Number'
              placeholder='Enter external vehicle number'
              onChangeCallback={e => setValue('vehicleNumber', e)}
            />
          </Box>

          <Box sx={{ marginBottom: '10px' }}>
            <CustomTextField
              id='count'
              control={control}
              type='number'
              name='passengerCount'
              disabled={selectedRow ? true : false}
              maxlength={249}
              label='Seat Capacity'
              placeholder='Count'
              onChangeCallback={e => {
                setSeatCapacity(e);
                setValue('passengerCount', e);
                clearErrors('passengerCount');
              }}
            />
          </Box>
          <Box sx={{ marginBottom: '10px' }}>
            <Controller
              name='driverNumber'
              control={control}
              defaultValue={selectedTripRow?.driverContactNumber || '+65'}
              rules={{ required: true }}
              render={({ field }) => (
                <PhoneNoTextField
                  {...field}
                  setValue={setValue}
                  country={'sg'}
                  disableCountry={true}
                  loading={driverNumberLoading}
                  style='share'
                  label='Contact Number'
                  error={errors?.driverNumber?.message ? true : false}
                  helperText={errors?.driverNumber?.message}
                  onChange={(e: any) => {
                    if (e) {
                      const emptySpace = /^.+\s.+$/g;
                      const isValid = isValidField('contactnumber', e);
                      if (e && !emptySpace.test(e) && isValid) {
                        handleValidate(e, field?.name);
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
              label='Driver Name'
              disabled={driverName ? true : false}
              placeholder='Enter driver name'
              onChangeCallback={e => setValue('driverName', e)}
            />
          </Box>
        </Box>
      )}

      <GoogleSearchBox
        id='search-source'
        name='sourceAddress'
        control={control}
        label='Pickup Location'
        placeholder='Search Location..'
        value={sourceAddress?.formatted_address}
        setAddress={setSourceAddress}
        disabled={true}
        country='sg'
      />
      <CustomTextField
        id='search-destination'
        control={control}
        name='tourORdestination'
        placeholder='Enter tour name'
        disabled={true}
        label={selectedTripRow?.isCustomRoute === 0 ? 'Tour Name ' : 'Drop Location'}
      />
      <CustomTimePicker
        id='time'
        name='time'
        control={control}
        isDisabled={true}
        label='Time'
        values={getValues('time')}
      />
    </Box>
  );
};

export default UpdatePvtGrpFields;
