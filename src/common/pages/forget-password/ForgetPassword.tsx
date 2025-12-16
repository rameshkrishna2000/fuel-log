import { useCallback, useEffect, useState } from 'react';
import { Box, Grid, Link, Typography, createTheme, useMediaQuery } from '@mui/material';
import CustomTextField from '../../components/customized/customtextfield/CustomTextField';
import CustomButton from '../../components/buttons/CustomButton';
import './ForgetPassword.scss';
import { useAppSelector } from '../../../app/redux/hooks';
import {
  clearForgetPassword,
  clearOTP,
  getForgotPassword,
  getOTPValid
} from '../../../common/redux/reducer/commonSlices/forgotPasswordSlice';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { getResetPassword } from '../../../common/redux/reducer/commonSlices/resetPasswordSlice';
import constant from '../../../utils/constants';
import Countdown from 'react-countdown';
import { Carousel } from 'react-responsive-carousel';
import { images, settings } from '../login/Login';
import {
  OTPValidData,
  OTPUsernameData,
  ResetPassowrdData
} from './componentDatas/ForgotPasswordData';
import {
  useForgotPasswordFormSubmition,
  useHandleForgotPasswordFunction
} from './hooks/ForgetPasswordHooks';
import { useFetchApi } from '../../../features/autoplanner/pages/configurations/regular/hooks/fieldsControl';
import { useDynamicYupSchema } from '../../hooks/useDynamicSchema';
import { CountDownRenderer } from './component/CountDownRenderer';
import LoginVideo from '../../../app/assets/video/loginVideo.mp4';

