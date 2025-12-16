import { Tooltip, Typography } from '@mui/material';
import { useAppSelector } from '../../../../../app/redux/hooks';
import Actions from '../../../../../common/pages/user/management/components/reports/Actions';
import ToolTip from '../../../../../common/pages/user/management/components/reports/ToolTip';
import { convertTo12HourFormat } from '../../../../../utils/commonFunctions';

export const kmColumns = [
  {
    title: 'Date',
    field: 'date',
    headerName: 'Date',
    flex: 1,
    minWidth: 200
  },

  {
    title: 'Vehicle No.',
    field: 'deviceID',
    headerName: 'Vehicle No.',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Vehicle Type',
    field: 'vehicleType',
    headerName: 'Vehicle Type',
    flex: 1,
    minWidth: 120
  },
  {
    title: 'Driver Name',
    field: 'driverName',
    headerName: 'Driver Name',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Driver Contact No',
    field: 'drivercontact',
    headerName: 'Driver Contact No',
    flex: 1,
    minWidth: 200
  },

  {
    title: 'Total Distance Driven (Km)',
    field: 'distance',
    headerName: 'Total Distance Driven (Km)',
    flex: 1,
    minWidth: 200
  }
];

export const stoppageColumns = [
  {
    title: 'Date',
    field: 'date',
    headerName: 'Date',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Vehicle No.',
    field: 'deviceID',
    headerName: 'Vehicle No.',
    minWidth: 120,
    flex: 1
  },
  {
    title: 'Vehicle Type',
    field: 'vehicleType',
    headerName: 'Vehicle Type',
    flex: 1,
    minWidth: 120
  },
  {
    title: 'Driver Name',
    field: 'driverID',
    headerName: 'Driver Name',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Driver Contact No.',
    field: 'drivercontact',
    headerName: 'Driver Contact No.',
    flex: 1,
    minWidth: 200
  },

  {
    title: 'Stoppage Count',
    field: 'count',
    headerName: 'Stoppage Count',
    minWidth: 200,
    flex: 1
  }
];

export const engineColumns = [
  {
    title: 'Vehicle No.',
    field: 'deviceID',
    headerName: 'Vehicle No.',
    flex: 1,
    minWidth: 120
  },
  {
    title: 'Vehicle Type',
    field: 'vehicleType',
    headerName: 'Vehicle Type',
    flex: 1,
    minWidth: 140
  },
  {
    title: 'Fuel Type',
    field: 'engineType',
    headerName: 'Fuel Type',
    flex: 1,
    minWidth: 120
  },
  {
    title: 'Ignition Status',
    field: 'ignitionStatus',
    headerName: 'Ignition Status',
    flex: 1,
    minWidth: 150
  },

  {
    title: 'Start Date & Time',
    field: 'startTime',
    headerName: 'Start Date & Time',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'End Date & Time',
    field: 'endTime',
    headerName: 'End Date & Time',
    flex: 1,
    minWidth: 200
  },

  {
    title: 'Duration',
    field: 'duration',
    headerName: 'Duration',
    flex: 1,
    minWidth: 150
  },

  {
    title: 'Distance',
    field: 'distance',
    headerName: 'Distance Travelled (Km)',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Average Speed (Km/h)',
    field: 'averageSpeed',
    headerName: 'Average Speed (Km/h)',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Average Overspeed (Km/h)',
    field: 'hikeSpeed',
    headerName: 'Average Overspeed (Km/h)',
    flex: 1,
    minWidth: 200
  }
  // {
  //   title: 'Engine Location',
  //   field: 'actions',
  //   headerName: 'Engine Location',
  //   flex: 1,
  //   minWidth: 150,
  //   renderCell: (params: any) => Actions(params),
  //   sortable: false
  // }
];

