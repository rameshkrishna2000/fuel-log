import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Grid,
  Link,
  Stack,
  Typography,
  Tab,
  Tabs,
  styled,
  TextField
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import { useAppDispatch, useAppSelector } from '../../../app/redux/hooks';
import { getLogin } from '../../../common/redux/reducer/commonSlices/loginSlice';
import constant from '../../../utils/constants';
import CustomTextField from '../../components/customized/customtextfield/CustomTextField';
import CustomButton from '../../components/buttons/CustomButton';
import Tracking from '../../../app/assets/images/landing/tracking.jpg';
import Tracker from '../../../app/assets/images/landing/tracker.jpg';
import APLogo from '../../../app/assets/images/autoplanner.jpg';
import Drive from '../../../app/assets/images/landing/drive.png';
import { useNavigate } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import LoginVideo from '../../../app/assets/video/loginVideo.mp4';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import './Login.scss';
import {
  useAfterLoginNavigate,
  useCommonStateHandler,
  useDriverOTP,
  useLoginasDriver,
  useLoginFormSubmission,
  useLoginStyle,
  useOTPCounter
} from './hooks/loginHooks';
import { useDynamicYupSchema } from '../../hooks/useDynamicSchema';
import {
  driverContact,
  loginData,
  otpVerificationData
} from './componentsDatas/loginDatas';
import PhoneNoTextField from '../../components/customized/customtextfield/PhoneNoTextField';
import { getOTP, getOTPlogin } from '../../redux/reducer/commonSlices/driverLoginSlice';

export const settings = {
  autoPlay: true,
  infiniteLoop: true,
  showThumbs: false,
  showArrows: false,
  swipeable: true,
  interval: 2000,
  showStatus: false,
  emulateTouch: false,
  centerMode: true,
  centerSlidePercentage: 100,
  stoponHover: true,
  width: '25%'
};

export const images = [
  { key: 'image', source: Drive },
  { key: 'image', source: Tracking },
  { key: 'image', source: Tracker }
];

