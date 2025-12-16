import {
  Box,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  Typography,
  styled
} from '@mui/material';
import '../myprofile/MyProfile.scss';
import { Icon } from '@iconify/react';
import constant from '../../../../../utils/constants';
import { useAppSelector } from '../../../../../app/redux/hooks';
import { useUserNotificationHooks } from './hooks/UserNotificationHooks';
import Loader from '../../../../components/customized/customloader/CustomLoader';
import CustomButton from '../../../../components/buttons/CustomButton';
import CustomIconButton from '../../../../components/buttons/CustomIconButton';
import './UserNotification.scss';
import {
  putUserNotificationAction,
  userNotificationAction
} from '../../../../redux/reducer/commonSlices/userNotificationSlice';
import LoginRedirect from '../../../../components/loginredirect/LoginRedirect';

const UserNotification = () => {
  const { data: authData } = useAppSelector((state: any) => state?.auth);

  const themes = useAppSelector(state => state.theme.theme);

  const urls = {
    getNotification: userNotificationAction,
    UpdateNotification: putUserNotificationAction
  };

  const { isLoading, data, isLoadingPut, error } = useAppSelector(
    state => state?.userNotification
  );

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
    },
    '&:focus-within': {
      outline: '1px solid #000'
    }
  }));

  const {
    handleSubmit,
    handleSwitchChange,
    handleSpecificSwitchChange,
    notification,
    setTopics,
    topics,
    setTopicDisable,
    topicDisable,
    topicList
  } = useUserNotificationHooks({ data, error, authData, urls });

  return (
    <>
      <Box className='animate__animated animate__slideInRight userNotification-contain'>
        {isLoading ? (
          <Typography
            className='loader-notification'
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '67vh'
            }}
          >
            <Loader />
          </Typography>
        ) : (
          <Box className='notification-grid'>
            <Box
              className='grid-box'
              sx={{
                marginLeft: { xs: '-30px' },
                // maxWidth: { xs: '270px', sm: '270px', md: '100%' }
                maxWidth: '100%'
              }}
            >
              <Stack direction='row' justifyContent='space-between' mb={2}>
                <Typography className='profileData' ml={5}>
                  {constant.Notifications}
                </Typography>
              </Stack>
              <Stack className='grid-pushnotification' direction='row'>
                <Stack direction='row' alignItems='center' spacing={2} width='100%'>
                  <Icon
                    icon='material-symbols:notifications-active-outline'
                    width='23'
                    height='23'
                    style={{ color: 'black' }}
                  />
                  <Stack>
                    <Typography className='options'>
                      {constant.PushNotifications}
                    </Typography>
                    <Typography className='options1'>
                      {constant.PushNotificationsMsg}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack
                  direction='row'
                  alignItems='center'
                  spacing={2}
                  position={'relative'}
                >
                  <Typography className='options2'>
                    {notification?.push_notification_enabled === true ? 'ON' : 'OFF'}
                  </Typography>
                  <AntSwitch
                    inputProps={{
                      'aria-label': 'ant design',
                      tabIndex: 0,
                      onKeyDown: event => {
                        if (event.key === 'Enter') {
                          event.preventDefault();

                          const newCheckedState =
                            !notification?.push_notification_enabled;

                          setTopicDisable(!newCheckedState);

                          const syntheticEvent = {
                            target: {
                              checked: newCheckedState
                            }
                          };
                          handleSwitchChange(syntheticEvent, 'push_notification_enabled');
                        }
                      }
                    }}
                    className='ant-switch'
                    aria-label='push_notification_enabled'
                    checked={notification?.push_notification_enabled}
                    onChange={event => {
                      event.target.checked === false
                        ? setTopicDisable(true)
                        : setTopicDisable(false);
                      handleSwitchChange(event, 'push_notification_enabled');
                    }}
                  />
                  <Box sx={{ position: 'absolute', right: '-25px' }}>
                    <CustomIconButton
                      category='Settings'
                      onClick={(e: any) => {
                        setTopics(!topics);
                      }}
                    />
                  </Box>
                </Stack>
              </Stack>

              {topics && (
                <Stack className='grid-pushnotification' direction='row'>
                  <Grid container alignItems={'flex-start'}>
                    {topicList?.map(item => (
                      <Grid item lg={3}>
                        <FormControlLabel
                          onChange={(e: any) => handleSpecificSwitchChange(e, item)}
                          key={item.id}
                          control={
                            <Switch
                              tabIndex={0}
                              onKeyDown={event => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();

                                  const syntheticEvent = {
                                    ...event,
                                    target: { ...event.target, checked: !item.enabled }
                                  };
                                  handleSpecificSwitchChange(syntheticEvent, item);
                                }
                              }}
                              defaultChecked
                              disabled={topicDisable}
                              checked={item.enabled}
                            />
                          }
                          label={item.label}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              )}
            </Box>
          </Box>
        )}
        <Stack direction='row' justifyContent='flex-end' mt={2}>
          <Box
            sx={{
              marginRight: { xs: '40px', lg: '0px' }
            }}
          >
            <CustomButton
              category='Save'
              className='saveChanges'
              loading={isLoadingPut}
              onClick={handleSubmit}
            />
          </Box>
        </Stack>
      </Box>
      <LoginRedirect />
    </>
  );
};

export default UserNotification;
