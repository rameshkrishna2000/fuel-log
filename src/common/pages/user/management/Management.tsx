import { Box, Tab } from '@mui/material';
import { SyntheticEvent, useEffect, useState } from 'react';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Management.scss';
import Reports from '../reports/Reports';

interface TabLabel {
  label: string;
  path: string;
  component: JSX.Element;
}

// Function for the management component:
function Management() {
  const location = useLocation();
  const navigate = useNavigate();
  const [value, setValue] = useState<string>('0');
  const role = localStorage.getItem('role');
  const tabLabels: TabLabel[] = [
    { label: 'Reports', path: 'reports', component: <Reports /> }
  ];

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  useEffect(() => {
    const defaultPath =
      role === 'ROLE_LOGISTICS_ADMIN' ? 'vehicle-config-manager' : 'reports';
    const pathUrl = tabLabels.findIndex(tab => location.pathname.includes(tab.path));
    if (location.pathname === '/management') {
      navigate(`/management/${defaultPath}`);
    } else {
      setValue(pathUrl.toString());
    }
  }, [location.pathname, navigate, tabLabels]);

  return (
    <Box className='management-container'>
      <TabContext value={value}>
        <Box className='tab-context  animate__animated animate__slideInRight animate__fast'>
          <Box className='tab-list '>
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
                  className='tab '
                  label={tab.label}
                  value={index.toString()}
                  component={Link}
                  to={`/management/${tab.path}`}
                />
              ))}
            </TabList>
          </Box>
        </Box>

        <Box sx={{ height: `calc(100vh - 100px) !important`, overflowX: 'hidden' }}>
          {/* Loop function for the tab name components: */}
          {tabLabels.map((tab, index) => (
            <TabPanel sx={{ paddingTop: 0 }} key={index} value={index.toString()}>
              {tab.component}
            </TabPanel>
          ))}
        </Box>
      </TabContext>
    </Box>
  );
}

export default Management;