export const idleColumns = [
  {
    title: 'Vehicle No.',
    field: 'deviceID',
    headerName: 'Vehicle No.',
    minWidth: 120,
    flex: 1
  },
  {
    title: 'Vehicle Type',
    field: 'vehicleType',
    headerName: 'Vehicle Type',
    flex: 1,
    minWidth: 120
  },
  {
    title: 'Driver Name',
    field: 'driver',
    headerName: 'Driver Name',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Driver Contact No.',
    field: 'drivercontact',
    headerName: 'Driver Contact No.',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Idle Start Date & Time',
    field: 'startTime',
    headerName: 'Idle Start Date & Time',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Idle End Date & Time',
    field: 'endTime',
    headerName: 'Idle End Date & Time',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Idle Duration',
    field: 'duration',
    headerName: 'Idle Duration',
    flex: 1,
    minWidth: 150
  },
  {
    title: 'Idle Location',
    field: 'actions',
    headerName: 'Idle Location',
    flex: 1,
    minWidth: 120,
    renderCell: (params: any) => Actions(params),
    sortable: false
  }
];

export const movementColumns = [
  {
    title: 'Movement Start Date & Time',
    field: 'startTime',
    headerName: 'Movement Start Date & Time',
    flex: 1,
    minWidth: 230
  },
  {
    title: 'Movement End Date & Time',
    field: 'endTime',
    headerName: 'Movement End Date & Time',
    flex: 1,
    minWidth: 230
  },

  {
    title: 'Vehicle No.',
    field: 'deviceID',
    headerName: 'Vehicle No.',
    flex: 1,
    minWidth: 120
  },
  {
    title: 'Vehicle Type',
    field: 'vehicleType',
    headerName: 'Vehicle Type',
    flex: 1,
    minWidth: 140
  },
  {
    title: 'Driver Name',
    field: 'driver',
    headerName: 'Driver Name',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Driver Contact No.',
    field: 'drivercontact',
    headerName: 'Driver Contact No.',
    flex: 1,
    minWidth: 200
  },

  {
    title: 'Movement Duration',
    field: 'duration',
    headerName: 'Movement Duration',
    flex: 1,
    minWidth: 180
  },

  {
    title: 'Average Speed (Km/h)',
    field: 'averageSpeed',
    headerName: 'Average Speed (Km/h)',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Average Overspeed (Km/h)',
    field: 'hikeSpeed',
    headerName: 'Average Overspeed (Km/h)',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Movement Location',
    field: 'actions',
    headerName: 'Movement Location',
    flex: 1,
    minWidth: 170,
    renderCell: (params: any) => Actions(params),
    sortable: false
  }
];

export const parkingColumns = [
  {
    title: 'Vehicle No.',
    field: 'deviceID',
    headerName: 'Vehicle No.',
    minWidth: 120,
    flex: 1
  },
  {
    title: 'Vehicle Type',
    field: 'vehicleType',
    headerName: 'Vehicle Type',
    flex: 1,
    minWidth: 120
  },
  {
    title: 'Driver Name',
    field: 'driverName',
    headerName: 'Driver Name',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Driver Contact No.',
    field: 'drivercontact',
    headerName: 'Driver Contact No.',
    flex: 1,
    minWidth: 200
  },

  {
    title: 'Parked Start Date & Time',
    field: 'startTime',
    headerName: 'Parked Start Date & Time',
    minWidth: 220,
    flex: 1
  },
  {
    title: 'Parked End Date & Time',
    field: 'endTime',
    headerName: 'Parked End Date & Time',
    minWidth: 220,
    flex: 1
  },
  {
    title: 'Total Parked Duration',
    field: 'duration',
    headerName: 'Total Parked Duration',
    minWidth: 190,
    flex: 1
  },
  {
    title: 'Parked Location',
    field: 'actions',
    headerName: 'Parked Location',
    flex: 1,
    minWidth: 120,
    renderCell: (params: any) => Actions(params),
    sortable: false
  }
];

