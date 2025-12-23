import { Box } from '@mui/material';
import CustomTextField from '../../../../../../common/components/customized/customtextfield/CustomTextField';
import { Controller } from 'react-hook-form';
import PhoneNoTextField from '../../../../../../common/components/customized/customtextfield/PhoneNoTextField';
import CustomSelect from '../../../../../../common/components/customized/customselect/CustomSelect';
import { Country } from 'country-state-city';
import { Icon } from '@iconify/react';
import { isValidField } from '../../../../../../utils/commonFunctions';
const AddAgentFields = ({
  APagent,
  control,
  isAddingAgent,
  company,
  selected,
  setValue,
  handleFilterChange,
  trigger,
  errors,
  RateCardOption,
  validationFields,
  validationField
}: any) => {
  return (
    <Box>
      <CustomTextField
        control={control}
        name='companyName'
        placeholder='Agent Name'
        id='companyName'
        label='Agent Name'
        maxlength={50}
        disabled={APagent || !isAddingAgent ? true : false}
        defaultValue={selected?.displayName || ''}
      />
      <CustomTextField
        control={control}
        name='contactperson'
        placeholder={'Contact Person Name'}
        id='contactperson'
        label={'Contact Person Name'}
        maxlength={50}
        disabled={isAddingAgent ? false : true}
        defaultValue={selected?.displayName || ''}
      />
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
          const isValid = isValidField('email', e);
          if (e && isValid) {
            handleFilterChange(e, 'email');
          }
          trigger('email');
        }}
      />
      {!APagent && (
        <CustomSelect
          control={control}
          options={RateCardOption}
          isOptional={true}
          name='ratecard'
          placeholder='Rate card'
          id='ratecard'
          label='Rate Card'
        />
      )}
      {!APagent && (
        <>
          <CustomSelect
            control={control}
            options={Country.getAllCountries().map((country: any) => ({
              id: country?.name,
              label: country?.name,
              code: country.isoCode
            }))}
            name='country'
            placeholder='Country'
            id='country'
            label='Country'
            defaultValue={selected?.country || ''}
          />
          <CustomTextField
            control={control}
            name='website'
            placeholder='Website URL'
            id='website'
            isOptional={true}
            label='Website URL'
            maxlength={100}
            defaultValue={selected?.websiteLink || ''}
          />
        </>
      )}
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
          const isValid = isValidField('username', e);
          if (e && isValid) {
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

export default AddAgentFields;
