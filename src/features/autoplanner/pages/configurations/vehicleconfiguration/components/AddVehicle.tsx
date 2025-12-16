import { Box, Drawer, Typography, Slider } from '@mui/material';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { vehicleOnboardAction, vehicleUpdateAction } from './vehicleOnboard';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import { autoGetVechicleAction } from '../../../../redux/reducer/autoPlannerSlices/autoplannerConfigurationSlice';
import {
  useCommanVehicleAddHook,
  useDropdownOptions,
  useRenderHook,
  useSetvalue,
  useSliderFunctions
} from './addVehicleHook';
import AddVehicleForm from './addVehicleForm';

interface AddVehicleProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedRow?: any;
  payloads: any;
}

const AddVehicle = ({
  setOpen,
  open,
  selectedRow,
  payloads
}: AddVehicleProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const IMEI = useAppSelector(state => state.dropdownIMEI.data || []);
  const AddVehi = useAppSelector(state => state.onboardVehicle.isLoading);
  const vehiUpdateLoading = useAppSelector(state => state.updateVehi.isLoading);
  const planID = useAppSelector(state => state.dropdownPlanID.data || []);
  const SIM = useAppSelector(state => state.dropdownSIM.data || []);
  const VehicleMakeApi = useAppSelector(state => state.dropdownVehicleMake?.data || []);
  const model = useAppSelector(state => state.dropdownVehicleModel?.data || []);

  const {
    istracking,
    setistracking,
    vehicleMake,
    setVehicleMake,
    setAbsoluteSeating,
    absoluteSeating,
    setSeatCapacity,
    seatCapacity,
    vehicleModel,
    setVehicleModel
  } = useCommanVehicleAddHook();

  const validationSchema = yup.object().shape({
    vehicleNumber: yup
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
      ),

    istracking: yup.string().optional(),

    imeiNumber: yup.string().when('istracking', {
      is: 'istracking',
      then: schema => schema.required('Select IMEI number'),
      otherwise: schema => schema.notRequired()
    }),

    simNumber: yup.string().when('istracking', {
      is: 'istracking',
      then: schema =>
        schema
          .required('Select SIM number')
          .matches(/^\d{10,20}$/, 'SIM number must be between 10-20 digits'),
      otherwise: schema => schema.notRequired()
    }),

    freewaySpeedLimit: yup.number().when('istracking', {
      is: 'istracking',
      then: schema =>
        schema
          .min(60, 'Freeway speed limit must be at least 60 km/h')
          .max(150, 'Freeway speed limit cannot exceed 150 km/h')
          .required('Freeway speed limit is required'),
      otherwise: schema => schema.notRequired()
    }),

    nonFreewaySpeedLimit: yup.number().when('istracking', {
      is: 'istracking',
      then: schema =>
        schema
          .min(30, 'Non-freeway speed limit must be at least 30 km/h')
          .max(100, 'Non-freeway speed limit cannot exceed 100 km/h')
          .required('Non-freeway speed limit is required'),
      otherwise: schema => schema.notRequired()
    }),
    planId: yup.string().when('istracking', {
      is: 'istracking',
      then: schema => schema.required('Select plan ID'),
      otherwise: schema => schema.notRequired()
    }),

    vehicleMake: yup.string().when('istracking', {
      is: 'istracking',
      then: schema => schema.required('Select vehicle make'),
      otherwise: schema => schema.notRequired()
    }),

    vehicleModel: yup.string().when('istracking', {
      is: 'istracking',
      then: schema => schema.required('Select vehicle model'),
      otherwise: schema => schema.notRequired()
    }),
    manufacturedYear: yup.string().notRequired(),

    subType: yup.string().when('istracking', {
      is: 'istracking',
      then: schema => schema.required('Select sub type'),
      otherwise: schema => schema.notRequired()
    }),

    tripMode: yup
      .array()
      .of(
        yup.object().shape({
          id: yup.string().required(),
          label: yup.string().required()
        })
      )
      .min(1, 'Select atleast one tour mode')
      .required('Select tour mode'),
    vehicleType: yup.string().required('Select vehicle type'),
    averageSpeed: yup
      .number()
      .min(10, 'Minimum average speed is 10 km/h')
      .max(150, 'Maximum average speed is 150 km/h')
      .required('Average speed is required')
      .typeError('Enter valid averageSpeed')
      .test(
        'less-than-overspeed',
        'Average speed must be less than overspeed limit',
        function (value) {
          const { overspeedLimit } = this.parent;
          return !value || !overspeedLimit || value < overspeedLimit;
        }
      ),
    absoluteSeating: yup
      .number()
      .required('Enter absolute seating')
      .min(1, 'Minimum absolute seating is 1')
      .max(249, 'Maximum absolute seating is 249')
      .transform((value, originalValue) => {
        return originalValue === '' ? undefined : value;
      })
      .typeError('Enter valid absolute seating'),
    seating: yup
      .number()
      .transform((value, originalValue) => {
        return originalValue === '' ? undefined : value;
      })
      .required('Enter preferred seating')
      .min(1, 'Minimum preferred seating is 1')
      .test(
        'maximum-seats',
        `Maximum preferred seating is ${absoluteSeating ? absoluteSeating : 0}`,
        (value: any) => {
          return absoluteSeating > 0 ? value <= absoluteSeating : true;
        }
      )
  });

  const { vehicleMakeDrop, year, vehicleModelDrop, subtypeDropdown } = useRenderHook({
    selectedRow,
    dispatch,
    VehicleMakeApi,
    model
  });

  const {
    vehicleType,
    mode,
    subtype,
    vehiModel,
    yearDrop,
    dropdownMake,
    simNumber,
    planIdDropdown,
    imeiNumber
  } = useDropdownOptions({
    IMEI,
    planID,
    SIM,
    vehicleMakeDrop,
    year,
    vehicleModelDrop,
    subtypeDropdown
  });

  const {
    control,
    handleSubmit,
    getValues,
    resetField,
    trigger,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      averageSpeed: 60,
      freewaySpeedLimit: 90,
      nonFreewaySpeedLimit: 70
    },
    resolver: yupResolver(validationSchema)
  });

  const {
    handleNonFreewaySpeedChange,
    handleFreewaySpeedChange,
    setNonFreewaySpeedLimit,
    setFreewaySpeedLimit,
    nonFreewaySpeedLimit,
    freewaySpeedLimit
  } = useSliderFunctions({ setValue, trigger });

  const handleClose = () => {
    reset();
    setOpen(false);
    setistracking('notIstracking');
  };

  const onSubmit = async (data: any) => {
    const payload = {
      vehicleType: data.vehicleType,
      vehicleNumber: data.vehicleNumber.toUpperCase(),
      standardSpeedLimit: data.averageSpeed,
      seatingPercentage: seatCapacity,
      overSpeedLimit: null,
      isTracking: istracking === 'istracking' ? true : false,
      absoluteSeating: data.absoluteSeating,
      tracking: {
        ...(istracking === 'istracking' && {
          freeWaySpeedLimit: data.freewaySpeedLimit || null,
          nonFreewaySpeedLimit: data.nonFreewaySpeedLimit || null,
          vehicleCategory: null,
          imeiNumber: data.imeiNumber || null,
          simNumber: data.simNumber || null,
          planId: data.planId || null,
          vehicleMake: data.vehicleMake || null,
          vehicleModel: data.vehicleModel || null,
          manufacturedYear: data.manufacturedYear || null,
          subType: data.subType || null
        })
      },
      preferredSeating: data.seating,
      tripModes: data.tripMode
        .filter((mode: any) => mode.id !== 'selectAll')
        .map((mode: any) => mode.id)
    };

    const addPayload = {
      vehicleType: data.vehicleType,
      vehicleNumber: data.vehicleNumber.toUpperCase(),
      standardSpeedLimit: data.averageSpeed,
      seatingPercentage: seatCapacity,
      overSpeedLimit: null,
      isTracking: istracking === 'istracking' ? true : false,
      absoluteSeating: data.absoluteSeating,
      freeWaySpeedLimit: data.freewaySpeedLimit || null,
      nonFreewaySpeedLimit: data.nonFreewaySpeedLimit || null,
      vehicleCategory: null,
      imeiNumber: data.imeiNumber || null,
      simNumber: data.simNumber || null,
      planId: data.planId || null,
      vehicleMake: data.vehicleMake || null,
      vehicleModel: data.vehicleModel || null,
      manufacturedYear: data.manufacturedYear || null,
      subType: data.subType || null,
      preferredSeating: data.seating,
      tripModes: data.tripMode
        .filter((mode: any) => mode.id !== 'selectAll')
        .map((mode: any) => mode.id)
    };
    if (selectedRow) {
      const actionUpdate = await dispatch(vehicleUpdateAction(payload));
      if (actionUpdate.type === vehicleUpdateAction.fulfilled.type) {
        handleClose();
        dispatch(autoGetVechicleAction(payloads));
      }
    } else {
      const action = await dispatch(vehicleOnboardAction(addPayload));
      if (action.type === vehicleOnboardAction.fulfilled.type) {
        handleClose();
        dispatch(autoGetVechicleAction(payloads));
      }
    }
  };

  useSetvalue({
    setValue,
    selectedRow,
    setistracking,
    trigger,
    setAbsoluteSeating,
    setSeatCapacity,
    setFreewaySpeedLimit,
    setNonFreewaySpeedLimit
  });

  return (
    <Box p={2}>
      <Drawer anchor='right' open={open} onClose={handleClose} sx={{ zIndex: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant='h6' sx={{ fontWeight: 700, mb: 3 }}>
            {selectedRow ? 'Update vehicle' : ' Add Vehicle'}
          </Typography>
          <Box component='form' onSubmit={handleSubmit(onSubmit)}>
            <AddVehicleForm
              control={control}
              dispatch={dispatch}
              vehicleModel={vehicleModel}
              setVehicleModel={setVehicleModel}
              setAbsoluteSeating={setAbsoluteSeating}
              absoluteSeating={absoluteSeating}
              setSeatCapacity={setSeatCapacity}
              seatCapacity={seatCapacity}
              getValues={getValues}
              resetField={resetField}
              trigger={trigger}
              vehicleMake={vehicleMake}
              setVehicleMake={setVehicleMake}
              istracking={istracking}
              subtype={subtype}
              errors={errors}
              mode={mode}
              vehiModel={vehiModel}
              yearDrop={yearDrop}
              dropdownMake={dropdownMake}
              simNumber={simNumber}
              planIdDropdown={planIdDropdown}
              imeiNumber={imeiNumber}
              selectedRow={selectedRow}
              setistracking={setistracking}
              setValue={setValue}
              vehicleType={vehicleType}
              nonFreewaySpeedLimit={nonFreewaySpeedLimit}
              freewaySpeedLimit={freewaySpeedLimit}
              handleNonFreewaySpeedChange={handleNonFreewaySpeedChange}
              handleFreewaySpeedChange={handleFreewaySpeedChange}
            />
            <Box
              sx={{
                marginTop: '5%',
                display: 'flex',
                gap: '15px',
                justifyContent: 'end'
              }}
            >
              <CustomButton className='cancel' category='Cancel' onClick={handleClose} />
              <CustomButton
                className='saveChanges'
                type='submit'
                category='Save'
                loading={vehiUpdateLoading || AddVehi}
              />
            </Box>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default AddVehicle;
