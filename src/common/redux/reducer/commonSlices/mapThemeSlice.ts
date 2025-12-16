import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MapThemeState {
  mapTheme: string;
}

const initialState: MapThemeState = {
  mapTheme: 'roadmap'
};

const mapThemeReducer = createSlice({
  name: 'mapTheme',
  initialState,
  reducers: {
    setMapTheme: (state, action: PayloadAction<string>) => {
      state.mapTheme = action.payload;
    }
  }
});

export default mapThemeReducer.reducer;
export const { setMapTheme } = mapThemeReducer.actions;
