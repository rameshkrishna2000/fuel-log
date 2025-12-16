import { Box, Dialog, Typography } from '@mui/material';
import CustomTextField from '../../../../../common/components/customized/customtextfield/CustomTextField';
import CustomButton from '../../../../../common/components/buttons/CustomButton';
import CustomSelect from '../../../../../common/components/customized/customselect/CustomSelect';
import { useAppSelector } from '../../../../../app/redux/hooks';

const ReportMail = ({
  drawer,
  mailSubmit,
  mailReset,
  sendMail,
  mailControl,
  documentOption,
  setDrawer,
  mailLoad
}: any) => {
  const role = localStorage.getItem('role');
  const { isLoading: mailLoading } = useAppSelector((state: any) => state.autoPDFExcel);
  return (
    <Dialog open={drawer} component={'form'} onSubmit={mailSubmit(sendMail)}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: '5%',
          width: '500px'
        }}
      >
        <Typography sx={{ fontWeight: 700, paddingBottom: '3%' }}>Send Mail</Typography>

        <Box>
          <Box sx={{ marginBottom: '2%' }}>
            <CustomTextField
              control={mailControl}
              name={'email'}
              id={'e-mail'}
              label='Email ID'
              placeholder='Email id'
            />
          </Box>

          <Box>
            <CustomSelect
              id={'document'}
              options={documentOption}
              control={mailControl}
              name='document'
              label='Document Type'
              placeholder='Document type'
            />
          </Box>
          <Box sx={{ marginTop: '5%', display: 'flex', gap: '15px' }}>
            <CustomButton
              className='saveChanges'
              category={'Send Mail'}
              type='submit'
              loading={mailLoading && mailLoad}
            />
            <CustomButton
              className='cancel'
              category='Cancel'
              variant='outlined'
              onClick={() => {
                setDrawer(false);
                mailReset();
              }}
            />
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ReportMail;
