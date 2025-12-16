import { Box, Tab } from '@mui/material';

import { SyntheticEvent, useEffect, useState } from 'react';

import { TabContext, TabList, TabPanel } from '@mui/lab';

import RouteConfiguration from '../../../../features/autoplanner/pages/configurations/tour/RouteConfiguration';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import Driver from './components/driver/Driver';

import { useAppSelector } from '../../../../app/redux/hooks';

import PickupLocations from '../../../../features/autoplanner/pages/configurations/locations/PickupLocations';

import './Configuration.scss';

import VehicleOnboard from '../../../../features/autoplanner/pages/configurations/vehicleconfiguration/VehicleOnboard';

interface TabLabel {
  label: string;

  path: string;

  component: JSX.Element;
}

const Configuration = () => {
  const [value, setValue] = useState('0');

  const location = useLocation();

  const navigate = useNavigate();

  const { data } = useAppSelector(state => state.auth);

  let roletype = data?.role;

  const APsuperAdmin = roletype === 'ROLE_AUTOPLANNER_ADMIN';

  const APoperator = roletype === 'ROLE_OPERATOR';

  const logistics = roletype === 'ROLE_LOGISTICS_ADMIN';

  const deliveryTracking = roletype === 'ROLE_DT_ADMIN';

  const yaanTRAC = roletype === 'ROLE_YAANTRAC_ADMIN';

  const { data: roleAccess } = useAppSelector(state => state.RoleModuleAccess);

  const roleModules = roleAccess?.flatMap((item: any) =>
    item?.modules?.map((module: any) => module?.moduleName)
  );

  const { category } = useAppSelector(state => state.RoleModuleAccess);

  const roleData = [
    { module: 'driver', path: 'driver' },

    { module: 'tour', path: 'routeconfiguration' },

    { module: 'regular', path: 'regular' },

    { module: 'vehicle', path: 'vehicleconfiguration' },

    { module: 'pickup', path: 'pickupLocations' }
  ];

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const tabLabels: TabLabel[] = [
    ...(roleModules?.includes('driver')
      ? [{ label: 'Driver', path: 'driver', component: <Driver /> }]
      : []),

    ...(APsuperAdmin || APoperator || category === 'OPERATION_USER'
      ? [
          ...(roleModules?.includes('tour')
            ? [
                {
                  label: 'Tour',

                  path: 'routeconfiguration',

                  component: <RouteConfiguration />
                }
              ]
            : []),

          ...(roleModules?.includes('vehicle')
            ? [
                {
                  label: 'Vehicle',

                  path: 'vehicleconfiguration',

                  component: <VehicleOnboard />
                }
              ]
            : []),

          ...(roleModules?.includes('pickup')
            ? [
                {
                  label: 'Pickup',

                  path: 'pickupLocations',

                  component: <PickupLocations />
                }
              ]
            : [])
        ]
      : [])
  ];

  useEffect(() => {
    let defaultPath = category === 'OPERATION_USER' ? '' : 'driver';

    if (category === 'OPERATION_USER') {
      roleData?.forEach((item: any) => {
        if (roleModules?.indexOf(item.module) !== -1 && !defaultPath) {
          defaultPath = item.path;
        }
      });
    }

    const pathUrl = tabLabels.findIndex(tab => location.pathname.includes(tab.path));

    if (location.pathname === '/configuration') {
      navigate(`/configuration/${defaultPath}`);
    } else {
      setValue(pathUrl.toString());
    }
  }, [location.pathname, navigate, tabLabels]);

  return (
    <Box className='configuration-container'>
      <TabContext value={value}>
        <Box className='tab-context animate__animated animate__slideInRight animate__fast'>
          <Box className='tab-list'>
            <TabList
              onChange={handleChange}
              aria-label='lab API tabs example'
              variant='scrollable'
              allowScrollButtonsMobile
            >
              {tabLabels.map((tab, index) => (
                <Tab
                  key={index}
                  className='tab'
                  label={tab.label}
                  value={index.toString()}
                  component={Link}
                  to={`/configuration/${tab.path}`}
                />
              ))}
            </TabList>
          </Box>
        </Box>

        <Box sx={{ height: `calc(-100px + 100vh) !important`, overflowY: 'auto' }}>
          {tabLabels.map((label, index) => (
            <TabPanel
              key={index}
              value={index.toString()}
              className='configuration-tab-panel'
            >
              {label.component}
            </TabPanel>
          ))}
        </Box>
      </TabContext>
    </Box>
  );
};

export default Configuration;
