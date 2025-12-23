import loginSlice, { addLogoutReducer, roleAccess } from './commonSlices/loginSlice';

import myProfileSlice from './commonSlices/myProfileSlice';

import forgotPasswordSlice, { otpValidData } from './commonSlices/forgotPasswordSlice';
import resetPasswordSlice from './commonSlices/resetPasswordSlice';

import changePasswordSlice from './commonSlices/changePasswordSlice';
import toastSlice from './commonSlices/toastSlice';

import websocketSlice from './commonSlices/websocketSlice';
import userNotificationSlice from './commonSlices/userNotificationSlice';

import themeReducer from './commonSlices/themeSlice';

import contactSlice from './commonSlices/contactUs';
import notificationSlice from './commonSlices/notificationSlice';

import { notificationAutoPlannerReducer } from './commonSlices/notificationSlice';

import { getDefaultViewData, setDefaultViewData } from './commonSlices/defaultViewSlice';
import {
  assignVehicleReducer,
  driverSlice,
  driverTripsData,
  driverValdationDetaisSlice,
  primaryVehicleReducer,
  secondaryVehicleReducer,
  vehicleListSlice
} from './commonSlices/driverSlice';
import mapThemeSlice from './commonSlices/mapThemeSlice';
import polygonSlice from './commonSlices/polygonSlice';
import polylineSlice from './commonSlices/polylineSlice';
import mapSlice from './commonSlices/mapSlice';
import circleSlice from './commonSlices/circleSlice';
import {
  addRoleReducer,
  deleteRoleReducer,
  getRolesReducer,
  operatorAdminReducer,
  rolesDropdownReducer,
  updateRoleReducer
} from './commonSlices/roleSlice';
import { reportDialog } from './commonSlices/reportSlice';
export const commonReducer = {
  theme: themeReducer,
  auth: loginSlice,

  forgetpassword: forgotPasswordSlice,
  resetpassword: resetPasswordSlice,
  changepassword: changePasswordSlice,
  otpvalid: otpValidData,
  myProfile: myProfileSlice,
  toast: toastSlice,
  websocket: websocketSlice,
  userNotification: userNotificationSlice,
  contactUs: contactSlice,
  notificationHistory: notificationSlice,
  notificationAutoplanner: notificationAutoPlannerReducer,
  setDefaultView: setDefaultViewData,
  getDefaultView: getDefaultViewData,
  logout: addLogoutReducer,
  unmapVehicle: vehicleListSlice,
  driver: driverSlice,
  driverValidationDetails: driverValdationDetaisSlice,
  driverTrips: driverTripsData,
  mapTheme: mapThemeSlice,
  circle: circleSlice,
  polygon: polygonSlice,
  polyline: polylineSlice,
  map: mapSlice,
  primaryVehicle: primaryVehicleReducer,
  secondaryVehicle: secondaryVehicleReducer,
  assignVehicle: assignVehicleReducer,
  RoleModuleAccess: roleAccess,
  getRoles: getRolesReducer,
  addRole: addRoleReducer,
  updateRole: updateRoleReducer,
  deleteRole: deleteRoleReducer,
  rolesUserId: rolesDropdownReducer,
  operaterAdmin: operatorAdminReducer,
  reportDialog
};
