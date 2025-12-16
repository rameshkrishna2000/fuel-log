import React, { useCallback, useRef, memo, useState, FC, useEffect } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { Box } from '@mui/material';
import { throttle } from 'lodash';
import Loader from '../../customized/customloader/CustomLoader';
import ZoomControl from './components/ZoomControl';
import { useAppDispatch, useAppSelector } from '../../../../app/redux/hooks';
import MapLegends from './components/MapLegends';
import MapView from './components/MapView';
import { mapStyles } from './components/mapStyles';
import { setMapTheme } from '../../../../common/redux/reducer/commonSlices/mapThemeSlice';
import * as THREE from 'three';
import { ThreeJSOverlayView } from '@googlemaps/three';
import { Icon } from '@iconify/react';

type Libraries = ['places', 'drawing', 'geometry'];

const libraries: Libraries = ['places', 'drawing', 'geometry'];

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%'
};

interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface GoogleMapComponentProps {
  isTrip?: boolean;
  legend?: string;
  isShowFullScreen?: boolean;
  showMapOptions?: boolean;
  children?: React.ReactNode;
  handleMapClick?: (e: any) => void;
  maplegend?: boolean;
  toggleLock?: any;
  isGeofence?: any;
  isTracking?: boolean;
}

const GoogleMapTiltComponent: FC<GoogleMapComponentProps> = ({
  isTrip,
  children,
  maplegend,
  isShowFullScreen,
  showMapOptions = true,
  handleMapClick,
  toggleLock,
  isTracking = false,
  isGeofence
}) => {
  const { center, zoom } = useAppSelector(state => state.map);
  const { mapTheme } = useAppSelector(state => state.mapTheme);
  const { markers } = useAppSelector((state: any) => state.map);
  const ref: any = useRef<any>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [defaultZoom, setDefaultZoom] = useState<number>(zoom);
  const [defaultCenter, setDefaultCenter] = useState<LatLngLiteral>(center);
  const [mapOptions, setMapOptions] = useState(mapTheme);
  const [vehicleMarker, setVehicleMarker] = useState<any>();
  const previousPositionRef = useRef<LatLngLiteral | null>(null);

  const dispatch = useAppDispatch();
  const styles = mapStyles;

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAP_API_KEY || '',
    libraries
  });

  const cameraOptions = {
    tilt: 0,
    heading: 0,
    minZoom: 3,
    maxZoom: 30
  };

  const bounds = {
    north: 85,
    south: -85,
    east: 180,
    west: -180
  };

  const onDragEnd = useCallback(() => {
    if (mapInstance.current) {
      const center = mapInstance.current.getCenter();
      if (center) {
        setDefaultCenter({
          lat: center.lat(),
          lng: center.lng()
        });
      }
    }
  }, []);

  const onZoomChanged = useCallback(
    throttle(() => {
      if (mapInstance.current) {
        const zoom = mapInstance.current.getZoom();
        const newCenter = mapInstance.current.getCenter();
        if (zoom !== undefined) setDefaultZoom(zoom);
        if (!isGeofence && newCenter) {
          setDefaultCenter({
            lat: newCenter.lat(),
            lng: newCenter.lng()
          });
        }
      }
    }, 200),
    [isGeofence]
  );

  const computeHeading = (from: LatLngLiteral, to: LatLngLiteral): number => {
    const fromLatLng = new google.maps.LatLng(from.lat, from.lng);
    const toLatLng = new google.maps.LatLng(to.lat, to.lng);
    return google.maps.geometry.spherical.computeHeading(fromLatLng, toLatLng);
  };

  const rotateMap = (direction: 'left' | 'right') => {
    if (mapInstance.current) {
      const currentHeading = mapInstance.current.getHeading() || 0;
      const newHeading = direction === 'left' ? currentHeading - 10 : currentHeading + 10;
      mapInstance.current.setHeading(newHeading);
    }
  };

  useEffect(() => {
    setDefaultCenter(center);
    setDefaultZoom(zoom);
  }, [center, zoom]);

  useEffect(() => {
    dispatch(setMapTheme(mapOptions));
  }, [mapOptions]);

  useEffect(() => {
    if (!isLoaded || !mapInstance.current) return;
    const map = mapInstance.current;

    const scene = new THREE.Scene();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
    directionalLight.position.set(0, 10, 50);
    scene.add(directionalLight);

    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.rotation.x = Math.PI / 2;
    scene.add(sphere);

    let tilt = 67.5;
    let heading = 0;
    let animZoom = 18;

    const animate = () => {
      if (tilt < 67.5) {
        tilt += 0.5;
      } else if (heading <= 360) {
        heading += 0.2;
        animZoom -= 0.0005;
      } else {
        return;
      }

      if (typeof map.moveCamera === 'function') {
        map.moveCamera({ tilt, heading, zoom: animZoom });
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    new ThreeJSOverlayView({
      map,
      scene,
      anchor: { lat: center.lat, lng: center.lng, altitude: 100 }
    });
  }, [isLoaded]);

  useEffect(() => {
    if (markers?.length > 0) {
      const lat = markers[0].lat;
      const lng = markers[0].lng;
      setVehicleMarker({ lat, lng });
    } else {
      setVehicleMarker(undefined);
    }
  }, [markers]);

  useEffect(() => {
    if (
      !vehicleMarker ||
      typeof vehicleMarker.lat !== 'number' ||
      typeof vehicleMarker.lng !== 'number' ||
      !mapInstance.current
    ) {
      return;
    }

    const map = mapInstance.current;
    const currentPosition = vehicleMarker;

    if (!previousPositionRef.current) {
      previousPositionRef.current = currentPosition;
      return;
    }

    const previousPosition = previousPositionRef.current;
    const heading = computeHeading(previousPosition, currentPosition);
    map.moveCamera({
      center: currentPosition,
      heading,
      tilt: 75,
      zoom: 19
    });

    previousPositionRef.current = currentPosition;
  }, [vehicleMarker]);

  if (!isLoaded) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <Loader />
      </Box>
    );
  }

  return (
    <GoogleMap
      onLoad={map => {
        ref.current = map;
        mapInstance.current = map;
      }}
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={defaultZoom}
      ref={ref}
      options={{
        ...cameraOptions,
        tilt: 67.5,
        heading: 0,
        mapId: '15431d2b469f209e',
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        draggable: toggleLock,
        streetViewControl: true,
        fullscreenControl: isShowFullScreen ? true : false,
        mapTypeControl: false,
        mapTypeId: ['silver', 'nightmode', 'retro', 'roadmap'].includes(mapOptions)
          ? 'roadmap'
          : mapOptions,
        styles: styles[mapOptions],
        zoomControl: true,
        keyboardShortcuts: false,
        restriction: {
          latLngBounds: bounds
        },
        scrollwheel: true // Enable scroll wheel zooming
      }}
      onDragEnd={onDragEnd}
      onZoomChanged={onZoomChanged}
      onClick={handleMapClick}
    >
      {children}
      {!isTrip && maplegend && <MapLegends />}
      {showMapOptions && !isTracking && (
        <MapView setMapOptions={setMapOptions} mapOptions={mapOptions} />
      )}
      {!isTracking && (
        <ZoomControl defaultZoom={defaultZoom} setDefaultZoom={setDefaultZoom} />
      )}
      <Box
        sx={{
          position: 'absolute',
          top: '45%',
          left: '10px',
          zIndex: 999,
          display: 'flex',
          gap: 1
        }}
      >
        <Icon
          icon='icon-park:left'
          style={{ color: 'grey' }}
          width='30'
          height='30'
          onClick={() => rotateMap('left')}
        />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: '45%',
          right: '10px',
          zIndex: 999
        }}
      >
        <Icon
          icon='icon-park:right'
          style={{ color: 'grey' }}
          width='30'
          height='30'
          onClick={() => rotateMap('right')}
        />
      </Box>
    </GoogleMap>
  );
};

export default memo(GoogleMapTiltComponent);
