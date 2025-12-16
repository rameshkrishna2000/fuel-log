import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import URLs from '../../../../utils/appURLs';
import { updateToast } from './toastSlice';
import axiosInstance from '../../../../app/config/axiosInstance';

const serviceContext = import.meta.env.VITE_APP_SERVICE_CONTEXT;

type ReturnedType = any;
type ThunkArg = { confirmPassword: string; newPassword: string; oldPassword: string };

type initialStateProps = {
  isLoading: boolean;
  data: string | null;
  error: string | null;
  status: number | null;
};

const initialState: initialStateProps = {
  isLoading: false,
  data: null,
  error: null,
  status: null
};

export const changePassword = createAsyncThunk<ReturnedType, ThunkArg>(
  'user/changepassword',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `${serviceContext}${URLs.CHANGE_PASSWORD}`,
        data
      });
      // thunkApi.dispatch(
      //   updateToast({
      //     show: true,
      //     message: response?.data?.message,
      //     severity: 'success'
      //   })
      // );
      return response;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error.response.data?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

const changePasswordSlice = createSlice({
  name: 'changepassword',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(changePassword.pending, state => {
      state.isLoading = true;
      state.error = null;
      state.data = null;
    });
    builder.addCase(
      changePassword.fulfilled,
      (state, action: PayloadAction<ReturnedType>) => {
        state.isLoading = false;
        state.data = action.payload.data?.message;
        state.status = action.payload.status;
        state.error = '';
      }
    );
    builder.addCase(changePassword.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload.response.data?.error;
      state.status = action.payload.response?.status;
    });
  }
});

export default changePasswordSlice.reducer;
