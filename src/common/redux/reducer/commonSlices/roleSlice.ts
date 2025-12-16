import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../../../app/config/axiosInstance';
import URLs from '../../../../utils/appURLs';
import { updateToast } from './toastSlice';

type ReturnedType = any;
type ThunkArg = {};

type initialStateProps = {
  isLoading: boolean;
  data: any;
  error: string | null;
};

export interface AxiosResponse<T = any, D = any> {
  data: T;
  status: number;
  statusText: string;
}

const initialState: initialStateProps = {
  isLoading: false,
  data: [],
  error: null
};

type initialStatePropsRoles = {
  isLoading: boolean;
  data: any;
  error: string | null;
};

const initialStateRoles: initialStateProps = {
  isLoading: false,
  data: [],
  error: null
};

// get roles
export const getRoles = createAsyncThunk<any>('getRoles', async (data, thunkApi) => {
  try {
    let response = await axiosInstance({
      method: 'GET',
      url: `${URLs.GET_ROLES}`
    });
    return response.data.data;
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
});

//get role slice

const getRoleSlice = createSlice({
  name: 'getRoles',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getRoles.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(getRoles.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
      state.error = null;
    });
    builder.addCase(getRoles.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'something went wrong';
    });
  }
});

// add roles
export const addRole = createAsyncThunk<ReturnedType, ThunkArg>(
  'addroles',
  async (data, thunkApi) => {
    try {
      let response = await axiosInstance({
        method: 'POST',
        url: `${URLs.ADD_ROLE}`,
        data
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.message,
          severity: 'success'
        })
      );
      return response.data.data;
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

//add role slice

const addRoleSlice = createSlice({
  name: 'addroles',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(addRole.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(addRole.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
      state.error = null;
    });
    builder.addCase(addRole.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'something went wrong';
    });
  }
});

// update roles
export const updateRole = createAsyncThunk<ReturnedType, any>(
  'updateroles',
  async (data, thunkApi) => {
    try {
      let response = await axiosInstance({
        method: 'PUT',
        url: `${URLs.UPDATE_ROLE}roleId=${data.id}`,
        data: data?.featureAccessList
      });

      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.error,
          severity: 'success'
        })
      );
      return response.data.data;
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

//update role slice

const updateRoleSlice = createSlice({
  name: 'updateroles',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(updateRole.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(updateRole.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
      state.error = null;
    });
    builder.addCase(updateRole.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'something went wrong';
    });
  }
});

// Delete roles
export const deleteRole = createAsyncThunk<ReturnedType, any>(
  'deleteroles',
  async (data, thunkApi) => {
    try {
      let response = await axiosInstance({
        method: 'DELETE',
        url: `${URLs.DELETE_ROLE}roleId=${data?.id}`
      });

      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response?.data?.error,
          severity: 'success'
        })
      );
      return response.data.data;
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

//delete role slice

const deleteRoleSlice = createSlice({
  name: 'deleteroles',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(deleteRole.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(deleteRole.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
      state.error = null;
    });
    builder.addCase(deleteRole.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'something went wrong';
    });
  }
});

// get roles dropdown
export const getRolesDropdown = createAsyncThunk<any>(
  'getrolesall',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.ROLES_DROPDOWN}`
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

// get operator admin
export const getOperatorAdmin = createAsyncThunk<any>(
  'getOperatorAdmins',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.OPERATOR_ADMIN}`
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

// get Operator Admin slice
const getOperatorAdminSlice = createSlice({
  name: 'getOperatorAdmin',
  initialState: initialStateRoles,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getOperatorAdmin.pending, state => {
        state.isLoading = true;
        state.data = [];
      })
      .addCase(getOperatorAdmin.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.data = action?.payload;
        state.error = null;
      })
      .addCase(getOperatorAdmin.rejected, (state, action: any) => {
        state.isLoading = false;
        state.data = [];
        state.error = action.payload?.response?.data.error || 'Something went wrong';
      });
  }
});

// get roles dropdown slice
const getRoleDropdownSlice = createSlice({
  name: 'getrolesall',
  initialState: initialStateRoles,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getRolesDropdown.pending, state => {
        state.isLoading = true;
        state.data = [];
      })
      .addCase(getRolesDropdown.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.data = action?.payload;
        state.error = null;
      })
      .addCase(getRolesDropdown.rejected, (state, action: any) => {
        state.isLoading = false;
        state.data = [];
        state.error = action.payload?.response?.data.error || 'Something went wrong';
      });
  }
});

// User Roles Configuration
export const userRoleGETAction = createAsyncThunk<AxiosResponse<any>, any>(
  'user role',
  async (params, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.AGENT_ROLES}roleId=${params}`
      });
      return response?.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

// Time configure details slice
const UserRoleSlice = createSlice({
  name: 'userRole',
  initialState,
  reducers: {
    resetUserRoleState: state => {
      state.data = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(userRoleGETAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(userRoleGETAction.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(userRoleGETAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.error;
      });
  }
});

export const getRolesReducer = getRoleSlice.reducer;
export const addRoleReducer = addRoleSlice.reducer;
export const updateRoleReducer = updateRoleSlice.reducer;
export const userRoleGET = UserRoleSlice.reducer;
export const deleteRoleReducer = deleteRoleSlice.reducer;
export const rolesDropdownReducer = getRoleDropdownSlice.reducer;
export const operatorAdminReducer = getOperatorAdminSlice.reducer;
export const { resetUserRoleState } = UserRoleSlice.actions;
