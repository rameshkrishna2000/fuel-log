import { Circle } from '@react-google-maps/api';
import { useAppSelector } from '../../../../app/redux/hooks';

const GoogleCircle = () => {
  const { fences, isShow } = useAppSelector(state => state.circle);
  return (
    <>
      {isShow &&
        fences?.length > 0 &&
        fences?.map(({ id, center, radius, options }: any) => (
          <Circle key={id} center={center} radius={radius} options={options} />
        ))}
    </>
  );
};

export default GoogleCircle;
