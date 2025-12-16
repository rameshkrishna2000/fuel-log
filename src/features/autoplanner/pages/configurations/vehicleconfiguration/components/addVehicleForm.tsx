import { Box, Slider, Typography } from '@mui/material';
import CustomTextField from '../../../../../../common/components/customized/customtextfield/CustomTextField';
import CustomRadioButton from '../../../../../../common/components/customized/customradiobutton/CustomRadioButton';
import CustomSelect from '../../../../../../common/components/customized/customselect/CustomSelect';
import { vehicleModelDropdownAction } from './vehicleOnboard';
import CustomMultiSelect from '../../../../../../common/components/customized/custommultiselect/CustomMultiSelect';
import { Controller } from 'react-hook-form';

const AddVehicleForm = ({
  control,
  vehicleType,
  vehicleModel,
  setVehicleModel,
  selectedRow,
  dispatch,
  errors,
  mode,
  setValue,
  handleNonFreewaySpeedChange,
  handleFreewaySpeedChange,
  freewaySpeedLimit,
  nonFreewaySpeedLimit,
  istracking,
  setistracking,
  subtype,
  vehiModel,
  yearDrop,
  dropdownMake,
  simNumber,
  planIdDropdown,
  imeiNumber,
  vehicleMake,
  setVehicleMake,
  setAbsoluteSeating,
  absoluteSeating,
  setSeatCapacity,
  seatCapacity,
  getValues,
  resetField,
  trigger
}: any) => {
  return (
    <Box>
      <CustomTextField
        control={control}
        name='vehicleNumber'
        placeholder='Vehicle number'
        id='vehicleNumber'
        label='Vehicle Number'
        disabled={selectedRow}
        maxlength={20}
      />
      {/* 
      <>
        <CustomRadioButton
          name='istracking'
          control={control}
          formlabel='Is Tracking Enabled?'
          radiobutton1='No'
          radiobutton2='Yes'
          // value={getValues('istracking')}
          value1='notIstracking'
          value2='istracking'
          value={istracking}
          onChangeCallback={e => {
            setistracking(e?.target?.value);
            setValue('istracking', e?.target?.value);
          }}
        />
      </> */}

      {/* {istracking === 'istracking' ? (
        <>
          <CustomSelect
            id='imeiNumber'
            control={control}
            name='imeiNumber'
            label='IMEI Number'
            placeholder='Select IMEI Number'
            options={imeiNumber}
          />

          <CustomSelect
            id='simNumber'
            control={control}
            name='simNumber'
            label='SIM Number'
            placeholder='Select SIM Number'
            options={simNumber}
          />

          <CustomSelect
            id='planId'
            control={control}
            name='planId'
            label='Plan Id'
            placeholder='Select Plan Id'
            options={planIdDropdown}
          />

          <CustomSelect
            id='vehicleMake'
            control={control}
            name='vehicleMake'
            label='Vehicle Make'
            placeholder='Select Vehicle Make'
            options={dropdownMake}
            onChanges={(e: any, newValue: any) => {
              setVehicleMake(newValue.label);
              const payload = {
                vehicleMake: newValue.label
              };
              dispatch(vehicleModelDropdownAction(payload));
            }}
          />

          <CustomSelect
            id='vehicleModel'
            control={control}
            name='vehicleModel'
            label='Vehicle Model'
            placeholder='Select Vehicle Model'
            options={vehiModel}
            onChanges={(e: any, newValue: any) => {
              setVehicleModel(newValue.label);
              const payload = {
                vehicleMake: vehicleMake,
                vehicleModel: newValue.label
              };
              dispatch(vehicleModelDropdownAction(payload));
            }}
          />

          <CustomSelect
            id='manufacturedYear'
            control={control}
            isOptional={true}
            name='manufacturedYear'
            label='Manufactured Year'
            placeholder='Select Manufactured Year'
            options={yearDrop}
            onChanges={(e: any, newValue: any) => {
              const payload = {
                vehicleMake: vehicleMake,
                vehicleModel: vehicleModel,
                manufacturedyear: newValue.label
              };
              dispatch(vehicleModelDropdownAction(payload));
            }}
          />
          <CustomSelect
            id='subType'
            control={control}
            name='subType'
            label='Sub Type'
            placeholder='Select Sub Type'
            options={subtype}
          />

          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              border: '1px solid #dee2e6',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <Typography
              variant='subtitle2'
              sx={{
                fontWeight: 600,
                color: '#495057',
                fontSize: '13px',
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              🛣️ Freeway Speed Configuration
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 2 }}>
              <Box sx={{ minWidth: 100 }}>
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#6c757d',
                    mb: 0.5
                  }}
                >
                  Freeway Limit
                </Typography>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    borderRadius: '8px',
                    px: 1.5,
                    py: 0.3,
                    display: 'inline-block'
                  }}
                >
                  <Typography
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  >
                    {freewaySpeedLimit} km/h
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Slider
                  value={freewaySpeedLimit}
                  onChange={(_, newValue) => handleFreewaySpeedChange(newValue as number)}
                  min={60}
                  max={150}
                  step={5}
                  size='small'
                  sx={{
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(90deg, #28a745 0%, #20c997 100%)',
                      border: 'none'
                    },
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#28a745',
                      width: 16,
                      height: 16,
                      '&:hover': {
                        boxShadow: '0 0 0 8px rgba(40, 167, 69, 0.16)'
                      }
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography sx={{ fontSize: '9px', color: '#adb5bd' }}>60</Typography>
                  <Typography sx={{ fontSize: '9px', color: '#adb5bd' }}>150</Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ minWidth: 100 }}>
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#6c757d',
                    mb: 0.5
                  }}
                >
                  Non-Freeway
                </Typography>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
                    borderRadius: '8px',
                    px: 1.5,
                    py: 0.3,
                    display: 'inline-block'
                  }}
                >
                  <Typography
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  >
                    {nonFreewaySpeedLimit} km/h
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Slider
                  value={nonFreewaySpeedLimit}
                  onChange={(_, newValue) =>
                    handleNonFreewaySpeedChange(newValue as number)
                  }
                  min={30}
                  max={100}
                  step={5}
                  size='small'
                  sx={{
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(90deg, #ffc107 0%, #fd7e14 100%)',
                      border: 'none'
                    },
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#ffc107',
                      width: 16,
                      height: 16,
                      '&:hover': {
                        boxShadow: '0 0 0 8px rgba(255, 193, 7, 0.16)'
                      }
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography sx={{ fontSize: '9px', color: '#adb5bd' }}>30</Typography>
                  <Typography sx={{ fontSize: '9px', color: '#adb5bd' }}>100</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </>
      ) : (
        ''
      )} */}

      <CustomSelect
        id='vehicle-type'
        control={control}
        name='vehicleType'
        label='Vehicle Type'
        placeholder='Select vehicle type'
        options={vehicleType}
      />

      <Box
        sx={{
          mb: 2,
          p: 1.5,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          border: '1px solid #dee2e6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <Typography
          variant='subtitle2'
          sx={{
            fontWeight: 600,
            color: '#495057',
            fontSize: '13px',
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          🚗 Speed Configuration
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ minWidth: 100 }}>
            <Typography
              sx={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#6c757d',
                mb: 0.5
              }}
            >
              Avg Speed
            </Typography>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #fd7e14 0%, #e17055 100%)',
                borderRadius: '8px',
                px: 1.5,
                py: 0.3,
                display: 'inline-block'
              }}
            >
              <Typography
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                {getValues('averageSpeed')} km/h
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Controller
              name='averageSpeed'
              control={control}
              render={({ field }) => (
                <Slider
                  value={getValues('averageSpeed')}
                  onChange={(_, newValue) => {
                    setValue('averageSpeed', newValue as number);
                    trigger('averageSpeed');
                  }}
                  min={10}
                  max={150}
                  step={5}
                  size='small'
                  sx={{
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(90deg, #fd7e14 0%, #e17055 100%)',
                      border: 'none'
                    },
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#fd7e14',
                      width: 16,
                      height: 16,
                      '&:hover': {
                        boxShadow: '0 0 0 8px rgba(253, 126, 20, 0.16)'
                      }
                    }
                  }}
                />
              )}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography sx={{ fontSize: '9px', color: '#adb5bd' }}>10</Typography>
              <Typography sx={{ fontSize: '9px', color: '#adb5bd' }}>150</Typography>
            </Box>
          </Box>
        </Box>

        {errors.averageSpeed && (
          <Typography
            sx={{
              color: '#dc3545',
              fontSize: '11px',
              mt: 1,
              fontWeight: 500
            }}
          >
            {errors.averageSpeed.message}
          </Typography>
        )}
      </Box>

      <CustomTextField
        id='absoluteSeating'
        control={control}
        type='number'
        name='absoluteSeating'
        label='Absolute Seating'
        placeholder='Absolute seating'
        onChangeCallback={(e: any) => {
          setAbsoluteSeating(e);
        }}
      />

      <CustomTextField
        id='seating'
        control={control}
        type='number'
        name='seating'
        label='Preferred Seating'
        placeholder='Preferred seating'
        onChangeCallback={(e: any) => {
          const value = Number(e);
          if (isNaN(value) || value < 0 || e === '') {
            setSeatCapacity(0);
          } else {
            setSeatCapacity(Math.round((value / absoluteSeating) * 100));
          }
        }}
      />

      <CustomMultiSelect
        id='trip-mode'
        options={mode}
        control={control}
        name='tripMode'
        label='Tour Mode'
        initialValue={getValues('tripMode')?.map((item: any) => item.id)}
        placeholder='Tour mode'
        setValue={setValue}
        width='73%'
        onChanges={(e: any, newValue: any) => {
          if (newValue?.length === 0) {
            resetField('tripMode');
          }
          trigger('tripMode');
        }}
      />
    </Box>
  );
};

export default AddVehicleForm;
