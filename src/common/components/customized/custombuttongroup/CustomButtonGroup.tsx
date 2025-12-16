import { useRef, useState } from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import './CustomButtonGroup.scss';
import { LoadingButton } from '@mui/lab';
import './CustomButtonGroup.scss';

// Type define:
type CustomButtonGroupType = {
  readonly options: any;
  readonly handleClick?: any;
  readonly className?: string;
  readonly load?: boolean;
  label?: string;
  size?: 'large' | 'medium' | 'small' | undefined;
};

function CustomButtonGroup({
  options,
  handleClick,
  load,
  label,
  size = 'small'
}: CustomButtonGroupType) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleMenuItemClick = (index: number, value: string) => {
    setSelectedIndex(index);
    handleClick(value);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (anchorRef?.current && anchorRef?.current.contains(event.target as HTMLElement)) {
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <ButtonGroup
        className='group-container'
        sx={{
          width: '100px',
          height: label === 'download' ? '36px' : '30px',
          '& .MuiButton-root': {
            height: label === 'download' ? '36px' : '30px'
          },
          '& .MuiButton-root:hover': {
            height: label === 'download' ? '36px' : '30px'
          }
        }}
        variant='outlined'
        ref={anchorRef}
        aria-label='split button'
      >
        <Button
          size={size}
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label='select merge strategy'
          aria-haspopup='menu'
          onClick={handleToggle}
          className='group-item'
        >
          <LoadingButton loading={load} className='group-item custom-button-label'>
            {label}
          </LoadingButton>
        </Button>
      </ButtonGroup>
      <Popper
        sx={{
          zIndex: 1
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id='split-button-menu' autoFocusItem>
                  {options.map((option: any, index: any) => (
                    <MenuItem
                      key={option.value ?? index}
                      selected={index === selectedIndex}
                      onClick={() => handleMenuItemClick(index, option.value)}
                    >
                      {option.icon} {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

export default CustomButtonGroup;
