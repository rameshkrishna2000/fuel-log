import React, { useEffect, useState } from 'react';
import { Box, Drawer, Typography } from '@mui/material';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import CustomTextField from '../../../../../../common/components/customized/customtextfield/CustomTextField';
import CustomMultiSelect from '../../../../../../common/components/customized/custommultiselect/CustomMultiSelect';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';
import './AddVehicleConfiguration.scss';
import { useAbort } from '../../../../../../utils/commonFunctions';
import { vechileConfigureUpdateAction } from '../../../../redux/reducer/autoPlannerSlices/autoplannerConfigurationSlice';
import { getValueToPositionMapper, useItemHighlighted } from '@mui/x-charts';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedRow: any;
  pageDetails: any;
}

const AddVehicleConfiguration = ({ open, setOpen, selectedRow, pageDetails }: Props) => {
  const [seatCapacity, setSeatCapacity] = useState<number>(50);

  const dispatch = useAppDispatch();
  const createAbort = useAbort();
  const updateRoute = useAppSelector(state => state.updateVechile);

  // schema for form validation
  const schema = yup.object().shape({
    vehicleNo: yup.string().required('Select vehicle no.'),
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
    absoluteSeating: yup.string().notRequired(),
    seating: yup
      .string()
      .required('Enter preferred seating')
      .test(
        'is-max-value',
        `Maximum preferred seating is ${selectedRow?.absoluteSeating}`,
        (value: any) => {
          return value <= selectedRow?.absoluteSeating;
        }
      )
      .test('is-min-value', 'Minimum preferred seating is 0', (value: any) => {
        return value >= 0;
      })
  });

  // form state
  const {
    control,
    setValue,
    handleSubmit,
    reset,
    getValues,
    trigger,
    resetField,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      vehicleNo: '',
      tripMode: []
    }
  });

  const mode = [
    { id: 'PVT', label: 'PVT' },
    { id: 'SIC', label: 'SIC' },
    { id: 'TSIC', label: 'TSIC' },
    { id: 'GRP', label: 'GRP' },
    { id: 'TRANSFER', label: 'TRANSFER' }
  ];

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const onSubmit = async (params: any) => {
    const tripModes = params?.tripMode?.map((mode: any) => mode.id);
    const payload = {
      vehicleNumber: params?.vehicleNo.toLowerCase(),
      tripModes: tripModes,
      seatingPercentage: seatCapacity,
      absoluteSeating: selectedRow?.absoluteSeating,
      preferredSeating: params?.seating
    };
    if (selectedRow?.id) {
      const payloads = {
        ...payload,
        id: selectedRow?.routeID
      };
      const updateParams = {
        payload: payloads,
        pageDetails: pageDetails
      };
      const action = await dispatch(vechileConfigureUpdateAction(updateParams));
      if (action.type === vechileConfigureUpdateAction.fulfilled.type) {
        handleClose();
      }
    }
  };

  useEffect(() => {
    if (selectedRow?.id) {
      setValue('vehicleNo', selectedRow?.vehicleNumber);
      const seatingPercentage = Math.round(
        (selectedRow?.preferredSeating / selectedRow?.absoluteSeating) * 100
      );
      const tripModes = selectedRow?.tripModes?.map((mode: string) => ({
        id: mode,
        label: mode
      }));
      setValue('tripMode', tripModes);
      trigger('tripMode');
      setValue('absoluteSeating', selectedRow?.absoluteSeating);
      setValue('seating', selectedRow?.preferredSeating);
      setSeatCapacity(seatingPercentage);
    }
  }, [selectedRow, open]);

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleClose}
      className='vehicle-configure'
      sx={{ zIndex: 1 }}
    >
      <Typography sx={{ fontWeight: 700 }}>Update Vehicle Configuration</Typography>
      <Box
        sx={{ marginTop: '20px' }}
        component={'form'}
        onSubmit={handleSubmit(onSubmit)}
      >
        <CustomTextField
          id='vehicle-No'
          control={control}
          name='vehicleNo'
          label='Vehicle No.'
          placeholder='Vehicle No.'
          disabled={true}
        />
        <CustomMultiSelect
          id='trip-mode'
          options={mode}
          control={control}
          name='tripMode'
          label='Tour Mode'
          initialValue={getValues('tripMode').map((item: any) => item.id)}
          placeholder='Tour mode'
          setValue={setValue}
          width='73%'
          onChanges={(e: any, newValue: any) => {
            if (newValue?.length === 0) {
              resetField('tripMode');
            }
          }}
        />
        <CustomTextField
          id='absoluteSeating'
          control={control}
          type={'number'}
          name='absoluteSeating'
          label='Absolute Seating'
          placeholder='Absolute seat'
          disabled={true}
          isOptional={true}
        />
        <CustomTextField
          id='seating'
          control={control}
          type={'number'}
          name='seating'
          label='Preferred Seating'
          placeholder='Preferred seating'
          onChangeCallback={(e: any) => {
            const value = Number(e);
            if (isNaN(value) || value < 0 || e === '') {
              setSeatCapacity(0);
            } else {
              setSeatCapacity(Math.round((value / selectedRow?.absoluteSeating) * 100));
            }
          }}
        />
        <Box
          sx={{
            marginTop: '10px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '15px'
          }}
        >
          <CustomButton className='cancel' category='Cancel' onClick={handleClose} />
          <CustomButton
            className='saveChanges'
            type='submit'
            category='Save'
            loading={updateRoute.isLoading}
          />
        </Box>
      </Box>
    </Drawer>
  );
};

export default AddVehicleConfiguration;