export const overallColumns = [
  {
    title: 'Vehicle No.',
    field: 'deviceID',
    headerName: 'Vehicle No.',
    flex: 1,
    minWidth: 120
  },
  {
    title: 'Vehicle Type',
    field: 'vehicleType',
    headerName: 'Vehicle Type',
    flex: 1,
    minWidth: 140
  },
  {
    title: 'Driver Name',
    field: 'driver',
    headerName: 'Driver Name',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Driver Contact No.',
    field: 'drivercontact',
    headerName: 'Driver Contact No.',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Start Date & Time',
    field: 'startTime',
    headerName: 'Start Date & Time',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'End Date & Time',
    field: 'endTime',
    headerName: 'End Date & Time',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Duration',
    field: 'duration',
    headerName: 'Duration',
    flex: 1,
    minWidth: 150
  },

  {
    title: 'Average Speed (Km/h)',
    field: 'averagespeed',
    headerName: 'Average Speed (Km/h)',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Average Overspeed (Km/h)',
    field: 'hikeSpeed',
    headerName: 'Average Overspeed (Km/h)',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Vehicle Status',
    field: 'vehicleStatus',
    headerName: 'Vehicle Status',
    flex: 1,
    minWidth: 140
  },
  {
    title: 'Distance Travelled (Km)',
    field: 'distanceTravelled',
    headerName: 'Distance Travelled (Km)',
    flex: 1,
    minWidth: 200
  }
];

export const overspeedColumns = [
  {
    title: 'Vehicle No.',
    field: 'deviceID',
    headerName: 'Vehicle No.',
    minWidth: 120,

    flex: 1
  },
  {
    title: 'Vehicle Type',
    field: 'vehicleType',
    headerName: 'Vehicle Type',
    flex: 1,
    minWidth: 140
  },
  {
    title: 'Driver Name',
    field: 'driver',
    headerName: 'Driver Name',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Driver Contact No.',
    field: 'drivercontact',
    headerName: 'Driver Contact No.',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Road Type',
    field: 'roadType',
    headerName: 'Road Type',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Overspeed Start Date & Time',
    field: 'startTime',
    headerName: 'Overspeed Start Date & Time',
    flex: 1,
    minWidth: 235
  },
  {
    title: 'Overspeed End Date & Time',
    field: 'endTime',
    headerName: 'Overspeed End Date & Time',
    flex: 1,
    minWidth: 230
  },
  {
    title: 'Overspeed Duration',
    field: 'duration',
    headerName: 'Overspeed Duration',
    flex: 1,
    minWidth: 190
  },
  {
    title: 'Overspeed Distance(Km)',
    field: 'distance',
    headerName: 'Overspeed Distance(Km)',
    flex: 1,
    minWidth: 210
  },
  {
    title: 'Average Overspeed (Km/h)',
    field: 'averageSpeed',
    headerName: 'Average Overspeed (Km/h)',
    minWidth: 220,
    flex: 1
  },
  {
    title: 'Speed Limit(Km/h)',
    field: 'overspeed',
    headerName: 'Speed Limit(Km/h)',
    minWidth: 200,
    flex: 1
  }
];

export const alertColumns = [
  {
    title: 'Alert Date & Time',
    field: 'date',
    headerName: 'Alert Date & Time',
    flex: 1,
    minWidth: 200
  },

  {
    title: 'Vehicle No.',
    field: 'deviceID',
    headerName: 'Vehicle No.',
    minWidth: 120,
    flex: 1
  },
  {
    title: 'Driver Name',
    field: 'driver',
    headerName: 'Driver Name',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Driver Contact No.',
    field: 'drivercontact',
    headerName: 'Driver Contact No.',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Vehicle Type',
    field: 'vehicleType',
    headerName: 'Vehicle Type',
    flex: 1,
    minWidth: 120
  },
  {
    title: 'Alert Type',
    field: 'alertType',
    headerName: 'Alert Type',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Alert Details',
    field: 'alertDetails',
    headerName: 'Alert Details',
    flex: 1,
    minWidth: 170,
    renderCell: (params: any) => Actions(params),
    sortable: false
  }
];

