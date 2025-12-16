import { Box } from '@mui/material';
import PublicRoutes from './routes/PublicRoutes';
import AlertBox from './common/components/customized/customtoast/CustomToast';
import Notification from './common/components/notification/Notification';
import { useAppSelector } from './app/redux/hooks';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import './App.scss';
import 'animate.css';
import { useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';
type Libraries = ['places', 'drawing'];

const libraries: Libraries = ['places', 'drawing'];

function App() {
  const theme = useAppSelector(state => state.theme.theme);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAP_API_KEY || '',
    libraries
  });

  // Custom toast function
  const showCustomToast = (type: 'success' | 'error', message: string) => {
    toast.dismiss(); // Close any existing toasts
    toast(
      <Box className={`network-custom-toast ${type}`}>
        <Icon
          icon={type === 'error' ? 'famicons:warning-outline' : 'charm:circle-tick'}
          className='toast-icon'
        />
        <span className='ml-2'>{message}</span>
        <Icon
          icon='material-symbols:close-rounded'
          className='toast-close-icon'
          onClick={() => toast.dismiss()}
        />
      </Box>,
      { duration: 4000, position: 'top-center' }
    );
  };

  // Handle network status changes
  useEffect(() => {
    const handleOffline = () => showCustomToast('error', 'No Internet Connection!');
    const handleOnline = () => showCustomToast('success', 'Back Online!');

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <Box className={theme}>
      <PublicRoutes />
      <Notification />
      <AlertBox />
    </Box>
  );
}

export default App;
