import React from 'react';
import { Tooltip, Typography, Box } from '@mui/material';
import { Icon } from '@iconify/react';

interface CustomTooltipProps {
  content: string;
  icon?: string;
  iconSize?: number;
  placement?: 'bottom' | 'top' | 'left' | 'right';
  color?: any;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  content,
  icon = 'mdi:information-outline',
  iconSize = 20,
  placement = 'bottom',
  color = 'black'
}) => {
  return (
    <Tooltip
      title={
        <Typography
          sx={{
            color: '#333',
            fontSize: '13px',
            fontWeight: 400,
            lineHeight: 1.5,
            fontFamily: 'Roboto, sans-serif',
            padding: '8px'
          }}
        >
          {content}
        </Typography>
      }
      arrow
      placement={placement}
      enterDelay={200}
      leaveDelay={100}
      PopperProps={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8]
            }
          }
        ]
      }}
      slotProps={{
        popper: {
          sx: {
            '& .MuiTooltip-tooltip': {
              backgroundColor: '#fff',
              color: '#333',
              boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
              borderRadius: '8px',
              padding: '8px 12px',
              // maxWidth: 220,
              border: `1px solid ${color ? color : '#cce5ff'}`
            },
            '& .MuiTooltip-arrow': {
              color: '#fff',
              '&::before': {
                border: `1px solid ${color ? color : '#cce5ff'}`
              }
            }
          }
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <Icon icon={icon} width={iconSize} height={iconSize} color={color} />
      </Box>
    </Tooltip>
  );
};

export default CustomTooltip;
