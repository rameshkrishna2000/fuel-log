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
import {
  addDriverFuelReducer,
  addFuelExcelReducer,
  addFuelStationReducer,
  addFuelTypeReducer,
  addPaymentMethodReducer,
  deleteDriverFuelReducer,
  deleteFuelStationReducer,
  deleteFuelTypeReducer,
  deletePaymentMethodReducer,
  getAllDriverFuel,
  getAllDriverFuelDashboardReducer,
  getAllDriverFuelReducer,
  getFuelStationReducer,
  getFuelTypeReducer,
  getPaymentDropdownReducer,
  getPaymentMethodReducer,
  getStationDropdownReducer,
  getTypeDropdownReducer,
  getVehicleDriverReducer,
  updateDriverFuelReducer,
  updateFuelStationReducer,
  updateFuelTypeReducer,
  updatePaymentMethodReducer,
  vehicleNumberValidReducer
} from './commonSlices/driverFuelSlice';
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
  reportDialog,
  addDriverFuel: addDriverFuelReducer,
  getFuelType: getFuelTypeReducer,
  getPaymentMethod: getPaymentMethodReducer,
  getAllDriverFuel: getAllDriverFuelReducer,
  deleteDriverFuel: deleteDriverFuelReducer,
  updateDriverFuel: updateDriverFuelReducer,
  vehicleNumberValid: vehicleNumberValidReducer,
  getAllDriverFuelDashboard: getAllDriverFuelDashboardReducer,
  getVehicleDriver: getVehicleDriverReducer,
  getFuelStation: getFuelStationReducer,
  addFuelType: addFuelTypeReducer,
  addFuelStation: addFuelStationReducer,
  addPaymentMethod: addPaymentMethodReducer,
  updateFuelType: updateFuelTypeReducer,
  updateFuelStation: updateFuelStationReducer,
  updatePaymentMethod: updatePaymentMethodReducer,
  deleteFuelType: deleteFuelTypeReducer,
  deleteFuelStation: deleteFuelStationReducer,
  deletePaymentMethod: deletePaymentMethodReducer,
  addFuelExcel: addFuelExcelReducer,
  getTypeDropdown: getTypeDropdownReducer,
  getStationDropdown: getStationDropdownReducer,
  getPaymentDropdown: getPaymentDropdownReducer
};
