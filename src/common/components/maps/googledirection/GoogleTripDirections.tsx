import React, { useEffect, useState } from 'react';
import { DirectionsRenderer, InfoWindow, MarkerF } from '@react-google-maps/api';
import GoogleInfoWindow from '../googleinfowindow/GoogleInfoWindow';
import CompletedMarker from '../../../../app/assets/images/markers/completed.png';
import MarkerSvg from '../../../../app/assets/images/markers/markersvg.svg';
import pin from '../.../../../../../app/assets/images/markers/pin.png';
import { findAddress } from '../../../../utils/commonFunctions';
import { useAppDispatch } from '../../../../app/redux/hooks';
import { updateToast } from '../../../redux/reducer/commonSlices/toastSlice';

interface Location {
  lat: number;
  lng: number;
}

interface GoogleDirectionsProps {
  origin?: Location;
  destination?: Location;
  locations?: any[];
  waypoints?: any[];
  distance?: boolean;
  isDraggable?: boolean;
  setTripMarker?: any;
  clearStartAndEndDate?: () => void;
  handleMarker?: (e: any, marker: any) => void;
  showPath?: boolean;
  hideSource?: boolean;
  setWaypoints?: any;
}

interface HandleMarkerClickProps {
  id: number;
  lat: number;
  lng: number;
  info: string[];
}

