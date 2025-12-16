import { PayloadAction, createAsyncThunk, createSlice, current } from '@reduxjs/toolkit';
import axiosInstance from '../../../../app/config/axiosInstance';
import URLs from '../../../../utils/appURLs';
import { updateToast } from './toastSlice';
import { convertEpochToDateString } from '../../../../utils/commonFunctions';

const serviceContext = import.meta.env.VITE_APP_SERVICE_CONTEXT;

type ReturnedType = any;

export interface Driver {
  contactEmail: string;
  contactPhone: string;
  createdAT?: any;
  driverID?: string;
  firstName: string;
  lastName: string;
  isActive?: number;
  licenseExpire: any;
  licenseNumber: string;
  licenseType: string;
  vehicleNumber?: string;
  insuranceExpire?: number | any;
  medicalExpire?: number | any;
}

export interface DriverProbs {
  payload: Driver;
}

type ThunkArgs = { updatePayload: Driver; driverID: any };

type initialStateProps = {
  isLoading: boolean;
  type:
    | 'drivers'
    | 'save-driver'
    | 'driver-mapping'
    | 'active-driver'
    | 'delete-driver'
    | 'remove-mapping';
  data: any;
  error: string | null;
};

export interface VehicleListType {
  isLoading: boolean;
  vehicleList: string[] | [];
  error: string | null;
}

const vehicleState: VehicleListType = {
  isLoading: false,
  vehicleList: [],
  error: null
};

const initialState: initialStateProps = {
  isLoading: false,
  type: 'drivers',
  data: [],
  error: null
};

interface DeactivateDriver {
  driverid: string;
  signal?: any;
}
interface DeleteDriver {
  driverid: string;
  signal?: any;
}
interface MappingDeactivateDriver {
  vehicleNumber: string;
  signal?: any;
}

interface MappingDriver {
  vehicleNumber: string;
  driverId: string;
  signal?: any;
}

interface AssignVehicles {
  primaryVehicle: string;
  secondaryVehicles: string[];
  driverId: string;
  signal?: any;
}

interface validationDriver {
  isLoading: boolean;
  data: null | any;
  error: null | any;
  validationErrors: any;
  contactEmail: any;
  contactPhone: any;
  licenseNumber: any;
  userName: any;
  vehicleNumber: any;
}

const driverValidationState: validationDriver = {
  isLoading: false,
  data: [],
  error: null,
  contactEmail: {
    fieldName: '',
    error: '',
    status: true
  },
  contactPhone: {
    fieldName: '',
    error: '',
    status: true
  },
  userName: {
    fieldName: '',
    error: '',
    status: true
  },
  licenseNumber: {
    fieldName: '',
    error: '',
    status: true
  },
  vehicleNumber: {
    fieldName: '',
    error: '',
    status: true
  },
  validationErrors: {
    contactEmail: '',
    contactPhone: '',
    licenseNumber: ''
  }
};

