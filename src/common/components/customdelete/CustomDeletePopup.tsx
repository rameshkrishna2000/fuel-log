import { Box, Dialog, Stack, Typography } from '@mui/material';
import CustomButton from '../buttons/CustomButton';
import './CustomDeletePopup.scss';
interface DeletePopupProps {
  open: boolean;
  setOpen?: any;
  handleClose?: any;
  message: string;
  handleDelete?: any;
  isLoading?: any;
}

const CustomDeletePopup = ({
  open,
  setOpen,
  handleClose,
  message,
  handleDelete,
  isLoading
}: DeletePopupProps) => {
  return (
    <Dialog
      open={open}
      className='animate__animated animate__fadeInBottomRight animate__faster delete-container'
      BackdropProps={{
        invisible: true
      }}
    >
      <Box className='delete-content'>
        <Typography>{message}</Typography>

        <Stack className='delete-btn'>
          <Box className='delete-submit'>
            <CustomButton
              className='saveChanges'
              category='Yes'
              onClick={handleDelete}
              loading={isLoading}
            />
          </Box>
          <CustomButton
            className='cancel'
            category='No'
            onClick={() => {
              if (setOpen) setOpen(false);
              if (handleClose) handleClose();
            }}
          />
        </Stack>
      </Box>
    </Dialog>
  );
};

export default CustomDeletePopup;
