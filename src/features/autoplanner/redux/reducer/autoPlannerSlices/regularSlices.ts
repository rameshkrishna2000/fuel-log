import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../../../../app/config/axiosInstance';
import URLs from '../../../../../utils/appURLs';
import { updateToast } from '../../../../../common/redux/reducer/commonSlices/toastSlice';

interface InitialStateProps {
  isLoading: boolean;
  data: [] | null;
  error: string;
  count: number;
}
const initialState: InitialStateProps = {
  isLoading: false,
  data: null,
  error: '',
  count: 0
};

//action for regular vehicle dropdown
export const getConfigurableVehicles = createAsyncThunk(
  'configurevehicles',
  async (_, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.CONFIGURABLE_VEHICLES}`
      });

      return response;
    } catch (err: any) {
      return thunkApi.rejectWithValue(err);
    }
  }
);

//reducer for regular vehicles dropdown
const getConfigurableVehiclesSlice = createSlice({
  name: 'configurevehicles',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getConfigurableVehicles.pending, (state, action) => {
        state.isLoading = true;
        state.data = null;
      })
      .addCase(getConfigurableVehicles.fulfilled, (state, action: any) => {
        state.isLoading = false;
        const {
          data: { data }
        } = action.payload;
        state.data = data?.map((item: any) => ({
          id: item?.vehicleNumber,
          label: `${item?.vehicleNumber.toUpperCase()} (${item?.seatingCapacity})`,
          seatingCapacity: item?.seatingCapacity
        }));
      })
      .addCase(getConfigurableVehicles.rejected, (state, action: any) => {
        state.error = action.payload.response?.data?.message;
        state.isLoading = false;
      });
  }
});

//action for get driver dropdown
export const getDriverDetails = createAsyncThunk<any, any>(
  'api/regulardrivers',
  async (data, thunkApi) => {
    try {
      const response = axiosInstance({
        method: 'POST',
        url: `${URLs.REGULAR_DRIVERS}`,
        data
      });
      return response;
    } catch (err) {
      return thunkApi.rejectWithValue(err);
    }
  }
);

//reducer to get driver dropdown
export const getDriverDetailsSlice = createSlice({
  name: 'regulardrivers',
  initialState,
  reducers: {
    clearDrivers: state => {
      state.data = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getDriverDetails.pending, (state, action) => {
        state.isLoading = true;
        state.data = null;
        state.error = '';
      })
      .addCase(getDriverDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        const {
          data: { data }
        } = action.payload;
        state.data = data?.map((item: any) => ({
          id: item.driverID,
          label: item.driverName
        }));
      })
      .addCase(getDriverDetails.rejected, (state, action: any) => {
        state.isLoading = false;
        state.data = action.payload?.response?.data?.message;
      });
  }
});

//action for get regular tour details
export const getRegularTour = createAsyncThunk<any, any>(
  'getregular',
  async (data, thunkApi) => {
    const { pageNo, pageSize, search, sortBy, sortField, autoplannerID } = data;

    try {
      let URL = `${URLs.ADD_REGULAR_TOUR}?pageNo=${pageNo}&pageSize=${pageSize}`;
      if (autoplannerID) {
        URL += `&date=${autoplannerID}`;
      }
      if (search && sortBy && sortField) {
        URL += `&sortBy=${sortBy}&sortField=${sortField}&searchFor=${search}`;
      } else if (sortBy && sortField) {
        URL += `&sortBy=${sortBy}&sortField=${sortField}`;
      } else if (search) {
        URL += `&searchFor=${search}`;
      }
      const response = await axiosInstance({
        method: 'GET',
        url: URL
      });
      return response;
    } catch (err: any) {
      return thunkApi.rejectWithValue(err);
    }
  }
);

//reducer for get regular tour details
const getRegularTourSlice = createSlice({
  name: 'getregular',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getRegularTour.pending, (state, action) => {
        state.isLoading = true;
        state.data = null;
        // state.count = 0;
      })
      .addCase(getRegularTour.fulfilled, (state, action) => {
        state.isLoading = false;
        const {
          data: {
            data: { configurableModeRequests, count }
          }
        } = action.payload;

        state.data = configurableModeRequests?.map((item: any, index: number) => ({
          ...item,
          id: index + 1,
          tourId: item.id
        }));
        state.count = count;
      })
      .addCase(getRegularTour.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload.response?.data?.message;
      });
  }
});

//action to add regular tour
export const addRegularTour = createAsyncThunk<any, any>(
  'addregular',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${URLs.ADD_REGULAR_TOUR}`,
        data
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: 'Regular Tour added successfully',
          severity: 'success'
        })
      );
      return response;
    } catch (err: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: err?.response?.data?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(err);
    }
  }
);

