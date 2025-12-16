import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../../../app/config/axiosInstance';
import URLs from '../../../../utils/appURLs';
import { AxiosResponse } from 'axios';
import { updateToast } from './toastSlice';

const serviceContext = import.meta.env.VITE_APP_SERVICE_CONTEXT;

interface GetDataType {
  push_notification_enabled: boolean;
  sms_enabled: boolean;
  email_enabled: boolean;
  over_speed_notification_enabled: boolean;
  geofence_notification_enabled: boolean;
  trips_notification_enabled: boolean;
}

type ThunkArg = {
  timeZone: string | undefined;
  pushNotificationEnabled: boolean | undefined;
  smsEnabled: boolean | undefined;
  emailEnabled: boolean | undefined;
  overSpeedNotificationEnabled: boolean | undefined;
  geofenceNotificationEnabled: boolean | undefined;
  tripsNotificationEnabled: boolean | undefined;
} | null;

interface UserNotificationState {
  isLoading: boolean;
  isLoadingPut: boolean;
  data: GetDataType | any;
  error: string | null;
}

const initialState: UserNotificationState = {
  isLoading: false,
  isLoadingPut: false,
  data: null,
  error: null
};

type ReturnedType = any;

export const userNotificationAction = createAsyncThunk<AxiosResponse<GetDataType[]>, any>(
  'userNotification/get',
  async (data, thunkApi) => {
    const { token, signal } = data;
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${serviceContext}${URLs.GET_USER_NOTIFICATION}?fcmToken=${
          token != undefined ? token : data
        }`,
        signal: signal
      });
      return response?.data;
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

export const putUserNotificationAction = createAsyncThunk<any, any>(
  'userNotification/put',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${serviceContext}${URLs.PUT_USER_NOTIFICATION}`,
        data: data
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: 'Notification settings updated successfully',
          severity: 'success'
        })
      );
      await thunkApi.dispatch(userNotificationAction(data?.fcmToken));
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

const userNotificationSlice = createSlice({
  name: 'userNotificationDetails',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(userNotificationAction.pending, state => {
        state.isLoading = true;
        state.data = {};
        state.error = null;
      })
      .addCase(
        userNotificationAction.fulfilled,
        (state, action: PayloadAction<AxiosResponse>) => {
          state.isLoading = false;
          state.data = action.payload;
          state.error = null;
        }
      )
      .addCase(userNotificationAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.data = {};
        state.error = action.payload.response?.data?.error;
      })
      //put notification
      .addCase(putUserNotificationAction.pending, state => {
        state.isLoadingPut = true;
        state.error = null;
      })
      .addCase(
        putUserNotificationAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoadingPut = false;
          state.data = action.payload.data;
          state.error = null;
        }
      )
      .addCase(putUserNotificationAction.rejected, (state, action: any) => {
        state.isLoadingPut = false;
        state.error = action.payload.response?.data?.error;
      });
  }
});

export default userNotificationSlice.reducer;
