import { Box } from '@mui/material';
import { useForgotPasswordFormSubmition } from '../hooks/ForgetPasswordHooks';
import { getForgotPassword } from '../../../redux/reducer/commonSlices/forgotPasswordSlice';

//Customize countdown timer
export const CountDownRenderer = ({ minutes, seconds, completed, handleGetOTP }: any) => {
  if (completed) {
    return (
      <Box onClick={() => handleGetOTP()} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
        Resend OTP?
      </Box>
    );
  } else {
    // Render a countdown
    return (
      <span>
        {minutes <= 9 || minutes <= '9' ? '0' + minutes : minutes}:
        {seconds <= 9 || seconds <= '9' ? '0' + seconds : seconds}
      </span>
    );
  }
};
