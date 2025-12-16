import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import axios from 'axios';
import marker from '../../../../app/assets/images/markers/my-location.png';
import './OpenStreetMap.scss';

interface OpenStreetMapProps {
  origin?: { lat: number; lng: number; address: string | null } | null;
  destination?: { lat: number; lng: number; address: string | null } | null;
  transfer?: { lat: number; lng: number; address: string | null } | null;
  needTrans?: boolean;
  isDefault?: boolean;
  onMarkerUpdate?: (
    type: 'origin' | 'destination' | 'transfer',
    data: { lat: number; lng: number; address: string | null }
  ) => void;
  draggable?: boolean;
  country?: string;
}

const OpenStreetMap: React.FC<OpenStreetMapProps> = ({
  origin,
  destination,
  transfer,
  isDefault,
  needTrans,
  onMarkerUpdate,
  country,
  draggable = true
}) => {
  const mapRef = useRef<L.Map>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  const customIcon = L.icon({
    iconUrl: marker,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
  });

  const SG = country === 'sg';

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      return response.data.display_name;
    } catch (error) {
      console.error('Error fetching address:', error);
      return null;
    }
  };

  const updateMarker = async (
    latLng: L.LatLng,
    type: 'origin' | 'destination' | 'transfer'
  ) => {
    const address = await fetchAddress(latLng.lat, latLng.lng);
    onMarkerUpdate && onMarkerUpdate(type, { lat: latLng.lat, lng: latLng.lng, address });
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (needTrans) {
          if (!transfer) {
            updateMarker(e.latlng, 'transfer');
          }
        } else {
          if (!origin) {
            updateMarker(e.latlng, 'origin');
          } else if (!destination) {
            updateMarker(e.latlng, 'destination');
          }
        }
      }
    });
    return null;
  };
  const handleMarkerDragEnd = (
    e: L.LeafletEvent,
    type: 'origin' | 'destination' | 'transfer'
  ) => {
    const newLatLng = (e.target as L.Marker).getLatLng();
    updateMarker(newLatLng, type);
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (origin && destination) {
      if (isDefault) {
        if (routingControlRef.current) {
          routingControlRef.current.getPlan().setWaypoints([]);
          if (map.hasLayer(routingControlRef.current as any)) {
            map.removeControl(routingControlRef.current as any);
          }
          routingControlRef.current = null;
        }
      } else {
        if (routingControlRef.current) {
          routingControlRef.current.getPlan().setWaypoints([]);
          if (map.hasLayer(routingControlRef.current as any)) {
            map.removeControl(routingControlRef.current as any);
          }
        }

        try {
          routingControlRef.current = L.Routing.control({
            waypoints: [
              L.latLng(origin.lat, origin.lng),
              L.latLng(destination.lat, destination.lng)
            ],
            routeWhileDragging: true,
            lineOptions: {
              styles: [{ color: '#0000ff95', opacity: 1, weight: 7 }]
            },
            addWaypoints: false,
            createMarker: () => null,
            show: false
          } as any).addTo(map);
        } catch (error) {
          console.error('Error setting up routing control:', error);
        }
      }
    }
  }, [origin, destination, isDefault]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          console.log('Position:', position);
        },
        error => {
          console.error(
            'Geolocation error occurred, but it will not be shown to the user.'
          );
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  }, []);

  const defaultZoom = SG ? 12 : 13;
  const defaultMinZoom = SG ? 11 : 2;
  const defaultMaxZoom = 18;
  const defaultMaxBoundsViscosity = 1.0;

  return (
    <MapContainer
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
      ref={mapRef}
      center={SG ? [1.3521, 103.8198] : [51.505, -0.09]}
      maxBounds={
        SG
          ? [
              [1.16, 103.6],
              [1.5, 104.05]
            ]
          : [
              [51.3, -0.2],
              [51.7, 0.1]
            ]
      }
      zoom={defaultZoom}
      minZoom={defaultMinZoom}
      maxZoom={defaultMaxZoom}
      maxBoundsViscosity={defaultMaxBoundsViscosity}
    >
      <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
      {!isDefault && (
        <>
          {origin && (
            <Marker
              position={L.latLng(origin.lat, origin.lng)}
              icon={customIcon}
              draggable={true}
              eventHandlers={{
                dragend: e => handleMarkerDragEnd(e, 'origin')
              }}
            >
              <Popup>
                <Box className='popup'>
                  <Typography paragraph className='popup-title'>
                    Pickup Location
                  </Typography>
                  <Box className='Popup-address'>
                    {origin.address || 'Fetching address...'}
                  </Box>
                </Box>
              </Popup>
            </Marker>
          )}

          {destination && (
            <Marker
              position={L.latLng(destination.lat, destination.lng)}
              icon={customIcon}
              draggable={true}
              eventHandlers={{
                dragend: e => handleMarkerDragEnd(e, 'destination')
              }}
            >
              <Popup>
                <Box className='popup'>
                  <Typography paragraph className='popup-title'>
                    Drop Location
                  </Typography>
                  <Box className='Popup-address'>
                    {destination.address || 'Fetching address...'}
                  </Box>
                </Box>
              </Popup>
            </Marker>
          )}
        </>
      )}
      {transfer && (
        <Marker
          position={L.latLng(transfer.lat, transfer.lng)}
          icon={customIcon}
          draggable={draggable}
          eventHandlers={{
            dragend: e => handleMarkerDragEnd(e, 'transfer')
          }}
        >
          <Popup>
            <Box className='popup'>
              <Typography paragraph className='popup-title'>
                Transfer Location
              </Typography>
              <Box className='Popup-address'>
                {transfer.address || 'Fetching address...'}
              </Box>
            </Box>
          </Popup>
        </Marker>
      )}
      {draggable && <MapClickHandler />}
    </MapContainer>
  );
};

export default OpenStreetMap;
