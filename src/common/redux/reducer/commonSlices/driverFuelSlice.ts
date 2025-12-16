import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../../../app/config/axiosInstance';
import { updateToast } from './toastSlice';
import URLs from '../../../../utils/appURLs';
import { capitalize } from 'lodash';
import { capitalizeFirstLetter } from '../../../../utils/commonFunctions';

type InitialStateProps = {
  isLoading: boolean;
  data: any;
  dataMetric?: any;
  error: string | null;
  count: number;
};

const initialState: InitialStateProps = {
  isLoading: false,
  data: null,
  dataMetric: null,
  count: 0,
  error: null
};

// add driver fuel action
export const addDriverFuel = createAsyncThunk<any, any>(
  'api/addDriverFuel',
  async (data, thunkApi) => {
    const { payload } = data;
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${URLs.ADD_UPDATE_DRIVER_FUEL}`,
        headers: { 'Content-Type': 'multipart/form-data' },
        data: payload
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response.data;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data
            ? error?.response?.data?.message
            : error?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

// add driver fuel slice
const addDriverFuelSlice = createSlice({
  name: 'addDriverFuel',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(addDriverFuel.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(addDriverFuel.fulfilled, (state, action: any) => {
      state.data = action.payload?.data;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(addDriverFuel.rejected, (state, action) => {
      state.error = action.error.message || 'Something went wrong';
      state.isLoading = false;
    });
  }
});

// get all fuel type action
export const getFuelType = createAsyncThunk<any, any>(
  'api/getFuelType',
  async (data, thunkApi) => {
    const { pageNo, pageSize, search, sortBy, sortByDirection } = data;
    try {
      let url = `${URLs.GET_FUEL_TYPE}?pageNo=${pageNo}&pageSize=${pageSize}`;
      if (search) {
        url += `&search=${search}`;
      }
      if (sortBy && sortByDirection) {
        url += `&sortBy=${sortBy}&sortByDirection=${sortByDirection}`;
      }
      const response = await axiosInstance({
        method: 'GET',
        url: url
      });
      return response?.data?.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

// get all fuel type slice
const getFuelTypeSlice = createSlice({
  name: 'getFuelType',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getFuelType.pending, state => {
      state.isLoading = true;
      state.data = null;
    });
    builder.addCase(getFuelType.fulfilled, (state, action) => {
      const { responses, count } = action?.payload;
      state.isLoading = false;
      state.data = responses;
      state.error = null;
      state.count = count;
    });
    builder.addCase(getFuelType.rejected, (state, action) => {
      state.error = action.error.message || 'Something went wrong';
      state.isLoading = false;
    });
  }
});

// get all payment method action
export const getPaymentMethod = createAsyncThunk<any, any>(
  'api/getPaymentMethod',
  async (data, thunkApi) => {
    const { pageNo, pageSize, search, sortBy, sortByDirection } = data;
    try {
      let url = `${URLs.GET_PAYMENT_METHOD}?pageNo=${pageNo}&pageSize=${pageSize}`;
      if (search) {
        url += `&search=${search}`;
      }
      if (sortBy && sortByDirection) {
        url += `&sortBy=${sortBy}&sortByDirection=${sortByDirection}`;
      }
      const response = await axiosInstance({
        method: 'GET',
        url: url
      });
      return response?.data?.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

// get all payment method slice
const getPaymentMethodSlice = createSlice({
  name: 'getPaymentMethod',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getPaymentMethod.pending, state => {
      state.isLoading = true;
      state.data = null;
    });
    builder.addCase(getPaymentMethod.fulfilled, (state, action) => {
      const { responses, count } = action?.payload;
      state.isLoading = false;
      state.data = responses;
      state.count = count;
      state.error = null;
    });
    builder.addCase(getPaymentMethod.rejected, (state, action) => {
      state.error = action.error.message || 'Something went wrong';
      state.isLoading = false;
    });
  }
});

// get all driver fuel action
export const getAllDriverFuel = createAsyncThunk<any, any>(
  'api/getAllDriverFuel',
  async (data, thunkApi) => {
    try {
      const { pageNo, pageSize, search, sortByField, sortBy } = data;
      let url = `${URLs.GET_ALL_DRIVER_FUEL}pageNo=${pageNo}&pageSize=${pageSize}`;
      if (search) {
        url += `&search=${search}`;
      }
      const response = await axiosInstance({
        method: 'GET',
        url: url
      });
      return response?.data?.data;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data
            ? error?.response?.data?.message
            : error?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

// get all driver fuel slice
const getAllDriverFuelSlice = createSlice({
  name: 'getAllDriverFuel',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getAllDriverFuel.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(getAllDriverFuel.fulfilled, (state, action) => {
      const { responses, count } = action?.payload;
      state.isLoading = false;
      state.data = responses?.map((item: any, index: number) => ({
        ...item,
        sNo: index + 1,
        vehicleNumber: (item?.vehicleNumber).toUpperCase(),
        paymentMethodName: capitalizeFirstLetter(item?.paymentMethodName),
        fuelType: capitalizeFirstLetter(item?.fuelType),
        fuelStation: capitalizeFirstLetter(item?.fuelStation),
        notes: capitalizeFirstLetter(item?.notes)
      }));
      state.error = null;
      state.count = count;
    });
    builder.addCase(getAllDriverFuel.rejected, (state, action) => {
      state.error = action.error.message || 'Something went wrong';
      state.isLoading = false;
    });
  }
});

// delete driver fuel action
export const deleteDriverFuel = createAsyncThunk<any, any>(
  'api/deleteDriverFuel',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'DELETE',
        url: `${URLs.DELETE_DRIVER_FUEL}id=${data}`
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response?.data?.data;
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

//  delete driver fuel slice
const deleteDriverFuelSlice = createSlice({
  name: 'deleteDriverFuel',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(deleteDriverFuel.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteDriverFuel.fulfilled, state => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(deleteDriverFuel.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action?.error?.message || 'Something went wrong';
    });
  }
});

// update driver fuel action
export const updateDriverFuel = createAsyncThunk<any, any>(
  'api/updateDriverFuel',
  async (data, thunkApi) => {
    const { payload } = data;
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `${URLs.ADD_UPDATE_DRIVER_FUEL}`,
        headers: { 'Content-Type': 'multipart/form-data' },
        data: payload
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response.data;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data
            ? error?.response?.data?.message
            : error?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

// update driver fuel slice
const updateDriverFuelSlice = createSlice({
  name: 'updateDriverFuel',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(updateDriverFuel.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(updateDriverFuel.fulfilled, (state, action: any) => {
      state.data = action.payload?.data;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(updateDriverFuel.rejected, (state, action) => {
      state.error = action.error.message || 'Something went wrong';
      state.isLoading = false;
    });
  }
});

// get vehicle number validation action
export const vehicleNumberValid = createAsyncThunk(
  'api/vehicleNumberValid',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.VEHICLE_NUMBER_VALID}vehicleNumber=${data}`
      });
      return response;
    } catch (error: any) {
      return error?.response?.data?.message;
    }
  }
);

