import { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Box,
  Grid,
  Zoom
} from '@mui/material';
import CustomIconButton from '../buttons/CustomIconButton';
import { Icon } from '@iconify/react';
import './CustomDialogList.scss';

interface CustomDialogListProps {
  open: boolean;
  onClose?: () => void;
  title1: string;
  title2?: string;
  item1: string[];
  item2?: string[];
  type?: string;
  handleViewClose?: () => void;
}

const CustomDialogList = ({
  open,
  onClose,
  title1,
  title2,
  item1,
  item2,
  type
}: CustomDialogListProps) => {
  const endOfListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endOfListRef.current) {
      endOfListRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [item1]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      sx={{ width: 'auto !important' }}
      className='customDialogList  '
      TransitionComponent={props => (
        <Zoom in={true} {...props} timeout={{ enter: 500, exit: 500 }} />
      )}
    >
      <Box className='closeIcon icon-position d-flex' onClick={onClose}>
        <CustomIconButton category='CloseValue' />
      </Box>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6} lg={type === 'geofence' ? 12 : 6}>
            <DialogTitle className='dialogTitle'>{title1}</DialogTitle>
            <Box
              sx={{
                maxHeight: 300,
                overflowY: 'auto'
              }}
            >
              <List
                sx={{
                  display: type === 'geofence' ? 'flex' : 'block',
                  flexWrap: 'wrap',
                  flexDirection: 'column'
                }}
              >
                {item1.map((item, index) => (
                  <ListItem key={index}>
                    <Icon
                      icon='material-symbols-light:front-loader-rounded'
                      style={{ color: '#fa6332', fontSize: '24px', marginRight: '8px' }}
                    />
                    <ListItemText primary={item?.toUpperCase()} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>

          {item2 && (
            <Grid item xs={6}>
              <DialogTitle className='dialogTitle'>{title2}</DialogTitle>
              <Box
                sx={{
                  maxHeight: 300,
                  overflowY: 'auto'
                }}
              >
                <List>
                  {item2.map((item, index) => (
                    <ListItem key={index}>
                      <Icon
                        icon='ph:shipping-container-fill'
                        style={{ color: '#26c55d', fontSize: '24px', marginRight: '8px' }}
                      />
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Grid>
          )}
        </Grid>
        <Box ref={endOfListRef} />
      </DialogContent>
    </Dialog>
  );
};

export default CustomDialogList;
