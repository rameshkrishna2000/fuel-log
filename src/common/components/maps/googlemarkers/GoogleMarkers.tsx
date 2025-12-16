import { memo, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../app/redux/hooks';
import { InfoWindow, Marker, MarkerClusterer, MarkerF } from '@react-google-maps/api';
import myOfficeIcon from '../../../../app/assets/images/markers/myOffice.png';
import landmarkIcon from '../../../../app/assets/images/markers/landmark.png';
import pinIcon from '../../../../app/assets/images/markers/pin.png';
import youAreHereIcon from '../../../../app/assets/images/markers/youAreHere.png';
import myLocationIcon from '../../../../app/assets/images/markers/my-location.png';
import GoogleInfoWindow from '../googleinfowindow/GoogleInfoWindow';
import { map } from '../../../redux/reducer/commonSlices/mapSlice';

interface GoogleMarkersProps {
  isDraggable?: boolean;
}

const GoogleMarkers = ({ isDraggable = false }: GoogleMarkersProps) => {
  const { markers } = useAppSelector((state: any) => state.map);
  const { mapTheme } = useAppSelector((state: any) => state?.mapTheme);
  const { data } = useAppSelector((state: any) => state?.todayTrips ?? { data: [] });

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [animatedMarkers, setAnimatedMarkers] = useState<any>({});
  const [marker, setMarker] = useState([]);
  const [loc, setLoc] = useState({ prev: [], current: [] });

  const dispatch = useAppDispatch();

  const truck = (id: string, index: number, name: string, lat: number, lng: number) => {
    return {
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        strokeColor: '#FFFFFF',
        fillColor: 'green',
        fillOpacity: 0.7,
        strokeWeight: 2,
        rotation: calculateRotationAngle(id, index, name, lat, lng),
        scale: 7
      }
    };
  };
  const bus = (id: string, index: number, name: string, lat: number, lng: number) => {
    return {
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        strokeColor: '#FFFFFF',
        fillColor: '#fd7810',
        fillOpacity: 1.0,
        strokeWeight: 2,
        rotation: calculateRotationAngle(id, index, name, lat, lng),
        scale: 7
      }
    };
  };

  const landmark = {
    icon: {
      url: landmarkIcon
    }
  };

  const office = {
    icon: {
      url: myOfficeIcon
    }
  };

  const pin = {
    icon: {
      url: pinIcon
    }
  };

  const youAreHere = {
    icon: {
      url: youAreHereIcon,
      scaledSize: new google.maps.Size(50, 50)
    }
  };

  const bike = (id: string, index: number, name: string, lat: number, lng: number) => {
    return {
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 7,
        strokeColor: '#FFFFFF',
        fillColor: '#0000FF',
        fillOpacity: 0.7,
        rotation: calculateRotationAngle(id, index, name, lat, lng),
        strokeWeight: 2
      }
    };
  };

  const car = (id: string, index: number, name: string, lat: number, lng: number) => {
    return {
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        fillColor: 'red',
        strokeColor: '#FFFFFF',
        fillOpacity: 0.7,
        strokeWeight: 2,
        rotation: calculateRotationAngle(id, index, name, lat, lng),
        scale: 7
      }
    };
  };

  const myLocation = {
    icon: {
      url: myLocationIcon,
      scaledSize: new google.maps.Size(50, 50)
    }
  };

  // Custom styles for MarkerClusterer
  const clustererStyles = [
    {
      textColor: 'white',
      textSize: 14,
      url: 'https://marker.nanoka.fr/map_cluster-3239ea-120.svg',
      height: 51,
      width: 51
    }
  ];

  const calculateRotationAngle = (
    id: string,
    index: number,
    name: string,
    newLat: number,
    newLng: number
  ) => {
    if (loc?.current?.length > 0 && loc.prev?.length > 0) {
      const marker = loc.prev.find((mar: any) => mar.id === id);
      if (name !== 'historic' && marker) {
        const { lat = 0, lng = 0 } = marker;
        const angle = Math.atan2(newLng - lng, newLat - lat) * (180 / Math.PI);
        return angle - 180;
      } else {
        const angle =
          Math.atan2(newLng - markers[index + 1]?.lng, newLat - markers[index + 1]?.lat) *
          (180 / Math.PI);
        return angle - 180;
      }
    }
    return 90;
  };

  useEffect(() => {
    setLoc({ prev: loc.current, current: markers });
  }, [markers, loc.current]);

  const handleMarkerClick = (marker: any) => setSelectedMarker(marker);

  const handleCloseInfoWindow = () => setSelectedMarker(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedMarkers: any = {};
      markers.forEach((marker: any) => {
        const { id, lat, lng } = marker;
        const prevLat = animatedMarkers[id]?.lat || lat;
        const prevLng = animatedMarkers[id]?.lng || lng;
        const newLat = prevLat + (lat - prevLat) * 0.1;
        const newLng = prevLng + (lng - prevLng) * 0.1;
        updatedMarkers[id] = { lat: newLat, lng: newLng };
      });
      setAnimatedMarkers(updatedMarkers);
    }, 100);

    return () => clearInterval(interval);
  }, [markers, animatedMarkers]);

  useEffect(() => {
    if (data.length >= 1) {
      setMarker(markers);
    }
  }, [data]);

  return (
    <MarkerClusterer
      averageCenter
      enableRetinaIcons
      gridSize={60}
      options={{ styles: clustererStyles }}
    >
      {clusterer =>
        markers?.length > 0 &&
        (marker?.length === 1 ? marker : markers || [])?.map(
          (marker: any, index: number) => {
            let { id, name, info, type = 'myplace', status, vehicleNo, length } = marker;
            const { lat = 0, lng = 0 } = animatedMarkers[id] || marker;
            return (
              <>
                {(id === 'source' || id === 'destination') && name === 'historic' ? (
                  <MarkerF
                    label={{
                      text:
                        id === 'source'
                          ? 'A'
                          : id === 'destination'
                          ? 'B'
                          : id === 'tour'
                          ? 'T'
                          : index.toString(),
                      color: 'White',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                    key={id}
                    position={{ lat, lng }}
                    onClick={() => handleMarkerClick(marker)}
                  >
                    {selectedMarker === marker && info && (
                      <InfoWindow
                        position={{ lat, lng }}
                        onCloseClick={handleCloseInfoWindow}
                      >
                        <GoogleInfoWindow
                          info={info}
                          vehicleNumber={vehicleNo ? vehicleNo : id}
                          status={status}
                          lat={lat}
                          lng={lng}
                          name={name}
                        />
                      </InfoWindow>
                    )}
                  </MarkerF>
                ) : (
                  <Marker
                    key={id}
                    position={{ lat, lng }}
                    clusterer={clusterer}
                    label={
                      type !== 'myplace' && name !== 'historic' && name !== 'you'
                        ? {
                            text:
                              vehicleNo && type !== 'myplace' && name !== 'historic'
                                ? vehicleNo.toUpperCase()
                                : type !== 'myplace' && name !== 'historic'
                                ? String(id).toUpperCase()
                                : null,
                            color:
                              mapTheme === 'satellite' || mapTheme === 'hybrid'
                                ? '#fff'
                                : '#26134b',
                            fontWeight: '600',
                            fontSize: '13px'
                          }
                        : ''
                    }
                    options={
                      type?.toLowerCase() === 'car'
                        ? car(id, index, name, lat, lng)
                        : type?.toLowerCase() === 'landmark'
                        ? landmark
                        : type?.toLowerCase() === 'mylocation'
                        ? office
                        : type?.toLowerCase() === 'bike'
                        ? bike(id, index, name, lat, lng)
                        : type?.toLowerCase() === 'pin'
                        ? pin
                        : type?.toLowerCase() === 'myplace'
                        ? myLocation
                        : type?.toLowerCase() === 'bus'
                        ? bus(id, index, name, lat, lng)
                        : type?.toLowerCase() === 'youarehere'
                        ? youAreHere
                        : truck(id, index, name, lat, lng)
                    }
                    draggable={isDraggable}
                    onDragEnd={(e: any) => {
                      const newMarkers = markers?.map((item: any) => {
                        return item?.id === id
                          ? {
                              ...item,
                              lat: e?.latLng?.lat(),
                              lng: e?.latLng?.lng()
                            }
                          : item;
                      });
                      dispatch(map(newMarkers));
                    }}
                    onClick={() => handleMarkerClick(marker)}
                  >
                    {selectedMarker === marker && info && (
                      <InfoWindow
                        position={{ lat, lng }}
                        onCloseClick={handleCloseInfoWindow}
                      >
                        <GoogleInfoWindow
                          info={info}
                          vehicleNumber={vehicleNo ? vehicleNo : id}
                          status={status}
                          lat={lat}
                          lng={lng}
                          name={name}
                        />
                      </InfoWindow>
                    )}
                  </Marker>
                )}
              </>
            );
          }
        )
      }
    </MarkerClusterer>
  );
};

export default memo(GoogleMarkers);