export const getDriver = createAsyncThunk<any, any>(
  'api/driver',
  async (data, thunkApi) => {
    const { signal, search, sortBy, sortByField, pageNo, pageSize } = data;
    const queryParams: Record<string, string | number | boolean | undefined> = {
      searchInput: search,
      sortFieldName: sortByField,
      sortDirection: sortBy
    };
    const filteredParams = Object.entries(queryParams)
      .filter(([key, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    let url = `${serviceContext}${URLs.GET_DRIVERS}pageno=${pageNo}&pagesize=${pageSize}`;
    if (filteredParams) {
      url += `&${filteredParams}`;
    }
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: url,
        signal: signal
      });
      return response?.data?.data;
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

export const addDriver = createAsyncThunk<ReturnedType, DriverProbs>(
  'add/driver',
  async (data, thunkApi) => {
    const { payload } = data;
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${serviceContext}${URLs.ADD_DRIVER}`,
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
      return response?.data?.data;
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

export const driverValidation = createAsyncThunk<any, any>(
  'driver/validation',
  async (data, thunkAPi) => {
    const { category, value, operation, driverID } = data;
    const values = encodeURIComponent(value);
    let url = `${URLs.DRIVER_VALIDATION_Details}category=${category}&value=${values}&operation=${operation}`;
    if (driverID) {
      url += `&driverID=${driverID}`;
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

const driverValidationSlice = createSlice({
  name: 'drivervalidation',
  initialState: driverValidationState,
  reducers: {
    clearMailError: state => {
      state.data = null;
    },
    clearVehicleValidation: state => {
      state.vehicleNumber = null;
    },
    setValidationErrors: (state, action) => {
      if (action.payload.fieldName === 'contactEmail') {
        state.contactEmail = action.payload;
      }
      if (action.payload.fieldName === 'userName') {
        state.userName = action.payload;
      }
      if (action.payload.fieldName === 'contactPhone')
        state.contactPhone = action.payload;
      if (action.payload.fieldName === 'licenseNumber')
        state.licenseNumber = action.payload;
      if (action.payload.fieldName === 'vehicleNumber')
        state.vehicleNumber = action.payload;
    }
  },
  extraReducers: builder => {
    builder.addCase(driverValidation.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(driverValidation.fulfilled, (state, action: any) => {
      state.isLoading = false;
      state.data = action?.payload;
      state.error = null;
    });
    builder.addCase(driverValidation.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action?.payload?.response?.data?.error || 'Something went wrong';
    });
  }
});

export const deleteDriver = createAsyncThunk<ReturnedType, DeleteDriver>(
  'delete/driver',
  async ({ driverid }, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'DELETE',
        url: `${serviceContext}${URLs.DELETE_DRIVER}driverid=${driverid}`
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
export const updateDriver = createAsyncThunk<ReturnedType, ThunkArgs>(
  'update/driver',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `${serviceContext}${URLs.UPDATE_DRIVER}driverId=${data.driverID}`,
        data: data?.updatePayload
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response.data?.message,
          severity: 'success'
        })
      );
      return response?.data;
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

export const deactivateDriver = createAsyncThunk<ReturnedType, DeactivateDriver>(
  'deactive/driver',
  async ({ driverid }, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'PATCH',
        url: `${serviceContext}${URLs.DEACTIVE_DRIVER}driverid=${driverid}`
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response.data?.message,
          severity: 'success'
        })
      );
      return response?.data;
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

export const getUnmapVehicle = createAsyncThunk<any, any>(
  'api/unmapVehicle',
  async (signal, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${serviceContext}${URLs.GET_UNMAP_VEHICLE}`,
        signal: signal
      });
      return response?.data;
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

export const mapDriver = createAsyncThunk<ReturnedType, MappingDriver>(
  'map/driver',
  async ({ driverId, vehicleNumber }, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${serviceContext}${URLs.MAP_DRIVER}driverId=${driverId}&vehicleNumber=${vehicleNumber}`
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response.data?.message,
          severity: 'success'
        })
      );
      return response?.data?.data;
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

export const mappingDeactivateDriver = createAsyncThunk<
  ReturnedType,
  MappingDeactivateDriver
>('mappingdeactive/driver', async ({ vehicleNumber }, thunkApi) => {
  try {
    const response = await axiosInstance({
      method: 'PATCH',
      url: `${serviceContext}${URLs.DEACTIVE_MAPPING_DRIVER}vehicleNumber=${vehicleNumber}`
    });
    thunkApi.dispatch(
      updateToast({
        show: true,
        message: response.data?.message,
        severity: 'success'
      })
    );
    return response?.data;
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
});

const driver = createSlice({
  name: 'driver',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Get Driver:
      .addCase(getDriver.pending, state => {
        state.isLoading = true;
        state.data = [];
        state.type = 'drivers';
      })
      .addCase(getDriver.fulfilled, (state, action: PayloadAction<Driver[]>) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getDriver.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error || 'Something went wrong';
      })
      // Add Driver:
      .addCase(addDriver.pending, state => {
        state.isLoading = true;
        state.type = 'save-driver';
      })
      .addCase(addDriver.fulfilled, (state, action: PayloadAction<ReturnedType>) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(addDriver.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.response?.data?.error || 'Something went wrong';
      })
      // Update Driver:
      .addCase(updateDriver.pending, state => {
        state.isLoading = true;
        state.type = 'save-driver';
      })
      .addCase(updateDriver.fulfilled, (state, action: PayloadAction<ReturnedType>) => {
        state.isLoading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(updateDriver.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.response?.data?.error || 'Something went wrong';
      })
      // delete Driver:
      .addCase(deleteDriver.pending, state => {
        state.isLoading = true;
        state.type = 'delete-driver';
      })
      .addCase(deleteDriver.fulfilled, (state, action: PayloadAction<ReturnedType>) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deleteDriver.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.response?.data?.error || 'Something went wrong';
      })
      // Deactive Driver
      .addCase(deactivateDriver.pending, state => {
        state.isLoading = true;
        state.type = 'active-driver';
        state.error = null;
      })
      .addCase(
        deactivateDriver.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload.data;
        }
      )
      .addCase(deactivateDriver.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.response?.data?.error || 'Something went wrong';
      })
      // Mapping Driver
      .addCase(mapDriver.pending, state => {
        state.isLoading = true;
        state.type = 'driver-mapping';
      })
      .addCase(mapDriver.fulfilled, (state, action: PayloadAction<ReturnedType>) => {
        state.isLoading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(mapDriver.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.response?.data?.error || 'Something went wrong';
      })
      // Mapping Deactivate Driver
      .addCase(mappingDeactivateDriver.pending, state => {
        state.isLoading = true;
        state.error = null;
        state.type = 'remove-mapping';
      })
      .addCase(
        mappingDeactivateDriver.fulfilled,
        (state, action: PayloadAction<ReturnedType>) => {
          state.isLoading = false;
          state.data = action.payload.data;
          state.error = null;
        }
      )
      .addCase(mappingDeactivateDriver.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

export const vehicleUnmapList = createSlice({
  name: 'vehiclelist',
  initialState: vehicleState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getUnmapVehicle.pending, state => {
        state.isLoading = true;
      })
      .addCase(getUnmapVehicle.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.isLoading = false;
        state.vehicleList = data;
      })
      .addCase(getUnmapVehicle.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

//action to get trips based on driver
export const driverTripsAction = createAsyncThunk<any, any>(
  'drivertrips',
  async (data, thunkApi) => {
    const { driverid, pageno, pagesize } = data;
    try {
      const response = axiosInstance({
        method: 'GET',
        url: `${URLs.DRIVER_TRIPS}?driverid=${driverid}&pageNo=${pageno}&pageSize=${pagesize}`
      });
      return response;
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

const driverTripState = {
  rows: [],
  isLoading: false,
  error: null
};

//reducer to get trips of driver
const driverTripsSlice = createSlice({
  name: 'drivertrips',
  initialState: driverTripState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(driverTripsAction.pending, state => {
        state.isLoading = true;
        state.rows = [];
      })
      .addCase(driverTripsAction.fulfilled, (state, action) => {
        const {
          data: {
            data: { tripDetailsList }
          }
        } = action.payload;

        state.rows = tripDetailsList?.map((item: any, index: number) => ({
          ...item,
          id: item?.tripID,
          startTime: convertEpochToDateString(item.startTime),
          endTime: convertEpochToDateString(item.endTime),
          startTimestamp: item.startTime,
          endTimestamp: item.endTime,
          tripCode: item?.code
        }));
        state.isLoading = false;
      })
      .addCase(driverTripsAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error;
      })
});

// action for assign vehicle primary vehicle
export const primaryVehicle = createAsyncThunk<any, any>(
  'api/primaryVehicle',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.ASSIGN_VEHICLE}?isPrimary=true&driverId=${data}`
      });
      return response?.data?.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

// slice for assign vehicle primary vehicle
export const primaryVehicleSlice = createSlice({
  name: 'primaryVehicle',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(primaryVehicle.pending, state => {
        state.isLoading = true;
        state.data = [];
      })
      .addCase(primaryVehicle.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(primaryVehicle.rejected, (state, action: any) => {
        state.isLoading = false;
        state.data = [];
        state.error = action.payload?.response?.data.error || 'Something went wrong';
      });
  }
});

// action for assign vehicle primary vehicle
export const secondaryVehicle = createAsyncThunk<any, any>(
  'api/secondaryVehicle',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.ASSIGN_VEHICLE}?isPrimary=false&driverId=${data}`
      });
      return response?.data?.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

// slice for assign vehicle primary vehicle
export const secondaryVehicleSlice = createSlice({
  name: 'secondaryVehicle',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(secondaryVehicle.pending, state => {
        state.isLoading = true;
        state.data = [];
      })
      .addCase(secondaryVehicle.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(secondaryVehicle.rejected, (state, action: any) => {
        state.isLoading = false;
        state.data = [];
        state.error = action.payload?.response?.data.error || 'Something went wrong';
      });
  }
});

// action for assign vehicle
export const assignVehicle = createAsyncThunk<ReturnedType, AssignVehicles>(
  'api/assignVehicle',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `${URLs.ASSIGN_VEHICLES}`,
        data
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response.data?.message,
          severity: 'success'
        })
      );
      return response?.data?.data;
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

const assignVehicleSlice = createSlice({
  name: 'assignVehicle',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(assignVehicle.pending, state => {
        state.isLoading = true;
        state.type = 'driver-mapping';
      })
      .addCase(assignVehicle.fulfilled, (state, action: PayloadAction<ReturnedType>) => {
        state.isLoading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(assignVehicle.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.response?.data?.error || 'Something went wrong';
      });
  }
});

export const vehicleListSlice = vehicleUnmapList.reducer;
export const driverSlice = driver.reducer;
export const driverTripsData = driverTripsSlice.reducer;
export const primaryVehicleReducer = primaryVehicleSlice.reducer;
export const secondaryVehicleReducer = secondaryVehicleSlice.reducer;
export const assignVehicleReducer = assignVehicleSlice.reducer;

// driver field validation

export const driverValdationDetaisSlice = driverValidationSlice.reducer;

export const { clearMailError, clearVehicleValidation, setValidationErrors } =
  driverValidationSlice.actions;
