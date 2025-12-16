import { useEffect, useState } from 'react';
import { Badge, Box, IconButton, Tooltip, Zoom } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../../app/redux/hooks';
import { Icon } from '@iconify/react';
import yaantrac from '../../../../app/assets/images/logo.png';
import MyProfile from '../../../pages/user/settings/myprofile/MyProfile';
import './SideNavbar.scss';
import ShareLocationIcon from '@mui/icons-material/ShareLocation';

function SideNavbar(): JSX.Element {
  const [selectedBadge, setSelectedBadge] = useState<number | null>();
  const [isOpen, setIsOpen] = useState<string>('');

  const navigate = useNavigate();
  const location = useLocation();

  const { theme } = useAppSelector(state => state.theme);
  const { data } = useAppSelector(state => state.auth);
  const { pathname } = location;

  const { data: roleAccess, category } = useAppSelector(state => state.RoleModuleAccess);
  const roleModules = roleAccess?.flatMap((item: any) =>
    item?.modules?.map((module: any) => module?.moduleName)
  );

  const roleModuleTypes = ['tour', 'regular', 'vehicle', 'pickup', 'driver'];

  let roletype = data?.role;

  const APsuperAdmin = roletype === 'ROLE_AUTOPLANNER_ADMIN';
  const APoperator = roletype === 'ROLE_OPERATOR';
  const APagent = roletype === 'ROLE_AGENT';
  const APsubAgent = roletype === 'ROLE_SUB_AGENT';

  const APoperationUser = category === 'OPERATION_USER';

  const handleBadgeClick = (badgeNumber: number): void => {
    setSelectedBadge(badgeNumber);
    if (badgeNumber === 1) {
      navigate('/dashboard');
    } else if (badgeNumber === 2) {
      navigate('/dashboard2');
    } else if (badgeNumber === 3) {
      navigate('/livetracking');
    } else if (badgeNumber === 4) {
      navigate('/historictracking');
    } else if (badgeNumber === 5) {
      navigate('/management');
    } else if (badgeNumber === 6) {
      navigate('/today-trips');
    } else if (badgeNumber === 12) {
      navigate('/deliverytracking');
    } else if (badgeNumber === 7) {
      navigate('/trips');
    } else if (badgeNumber === 8) {
      navigate('/configuration');
    } else if (badgeNumber === 10) {
      navigate('/dispatch');
    } else if (badgeNumber === 11) {
      navigate('/deliveryload');
    } else if (badgeNumber === 13) {
      navigate('/geofencemapping');
    } else if (badgeNumber === 14) {
      navigate('/configuration/agents');
    } else if (badgeNumber === 15) {
      navigate('/trips/autoplannertrips/tours');
    } else if (badgeNumber === 16) {
      navigate('/trips/autoplannertrips/scheduled-tour');
    } else if (badgeNumber === 19) {
      navigate('/users');
    } else if (badgeNumber === 18) {
      navigate('/deliveryorders');
    } else if (badgeNumber === 20) {
      navigate('/deliveryTrackingDashboard');
    } else if (badgeNumber === 21) {
      navigate('/fuel-dashboard');
    } else {
      navigate('/dispatch-management');
    }
  };

  const OpenMyProfile = () => {
    setIsOpen('myprofile');
  };

  // for open notification component
  const handleOpenNotification = () => {
    handleBadgeClick(9);
    navigate('/historynotifications');
  };

  const handleClose = () => setIsOpen('');

  useEffect(() => {
    if (pathname === '/dashboard') {
      setSelectedBadge(1);
    } else if (pathname === '/dashboard2') {
      setSelectedBadge(2);
    } else if (pathname === '/livetracking') {
      setSelectedBadge(3);
    } else if (pathname === '/historictracking') {
      setSelectedBadge(4);
    } else if (pathname.split('/')[1] === 'management') {
      setSelectedBadge(5);
    } else if (pathname === '/today-trips') {
      setSelectedBadge(6);
    } else if (
      pathname.split('/')[1] === 'trips' &&
      selectedBadge !== 15 &&
      selectedBadge !== 16
    ) {
      setSelectedBadge(7);
    } else if (pathname.split('/')[1] === 'configuration') {
      setSelectedBadge(8);
    } else if (pathname === '/historynotifications') {
      setSelectedBadge(9);
    } else if (pathname === '/dispatch') {
      setSelectedBadge(10);
    } else if (pathname === '/deliverytracking' || pathname === '/adddeliverytrip') {
      setSelectedBadge(12);
    } else if (pathname === '/geofencemapping') {
      setSelectedBadge(13);
    } else if (pathname === '/configuration/agents') {
      setSelectedBadge(14);
    } else if (pathname === '/trips/autoplannertrips/tours') {
      setSelectedBadge(15);
    } else if (pathname === '/trips/autoplannertrips/scheduled-tour') {
      setSelectedBadge(16);
    } else if (pathname.split('/')[1] === 'users') {
      setSelectedBadge(19);
    }
  }, [pathname]);

  useEffect(() => {
    localStorage.setItem('lastVisitedPage', pathname);
  }, [location]);

  return (
    <Box className='root'>
      <Box
        className='logo'
        p={1}
        onClick={() => {
          navigate('/dashboard');
          handleBadgeClick(1);
        }}
      >
        <Box component='img' src={yaantrac} />
      </Box>
      <Box className='navbar d-flex-c'>
        <Box className='componentsIcons d-flex-c'>
          {(APagent || APsubAgent || APsuperAdmin || APoperator || APoperationUser) && (
            <Tooltip
              leaveDelay={100}
              title='Live Dashboard'
              placement='right'
              TransitionProps={{ timeout: 300 }}
              TransitionComponent={Zoom}
              arrow
            >
              <Badge
                className={
                  selectedBadge === 6 || pathname === '/today-trips'
                    ? 'active'
                    : 'nonActive'
                }
                onClick={() => handleBadgeClick(6)}
              >
                <Icon
                  className={
                    selectedBadge === 6 || pathname === '/today-trips'
                      ? 'activeIcon icon'
                      : 'icon'
                  }
                  icon='material-symbols:today-rounded'
                />
              </Badge>
            </Tooltip>
          )}

          {!APagent && !APsubAgent ? (
            <Tooltip
              leaveDelay={100}
              title={
                APsubAgent || APagent || APoperator || APsuperAdmin || APoperationUser
                  ? 'Bookings'
                  : 'Trips'
              }
              placement='right'
              TransitionProps={{ timeout: 300 }}
              TransitionComponent={Zoom}
              arrow
            >
              <Badge
                className={
                  selectedBadge === 7 || pathname === '/trips' ? 'active' : 'nonActive'
                }
                onClick={() => handleBadgeClick(7)}
              >
                <Icon
                  className={
                    selectedBadge === 7 || pathname === '/trips'
                      ? 'activeIcon icon'
                      : 'icon'
                  }
                  icon='bx:trip'
                />
              </Badge>
            </Tooltip>
          ) : (
            ''
          )}

          {(APagent || APsubAgent) && (
            <Tooltip
              leaveDelay={100}
              title='Bookings'
              placement='right'
              TransitionProps={{ timeout: 300 }}
              TransitionComponent={Zoom}
              arrow
            >
              <Badge
                className={
                  selectedBadge === 15 || pathname === '/trips/autoplannertrips/tours'
                    ? 'active'
                    : 'nonActive'
                }
                onClick={() => handleBadgeClick(15)}
              >
                <Icon
                  className={
                    selectedBadge === 15 || pathname === '/trips/autoplannertrips/tours'
                      ? 'activeIcon icon'
                      : 'icon'
                  }
                  icon='bx:trip'
                />
              </Badge>
            </Tooltip>
          )}
          {(APagent || APsubAgent) && (
            <Tooltip
              leaveDelay={100}
              title='Scheduled'
              placement='right'
              TransitionProps={{ timeout: 300 }}
              TransitionComponent={Zoom}
              arrow
            >
              <Badge
                className={
                  selectedBadge === 16 ||
                  pathname === '/trips/autoplannertrips/scheduled-tour'
                    ? 'active'
                    : 'nonActive'
                }
                onClick={() => handleBadgeClick(16)}
              >
                <Icon
                  className={
                    selectedBadge === 16 ||
                    pathname === '/trips/autoplannertrips/scheduled-tour'
                      ? 'activeIcon icon'
                      : 'icon'
                  }
                  icon='icon-park-outline:table-report'
                />
              </Badge>
            </Tooltip>
          )}
          {APagent && (
            <Tooltip
              leaveDelay={100}
              title='Company User'
              placement='right'
              TransitionProps={{ timeout: 300 }}
              TransitionComponent={Zoom}
              arrow
            >
              <Badge
                className={
                  selectedBadge === 14 || pathname === '/configuration/agents'
                    ? 'active'
                    : 'nonActive'
                }
                onClick={() => handleBadgeClick(14)}
              >
                <Icon
                  className={
                    selectedBadge === 14 || pathname === '/configuration/agents'
                      ? 'activeIcon icon'
                      : 'icon'
                  }
                  icon='fluent:person-key-32-regular'
                />
              </Badge>
            </Tooltip>
          )}

          {!APagent &&
          !APsubAgent &&
          (category === 'OPERATION_USER'
            ? roleModuleTypes?.some((item: any) => roleModules?.includes(item))
            : true) ? (
            <Tooltip
              leaveDelay={100}
              title='Management'
              placement='right'
              TransitionProps={{ timeout: 300 }}
              TransitionComponent={Zoom}
              arrow
            >
              <Badge
                className={
                  selectedBadge === 8 || pathname === '/configuration'
                    ? 'active'
                    : 'nonActive'
                }
                onClick={() => handleBadgeClick(8)}
              >
                <Icon
                  className={
                    selectedBadge === 8 || pathname === '/configuration'
                      ? 'activeIcon icon'
                      : 'icon'
                  }
                  icon='icon-park-outline:setting-config'
                />
              </Badge>
            </Tooltip>
          ) : (
            ''
          )}
          {(APsuperAdmin ||
            APoperator ||
            (APoperationUser && roleModules?.includes('reports'))) && (
            <Tooltip
              leaveDelay={100}
              title='Reports'
              placement='right'
              TransitionProps={{ timeout: 300 }}
              TransitionComponent={Zoom}
              arrow
            >
              <Badge
                className={
                  selectedBadge === 5 || pathname === '/management'
                    ? 'active'
                    : 'nonActive'
                }
                onClick={() => handleBadgeClick(5)}
              >
                <Icon
                  style={{ transform: 'rotate(45deg)' }}
                  className={
                    selectedBadge === 5 || pathname === '/management'
                      ? 'activeIcon icon'
                      : 'icon'
                  }
                  icon='ci:main-component'
                />
              </Badge>
            </Tooltip>
          )}
          {!APagent && !APsubAgent && category !== 'OPERATION_USER' ? (
            <Tooltip
              leaveDelay={100}
              title={'User Management'}
              placement='right'
              TransitionProps={{ timeout: 300 }}
              TransitionComponent={Zoom}
              arrow
            >
              <Badge
                className={
                  selectedBadge === 19 || pathname === '/users' ? 'active' : 'nonActive'
                }
                onClick={() => handleBadgeClick(19)}
              >
                <Icon
                  className={
                    selectedBadge === 19 || pathname === '/users'
                      ? 'activeIcon icon'
                      : 'icon'
                  }
                  icon='mdi:account-group'
                />
              </Badge>
            </Tooltip>
          ) : (
            ''
          )}
          <Tooltip
            leaveDelay={100}
            title={'Fuel Dashbooard'}
            placement='right'
            TransitionProps={{ timeout: 300 }}
            TransitionComponent={Zoom}
            arrow
          >
            <Badge
              className={
                selectedBadge === 21 || pathname === '/fuel-dashboard'
                  ? 'active'
                  : 'nonActive'
              }
              onClick={() => handleBadgeClick(21)}
            >
              <Icon
                className={
                  selectedBadge === 21 || pathname === '/fuel-dashboard'
                    ? 'activeIcon icon'
                    : 'icon'
                }
                icon='lucide:fuel'
              />
            </Badge>
          </Tooltip>
        </Box>
        <Box sx={{ flexGrow: 0, textAlign: 'center' }}>
          <Tooltip
            leaveDelay={100}
            title='Settings'
            placement='right'
            TransitionProps={{ timeout: 300 }}
            TransitionComponent={Zoom}
            arrow
          >
            <IconButton
              onClick={OpenMyProfile}
              sx={{ p: 0, width: '40px', height: '40px' }}
            >
              <Icon className='personIcon' icon='mdi:person-circle-outline' />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      {isOpen === 'myprofile' && <MyProfile isOpen={isOpen} handleClose={handleClose} />}
    </Box>
  );
}

export default SideNavbar;
