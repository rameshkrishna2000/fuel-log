import { Backdrop, Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import CustomButton from '../../components/buttons/CustomButton';
import constant from '../../../utils/constants';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/redux/hooks';
import { accessStatus } from '../../redux/reducer/commonSlices/loginSlice';
import Breakdown from '../../../app/assets/images/breakdown.png';
import AccessDenied from '../../../app/assets/images/accessdenied.png';
import './LoginRedirect.scss';

function LoginRedirect() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { connection } = useAppSelector(state => state.websocket);

  let token = localStorage.getItem('token');
  const status = useAppSelector(state => state.auth.status);

  const handleRedirect = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('status');
    if (connection) {
      connection.close();
    }
    const key = localStorage.getItem('isKeepSignedIn');
    if (key === 'false') {
      localStorage.setItem('isKeepSignedIn', 'false');
    }
    navigate('/login');
    localStorage.clear();
    localStorage.removeItem('lastVisitedPage');
    localStorage.removeItem('token');
    dispatch({ type: 'RESET' });
  };
  const handleContinue = () => {
    setIsOpen(false);
    dispatch(accessStatus(''));
  };

  useEffect(() => {
    if (
      !token ||
      token === 'expired' ||
      status === '401' ||
      status === '403' ||
      status === '405'
    ) {
      setIsOpen(true);
    }
  }, [token, status]);

  return isOpen ? (
    <Backdrop open={isOpen} sx={{ zIndex: 4000 }}>
      <Box className='private-box'>
        <Box
          component='img'
          src={status === '405' ? AccessDenied : Breakdown}
          className='image-box'
        />
        <Typography className='redirect-typo1'>
          {status === '405'
            ? constant.AccountAccess
            : status === '403'
            ? constant.AccountDeactive
            : constant.Tokenexpired}
        </Typography>
        <Typography className='redirect-typo2'>
          {status === '405' ? constant.contactAdmin : constant.Loginagain}
        </Typography>
        <Box className='logout-align'>
          <Box>
            <CustomButton
              category='Go to Login'
              className='custom-button'
              onClick={handleRedirect}
            />
          </Box>
          {status === '405' ? (
            <Box>
              <CustomButton
                category='Continue'
                className='custom-button-continue'
                onClick={handleContinue}
              />
            </Box>
          ) : (
            ''
          )}
        </Box>
      </Box>
    </Backdrop>
  ) : (
    <></>
  );
}

export default LoginRedirect;
