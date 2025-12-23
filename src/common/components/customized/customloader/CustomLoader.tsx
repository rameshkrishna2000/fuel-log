import { Box } from '@mui/material';
import APLogo from '../../../../app/assets/images/autoplanner.jpg';
import './CustomLoader.scss';
import { useAppSelector } from '../../../../app/redux/hooks';

const Loader = () => {
  const theme = useAppSelector(state => state.theme.theme);
  return (
    <Box className='loader'>
      <img
        className={theme === 'yaantrac' ? 'yaantrac' : ''}
        alt='loader'
        src={APLogo}
        height='50px'
        width='50px'
      />
    </Box>
  );
};

export default Loader;
