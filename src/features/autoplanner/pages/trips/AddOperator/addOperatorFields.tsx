import { Box, Button, ButtonGroup } from '@mui/material';
import React from 'react';
import CustomTextField from '../../../../../common/components/customized/customtextfield/CustomTextField';
import CustomSelect from '../../../../../common/components/customized/customselect/CustomSelect';
import { Controller } from 'react-hook-form';
import PhoneNoTextField from '../../../../../common/components/customized/customtextfield/PhoneNoTextField';
import { Icon } from '@iconify/react';
import { isValidField } from '../../../../../utils/commonFunctions';

const AddOperatorFields = ({
  APagent,
  selected,
  isOperatorAdmin,
  setRole,
  role,
  control,
  isAddingAgent,
  RolesDropdown,
  setValue,
  handleFilterChange,
  trigger,
  errors,
  validationFields,
  validationField
}: any) => {
  return (
    <Box>
      {!APagent && !selected && !isOperatorAdmin ? (
        <Box className='role-layout'>
          <ButtonGroup variant='outlined' aria-label='Basic button group'>
            <Button
              onClick={() => {
                setRole('operation admin');
              }}
              className={
                role !== 'operation user' ? 'layout-active layout-btn' : 'layout-btn'
              }
            >
              Operation Admin
            </Button>
            <Button
              onClick={() => {
                setRole('operation user');
              }}
              className={
                role === 'operation user' ? 'layout-active layout-btn' : 'layout-btn'
              }
            >
              Operation User
            </Button>
          </ButtonGroup>
        </Box>
      ) : (
        ''
      )}

      <CustomTextField
        control={control}
        name='contactperson'
        placeholder='Contact person name'
        id='contactperson'
        label='Contact Person Name'
        maxlength={50}
        disabled={isAddingAgent ? false : true}
        defaultValue={selected?.displayName || ''}
      />
      {role === 'operation user' && (
        <CustomSelect
          control={control}
          options={RolesDropdown}
          name='roles'
          placeholder='Select the role'
          id='roles'
          label='Role'
        />
      )}
      {/*
            {role === 'operation user' && !isOperatorAdmin && (
              <CustomSelect
                control={control}
                options={OperatorAdim}
                name='parentRole'
                placeholder='Select the parent role'
                id='parentRole'
                label='Parent Role'
              />
            )} */}
      <Controller
        name='phone'
        control={control}
        defaultValue={selected?.mobileNumber || '+65'}
        rules={{ required: true }}
        render={({ field }) => (
          <PhoneNoTextField
            {...field}
            setValue={setValue}
            style='share'
            country='sg'
            label='Contact Number'
            onChange={(e: any) => {
              const isValid = isValidField('contactnumber', e);
              if (e && isValid) {
                handleFilterChange(e, 'mobileNumber');
              }
              trigger('phone');
            }}
            error={Boolean((errors as any)?.phone?.message)}
            helperText={(errors as any)?.phone?.message}
          />
        )}
      />
      {/* {errors.phone && (
              <Typography
                sx={{
                  color: '#d32f2f',
                  display: 'flex',
                  justifyContent: 'flex-start',
                  fontSize: '12px',
                  marginTop: '-5px',
                  fontWeight: 300,
                  marginBottom: '5px'
                }}
              >
                {errors.phone.message}
              </Typography>
            )} */}
      <CustomTextField
        control={control}
        name='email'
        placeholder='Email address'
        id='email'
        label='Email address'
        maxlength={50}
        defaultValue={selected?.email || ''}
        onChangeCallback={(e: any) => {
          const valid = isValidField('email', e);
          if (e && valid) {
            handleFilterChange(e, 'email');
          }
          trigger('email');
        }}
      />
      <CustomTextField
        control={control}
        name='agentname'
        placeholder='Username'
        id='agentname'
        loading={validationFields?.userName?.status && validationField === 'userName'}
        label='Username'
        maxlength={30}
        disabled={isAddingAgent ? false : true}
        defaultValue={selected?.name || ''}
        onChangeCallback={(e: any) => {
          const valid = isValidField('username', e);
          if (e && valid) {
            handleFilterChange(e, 'userName');
          }
          if (e.length > 1) {
            trigger('agentname');
          }
        }}
      />
      {!selected && (
        <>
          <CustomTextField
            label='Password'
            id='password'
            type='password'
            placeholder='Password'
            control={control}
            name='password'
            maxlength={16}
            icon={
              <Icon
                icon='teenyicons:lock-outline'
                width='15'
                height='15'
                style={{ color: 'black' }}
              />
            }
          />
          <CustomTextField
            label='Confirm Password'
            id='confirmPassword'
            type='password'
            maxlength={16}
            placeholder='Confirm Password'
            control={control}
            name='confirmPassword'
            icon={
              <Icon
                icon='teenyicons:lock-outline'
                width='15'
                height='15'
                style={{ color: 'black' }}
              />
            }
          />
        </>
      )}
    </Box>
  );
};

export default AddOperatorFields;
