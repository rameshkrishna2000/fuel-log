import { Box, Dialog, Stack, Typography } from '@mui/material';
import constants from '../../../utils/constants';
import CustomButton from '../buttons/CustomButton';
import './CustomActivatePopup.scss';
interface ActivatePopupProps {
  open: boolean;
  setOpen: any;
  filteredRow?: any;
  handleDeactivate?: any;
  isLoading?: any;
}

const CustomActivatePopup = ({
  open,
  setOpen,
  filteredRow,
  handleDeactivate,
  isLoading
}: ActivatePopupProps) => {
  return (
    <Dialog
      open={open}
      className='animate__animated animate__fadeInBottomRight animate__faster activate-container'
      BackdropProps={{
        invisible: true
      }}
    >
      <Box className='activate-content'>
        <Typography>
          {filteredRow?.isActive === 0 ? constants.Activate : constants.Deactivate}
        </Typography>

        <Stack className='activate-btn'>
          <Box className='activate-submit'>
            <CustomButton
              className='saveChanges'
              category='Yes'
              onClick={handleDeactivate}
              loading={isLoading}
            />
          </Box>
          <CustomButton
            className='cancel'
            category='No'
            onClick={() => {
              setOpen(false);
            }}
          />
        </Stack>
      </Box>
    </Dialog>
  );
};

export default CustomActivatePopup;
