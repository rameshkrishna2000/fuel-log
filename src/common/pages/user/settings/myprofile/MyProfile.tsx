import * as React from 'react';
import { Icon } from '@iconify/react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import {
  Badge,
  Box,
  ButtonBase,
  Grid,
  Slide,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import constant from '../../../../../utils/constants';
import { useMyProfileHooks } from './hooks/myProfilesHooks';
import { useAppSelector } from '../../../../../app/redux/hooks';
import CustomButton from '../../../../components/buttons/CustomButton';
import ThemeSetting from '../themeSetting/ThemeSetting';
import UserNotification from '../notification/UserNotification';
import ChangePassword from '../changePassword/ChangePassword';
import DefaultPage from '../DefaultPage';
import UserProfile from './UserProfile';
import { addLogout } from '../../../../redux/reducer/commonSlices/loginSlice';
import CircularProgress from '@mui/material/CircularProgress';
import './MyProfile.scss';
import LoginRedirect from '../../../../components/loginredirect/LoginRedirect';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />;
});

interface Props {
  isOpen?: string;
  handleClose?: () => void;
}

function MyProfile({ isOpen, handleClose }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const urls = { logout: addLogout };
  const { isLoading } = useAppSelector(state => state.logout);
  const { data } = useAppSelector(state => state.auth);
  const themes = useAppSelector(state => state.theme.theme);

  const { handleBadgeClick, handleSignout, selectedBadge } = useMyProfileHooks(urls);

  const roletype = data?.role;
  const { category } = useAppSelector(state => state.RoleModuleAccess);
  const yaanTRAC = roletype === 'ROLE_YAANTRAC_ADMIN';
  const APuser =
    roletype === 'ROLE_AUTOPLANNER_ADMIN' ||
    roletype === 'ROLE_OPERATOR' ||
    roletype === 'ROLE_AGENT' ||
    roletype === 'ROLE_SUB_AGENT' ||
    category === 'OPERATION_USER';

  return (
    <Dialog
      open={isOpen === 'myprofile'}
      onClose={handleClose}
      fullScreen={isMobile}
      maxWidth='md'
      fullWidth
      // TransitionComponent={Transition}
      className={`profileDialog ${themes}`}
      sx={{ padding: 3, zIndex: 5000, position: 'absolute' }}
    >
      <DialogContent sx={{ p: 0, height: isMobile ? '100vh' : '90vh' }}>
        <Stack direction='row' justifyContent='space-between' p={2}>
          <Typography variant='h6' className='setting'>
            {constant.Settings}
          </Typography>
          <Box
            className='closeicon'
            tabIndex={0}
            onClick={() => handleClose?.()}
            onKeyDown={(e: any) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleClose?.();
                e.preventDefault();
              }
            }}
          >
            <CloseIcon className='customicon' />
          </Box>
        </Stack>

        <Box>
          <Box
            className='mobileWrapper'
            // style={{ xs: 'block !important', sm: 'none !important' }}
            // sx={{ display: 'block' }}
            sx={{ display: { xs: 'block !important', sm: 'none !important' } }}
          >
            <Box className='mobileBottomNav'>
              <Icon
                icon='iconamoon:profile'
                className={selectedBadge === 1 ? 'activeIconXS' : 'iconXS'}
                onClick={() => handleBadgeClick(1)}
              />
              {!APuser && (
                <Icon
                  icon='tdesign:notification'
                  className={selectedBadge === 2 ? 'activeIconXS' : 'iconXS'}
                  onClick={() => handleBadgeClick(2)}
                />
              )}
              {yaanTRAC && (
                <Icon
                  icon='fluent:page-fit-16-regular'
                  className={selectedBadge === 5 ? 'activeIconXS' : 'iconXS'}
                  onClick={() => handleBadgeClick(5)}
                />
              )}
              <Icon
                icon='solar:lock-password-linear'
                className={selectedBadge === 3 ? 'activeIconXS' : 'iconXS'}
                onClick={() => handleBadgeClick(3)}
              />
              {isLoading ? (
                <CircularProgress size={22} />
              ) : (
                <Icon
                  icon='material-symbols:logout'
                  className='log-out-buttonXS'
                  onClick={handleSignout}
                />
              )}
            </Box>
          </Box>

          <Box>
            <Grid container sx={{ paddingRight: '16px' }}>
              <Grid item xs={12} sm={4} md={3} className='profile-sidebar'>
                <Box className='rootProfile'>
                  <Box className='navbarProfile'>
                    <Stack className='componentsIcons' direction='column' spacing={2}>
                      {/* Profile */}
                      <ButtonBase
                        className={
                          selectedBadge === 1 ? 'badge active' : 'badge nonActive'
                        }
                        onClick={() => handleBadgeClick(1)}
                      >
                        <Stack direction='row' spacing={2}>
                          <Icon
                            className={selectedBadge === 1 ? 'activeIcon icon' : 'icon'}
                            icon='iconamoon:profile'
                          />
                          <Typography className='badge-text'>
                            {constant.Profile}
                          </Typography>
                        </Stack>
                      </ButtonBase>

                      {/* Notifications */}
                      {!APuser && (
                        <ButtonBase
                          className={
                            selectedBadge === 2 ? 'badge active' : 'badge nonActive'
                          }
                          onClick={() => handleBadgeClick(2)}
                        >
                          <Stack direction='row' spacing={2}>
                            <Icon
                              className={selectedBadge === 2 ? 'activeIcon icon' : 'icon'}
                              icon='tdesign:notification'
                            />
                            <Typography className='badge-text'>
                              {constant.Notifications}
                            </Typography>
                          </Stack>
                        </ButtonBase>
                      )}

                      {/* Default View */}
                      {yaanTRAC && (
                        <ButtonBase
                          className={
                            selectedBadge === 5 ? 'badge active' : 'badge nonActive'
                          }
                          onClick={() => handleBadgeClick(5)}
                        >
                          <Stack direction='row' spacing={2}>
                            <Icon
                              className={selectedBadge === 5 ? 'activeIcon icon' : 'icon'}
                              icon='fluent:page-fit-16-regular'
                            />
                            <Typography className='badge-text'>
                              {constant.DefaultView}
                            </Typography>
                          </Stack>
                        </ButtonBase>
                      )}

                      {/* Change Password */}
                      <ButtonBase
                        className={
                          selectedBadge === 3 ? 'badge active' : 'badge nonActive'
                        }
                        onClick={() => handleBadgeClick(3)}
                      >
                        <Stack direction='row' spacing={2}>
                          <Icon
                            className={selectedBadge === 3 ? 'activeIcon icon' : 'icon'}
                            icon='solar:lock-password-linear'
                          />
                          <Typography className='badge-text'>
                            {constant.ChangePassword}
                          </Typography>
                        </Stack>
                      </ButtonBase>
                    </Stack>
                  </Box>

                  {/* Logout */}
                  <Box className='logout-container'>
                    <CustomButton
                      category='Log Out'
                      onClick={handleSignout}
                      loading={isLoading}
                      className='log-out-button'
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item sm={8} xs={12}>
                <Box className='profileContentWrapper'>
                  {selectedBadge === 1 && <UserProfile />}
                  {selectedBadge === 2 && <UserNotification />}
                  {selectedBadge === 3 && <ChangePassword handleClose={handleClose} />}
                  {selectedBadge === 4 && <ThemeSetting />}
                  {selectedBadge === 5 && <DefaultPage />}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default MyProfile;
