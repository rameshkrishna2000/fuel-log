import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import URLs from '../../../../../utils/appURLs';
import { updateToast } from '../../../../../common/redux/reducer/commonSlices/toastSlice';
import axiosInstance from '../../../../../app/config/axiosInstance';

type ReturnedType = any;

// Define the structure of the data returned by the API
interface TourSummaryViewList {
  totalSICTourPassengers: any;
  standardTourDetails: any[];
  vehicleInputs: any[];
  transferInstances: any[];
  totalTourPassengers: number;
  feedBackResponse: any;
  totalAllottedPassengers: number;
  totalRemainingPassengers: number;
  vehicleSuggestions: any;
  modes: string[];
  sessionID: string;
}

interface TourSummary {
  status: string;
  data: TourSummaryViewList | null;
  message: string;
}

interface Payload {
  startDate?: number | null;
  endDate?: number | null;
  status?: string | null;
}

// Define the shape of the Redux state
interface TourState {
  isLoading: boolean;
  data: TourSummary | null;
  error: string | null;
  info: any;
}

const initialState: TourState = {
  isLoading: false,
  data: null,
  error: null,
  info: null
};

const initialStates = {
  isLoading: false,
  data: [],
  error: null
};

//action for get initial tour summary
export const getInitialTourSummaryAction = createAsyncThunk<ReturnedType, any>(
  'get initial tour summary',
  async (data, thunkApi) => {
    const { mode, sessionID, date, modes } = data;
    try {
      let URL = `${URLs.GET_INITIAL_TOUR_SUMMARY}date=${date}`;

      if (mode) URL += `&mode=${mode}`;
      if (modes) URL += `&modes=${modes}`;
      const requestConfig: any = {
        method: 'POST',
        url: URL,
        headers: {
          'session-id': sessionID
        }
      };
      const response = await axiosInstance(requestConfig);
      return response?.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

//action for tour summary proceed
export const tourSummaryProccedAction = createAsyncThunk<ReturnedType, any>(
  'tour summary procced',
  async (data, thunkApi) => {
    const { isAutomateTransfer, mode, totalSummary, sessionID, date } = data;
    try {
      let URL = `${URLs.GET_TOUR_SUMMARY_PROCCED}date=${date}&automateTransfer=${isAutomateTransfer}`;

      if (mode) URL += `&mode=${mode}`;
      const requestConfig: any = {
        method: 'POST',
        url: URL,
        headers: {
          'session-id': sessionID
        }
      };
      if (totalSummary.length !== 0) {
        requestConfig.data = totalSummary;
      }
      // thunkApi.dispatch(createConnection(''));
      const response = await axiosInstance(requestConfig);
      return response?.data;
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

//action for tour summary proceed result
export const tourSummaryProccedResultAction = createAsyncThunk<ReturnedType, any>(
  'tour summary procced result',
  async (data, thunkApi) => {
    const { stateID, sessionID, date } = data;
    try {
      let URL = `${URLs.GET_TOUR_SUMMARY_PROCCED_RESULT}date=${date}&state-id=${stateID}&session-id=${sessionID}`;
      const requestConfig: any = {
        method: 'POST',
        url: URL
      };
      const response = await axiosInstance(requestConfig);
      return response?.data;
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

//action for tour summary plan frozen
export const tourSummaryPlanFrozenAction = createAsyncThunk<ReturnedType, any>(
  'tour summary plan frozen',
  async (data, thunkApi) => {
    const { mode, totalSummary, sessionID, date } = data;
    try {
      let URL = `${URLs.GET_TOUR_SUMMARY_SAVE}date=${date}`;

      if (mode) URL += `&mode=${mode}`;
      const requestConfig: any = {
        method: 'POST',
        url: URL,
        headers: {
          'session-id': sessionID
        }
      };
      if (totalSummary.length !== 0) {
        requestConfig.data = totalSummary;
      }
      const response = await axiosInstance(requestConfig);
      return response?.data;
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

//action for summary download
export const downloadSummaryAction = createAsyncThunk<ReturnedType, any>(
  'add/driver',
  async (data, thunkApi) => {
    const { date, mode } = data;
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${URLs.DOWNLOAD_SUMMARY}date=${date}&mode=${mode}`
      });
      return response?.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

// get initial tour summary slice
const initialTourSummary = createSlice({
  name: 'get initial tour summary',
  initialState,
  reducers: {
    clearTourSummary: (state: any) => {
      state.data = null;
    },
    summaryInfo: (state, action) => {
      state.info = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getInitialTourSummaryAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getInitialTourSummaryAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload;
          state.error = null;
        }
      )
      .addCase(getInitialTourSummaryAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

// tour summary procced slice
const tourSummaryProcced = createSlice({
  name: 'tour summary Procced',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(tourSummaryProccedAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        tourSummaryProccedAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload.data;
          state.error = null;
        }
      )
      .addCase(tourSummaryProccedAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

// tour summary procced result slice
const tourSummaryProccedResult = createSlice({
  name: 'tour summary Procced result',
  initialState,
  reducers: {
    clearTourProccedSummary: (state: any) => {
      state.data = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(tourSummaryProccedResultAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        tourSummaryProccedResultAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload;
          state.error = null;
        }
      )
      .addCase(tourSummaryProccedResultAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

// tour summary plan frozen slice
const tourSummaryPlanFrozen = createSlice({
  name: 'tour summary plan frozen',
  initialState,
  reducers: {
    clearTourSaveSummary: (state: any) => {
      state.data = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(tourSummaryPlanFrozenAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        tourSummaryPlanFrozenAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload;
          state.error = null;
        }
      )
      .addCase(tourSummaryPlanFrozenAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

//reducer for  download summary
const downloadSummarySlice = createSlice({
  name: 'download summary',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(downloadSummaryAction.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.data = null;
      })
      .addCase(downloadSummaryAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload?.data;
      })
      .addCase(downloadSummaryAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.data = null;
        state.error = action.payload?.response?.data?.error;
      });
  }
});

//transfer vehicle dropdown
export const getTransferVehicle = createAsyncThunk<any, any>(
  'transfervehicles',
  async (data, thunkApi) => {
    const { mode, autoplannerID } = data;
    try {
      const response = axiosInstance({
        method: 'GET',
        url: `${URLs.GET_TRANSFER_VEHICLES}mode=${mode}&autoplannerID=${autoplannerID}`
      });
      return response;
    } catch (error) {}
  }
);

const transferVehicleState = {
  isLoading: false,
  data: null,
  error: null
};

//slice for transfer vehicle dropdown
const transferVehicleSlice = createSlice({
  name: 'transfersummary',
  initialState: transferVehicleState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getTransferVehicle.pending, (state, action) => {
        state.isLoading = true;
        state.data = null;
        state.error = null;
      })
      .addCase(getTransferVehicle.fulfilled, (state, action) => {
        state.isLoading = true;
        state.data = action.payload.data.data;
        state.error = null;
      })
      .addCase(getTransferVehicle.rejected, (state, action: any) => {
        state.isLoading = false;
        state.data = action.payload?.response?.data?.error;
      });
  }
});

//action for summary drivers list,
export const getSummaryDriversList = createAsyncThunk<any, any>(
  'summary/drivers',
  async (data, thunkAPi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.SUMMARY_DRIVERS_LIST}autoplannerID=${data}`
      });

      return response;
    } catch (error) {
      thunkAPi.rejectWithValue(error);
    }
  }
);

interface summaryDrivers {
  isLoading: boolean;
  data: any;
  error: any;
}

const summaryDriversList: summaryDrivers = {
  isLoading: false,
  data: null,
  error: null
};

//reducer for summary drivers dropdown
const getSummaryDriversSlice = createSlice({
  name: 'summarydrivers',
  initialState: summaryDriversList,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getSummaryDriversList.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.data = null;
      })
      .addCase(getSummaryDriversList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload?.data?.data;
      })
      .addCase(getSummaryDriversList.rejected, (state, action: any) => {
        state.isLoading = false;
        state.data = null;
        state.error = action.payload?.response?.data?.error;
      });
  }
});

//action for driver reassign
export const updateDriverAssign = createAsyncThunk<any, any>(
  'driver-reassign',
  async (data, thunkApi) => {
    const { driverid, vehicle } = data;
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `${URLs.DRIVER_REASSIGN}driverid=${driverid}&vehiclenumber=${vehicle}`
      });
      return response;
    } catch (error) {
      thunkApi.rejectWithValue(error);
    }
  }
);

//reducer for summary drivers upadte
const updateSummaryDriversSlice = createSlice({
  name: 'summarydrivers-update',
  initialState: summaryDriversList,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(updateDriverAssign.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.data = null;
      })
      .addCase(updateDriverAssign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload?.data?.data;
      })
      .addCase(updateDriverAssign.rejected, (state, action: any) => {
        state.isLoading = false;
        state.data = null;
        state.error = action.payload?.response?.data?.error;
      });
  }
});

