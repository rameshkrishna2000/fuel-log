import { useEffect } from 'react';
import { useAppDispatch } from '../../../../../../app/redux/hooks';
import {
  updateCenter,
  updateZoom
} from '../../../../../../common/redux/reducer/commonSlices/mapSlice';

// Map handling Functionalities for the Add-adhoc Component
export const useAdHocMapHandler = ({
  setSourceAddress,
  address,
  setDestinationAddress,
  tripMarker,
  setValue,
  sourceAddress,
  clearErrors,
  setTripMarker,
  destinationAddress,
  selectedRow
}: any) => {
  const dispatch = useAppDispatch();

  const handleMarkerDrag = async (e: any, marker: any) => {
    if (marker === 'source') {
      const newAddress = await address(e?.latLng?.lat(), e?.latLng?.lng());
      setSourceAddress({
        geometry: {
          location: {
            lat: () => {
              return e?.latLng?.lat();
            },
            lng: () => {
              return e?.latLng?.lng();
            }
          }
        },
        formatted_address: newAddress
      });
    } else if (marker === 'destination') {
      const newAddress = await address(e?.latLng?.lat(), e?.latLng?.lng());
      setDestinationAddress({
        geometry: {
          location: {
            lat: () => {
              return e?.latLng?.lat();
            },
            lng: () => {
              return e?.latLng?.lng();
            }
          }
        },
        formatted_address: newAddress
      });
    }
  };

  useEffect(() => {
    if (tripMarker[0]?.lat && tripMarker[0]?.lng) {
      dispatch(updateCenter(tripMarker));
      dispatch(updateZoom(tripMarker));
    }
  }, [tripMarker]);

  useEffect(() => {
    setValue('sourceAddress', {
      source: sourceAddress?.formatted_address,
      startLat: sourceAddress?.geometry?.location?.lat(),
      startLng: sourceAddress?.geometry?.location?.lng()
    });
    clearErrors('sourceAddress');
    const prevMarkers = tripMarker;
    if (prevMarkers?.length <= 1 && sourceAddress) {
      // setTripMarker([
      //   {
      //     id: 'source',
      //     lat: sourceAddress?.geometry?.location?.lat(),
      //     lng: sourceAddress?.geometry?.location?.lng(),
      //     name: 'trip',
      //     info: { Mylocation: 'source' }
      //   }
      // ]);
      setTripMarker((prev: any[]) => {
        const destinationMarker = prev?.find(marker => marker.id === 'destination');

        const sourceMarker = {
          id: 'source',
          lat: sourceAddress?.geometry?.location?.lat() ?? 0,
          lng: sourceAddress?.geometry?.location?.lng() ?? 0,
          name: 'trip',
          info: { Mylocation: 'source' }
        };

        const updatedMarkers = destinationMarker
          ? [sourceMarker, destinationMarker]
          : [sourceMarker];

        return updatedMarkers;
      });
    } else if (sourceAddress) {
      setTripMarker((prev: any) => {
        let updatedMarkers = prev?.map((marker: any) =>
          marker?.id === 'source'
            ? {
                ...marker,
                lat: sourceAddress?.geometry?.location?.lat(),
                lng: sourceAddress?.geometry?.location?.lng()
              }
            : marker
        );
        return updatedMarkers;
      });
    }
  }, [sourceAddress]);

  useEffect(() => {
    setValue('destinationAddress', {
      destination: destinationAddress?.formatted_address,
      endLat: destinationAddress?.geometry?.location?.lat(),
      endLng: destinationAddress?.geometry?.location?.lng()
    });
    clearErrors('destinationAddress');
    const prevMarkers = tripMarker;
    const isDestinationMarker = prevMarkers?.some(
      (marker: any) => marker.id === 'destination'
    );
    if (destinationAddress?.geometry?.location?.lat()) {
      let lat = destinationAddress?.geometry?.location?.lat();
      let lng = destinationAddress?.geometry?.location?.lng();
      let destinationMarker = {
        id: 'destination',
        lat: lat,
        lng: lng,
        name: 'trip',
        info: { Mylocation: 'Destination' }
      };
      if (!isDestinationMarker) {
        setTripMarker((prev: any) => [...prev, destinationMarker]);
      } else {
        setTripMarker((marker: any) => {
          let updatedMarker = marker?.map((item: any) =>
            item?.id === 'destination'
              ? {
                  ...destinationMarker
                }
              : item
          );
          return updatedMarker;
        });
      }
    } else if (isDestinationMarker && destinationAddress) {
      setTripMarker((marker: any) => {
        let updatedMarkers = marker?.filter((item: any) => item?.id !== 'destination');
        return updatedMarkers;
      });
    }
  }, [destinationAddress, selectedRow]);

  return {
    handleMarkerDrag
  };
};
