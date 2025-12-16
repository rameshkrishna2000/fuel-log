import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../../../app/config/axiosInstance';
import URLs from '../../../../utils/appURLs';
import { updateToast } from './toastSlice';

const serviceContext = import.meta.env.VITE_APP_SERVICE_CONTEXT;

type ReturnedType = any;
type ThunkArg = { userID: string; confirmPassword: string; password: string };

type initialStateProps = {
  isLoading: boolean;
  data: string | null;
  error: string | null;
};

const initialState: initialStateProps = {
  isLoading: false,
  data: null,
  error: null
};

export const getResetPassword = createAsyncThunk<ReturnedType, ThunkArg>(
  'user/resetpassword',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `${serviceContext}${URLs.RESET_PASSWORD}`,
        data
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response.data?.message,
          severity: 'success'
        })
      );
      return response?.data?.message;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

const resetPasswordSlice = createSlice({
  name: 'resetpassword',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getResetPassword.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(
      getResetPassword.fulfilled,
      (state, action: PayloadAction<ReturnedType>) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = '';
        window.location.replace('/login');
      }
    );
    builder.addCase(getResetPassword.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload.response.data.message || 'Something went wrong!';
    });
  }
});

export default resetPasswordSlice.reducer;
