export const autoPlannerURLs = {
  // auto planner
  GET_SIC_TSIC_TRIP: 'v1/autoplanner/standard/groups?',
  GET_BOOKINGS_TRIP: 'v1/autoplanner/standard/bookings?',
  GET_GRP_BOOKINGS: 'v1/autoplanner/custom/bookings?',
  GET_ALL_BOOKINGS: 'v1/autoplanner/allBookings?',
  GET_AUTO_PLANNERTRIP: 'v1/autoplanner/trip',
  ADD_AUTO_PLANNERTRIP: 'v1/autoplanner/trips',
  UPDATE_AUTO_PLANNERTRIP: 'v1/autoplanner/trips',
  DELETE_AUTO_PLANNERTRIP: 'v1/autoplanner/trips?',
  IMPORT_AUTO_PLANNER_TRIPS: 'v1/autoplanner/upload-trips',
  AUTOPLANNER_FILTER: 'v1/autoplanner/trip/groups?',
  AUTOPLANNER_SORTED_GROUPTRIPS: 'v1/autoplanner/trip/groups?',
  NEW_PICKUP_LOCATION_FIND: 'v1/autoplanner/coordinates/pickup',
  EXTERNAL_VEHICLE_VALIDATION: 'validation/external/driver?',

  // tour summary
  GET_INITIAL_TOUR_SUMMARY: 'v1/autoplanner/summary/tours?',
  GET_TOUR_SUMMARY_PROCCED: 'v1/autoplanner/summary/assign/async?',
  GET_TOUR_SUMMARY_PROCCED_RESULT: 'v1/autoplanner/summary/assign/result?',
  GET_TOUR_SUMMARY_SAVE: 'v1/autoplanner/summary/save?',
  GET_TRANSFER_VEHICLES: 'v1/autoplanner/mode/vehicles?',
  GET_SUMMARY_DRIVERS: 'v1/autoplanner/schedule/driver/dropdown',
  ASSIGN_SUMMARY_DRIVERS: 'v1/autoplanner/driver/mapping/update',
  SUMMARY_DRIVERS_LIST: 'v1/autoplanner/schedule/driver/dropdown?',
  DRIVER_REASSIGN: 'driver/mapping/update?',
  DOWNLOAD_SUMMARY: 'v1/autoplanner/summary/download?',
  ASYNC_SUCCESS: 'v1/autoplanner/poll/async?',

  // auto generate
  GET_AUTO_PLANNERTRIP_SCHEDULE: 'v1/autoplanner/schedule',
  GET_AUTO_PLANNERTRIP_SWITCH: 'v1/autoplanner/schedule/bookings/all?',
  SCHEDULE_BOOKING_UPDATE: 'v1/autoplanner/schedule/bookings',
  SCHEDULE_UPDATE: 'v1/autoplanner/schedule/standard',
  GET_MODE_VEHICLE: 'v1/autoplanner/mode/vehicles?',
  GET_DRIVEDROPDOWN: 'v1/autoplanner/schedule/availableDrivers',
  SCHEDULE_UPDATE_BOOKINGS: 'v1/autoplanner/schedule/bookings',
  SCHEDULE_DELETE: 'v1/autoplanner/schedule/standard',
  SCHEDULE_BOOKING_DELETE: 'v1/autoplanner/schedule/standard/booking',
  SIC_BOOKINGS_UPDATE: 'v1/autoplanner/schedule/standard/booking',
  PVT_GRP_UPDATE: 'v1/autoplanner/schedule/custom/booking',
  STANDARD_VEHICLES: 'v1/autoplanner/schedule/dropdown',
  GET_AVAILABLE_SUMMARY: '/v1/autoplanner/summary/meta',
  GET_VEHICLE_DROPDOWN: 'v1/autoplanner/schedule/all/vehicle?',
  GET_EXCEL: 'v1/autoplanner/schedule/bookings/all?',
  GET_MAIN_HOTELS: 'v1/autoplanner/schedule/mainHotels?',
  GET_SCHEDULED_DRIVER: 'v1/autoplanner/schedule/driver?',
  GET_TOURAGENT_DROPDOWN: 'v1/autoplanner/schedules/filter/dropdown?',
  SENT_AGENT_NOTIFICATION: 'v1/autoplanner/schedule/notifyAgents?',
  SEND_WHATSAPP: 'autoplanner/generate/share-trip?',
  DELETE_SUMMARY: 'v1/autoplanner/summary?',
  UPDATE_SHARE_TRIP: 'autoplanner/share-trip/update',
  PUBLISH_TRIPS: 'v1/autoplanner/schedule/publish?',

  // auto planner route configuration
  ROUTE_CONFIGURATION: 'v1/autoplanner/tour',
  AUTOPLANNER_FILTER_ROUTE: 'v1/autoplanner/tour?',

  //auto planner vechile configuration
  GET_VECHILE_CONFIGURATION: 'v1/autoplanner/vehicle?',
  UPDATE_VECHILE_CONFIGURATION: 'v1/autoplanner/vehicle',

  //auto planner vehile management
  GET_VEHICLE_MANAGEMENT: 'v1/autoplanner/vehicle/info?',
  UPDATE_VEHICLE_MANAGEMENT: 'v1/autoplanner/vehicle/service?',

  //auto planner pickup location configuration
  PICKUP_CONFIGURATION: 'v1/autoplanner/coordinates/pickup',

  //autoplanner Agent
  AUTOPLANNER_AGENT: 'user/management/fetch?',
  ADD_AGENT: 'user/management/onboard',
  UPDATE_AGENT: 'user/management/update',
  DELETE_AGENT: 'user/management/delete',
  AGENT_ROLES: 'user/role/get?',
  // IMPORT_AUTO_PLANNER_AGENTS: 'v1/autoplanner/agent/upload',
  IMPORT_AUTO_PLANNER_AGENTS: 'user/management/upload',
  AGENT_VALIDATION: 'user/management/validate?',
  RATE_CARDS: 'v1/rate-card/get/ratecardNames',
  TIME_CONFIGURATION: 'v1/autoplanner/time/config?',
  GET_TIME_CONFIGURATION: 'v1/autoplanner/time/config',

  //Share Trip
  Trip_Tracking: 'trip/link/validation?',
  LIVE_TRACKING: 'autoplanner/tracking/share-trip?',
  TRIP_END: 'autoplanner/sharetrip/end?',

  //External vehicle report
  EXTERNAL_VEHICLE_REPORT: 'v1/autoplanner/report/externalVehicle?',
  AUTOPLANNER_PDF_EXCEL: `v1/autoplanner/report/download?`,

  //Vehicle onboard Slice
  IMEI_DROPDOWN: 'vehicle/onboard/get/devices',
  SIM_DROPDOWN: 'vehicle/onboard/get/sim',
  PLAN_ID_DROPDOWN: 'vehicle/onboard/get/plan',
  VEHICLE_MAKE_DROPDOWN: 'vehicle/onboard/dropdown/details',
  VEHICLE_MODEl_DROPDOWN: 'vehicle/onboard/dropdown/details?',
  ADD_VEHICLE: 'vehicle/onboard/add',
  UPDATE_VEHICLE: 'v1/autoplanner/vehicle',
  DEACTIVATE_VEHICLE: 'v1/autoplanner/vehicle?',
  DELETE_VEHICLE: 'vehicle/onboard/delete?',

  //Driver Dashboard
  DRIVER_DASHBOARD: 'driver/autoplanner/jobs?',
  DRIVER_DASHBOARD_UPDATE: 'driver/autoplanner/jobs',
  //Regular mode
  CONFIGURABLE_VEHICLES: 'v1/autoplanner/configurableMode/vehicleDropdown',
  REGULAR_DRIVERS: 'v1/autoplanner/configurableMode/driverDropdown',
  ADD_REGULAR_TOUR: 'v1/autoplanner/configurableMode',

  //today tours
  GET_TODAY_TOURS: 'v1/autoplanner/schedule/current?',
  TODAY_DRIVER_DROPDOWN: 'v1/autoplanner/schedule/availableDrivers',

  //adhoc vehicle
  ADHOC_VEHICLE_DROPDOWN: 'v1/autoplanner/adhoc/vehicle',
  ADHOC_TRANSFER_VEHICLES: 'v1/autoplanner/adhoc/transfer',
  ADD_ADHOC_VEHICLE: 'v1/autoplanner/adhoc/booking',

  //Rate Card
  GET_VEHICLES_SEATERS: 'v1/rate-card/get/seating',
  GET_TOUR_LIST: 'v1/rate-card/get/tourNames',
  GET_RATE_CARD: 'v1/rate-card/get',
  DELETE_RATE_CARD: 'v1/rate-card/delete',
  ADD_RATE_CARD: 'v1/rate-card',
  UPDATE_RATE_CARD: 'v1/rate-card/update'
};
