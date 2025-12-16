import { useRef } from 'react';
import { Polygon } from '@react-google-maps/api';
import { useAppDispatch, useAppSelector } from '../../../../app/redux/hooks';
import { updatePolygonFenceById } from '../../../../common/redux/reducer/commonSlices/polygonSlice';

const GooglePolygon = () => {
  const { polygonFences } = useAppSelector(state => state.polygon);
  const dispatch = useAppDispatch();
  const polygonRefs = useRef<any>(new Array());

  const onEdit = (id: string, index: number) => {
    if (polygonRefs.current) {
      const nextPath = polygonRefs.current[index].polygon
        .getPath()
        .getArray()
        .map((latlng: any) => ({ lat: latlng.lat(), lng: latlng.lng() }));
      dispatch(updatePolygonFenceById({ id, paths: nextPath }));
    }
  };
  return (
    <>
      {polygonFences?.map((item: any, index: number) => (
        <Polygon
          key={item?.id}
          ref={polygon => (polygonRefs.current[index] = polygon)}
          options={{
            ...item.options,
            editable: item.options?.editable,
            draggable: item?.options?.draggable
          }}
          paths={item?.paths}
          onMouseUp={() => {
            if (item.options?.editable) {
              onEdit(item.id, index);
            }
          }}
          onDragEnd={() => {
            if (item?.options?.draggable) {
              onEdit(item.id, index);
            }
          }}
        />
      ))}
    </>
  );
};

export default GooglePolygon;
