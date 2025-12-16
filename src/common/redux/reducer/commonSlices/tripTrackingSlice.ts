import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { updateToast } from './toastSlice';
import URLs from '../../../../utils/appURLs';
import axiosInstance from '../../../../app/config/axiosInstance';

type ReturnedType = any;

type TrackThunkArg = {
  tripId?: string;
  journeyId?: string;
  uniqueId?: string;
  date?: string;
};

interface TripData {
  source: string;
  destination: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  tourName: string;
  startTimeStamp: number;
  vehicleNumber: string;
  agentName: string;
  driverContactNumber: string;
  driverName: string;
  driverRating: number;
  duration: number;
  distance: number;
  token: string;
  estimatedArrival: string;
  currentLocation: string;
  progress: number;
  message: string;
}

interface Data {
  data: TripData;
}

interface InitialStates {
  isLoading: boolean;
  data: Data | null;
  error: any;
}

const initialState = {
  isLoading: false,
  data: [],
  error: null
};

const initialStates: InitialStates = {
  isLoading: false,
  data: null,
  error: null
};

export const tripTrackingAction = createAsyncThunk<ReturnedType, TrackThunkArg>(
  'triptracking',
  async ({ tripId }, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.Trip_Tracking}tripId=${tripId}`
      });
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
          message: error?.response?.data?.error,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const liveTrackingAction = createAsyncThunk<ReturnedType, TrackThunkArg>(
  'live tracking',
  async ({ journeyId }, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.LIVE_TRACKING}id=${journeyId}`
      });
      return response;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data?.error,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const transportReachedAction = createAsyncThunk<ReturnedType, TrackThunkArg>(
  'transport Reached',
  async ({ uniqueId, date }, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `${URLs.TRIP_END}uniqueId=${uniqueId}&tripDate=${date}`
      });
      return response;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data?.error,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

// share trips slice
const tripTrackingSlice = createSlice({
  name: 'share trips',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(tripTrackingAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        tripTrackingAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload?.data;
          state.error = null;
        }
      )
      .addCase(tripTrackingAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

// live tracking trips slice
const liveTrackingSlice = createSlice({
  name: 'live tracking trips',
  initialState: initialStates,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(liveTrackingAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        liveTrackingAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload?.data;
          state.error = null;
        }
      )
      .addCase(liveTrackingAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

// transport Reached trips slice
const transportReachedSlice = createSlice({
  name: 'transport Reached',
  initialState: initialStates,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(transportReachedAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        transportReachedAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload?.data;
          state.error = null;
        }
      )
      .addCase(transportReachedAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

export const tripTracking = tripTrackingSlice.reducer;
export const liveTracking = liveTrackingSlice.reducer;
export const transportReached = transportReachedSlice.reducer;