export const tripColumns = [
  {
    title: 'Vehicle No.',
    field: 'deviceID',
    headerName: 'Vehicle No.',
    minWidth: 120,
    flex: 1
  },
  {
    title: 'Vehicle Type',
    field: 'vehicleType',
    headerName: 'Vehicle Type',
    minWidth: 150,
    flex: 1
  },
  {
    title: 'Driver Name',
    field: 'driverName',
    headerName: 'Driver Name',
    minWidth: 150,
    flex: 1
  },
  {
    title: 'Driver Contact No.',
    field: 'drivercontact',
    headerName: 'Driver Contact No.',
    flex: 1,
    minWidth: 200
  },

  {
    title: 'Trip ID',
    field: 'tripID',
    headerName: 'Trip ID',
    minWidth: 150,
    flex: 1
  },
  {
    title: 'Assigned Start Date & Time',
    field: 'assignedStartTime',
    headerName: 'Assigned Start Date & Time',
    flex: 1,
    minWidth: 230
  },
  {
    title: 'Actual Start Date & Time',
    field: 'actualStartTime',
    headerName: 'Actual Start Date & Time',
    flex: 1,
    minWidth: 220
  },
  {
    title: 'Assigned End Date & Time',
    field: 'assignedEndTime',
    headerName: 'Assigned End Date & Time',
    flex: 1,
    minWidth: 220
  },

  {
    title: 'Actual End Date & Time',
    field: 'actualEndTime',
    headerName: 'Actual End Date & Time',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Estimated Duration',
    field: 'estimatedDuration',
    headerName: 'Estimated Duration',
    flex: 1,
    minWidth: 170
  },
  {
    title: 'Actual Duration',
    field: 'actualDuration',
    headerName: 'Actual Duration',
    flex: 1,
    minWidth: 170
  },
  {
    title: 'Estimated Distance(Km)',
    field: 'estimatedDistance',
    headerName: 'Estimated Distance(Km)',
    flex: 1,
    minWidth: 220
  },

  {
    title: 'Actual Distance(Km)',
    field: 'actualDistance',
    headerName: 'Actual Distance(Km)',
    flex: 1,
    minWidth: 200
  },
  // {
  //   title: 'Stoppage Count',
  //   field: 'stoppageCount',
  //   headerName: 'Stoppage Count',
  //   flex: 1,
  //   minWidth: 200
  // },
  {
    title: 'Trip Route',
    field: 'actions',
    headerName: 'Trip Route',
    flex: 1,
    minWidth: 120,
    renderCell: (params: any) => Actions(params),
    sortable: false
  }
];

export const healthColumns = [
  {
    title: 'Vehicle No.',
    field: 'deviceID',
    headerName: 'Vehicle No.',
    minWidth: 120,
    flex: 1
  },
  {
    title: 'Vehicle Type',
    field: 'vehicleType',
    headerName: 'Vehicle Type',
    flex: 1,
    minWidth: 150
  },
  {
    title: 'Device IMEI No.',
    field: 'imei',
    headerName: 'Device IMEI No.',
    minWidth: 200,
    flex: 1
  },
  {
    title: 'Battery Level (in %)',
    field: 'batteryLevel',
    headerName: 'Battery Level (in %)',
    minWidth: 200,
    flex: 1
  },
  {
    title: 'Network Strength (in %)',
    field: 'networkStrength',
    headerName: 'Network Strength (in %)',
    minWidth: 200,
    flex: 1
  },
  {
    title: 'GPS Accuracy',
    field: 'gpsAccuracy',
    headerName: 'GPS Accuracy',
    minWidth: 180,

    flex: 1
  },
  {
    title: 'Device Status',
    field: 'deviceStatus',
    headerName: 'Device Status',
    minWidth: 200,
    flex: 1
  }
];

