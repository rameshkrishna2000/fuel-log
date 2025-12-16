import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Expand {
  expand?: Boolean;
}

const initialState: Expand = {
  expand: false
};

const expandSlice = createSlice({
  name: 'expand',
  initialState,
  reducers: {
    setExpand: (state, action: PayloadAction<any[] | any>) => {
      state.expand = action.payload;
    }
  }
});

export const expandReducer = expandSlice.reducer;
export const { setExpand } = expandSlice.actions;
