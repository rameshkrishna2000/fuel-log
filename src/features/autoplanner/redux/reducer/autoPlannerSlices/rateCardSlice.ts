import data from '@iconify-icons/mdi/minus';
import { createAsyncThunk, createSlice, current } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../../../../../app/config/axiosInstance';
import URLs from '../../../../../utils/appURLs';
import { State } from 'country-state-city';
import { updateToast } from '../../../../../common/redux/reducer/commonSlices/toastSlice';
import { Message } from '@mui/icons-material';

type ReturnedType = any;

interface InitialStateTypes {
  [key: string]: any;
}

const initialState: InitialStateTypes = {
  data: [],
  isLoading: false,
  error: null,
  count: 0
};

//get seaters from vehicle list
export const getVehicleSeaters = createAsyncThunk<ReturnedType>(
  'getVehicleSeaters',
  async thunkAPi => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.GET_VEHICLES_SEATERS}`
      });
      return response?.data;
    } catch (error) {}
  }
);

const getSeatersList = createSlice({
  name: 'get seaters list',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getVehicleSeaters.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVehicleSeaters.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action?.payload?.data;
        state.error = null;
      })
      .addCase(getVehicleSeaters.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.data?.error;
      });
  }
});

//get tour names
export const getTourNames = createAsyncThunk<ReturnedType, any>(
  'getTourNames',
  async (mode, thunkAPi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.GET_TOUR_LIST}`,
        params: { mode }
      });
      return response?.data;
    } catch (error: any) {
      return thunkAPi.rejectWithValue(error);
    }
  }
);

const getToursList = createSlice({
  name: 'get tour list',
  initialState,
  reducers: {
    clearTourList: state => {
      state.data = [];
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getTourNames.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTourNames.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action?.payload?.data;
        state.error = null;
      })
      .addCase(getTourNames.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.data?.error;
      });
  }
});

//get rate card details
export const getRatecardDetails = createAsyncThunk<ReturnedType, any>(
  'getRatecardDeatils',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${URLs.GET_RATE_CARD}`,
        data: data
      });
      return response?.data;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data?.error || 'Internal Server Error',
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

const getRateCard = createSlice({
  name: 'get rate card',
  initialState,
  reducers: {
    clearRateCard: state => {
      state.data = [];
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getRatecardDetails.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRatecardDetails.fulfilled, (state, action: any) => {
        state.count = action?.payload?.data?.count;
        state.isLoading = false;
        const newData: any = current(state)?.data ? current(state as any)?.data : [];
        state.data = [
          ...newData,
          ...(action.payload?.data?.rateCardResponses || [])
        ] as any;
        state.error = null;
      })
      .addCase(getRatecardDetails.rejected, (state, action: any) => {
        state.isLoading = false;
        state.data = [];
        state.count = 0;
        state.error = action?.payload?.data?.error;
      });
  }
});

//delete ratecard
export const deleteRateCardDetails = createAsyncThunk<ReturnedType, any>(
  'deleteRatecardDeatils',
  async (rateCardId, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'DELETE',
        url: `${URLs.DELETE_RATE_CARD}`,
        params: { rateCardId }
      });

      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );

      return response?.data;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data?.message || 'Internal Server Error',
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

const deleteRateCard = createSlice({
  name: 'delete rate card',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(deleteRateCardDetails.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRateCardDetails.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action?.payload?.data;
        state.error = null;
      })
      .addCase(deleteRateCardDetails.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.data?.error;
      });
  }
});

//add Ratecard
export const addRatecard = createAsyncThunk<ReturnedType, any>(
  'add rate card',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${URLs.ADD_RATE_CARD}`,
        data: data
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response?.data;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data?.message || 'Internal Server Error',
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

const addRateCardDetails = createSlice({
  name: 'add rate card details',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(addRatecard.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addRatecard.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action?.payload?.data;
        state.error = null;
      })
      .addCase(addRatecard.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.data?.error;
      });
  }
});

//update api
export const updateRatecard = createAsyncThunk<ReturnedType, any>(
  'update rate card',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `${URLs.UPDATE_RATE_CARD}`,
        data: data
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response?.data;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data?.message || 'Internal Server Error',
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

const updateRatecardDeatils = createSlice({
  name: 'update rate card details',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(updateRatecard.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRatecard.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action?.payload?.data;
        state.error = null;
      })
      .addCase(updateRatecard.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.data?.error;
      });
  }
});

const childComponentSlice = createSlice({
  name: 'child',
  initialState: { child: null },
  reducers: {
    setChildComponent: (state, action) => {
      state.child = action.payload;
    }
  }
});

export const getSeatersListSlice = getSeatersList.reducer;
export const getToursListSlice = getToursList.reducer;
export const getRateCardDetailsSlice = getRateCard.reducer;
export const addRateCardDetailsReducer = addRateCardDetails.reducer;
export const updateRatecardDeatilsReducer = updateRatecardDeatils.reducer;
export const deleteRateCardslice = deleteRateCard.reducer;
export const childComponent = childComponentSlice.reducer;

export const { clearTourList } = getToursList.actions;
export const { clearRateCard } = getRateCard.actions;
export const { setChildComponent } = childComponentSlice.actions;
