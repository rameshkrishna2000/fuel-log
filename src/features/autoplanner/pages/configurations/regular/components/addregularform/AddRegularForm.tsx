import React, { useCallback, useEffect, useState } from 'react';
import { daysOfWeek } from '../../componentDatas/componentDatas';
import CustomTextField from '../../../../../../../common/components/customized/customtextfield/CustomTextField';
import { Alert, Box, Grid, Stack, Typography } from '@mui/material';
import GoogleSearchBox from '../../../../../../../common/components/maps/googlesearchbox/GoogleSearchBox';
import CustomSelect from '../../../../../../../common/components/customized/customselect/CustomSelect';
import CustomTimePicker from '../../../../../../../common/components/customized/customtimepicker/CustomTimePicker';
import CustomMultiSelect from '../../../../../../../common/components/customized/custommultiselect/CustomMultiSelect';
import { useAppDispatch, useAppSelector } from '../../../../../../../app/redux/hooks';
import { useValidations } from '../../hooks/fieldsControl';
import {
  clearDrivers,
  getDriverDetails
} from '../../../../../redux/reducer/autoPlannerSlices/regularSlices';
import { useDebounce } from '../../../../../../../common/hooks/useDebounce';

interface AddRegularFormProps {
  fields:
    | {
        [key: string]: string | boolean | any;
        type: string;
        fields?: any;
      }[]
    | any;
  control?: any;
  onLocationChange?: any;
  address?: any;
  setValue?: any;
  onTimeChange?: any;
  getValues?: any;
  minTime?: any;
  filteredRow?: any;
  setError: any;
  setAddress: React.Dispatch<React.SetStateAction<any>>;
  trigger?: any;
}

