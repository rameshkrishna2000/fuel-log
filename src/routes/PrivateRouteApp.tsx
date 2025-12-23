import { Box } from '@mui/material';
import SideNavbar from '../common/components/customized/sidenavbar/SideNavbar';
import PrivateRoutes from './PrivateRoutes';
import { useEffect, useRef } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppSelector } from '../app/redux/hooks';
import DriverTripManager from '../features/autoplanner/pages/configurations/driverDashboard/DriverDashboard';
import TopBar from '../common/components/customized/topbar/TopBar';

function PrivateRouteApp() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // useEffect(() => {
  //   audioRef?.current
  //     ?.play()
  //     .then(res => {
  //       return res;
  //     })
  //     .catch(error => {
  //       return error;
  //     });
  // }, []);
  const { data } = useAppSelector(state => state.auth);

  const { data: driverLogin } = useAppSelector(state => state.otpDriverLogin);
  const profile = useAppSelector(state => state.myProfile.data);
  let roletype = data?.role;

  const APdriver = driverLogin?.role === 'ROLE_AUTOPLANNERDRIVER';

  const { loginAccess, category } = useAppSelector(
    (state: any) => state.RoleModuleAccess
  );
  const APsuperAdmin = roletype === 'ROLE_AUTOPLANNER_ADMIN';
  const APoperator = roletype === 'ROLE_OPERATOR';
  const APoperationUser = category === 'OPERATION_USER';
  const APagent = roletype === 'ROLE_AGENT';
  const APsubAgent = roletype === 'ROLE_SUB_AGENT';

  let isAP = APsuperAdmin || APoperator || APagent || APsubAgent || APoperationUser;
  return (
    <>
      {APdriver ? (
        <Routes>
          <Route path='*' element={<Navigate to='/driver-today-trips' />} />
          <Route path='/driver-today-trips' element={<DriverTripManager />} />
        </Routes>
      ) : loginAccess ? (
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <Box sx={{ width: '50px' }}>
            <SideNavbar />
          </Box>

          {isAP ? (
            <Box sx={{ width: 'calc(100% - 50px)', height: '100vh' }}>
              <TopBar
                name={data?.userId}
                role={
                  APoperationUser
                    ? 'OPERATION USER'
                    : APoperator
                    ? 'OPERATOR ADMIN'
                    : data?.role.replaceAll('_', ' ').split('ROLE')[1]
                }
              />

              <Box sx={{ flex: 1, overflow: 'auto', mt: '0px' }}>
                <PrivateRoutes />
              </Box>
            </Box>
          ) : (
            <Box sx={{ width: 'calc(100% - 50px)', height: '100vh' }}>
              <PrivateRoutes />
            </Box>
          )}
          {/* <audio
        ref={audioRef}
        preload='auto'
        src={IntroAv}
      ></audio> */}
        </Box>
      ) : (
        <>{/* <AccessDenied /> */}</>
      )}
    </>
  );
}

export default PrivateRouteApp;
