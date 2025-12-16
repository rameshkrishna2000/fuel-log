import { ReactElement } from 'react';
import { IconButton, Tooltip, Zoom, Box } from '@mui/material';
import { Add, Close, Edit, Visibility, Delete } from '@mui/icons-material';
import { Icon } from '@iconify/react';
import './CustomIconButton.scss';

// Type define:
type CustomIconButtonType = {
  readonly category: string;
  readonly disabled?: boolean;
  readonly showTooltip?: boolean;
  readonly onClick?: any;
  size?: 'small' | 'medium' | 'large' | undefined;
};

// Function for custom icon button:
function CustomIconButton({
  category,
  disabled = false,
  showTooltip = true,
  onClick,
  size = 'small',
  ...rest
}: CustomIconButtonType) {
  // Add more icons as needed
  const iconMappings: Record<string, ReactElement | null> = {
    Update: <Edit className='icon' />,
    Edit: <Edit className='update' />,
    Add: <Add className='blue-bg' />,
    CloseValue: <Close className='grey-bg' />,
    Close: <Close />,
    Distance: <Icon icon='bx:trip' className='white-bg big-size' />,
    Radius: <Icon icon='mdi:map-marker-radius-outline' className='white-bg big-size' />,
    MyLocations: <Icon icon='uil:building' className='white-bg big-size' />,
    Menu: <Icon icon='radix-icons:dropdown-menu' className='white-bg' />,
    Driver: <Icon icon='fluent:person-key-20-regular' className='icon' />,
    Mapping: <Icon icon='humbleicons:user-remove' className='remove' />,
    Deactive: <Icon icon='iconamoon:unavailable' className='deactive' />,
    closeView: <Icon icon='el:eye-close' width={22} height={22} />,
    View: <Visibility className='icon' />,
    Active: <Icon icon='teenyicons:tick-small-solid' className='active' />,
    Map: <Icon icon='mdi:map-marker-radius' className='icon' height={25} />,
    Settings: <Icon icon='bi:three-dots-vertical' />,
    Deletes: <Icon icon='ic:outline-delete' className='remove' />,
    Delete: <Delete color='error' />,
    arrowLeft: (
      <Icon
        icon='iconamoon:arrow-left-6-circle-fill'
        width={40}
        height={40}
        color='#c3c3c3'
      />
    ),
    arrowRight: (
      <Icon
        icon='iconamoon:arrow-right-6-circle-fill'
        width={40}
        height={40}
        color='#c3c3c3'
      />
    )
  };

  const icon = iconMappings[category] ?? null;

  return (
    <Tooltip
      arrow
      TransitionComponent={Zoom}
      title={showTooltip ? (category === 'CloseValue' ? 'Close' : category) : ''}
    >
      <Box component={'span'}>
        <IconButton
          size={size}
          className='icon-button'
          disabled={disabled}
          onClick={onClick}
          {...rest}
        >
          {icon}
        </IconButton>
      </Box>
    </Tooltip>
  );
}

export default CustomIconButton;