export const vehicleGeofenceColumns = [
  {
    title: 'Vehicle No.',
    field: 'vehicleNumber',
    headerName: 'Vehicle No.',
    minWidth: 120,
    flex: 1
  },
  {
    title: 'Vehicle Type',
    field: 'vehicleType',
    headerName: 'Vehicle Type',
    minWidth: 140,
    flex: 1
  },
  {
    title: 'Driver Name',
    field: 'driver',
    headerName: 'Driver Name',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Driver Contact No.',
    field: 'drivercontact',
    headerName: 'Driver Contact No.',
    flex: 1,
    minWidth: 200
  },

  {
    title: 'Geofence Name',
    field: 'geozoneName',
    headerName: 'Geofence Name',
    flex: 1,
    renderCell: (params: any) => ToolTip(params.row.geozoneName),
    minWidth: 150
  },
  {
    title: 'Geofence Type',
    field: 'geoZoneType',
    headerName: 'Geofence Type',
    flex: 1,
    minWidth: 150
  },

  {
    title: 'In Start Date & Time',
    field: 'inTime',
    headerName: 'In Start Date & Time',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Out Start Date & Time',
    field: 'outTime',
    headerName: 'Out Start Date & Time',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Duration',
    field: 'duration',
    headerName: 'Duration',
    minWidth: 150,
    flex: 1
  },
  {
    title: 'Distance Covered (Km)',
    field: 'distance',
    headerName: 'Distance Covered(Km)',
    minWidth: 200,
    flex: 1
  },
  {
    title: 'Geofence Radius(Km)',
    field: 'radius',
    headerName: 'Geofence Radius(Km)',
    minWidth: 200,
    flex: 1
  }
];

export const vehicleDetailsColumns = [
  {
    title: 'Vehicle No.',
    field: 'vehicleNumber',
    headerName: 'Vehicle No.',
    minWidth: 120,
    flex: 1
  },
  {
    title: 'Vehicle Type',
    field: 'vehicleType',
    headerName: 'Vehicle Type',
    minWidth: 140,
    flex: 1
  },
  {
    title: 'Vehicle Model',
    field: 'vehicleModel',
    headerName: 'Vehicle Model',
    minWidth: 140,
    flex: 1
  },
  {
    title: 'Vehicle Brand',
    field: 'brand',
    headerName: 'Vehicle Brand',
    minWidth: 150,
    flex: 1
  },
  {
    title: 'Vehicle Subtype',
    field: 'subType',
    headerName: 'Vehicle Subtype',
    minWidth: 150,
    flex: 1
  },
  {
    title: 'Manufactured Year',
    field: 'year',
    headerName: 'Manufactured Year',
    minWidth: 180,
    flex: 1
  },
  {
    title: 'Status',
    field: 'status',
    headerName: 'Status',
    minWidth: 180,
    flex: 1
  },
  {
    title: 'Odometer',
    field: 'odometer',
    headerName: 'Odometer (km)',
    minWidth: 200,
    flex: 1
  },
  {
    title: 'Mileage',
    field: 'mileage',
    headerName: 'Mileage (kmpl)',
    minWidth: 200,
    flex: 1
  },
  {
    title: 'Fuel Capacity',
    field: 'fuelCapacity',
    headerName: 'Fuel Capacity (litre)',
    minWidth: 200,
    flex: 1
  }
];