const GoogleTripDirections: React.FC<GoogleDirectionsProps> = ({
  locations,
  isDraggable,
  waypoints,
  setTripMarker,

  handleMarker,
  setWaypoints,
  showPath = false,
  hideSource = false,
  clearStartAndEndDate
}) => {
  // component state
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [color, SetCOlor] = useState(false);

  const dispatch = useAppDispatch();

  const handleMarkerClick = ({ id }: HandleMarkerClickProps) => {
    setSelectedDevice(id);
  };

  const handleCloseInfoWindow = () => setSelectedDevice(null);

  const customIcon = {
    url: CompletedMarker,
    scaledSize: new google.maps.Size(60, 60)
  };

  const waypointAddress = async (lat: number, lng: number) => {
    const address = await findAddress(lat, lng);
    return address;
  };

  const deliveryMarkers = (
    id: string,
    index: number,
    name: string,
    lat: number,
    lng: number,
    color: string
  ) => {
    return {
      icon: {
        path: 'M27.648 -41.399q0 -3.816 -2.7 -6.516t-6.516 -2.7 -6.516 2.7 -2.7 6.516 2.7 6.516 6.516 2.7 6.516 -2.7 2.7 -6.516zm9.216 0q0 3.924 -1.188 6.444l-13.104 27.864q-0.576 1.188 -1.71 1.872t-2.43 0.684 -2.43 -0.684 -1.674 -1.872l-13.14 -27.864q-1.188 -2.52 -1.188 -6.444 0 -7.632 5.4 -13.032t13.032 -5.4 13.032 5.4 5.4 13.032z',
        fillColor: color,
        fillOpacity: 1.0,
        scale: 0.6
        // strokeWeight: 2,
      }
    };
  };

  const findRoute = async () => {
    try {
      const directionsService = new window.google.maps.DirectionsService();
      if (locations?.length === 2) {
        const routes = await directionsService.route({
          origin: locations[0],
          destination: locations[1],
          travelMode: window.google.maps.TravelMode.DRIVING
        });
        setDirections(routes);
      }
    } catch (error) {
      dispatch(
        updateToast({
          show: true,
          message: 'Please choose another locations',
          severity: 'error'
        })
      );
    }
  };

  useEffect(() => {
    if (showPath) findRoute();
  }, [locations, showPath]);

  useEffect(() => {
    return () => {
      setSelectedDevice(null);
    };
  }, []);

  return (
    <>
      {directions && locations?.length === 2 ? (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            preserveViewport: true,
            polylineOptions: {
              strokeColor: '#3239ea',
              strokeOpacity: 1,
              strokeWeight: 3
            }
          }}
        />
      ) : (
        ''
      )}
      {locations &&
        locations?.map((waypoint: any, index) => {
          const { id, name, lat = 0, lng = 0, info, status, color, type }: any = waypoint;
          let title = info?.[0]?.split(' ')?.pop();
          if (hideSource && id === 'source') {
            return null;
          }
          return (
            <MarkerF
              icon={
                type === 'deliverytracking'
                  ? {
                      url:
                        status === 'STOP_COMPLETE'
                          ? `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
           <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24"><path fill="${color}" d="m16.966 18.047l1.187-1.174A8.707 8.707 0 1 0 5.84 4.56a8.707 8.707 0 0 0 0 12.314q.444.444 1.102 1.09l3.491 3.396a2.25 2.25 0 0 0 3.128 0a657 657 0 0 0 3.406-3.312M15.22 7.961a.75.75 0 0 1 1.133.976l-.073.085l-5 5a.75.75 0 0 1-.976.072l-.084-.072l-2.5-2.5a.75.75 0 0 1 .976-1.134l.084.073l1.97 1.97z" stroke-width="1.3" stroke="#fff"/></svg>
          `)}`
                          : status === 'NOT_DELIVERED' ||
                            status === 'RESCHEDULED' ||
                            status === 'CANCELLED'
                          ? `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24"><path fill="${color}" d="M6.14 4.648A8.34 8.34 0 0 1 12 2.25c2.196 0 4.304.861 5.86 2.398c1.409 1.39 2.143 2.946 2.337 4.562c.193 1.602-.152 3.21-.81 4.718c-1.306 3-3.902 5.728-6.392 7.503a1.71 1.71 0 0 1-1.99 0c-2.49-1.775-5.086-4.504-6.393-7.503c-.657-1.508-1.001-3.116-.809-4.719c.194-1.615.928-3.17 2.337-4.561m4.39 2.822a.75.75 0 1 0-1.06 1.06L10.94 10l-1.47 1.47a.75.75 0 1 0 1.06 1.06L12 11.06l1.47 1.47a.75.75 0 1 0 1.06-1.06L13.06 10l1.47-1.47a.75.75 0 0 0-1.06-1.06L12 8.94z" stroke-width="1.3" stroke="#fff"/></svg>
          `)}`
                          : `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><style>.path { fill: ${color}; }</style>
              <path class="path" d="M8.75 10a3.25 3.25 0 1 1 6.5 0a3.25 3.25 0 0 1-6.5 0" stroke-width="1.6" stroke="#fff"/>
              <path class="path"  fill-rule="evenodd" d="M3.774 8.877a8.04 8.04 0 0 1 8.01-7.377h.432a8.04 8.04 0 0 1 8.01 7.377a8.7 8.7 0 0 1-1.933 6.217L13.5 20.956a1.937 1.937 0 0 1-3 0l-4.792-5.862a8.7 8.7 0 0 1-1.934-6.217M12 5.25a4.75 4.75 0 1 0 0 9.5a4.75 4.75 0 0 0 0-9.5" clip-rule="evenodd" stroke-width="0.3" stroke="#fff"/>
            </svg>
          `)}`
                      // labelOrigin: new google.maps.Point(18, 13),
                      // scaledSize: new google.maps.Size(35, 35)
                    }
                  : type === 'busStop'
                  ? { url: pin, scaledSize: new google.maps.Size(50, 50) }
                  : ''
              }
              key={id}
              title={title}
              position={{ lat, lng }}
              // icon={info?.isCompleted && customIcon}
              label={
                type !== 'deliverytracking' && !hideSource
                  ? {
                      text:
                        id === 'source'
                          ? 'A'
                          : id === 'destination'
                          ? 'B'
                          : id === 'tour'
                          ? 'T'
                          : (index + 1).toString(),
                      color: 'White',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }
                  : ''
              }
              draggable={isDraggable}
              onDragEnd={(e: any) => {
                if (clearStartAndEndDate) clearStartAndEndDate();
                if (handleMarker) handleMarker(e, waypoint.id);
                // const newMarker = waypoints?.map((item: any) =>
                //   item?.waypointName == waypoint.id
                //     ? {
                //         ...item,
                //         waypointLat: e?.latLng?.lat(),
                //         waypointLng: e?.latLng?.lng(),
                //         waypointAddress: waypointAddress(
                //           e?.latLng?.lat(),
                //           e?.latLng?.lng()
                //         )
                //       }
                //     : item
                // );
                // setWaypoints(newMarker);
              }}
              onClick={() => handleMarkerClick(waypoint)}
            >
              {selectedDevice === id && (
                <InfoWindow
                  // key={`${id}-${lat}-${lng}`}
                  // position={{ lat, lng }}
                  onCloseClick={handleCloseInfoWindow}
                >
                  {waypoint?.info && (
                    <GoogleInfoWindow
                      info={info}
                      vehicleNumber={info?.Mylocation}
                      status={status}
                      lat={lat}
                      lng={lng}
                      name={name}
                    />
                  )}
                </InfoWindow>
              )}
            </MarkerF>
          );
        })}
    </>
  );
};

export default GoogleTripDirections;
