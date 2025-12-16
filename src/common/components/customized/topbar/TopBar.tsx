import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Stack,
  Box,
  Chip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { capitalizeFirstLetter } from '../../../../utils/commonFunctions';

interface TopBarProps {
  name: string;
  role: string;
}

const TopBar: React.FC<TopBarProps> = ({ name, role }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar
      position='static'
      elevation={0}
      sx={{
        height: 48,
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        color: '#111827'
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: '48px !important',
          px: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Chip
          label={role}
          size='small'
          sx={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#374151',
            backgroundColor: '#e5e7eb',
            borderRadius: '6px',
            px: 1
          }}
        />

        <Stack direction='row' alignItems='center' spacing={1}>
          <Box
            sx={{
              p: 0.7,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #d1d5db, #9ca3af)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
            }}
          >
            <PersonIcon
              sx={{
                color: '#fff',
                fontSize: isSmall ? '16px' : '18px'
              }}
            />
          </Box>
          <Typography
            variant={isSmall ? 'body2' : 'subtitle2'}
            noWrap
            sx={{
              maxWidth: isSmall ? 110 : 160,
              color: '#111827',
              fontWeight: 600,
              letterSpacing: '0.2px'
            }}
          >
            {capitalizeFirstLetter(name)}
          </Typography>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
