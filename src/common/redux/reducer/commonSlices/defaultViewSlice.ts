import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../../../app/config/axiosInstance';
import URLs from '../../../../utils/appURLs';
import { updateToast } from './toastSlice';

interface defaultViewState {
  isLoading: boolean;
  data: string | null;
  error: null;
}

const initialState: defaultViewState = {
  isLoading: false,
  data: null,
  error: null
};

//action for getting default view
export const getDefaultView = createAsyncThunk<any, any>(
  'getdefaultview',
  async (signal, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.GET_DEFAULT_VIEW}`,
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

//slice for getting default view
const getDefaultViewSlice = createSlice({
  name: 'getdefaultview',
  initialState,
  reducers: {
    clearView: state => {
      state.data = null;
    }
  },
  extraReducers: builder => {
    builder.addCase(getDefaultView.pending, state => {
      state.isLoading = true;
      state.data = null;
      state.error = null;
    });
    builder.addCase(getDefaultView.fulfilled, (state, action) => {
      state.isLoading = false;
      const {
        data: { data }
      } = action.payload;
      state.data = data;
      state.error = null;
    });
    builder.addCase(getDefaultView.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload?.response?.data?.error;
    });
  }
});

//action for setting default view
export const setDefaultView = createAsyncThunk<any, any>(
  'defaultview',
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `${URLs.SET_DEFAULT_VIEW}?defaultView=${data}`
      });
      thunkAPI.dispatch(
        updateToast({
          show: true,
          message: 'Default View changed successfully',
          severity: 'success'
        })
      );
      return response;
    } catch (error: any) {
      thunkAPI.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data?.message,
          severity: 'error'
        })
      );
      return thunkAPI.rejectWithValue(error);
    }
  }
);

//slice for getting default view
const setDefaultViewSlice = createSlice({
  name: 'defaultview',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(setDefaultView.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(setDefaultView.fulfilled, (state, action) => {
      state.isLoading = false;

      state.data = action.payload;
    });
    builder.addCase(setDefaultView.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload?.response?.data?.error;
    });
  }
});

export const setDefaultViewData = setDefaultViewSlice.reducer;
export const { clearView } = getDefaultViewSlice.actions;
export const getDefaultViewData = getDefaultViewSlice.reducer;
