import React from 'react';
import { Box } from '@mui/material';
import { Icon } from '@iconify/react';
import { useLocation, useNavigate } from 'react-router-dom';

interface DriverDashboardTourViewProps {
  handleManualRefresh: () => void;
  isLoading: boolean;
  refreshLoader: boolean;
  setIsLogout: (value: boolean) => void;
}

const DriverDashboardTourView: React.FC<DriverDashboardTourViewProps> = ({
  handleManualRefresh,
  isLoading,
  refreshLoader,
  setIsLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleFuelNavigate = () => {
    if (
      location?.pathname == '/driver-fuel' ||
      location?.pathname == '/add-driver-fuel'
    ) {
      navigate('/driver-today-trips');
    } else {
      navigate('/driver-fuel');
    }
  };
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      {/* Refresh Button */}
      {location?.pathname == '/driver-today-trips' && (
        <Box
          sx={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '0.5rem',
            p: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '10px'
          }}
          tabIndex={0}
          role='button'
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleManualRefresh();
            }
          }}
          onClick={handleManualRefresh}
        >
          {isLoading && refreshLoader ? (
            <Icon icon='line-md:loading-twotone-loop' width='30' height='30' />
          ) : (
            <Icon icon='bx:refresh' width='30' height='30' />
          )}
        </Box>
      )}

      {/* Fuel Button */}
      <Box
        sx={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '0.5rem',
          p: 1,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '10px'
        }}
        tabIndex={0}
        role='button'
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleFuelNavigate();
          }
        }}
        onClick={handleFuelNavigate}
      >
        <Icon
          icon={
            location?.pathname == '/driver-fuel' ||
            location?.pathname == '/add-driver-fuel'
              ? 'bx:trip'
              : 'lucide:fuel'
          }
          width='30'
          height='30'
        />
      </Box>

      {/* Logout Button */}
      <Box
        sx={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '0.5rem',
          p: 1,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={() => {
          setIsLogout(true);
        }}
        tabIndex={0}
        role='button'
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsLogout(true);
          }
        }}
      >
        <Icon icon='ant-design:logout-outlined' width='30' height='30' />
      </Box>
    </Box>
  );
};

export default DriverDashboardTourView;
