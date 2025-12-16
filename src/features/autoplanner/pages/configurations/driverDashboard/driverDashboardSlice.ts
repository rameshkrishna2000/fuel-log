import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import axiosInstance from '../../../../../app/config/axiosInstance';
import URLs from '../../../../../utils/appURLs';
import { updateToast } from '../../../../../common/redux/reducer/commonSlices/toastSlice';

type ReturnedType = any;

const initialStates: any = {
  isLoading: false,
  data: null,
  error: null
};

const initialStateDropDown = {
  isLoading: false,
  data: null,
  error: null
};

//GET driver dashboard Action
export const getDriverDashboard = createAsyncThunk<AxiosResponse<any>, any>(
  'driverDashboard/getDriverDashboard',
  async (data, thunkApi) => {
    const { driverID, autoplannerID } = data;
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.DRIVER_DASHBOARD}driverId=${encodeURIComponent(
          driverID
        )}&autoplannerId=${autoplannerID}`
      });
      return response?.data;
    } catch (error: any) {
      if (error?.message !== 'canceled') return thunkApi.rejectWithValue(error);
    }
  }
);

// Slice for Driver Dashboard
const driverDashboardSlice = createSlice({
  name: 'driverDashboard',
  initialState: initialStates,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getDriverDashboard.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDriverDashboard.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action.payload?.data;
        state.error = null;
      })
      .addCase(getDriverDashboard.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error;
      });
  }
});

//Action for Update trip
export const driverTripUpdateAction = createAsyncThunk<ReturnedType, any>(
  'driverTripUpdate',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `${URLs.DRIVER_DASHBOARD_UPDATE}`,
        data
      });
      return response?.data;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data?.message
            ? error?.response?.data?.message
            : error.response.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

// slice for trip Update
const tripUpdateSlice = createSlice({
  name: 'drivertripUpdate',
  initialState: initialStateDropDown,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(driverTripUpdateAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        driverTripUpdateAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action?.payload?.data;
          state.error = null;
        }
      )
      .addCase(driverTripUpdateAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error;
      });
  }
});

export const dashboardDriver = driverDashboardSlice.reducer;
export const tripUpdate = tripUpdateSlice.reducer;
