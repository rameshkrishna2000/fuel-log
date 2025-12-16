import * as React from 'react';
import * as yup from 'yup';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Box, Grid, Slide, Typography } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CustomButton from '../../../../components/buttons/CustomButton';
import CustomTextField from '../../../../components/customized/customtextfield/CustomTextField';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppDispatch, useAppSelector } from '../../../../../app/redux/hooks';
import { changePassword } from '../../../../redux/reducer/commonSlices/changePasswordSlice';
import './ResetPassword.scss';
import { updateToast } from '../../../../redux/reducer/commonSlices/toastSlice';

// for smooth transition dialog box
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />;
});

interface Props {
  isOpen?: string;
  handleClose?: () => void;
  setIsOpen: React.Dispatch<React.SetStateAction<string>>;
}

interface TextField {
  id: string;
  label: string;
  defaultValue?: string;
  disabled?: boolean;
  field: 'currentPassword' | 'newPassword' | 'confirmNewPassword';
  placeholder: string;
  inputProps?: {
    maxLength?: number;
    style?: React.CSSProperties;
  };
}

function ResetPassword({ isOpen, handleClose, setIsOpen }: Props) {
  const { status, isLoading } = useAppSelector(state => state.changepassword);
  const dispatch = useAppDispatch();

  // validation schema
  const schema = yup.object().shape({
    currentPassword: yup.string().required('Enter Current Password'),
    newPassword: yup
      .string()
      .required('Enter New Password')
      .matches(/[0-9]/, 'Password must contain atleast one number')
      .matches(/[a-z]/, 'Password must contain atleast one lowercase')
      .matches(/[A-Z]/, 'Password must contain atleast one uppercase')
      .matches(/[#?!@$%^&*-]/, 'Password must contain atleast one special character')
      .min(8, 'password should be minimum 8 characters')
      .max(16, 'password should be maximum 16 characters'),
    confirmNewPassword: yup
      .string()
      .required('Enter Confirm New Password')
      .oneOf([yup.ref('newPassword')], `Password must match`)
  });

  // get form validation methods
  const { control, handleSubmit } = useForm({ resolver: yupResolver(schema) });

  const textfield: TextField[] = [
    {
      id: '1',
      label: 'Current Password',
      field: 'currentPassword',
      placeholder: 'Current Password',
      inputProps: { maxLength: 30 }
    },
    {
      id: '2',
      label: 'New Password',
      field: 'newPassword',
      placeholder: 'New Password',
      inputProps: { maxLength: 30 }
    },
    {
      id: '3',
      label: 'Confirm New Password',
      field: 'confirmNewPassword',
      placeholder: 'Confirm New Password',
      inputProps: { maxLength: 30 }
    }
  ];

  const onSubmitPassword = async (params: any) => {
    if (params.currentPassword === params.newPassword) {
      dispatch(
        updateToast({
          show: true,
          message: 'New password cannot be same as current password',
          severity: 'error'
        })
      );
    } else {
      await dispatch(
        changePassword({
          confirmPassword: params.confirmNewPassword,
          newPassword: params.newPassword,
          oldPassword: params.currentPassword
        })
      );
    }
  };

  React.useEffect(() => {
    if (status === 200) {
      setIsOpen('');
    }
  }, [status]);

  React.useEffect(() => {
    setIsOpen('reset');
  }, []);

  return (
    <Dialog
      open={isOpen === 'reset'}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      className='resetDialog'
      TransitionComponent={Transition}
    >
      <Box component='form' onSubmit={handleSubmit(onSubmitPassword)}>
        <DialogContent>
          <Typography paragraph className='resetHead' mb={2}>
            Change Password
          </Typography>
          <Grid container mt={1} sx={{ width: '100%' }}>
            {textfield?.map(items => (
              <Grid key={items.id} item xs={12} mb={2}>
                <CustomTextField
                  id={items.id}
                  label={items.label}
                  type='password'
                  maxlength={16}
                  placeholder={items.placeholder}
                  inputProps={items.inputProps}
                  defaultValue={items.defaultValue}
                  control={control}
                  name={items.field}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ marginBottom: '20px' }}>
          <CustomButton className={'cancel'} onClick={handleClose} category={'Cancel'} />
          <CustomButton
            className={'saveChanges'}
            loading={isLoading}
            type='submit'
            category={'Save'}
          />
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default ResetPassword;
