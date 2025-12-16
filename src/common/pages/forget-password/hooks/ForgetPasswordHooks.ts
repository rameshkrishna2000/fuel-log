import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '../../../../app/redux/hooks';
import {
  getForgotPassword,
  getOTPValid
} from '../../../redux/reducer/commonSlices/forgotPasswordSlice';
import { getResetPassword } from '../../../redux/reducer/commonSlices/resetPasswordSlice';
import { useNavigate } from 'react-router-dom';
import { truncate } from 'lodash';

export const useForgotPasswordFormSubmition = (
  urls: any,
  resetGetValues: any,
  getOTPGetvalue: any,
  confirmOTPGetValue: any,
  setOtpInputBox: any
) => {
  const dispatch = useAppDispatch();
  const [key, setKey] = useState<any>(false);
  const [time, setTime] = useState(Date.now() + 60000);

  //First Form
  const SubmitOTP = useCallback(() => {
    let confirmOTPParams = confirmOTPGetValue();
    let forgotParams = getOTPGetvalue();
    let payload = {
      userName: forgotParams?.userName,
      category: 'user',
      otp: confirmOTPParams?.onetimepassword
    };
    if (payload) {
      dispatch(urls?.[0](payload));
    }
  }, []);

  //Second Form
  const handleGetOTP = async () => {
    let forgotParams = getOTPGetvalue();
    const isOTP = await dispatch(urls?.[1]({ username: forgotParams?.userName }));
    if (isOTP.meta.requestStatus === 'fulfilled') {
      setOtpInputBox(true);
    }
    setKey((prev: any) => !prev);
    setTime(Date.now() + 60000);
  };

  //Third Form
  const handleConfirm = async () => {
    let resetParams = resetGetValues();
    let forgotParams = getOTPGetvalue();
    await dispatch(
      urls?.[2]({
        userID: forgotParams?.userName,
        password: resetParams?.newPassword,
        confirmPassword: resetParams?.confirmNewPassword
      })
    );
  };

  return { handleConfirm, handleGetOTP, key, time, SubmitOTP };
};

export const useHandleForgotPasswordFunction = (
  validOTP: any,
  forgotdata: any,
  confirmOTPSetValue: any
) => {
  const navigate = useNavigate();
  const [confirmPassword, setConfirmPassword] = useState(false);
  const [otpInputBox, setOtpInputBox] = useState(false);

  //Login Page Function
  const handleLoginTab = () => {
    navigate('/login');
    setOtpInputBox(false);
    setConfirmPassword(false);
  };

  useEffect(() => {
    if (validOTP?.status === 200) {
      setConfirmPassword(true);
    }
  }, [validOTP]);

  useEffect(() => {
    confirmOTPSetValue('onetimepassword', '');
  }, [forgotdata]);

  return { handleLoginTab, otpInputBox, confirmPassword, setOtpInputBox };
};
