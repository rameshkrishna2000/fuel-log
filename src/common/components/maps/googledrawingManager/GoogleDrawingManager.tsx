import { useRef } from 'react';
import { DrawingManager } from '@react-google-maps/api';
import { useAppDispatch, useAppSelector } from '../../../../app/redux/hooks';
import {
  PolygonOptions,
  updatePolygonFenceById,
  updatePolygonFences
} from '../../../../common/redux/reducer/commonSlices/polygonSlice';

interface GoogleDrawingManagerProps {
  updateID?: any;
}

const GoogleDrawingManager = ({ updateID = 'new' }: GoogleDrawingManagerProps) => {
  const { polygonFences, isShowDrawingManager } = useAppSelector(state => state.polygon);
  const dispatch = useAppDispatch();
  const drawingManagerRef = useRef<any>(null);

  const onDrawingManagerLoad = (drawingManger: any) =>
    (drawingManagerRef.current = drawingManger);

  const onOverlayComplete = ($overlayEvent: any) => {
    drawingManagerRef.current.setDrawingMode(null);
    if ($overlayEvent.type === window.google.maps.drawing.OverlayType.POLYGON) {
      const newPolygon = $overlayEvent.overlay
        .getPath()
        .getArray()
        .map((latLng: any) => ({ lat: latLng.lat(), lng: latLng.lng() }));

      const startPoint = newPolygon[0];
      newPolygon.push(startPoint);
      $overlayEvent.overlay?.setMap(null);

      const hasSelectedID = polygonFences.some((obj: any) => obj.id === updateID);
      if (hasSelectedID) {
        dispatch(
          updatePolygonFenceById({
            id: updateID,
            paths: newPolygon
          })
        );
      } else {
        dispatch(
          updatePolygonFences([
            ...polygonFences,
            {
              id: 'new',
              paths: newPolygon
            }
          ])
        );
      }
    }
  };

  return (
    <>
      {isShowDrawingManager && (
        <DrawingManager
          onLoad={onDrawingManagerLoad}
          onOverlayComplete={onOverlayComplete}
          options={{
            ...PolygonOptions,
            drawingControl: true,
            drawingControlOptions: {
              position: window.google.maps.ControlPosition.TOP_CENTER,
              drawingModes: [window.google?.maps?.drawing?.OverlayType?.POLYGON]
            }
          }}
        />
      )}
    </>
  );
};

export default GoogleDrawingManager;