export const driverScorecardColumns = [
  {
    title: 'Driver Name',
    field: 'driverName',
    headerName: 'Driver Name',
    flex: 1,
    minWidth: 150
  },
  {
    title: 'Driver Contact No.',
    field: 'drivercontact',
    headerName: 'Driver Contact No.',
    flex: 1,
    minWidth: 200
  },

  {
    title: 'Date',
    field: 'date',
    headerName: 'Date',
    flex: 1,
    minWidth: 150
  },

  {
    title: 'Harsh Accelerating Count',
    field: 'harshAcceleration',
    headerName: 'Harsh Accelerating Count',
    flex: 1,
    minWidth: 220
  },
  {
    title: 'Harsh Cornering Count',
    field: 'harshCornering',
    headerName: 'Harsh Cornering Count',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Harsh Braking Count',
    field: 'harshBraking',
    headerName: 'Harsh Braking Count',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Overspeed Count',
    field: 'overSpeedDetails',
    headerName: 'Overspeed Count',
    flex: 1,
    minWidth: 180
  },
  {
    title: 'Idle Time',
    field: 'idleTime',
    headerName: 'Idle Time',
    flex: 1,
    minWidth: 180,
    renderCell: (params: any) => params.row.idleTime
  },
  {
    title: 'Performance Score',
    field: 'performanceScore',
    headerName: 'Performance Score',
    flex: 1,
    minWidth: 180
  },
  {
    title: 'Driver Rating',
    field: 'driverRating',
    headerName: 'Driver Rating',
    flex: 1,
    minWidth: 180
  }
];

export const driverIdentificationColumns = [
  {
    title: 'Vehicle No.',
    field: 'deviceID',
    headerName: 'Vehicle No.',
    minWidth: 120,
    flex: 1
  },
  {
    title: 'Date & Time',
    field: 'date',
    headerName: 'Date & Time',
    flex: 1,
    minWidth: 180
  },

  {
    title: 'Assigned Driver Name',
    field: 'assignedDriverName',
    headerName: 'Assigned Driver Name',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Assigned Driver Contact No.',
    field: 'assignedDriverContactNumber',
    headerName: 'Assigned Driver Contact No.',
    flex: 1,
    minWidth: 220
  },

  {
    title: 'Current Driver Name',
    field: 'currentDriverName',
    headerName: 'Current Driver Name',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Current Driver Contact No.',
    field: 'currentDriverContactNumber',
    headerName: 'Current Driver Contact No.',
    flex: 1,
    minWidth: 220
  },
  {
    title: 'Event Name',
    field: 'eventName',
    headerName: 'Event Name',
    flex: 1,
    minWidth: 150
  },
  {
    title: 'View Location',
    field: 'actions',
    headerName: 'View Location',
    flex: 1,
    minWidth: 120,
    renderCell: (params: any) => Actions(params),
    sortable: false
  }
];

export const tripComplianceColumns = [
  {
    title: 'Vehicle No.',
    field: 'deviceID',
    headerName: 'Vehicle No.',
    minWidth: 120,
    flex: 1
  },
  {
    title: 'Vehicle Type',
    field: 'vehicleType',
    headerName: 'Vehicle Type',
    minWidth: 150,
    flex: 1
  },

  {
    title: 'Driver Name',
    field: 'driverName',
    headerName: 'Driver Name',
    minWidth: 150,
    flex: 1
  },
  {
    title: 'Driver Contact No.',
    field: 'drivercontact',
    headerName: 'Driver Contact No.',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Trip ID',
    field: 'tripID',
    headerName: 'Trip ID',
    minWidth: 150,
    flex: 1
  },
  {
    title: 'Assigned Start Date & Time',
    field: 'assignedStartTime',
    headerName: 'Assigned Start Date & Time',
    flex: 1,
    minWidth: 230
  },
  {
    title: 'Actual Start Date & Time',
    field: 'actualStartTime',
    headerName: 'Actual Start Date & Time',
    flex: 1,
    minWidth: 220
  },
  {
    title: 'Assigned End Date & Time',
    field: 'assignedEndTime',
    headerName: 'Assigned End Date & Time',
    flex: 1,
    minWidth: 220
  },

  {
    title: 'Actual End Date & Time',
    field: 'actualEndTime',
    headerName: 'Actual End Date & Time',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Estimated Duration',
    field: 'estimatedDuration',
    headerName: 'Estimated Duration',
    flex: 1,
    minWidth: 170
  },
  {
    title: 'Actual Duration',
    field: 'actualDuration',
    headerName: 'Actual Duration',
    flex: 1,
    minWidth: 170
  },
  {
    title: 'Estimated Distance(Km)',
    field: 'estimatedDistance',
    headerName: 'Estimated Distance(Km)',
    flex: 1,
    minWidth: 220
  },

  {
    title: 'Actual Distance(Km)',
    field: 'actualDistance',
    headerName: 'Actual Distance(Km)',
    flex: 1,
    minWidth: 200
  },

  {
    title: 'Idle Duration',
    field: 'idleDuration',
    headerName: 'Idle Duration',
    flex: 1,
    minWidth: 170
  },
  {
    title: 'Parking Duration',
    field: 'parkingDuration',
    headerName: 'Parking Duration',
    flex: 1,
    minWidth: 170
  },
  {
    title: 'Driving Duration',
    field: 'drivingDuration',
    headerName: 'Driving Duration',
    flex: 1,
    minWidth: 170
  },
  {
    title: 'Completed Waypoints',
    field: 'completedWaypoints',
    headerName: 'Completed Waypoints',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Incomplete Waypoints',
    field: 'incompleteWaypoiNts',
    headerName: 'Incomplete Waypoints',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Stoppage Count',
    field: 'stoppageCount',
    headerName: 'Stoppage Count',
    flex: 1,
    minWidth: 200
  },
  {
    title: 'Trip Compliance (in %)',
    field: 'tripCompliance',
    headerName: 'Trip Compliance (in %)',
    flex: 1,
    minWidth: 220
  },
  {
    title: 'Trip Route',
    field: 'actions',
    headerName: 'Trip Route',
    flex: 1,
    minWidth: 120,
    renderCell: (params: any) => Actions(params),
    sortable: false
  }
];

