import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  styled,
  keyframes
} from '@mui/material';
import {
  Error as ErrorIcon,
  Close as CloseIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import { updateData } from '../../../../../../common/redux/reducer/commonSlices/websocketSlice';

// Keyframes for animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleUp = keyframes`
  from {
    transform: scale(0.95);
  }
  to {
    transform: scale(1);
  }
`;

// Styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    maxWidth: 600,
    width: '100%',
    boxShadow: theme.shadows[10],
    animation: `${fadeIn} 0.3s ease-out, ${scaleUp} 0.3s ease-out`,
    background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.grey[100]})`
  }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: `linear-gradient(145deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
  color: theme.palette.error.contrastText,
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  borderRadius: '16px 16px 0 0',
  boxShadow: theme.shadows[2],
  '& .MuiIconButton-root': {
    marginLeft: 'auto',
    color: theme.palette.error.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.error.dark
    }
  }
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  background: theme.palette.background.paper,
  borderRadius: 8,
  border: '1px solid #ccc'
}));

const StyledErrorIcon = styled(ErrorIcon)(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: '1.5rem'
}));

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  errors: any;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ isOpen, onClose, errors }) => {
  const dispatch = useAppDispatch();

  const { connection } = useAppSelector(state => state.websocket);

  useEffect(() => {
    dispatch(updateData({ progress: 'FAILED', date: 'Loading', action: 'ExcelUpload' }));
    if (connection) connection.close();
  }, [isOpen]);

  return (
    <StyledDialog
      open={isOpen}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      TransitionProps={{
        timeout: 300
      }}
    >
      <StyledDialogTitle>
        <WarningIcon sx={{ mr: 1, fontSize: '1.8rem' }} />
        <Typography variant='h6' component='div' sx={{ fontWeight: 600 }}>
          Validation Errors
        </Typography>
        <IconButton aria-label='close' onClick={onClose} size='small'>
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2, px: 3 }}>
        <Typography
          sx={{ mb: 2, mt: 2, fontWeight: 600, fontSize: '15px', color: '#9f9e9e' }}
        >
          Please correct the following issues and try again
        </Typography>
        <List>
          {errors?.invalidExcelRows?.length > 0 &&
            errors?.invalidExcelRows?.map((error: any, index: any) => (
              <StyledListItem key={index}>
                <ListItemIcon sx={{ minWidth: '40px !important' }}>
                  <StyledErrorIcon sx={{ color: '#ff5f5f' }} />
                </ListItemIcon>
                <ListItemText
                  primary={error}
                  primaryTypographyProps={{
                    style: {
                      fontWeight: 500,
                      fontFamily: 'inter',
                      color: '#555'
                    }
                  }}
                />
              </StyledListItem>
            ))}
        </List>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button
          variant='contained'
          onClick={onClose}
          color='error'
          sx={{
            borderRadius: 8,
            textTransform: 'none',
            px: 4,
            fontWeight: 600,
            boxShadow: theme => theme.shadows[2],
            '&:hover': {
              backgroundColor: theme => theme.palette.error.dark,
              boxShadow: theme => theme.shadows[4]
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default ErrorDialog;
