import { Box, Dialog, DialogContent } from '@mui/material';
import GoogleMap from '../maps/googlemap/GoogleMap';
import CustomIconButton from '../buttons/CustomIconButton';
import GoogleMarkers from '../maps/googlemarkers/GoogleMarkers';
import { useAppSelector } from '../../../app/redux/hooks';
import GoogleCircle from '../maps/googlecircle/GoogleCircle';
import GoogleTripDirections from '../maps/googledirection/GoogleTripDirections';
import GooglePolygon from '../maps/googlepolygon/GooglePolygon';
import GooglePolyline from '../maps/googlepolyline/GooglePolyline';
import { convertEpochToDateString } from '../../../utils/commonFunctions';
import CustomTripDetails from '../customtripdetails/CustomTripDetails';
import './CustomDialog.scss';
import MapLegends from '../maps/googlemap/components/MapLegends';

interface Location {
  coordinates: object;
}

interface RowData {
  code: string;
  destination: string;
  endGeoZoneColor: string;
  endGeoZoneRadius: number;
  endLatitude: number;
  endLongitude: number;
  endTime: number;
  id: number;
  isActive: number;
  notificationStatus: number;
  source: string;
  tripType: string;
  startGeoZoneColor: string;
  startGeoZoneRadius: number;
  startLatitude: number;
  startLongitude: number;
  startTime: number;
  startTimestamp: number;
  endTimestamp: number;
  tripID: number;
  tripPathLatAndLngDetails: any[];
  tripStatus: string;
  userID: string;
  vehicleNumber: string;
  waypointDetails: any[];
}

interface Props {
  readonly view?: boolean;
  readonly handleViewClose?: () => void;
  readonly locations?: Location | any;
  readonly tripsData?: Location | any;
  readonly isShowTrip?: boolean;
  readonly isShowDelivery?: boolean;
  readonly isShowMarker?: boolean;
  readonly isShowPolyline?: boolean;
  readonly singleLatLng?: any;
  isGoogleMap?: boolean;
  type?: boolean;
  selectedRow?: any;
  rowData?: RowData;
  isShowMap?: boolean;
  maplegend?: boolean;
  module?: string;
}

interface Waypoint {
  location?: Location;
  stopover: boolean;
}

function CustomDialog({
  view,
  handleViewClose,
  locations,
  tripsData,
  isShowDelivery,
  isShowMarker,
  isShowTrip,
  type,
  selectedRow,
  isGoogleMap = true,
  maplegend,
  isShowMap,
  module,
  rowData
}: Props) {
  const { isShow } = useAppSelector(state => state.circle);
  const { paths } = useAppSelector(state => state.polyline);

  const waypts: Waypoint[] = [];
  const checkboxArray: Location[] = locations;

  if (locations != null && !isShowMap && !isShowDelivery) {
    for (let i = 1; i < checkboxArray?.length - 1; i++) {
      const { coordinates, ...rest } = locations[i];
      const { lat, lng } = coordinates;

      // Create a new object with lat and lng as separate properties
      const newOrderDetails = {
        ...rest,
        lat,
        lng
      };

      waypts.push({
        location: newOrderDetails,
        stopover: false
      });
    }
  }
  const waypoints =
    rowData?.waypointDetails?.map((value: any, index: number) => ({
      id: index + 1,
      name: 'waypoint',
      lat: value.waypointLat,
      lng: value.waypointLng,
      info: { Mylocation: `Waypoint ${index + 1}`, isCompleted: value.isCompleted },
      dAddress: value.waypointAddress
    })) || [];

  const locationData: any = [
    {
      id: 'source',
      name: 'trips',
      lat: rowData?.startLatitude,
      lng: rowData?.startLongitude,
      info: {
        Mylocation: rowData?.vehicleNumber && rowData?.vehicleNumber.toUpperCase(),
        heading: 'Starts at :',
        Time: rowData?.startTimestamp && convertEpochToDateString(rowData?.startTimestamp)
      }
    },
    ...waypoints,
    {
      id: 'destination',
      name: 'trips',
      lat: rowData?.endLatitude,
      lng: rowData?.endLongitude,
      info: {
        Mylocation: rowData?.vehicleNumber && rowData?.vehicleNumber.toUpperCase(),
        heading: 'Expected arrival :',
        Time: rowData?.endTimestamp && convertEpochToDateString(rowData?.endTimestamp)
      }
    }
  ];

  const tourData = [
    {
      id: 'source',
      lat: selectedRow?.startLat,
      lng: selectedRow?.startLng,
      name: 'trip',
      info: { Mylocation: 'source' }
    },
    {
      id: 'destination',
      lat: selectedRow?.endLat,
      lng: selectedRow?.endLng,
      name: 'trip',
      info: { Mylocation: 'Destination' }
    }
  ];

  return (
    <Dialog
      open={view ?? false}
      onClose={handleViewClose}
      BackdropProps={{
        invisible: true
      }}
      className='dialog'
    >
      <DialogContent className='dialogContent'>
        <Box className='closeIcon d-flex' onClick={handleViewClose}>
          <CustomIconButton category='CloseValue' />
        </Box>
        <Box sx={{ width: '100%', height: '100%' }}>
          {isGoogleMap ? (
            <GoogleMap maplegend={maplegend}>
              {isShowMarker && <GoogleMarkers />}
              {((rowData?.id &&
                ['Completed', 'In Complete']?.includes(rowData?.tripType)) ||
                module === 'trips') && <MapLegends module='trips' />}

              {paths?.length > 0 && <GooglePolyline />}

              {isShowDelivery && <GoogleTripDirections locations={locations} />}

              {isShowMap && (
                <GoogleTripDirections
                  origin={tripsData.source}
                  locations={locations}
                  destination={tripsData.destination}
                />
              )}

              {isShowTrip && <GooglePolyline />}
              {isShowTrip && <GoogleTripDirections locations={locations} />}

              {rowData && (
                <GoogleTripDirections
                  origin={tripsData?.source}
                  destination={tripsData?.destination}
                  locations={locationData}
                />
              )}

              {isShow && !isShowMarker ? <GoogleCircle /> : ''}

              {isShow && type ? <GooglePolygon /> : ''}

              {/* {rowData?.id && rowData?.tripType === 'Scheduled' && (
                <CustomDetailedCard rowData={rowData} data={data} showActivate={true} />
              )} */}
              <GoogleMarkers />
              {/* <OrderStatusCard /> */}
            </GoogleMap>
          ) : (
            <>
              <GoogleMap>
                <GoogleTripDirections
                  locations={tourData}
                  isDraggable={false}
                  showPath={true}
                />
              </GoogleMap>
              <CustomTripDetails selectedRow={selectedRow} />
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default CustomDialog;
