import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { calculateCenter, calculateZoom } from '../../../../utils/commonFunctions';

interface Coordinates {
  lat: number;
  lng: number;
}

interface MarkerProps {
  id: number | string;
  lat: number;
  lng: number;
  name: string;
}

interface MapState {
  center?: Coordinates;
  zoom?: number;
  markers: MarkerProps[];
  firstCall?: Boolean;
  tripCall: Boolean;
}

const initialState: MapState = {
  center: { lat: 13.0827, lng: 80.2707 },
  zoom: 10,
  markers: [],
  firstCall: true,
  tripCall: true
};

const mapReducer = createSlice({
  name: 'map',
  initialState,
  reducers: {
    map: (state, action: PayloadAction<MarkerProps[]>) => {
      state.markers = action.payload;
    },
    updateZoom: (state, action: PayloadAction<MarkerProps[] | any>) => {
      let newZoom =
        typeof action.payload === typeof 10
          ? action.payload
          : calculateZoom(action.payload);
      state.zoom = newZoom ?? 10;
    },
    updateCenter: (state, action: PayloadAction<MarkerProps[] | any>) => {
      let newCenter = calculateCenter(action.payload);
      state.center = newCenter ?? initialState.center;
    },
    setFirstCall: (state, action: PayloadAction<MarkerProps[] | any>) => {
      state.firstCall = action.payload;
    },
    setTripCall: (state, action) => {
      state.tripCall = action.payload;
    },
    clearState: (state: any) => {
      state.center = { lat: 13.0827, lng: 80.2707 };
      state.zoom = 10;
      state.markers = [];
      state.firstCall = true;
      state.tripCall = true;
    }
  }
});

export default mapReducer.reducer;
export const { map, updateZoom, updateCenter, setFirstCall, setTripCall, clearState } =
  mapReducer.actions;
