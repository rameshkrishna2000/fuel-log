import { settings } from './../Login';
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '../../../../app/redux/hooks';
import { getCurrentToken } from '../../../../firebase';
import { getLogin, getRoleAccess } from '../../../redux/reducer/commonSlices/loginSlice';
import { useNavigate } from 'react-router-dom';
import { createTheme, styled, Switch, useMediaQuery } from '@mui/material';
import { getMyProfileAction } from '../../../redux/reducer/commonSlices/myProfileSlice';
import { debounce, useAbort } from '../../../../utils/commonFunctions';
import {
  getOTP,
  getOTPlogin
} from '../../../redux/reducer/commonSlices/driverLoginSlice';

export const useCommonStateHandler = () => {
  const [loginType, setLoginType] = useState('user');
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpSubmit, setOtpSubmit] = useState<any>(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [enableVerifyButton, setEnableVerifyButton] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  return {
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
  };
};
export const useLoginFormSubmission = () => {
  const dispatch = useAppDispatch();
  const [isKeepSignedIn, setIsKeepSignedIn] = useState<boolean>(true);
  const navigate = useNavigate();
  const [firbaseLoading, setFirebaseLoading] = useState(false);
  const createAbort = useAbort();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsKeepSignedIn(event.target.checked);
  };

  const handleForgetPw = () => navigate('/forgetpassword');

  const onSubmit = async (params: any) => {
    try {
      // Get the Firebase token
      localStorage.removeItem('status');
      setFirebaseLoading(true);
      const token: any = await getCurrentToken();
      localStorage.setItem('firebaseToken', token);
      let action1 = await dispatch(
        getLogin({
          userID: params.userID,
          password: params.password,
          roleType: 'user',
          firebaseToken: token,
          ...(isKeepSignedIn ? { keepMeLogin: isKeepSignedIn } : {})
        })
      );
      setFirebaseLoading(false);
      if (action1.type === getLogin.fulfilled.type) {
        await dispatch(getRoleAccess(params?.userID));
      }
    } catch (error) {}
  };

  useEffect(() => {
    const key = localStorage.getItem('isKeepSignedIn');
    if (key === 'false') {
      setIsKeepSignedIn(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('isKeepSignedIn', `${isKeepSignedIn}`);
  }, [isKeepSignedIn]);
  return {
    onSubmit,
    handleChange,
    isKeepSignedIn,
    handleForgetPw,
    navigate,
    dispatch,
    firbaseLoading
  };
};

export const useLoginStyle = (themes: any) => {
  const theme = createTheme();

  const SmallDevices = useMediaQuery(theme.breakpoints.down('lg'));

  const AntSwitch = styled(Switch)(() => ({
    width: 28,
    height: 16,
    padding: 0,
    display: 'flex',
    '&:active': {
      '& .MuiSwitch-thumb': {
        width: 15
      },
      '& .MuiSwitch-switchBase.Mui-checked': {
        transform: 'translateX(9px)'
      }
    },
    '& .MuiSwitch-switchBase': {
      padding: 2,
      '&.Mui-checked': {
        transform: 'translateX(12px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: themes === 'ayka' ? '#ff6347' : '#3239EA'
        }
      }
    },
    '& .MuiSwitch-thumb': {
      width: 12,
      height: 12,
      borderRadius: 6
    },
    '& .MuiSwitch-track': {
      borderRadius: 16 / 2,
      opacity: 1,
      backgroundColor: '#000',
      boxSizing: 'border-box'
    }
  }));
  return { AntSwitch, SmallDevices };
};

export const useAfterLoginNavigate = () => {
  let lastVisitedPage = localStorage.getItem('lastVisitedPage');
  let token = localStorage.getItem('token');
  let defaultView = localStorage.getItem('defaultView');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // const handleNavigate = () => {
  //   if (lastVisitedPage && token) {
  //     dispatch(getMyProfileAction(''));
  //     navigate(lastVisitedPage, { replace: true });
  //   } else if (token) {
  //     dispatch(getMyProfileAction(''));
  //     navigate(`/${defaultView}`);
  //   }
  // };
  useEffect(() => {
    if (lastVisitedPage && token) {
      dispatch(getMyProfileAction(''));
      navigate(lastVisitedPage, { replace: true });
    } else if (token) {
      dispatch(getMyProfileAction(''));
      navigate(`/${defaultView}`);
    }
  }, [lastVisitedPage, token]);
  return { lastVisitedPage, token };
};

//custom hook to handle login as driver functionality
export const useLoginasDriver = ({
  setLoginType,
  setShowOtpField,
  setOtpSent,
  setMobileNumber,
  setOtp,
  setTimer,
  inputRefs,
  userReset,
  resetDriverForm
}: any) => {
  // Handle tab change
  const handleLoginTypeChange = (event: any, newValue: any) => {
    setLoginType(newValue);
    setShowOtpField(false);
    setOtpSent(false);
    setMobileNumber('');
    setMobileNumber();
    userReset();
    resetDriverForm();
  };
  // Handle back to mobile number input
  const handleBackToMobile = () => {
    setShowOtpField(false);
    setOtpSent(false);
    setOtp(['', '', '', '']);
    inputRefs.current[0]?.focus();
    setTimer(0);
  };
  return { handleLoginTypeChange, handleBackToMobile };
};

//custom hook to handle driver OTP
export const useDriverOTP = ({
  setOtp,
  setOtpValue,
  setEnableVerifyButton,
  inputRefs,
  otp,
  mobileNumber,
  setMobileNumber,
  setOtpSent,
  setTimer,
  setShowOtpField
}: any) => {
  const dispatch = useAppDispatch();

  //function to handle OTP
  const handleEnterOTP = (e: any, index: any) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // update combined OTP in form
    setOtpValue('otp', newOtp.join(''));
    const allFilled = newOtp.every(digit => digit !== '');
    setEnableVerifyButton(allFilled);

    if (value && index < 3) inputRefs.current[index + 1]?.focus();
  };

  // Handle driver mobile number submission
  const onDriverSubmit = async (data: any) => {
    setMobileNumber(data.mobileNumber);

    const action = await dispatch(getOTP({ mobileNumber: data.mobileNumber }));

    if (action.type === getOTP.fulfilled.type) {
      setOtpSent(true);
      setTimer(60);
      setShowOtpField(true);
    }
  };

  // Handle OTP verification
  const onOtpSubmit = async (data: any) => {
    const optLoginPayload = {
      mobileNumber: mobileNumber,
      otp: data.otp,
      deviceId: null,
      firebaseToken: null,
      keepMeLogin: true,
      forceLogin: true
    };

    const action = await dispatch(getOTPlogin(optLoginPayload));
    if (action.type === getOTPlogin.fulfilled.type) {
      useAfterLoginNavigate();
    }
  };

  //function to resend otp
  const handleResend = () => {
    dispatch(getOTP({ mobileNumber }));
    setOtp(['', '', '', '']);
    inputRefs.current[0]?.focus();
    setTimer(60); // reset timer after resend
  };

  const handleKeyDown = (e: any, index: any) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return { handleEnterOTP, onOtpSubmit, onDriverSubmit, handleResend, handleKeyDown };
};

//custom hook to handle OTP counter
export const useOTPCounter = ({
  setEnableVerifyButton,
  otpSubmit,
  timer,
  setTimer
}: any) => {
  useEffect(() => {
    if (otpSubmit === 4) {
      setEnableVerifyButton(true);
    }
  }, [otpSubmit]);

  useEffect(() => {
    if (timer <= 0) return;
    const countdown = setInterval(() => {
      setTimer((prev: any) => prev - 1);
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);
};