//reducer for add regular tour
const addRegularTourSlice = createSlice({
  name: 'addregular',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(addRegularTour.pending, (state, action) => {
        state.isLoading = true;
        state.data = null;
        state.error = '';
      })
      .addCase(addRegularTour.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(addRegularTour.rejected, (state, action: any) => {
        state.error = action.payload.response.data.message;
        state.isLoading = false;
      });
  }
});

//action for update regular tours
export const updateRegularTour = createAsyncThunk<any, any>(
  'regular/update',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `${URLs.ADD_REGULAR_TOUR}`,
        data
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: 'Regular Tour updated successfully',
          severity: 'success'
        })
      );
      return response;
    } catch (err: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: err?.response?.data?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(err);
    }
  }
);

//reducer for update regular tour
const updateRegularSlice = createSlice({
  name: 'regular',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(updateRegularTour.pending, (state, action) => {
        state.isLoading = true;
        state.data = null;
        state.isLoading = true;
      })
      .addCase(updateRegularTour.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(updateRegularTour.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload.response?.data?.message;
      });
  }
});

//action for delete regular tours
export const deleteRegular = createAsyncThunk<any, any>(
  'regular/delete',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'DELETE',
        url: `${URLs.ADD_REGULAR_TOUR}?id=${data}`
      });
      thunkApi.dispatch(
        updateToast({ show: true, message: 'Regular tour deleted successfully' })
      );
      return response;
    } catch (err: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: err?.response?.data?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(err);
    }
  }
);

//reducer for delete regular tours
const deleteRegularSlice = createSlice({
  name: 'regular',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(deleteRegular.pending, (state, action) => {
        state.isLoading = true;
        state.data = null;
        state.error = '';
      })
      .addCase(deleteRegular.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(deleteRegular.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.response?.data?.message;
      });
  }
});

//action for activate/deactivate regular tours
export const deactivateRegular = createAsyncThunk<any, any>(
  'regular/deactivate',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'PATCH',
        url: `${URLs.ADD_REGULAR_TOUR}?id=${data}`
      });

      if (response?.status === 200) {
        thunkApi.dispatch(updateToast({ show: true, message: response?.data?.message }));
      }
      return response;
    } catch (err: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: err?.response?.data?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(err);
    }
  }
);

//reducer for activate /deactivate regular tours
const deactivateRegularSlice = createSlice({
  name: 'regular',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(deactivateRegular.pending, (state, action) => {
        state.isLoading = true;
        state.data = null;
        state.error = '';
      })
      .addCase(deactivateRegular.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(deactivateRegular.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.response?.data?.message;
      });
  }
});

//action for get bookings regular

export const getConfigurableVehiclesData = getConfigurableVehiclesSlice.reducer;
export const getRegularDriversData = getDriverDetailsSlice.reducer;
export const addRegularData = addRegularTourSlice.reducer;
export const getRegularTourData = getRegularTourSlice.reducer;
export const updateRegularTourData = updateRegularSlice.reducer;
export const deleteRegularData = deleteRegularSlice.reducer;
export const deactivateRegularData = deactivateRegularSlice.reducer;
export const { clearDrivers } = getDriverDetailsSlice.actions;
