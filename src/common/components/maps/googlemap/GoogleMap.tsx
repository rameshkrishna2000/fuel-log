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
import {
  clearState,
  updateCenter,
  updateZoom
} from '../../../redux/reducer/commonSlices/mapSlice';

type Libraries = ['places', 'drawing'];

const libraries: Libraries = ['places', 'drawing'];

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

const GoogleMapComponent: FC<GoogleMapComponentProps> = ({
  isTrip,
  children,
  maplegend,
  isShowFullScreen,
  showMapOptions = true,
  handleMapClick,
  toggleLock,
  isGeofence,
  isTracking = false
}) => {
  // get map state from the store
  const { center, zoom, markers } = useAppSelector(state => state.map);
  const { mapTheme } = useAppSelector(state => state.mapTheme);
  const { data } = useAppSelector(state => state.auth);
  const roletype = data?.role;
  const { category } = useAppSelector((state: any) => state.RoleModuleAccess);

  const APsuperAdmin = roletype === 'ROLE_AUTOPLANNER_ADMIN';
  const APoperator = roletype === 'ROLE_OPERATOR';
  const APoperationUser = category === 'OPERATION_USER';
  const APagent = roletype === 'ROLE_AGENT';
  const APsubAgent = roletype === 'ROLE_SUB_AGENT';

  let isAP = APsuperAdmin || APoperator || APagent || APsubAgent || APoperationUser;

  // component state
  const ref: any = useRef<GoogleMap | null>(null);
  const [defaultZoom, setDefaultZoom] = useState<number | undefined>(zoom);
  const [defaultCenter, setDefaultCenter] = useState<LatLngLiteral | undefined>(center);
  const [mapOptions, setMapOptions] = useState(mapTheme);

  const dispatch = useAppDispatch();
  const styles = mapStyles;
  // state for terrain and hybrid
  // const { isLoaded } = useLoadScript({
  //   googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAP_API_KEY || '',
  //   libraries
  // });

  // camera initial state
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

  // function to update center when dragging map
  const onDragEnd = useCallback(() => {
    if (ref.current) {
      let newCenter = {
        lat: ref?.current?.state?.map?.center?.lat(),
        lng: ref?.current?.state?.map?.center?.lng()
      };
      setDefaultCenter(newCenter);
    }
  }, [ref]);

  // function to update zoom level
  const onZoomChanged = useCallback(
    throttle(() => {
      if (ref.current) {
        const newZoom: number | undefined = ref.current.state.map.getZoom();
        const newCenter: LatLngLiteral | any = ref.current.state.map.getCenter();
        setDefaultZoom(newZoom);
        setDefaultCenter(newCenter);
      }
    }, 200),
    [ref] // Make sure to include ref in the dependency array if it's used inside the callback
  );

  useEffect(() => {
    if (ref?.current) {
      ref?.current?.state?.map?.setCenter(center);
    }
    setDefaultCenter(center);
    setDefaultZoom(zoom);
  }, [center, zoom, ref]);

  useEffect(() => {
    dispatch(setMapTheme(mapOptions));
  }, [mapOptions]);

  useEffect(() => {
    if (isAP && markers?.length === 0) {
      dispatch(updateCenter([{ lat: 1.3521, lng: 103.8198 }]));
    }

    return () => {
      dispatch(clearState());
    };
  }, [isAP]);

  // useEffect(() => {
  //   const handleScroll = (event: any) => {
  //     if (event.deltaY !== 0 && !event.shiftKey) {
  //       // handling zoom vertically with regular mouse scrolling
  //       event.preventDefault();
  //       setDefaultZoom((prev: any) => prev + 1);
  //     } else if (event.deltaY !== 0 && event.shiftKey) {
  //       // handling zoom horizontally while holding shift key and scrolling
  //       event.preventDefault();
  //       if (defaultCenter?.lng && defaultCenter?.lat) {
  //         const newLng = defaultCenter?.lng + (event.deltaY > 0 ? -0.1 : 0.1); // Calculate new longitude
  //         const newLat = defaultCenter?.lat;
  //         if (isFinite(newLng)) setDefaultCenter({ lat: newLat, lng: newLng });
  //       }
  //     }
  //   };

  //   window.addEventListener('wheel', handleScroll, { passive: false });

  //   return () => {
  //     window.removeEventListener('wheel', handleScroll);
  //   };
  // }, []);

  // if (!isLoaded) {
  //   return (
  //     <Box
  //       sx={{
  //         display: 'flex',
  //         justifyContent: 'center',
  //         alignItems: 'center',
  //         height: '100vh'
  //       }}
  //     >
  //       <Loader />
  //     </Box>
  //   );
  // }

  return (
    <GoogleMap
      ref={ref}
      mapContainerStyle={containerStyle}
      options={{
        ...cameraOptions,
        zoom: defaultZoom,
        draggable: toggleLock,
        center: defaultCenter,
        streetViewControl: true,
        fullscreenControl: isShowFullScreen ? true : false,
        mapTypeControl: false,
        mapTypeId: ['silver', 'nightmode', 'retro', 'roadmap'].includes(mapOptions)
          ? 'roadmap'
          : mapOptions,
        styles: styles[mapOptions],
        zoomControl: false,
        keyboardShortcuts: false,
        restriction: {
          latLngBounds: bounds
        },
        scrollwheel: true
      }}
      onDragEnd={onDragEnd}
      onZoomChanged={onZoomChanged}
      onClick={handleMapClick}
      //   onLoad={onLoad}
      //   onUnmount={onUnmount}
    >
      {children}
      {!isTrip && maplegend && <MapLegends />}
      {showMapOptions && !isTracking ? (
        <MapView setMapOptions={setMapOptions} mapOptions={mapOptions} />
      ) : (
        ''
      )}
      {!isTracking && (
        <ZoomControl defaultZoom={defaultZoom} setDefaultZoom={setDefaultZoom} />
      )}
    </GoogleMap>
  );
};

export default memo(GoogleMapComponent);
