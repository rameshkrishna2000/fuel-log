import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MapThemeState {
  progress: any;
}

const initialState: MapThemeState = {
  progress: 0
};

const uploadLoaderReducer = createSlice({
  name: 'upload Loader',
  initialState,
  reducers: {
    setUploadLoader: (state, action: PayloadAction<string>) => {
      state.progress = action.payload;
    }
  }
});

export const uploadLoaderSlice = uploadLoaderReducer.reducer;
export const { setUploadLoader } = uploadLoaderReducer.actions;
