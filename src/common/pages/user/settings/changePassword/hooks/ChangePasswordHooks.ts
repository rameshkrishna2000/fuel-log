import { useEffect } from 'react';
import { useAppDispatch } from '../../../../../../app/redux/hooks';
import { useAbort } from '../../../../../../utils/commonFunctions';
import { updateToast } from '../../../../../redux/reducer/commonSlices/toastSlice';

export const useChangePasswordHooks = ({ setValue, handleClose, urls }: any) => {
  const createAbort = useAbort();
  const dispatch = useAppDispatch();

  const onSubmit = async (params: any) => {
    try {
      const res = await dispatch(urls.changePassword(params));
      if (res?.meta?.requestStatus === 'fulfilled') {
        dispatch(
          updateToast({
            show: true,
            message: 'Password changed successfully.',
            severity: 'success'
          })
        );
      }
      setValue('oldPassword', '');
      setValue('newPassword', '');
      setValue('confirmPassword', '');
    } catch (error) {
      dispatch(
        updateToast({
          show: true,
          message: 'Failed to update notification settings',
          severity: 'error'
        })
      );
    }
  };

  useEffect(() => {
    dispatch(urls.getProfile(createAbort().abortCall.signal));

    return () => {
      createAbort().abortCall.abort();
    };
  }, []);

  return { onSubmit };
};
