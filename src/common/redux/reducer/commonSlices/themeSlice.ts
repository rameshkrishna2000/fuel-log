import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type Theme = 'yaantrac' | 'ayka';

interface InitialState {
  theme: any;
}

const initialState: InitialState = {
  theme: import.meta.env.VITE_APP_THEME
};

const themeReducer = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    updateTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    }
  }
});

export default themeReducer.reducer;
export const { updateTheme } = themeReducer.actions;
