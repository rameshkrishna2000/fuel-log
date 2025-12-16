import { createAsyncThunk, createSlice, current } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import axiosInstance from '../../../../app/config/axiosInstance';
import URLs from '../../../../utils/appURLs';
import { updateToast } from './toastSlice';

interface Notification {
  id: string;
  notificationId: string;
  userId: string;
  notificationType: string;
  vehicleNumber: string;
  event: string;
  timestamp: number;
  message: string;
  latitude: number;
  longitude: number;
}

interface InitialState {
  isLoading: boolean;
  data: Notification[] | [];
  error: string | null;
  isLoad: boolean;
}

const initialState: InitialState = {
  isLoading: false,
  data: [] as any,
  error: null,
  isLoad: false
};

type ThungArg = number;

export const getNotificationHistory = createAsyncThunk<
  AxiosResponse<Notification[]>,
  any
>('history/notification/get', async (data, thunkApi) => {
  const { count, events, startdate, enddate } = data;
  try {
    let URL = `${URLs.NOTIFICATION_HISTORY}&count=${count}`;

    if (events !== 'All' && startdate && enddate) {
      URL += `&event=${events}&startdate=${startdate}&enddate=${enddate}`;
    } else if (events !== 'All') {
      URL += `&event=${events}`;
    } else if (events === 'All' && startdate && enddate) {
      URL += `&startdate=${startdate}&enddate=${enddate}`;
    }

    const response = await axiosInstance({
      method: 'GET',
      url: URL
    });
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
});

const notificationHistorySlice = createSlice({
  name: 'notificationHistory',
  initialState,
  reducers: {
    clearNotification: state => {
      state.data = [];
    },
    activeDatas: (state, action) => {
      state.data = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getNotificationHistory.pending, state => {
        state.isLoading = true;
        state.data = current(state).data;
        state.error = null;
      })
      .addCase(getNotificationHistory.fulfilled, (state, action: any) => {
        if (
          current(state)
            .data?.map((item: any) => item.active)
            .includes(true)
        ) {
          let newResponse: any = [];
          action?.payload?.data?.data?.forEach((newValue: any, index: number) => {
            let activeNotification = current(state).data?.find(
              (item: any) => item.active
            );
            let { id, active, ...rest }: any = activeNotification;

            if (JSON.stringify(rest) === JSON.stringify(newValue)) {
              newResponse = [
                ...newResponse,
                { ...newValue, id: index + 1, active: true }
              ];
            } else {
              newResponse = [
                ...newResponse,
                { ...newValue, id: index + 1, active: false }
              ];
            }
          });
          state.data = newResponse;
        } else {
          state.data = action.payload?.data?.data?.map((value: any, index: number) => ({
            ...value,
            id: index + 1,
            active: false
          }));
        }
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getNotificationHistory.rejected, (state, action: any) => {
        state.isLoading = false;
        state.data = [];
        state.error = action.error.message || 'Somthing went wrong';
      });
  }
});
export const getNotificationAutoPlanner = createAsyncThunk<
  AxiosResponse<Notification[]>,
  ThungArg
>('autoplanner/notification/get', async (date, thunkApi) => {
  try {
    const response = await axiosInstance({
      method: 'GET',
      url: `${URLs.AUTOPLANNER_NOTIFICATION}${date}`
    });
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
});

const notificationAutoPlannerSlice = createSlice({
  name: 'notificationAutoPlanner',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getNotificationAutoPlanner.pending, state => {
        state.isLoading = true;
        state.data = [];
        state.error = null;
      })
      .addCase(getNotificationAutoPlanner.fulfilled, (state, action: any) => {
        let data = current(state).data;
        let [newData] = [...data, action.payload?.data?.data];
        state.isLoading = false;
        state.data = newData;
        state.error = null;
      })
      .addCase(getNotificationAutoPlanner.rejected, (state, action: any) => {
        state.isLoading = false;
        state.data = [];
        state.error = action.error.message || 'Somthing went wrong';
      });
  }
});

export const notificationAutoPlannerReducer = notificationAutoPlannerSlice.reducer;
export const { clearNotification, activeDatas } = notificationHistorySlice.actions;
export default notificationHistorySlice.reducer;
