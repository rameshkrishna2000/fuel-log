import {
  Box,
  Typography,
  Stack,
  FormControlLabel,
  RadioGroup,
  Radio,
  Grid,
  useMediaQuery,
  useTheme
} from '@mui/material';
import CustomButton from '../../../components/buttons/CustomButton';
import { useAppSelector } from '../../../../app/redux/hooks';
import {
  clearView,
  getDefaultView,
  setDefaultView
} from '../../../redux/reducer/commonSlices/defaultViewSlice';
import { useDefaultPageHooks } from './defaultpagehooks/DefaultPageHooks';
import './DefaultPage.scss';
import LoginRedirect from '../../../components/loginredirect/LoginRedirect';

const DefaultPage = () => {
  const { isLoading: setLoading } = useAppSelector(state => state.setDefaultView);
  const { data } = useAppSelector(state => state.getDefaultView);
  const urls = {
    setDefaultView: setDefaultView,
    getDefaultView: getDefaultView,
    clearView: clearView
  };
  const { handleRadioChange, onSubmit, selectedPage } = useDefaultPageHooks(data, urls);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const options = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'livetracking', label: 'Live Tracking' }
  ];

  return (
    <>
      <Box className='defaultview animate__animated animate__slideInRight'>
        {/* 🔹 Reverted header back to original style */}
        <Typography className='profileData' ml={7} mb={2}>
          Default View
        </Typography>

        <Box>
          <RadioGroup
            name='defaultPage'
            value={selectedPage}
            onChange={handleRadioChange}
            className='radioGroup'
          >
            <Grid container spacing={2} direction='column'>
              {options.map((page, index) => (
                <Grid item xs={12} key={index}>
                  <Stack direction='row' className='defaultpage-contain'>
                    <FormControlLabel
                      value={page.id}
                      control={<Radio />}
                      label={page.label}
                      sx={{
                        width: '100%',
                        color: '#3239EA'
                      }}
                    />
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </RadioGroup>

          <Stack direction='row' justifyContent={isMobile ? 'center' : 'flex-end'} mt={4}>
            <CustomButton
              category='Save Default View'
              onClick={onSubmit}
              loading={setLoading}
              className='saveChanges'
            />
          </Stack>
        </Box>
      </Box>
      <LoginRedirect />
    </>
  );
};

export default DefaultPage;
