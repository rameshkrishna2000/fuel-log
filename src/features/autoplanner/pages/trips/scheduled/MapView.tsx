import React, { useEffect, useRef } from 'react';
import L, { LatLngTuple } from 'leaflet';
import { useParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './MapView.scss';

const MapView: React.FC = () => {
  const { autoplannerId } = useParams<{ autoplannerId: string }>();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) {
      console.error('Map container ref is not set');
      return;
    }

    console.log('Map container dimensions:', {
      width: mapContainerRef.current.offsetWidth,
      height: mapContainerRef.current.offsetHeight
    });

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });

    let map: L.Map;
    try {
      map = L.map(mapContainerRef.current, {
        center: [1.3521, 103.8198] as LatLngTuple, // Singapore
        zoom: 12,
        zoomControl: true
      });
      mapRef.current = map;
    } catch (error) {
      return;
    }

    try {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);
    } catch (error) {
    }

    try {
      L.marker([1.3521, 103.8198]).addTo(map).bindPopup('Test Marker: Singapore');
    } catch (error) {
    }

    map.invalidateSize();
    console.log('Map invalidated size');

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY.current = e.touches[0].clientY;
        console.log('Touch start Y:', touchStartY.current);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && touchStartY.current !== null && mapRef.current) {
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY.current - touchY;
        const zoomDelta = deltaY / 100;
        if (Math.abs(zoomDelta) > 0.5) {
          const currentZoom = mapRef.current.getZoom();
          mapRef.current.setZoom(currentZoom + (zoomDelta > 0 ? 1 : -1));
          touchStartY.current = touchY;
          console.log('Zoom changed to:', currentZoom + (zoomDelta > 0 ? 1 : -1));
        }
      }
    };

    const handleTouchEnd = () => {
      touchStartY.current = null;
      console.log('Touch ended');
    };

    mapContainerRef.current.addEventListener('touchstart', handleTouchStart);
    mapContainerRef.current.addEventListener('touchmove', handleTouchMove);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (mapContainerRef.current) {
        mapContainerRef.current.removeEventListener('touchstart', handleTouchStart);
        mapContainerRef.current.removeEventListener('touchmove', handleTouchMove);
        mapContainerRef.current.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [autoplannerId]);

  return (
    <div className='map-view-container'>
      <div ref={mapContainerRef} style={{ height: '100vh', width: '100%' }} />
    </div>
  );
};

export default MapView;
