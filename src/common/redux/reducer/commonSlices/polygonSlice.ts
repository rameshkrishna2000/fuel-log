import { PolygonProps } from '@react-google-maps/api';
import { PayloadAction, createSlice, current } from '@reduxjs/toolkit';

export interface PolygonPropsF extends PolygonProps {
  id: string;
}

export const PolygonOptions = {
  strokeColor: '#5251FA',
  fillColor: '#19A7CE',
  fillOpacity: 0.5,
  strokeWeight: 2,
  editable: false,
  draggable: false,
  zindex: 1
};

interface InitialState {
  polygonFences: PolygonPropsF[];
  isShowPolygon: boolean;
  isShowDrawingManager: boolean;
}

const initialState: InitialState = {
  polygonFences: [],
  isShowPolygon: false,
  isShowDrawingManager: false
};

const polygonReducer = createSlice({
  name: 'polygon',
  initialState,
  reducers: {
    updatePolygonFences: (state, action: PayloadAction<PolygonPropsF[]>) => {
      state.polygonFences = action?.payload?.map((item: any) => ({
        ...item,
        options:
          item?.id === 'new'
            ? {
                ...PolygonOptions,
                strokeColor: '#373A40',
                fillColor: '#686D76',
                editable: true,
                draggable: true
              }
            : PolygonOptions
      }));
    },
    updatePolygonFenceById: (state, action: PayloadAction<PolygonPropsF>) => {
      const currentGeofence = current(state);
      const { id, paths } = action?.payload;

      state.polygonFences = currentGeofence?.polygonFences?.map((item: any) => {
        if (id === item?.id) {
          return {
            ...item,
            paths,
            options: {
              ...PolygonOptions,
              strokeColor: '#000',
              fillColor: '#000',
              editable: true,
              draggable: true
            }
          };
        } else {
          return item;
        }
      });
    },
    updateIsShowPolygon: (state, action) => {
      state.isShowPolygon = action.payload;
    },
    updateIsShowDrawingManager: (state, action) => {
      state.isShowDrawingManager = action.payload;
    }
  }
});

export default polygonReducer.reducer;
export const {
  updatePolygonFences,
  updatePolygonFenceById,
  updateIsShowPolygon,
  updateIsShowDrawingManager
} = polygonReducer.actions;
