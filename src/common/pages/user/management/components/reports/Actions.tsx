import { IconButton, Tooltip, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useAppDispatch } from '../../../../../../app/redux/hooks';

import { updatePolyline as actualPolyline } from '../../../../../redux/reducer/commonSlices/polylineSlice';
import {
  map,
  updateCenter,
  updateZoom
} from '../../../../../redux/reducer/commonSlices/mapSlice';
import { decode } from '@googlemaps/polyline-codec';
import { convertEpochToDateTime } from '../../../../../../utils/commonFunctions';
import { useEffect } from 'react';
import {
  setExternalVehicle,
  updateIsShowMap,
  updateWaypoints
} from '../../../../../redux/reducer/commonSlices/reportSlice';

const Actions = (rows: any) => {
  let { row } = rows;
  //waypoints for map view
  let waypoint = row?.waypoints
    ?.filter((item: any) => item?.wayPointsStatus !== 'InCompleted')
    .map((value: any, index: number) => ({
      id: index + 1,
      name: 'waypoints',
      lat: value.deliverableLat,
      lng: value.deliverableLng,
      info: {
        Mylocation: `Waypoint ${index + 1}`,
        'Waypoint Status': value?.wayPointsStatus,
        'Arrival Status': value?.deliverableStatus,
        'Expected Arrival Time': convertEpochToDateTime(
          value?.deliverableTime,
          row?.timezone
        ),
        'Actual Arrival Time': convertEpochToDateTime(
          value?.actualDeliveryTime,
          row?.timezone
        ),
        'Time Difference': value?.delayInSecs
      }
    }));

  //location for map view
  let locations =
    row?.type === 'TripCompliance' || row?.type === 'TripDetails'
      ? [
          {
            id: 'source',
            name: 'trips',
            lat: row?.source?.lat,
            lng: row?.source?.lon,
            info: {
              Mylocation: row?.vehicleNumber && row?.vehicleNumber.toUpperCase(),
              heading: 'Started at :',
              Time: row?.actualStartTime && row?.actualStartTime
            }
          },
          ...waypoint,
          {
            id: 'destination',
            name: 'trips',
            lat: row?.destination?.lat,
            lng: row?.destination?.lon,
            info: {
              Mylocation: row?.vehicleNumber && row?.vehicleNumber.toUpperCase(),
              heading: 'Arrived at :',
              Time: row?.actualEndTime && row?.actualEndTime
            }
          }
        ]
      : [
          {
            id: 'source',
            name: 'trips',
            lat: row?.startLat,
            lng: row?.startLng,
            info: {
              Mylocation: row?.vehicleNumber && row?.vehicleNumber.toUpperCase(),
              heading: 'Started at :',
              Time: row?.startTime
            }
          },
          {
            id: 'destination',
            name: 'trips',
            lat: row?.endLat,
            lng: row?.endLng,
            info: {
              Mylocation: row?.vehicleNumber && row?.vehicleNumber.toUpperCase(),
              heading: 'Arrived at :',
              Time: row?.endTime
            }
          }
        ];
  const dispatch = useAppDispatch();

  // decoded polylines for map view

  let plannedPath =
    row?.plannedEncodedPolyline &&
    decode(row?.plannedEncodedPolyline)?.map(([lat, lng]: any) => ({
      lat,
      lng
    }));

  let actualPath =
    row?.actualRouteEncodedPolyline &&
    decode(row?.actualRouteEncodedPolyline).map(([lat, lng]: any) => ({
      lat,
      lng
    }));

  let polylines = [
    {
      id: 'planned',
      color: '#0f53ff',
      path: plannedPath
    },
    {
      id: 'actual',
      color: 'red',
      path: actualPath
    }
  ];

  const center = plannedPath && actualPath && [...plannedPath, ...actualPath];

  //markers for map view
  let markers =
    row?.type === 'Movement' || row?.type === 'Engine'
      ? [
          {
            id: 1,
            vehicleNo: row?.deviceID,
            lat: row?.startLat,
            lng: row?.startLng,
            name: 'report',
            type: 'myplace',
            info: {
              Mylocation: `${row?.deviceID}`,
              lat: row?.startLat,
              lng: row?.startLng
            }
          },
          {
            id: 2,
            vehicleNo: row?.deviceID,
            lat: row?.endLat,
            lng: row?.endLng,
            name: 'report',
            type: 'myplace',
            info: {
              Mylocation: `${row?.deviceID}`,
              lat: row?.endLat,
              lng: row?.endLng
            }
          }
        ]
      : row?.type === 'Logistics'
      ? [
          {
            id: row?.company,
            lat: row?.latitude,
            lng: row?.longitude,
            name: 'report',
            type: 'myplace',
            info: {
              Mylocation: `${row?.company}`,
              lat: row?.latitude,
              lng: row?.longitude
            }
          }
        ]
      : row?.type === 'Load'
      ? [
          {
            id: row?.pickUpDate,
            lat:
              rows?.field === 'deliveryAddress'
                ? row?.endLat
                : rows?.field === 'pickUpAddress' && row?.startLat,
            lng:
              rows?.field === 'deliveryAddress'
                ? row?.endLng
                : rows?.field === 'pickUpAddress' && row?.startLng,
            name: 'report',
            type: 'myplace',
            info: {
              Mylocation: `${row?.pickUpDate}`,
              lat:
                rows?.field === 'deliveryAddress'
                  ? row?.endLat
                  : rows?.field === 'pickUpAddress' && row?.startLat,
              lng:
                rows?.field === 'deliveryAddress'
                  ? row?.endLng
                  : rows?.field === 'pickUpAddress' && row?.startLng
            }
          }
        ]
      : [
          {
            id: row?.deviceID,
            lat: row?.lat,
            lng: row?.lng,
            name: 'report',
            type: 'myplace',
            info: {
              Mylocation: `${row?.deviceID}`,
              lat: row?.lat,
              lng: row?.lng
            }
          }
        ];

  let alertType = row?.alertType;
  let alertDetails = row?.alertDetails;
  let directions =
    row?.type === 'Movement'
      ? [
          { lat: row?.startLat, lng: row?.startLng },
          { lat: row?.endLat, lng: row?.endLng }
        ]
      : [];

  //function to handle map view
  const handleMapView = () => {
    if (row?.type === 'TripCompliance' || row?.type === 'TripDetails') {
      dispatch(updateIsShowMap(true));
      dispatch(actualPolyline(polylines));
      dispatch(updateCenter(center));
      dispatch(updateZoom(center));
      dispatch(updateWaypoints(locations));
    } else if (row?.type === 'Movement') {
      dispatch(updateIsShowMap(true));
      dispatch(actualPolyline(directions));
      dispatch(updateWaypoints(locations));
      dispatch(updateCenter(directions));
      dispatch(updateZoom(directions));
    } else if (row?.type === 'externalVehicle') {
      dispatch(setExternalVehicle(row));
    } else {
      dispatch(updateIsShowMap(true));
      dispatch(map(markers));
      dispatch(updateCenter(markers));
      dispatch(updateZoom(markers));
    }
  };

  useEffect(() => {
    return () => {
      dispatch(actualPolyline([]));
      dispatch(map([]));
      dispatch(updateWaypoints([]));
    };
  }, []);

  return (
    <>
      {alertType === 'Over Speed' ||
      alertType === 'Fence In Alarm' ||
      alertType === 'Fence Out Alarm' ||
      alertType === 'Low battery Alarm' ? (
        <Tooltip title={alertDetails} arrow>
          <Typography fontSize={'13px'}>{alertDetails}</Typography>
        </Tooltip>
      ) : (
        <Tooltip title='View' placement='right' arrow>
          <IconButton id='basic-button' onClick={handleMapView}>
            <Icon icon='bx:trip' className='menu-icon view' />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};

export default Actions;
