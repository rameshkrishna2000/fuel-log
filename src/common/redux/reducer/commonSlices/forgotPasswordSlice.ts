import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../../../app/config/axiosInstance';
import URLs from '../../../../utils/appURLs';
import { updateToast } from './toastSlice';

type ReturnedType = any;
type Payload = any;
type ThunkArg = { username: string };

type ForgetResponse = {
  mobile: number;
  OTP: string;
  validTime: string;
  status: string;
};

type initialStateProps = {
  isLoading: boolean;
  data: ForgetResponse | null;
  error: string | null;
};

const initialState: initialStateProps = {
  isLoading: false,
  data: null,
  error: null
};

type otpStateProps = {
  isLoading: boolean;
  data: null | any;
  error: string | null;
};

const otpState: otpStateProps = {
  isLoading: false,
  data: null,
  error: null
};

export const getForgotPassword = createAsyncThunk<ReturnedType, ThunkArg>(
  'user/forgotpassword',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${URLs.FORGET_PASSWORD}${data.username}`
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response.data?.message,
          severity: 'success'
        })
      );
      return response?.data?.data[0];
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

const forgotPasswordSlice = createSlice({
  name: 'forgotpassword',
  initialState,
  reducers: {
    clearForgetPassword: state => {
      state.data = null;
    }
  },
  extraReducers: builder => {
    builder.addCase(getForgotPassword.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(
      getForgotPassword.fulfilled,
      (state, action: PayloadAction<ForgetResponse>) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = '';
      }
    );
    builder.addCase(getForgotPassword.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload.response.data.error || 'Something went wrong!';
    });
  }
});

export const getOTPValid = createAsyncThunk<ReturnedType, Payload>(
  'otpvalidate',
  async (params, thunkApi) => {
    const { userName, category, otp } = params;
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${URLs.OTP_VALIDATION}`,
        data: {
          userName,
          category,
          otp
        }
      });
      response?.status === 200 &&
        thunkApi.dispatch(
          updateToast({
            show: true,
            message: response?.data?.message,
            severity: 'success'
          })
        );
      return response;
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

const otpValidSlice = createSlice({
  name: 'otpvalid',
  initialState: otpState,
  reducers: {
    clearOTP: state => {
      state.data = null;
    }
  },
  extraReducers: builder => {
    builder.addCase(getOTPValid.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(getOTPValid.fulfilled, (state, action: any) => {
      state.isLoading = false;
      state.data = action.payload;
      state.error = '';
    });
    builder.addCase(getOTPValid.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload.response.data.error || 'Something went wrong!';
    });
  }
});

export const otpValidData = otpValidSlice.reducer;
export default forgotPasswordSlice.reducer;
export const { clearForgetPassword } = forgotPasswordSlice.actions;
export const { clearOTP } = otpValidSlice.actions;
