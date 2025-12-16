import { createAsyncThunk, createSlice, current, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../../../app/config/axiosInstance';
import URLs from '../../../../utils/appURLs';
import { updateToast } from './toastSlice';

const serviceContext = import.meta.env.VITE_APP_SERVICE_CONTEXT;

interface Data {
  userName: string;
  displayName: string;
  email: string;
  mobileNumber: number;
  dateOfBirth: string;
  timezone: string;
}

interface initialState {
  isLoading: boolean;
  data: Data | null;
  error: any;
}

const initialState = {
  isLoading: false,
  data: null,
  error: null
};

const initialStates: initialState = {
  isLoading: false,
  data: null,
  error: null
};

type ThunkArg = {
  displayName: string;
  userName: string;
  overSpeed: number;
  mobileNumber: number;
  email: string;
  dateOfBirth: any;
  userBio: string;
} | null;

type ReturnedType = any;

// Action function to get my profile details:
export const getMyProfileAction = createAsyncThunk<ReturnedType, any>(
  'myProfile/get',
  async (signal, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${serviceContext}${URLs.GET_MY_PROFILE}`,
        signal: signal
      });
      return response;
    } catch (error: any) {
      if (error?.message !== 'canceled') {
        thunkApi.dispatch(
          updateToast({
            show: true,
            message: error?.response?.data?.message,
            severity: 'error'
          })
        );
      }
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const putMyProfileAction = createAsyncThunk<ReturnedType, ThunkArg>(
  'MyProfileAction/put',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `${serviceContext}${URLs.PUT_MY_PROFILE}`,
        data: data
      });
      if (response?.status === 200)
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

// Function my profile details:
const myProfileSlice = createSlice({
  name: 'myProfileDetails',
  initialState: initialStates,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getMyProfileAction.pending, state => {
        state.isLoading = true;
        // state.data = null;
        state.error = null;
      })
      .addCase(getMyProfileAction.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action.payload?.data?.data;
        state.error = null;
      })
      .addCase(getMyProfileAction.rejected, (state, action: any) => {
        state.isLoading = false;
        // state.data = null;
        state.error = action.error.message || 'Somthing went wrong';
      })
      .addCase(putMyProfileAction.pending, state => {
        state.isLoading = true;
        state.data = current(state).data;
        state.error = null;
      })
      .addCase(
        putMyProfileAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload.data;
          state.error = null;
        }
      )
      .addCase(putMyProfileAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.data = current(state).data;
        state.error = action.payload.response?.data?.error;
      });
  }
});

export default myProfileSlice.reducer;