function Login() {
  const { isLoading } = useAppSelector(state => state.auth);
  const themes = useAppSelector(state => state.theme.theme);
  const diverOTPlogin = useAppSelector(state => state.otpDriverLogin);
  const otpLoader = useAppSelector(state => state.otpLogin);

  // State for login type toggle

  const {
    loginType,
    setLoginType,
    showOtpField,
    setShowOtpField,
    otpSubmit,
    setOtpSubmit,
    mobileNumber,
    setMobileNumber,
    otpSent,
    setOtpSent,
    enableVerifyButton,
    setEnableVerifyButton,
    otp,
    setOtp,
    timer,
    setTimer,
    inputRefs
  } = useCommonStateHandler();

  const { createFormFields } = useDynamicYupSchema(null);

  // User login schema
  const { schema: userSchema } = createFormFields(loginData());

  // OTP schema
  const { schema: otpSchema } = createFormFields(otpVerificationData());

  // User login form
  const {
    handleSubmit: handleUserSubmit,
    control: userControl,
    reset: userReset
  } = useForm({
    resolver: yupResolver(userSchema)
  });

  // Driver login form
  const {
    handleSubmit: handleDriverSubmit,
    control: driverControl,
    reset: resetDriverForm,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: async (data: any, context, options) => {
      const updates = driverContact(data);

      const { schema } = createFormFields(updates);

      return yupResolver(schema)(data, context, options);
    }
  });

  // OTP form
  const {
    handleSubmit,
    setValue: setOtpValue,
    formState
  } = useForm({
    resolver: yupResolver(otpSchema),
    defaultValues: { otp: '' }
  });

  //custom hook to handle driver OTP

  const { handleEnterOTP, onDriverSubmit, onOtpSubmit, handleResend, handleKeyDown } =
    useDriverOTP({
      otp,
      setOtp,
      setOtpValue,
      setEnableVerifyButton,
      inputRefs,
      mobileNumber,
      setOtpSent,
      setTimer,
      setShowOtpField,
      setMobileNumber
    });

  //custom hook to handle login as driver
  const { handleLoginTypeChange, handleBackToMobile } = useLoginasDriver({
    setLoginType,
    setShowOtpField,
    setOtpSent,
    setMobileNumber,
    setOtp,
    setTimer,
    inputRefs,
    userReset,
    resetDriverForm
  });
  const { onSubmit, handleChange, isKeepSignedIn, handleForgetPw, firbaseLoading } =
    useLoginFormSubmission();

  useAfterLoginNavigate();

  const { AntSwitch, SmallDevices } = useLoginStyle(themes);

  // Styled Tabs component
  const StyledTabs = useMemo(() => {
    return styled(Tabs)({
      '& .MuiTabs-indicator': {
        backgroundColor: '#3239ea',
        height: '3px'
      },
      marginBottom: '20px'
    });
  }, [loginType]);

  const StyledTab = styled(Tab)({
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '16px',
    minWidth: '50%',
    '&.Mui-selected': {
      color: '#3239ea'
    }
  });

  useOTPCounter({ setEnableVerifyButton, otpSubmit, timer, setTimer });

  return (
    <Grid container className='grid-container'>
      <Box className='gradient-box'></Box>
      {!SmallDevices && (
        <>
          <Carousel className='my-carousel' {...settings}>
            {images.map((e, index) => {
              return (
                <Grid item className='login-image' key={index}>
                  {e.key === 'video' ? (
                    <video className='login-video' autoPlay loop muted>
                      <source src={LoginVideo} type='video/mp4' />
                      {constant.videoNotSupported}
                    </video>
                  ) : (
                    <img src={e.source} alt='login'></img>
                  )}
                </Grid>
              );
            })}
          </Carousel>
          <Box className='login-content'>
            <Typography className='login-heading-typo'>
              {constant.LoginHeading}
            </Typography>
            <Typography className='login-subhead-typo'>
              {constant.LoginSubHead}
            </Typography>
          </Box>
        </>
      )}
      <Grid
        item
        className='login-grid '
        sx={{
          left: SmallDevices ? '50%' : '70%',
          width: SmallDevices ? '100%' : '70%'
        }}
      >
        <ul className='circles'>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
        <Box className='login-box'>
          <Box className='app-logo' component='img' src={APLogo} />

          <h2 className='login-header'>{constant.Login}</h2>

          {/* Login Type Tabs */}
          <StyledTabs value={loginType} onChange={handleLoginTypeChange} centered>
            <StyledTab
              label='Login as User'
              value='user'
              // icon={<Icon icon='ep:user' width='20' height='20' />}
              iconPosition='start'
            />
            <StyledTab
              label='Login as Driver'
              value='driver'
              // icon={<Icon icon='healthicons:truck-driver' width='20' height='20' />}
              iconPosition='start'
            />
          </StyledTabs>

          {/* User Login Form */}
          {loginType === 'user' && (
            <Box component='form' onSubmit={handleUserSubmit(onSubmit)}>
              <Box>
                <CustomTextField
                  label={constant.UserName}
                  id='username'
                  placeholder='Username'
                  control={userControl}
                  name='userID'
                  icon={
                    <Icon
                      icon='ep:user'
                      width='15'
                      height='15'
                      style={{ color: 'black' }}
                    />
                  }
                  autoComplete='on'
                />
              </Box>
              <Box my={2}></Box>
              <Box>
                <CustomTextField
                  label={constant.Password}
                  id='password'
                  type='password'
                  placeholder='Password'
                  control={userControl}
                  name='password'
                  icon={
                    <Icon
                      icon='teenyicons:lock-outline'
                      width='15'
                      height='15'
                      style={{ color: 'black' }}
                    />
                  }
                  autoComplete='on'
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  marginTop: '15px',
                  justifyContent: 'space-between'
                }}
              >
                <Box className='switch-box'>
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <AntSwitch
                      inputProps={{ 'aria-label': 'ant design' }}
                      className='ant-switch'
                      checked={isKeepSignedIn}
                      onChange={handleChange}
                    />
                  </Stack>
                  <p className='keep-sign'>{constant.KeepSign}</p>
                </Box>
                <Box onClick={handleForgetPw}>
                  <Link
                    underline='none'
                    className='forgot-pw'
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleForgetPw();
                      }
                    }}
                  >
                    {`${constant.ForgotPassword}?`}
                  </Link>
                </Box>
              </Box>
              <Box sx={{ marginTop: '20px', textAlign: 'center' }}>
                <CustomButton
                  loading={isLoading || firbaseLoading}
                  category='Login'
                  className='custom-button'
                  type='submit'
                />
              </Box>
            </Box>
          )}

          {/* Driver Login Form */}
          {loginType === 'driver' && (
            <>
              {!showOtpField ? (
                // Mobile Number Input
                <Box component='form' onSubmit={handleDriverSubmit(onDriverSubmit)}>
                  <Box>
                    <Controller
                      name='mobileNumber'
                      control={driverControl}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <PhoneNoTextField
                          {...field}
                          style='share'
                          label='Contact Number'
                          setValue={setValue}
                          error={Boolean((errors as any)?.mobileNumber?.message)}
                          helperText={(errors as any)?.mobileNumber?.message}
                        />
                      )}
                    />
                  </Box>
                  <Box sx={{ marginTop: '30px', textAlign: 'center' }}>
                    <CustomButton
                      loading={otpLoader.isLoading}
                      category='Send OTP'
                      className='custom-button'
                      type='submit'
                    />
                  </Box>
                </Box>
              ) : (
                // OTP Input
                <Box component='form' onSubmit={handleSubmit(onOtpSubmit)}>
                  {/* Display Mobile Number */}
                  <Box sx={{ marginBottom: '20px', textAlign: 'center' }}>
                    <Typography
                      variant='body2'
                      sx={{ color: '#666', marginBottom: '5px' }}
                    >
                      OTP sent to
                    </Typography>
                    <Typography variant='body1' sx={{ fontWeight: 600, color: '#333' }}>
                      {mobileNumber}
                    </Typography>
                    <Link
                      component='button'
                      type='button'
                      underline='none'
                      onClick={handleBackToMobile}
                      sx={{
                        fontSize: '14px',
                        color: '#1976d2',
                        cursor: 'pointer',
                        marginTop: '5px'
                      }}
                    >
                      Change Number
                    </Link>
                  </Box>

                  <Box display='flex' justifyContent='center' gap={2}>
                    {otp.map((digit: any, index: any) => (
                      <TextField
                        key={index}
                        name='otp'
                        inputRef={el => (inputRefs.current[index] = el)}
                        value={digit}
                        onChange={(e: any) => {
                          handleEnterOTP(e, index);
                          setOtpSubmit(e.nativeEvent.data);
                        }}
                        onKeyDown={(e: any) => handleKeyDown(e, index)}
                        inputProps={{
                          maxLength: 1,
                          style: {
                            textAlign: 'center',
                            fontSize: '1.5rem',
                            width: '1rem',
                            height: '1rem'
                          }
                        }}
                      />
                    ))}
                  </Box>

                  {/* Resend OTP */}
                  <Box sx={{ marginTop: '15px', textAlign: 'center' }}>
                    <Typography variant='body2' sx={{ color: '#666' }}>
                      Didn’t receive OTP?{' '}
                      {timer > 0 ? (
                        <Typography
                          component='span'
                          sx={{ color: '#999', fontWeight: 500 }}
                        >
                          Resend in {timer}s
                        </Typography>
                      ) : (
                        <Link
                          component='button'
                          type='button'
                          underline='none'
                          onClick={handleResend}
                          sx={{
                            fontSize: '14px',
                            color: '#1976d2',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          Resend OTP
                        </Link>
                      )}
                    </Typography>
                  </Box>

                  {/* Verify OTP Button */}
                  <Box sx={{ marginTop: '20px', textAlign: 'center' }}>
                    <CustomButton
                      loading={diverOTPlogin.isLoading}
                      category='Verify OTP'
                      className='custom-button'
                      disabled={enableVerifyButton ? false : true}
                      type='submit'
                    />
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}

export default Login;
