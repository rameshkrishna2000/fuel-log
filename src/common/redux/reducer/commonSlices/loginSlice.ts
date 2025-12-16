import { PayloadAction, createAsyncThunk, createSlice, current } from '@reduxjs/toolkit';
import axiosInstance from '../../../../app/config/axiosInstance';
import URLs from '../../../../utils/appURLs';
import { updateToast } from './toastSlice';

type ReturnedType = any;
const token = localStorage.getItem('token');

type ThunkArg = {
  roleType?: string;
  userID?: string;
  password?: string;
  firebaseToken?: string | null;
  fireBaseToken?: string | null;
  keepMeLogin?: boolean;
  refreshToken?: string | null;
};

type User = {
  expiresIn: number;
  name: string;
  token: string;
  userId: string;
  role: string;
  defaultView: string;
};

type initialStateProps = {
  isLoading: boolean;
  data: User | null;
  error: string | null;
  status: null;
};

const initialState: initialStateProps = {
  isLoading: false,
  data: null,
  error: null,
  status: null
};

type roleInitialStateModule = {
  isLoading: boolean;
  data: User | null | any;
  featureData: any;
  error: string | null;
  features: any;
  roleData: any;
  existingFeatures: any;
  roleID: any;
  category: any;
  company: string;
  loginAccess: boolean;
};
const roleInitialState: roleInitialStateModule = {
  isLoading: false,
  data: null,
  error: null,
  featureData: [],
  features: [],
  roleData: [],
  existingFeatures: {},
  roleID: [],
  category: null,
  company: '',
  loginAccess: false
};

export const getLogin = createAsyncThunk<ReturnedType, ThunkArg>(
  'user/login',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `${URLs.LOGIN}`,
        data
      });
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: response.data?.message,
          severity: 'success'
        })
      );
      return response?.data?.data[0];
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

