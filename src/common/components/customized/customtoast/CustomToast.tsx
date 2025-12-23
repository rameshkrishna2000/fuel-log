import { Alert, Slide, Snackbar } from '@mui/material';
import { useDispatch } from 'react-redux';
import { updateToast } from '../../../../common/redux/reducer/commonSlices/toastSlice';
import { useAppSelector } from '../../../../app/redux/hooks';

function TransitionLeft(props: any) {
  return <Slide {...props} direction='left' />;
}

const AlertBox = () => {
  const dispatch = useDispatch();
  let { show, severity, message } = useAppSelector((state: any) => state.toast);

  // if (!message) {
  //   message = 'Session Expired';
  // }

  const noToast = localStorage.getItem('toast');

  const handleClose = () => {
    dispatch(updateToast({ show: false, severity, message }));
  };

  return (
    <Snackbar
      sx={{ zIndex: 7000 }}
      open={noToast == String('false') && severity === 'error' ? false : show}
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      TransitionComponent={TransitionLeft}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant='filled'
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AlertBox;
