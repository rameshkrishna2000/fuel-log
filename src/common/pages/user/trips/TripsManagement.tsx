import { Box, Tab } from '@mui/material';
import { SyntheticEvent, useEffect, useState } from 'react';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AutoPlanner from '../../../../features/autoplanner/pages/trips/bookings/AutoPlanner';
import { useAppSelector } from '../../../../app/redux/hooks';
import './TripsManagement.scss';

interface TabLabel {
  label: string;
  path: string;
  component: JSX.Element;
}

// Function for the management component:
function TripsManagement() {
  const { data } = useAppSelector(state => state.auth);
  const { category } = useAppSelector(state => state.RoleModuleAccess);
  let roletype = data?.role;
  const user =
    roletype === 'ROLE_DT_ADMIN,ROLE_YAANTRAC_USER' || roletype === 'ROLE_YAANTRAC_ADMIN';
  const APsuperAdmin = roletype === 'ROLE_AUTOPLANNER_ADMIN';
  const APoperator = roletype === 'ROLE_OPERATOR';
  const logistics = roletype === 'ROLE_LOGISTICS_ADMIN';
  const APagent = roletype === 'ROLE_AGENT';
  const APsubAgents = roletype === 'ROLE_SUB_AGENT';
  const deliveryTracking = roletype === 'ROLE_DT_ADMIN';

  const location = useLocation();
  const navigate = useNavigate();
  const [value, setValue] = useState<string>('0');
  const tabLabels: TabLabel[] = [
    ...(APsuperAdmin ||
    APagent ||
    APoperator ||
    APsubAgents ||
    category === 'OPERATION_USER'
      ? [
          {
            label: 'Auto Planner Trips',
            path: 'autoplannertrips',
            component: <AutoPlanner />
          }
        ]
      : [])
  ];

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  useEffect(() => {
    const defaultPath =
      APsuperAdmin ||
      APagent ||
      APoperator ||
      APsubAgents ||
      category === 'OPERATION_USER'
        ? 'autoplannertrips/tours'
        : logistics
        ? 'logistics'
        : deliveryTracking
        ? 'deliverytrackingtrips'
        : 'mytrips';
    const pathUrl = tabLabels.findIndex(tab => location.pathname.includes(tab.path));
    if (location.pathname === '/trips') {
      navigate(`/trips/${defaultPath}`);
    } else {
      setValue(pathUrl.toString());
    }
  }, [location.pathname, navigate, tabLabels]);

  return (
    <>
      {!APsuperAdmin &&
      !APagent &&
      !APoperator &&
      !APsubAgents &&
      category !== 'OPERATION_USER' ? (
        <Box className='trips-management-container'>
          <TabContext value={value}>
            <Box className='tab-context animate__animated animate__slideInRight animate__fast'>
              <Box className='tab-list'>
                {/* Loop function for the tab names: */}
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
                      to={`/trips/${tab.path}`}
                    />
                  ))}
                </TabList>
              </Box>
            </Box>

            <Box sx={{ height: `calc(100vh - 100px) !important` }}>
              {/* Loop function for the tab name components: */}
              {tabLabels.map((tab, index) => (
                <TabPanel key={index} value={index.toString()} className='tab-panel'>
                  {tab.component}
                </TabPanel>
              ))}
            </Box>
          </TabContext>
        </Box>
      ) : (
        <AutoPlanner />
      )}
    </>
  );
}

export default TripsManagement;
