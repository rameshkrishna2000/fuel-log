import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  DialogProps
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import './ConfirmationPopup.scss';
import CustomButton from '../buttons/CustomButton';

interface ConfirmationPopupProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  messages: string[];
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  messages,
  confirmText = 'Yes',
  cancelText = 'No',
  loading = false
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='xs'
      fullWidth
      className='confirmation-popup'
      PaperProps={{ className: 'confirmation-popup__paper' }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(6px)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }}
    >
      <DialogContent className='confirmation-popup__content'>
        <div className='confirmation-popup__icon-wrapper'>
          <ErrorOutlineIcon className='confirmation-popup__icon' />
        </div>
        <Typography className='confirmation-popup__title'>{title}</Typography>
        <div className='confirmation-popup__messages'>
          {messages.map((msg, index) => (
            <div className='confirmation-popup__message' key={index}>
              <span className='confirmation-popup__dot' />
              <Typography className='confirmation-popup__text'>{msg}</Typography>
            </div>
          ))}
        </div>
      </DialogContent>
      <DialogActions className='confirmation-popup__actions'>
        <CustomButton
          category={cancelText}
          variant='outlined'
          className='confirmation-popup__cancel-btn'
          onClick={onClose}
          fullWidth
          size='medium'
        />
        <CustomButton
          category={confirmText}
          variant='contained'
          className='confirmation-popup__confirm-btn'
          onClick={onConfirm}
          loading={loading}
          fullWidth
          size='medium'
        />
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationPopup;