// get vehicle number validation slice
const vehicleNumberValidSlice = createSlice({
  name: 'vehicleNumberValid',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(vehicleNumberValid.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(vehicleNumberValid.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action?.payload;
      state.error = null;
    });
    builder.addCase(vehicleNumberValid.rejected, (state, action) => {
      state.error = action.error.message || 'Something went wrong';
      state.isLoading = false;
    });
  }
});

// get all driver fuel dashbaord action
export const getAllDriverFuelDashboard = createAsyncThunk<any, any>(
  'api/getAllDriverFuelDashboard',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${URLs.GET_DRIVER_FUEL_DASHBOARD}`,
        data
      });
      return response?.data?.data;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data
            ? error?.response?.data?.message
            : error?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

// get all driver fuel dashboard slice
const getAllDriverFuelDashboardSlice = createSlice({
  name: 'getAllDriverFuelDashboard',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getAllDriverFuelDashboard.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(getAllDriverFuelDashboard.fulfilled, (state, action) => {
      state.isLoading = false;
      const { dashboardMetricsResponse, fuelDashboardResponses, count } = action?.payload;
      state.dataMetric = dashboardMetricsResponse;
      state.data = fuelDashboardResponses?.map((item: any, index: number) => ({
        ...item,
        id: index + 1,
        fuelId: item?.id,
        vehicleNumber: (item?.vehicleNumber).toUpperCase(),
        driver: capitalizeFirstLetter(item?.driver),
        fuelType: capitalizeFirstLetter(item?.fuelType),
        payment: capitalizeFirstLetter(item?.payment),
        fuelStation: capitalizeFirstLetter(item?.fuelStation),
        notes: capitalizeFirstLetter(item?.notes),
        volume: item?.volume,
        cost: item?.cost,
        fuelPricePerUnit: item?.fuelPricePerUnit,
        adblueVolume: item?.adblueVolume,
        adblueTotalCost: item?.adblueTotalCost,
        adbluePricePerUnit: item?.adbluePricePerUnit
      }));
      state.error = null;
      state.count = count;
    });
    builder.addCase(getAllDriverFuelDashboard.rejected, (state, action) => {
      state.error = action.error.message || 'Something went wrong';
      state.isLoading = false;
    });
  }
});

// get vehicle and driver dropdown action
export const getVehicleDriver = createAsyncThunk(
  'api/getVehicleDriver',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.GET_VEHICLE_DRIVER}`
      });
      return response?.data?.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

