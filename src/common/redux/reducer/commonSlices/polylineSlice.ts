import { createSlice } from '@reduxjs/toolkit';

interface Path {
  lat: number;
  lng: number;
}

interface InitialState {
  paths: Path[] | [];
}

const initialState: InitialState = {
  paths: []
};

const polylineSlice = createSlice({
  name: 'polyline',
  initialState,
  reducers: {
    updatePolyline: (state, action) => {
      state.paths = action.payload;
    }
  }
});

export const { updatePolyline } = polylineSlice.actions;
export default polylineSlice.reducer;
