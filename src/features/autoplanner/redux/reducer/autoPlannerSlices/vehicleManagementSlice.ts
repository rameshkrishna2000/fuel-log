import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import URLs from '../../../../../utils/appURLs';
import { updateToast } from '../../../../../common/redux/reducer/commonSlices/toastSlice';
import axiosInstance from '../../../../../app/config/axiosInstance';

interface Payload {
  pageNo: number;
  pageSize: number;
}

// Define the structure of the data returned by the API
interface StandardRouteViewList {
  count: number;
  fleetVehicleInfoList?: any;
}

interface Routes {
  status: string;
  data: StandardRouteViewList | null;
  message: string;
}

// Define the shape of the Redux state
interface InitialState {
  isLoading: boolean;
  data: Routes | null;
  error: string | null;
}

const initialState: InitialState = {
  isLoading: false,
  data: null,
  error: null
};

type VechieleWithPage = any;
type ReturnedType = any;

//Action for Vechile Management GET
export const autoVehicleManagementAction = createAsyncThunk<AxiosResponse<any>, Payload>(
  'vehicle manage',
  async (params, thunkApi) => {
    const { pageNo, pageSize } = params;
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.GET_VEHICLE_MANAGEMENT}pageNo=${pageNo}&pageSize=${pageSize}`
      });
      return response?.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

//Action for Update Vechile management
export const vehiclemanageUpdateAction = createAsyncThunk<ReturnedType, VechieleWithPage>(
  'vehicle manage update',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'PATCH',
        url: `${URLs.UPDATE_VEHICLE_MANAGEMENT}vehicleNumber=${data.payload.vehicleNumber}&updateddate=${data.payload.lastServicedDate}`
      });

      await thunkApi.dispatch(
        autoVehicleManagementAction({
          pageNo: data?.pageDetails.pageNo,
          pageSize: data?.pageDetails.pageSize
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
          message: error.response.data?.error,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

//Slice for Vehicle management GET
const vehicleMangementSlice = createSlice({
  name: 'vehicle manage',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(autoVehicleManagementAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(autoVehicleManagementAction.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(autoVehicleManagementAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error;
      });
  }
});

//Slice for vechile management Update
const updateVehiclemanageSlice = createSlice({
  name: 'vehicle manage update',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(vehiclemanageUpdateAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        vehiclemanageUpdateAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload?.data;
          state.error = null;
        }
      )
      .addCase(vehiclemanageUpdateAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

export default vehicleMangementSlice.reducer;
export const updateVechile = updateVehiclemanageSlice.reducer;
