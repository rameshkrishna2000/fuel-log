import { PayloadAction, createAsyncThunk, createSlice, current } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import URLs from '../../../../../utils/appURLs';
import { updateToast } from '../../../../../common/redux/reducer/commonSlices/toastSlice';
import axiosInstance from '../../../../../app/config/axiosInstance';

type ReturnedType = any;

interface Payload {
  pageNo: number;
  pageSize: number;
}

interface InitialState {
  isLoading: boolean;
  data: [] | any;
  error: string | null;
}

interface InitialStates {
  isLoading: boolean;
  data: { agentDetails: any; count: number } | null | any;
  error: string | null;
  count: number;
}

const initialState: InitialState = {
  isLoading: false,
  data: [],
  error: null
};

const initialStates: InitialStates = {
  isLoading: false,
  data: null,
  error: null,
  count: 0
};

const agentValidationState: any = {
  isLoading: false,
  data: [],
  error: null,
  email: {
    fieldName: '',
    error: '',
    status: true
  },
  mobileNumber: {
    fieldName: '',
    error: '',
    status: true
  },
  userName: {
    fieldName: '',
    error: '',
    status: true
  },
  validationErrors: {
    email: '',
    mobileNumber: '',
    userName: ''
  }
};

// get agent action
export const getAgent = createAsyncThunk<AxiosResponse<any>, any>(
  'agentActions',
  async (data, thunkApi) => {
    const { pageNo, pageSize, role, signal, searchFor, category } = data;
    try {
      let url = `${URLs.AUTOPLANNER_AGENT}page=${pageNo}&size=${pageSize}&sort=ASC`;

      // if category present -> skip roleType
      if (!category && role) {
        url += `&roleType=${role}`;
      }

      if (searchFor) {
        url += `&searchFor=${searchFor}`;
      }

      if (category) {
        url += `&category=${category}`;
      }

      const response = await axiosInstance({
        method: 'GET',
        url,
        signal
      });

      return response?.data;
    } catch (error: any) {
      if (error?.message !== 'canceled') return thunkApi.rejectWithValue(error);
    }
  }
);

//action for add trip
export const addAgent = createAsyncThunk<ReturnedType, any>(
  'autoplannerAgent',
  async (data, thunkApi) => {
    const { payload, getPayload } = data;
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${URLs.ADD_AGENT}`,
        data: payload
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response?.data?.data[0];
    } catch (error: any) {
      if (error?.message !== 'canceled')
        thunkApi.dispatch(
          updateToast({
            show: true,
            message: error?.response?.data?.message,
            severity: 'error'
          })
        );
      return thunkApi.rejectWithValue(error);
    }
  }
);

// get agent slice
const agentSlice = createSlice({
  name: 'agent',
  initialState: initialStates,
  reducers: {
    clearUsers: (state: any) => {
      state.data = [];
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getAgent.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAgent.fulfilled, (state, action: any) => {
        state.isLoading = false;

        const newData: any = current(state)?.data ? current(state as any)?.data : [];

        const { userViews, count } = action?.payload?.data;

        state.data = [...newData, ...userViews];

        state.count = count;
        state.error = null;
      })
      .addCase(getAgent.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error;
      });
  }
});

//action for update agent
export const updateAgent = createAsyncThunk<ReturnedType, any>(
  'updateAgent',
  async (data, thunkApi) => {
    const { getPayload, updatePayload } = data;
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `${URLs.UPDATE_AGENT}`,
        data: updatePayload
      });

      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response?.data?.data[0];
    } catch (error: any) {
      if (error?.message !== 'canceled')
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

// Action function to delete agent
export const agentDeleteAction = createAsyncThunk<ReturnedType, any>(
  'delete-agent',
  async (data, thunkApi) => {
    const { getPayload, payload } = data;
    try {
      const response = await axiosInstance({
        method: 'DELETE',
        url: `${URLs.DELETE_AGENT}?id=${payload?.id}`
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
      if (error?.message !== 'canceled') return thunkApi.rejectWithValue(error);
    }
  }
);

//slice for Add agents
const addAgentSlice = createSlice({
  name: 'add agents',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(addAgent.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addAgent.fulfilled, (state, action: PayloadAction<ReturnedType>) => {
        state.isLoading = false;
        state.data = action.payload?.data;
        state.error = null;
      })
      .addCase(addAgent.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

//slice for update agent
const upadateAgent = createSlice({
  name: 'updateAgent-details',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(updateAgent.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAgent.fulfilled, (state, action: PayloadAction<ReturnedType>) => {
        state.isLoading = false;
        state.data = action.payload?.data;
        state.error = null;
      })
      .addCase(updateAgent.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

// delete agent slice
const deleteAgentSlice = createSlice({
  name: 'delete-agent',
  initialState,
  reducers: {
    clearAgentError: state => {
      state.data = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(agentDeleteAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        agentDeleteAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload?.data;
          state.error = null;
        }
      )
      .addCase(agentDeleteAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.data = action.payload?.response?.data;
        state.error = action.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

// Action function to validate agent
export const agentValidation = createAsyncThunk<any, any>(
  'driver/validation',
  async (data, thunkAPi) => {
    const { category, value, operation, id } = data;
    const values = encodeURIComponent(value);
    let url = `${URLs.AGENT_VALIDATION}category=${category}&value=${values}&operation=${operation}`;
    if (id) {
      url += `&id=${id}`;
    }
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: url
      });
      // thunkAPi.dispatch(
      //   updateToast({
      //     show: true,
      //     message: response?.data?.error,
      //     severity: 'success'
      //   })
      // );
      return response;
    } catch (error: any) {
      return error?.response?.data?.message;
    }
  }
);

// slice for agent validation
const agentValidationSlice = createSlice({
  name: 'add agents',
  initialState: agentValidationState,
  reducers: {
    clearMailError: state => {
      state.data = null;
      state.email = null;
      state.mobileNumber = null;
      state.userName = null;
    },
    setValidationErrors: (state, action) => {
      if (action.payload.fieldName === 'email') {
        state.email = action.payload;
      }
      if (action.payload.fieldName === 'mobileNumber')
        state.mobileNumber = action.payload;
      if (action.payload.fieldName === 'userName') state.userName = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(agentValidation.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        agentValidation.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload?.data;
          state.error = null;
        }
      )
      .addCase(agentValidation.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

// getRatecard dropdown
export const getRateCard = createAsyncThunk<any>(
  'getRatecard',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.RATE_CARDS}`
      });
      return response?.data.data;
    } catch (error: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: error?.response?.data?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(error);
    }
  }
);

// get rateCardSlice
const getRateCardSlice = createSlice({
  name: 'rateCardSlice',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getRateCard.pending, state => {
        state.isLoading = true;
        state.data = [];
      })
      .addCase(getRateCard.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.data = action?.payload;
        state.error = null;
      })
      .addCase(getRateCard.rejected, (state, action: any) => {
        state.isLoading = false;
        state.data = [];
        state.error = action.payload?.response?.data.error || 'Something went wrong';
      });
  }
});

export default agentSlice.reducer;
export const { clearUsers } = agentSlice.actions;
export const agentDelete = deleteAgentSlice.reducer;
export const addAgentDetails = addAgentSlice.reducer;
export const validateAgent = agentValidationSlice.reducer;
export const rateCard = getRateCardSlice.reducer;
export const agentUpdate = upadateAgent.reducer;
export const { clearMailError, setValidationErrors } = agentValidationSlice.actions;
export const { clearAgentError } = deleteAgentSlice.actions;
