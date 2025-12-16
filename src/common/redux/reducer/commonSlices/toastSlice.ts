import { createSlice } from '@reduxjs/toolkit';

interface toastData {
  show: boolean;
  message: string;
  severity: 'error' | 'success';
}

const initialState: toastData = {
  show: false,
  message: '',
  severity: 'error'
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    updateToast: (state, action) => {
      let { show, severity, message } = action.payload;
      state.show = show;
      state.severity = severity;
      state.message = message;
    }
  }
});

export default toastSlice.reducer;
export const { updateToast } = toastSlice.actions;
