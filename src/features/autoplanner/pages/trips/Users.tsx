import { TabContext, TabList, TabPanel } from '@mui/lab';
import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../app/redux/hooks';
import { Box, Tab } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import Agents from '../configurations/agents/agents';
import OperationTeam from './OperationTeam';
import './Users.scss';
import { clearUsers } from '../../redux/reducer/autoPlannerSlices/agentslice';
import Roles from '../../../../common/pages/roles/Roles';
interface TabLabel {
  label: string;
  path: string; // full path
  component: JSX.Element;
}

const Users = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { data } = useAppSelector(state => state.auth);
  let roletype = data?.role;
  const APsuperAdmin = roletype === 'ROLE_AUTOPLANNER_ADMIN';
  const APoperator = roletype === 'ROLE_OPERATOR';

  const dispatch = useAppDispatch();
  // define tabs with FULL paths
  const tabLabels: TabLabel[] = [
    ...(APsuperAdmin || APoperator
      ? [
          {
            label: 'Roles',
            path: '/users/roles',
            component: <Roles />
          }
        ]
      : []),
    ...(APsuperAdmin || APoperator
      ? [
          {
            label: 'Operation Team',
            path: '/users/operationteam',
            component: <OperationTeam />
          }
        ]
      : []),
    ...(APsuperAdmin || !APoperator
      ? [
          {
            label: 'Agent',
            path: '/users/company',
            component: <Agents />
          }
        ]
      : [])
  ];

  // find active tab index based on location
  const currentIndex = tabLabels.findIndex(tab => location.pathname.startsWith(tab.path));

  const [value, setValue] = useState(currentIndex !== -1 ? currentIndex.toString() : '0');

  useEffect(() => {
    const idx = tabLabels.findIndex(tab => location.pathname.startsWith(tab.path));
    if (idx !== -1) {
      setValue(idx.toString());
    }
  }, [location.pathname, tabLabels]);

  useEffect(() => {
    if (location.pathname === '/users' && tabLabels.length > 0) {
      navigate(tabLabels[0].path, { replace: true });
    }
  }, [location.pathname, navigate, tabLabels]);

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    dispatch(clearUsers());
    setValue(newValue);
    navigate(tabLabels[parseInt(newValue)].path);
  };

  return (
    <Box className='users-container'>
      <TabContext value={value}>
        <Box className='tab-context animate__animated animate__slideInRight animate__fast'>
          <Box className='tab-list'>
            <TabList
              onChange={handleChange}
              aria-label='users tabs'
              variant='scrollable'
              allowScrollButtonsMobile
            >
              {tabLabels.map((tab, index) => (
                <Tab
                  key={index}
                  className='tab'
                  label={tab.label}
                  value={index.toString()}
                />
              ))}
            </TabList>
          </Box>
        </Box>

        <Box sx={{ height: `calc(100vh - 100px)`, overflow: 'hidden !important' }}>
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

export default Users;