//available summary list
export const getAvailableSummary = createAsyncThunk<AxiosResponse<any>, Payload>(
  'get Available Summary',
  async (params, thunkApi) => {
    const { startDate, endDate, status } = params;
    const queryParams: Record<string, string | number | boolean | undefined | null> = {
      startDate,
      endDate,
      status
    };
    const filteredParams = Object.entries(queryParams)
      .filter(([key, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.GET_AVAILABLE_SUMMARY}?${filteredParams}`
      });
      return response?.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

//reducer for available summary list
const availableSummarySlice = createSlice({
  name: 'availableSummary',
  initialState: initialStates,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getAvailableSummary.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAvailableSummary.fulfilled, (state: any, action) => {
        state.isLoading = false;
        state.data = action?.payload?.data;
      })
      .addCase(getAvailableSummary.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.response?.data?.error;
      });
  }
});

// Action function to delete summary
export const summaryDeleteAction = createAsyncThunk<ReturnedType, any>(
  'delete-summary',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'DELETE',
        url: `${URLs.DELETE_SUMMARY}date=${data?.date}&modes=${data?.modes}`
      });
      await thunkApi.dispatch(getAvailableSummary(data?.params));
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response?.data?.data;
    } catch (error: any) {
      if (error?.message !== 'canceled')
        thunkApi.dispatch(
          updateToast({
            show: true,
            message: error.response.data.message,
            severity: 'error'
          })
        );
      return thunkApi.rejectWithValue(error);
    }
  }
);

// delete summary slice
const deleteSummarySlice = createSlice({
  name: 'delete-summary',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(summaryDeleteAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        summaryDeleteAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload?.data;
          state.error = null;
        }
      )
      .addCase(summaryDeleteAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

//action for async success
export const asyncSuccessAction = createAsyncThunk<any, any>(
  'asyncSuccess',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.ASYNC_SUCCESS}event=${data}`
      });
      return response;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

//reducer for async success
const asyncSuccessSlice = createSlice({
  name: 'asyncSuccess',
  initialState,
  reducers: {
    clearAsyncSuccess: state => {
      state.data = null;
      state.error = null;
      state.isLoading = false;
    }
  },
  extraReducers: builder => {
    builder.addCase(asyncSuccessAction.pending, (state, action) => {
      state.isLoading = true;
      state.data = null;
      state.error = null;
    });
    builder.addCase(asyncSuccessAction.fulfilled, (state, action) => {
      const {
        data: { data }
      } = action.payload;
      state.isLoading = false;
      state.data = data;
      state.error = null;
    });
    builder.addCase(asyncSuccessAction.rejected, (state, action: any) => {
      state.isLoading = false;
      state.data = null;
      state.error = action?.payload?.response?.data?.error || 'Something went wrong';
    });
  }
});

export const initialTourSummarySlice = initialTourSummary.reducer;
export const tourSummaryProccedSlice = tourSummaryProcced.reducer;
export const tourSummaryProccedResultSlice = tourSummaryProccedResult.reducer;
export const tourSummaryPlanFrozenSlice = tourSummaryPlanFrozen.reducer;
export const transferVehicleDropdown = transferVehicleSlice.reducer;
export const availableSummary = availableSummarySlice.reducer;
export const { clearTourSummary, summaryInfo } = initialTourSummary.actions;
export const { clearTourProccedSummary } = tourSummaryProccedResult.actions;
export const { clearTourSaveSummary } = tourSummaryPlanFrozen.actions;
export const summaryDrivers = getSummaryDriversSlice.reducer;
export const updateSummaryDrivers = updateSummaryDriversSlice.reducer;
export const downloadSummary = downloadSummarySlice.reducer;
export const asyncSuccessData = asyncSuccessSlice.reducer;
export const { clearAsyncSuccess } = asyncSuccessSlice.actions;
export const deleteSummary = deleteSummarySlice.reducer;
