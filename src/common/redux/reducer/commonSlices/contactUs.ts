import { createAsyncThunk, createSlice, current, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../../../app/config/axiosInstance';
import URLs from '../../../../utils/appURLs';
import { updateToast } from './toastSlice';

const initialState = {
  isLoading: false,
  data: null,
  error: null
};

type ThunkArg = {
  name: string;
  email: string;
  phone: number;
  message: string;
  token: string;
} | null;

type ReturnedType = any;

export const postContactUsAction = createAsyncThunk<ReturnedType, ThunkArg>(
  'contactUsAction/post',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${URLs.CONTACT_US}`,
        data: data
      });
      if (response) {
        thunkApi.dispatch(
          updateToast({
            show: true,
            message: response?.data?.message,
            severity: 'success'
          })
        );
      }
      return response;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error.response.data?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

// Function my profile details:
const contactUsSlice = createSlice({
  name: 'contactUs',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(postContactUsAction.pending, state => {
        state.isLoading = true;
        state.data = current(state).data;
        state.error = null;
      })
      .addCase(
        postContactUsAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload.data;
          state.error = null;
        }
      )
      .addCase(postContactUsAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.data = current(state).data;
        state.error = action.payload.response?.data?.error;
      });
  }
});

export default contactUsSlice.reducer;
