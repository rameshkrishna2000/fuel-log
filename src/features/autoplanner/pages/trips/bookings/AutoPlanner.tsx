import { SyntheticEvent, useEffect, useState } from 'react';
import { Alert, Box, Tab } from '@mui/material';
import { useAppSelector } from '../../../../../app/redux/hooks';
import AutoPlannerTrip from './AutoPlannerTrip';
import AutoGenerateView from '../scheduled/AutoGenerateView';
import { TabContext, TabList, TabPanel } from '@mui/lab';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AutoPlanner.scss';
import '../../../../../common/pages/user/management/Management.scss';
import AvailableTourSummary from '../summary/AvailableTourSummary';

interface TabLabel {
  label: string;
  path: string;
  component: JSX.Element;
}

const AutoPlanner = () => {
  const [value, setValue] = useState<string>('0');

  const location = useLocation();
  const navigate = useNavigate();

  const { data } = useAppSelector(state => state.auth);
  let roletype = data?.role;
  const APsuperAdmin = roletype === 'ROLE_AUTOPLANNER_ADMIN';
  const APoperator = roletype === 'ROLE_OPERATOR';
  const APagent = roletype === 'ROLE_AGENT';
  const APsubAgents = roletype === 'ROLE_SUB_AGENT';

  const { category } = useAppSelector(state => state.RoleModuleAccess);

  const { data: roleAccess } = useAppSelector(state => state.RoleModuleAccess);
  const roleModules = roleAccess?.flatMap((item: any) =>
    item?.modules?.map((module: any) => module?.moduleName)
  );

  const { info } = useAppSelector(state => state.initialTourSummary);

  const tabLabels: TabLabel[] = [
    { label: 'Bookings', path: 'tours', component: <AutoPlannerTrip /> },

    ...(APsuperAdmin || APoperator || roleModules?.includes('summary')
      ? [{ label: 'Summary', path: 'tour-summary', component: <AvailableTourSummary /> }]
      : []),
    ...(roleModules?.includes('schedule')
      ? [{ label: 'Scheduled', path: 'scheduled-tour', component: <AutoGenerateView /> }]
      : [])
  ];

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  useEffect(() => {
    const defaultPath = 'tours';
    const pathUrl = tabLabels.findIndex(tab => location.pathname.includes(tab.path));
    if (location.pathname === 'trips/autopannertrips') {
      navigate(`trips/autopannertrips/${defaultPath}`);
    } else {
      setValue(pathUrl !== -1 ? pathUrl.toString() : '0');
    }
  }, [location.pathname, navigate, tabLabels]);

  return (
    <Box
      className={
        APsuperAdmin ||
        APagent ||
        APoperator ||
        APsubAgents ||
        category === 'OPERATION_USER'
          ? 'autoplanner-trip-mode-container management-container'
          : 'management-container'
      }
    >
      <TabContext value={value}>
        {(APsuperAdmin || APoperator || category === 'OPERATION_USER') && (
          <Box
            className='tab-context  animate__animated animate__slideInRight animate__fast'
            sx={{ display: 'flex', alignItems: 'center', gap: '80px' }}
          >
            <Box className='tab-list '>
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
                    to={`/trips/autoplannertrips/${tab.path}`}
                  />
                ))}
              </TabList>
            </Box>
            {value === '1' && info}
          </Box>
        )}
        <Box sx={{ height: `calc(100vh - 100px) !important`, overflowX: 'hidden' }}>
          {tabLabels.map((tab, index) => (
            <TabPanel key={index} value={index.toString()}>
              {tab.component}
            </TabPanel>
          ))}
        </Box>
      </TabContext>
    </Box>
  );
};

export default AutoPlanner;
