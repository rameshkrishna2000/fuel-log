import { PolylineF } from '@react-google-maps/api';
import { useAppSelector } from '../../../../app/redux/hooks';

const GooglePolyline = () => {
  const { paths } = useAppSelector(state => state.polyline);
  return (
    <>
      {paths.length > 0 &&
        paths?.map((item: any) => (
          <PolylineF
            key={item?.id}
            options={{
              strokeColor: item.color,
              strokeWeight: 6,
              strokeOpacity: 0.8
            }}
            path={item.path}
          />
        ))}
    </>
  );
};

export default GooglePolyline;
