import { Box, Grid, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import constant from '../../../../../utils/constants';
import { useDynamicYupSchema } from '../../../../hooks/useDynamicSchema';
import { useChangePasswordHooks } from './hooks/ChangePasswordHooks';
import CustomTextField from '../../../../components/customized/customtextfield/CustomTextField';
import CustomButton from '../../../../components/buttons/CustomButton';
import { ChangePasswordData } from './ChangePasswordDatas/ChangePasswordData';
import { changePassword } from '../../../../redux/reducer/commonSlices/changePasswordSlice';
import { getMyProfileAction } from '../../../../redux/reducer/commonSlices/myProfileSlice';
import './ChangePassword.scss';
import { useAppSelector } from '../../../../../app/redux/hooks';
import LoginRedirect from '../../../../components/loginredirect/LoginRedirect';

interface handleClose {
  handleClose?: () => void;
}

const ChangePassword = ({ handleClose }: handleClose) => {
  const { isLoading } = useAppSelector(state => state.changepassword);
  const { createFormFields } = useDynamicYupSchema(null);

  const urls = {
    changePassword: changePassword,
    getProfile: getMyProfileAction
  };

  const { control, setValue, handleSubmit } = useForm({
    resolver: async (data: any, context: any, options: any) => {
      const { schema }: any = createFormFields(ChangePasswordData(data));
      return yupResolver(schema)(data, context, options);
    }
  });

  const { onSubmit } = useChangePasswordHooks({
    setValue,
    handleClose,
    urls
  });

  return (
    <>
      <Box className='change-password animate__animated animate__slideInRight'>
        <Stack component='form' justifyContent='flex-start' pl={3} direction='row'>
          <Grid container mt={1} sx={{ width: '50%' }}>
            <Typography
              className='profileData'
              mb={2}
              ml={1}
              mt={-5}
              sx={{ textAlign: 'start' }}
            >
              {constant.ChangePassword}
            </Typography>
            {ChangePasswordData(null)?.map(items => (
              <Grid key={items.id} item xs={12} sm={12} mb={1} sx={{ padding: '0 10px' }}>
                {items.type === 'string' && (
                  <CustomTextField
                    id={items.id}
                    label={items.label}
                    placeholder={items.placeholder}
                    inputProps={items.inputProps}
                    control={control}
                    name={items.name}
                    type={'password'}
                  />
                )}
              </Grid>
            ))}
            <Stack
              direction='row'
              width='100%'
              spacing={2}
              sx={{
                display: 'flex',
                justifyContent: { xs: 'center', sm: 'flex-end' }
              }}
            >
              <CustomButton
                category='Save'
                className='saveChanges'
                loading={isLoading}
                onClick={handleSubmit(onSubmit)}
              />
            </Stack>
          </Grid>
        </Stack>
      </Box>
      <LoginRedirect />
    </>
  );
};

export default ChangePassword;