export const getRoleAccess = createAsyncThunk<ReturnedType, ThunkArg>(
  'role/access',
  async (data, thunkApi) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.USER_MODULE_ACCESS}`
      });
      // thunkApi.dispatch(
      //   updateToast({
      //     show: true,
      //     message: response.data?.message,
      //     severity: 'success'
      //   })
      // );
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

const getRoleModuleAccess = createSlice({
  name: 'roleAccess',
  initialState: roleInitialState,
  reducers: {
    feature: (state: any, action: any) => {
      let updatedObj: any = {};
      const roleModules = [
        'summary',
        'schedule',
        'tour',
        'regular',
        'vehicle',
        'pickup',
        'driver'
      ];
      current(state).data?.forEach((features: any, index: number) => {
        features?.modules
          ?.filter((feature: any) => action.payload?.includes(features.featureName))
          .map((module: any, moduleIndex: number) => {
            const existedKeys = Object.keys(updatedObj);
            if (existedKeys.includes(module.moduleName)) {
              updatedObj[module.moduleName] = {
                ...updatedObj[module.moduleName],
                id: module?.moduleId,
                moduleId: module?.moduleId,
                [features.featureName]: [
                  { action: 'GET', checked: false, disabled: true },
                  { action: 'ADD', checked: false, disabled: true },
                  { action: 'UPDATE', checked: false, disabled: true },
                  { action: 'PATCH', checked: false, disabled: true },
                  { action: 'DELETE', checked: false, disabled: true }
                ]
              };
            } else {
              updatedObj[module.moduleName] = {
                id: module?.moduleId,
                module: module.moduleName,
                moduleId: module?.moduleId,
                disabled: !roleModules?.includes(module.moduleName),
                checked: !roleModules?.includes(module.moduleName),
                [features.featureName]: [
                  {
                    action: 'GET',
                    checked: !roleModules?.includes(module.moduleName) ? true : false,
                    disabled: true
                  },
                  {
                    action: 'ADD',
                    checked: !roleModules?.includes(module.moduleName) ? true : false,
                    disabled: true
                  },
                  {
                    action: 'UPDATE',
                    checked: !roleModules?.includes(module.moduleName) ? true : false,
                    disabled: true
                  },
                  {
                    action: 'PATCH',
                    checked: !roleModules?.includes(module.moduleName) ? true : false,
                    disabled: true
                  },
                  {
                    action: 'DELETE',
                    checked: !roleModules?.includes(module.moduleName) ? true : false,
                    disabled: true
                  }
                ]
              };
              return updatedObj;
            }
          });
      });
      state.existingFeatures = updatedObj;

      state.features = Object.values(updatedObj)
        ?.map((value: any, index: number) => ({
          ...value,
          id: index + 1
        }))
        ?.filter((modules: any) => modules.module !== 'user');
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getRoleAccess.pending, state => {
        state.isLoading = true;
        state.data = null;
      })
      .addCase(getRoleAccess.fulfilled, (state, action) => {
        state.isLoading = false;
        let updatedObj: any = {};

        let featureValues = action.payload?.featureResponseList?.map((feature: any) => ({
          featureId: feature.featureId,
          featureName: feature.featureName,
          description: feature.description,
          modules: feature.modules.map((module: any) => ({
            moduleId: module.moduleId,
            moduleName: module.moduleName,
            accessType: module.accessType
          }))
        }));
        state.category = action.payload?.category;

        state.company = action?.payload?.companyName;
        state.loginAccess = true;

        state.roleData = action.payload;
        state.roleID = action.payload?.userProfileResponse.id;
        state.featureData = featureValues?.map((values: any, index: number) => ({
          ...values,
          id: index + 1
        }));
        state.data = action.payload?.featureResponseList;
      })
      .addCase(getRoleAccess.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.error.message || 'Something went wrong';
      });
  }
});

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    accessStatus: (state, action) => {
      state.status = action.payload;
    }
  },
  extraReducers: builder => {
    builder.addCase(getLogin.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(getLogin.fulfilled, (state, action: PayloadAction<User>) => {
      let { token, expiresIn, defaultView, role }: any = action.payload;
      localStorage.setItem('token', token);
      localStorage.setItem('defaultView', defaultView);
      localStorage.setItem('role', role);
      localStorage.setItem('expiresIn', expiresIn?.toString());
      state.isLoading = false;
      state.data = action.payload;
      state.error = '';
    });
    builder.addCase(getLogin.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action?.payload?.response?.data?.error || 'Network error';
    });
  }
});

//logoutchnages

// action for logout
//action for logout
export const addLogout = createAsyncThunk<ReturnedType, ThunkArg>(
  'add/logout',
  async (data, thunkApi) => {
    const { fireBaseToken } = data;
    try {
      const response: any = await axiosInstance({
        method: 'POST',
        url: `${URLs.LOGOUT}?fireBaseToken=${fireBaseToken}`,
        data,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      thunkApi.rejectWithValue(error);
    }
  }
);

//action for logout
// export const addLogout = createAsyncThunk<ReturnedType, ThunkArg>(
//   'add/logout',
//   async (data, thunkApi) => {
//     const { fireBaseToken } = data;
//     try {
//       const response: any = await axiosInstance({
//         method: 'POST',
//         url: `${URLs.LOGOUT}?fireBaseToken=${fireBaseToken}`,
//         data,
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       return response;
//     } catch (error) {
//       thunkApi.rejectWithValue(error);
//     }
//   }
// );

// action for push notification logout
// export const addLogout = createAsyncThunk<ReturnedType, ThunkArg>(
//   'add/logout',
//   async (data, thunkApi) => {
//     try {
//       const response = await axiosInstance({
//         method: 'POST',
//         url: `${URLs.LOGOUT}`,
//         data
//       });
//       thunkApi.dispatch(
//         updateToast({
//           show: true,
//           message: response?.data?.message,
//           severity: 'success'
//         })
//       );
//       return response;
//     } catch (error: any) {
//       thunkApi.dispatch(
//         updateToast({
//           show: true,
//           message: error?.response?.data?.error
//             ? error?.response?.data?.error
//             : error?.message,
//           severity: 'error'
//         })
//       );
//       return thunkApi.rejectWithValue(error);
//     }
//   }
// );

//slice for logout

//slice for logout
const addLogoutSlice = createSlice({
  name: 'logout',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(addLogout.pending, state => {
        state.isLoading = true;
        state.data = null;
      })
      .addCase(addLogout.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(addLogout.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.error.message || 'Something went wrong';
      });
  }
});

// slice for push notification logout
// const addLogoutSlice = createSlice({
//   name: 'logout',
//   initialState: initialState,
//   reducers: {},
//   extraReducers: builder => {
//     builder.addCase(addLogout.pending, state => {
//       state.isLoading = true;
//     });
//     builder.addCase(addLogout.fulfilled, (state, action: any) => {
//       state.data = action.payload.data;
//       state.isLoading = false;
//       state.error = null;
//     });
//     builder.addCase(addLogout.rejected, (state, action: any) => {
//       state.error = action.error.message || 'Something went wrong';
//       state.isLoading = false;
//     });
//   }
// });

export default loginSlice.reducer;
export const addLogoutReducer = addLogoutSlice.reducer;
export const roleAccess = getRoleModuleAccess.reducer;
export const { feature } = getRoleModuleAccess.actions;
export const { accessStatus } = loginSlice.actions;
