import dayjs from 'dayjs';
import { Icon } from '@iconify/react';
import { Box, Dialog, DialogContent, Grid, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppSelector } from '../../../../../app/redux/hooks';
import { useDynamicYupSchema } from '../../../../hooks/useDynamicSchema';
import CustomTextField from '../../../../components/customized/customtextfield/CustomTextField';
import CustomDateCalendar from '../../../../components/customized/customcalendar/CustomCalendar';
import CustomButton from '../../../../components/buttons/CustomButton';
import PhoneNoTextField from '../../../../components/customized/customtextfield/PhoneNoTextField';
import {
  getMyProfileAction,
  putMyProfileAction
} from '../../../../redux/reducer/commonSlices/myProfileSlice';
import './UserProfile.scss';
import { useStateUserProfileHooks, useUserProfileHooks } from './hooks/userProfilesHooks';
import { UserProfileData } from './componentDatas/userProfilesData';
import LoginRedirect from '../../../../components/loginredirect/LoginRedirect';

const UserProfile = () => {
  const myProfileData = useAppSelector(state => state.myProfile.data);
  const isLoading = useAppSelector(state => state.myProfile.isLoading);

  const urls = {
    updateProfile: putMyProfileAction,
    getProfile: getMyProfileAction
  };

  const {
    profileDetails,
    setProfileDetails,
    editProfile,
    setEditProfile,
    currentTimeStamp,
    setCurrentTimeStamp,
    dobTimestamp,
    setDobTimestamp,
    epocvalue,
    formatDOB,
    setOpen,
    isOpen
  } = useStateUserProfileHooks();

  const { createFormFields } = useDynamicYupSchema(null);
  const { schema } = createFormFields(
    UserProfileData(profileDetails, dobTimestamp, currentTimeStamp, isOpen)
  );

  const {
    control,
    setValue,
    handleSubmit,
    clearErrors,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const { handleDOBChange, onSubmit } = useUserProfileHooks({
    setProfileDetails,
    editProfile,
    setEditProfile,
    formatDOB,
    setValue,
    clearErrors,
    setCurrentTimeStamp,
    setDobTimestamp,
    myProfileData,
    profileDetails,
    urls,
    setOpen
  });

  return (
    <>
      <Box
        className='animate__animated animate__slideInRight animate__fast userprofile-box'
        sx={{ height: '67vh', overflowY: 'auto' }}
      >
        {editProfile ? (
          <Box component='form' onSubmit={handleSubmit(onSubmit)}>
            <Grid
              container
              spacing={2}
              sx={{ px: { xs: 2, sm: 4 }, py: 2 }}
              className='animate__animated animate__slideInRight'
            >
              {UserProfileData(null, null, null)?.map(items => (
                <Grid item xs={12} md={items.id === '5' ? 12 : 6} key={items.id}>
                  {items.id === '3' ? (
                    <CustomDateCalendar
                      id={items.id}
                      name={items.name}
                      control={control}
                      minDate={dayjs('1950-01-01')}
                      maxDate={dayjs()}
                      type='user-profile'
                      className='calendar'
                      placeholder={items.placeholder}
                      label={items.label}
                      value={epocvalue ? epocvalue * 1000 : null}
                      onDateChange={(date: any) => {
                        handleDOBChange(date);
                      }}
                      isOptional={true}
                    />
                  ) : items.id === '4' ? (
                    <Controller
                      name={items.name}
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <PhoneNoTextField
                          {...field}
                          setValue={setValue}
                          style='share'
                          error={errors?.mobileNumber?.message ? true : false}
                          label={items?.label}
                          helperText={errors?.mobileNumber?.message}
                        />
                      )}
                    />
                  ) : (
                    items.id !== '6' && (
                      <CustomTextField
                        id={items.id}
                        label={items.label}
                        placeholder={items.placeholder}
                        defaultValue={items.defaultValue}
                        control={control}
                        name={items.name}
                        inputProps={{
                          ...items.inputProps,
                          readOnly: items.id === '1' || items.id === '5'
                        }}
                        icon={
                          items.id === '5' && (
                            <Icon width='25' height='25' icon='mdi:timezone-outline' />
                          )
                        }
                      />
                    )
                  )}
                </Grid>
              ))}
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: { xs: 'center', md: 'flex-end' },
                    mt: 2,
                    gap: 2
                  }}
                >
                  <CustomButton
                    category='Cancel'
                    className='cancel'
                    variant='outlined'
                    onClick={() => {
                      setEditProfile(false);
                      reset();
                    }}
                  />
                  <CustomButton
                    category='Save'
                    className='saveChanges'
                    variant='contained'
                    loading={!isOpen && isLoading}
                    type='submit'
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Grid
            container
            spacing={2}
            sx={{ px: { xs: 2, sm: 4 }, py: 2 }}
            className='userprofile-container'
          >
            {/* Username */}
            <Grid item xs={12} md={6}>
              <Box display='flex' alignItems='center' gap={1.5}>
                <Icon
                  className='profileIcon'
                  width='25'
                  height='25'
                  icon='iconamoon:profile-light'
                />
                <Typography className='userprofile-title'>
                  {profileDetails?.userName ?? 'loading....'}
                </Typography>
              </Box>
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
              <Box display='flex' alignItems='center' gap={1.5}>
                <Icon
                  className='profileIcon'
                  width='25'
                  height='25'
                  icon='material-symbols:mail-outline'
                />
                <Typography className='userprofile-title'>
                  {profileDetails?.email ?? 'loading....'}
                </Typography>
              </Box>
            </Grid>

            {/* DOB */}
            <Grid item xs={12} md={6}>
              <Box display='flex' alignItems='center' gap={1.5}>
                <Icon
                  className='profileIcon'
                  width='25'
                  height='25'
                  icon='mingcute:birthday-2-line'
                />
                <Typography className='options'>
                  {profileDetails?.dateOfBirth
                    ? dayjs(profileDetails?.dateOfBirth).format('DD/MM/YYYY')
                    : 'NA'}
                </Typography>
              </Box>
            </Grid>

            {/* Phone */}
            <Grid item xs={12} md={6}>
              <Box display='flex' alignItems='center' gap={1.5}>
                <Icon
                  className='profileIcon'
                  width='25'
                  height='25'
                  icon='solar:phone-linear'
                />
                <Typography className='userprofile-title'>
                  {profileDetails?.mobileNumber ?? 'loading....'}
                </Typography>
              </Box>
            </Grid>

            {/* Timezone */}
            <Grid item xs={12} md={6}>
              <Box display='flex' alignItems='center' gap={1.5}>
                <Icon
                  className='profileIcon'
                  width='25'
                  height='25'
                  icon='mdi:timezone-outline'
                />
                <Typography className='userprofile-title'>
                  {profileDetails?.timezone}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              {!editProfile && (
                <Box
                  display='flex'
                  justifyContent={{ xs: 'center', md: 'flex-start' }}
                  mt={1}
                >
                  <CustomButton
                    category='Edit Profile'
                    className='light-edit'
                    onClick={() => setEditProfile(true)}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        )}

        {isOpen && (
          <Dialog className='userprofile-dialog' open={isOpen}>
            <DialogContent className='profile-con'>
              <Box component='form' onSubmit={handleSubmit(onSubmit)}>
                <Box className='userprofile-content'>
                  <Box className='userprofile-header'>Verify Password</Box>
                  <Icon
                    tabIndex={0}
                    icon='mingcute:close-circle-fill'
                    width='30'
                    height='30'
                    className='profile-close'
                    onClick={() => {
                      setOpen(false);
                      setValue('password', '');
                    }}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setOpen(false);
                        setValue('password', '');
                      }
                    }}
                  />
                </Box>

                <Grid container spacing={2} px={2} className='confirmpassword'>
                  <Grid item xs={12}>
                    <CustomTextField
                      label='Password'
                      id='password'
                      type='password'
                      placeholder='Password'
                      autoComplete='new-password'
                      control={control}
                      name='password'
                    />
                  </Grid>
                </Grid>

                <Box
                  className='profile-btn-bottom'
                  display='flex'
                  justifyContent='flex-end'
                  gap={2}
                  mt={2}
                >
                  <CustomButton
                    className='cancel'
                    category='Cancel'
                    onClick={() => {
                      setOpen(false);
                      setValue('password', '');
                    }}
                  />
                  <CustomButton
                    className='saveChanges'
                    type='submit'
                    category='Submit'
                    loading={isLoading}
                  />
                </Box>
              </Box>
            </DialogContent>
          </Dialog>
        )}
      </Box>
      <LoginRedirect />
    </>
  );
};

export default UserProfile;
