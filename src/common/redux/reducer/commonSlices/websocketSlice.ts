import { createSlice } from '@reduxjs/toolkit';

const url = import.meta.env.VITE_APP_WEBSOCKET_URL;

interface InitialState {
  connection: WebSocket | null;
  data: object | null | any;
}

const initialState: InitialState = {
  connection: null,
  data: null
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    createConnection: (state, action) => {
      const { deviceID, token } = action.payload || {};
      const queryParams = [
        deviceID ? `devId=${deviceID}` : '',
        token ? `token=${token}` : `token=${localStorage.getItem('token')}`
      ]
        .filter(Boolean)
        .join('&');
      state.connection = new WebSocket(`${url}${queryParams}`);
    },
    updateData: (state, action) => {
      state.data = action.payload;
    }
  }
});

export const { createConnection, updateData } = websocketSlice.actions;
export default websocketSlice.reducer;