// get vehicle driver dropdown slice
const getVehicleDriverSlice = createSlice({
  name: 'getVehicleDriver',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getVehicleDriver.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(getVehicleDriver.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action?.payload;
      state.error = null;
    });
    builder.addCase(getVehicleDriver.rejected, (state, action) => {
      state.error = action.error.message || 'Something went wrong';
      state.isLoading = false;
    });
  }
});

// get all fuel station action
export const getFuelStation = createAsyncThunk<any, any>(
  'api/getFuelStation',
  async (data, thunkApi) => {
    const { pageNo, pageSize, search, sortBy, sortByDirection } = data;
    try {
      let url = `${URLs.GET_FUEL_STATION}?pageNo=${pageNo}&pageSize=${pageSize}`;
      if (search) {
        url += `&search=${search}`;
      }
      if (sortBy && sortByDirection) {
        url += `&sortBy=${sortBy}&sortByDirection=${sortByDirection}`;
      }
      const response = await axiosInstance({
        method: 'GET',
        url: url
      });
      return response?.data?.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

// get all fuel station slice
const getFuelStationSlice = createSlice({
  name: 'getFuelStation',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getFuelStation.pending, state => {
      state.isLoading = true;
      state.data = null;
    });
    builder.addCase(getFuelStation.fulfilled, (state, action) => {
      const { responses, count } = action?.payload;
      state.isLoading = false;
      state.data = responses;
      state.count = count;
      state.error = null;
    });
    builder.addCase(getFuelStation.rejected, (state, action) => {
      state.error = action.error.message || 'Something went wrong';
      state.isLoading = false;
    });
  }
});

// add fuel type action
export const addFuelType = createAsyncThunk<any, any>(
  'api/addFuelType',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${URLs.ADD_FUEL_TYPE}`,
        data
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response.data;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data
            ? error?.response?.data?.message
            : error?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

// add fuel type slice
const addFuelTypeSlice = createSlice({
  name: 'addFuelType',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(addFuelType.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(addFuelType.fulfilled, (state, action: any) => {
      state.data = action.payload?.data;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(addFuelType.rejected, (state, action) => {
      state.error = action.error.message || 'Something went wrong';
      state.isLoading = false;
    });
  }
});

// add fuel station action
export const addFuelStation = createAsyncThunk<any, any>(
  'api/addFuelStation',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${URLs.ADD_FUEL_STATION}`,
        data
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response.data;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data
            ? error?.response?.data?.message
            : error?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

// add fuel station slice
const addFuelStationSlice = createSlice({
  name: 'addFuelStation',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(addFuelStation.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(addFuelStation.fulfilled, (state, action: any) => {
      state.data = action.payload?.data;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(addFuelStation.rejected, (state, action) => {
      state.error = action.error.message || 'Something went wrong';
      state.isLoading = false;
    });
  }
});

// add payment method action
export const addPaymentMethod = createAsyncThunk<any, any>(
  'api/addPaymentMethod',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${URLs.ADD_PAYMENT_METHOD}`,
        data
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response.data;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data
            ? error?.response?.data?.message
            : error?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

// add payment method slice
const addPaymentMethodSlice = createSlice({
  name: 'addPaymentMethod',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(addPaymentMethod.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(addPaymentMethod.fulfilled, (state, action: any) => {
      state.data = action.payload?.data;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(addPaymentMethod.rejected, (state, action) => {
      state.error = action.error.message || 'Something went wrong';
      state.isLoading = false;
    });
  }
});

// update fuel type action
export const updateFuelType = createAsyncThunk<any, any>(
  'api/updateFuelType',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `${URLs.UPDATE_FUEL_TYPE}`,
        data
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response.data;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data
            ? error?.response?.data?.message
            : error?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

// update fuel type slice
const updateFuelTypeSlice = createSlice({
  name: 'updateFuelType',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(updateFuelType.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(updateFuelType.fulfilled, (state, action: any) => {
      state.data = action.payload?.data;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(updateFuelType.rejected, (state, action) => {
      state.error = action.error.message || 'Something went wrong';
      state.isLoading = false;
    });
  }
});

// update fuel station action
export const updateFuelStation = createAsyncThunk<any, any>(
  'api/updateFuelStation',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `${URLs.UPDATE_FUEL_STATION}`,
        data
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response.data;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data
            ? error?.response?.data?.message
            : error?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

// update fuel station slice
const updateFuelStationSlice = createSlice({
  name: 'updateFuelStation',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(updateFuelStation.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(updateFuelStation.fulfilled, (state, action: any) => {
      state.data = action.payload?.data;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(updateFuelStation.rejected, (state, action) => {
      state.error = action.error.message || 'Something went wrong';
      state.isLoading = false;
    });
  }
});

// update payment method action
export const updatePaymentMethod = createAsyncThunk<any, any>(
  'api/updatePaymentMethod',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `${URLs.UPDATE_PAYMENT_METHOD}`,
        data
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response.data;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data
            ? error?.response?.data?.message
            : error?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

// update payment method slice
const updatePaymentMethodSlice = createSlice({
  name: 'updatePaymentMethod',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(updatePaymentMethod.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(updatePaymentMethod.fulfilled, (state, action: any) => {
      state.data = action.payload?.data;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(updatePaymentMethod.rejected, (state, action) => {
      state.error = action.error.message || 'Something went wrong';
      state.isLoading = false;
    });
  }
});

// delete fuel type action
export const deleteFuelType = createAsyncThunk<any, any>(
  'api/deleteFuelType',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'DELETE',
        url: `${URLs.DELETE_FUEL_TYPE}id=${data}`
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response?.data?.data;
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

//  delete fuel type slice
const deleteFuelTypeSlice = createSlice({
  name: 'deleteFuelType',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(deleteFuelType.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteFuelType.fulfilled, state => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(deleteFuelType.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action?.error?.message || 'Something went wrong';
    });
  }
});

// delete fuel station action
export const deleteFuelStation = createAsyncThunk<any, any>(
  'api/deleteFuelStation',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'DELETE',
        url: `${URLs.DELETE_FUEL_STATION}id=${data}`
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response?.data?.data;
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

//  delete fuel station slice
const deleteFuelStationSlice = createSlice({
  name: 'deleteFuelType',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(deleteFuelStation.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteFuelStation.fulfilled, state => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(deleteFuelStation.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action?.error?.message || 'Something went wrong';
    });
  }
});

// delete payment method action
export const deletePaymentMethod = createAsyncThunk<any, any>(
  'api/deletePaymentMethod',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'DELETE',
        url: `${URLs.DELETE_PAYMENT_METHOD}id=${data}`
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response?.data?.data;
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

//  delete payment method slice
const deletePaymentMethodSlice = createSlice({
  name: 'deleteFuelType',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(deletePaymentMethod.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deletePaymentMethod.fulfilled, state => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(deletePaymentMethod.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action?.error?.message || 'Something went wrong';
    });
  }
});

// deactivate fuel type action
export const deactivateFuelType = createAsyncThunk<any, any>(
  'api/deactivateFuelType',
  async (data, thunkApi) => {
    try {
      const { id, isActive } = data;
      const response = await axiosInstance({
        method: 'PATCH',
        url: `${URLs.DEACTIVATE_FUEL_TYPE}id=${id}&isActive=${isActive}`
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response?.data?.data;
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

//  deactivate fuel type slice
const deactivateFuelTypeSlice = createSlice({
  name: 'deactivateFuelType',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(deactivateFuelType.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deactivateFuelType.fulfilled, state => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(deactivateFuelType.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action?.error?.message || 'Something went wrong';
    });
  }
});

// deactivate fuel station action
export const deactivateFuelStation = createAsyncThunk<any, any>(
  'api/deactivateFuelStation',
  async (data, thunkApi) => {
    try {
      const { isActive, id } = data;
      const response = await axiosInstance({
        method: 'PATCH',
        url: `${URLs.DEACTIVATE_FUEL_STATION}isActive=${isActive}&id=${id}`
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response?.data?.data;
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

//  deactivate fuel station slice
const deactivateFuelStationSlice = createSlice({
  name: 'deactivateFuelStation',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(deactivateFuelStation.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deactivateFuelStation.fulfilled, state => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(deactivateFuelStation.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action?.error?.message || 'Something went wrong';
    });
  }
});

// deactivate payment action
export const deactivatePaymentMethod = createAsyncThunk<any, any>(
  'api/deactivatePaymentMethod',
  async (data, thunkApi) => {
    try {
      const { id, isActive } = data;
      const response = await axiosInstance({
        method: 'PATCH',
        url: `${URLs.DEACTIVATE_PAYMENT_METHOD}id=${id}&isActive=${isActive}`
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response?.data?.data;
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

//  deactivate payment method slice
const deactivatePaymentMethodSlice = createSlice({
  name: 'deactivatePaymentMethod',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(deactivatePaymentMethod.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deactivatePaymentMethod.fulfilled, state => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(deactivatePaymentMethod.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action?.error?.message || 'Something went wrong';
    });
  }
});

// add fuel excel download action
export const addFuelExcel = createAsyncThunk<any, any>(
  'api/addFuelExcel',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${URLs.FUEL_EXCEL}`,
        data
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response.data;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data
            ? error?.response?.data?.message
            : error?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

// add fuel excel download slice
const addFuelExcelSlice = createSlice({
  name: 'addFuelExcel',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(addFuelExcel.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(addFuelExcel.fulfilled, (state, action: any) => {
      state.data = action.payload?.data;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(addFuelExcel.rejected, (state, action) => {
      state.error = action.error.message || 'Something went wrong';
      state.isLoading = false;
    });
  }
});

// get fuel type dropdown action
export const getTypeDropdown = createAsyncThunk(
  'api/getTypeDropdown',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.GET_TYPE_DROPDOWN}`
      });
      return response?.data?.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

// get fuel type dropdown slice
const getTypeDropdownSlice = createSlice({
  name: 'getTypeDropdown',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getTypeDropdown.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(getTypeDropdown.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action?.payload;
      state.error = null;
    });
    builder.addCase(getTypeDropdown.rejected, (state, action) => {
      state.error = action.error.message || 'Something went wrong';
      state.isLoading = false;
    });
  }
});

// get fuel station dropdown action
export const getStationDropdown = createAsyncThunk(
  'api/getStationDropdown',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.GET_STATION_DROPDOWN}`
      });
      return response?.data?.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

// get fuel station dropdown slice
const getStationDropdownSlice = createSlice({
  name: 'getStationDropdown',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getStationDropdown.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(getStationDropdown.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action?.payload;
      state.error = null;
    });
    builder.addCase(getStationDropdown.rejected, (state, action) => {
      state.error = action.error.message || 'Something went wrong';
      state.isLoading = false;
    });
  }
});

// get payment method dropdown action
export const getPaymentDropdown = createAsyncThunk(
  'api/getPaymentDropdown',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.GET_PAYMENT_DROPDOWN}`
      });
      return response?.data?.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

// get payment method dropdown slice
const getPaymentDropdownSlice = createSlice({
  name: 'getPaymentDropdown',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getPaymentDropdown.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(getPaymentDropdown.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action?.payload;
      state.error = null;
    });
    builder.addCase(getPaymentDropdown.rejected, (state, action) => {
      state.error = action.error.message || 'Something went wrong';
      state.isLoading = false;
    });
  }
});

export const addDriverFuelReducer = addDriverFuelSlice.reducer;
export const getFuelTypeReducer = getFuelTypeSlice.reducer;
export const getPaymentMethodReducer = getPaymentMethodSlice.reducer;
export const getAllDriverFuelReducer = getAllDriverFuelSlice.reducer;
export const deleteDriverFuelReducer = deleteDriverFuelSlice.reducer;
export const updateDriverFuelReducer = updateDriverFuelSlice.reducer;
export const vehicleNumberValidReducer = vehicleNumberValidSlice.reducer;
export const getAllDriverFuelDashboardReducer = getAllDriverFuelDashboardSlice.reducer;
export const getVehicleDriverReducer = getVehicleDriverSlice.reducer;
export const getFuelStationReducer = getFuelStationSlice.reducer;
export const addFuelTypeReducer = addFuelTypeSlice.reducer;
export const addFuelStationReducer = addFuelStationSlice.reducer;
export const addPaymentMethodReducer = addPaymentMethodSlice.reducer;
export const updateFuelTypeReducer = updateFuelTypeSlice.reducer;
export const updateFuelStationReducer = updateFuelStationSlice.reducer;
export const updatePaymentMethodReducer = updatePaymentMethodSlice.reducer;
export const deleteFuelTypeReducer = deleteFuelTypeSlice.reducer;
export const deleteFuelStationReducer = deleteFuelStationSlice.reducer;
export const deletePaymentMethodReducer = deletePaymentMethodSlice.reducer;
export const deactivateFuelTypeReducer = deactivateFuelTypeSlice.reducer;
export const deactivateFuelStationReducer = deactivateFuelStationSlice.reducer;
export const deactivatePaymentMethodReducer = deactivatePaymentMethodSlice.reducer;
export const addFuelExcelReducer = addFuelExcelSlice.reducer;
export const getTypeDropdownReducer = getTypeDropdownSlice.reducer;
export const getStationDropdownReducer = getStationDropdownSlice.reducer;
export const getPaymentDropdownReducer = getPaymentDropdownSlice.reducer;