export const externalVehicleColumns = [
  {
    title: 'Date',
    field: 'date',
    headerName: 'Date',
    flex: 1,
    minWidth: 120
  },
  {
    title: 'Vehicle No.',
    field: 'vehicleNumber',
    headerName: 'Vehicle No.',
    flex: 1,
    minWidth: 120
  },
  {
    title: 'No. of Tours',
    field: 'noOfTrips',
    headerName: 'No. of Tours',
    flex: 1,
    minWidth: 120
  },
  {
    title: 'Tour Details',
    field: 'tourDetails',
    headerName: 'Tour Details',
    flex: 1,
    minWidth: 120,
    sortable: false,
    renderCell: (params: any) => Actions(params)
  }
].map((item: any) => ({
  ...item,
  align: ['tourDetails']?.includes(item?.field) ? 'center' : 'left',
  headerAlign: ['tourDetails']?.includes(item?.field) ? 'center' : 'left'
}));

//columns for external vehicle tours
export const tourColumns = [
  {
    title: 'Tour Name',
    field: 'tourName',
    headerName: 'Tour Name',
    minWidth: 200,
    flex: 1,
    renderCell: ({ row }: any) => {
      return (
        <Tooltip title={row?.tourName}>
          <Typography
            sx={{ color: 'inherit', fontWeight: 400, fontSize: '12px', width: '200px' }}
            noWrap
          >
            {row.tourName}
          </Typography>
        </Tooltip>
      );
    }
  },
  {
    title: 'Tour Mode',
    field: 'mode',
    headerName: 'Tour Mode',
    minWidth: 150,
    flex: 1
  },

  {
    title: 'Tour Time',
    field: 'time',
    headerName: 'Tour Time',
    minWidth: 150,
    flex: 1,
    renderCell: ({ value }: any) => convertTo12HourFormat(value)
  },
  {
    title: 'Driver Name',
    field: 'driverName',
    headerName: 'Driver Name',
    minWidth: 150,
    flex: 1
  },
  {
    title: 'Driver Contact No.',
    field: 'driverContactNumber',
    headerName: 'Driver Contact No.',
    minWidth: 150,
    flex: 1
  },

  {
    title: 'Seating Capacity',
    field: 'seatingCapacity',
    headerName: 'Seating Capacity',
    minWidth: 150,
    flex: 1
  }
];
