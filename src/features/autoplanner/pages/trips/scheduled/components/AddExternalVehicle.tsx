import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Dialog, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import CustomIconButton from '../../../../../../common/components/buttons/CustomIconButton';
import CustomTextField from '../../../../../../common/components/customized/customtextfield/CustomTextField';
import PhoneNoTextField from '../../../../../../common/components/customized/customtextfield/PhoneNoTextField';
import CustomSelect from '../../../../../../common/components/customized/customselect/CustomSelect';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import CustomRadioButton from '../../../../../../common/components/customized/customradiobutton/CustomRadioButton';
import {
  getExcelAction,
  scheduleTripsAction,
  sicBookingsUpdate,
  switchTripsAction
} from '../../../../redux/reducer/autoPlannerSlices/autoGenerateSlice';
import { formatISTtoTime } from '../../../../../../utils/commonFunctions';

const AddExternalVehicle = ({
  selectedRow,
  isDialog,
  setAnchorEl,
  setTransRow,
  setIsDialog,
  transRow,
  vehicleList,
  hotelLocationList,
  scheduleDate,
  tripMode
}: any) => {
  const tripSchema: any = () =>
    yup.object().shape({
      vehicle: yup
        .string()
        .oneOf(['internal', 'external'])
        .required('Select vehicle type')
        .default('internal'),

      search: yup.string().notRequired(),
      vehicleNumber: yup.string().when('vehicle', {
        is: 'internal',
        then: () => yup.string().required('Select vehicle number'),
        otherwise: () =>
          yup
            .string()
            .required('Enter vehicle number')
            .matches(/^[A-Za-z0-9]*$/, 'Only letters and numbers allowed without spaces')
            .test(
              'valid-length',
              'Enter a valid vehicle number',
              value => (value?.length || 0) >= 4
            )
            .max(20, 'Maximum 20 characters')
            .test('has-letter', 'Must include at least one letter', value =>
              /[A-Za-z]/.test(value || '')
            )
            .test('has-number', 'Must include at least one number', value =>
              /[0-9]/.test(value || '')
            )
      }),
      hotel: yup.string().required('Select Transfer To'),
      driverName: yup.string().when('vehicle', {
        is: 'external',
        then: () => yup.string().required('Enter Driver Name'),
        otherwise: () => yup.string().notRequired()
      }),
      passengerCount: yup.string().when('vehicle', {
        is: 'external',
        then: () =>
          yup
            .number()
            .required('Enter Seat Capacity')
            .min(
              selectedRow?.netCount ? selectedRow?.netCount : 1,
              `Seat Capacity Must be Minimum ${selectedRow?.netCount}`
            )
            .typeError(`Seat Capacity Must be Minimum ${selectedRow?.netCount}`),
        otherwise: () => yup.string().notRequired()
      }),
      driverNumber: yup.string().when('vehicle', {
        is: 'external',
        then: () => yup.string().required('Enter Contact Number'),
        otherwise: () => yup.string().notRequired()
      })
    });

  const [external, setExternal] = useState(false);
  const [seatCapacity, setSeatCapacity] = useState<any>(0);
  const { isLoading: updateLoading } = useAppSelector(state => state.sicBookingsUpdate);
  const { data: hotelLocation, isLoading: hotelLocationLoading } = useAppSelector(
    state => state.mainHotels
  );
  const { isLoading: vehicleLoading, data: vehicleListData } = useAppSelector(
    state => state.getStandardVehicles
  );

  const dispatch = useAppDispatch();

  const {
    control,
    setValue,
    clearErrors,
    handleSubmit,
    getValues,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(tripSchema())
  });

  //function to reset fields
  const handleClose = () => {
    reset();
    setTransRow(null);
    setExternal(false);
    setAnchorEl(null);
    setIsDialog('');
  };
  const onSubmit = async (params: any) => {
    const selectedTrip = selectedRow ? selectedRow : transRow;
    const filteredVehicle = selectedTrip?.mainHotelResponses?.find(
      (item: any) => item?.coordinates?.locationAddress === params?.hotel
    );
    let payload: any = {
      id: selectedTrip.id,
      agentName: selectedTrip.agentName,
      guestName: selectedTrip.guestName,
      source: selectedTrip.source,
      startLat: selectedTrip.startLat,
      startLng: selectedTrip.startLng,
      driverName: selectedTrip.driverName,
      driverId: selectedTrip?.driverId,
      driverContactNumber: selectedTrip?.driverContactNumber,
      destination: selectedTrip.destination,
      endLat: selectedTrip.endLat,
      endLng: selectedTrip.endLng,
      time: formatISTtoTime(selectedTrip.time),
      childCount: selectedTrip.childCount,
      returnTime: selectedTrip.returnTime,
      adultCount: selectedTrip.adultCount,
      refNumber: selectedTrip.refNumber,
      vehicleNumber: selectedTrip.vehicleNumber,
      mainHotelResponses: selectedTrip.mainHotelResponses,
      modifyVehicleDriver: 0,

      isExternalVehicle: selectedTrip?.isExternalVehicle,
      externalVehicleView: external
        ? null
        : {
            vehicleNumber: params.vehicleNumber,
            driverName: params.driverName,
            mobileNumber: params.driverNumber,
            driverID: `${params?.driverName}${params?.driverNumber}`,
            isExternalVehicle: 1,
            seatingCapacity: params.passengerCount,
            isActive: selectedTrip?.externalVehicleView?.isActive
          },
      transferInstance: {
        vehicleNumber: params?.vehicleNumber,
        mainCoachPickupTime: filteredVehicle?.mainCoachPickupTime,
        to: {
          locationAddress: filteredVehicle?.coordinates?.locationAddress,
          lat: filteredVehicle?.coordinates?.lat,
          lng: filteredVehicle?.coordinates?.lng
        },
        isExternalVehicle: external ? 1 : 0,
        tourName: selectedTrip.tourName,
        totalCount: selectedTrip?.totalCount,
        seatingCapacity: params?.passengerCount,
        driverName: params?.driverName,
        contactNumber: params?.driverNumber
      },
      isReturnTrip: selectedTrip.isReturnTrip,
      tourName: selectedTrip.tourName,
      journeyId: selectedTrip.journeyId || selectedTrip.journeyID
    };
    const pageDetails = {
      autoplannerID: scheduleDate,
      tripMode: Boolean(transRow) ? transRow.mode : selectedRow?.mode,
      id: selectedTrip?.id
    };

    await dispatch(
      sicBookingsUpdate({
        payload,
        pageDetails
      })
    );
    setIsDialog('');
    if (selectedTrip?.time && tripMode !== 'ALL') {
      await dispatch(
        switchTripsAction({ ...pageDetails, tripMode: tripMode, PageNo: 1, PageSize: 20 })
      );
    }
    if (selectedTrip?.time && tripMode === 'ALL') {
      await dispatch(
        getExcelAction({ ...pageDetails, tripMode: tripMode, PageNo: 1, PageSize: 20 })
      );
    }
    handleClose();
  };

  useEffect(() => {
    if (transRow) {
      setValue(
        'vehicle',
        transRow?.transferInstance?.isExternalVehicle ? 'external' : 'internal'
      );
      setExternal(Boolean(transRow?.transferInstance?.isExternalVehicle));
      setValue('driverName', transRow?.transferInstance?.driverName);
      setValue('driverNumber', transRow?.transferInstance?.contactNumber);
      setValue('passengerCount', transRow?.transferInstance?.seatingCapacity);
      setValue('vehicleNumber', transRow?.transferInstance?.vehicleNumber);
      setValue('hotel', transRow?.transferInstance?.to?.locationAddress);
    }
  }, [transRow]);
  return (
    <Dialog
      open={isDialog === 'addTransfer'}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(to bottom, #ffffff, #f0f8ff)',
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden'
        }
      }}
    >
      <Box padding={3} width={400} position='relative'>
        <Box
          className='closeIcon icon-position d-flex close-icon-index'
          onClick={handleClose}
        >
          <CustomIconButton category='CloseValue' />
        </Box>
        <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
          {transRow ? 'Update Transfer' : 'Add Transfer'}
        </Typography>

        <Box
          sx={{
            height: external ? '400px' : '100%',
            overflowY: 'scroll',
            scrollbarWidth: 'none'
          }}
          component={'form'}
          onSubmit={handleSubmit(onSubmit)}
        >
          <CustomRadioButton
            name='vehicle'
            control={control}
            radiobutton1='Internal Vehicle'
            radiobutton2='External Vehicle'
            value1='internal'
            value2='external'
            value={external ? 'external' : 'internal'}
            onChangeCallback={(e: any) => {
              setValue('vehicle', e.target.value);
              clearErrors();
              if (e.target.value === 'internal') {
                setExternal(false);
                setValue('vehicleNumber', '');
              } else {
                setExternal(true);
                setValue('vehicleNumber', '');
                setValue('driverName', '');
                setValue('passengerCount', '');
                setValue('driverNumber', '');
              }
            }}
          />
          {!external ? (
            <>
              <CustomSelect
                id='vehicleNumber'
                control={control}
                name='vehicleNumber'
                label=' Vehicle Number'
                placeholder='Select vehicle number'
                options={vehicleList}
                loading={vehicleLoading}
                // onChanges={(e: any, value: any) => {
                //   if (value) setIsVehicle(false);

                //   // dispatch(getMainHotelsList())
                // }}
              />
              <CustomSelect
                id='hotel'
                control={control}
                name='hotel'
                label='Transfer To'
                isDisabled={Boolean(transRow)}
                placeholder='Select Transfer To'
                options={hotelLocationList}
                // loading={dropdownLoading}
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
                    id='driverName'
                    control={control}
                    name='driverName'
                    label='Driver Name'
                    placeholder='Enter driver name'
                    onChangeCallback={e => {
                      setValue('driverName', e);
                    }}
                  />
                </Box>
                <Box sx={{ marginBottom: '10px' }}>
                  <CustomTextField
                    id='count'
                    control={control}
                    type='number'
                    name='passengerCount'
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
                    // defaultValue={selectedTripRow?.driverNumber || '+65'}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <PhoneNoTextField
                        {...field}
                        error={Boolean(errors?.driverNumber?.message)}
                        helperText={errors?.driverNumber?.message}
                        setValue={setValue}
                        country={'sg'}
                        style='share'
                        label='Contact Number'
                      />
                    )}
                  />
                  <Box sx={{ marginBottom: '10px' }}>
                    <CustomSelect
                      id='hotel'
                      control={control}
                      name='hotel'
                      label='Transfer To'
                      placeholder='Select Transfer To'
                      options={hotelLocationList}
                      isDisabled={Boolean(transRow)}
                      // loading={dropdownLoading}
                    />
                  </Box>
                  {/* {errors.driverNumber && ( */}
                  <Typography
                    sx={{
                      color: '#d32f2f',
                      display: 'flex',
                      justifyContent: 'flex-start',
                      fontSize: '12px',
                      fontWeight: 300
                    }}
                  >
                    {/* {(errors as any).driverNumber.message} */}
                  </Typography>
                  {/* )} */}
                </Box>
              </Box>
            </>
          )}
          <Box mt={3} sx={{ textAlign: 'right' }}>
            <CustomButton
              category='Cancel'
              className='cancel'
              sx={{ marginRight: '10px' }}
              onClick={() => handleClose()}
            />
            <CustomButton
              category={transRow ? 'Update' : 'Add '}
              className='saveChanges'
              type='submit'
              loading={updateLoading}
            />
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

export default AddExternalVehicle;
