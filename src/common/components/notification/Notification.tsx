import { useState, useEffect, useRef } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { Toaster, toast } from 'react-hot-toast';
import { requestPermission, onMessageListener } from '../../../firebase';
import APLogo from '../../../app/assets/images/autoplanner.jpg';
import { useAppSelector } from '../../../app/redux/hooks';
import './Notification.scss';
import CloseIcon from '@mui/icons-material/Close';

interface NotificationPayload {
  title?: string;
  body?: string;
}

function Notification(): JSX.Element {
  const [notification, setNotification] = useState<NotificationPayload>({
    title: '',
    body: ''
  });

  const theme = useAppSelector(state => state.theme.theme);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const initializeNotifications = async () => {
      await requestPermission();
      try {
        await onMessageListener().then((payload: any) => {
          if (payload?.notification) {
            setNotification({
              title: payload.notification.title,
              body: payload.notification.body
            });

            if (audioRef.current) {
              audioRef.current?.play();
            }
            toast.custom(
              t => (
                <Stack className='toast-stack' justifyContent='space-between' spacing={1}>
                  <Box sx={{ display: 'flex', direction: 'row', alignItems: 'center' }}>
                    <Box className={'logo-container'}>
                      <img
                        src={APLogo}
                        alt='logo'
                        style={{ width: '35px', height: '35px' }}
                      />
                    </Box>
                    <Box className={'toast-content'}>
                      <Typography className='title-toast'>
                        {payload.notification.title?.replace(/([a-z])([A-Z])/g, '$1 $2')}
                      </Typography>
                      <Typography style={{ color: 'black' }}>
                        {payload.notification.body}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    onClick={() => {
                      toast.dismiss(t.id);
                    }}
                    className='noti-close-button'
                  >
                    <CloseIcon fontSize='small' />
                  </Box>
                </Stack>
              ),
              {
                duration: 5000,
                position: 'bottom-right'
              }
            );
          }
        });
      } catch (error) {
        console.error('Failed to set up onMessage listener:', error);
      }
    };

    initializeNotifications();
  }, [onMessageListener()]);

  return (
    <>
      <Toaster />
    </>
  );
}

export default Notification;
