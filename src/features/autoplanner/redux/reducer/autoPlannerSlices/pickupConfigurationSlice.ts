import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import URLs from '../../../../../utils/appURLs';
import { updateToast } from '../../../../../common/redux/reducer/commonSlices/toastSlice';
import axiosInstance from '../../../../../app/config/axiosInstance';

type ReturnedType = any;

// Define the structure of the data returned by the API
interface PickUpLocations {
  count: number;
  pickupHotelViewList?: any;
}

interface Locations {
  status: string;
  data: PickUpLocations | null;
  message: string;
}

// Define the shape of the Redux state
interface InitialState {
  isLoading: boolean;
  data: Locations | null;
  error: string | null;
}

const initialState: InitialState = {
  isLoading: false,
  data: null,
  error: null
};

const initialStateRoute = {
  isLoading: false,
  data: null,
  error: null
};

// get pickup location details
export const getPickupLocationAction = createAsyncThunk<AxiosResponse<any>, any>(
  'pickupLocation',
  async (params, thunkApi) => {
    const { pageNo, pageSize, location: pickupLocationAddress } = params;
    const queryParams: Record<string, string | number | boolean | undefined> = {
      pageNo,
      pageSize,
      pickupLocationAddress
    };

    const filteredParams = Object.entries(queryParams)
      .filter(([key, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.PICKUP_CONFIGURATION}?${filteredParams}`
      });
      return response?.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

// Action function to update pickup configure
export const pickupConfigureUpdateAction = createAsyncThunk<ReturnedType, any>(
  'pickup update',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `${URLs.PICKUP_CONFIGURATION}`,
        data: data.updatedObject
      });
      await thunkApi.dispatch(
        getPickupLocationAction({
          pageNo: data?.getPayload.pageNo,
          pageSize: data?.getPayload.pageSize,
          location: data?.getPayload.location
        })
      );
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response?.data?.data[0];
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error.response.data?.message || error.response.data?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

// pickup location configure details slice
const pickupLocationSlice = createSlice({
  name: 'pickup location',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getPickupLocationAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPickupLocationAction.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getPickupLocationAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error;
      });
  }
});

// Update pickup configure
const updatePickupConfigureSlice = createSlice({
  name: 'pickup update',
  initialState: initialStateRoute,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(pickupConfigureUpdateAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        pickupConfigureUpdateAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload?.data;
          state.error = null;
        }
      )
      .addCase(pickupConfigureUpdateAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

export const pickupLocation = pickupLocationSlice.reducer;
export const updatePickupConfigure = updatePickupConfigureSlice.reducer;
