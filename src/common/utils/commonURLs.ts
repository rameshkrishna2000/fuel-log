export const commonURLS = {
  // locin
  LOGIN: 'user/login/web',
  LOGOUT: 'user/logout/web',
  REFRESH_TOKEN: 'user/refresh/token',
  USER_MODULE_ACCESS: `user/management/get`,
  DRIVER_OTP: 'driver/otp/generate?',
  DRIVER_OTP_LOGIN: 'driver/otp/login',
  DRIVER_LOGOUT: 'driver/logout/all',

  // reset password
  FORGET_PASSWORD: 'user/password/forgot?username=',
  RESET_PASSWORD: 'user/password/reset',
  CHANGE_PASSWORD: 'user/password/change',
  OTP_VALIDATION: 'user/otp/validation',

  // my profile
  GET_MY_PROFILE: 'user/profile',
  PUT_MY_PROFILE: 'user/update/profile',
  SET_DEFAULT_VIEW: 'user/defaultView/update',
  GET_DEFAULT_VIEW: 'user/defaultView/get',
  // notification
  GET_USER_NOTIFICATION: 'user/get/notification/settings',
  PUT_USER_NOTIFICATION: 'user/notification/update/settings',
  NOTIFICATION_HISTORY: 'user/notification/v2/get?',
  AUTOPLANNER_NOTIFICATION: 'v1/autoplanner/notifications?count=',

  // contact us
  CONTACT_US: '/support/contact',

  //push notification
  TOPIC_SUBSCRIBE: 'user/notification/update/settings',

  //DRIVER LIST
  DRIVER_LIST: 'trip/available',

  // driver
  GET_UNMAP_VEHICLE: 'driver/mapping/get/vehicles',
  GET_DRIVERS: 'driver/v2/profile?',
  ACTIVE_DRIVERS: 'map/active/drivers',
  ADD_DRIVER: 'driver/add',
  UPDATE_DRIVER: 'driver/update?',
  DEACTIVE_DRIVER: 'driver/deactivate?',
  DEACTIVE_MAPPING_DRIVER: 'driver/mapping/delete?',
  MAP_DRIVER: 'driver/mapping/add?',
  DELETE_DRIVER: 'driver/delete?',
  DRIVER_TRIPS: 'driver/get/expired-upcoming',
  DRIVER_VALIDATION_Details: `/driver/validate/details?`,
  ASSIGN_VEHICLES: 'driver/vehicle/v2/mapping',
  ASSIGN_VEHICLE: 'driver/mapping/v2/vehicles',

  AUTOPLANNER_REPORT: `v1/autoplanner/schedule/mail?`,

  //Contact Number Validation
  CONATCT_VALIDATION: 'validation/format?field=contactNumber',

  // role based access
  GET_ROLES: `user/role/get/all`,
  ADD_ROLE: 'user/role/add',
  UPDATE_ROLE: 'user/role/update?',
  DELETE_ROLE: `user/role/delete?`,
  ROLES_DROPDOWN: `user/role/get/roles`,
  OPERATOR_ADMIN: 'user/management/operator-admin',

  // driver fuel
  ADD_UPDATE_DRIVER_FUEL: 'v1/autoplanner/fuel-entry',
  GET_FUEL_TYPE: 'v1/autoplanner/fuel-type',
  GET_PAYMENT_METHOD: 'v1/autoplanner/payment',
  GET_ALL_DRIVER_FUEL: 'v1/autoplanner/fuel-entry?',
  DELETE_DRIVER_FUEL: 'v1/autoplanner/fuel-entry?',
  VEHICLE_NUMBER_VALID: 'v1/autoplanner/fuel-entry/validate/vehicle?',
  GET_DRIVER_FUEL_DASHBOARD: 'v1/autoplanner/dashboard',
  GET_VEHICLE_DRIVER: 'v1/autoplanner/dashboard',
  ADD_FUEL_TYPE: 'v1/autoplanner/fuel-type',
  ADD_FUEL_STATION: 'v1/fuel-station',
  ADD_PAYMENT_METHOD: 'v1/autoplanner/payment',
  GET_FUEL_STATION: 'v1/fuel-station',
  UPDATE_FUEL_TYPE: 'v1/autoplanner/fuel-type',
  UPDATE_FUEL_STATION: 'v1/fuel-station',
  UPDATE_PAYMENT_METHOD: 'v1/autoplanner/payment',
  DELETE_FUEL_TYPE: 'v1/autoplanner/fuel-type?',
  DELETE_FUEL_STATION: 'v1/fuel-station?',
  DELETE_PAYMENT_METHOD: 'v1/autoplanner/payment?',
  DEACTIVATE_FUEL_TYPE: 'v1/autoplanner/fuel-type/status?',
  DEACTIVATE_FUEL_STATION: 'v1/fuel-station/status?',
  DEACTIVATE_PAYMENT_METHOD: 'v1/autoplanner/payment/status?',
  FUEL_EXCEL: 'v1/autoplanner/dashboard/fuel-entry/report',
  GET_TYPE_DROPDOWN: 'v1/autoplanner/fuel-type/dropdowns',
  GET_STATION_DROPDOWN: 'v1/fuel-station/dropdowns',
  GET_PAYMENT_DROPDOWN: 'v1/autoplanner/payment/dropdowns'
};
