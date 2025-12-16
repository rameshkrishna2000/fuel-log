import { createSlice, current, PayloadAction } from '@reduxjs/toolkit';
import { CircleProps } from '@react-google-maps/api';

enum CircleColors {
  strokeColor = '#5251FA',
  fillColor = '#19A7CE'
}

export interface CirclePropsF extends CircleProps {
  id: string;
  radius?: number;
}

interface InitialState {
  fences: CirclePropsF[];
  isShow: boolean;
}

// Initial state
const initialState: InitialState = {
  fences: [],
  isShow: false
};

// Define the payload types
type UpdateFencePayload = CirclePropsF[];
type UpdateIsShowPayload = boolean;

export interface UpdateFenceById {
  id: string;
  radius: number;
  center: { lat: number; lng: number };
}

const circleReducer = createSlice({
  name: 'circle',
  initialState,
  reducers: {
    updateFence: (state, action: PayloadAction<UpdateFencePayload>) => {
      state.fences = action.payload.map((item: any) => ({
        ...item,
        options:
          item?.id !== 'new' ? CircleColors : { strokeColor: '#000', fillColor: '#000' }
      }));
    },
    updateFenceById: (state, action: PayloadAction<UpdateFenceById>) => {
      const currentGeofence = current(state);
      const { id, radius, center } = action.payload;
      state.fences = currentGeofence?.fences?.map((item: any) => {
        if (id === item?.id) {
          return {
            ...item,
            center,
            radius,
            options: {
              ...CircleColors,
              strokeColor: '#000',
              fillColor: '#000'
            }
          };
        } else {
          return item;
        }
      });
    },
    updateIsShow: (state, action: PayloadAction<UpdateIsShowPayload>) => {
      state.isShow = action.payload;
    }
  }
});

export default circleReducer.reducer;
export const { updateFence, updateFenceById, updateIsShow } = circleReducer.actions;