function ForgetPassword() {
  const theme = createTheme();
  const { data: forgotdata, isLoading: loadingValidateOTP } = useAppSelector(
    state => state?.forgetpassword
  );
  const { data: validOTP, isLoading } = useAppSelector(state => state?.otpvalid);
  const { isLoading: loginloading } = useAppSelector(state => state?.resetpassword);
  const SmallDevices = useMediaQuery(theme.breakpoints.down('lg'));

  const { createFormFields } = useDynamicYupSchema(null);
  const { schema: usernameSchema } = createFormFields(OTPUsernameData());
  const { schema: OTPValid }: any = createFormFields(OTPValidData());

  const urls = [getOTPValid, getForgotPassword, getResetPassword];

  // get methods from reach hook form
  const {
    handleSubmit: handleSubmitGetOtp,
    getValues: getOTPGetvalue,
    control: getOTPControl
  } = useForm({
    resolver: yupResolver(usernameSchema)
  });

  const {
    handleSubmit: handleSubmitConfirmOtp,
    setValue: confirmOTPSetValue,
    getValues: confirmOTPGetValue,
    control: confirmOTPControl
  } = useForm({
    resolver: yupResolver(OTPValid)
  });

  const {
    handleSubmit: resetSubmit,
    getValues: resetGetValues,
    setValue: resetSetValues,
    control: resetControl
  } = useForm({
    resolver: async (data: any, context: any, options: any) => {
      const { schema }: any = createFormFields(ResetPassowrdData(data));
      return yupResolver(schema)(data, context, options);
    }
  });
  const { handleLoginTab, otpInputBox, confirmPassword, setOtpInputBox } =
    useHandleForgotPasswordFunction(validOTP, forgotdata, confirmOTPSetValue);
  const { handleConfirm, handleGetOTP, key, time, SubmitOTP } =
    useForgotPasswordFormSubmition(
      urls,
      resetGetValues,
      getOTPGetvalue,
      confirmOTPGetValue,
      setOtpInputBox
    );

  useFetchApi({ clearUrls: [clearOTP, clearForgetPassword] });

  return (
    <Grid container className='grid-container'>
      <Box className='gradient-box'></Box>
      {!otpInputBox ? (
        <Grid
          item
          className='forgot-grid'
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
          <Box
            className='forgot-box'
            component='form'
            onSubmit={handleSubmitGetOtp(handleGetOTP)}
          >
            <h2 className='forgot-header'>{constant.ForgotPassword}</h2>
            {OTPUsernameData().map(item => (
              <CustomTextField
                label={item.label}
                id={item.id}
                placeholder={item.placeholder}
                control={getOTPControl}
                inputProps={{ maxLength: 20 }}
                name={item.name}
              />
            ))}

            <Box sx={{ marginTop: '20px', textAlign: 'center' }}>
              <CustomButton
                category={otpInputBox ? 'Verify' : 'Get OTP'}
                className='custom-button'
                type='submit'
                loading={loadingValidateOTP}
              />
            </Box>

            <Box onClick={handleLoginTab} className='back-to-log'>
              <Link
                className='forgot-pw'
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLoginTab();
                  }
                }}
              >
                {constant.BackToLogin}
              </Link>
            </Box>
          </Box>
        </Grid>
      ) : (
        <Grid
          item
          className='forgot-grid'
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
          <Box
            component='form'
            className='forgot-box'
            onSubmit={handleSubmitConfirmOtp(SubmitOTP)}
          >
            {OTPValidData().map(item => (
              <CustomTextField
                label={item.label}
                id={item.id}
                placeholder={item.placeholder}
                control={confirmOTPControl}
                name={item.name}
                maxlength={4}
              />
            ))}
            <Box
              sx={{
                display: 'flex',
                textAlign: 'right',
                justifyContent: 'right',
                gridGap: '5px',
                fontSize: '12px',
                color: 'rgba(45,45,135,1)'
              }}
            >
              <Countdown
                key={key}
                date={time}
                renderer={({ minutes, seconds, completed }) => (
                  <CountDownRenderer
                    minutes={minutes}
                    seconds={seconds}
                    completed={completed}
                    handleGetOTP={handleGetOTP}
                  />
                )}
              />
            </Box>
            <Box sx={{ marginTop: '20px', textAlign: 'center' }}>
              <CustomButton
                category={otpInputBox ? 'Verify' : 'Get OTP'}
                className='custom-button'
                type='submit'
                loading={isLoading}
              />
            </Box>
            <Box onClick={handleLoginTab} className='back-to-log'>
              <Link
                href='#'
                className='forgot-pw'
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLoginTab();
                  }
                }}
              >
                {constant.BackToLogin}
              </Link>
            </Box>
          </Box>
        </Grid>
      )}
      {!SmallDevices && (
        <>
          <Carousel {...settings}>
            {images.map((e: any) => {
              return (
                <Grid item className='login-image'>
                  {e.key === 'video' ? (
                    <video className='login-video' autoPlay loop muted>
                      <source src={LoginVideo} type='video/mp4' />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img src={e.source}></img>
                  )}
                </Grid>
              );
            })}
          </Carousel>
          <Box className='forgot-content'>
            <Typography className='forgot-heading-typo'>
              {constant.LoginHeading}
            </Typography>
            <Typography className='forgot-subhead-typo'>
              {constant.LoginSubHead}
            </Typography>
          </Box>
        </>
      )}

      {confirmPassword && (
        <Grid
          item
          className='forgot-grid'
          sx={{
            left: SmallDevices ? '50%' : '70%'
          }}
        >
          <Box className='forgot-box animate__animated animate__fadeInUp'>
            <Box component='form' onSubmit={resetSubmit(handleConfirm)}>
              <h2 className='forgot-header'>{constant.ForgotPassword}</h2>
              {ResetPassowrdData().map((item, index: number) => (
                <Box className='animate__animated animate__zoomInDown '>
                  <CustomTextField
                    label={item.label}
                    id={item.id}
                    type='password'
                    maxlength={16}
                    placeholder={item.placeholder}
                    control={resetControl}
                    name={item.name}
                    onChangeCallback={e => {
                      if (index === 0) resetSetValues('newPassword', e);
                    }}
                  />
                </Box>
              ))}

              <Box sx={{ marginTop: '20px', textAlign: 'center' }}>
                <CustomButton
                  category='Submit'
                  className='custom-button'
                  type='submit'
                  loading={loginloading}
                />
              </Box>
            </Box>

            <Box onClick={handleLoginTab} className='back-to-log'>
              <Link
                href='#'
                className='forgot-pw'
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLoginTab();
                  }
                }}
              >
                {constant.BackToLogin}
              </Link>
            </Box>
          </Box>
        </Grid>
      )}
    </Grid>
  );
}

export default ForgetPassword;
