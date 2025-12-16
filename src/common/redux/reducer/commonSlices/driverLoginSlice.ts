import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../../../app/config/axiosInstance';
import URLs from '../../../../utils/appURLs';
import { updateToast } from './toastSlice';

type ReturnedType = any;

type initialStateProps = {
  isLoading: boolean;
  data: null;
  error: string | null;
  status: null;
};

const initialState: initialStateProps = {
  isLoading: false,
  data: null,
  error: null,
  status: null
};

//Actions for Driever OTP
export const getOTP = createAsyncThunk<ReturnedType, any>(
  'otp',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${URLs.DRIVER_OTP}mobileNumber=${encodeURIComponent(data.mobileNumber)}`,
        data
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response.data?.message,
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

//Slice for Driver OTP
const otpSlice = createSlice({
  name: 'otp generate',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getOTP.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(getOTP.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.data = action.payload;
      state.error = '';
    });
    builder.addCase(getOTP.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action?.payload?.response?.data?.error || 'Network error';
    });
  }
});

//Actions for Driever OTP login
export const getOTPlogin = createAsyncThunk<ReturnedType, any>(
  'otp/login',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${URLs.DRIVER_OTP_LOGIN}`,
        data
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

//Slice for Driver OTP login
const otpLoginSlice = createSlice({
  name: 'OTPlogin',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getOTPlogin.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(getOTPlogin.fulfilled, (state, action: PayloadAction<any>) => {
      let { token, expiresIn, defaultView, role }: any = action.payload;
      localStorage.setItem('token', token);
      localStorage.setItem('defaultView', defaultView);
      localStorage.setItem('role', role);
      localStorage.setItem('expiresIn', expiresIn?.toString());
      state.isLoading = false;
      state.data = action.payload;
      state.error = '';
    });
    builder.addCase(getOTPlogin.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action?.payload?.response?.data?.error || 'Network error';
    });
  }
});

//action for driver logout
export const driverLogout = createAsyncThunk<ReturnedType, any>(
  'driver/logout',
  async (data, thunkApi) => {
    const { fireBaseToken } = data;
    try {
      const response: any = await axiosInstance({
        method: 'POST',
        url: `${URLs.DRIVER_LOGOUT}?fireBaseToken=${fireBaseToken}`,
        data
      });
      return response;
    } catch (error) {
      thunkApi.rejectWithValue(error);
    }
  }
);

//slice for driver logout
const addLogoutSlice = createSlice({
  name: 'driverLogout',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(driverLogout.pending, state => {
        state.isLoading = true;
        state.data = null;
      })
      .addCase(driverLogout.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(driverLogout.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.error.message || 'Something went wrong';
      });
  }
});

export const driverOTP = otpSlice.reducer;
export const driverOTPlogin = otpLoginSlice.reducer;
