import { Box, Typography } from '@mui/material';
import tourImg from '../../../../../../../app/assets/images/tour.png';
import './TourSummaryCompleted.scss';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';

const TourSummaryComplete = ({ handleNavigate }: any) => {
  return (
    <Box className='tour-summary-completed'>
      <ul className='circles'>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
      <Box component='img' src={tourImg} className='tour-img' />
      <Box className='typing-text'>
        {/* <Typography className='typing-animation'>
          You will receive a notification once the schedule is complete.
        </Typography> */}
        <CustomButton
          category='View scheduled'
          className='saveChanges'
          onClick={handleNavigate}
          sx={{ width: '300px' }}
        />
      </Box>
    </Box>
  );
};

export default TourSummaryComplete;