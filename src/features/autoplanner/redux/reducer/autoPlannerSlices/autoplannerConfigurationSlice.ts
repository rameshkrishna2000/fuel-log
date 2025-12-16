import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import URLs from '../../../../../utils/appURLs';
import { updateToast } from '../../../../../common/redux/reducer/commonSlices/toastSlice';
import axiosInstance from '../../../../../app/config/axiosInstance';

type VechieleWithPage = any;

type ReturnedType = any;

interface Route {
  tourName: string;
  location: {
    locationAddress: string;
    lat: number;
    lng: number;
  };
  pickupWindow: {
    start: string;
    end: string;
  };
  tourType?: string;
}

const initialStates = {
  isLoading: false,
  data: [],
  error: null
};
interface RouteWithPage {
  payload: Route;
  pageDetails: { pageNo: number; pageSize: number };

  isRoundTour?: number;
  mode?: boolean;
  signal?: any;
}

interface Payload {
  pageNo: number;
  pageSize: number;
  tour?: number;
  vehicleNumber?: string;
  isRoundTour?: number;
}

// Define the structure of the data returned by the API
interface standardTourView {
  count: number;
  standardTourView?: any;
  vehicleConfigViews?: any;
}

interface Routes {
  status: string;
  data: standardTourView | null;
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

const initialStateRoute = {
  isLoading: false,
  data: null,
  error: null
};

// get route details
export const autoGetRouteAction = createAsyncThunk<AxiosResponse<any>, any>(
  'route',
  async (params, thunkApi) => {
    const { pageNo, pageSize, searchFor, tourType, sortBy, sortByField } = params;
    const queryParams: Record<string, string | number | boolean | undefined> = {
      pageNo,
      pageSize,
      searchFor,
      tourType,
      sortBy,
      sortByField
    };

    const filteredParams = Object.entries(queryParams)
      .filter(([key, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.ROUTE_CONFIGURATION}?${filteredParams}`
      });
      return response?.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const routeConfigureAddAction = createAsyncThunk<ReturnedType, RouteWithPage>(
  'route add',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${URLs.ROUTE_CONFIGURATION}`,
        data: data.payload
      });
      await thunkApi.dispatch(
        autoGetRouteAction({
          ...data?.pageDetails,
          tourType: data?.payload?.tourType
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

// Action function to update route configure
export const routeConfigureUpdateAction = createAsyncThunk<ReturnedType, RouteWithPage>(
  'route update',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `${URLs.ROUTE_CONFIGURATION}`,
        data: data.payload
      });
      await thunkApi.dispatch(
        autoGetRouteAction({
          ...data?.pageDetails,
          tourType: data?.payload?.tourType,
          signal: data?.signal
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
      if (error?.message !== 'canceled') {
        thunkApi.dispatch(
          updateToast({
            show: true,
            message: error.response.data?.message || error.response.data?.message,
            severity: 'error'
          })
        );
      }
      return thunkApi.rejectWithValue(error);
    }
  }
);

// Action function to delete route configure
export const routeConfigureDeleteAction = createAsyncThunk<ReturnedType, any>(
  'route delete',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'DELETE',
        url: `${URLs.ROUTE_CONFIGURATION}?tourId=${
          data.params.id
        }&tourName=${encodeURIComponent(data.params.tourName)}`
      });
      await thunkApi.dispatch(
        autoGetRouteAction({
          ...data.params,
          tourType: data.params.tourType
        })
      );
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

// route configure details slice
const routeConfigureSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    clearRouteConfigure: state => {
      state.data = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(autoGetRouteAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(autoGetRouteAction.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(autoGetRouteAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error;
      });
  }
});

// Add route configure
const addRouteConfigureSlice = createSlice({
  name: 'add route',
  initialState: initialStateRoute,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(routeConfigureAddAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        routeConfigureAddAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload?.data;
          state.error = null;
        }
      )
      .addCase(routeConfigureAddAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

// Update route configure
const updateRouteConfigureSlice = createSlice({
  name: 'route update',
  initialState: initialStateRoute,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(routeConfigureUpdateAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        routeConfigureUpdateAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload?.data;
          state.error = null;
        }
      )
      .addCase(routeConfigureUpdateAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

// delete route configure slice
const deleteRouteConfigureSlice = createSlice({
  name: 'route delete',
  initialState: initialStateRoute,
  reducers: {
    cleartourError: state => {
      state.data = null;
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(routeConfigureDeleteAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        routeConfigureDeleteAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload?.data;
          state.error = null;
        }
      )
      .addCase(routeConfigureDeleteAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

//Action For GET vechile configuration

export const autoGetVechicleAction = createAsyncThunk<AxiosResponse<any>, any>(
  'vehicle config',
  async (params, thunkApi) => {
    const { pageNo, pageSize, vehicleNumber: searchFor, sortBy, sortByField } = params;
    const queryParams: Record<string, string | number | boolean | undefined> = {
      pageNo,
      pageSize,
      searchFor,
      sortByField,
      sortBy
    };

    const filteredParams = Object.entries(queryParams)
      .filter(([key, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.GET_VECHILE_CONFIGURATION}${filteredParams}`
      });
      return response?.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

// import file to upload bulk agents through EXCELL
export const agentImportAction = createAsyncThunk<ReturnedType, any>(
  'autoplanner/importAgents',
  async (data, thunkApi) => {
    try {
      const formData = new FormData();
      if (data.file) {
        formData.append('file', data.file);
      }

      const response = await axiosInstance.post(
        `${URLs.IMPORT_AUTO_PLANNER_AGENTS}?role=${'ROLE_AGENT'}&skippingRows=${
          data.invalidRows
        }`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response?.data?.data;
    } catch (error: any) {
      if (error?.response?.data?.message)
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

// import Agent Excell slice
const importAutoPlannerAgents = createSlice({
  name: 'import auto planner trips',
  initialState: initialStates,
  reducers: {
    clearNewPickup: state => {
      state.data = [];
    }
  },
  extraReducers: builder => {
    builder
      .addCase(agentImportAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        agentImportAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload;
          state.error = null;
        }
      )
      .addCase(agentImportAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.data = action.payload?.response?.data?.data;
        state.error = action.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

//Slice for GET vechile configuration

const vechileConfigureSlice = createSlice({
  name: 'vehicle config',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(autoGetVechicleAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(autoGetVechicleAction.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(autoGetVechicleAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error;
      });
  }
});

//Action for Update Vechile

export const vechileConfigureUpdateAction = createAsyncThunk<
  ReturnedType,
  VechieleWithPage
>('vehicle config update', async (data, thunkApi) => {
  try {
    const response = await axiosInstance({
      method: 'PUT',
      url: `${URLs.UPDATE_VECHILE_CONFIGURATION}`,
      data: data.payload
    });

    await thunkApi.dispatch(
      autoGetVechicleAction({
        ...data?.pageDetails
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
});

//Slice for vechile Update

const updateVechileConfigureSlice = createSlice({
  name: 'vehicle config update',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(vechileConfigureUpdateAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        vechileConfigureUpdateAction.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload?.data;
          state.error = null;
        }
      )
      .addCase(vechileConfigureUpdateAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

//Action for Filter Route
export const autoFilterRoute = createAsyncThunk<AxiosResponse<any>, any>(
  'autoplannerFilterRoute',
  async (data, thunkApi) => {
    const {
      pageNo,
      pageSize,
      route,
      pickup,
      droplocation,
      picktime1,
      picktime2,
      droptime,
      signal
    } = data;

    const queryParams: Record<string, string | number | boolean | undefined> = {
      pageNo,
      pageSize,
      routeName: route,
      source: pickup,
      destination: droplocation,
      pickupStartTime: picktime1,
      pickupEndTime: picktime2,
      dropTime: droptime
    };

    const filteredParams = Object.entries(queryParams)
      .filter(([key, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.AUTOPLANNER_FILTER_ROUTE}${filteredParams}`,
        signal: signal
      });

      return response?.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

//Slice For Filter Route
const autoPlannerFilteredRoute = createSlice({
  name: 'autoplannerfilterRoute',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(autoFilterRoute.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        autoFilterRoute.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload;
          state.error = null;
        }
      )
      .addCase(autoFilterRoute.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error;
      });
  }
});

// Update Time Configuration
export const timeConfiguration = createAsyncThunk<AxiosResponse<any>, any>(
  'time configuration',
  async (params, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `${URLs.TIME_CONFIGURATION}cutoffTime=${params}`
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
      // thunkApi.dispatch(
      //   updateToast({
      //     show: true,
      //     message: response?.data?.message,
      //     severity: 'success'
      //   })
      // );
      return thunkApi.rejectWithValue(error);
    }
  }
);

// Time configure details slice
const timeConfigurationSlice = createSlice({
  name: 'time',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(timeConfiguration.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(timeConfiguration.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(timeConfiguration.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error;
      });
  }
});

// GET Time Configuration
export const gettimeConfiguration = createAsyncThunk<AxiosResponse<any>>(
  'GET time configuration',
  async (_, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.GET_TIME_CONFIGURATION}`
      });

      return response?.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

// Time configure details slice
const GETtimeConfigurationSlice = createSlice({
  name: ' GET time',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(gettimeConfiguration.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(gettimeConfiguration.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(gettimeConfiguration.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error;
      });
  }
});

export default routeConfigureSlice.reducer;
export const filterRoute = autoPlannerFilteredRoute.reducer;
export const addRouteConfigure = addRouteConfigureSlice.reducer;
export const agentBulkImport = importAutoPlannerAgents.reducer;
export const updateRouteConfigure = updateRouteConfigureSlice.reducer;
export const deleteRouteConfigure = deleteRouteConfigureSlice.reducer;
export const vechileconfiguration = vechileConfigureSlice.reducer;
export const configurableTime = timeConfigurationSlice.reducer;
export const vechileupdate = updateVechileConfigureSlice.reducer;
export const timeGETconfiguration = GETtimeConfigurationSlice.reducer;
export const { clearRouteConfigure } = routeConfigureSlice.actions;
export const { cleartourError } = deleteRouteConfigureSlice.actions;