const AddRegularForm: React.FC<AddRegularFormProps> = ({
  fields,
  onLocationChange,
  address,
  control,
  setValue,
  onTimeChange,
  getValues,
  minTime,
  filteredRow,
  setError,
  trigger
}) => {
  const dispatch = useAppDispatch();
  const { data: vehicleList, isLoading: vehicleLoading } = useAppSelector(
    state => state.configurableVehicles
  );
  const { data: driverList, isLoading: driverLoading } = useAppSelector(
    state => state.regularDrivers
  );

  const { isSeatingAvailable, noSeats, isDriverAvailable } = useValidations(
    getValues,
    vehicleList,
    getDriverDetails,
    filteredRow,
    setError,
    setValue
  );

  const dropDownData: any = {
    vehicle: { options: vehicleList ?? [], loading: vehicleLoading },
    driver: { options: driverList ?? [], loading: driverLoading }
  };

  return (
    <>
      {fields?.map(({ fieldType, renderFields, max, header, ...rest }: any) =>
        fieldType === 'textfield' ? (
          <CustomTextField
            key={rest.name}
            {...rest}
            control={control}
            maxlength={max}
            onChangeCallback={(value: any) => {
              setValue(rest.name, value);
            }}
          />
        ) : fieldType === 'location' ? (
          <Box className='locationdetails-container'>
            <Typography variant='h6' fontSize={'16px'}>
              {header}
            </Typography>
            {renderFields?.map(({ fieldType, max, ...locations }: any) => {
              if (fieldType === 'textfield') {
                return (
                  <CustomTextField
                    {...locations}
                    control={control}
                    maxlength={max}
                    onChangeCallback={(value: any) => {
                      setValue(locations.name, value);
                    }}
                  />
                );
              } else if (fieldType === 'searchbox') {
                return (
                  <GoogleSearchBox
                    {...locations}
                    control={control}
                    country='sg'
                    onChangeCallback={(place: any) => {
                      onLocationChange(locations.id, place, locations.name);
                      isDriverAvailable();
                    }}
                    value={
                      address?.find((item: any) => locations?.id === item?.id)?.address
                    }
                    onchange={(place: any) => {
                      if (!place.target.value) {
                        onLocationChange(
                          locations.id,
                          place.target.value,
                          locations.name
                        );
                        dispatch(clearDrivers());
                      }
                    }}
                  />
                );
              }
            })}
          </Box>
        ) : fieldType === 'select' ? (
          <CustomSelect
            {...rest}
            loading={dropDownData[rest.name].loading}
            control={control}
            options={dropDownData[rest.name].options}
            // isDisabled={rest.name === 'driver' && options[rest.name]?.length === 0}
            isOptional={rest.name === 'driver' ? !getValues('vehicle') : rest.isOptional}
            onChanges={(e: any, newValue: any) => {
              setValue(rest.name, newValue?.id);
              trigger(rest.name);
              isSeatingAvailable();

              if (!getValues('vehicle')) {
                trigger('driver');
              }

              if (rest.name !== 'driver') {
                isDriverAvailable();
              }
            }}
          />
        ) : fieldType === 'alert' ? (
          <Alert
            sx={{
              marginBottom: '5px',
              padding: '5px 10px',
              alignItems: 'center',
              fontSize: '12px'
            }}
            severity='warning'
          >
            {header}
          </Alert>
        ) : fieldType === 'time' ? (
          <Box className='regulartour-timings'>
            <Typography variant='h6' fontSize={'16px'}>
              {header}
            </Typography>
            <Grid container columnSpacing={2} rowSpacing={1}>
              {renderFields?.map(({ id, ...times }: any) => {
                if (!['bufferTime', 'availableDays']?.includes(id)) {
                  return (
                    <Grid item lg={6} md={12} key={id} sm={12} xs={12}>
                      <CustomTimePicker
                        {...times}
                        control={control}
                        onTimeChange={(event: any) => {
                          if (event?.$d) onTimeChange(event?.$d, times?.name);
                          isDriverAvailable();
                        }}
                        values={getValues(times.name)}
                        // minTime={times.name === 'endTime' ? minTime : null}
                      />
                    </Grid>
                  );
                } else if (id === 'bufferTime') {
                  return (
                    <Grid item lg={12} md={12} sm={12} xs={12}>
                      <CustomTimePicker
                        {...times}
                        control={control}
                        isClock={false}
                        isOptional={true}
                        format='HH:mm'
                        onTimeChange={(event: any) => {
                          if (event?.$d) onTimeChange(event?.$d);
                          isDriverAvailable();
                        }}
                        values={getValues(times.name)}
                      />
                    </Grid>
                  );
                } else {
                  return (
                    <Grid item lg={12} md={12} sm={12} xs={12}>
                      <CustomMultiSelect
                        {...times}
                        control={control}
                        options={daysOfWeek}
                        initialValue={getValues(times.name)?.map(
                          (value: any) => value.id
                        )}
                        width='200px'
                        // mappedList={daysOfWeek?.filter((item: any) =>
                        //   filteredRow?.scheduledDays?.includes(item.id)
                        // )}
                        onChanges={(e: React.SyntheticEvent, newValue: any) => {
                          if (newValue.length === 0) {
                            setValue(times.name, null);
                            return;
                          }
                          trigger(times.name);
                          isDriverAvailable();
                        }}
                        setValue={setValue}
                      />
                    </Grid>
                  );
                }
              })}
            </Grid>
          </Box>
        ) : fieldType === 'passengers' ? (
          <>
            <Grid container columnSpacing={2}>
              {renderFields?.map(({ id, ...passengers }: any) => {
                return (
                  <Grid item lg={6} sm={12} md={12} xs={12}>
                    <CustomTextField
                      {...passengers}
                      control={control}
                      isOptional
                      type={'number'}
                      isDecimal={true}
                      onChangeCallback={(value: string) => {
                        setValue(passengers.name, value);
                        isSeatingAvailable();
                        // isDriverAvailable();
                      }}
                    />
                  </Grid>
                );
              })}
            </Grid>
            {!noSeats && (
              <Typography
                sx={{
                  color: '#d32f2f !important',
                  fontWeight: '400 !important',
                  marginTop: '-4px !important;',
                  fontSize: '0.75rem !important',
                  fontFamily: '"Inter", sans-serif !important',
                  marginBottom: '10px'
                }}
              >
                {'Seating capacity reached'}
              </Typography>
            )}
          </>
        ) : (
          <></>
        )
      )}
    </>
  );
};

export default AddRegularForm;
