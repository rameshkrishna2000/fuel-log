import { Box } from '@mui/material';
import YTLogo from '../../../../app/assets/images/YaantracLogo.png';
import './CustomLoader.scss';
import { useAppSelector } from '../../../../app/redux/hooks';

const Loader = () => {
  const theme = useAppSelector(state => state.theme.theme);
  return (
    <Box className='loader'>
      <img
        className={theme === 'yaantrac' ? 'yaantrac' : ''}
        alt='loader'
        src={YTLogo}
        height='50px'
        width='50px'
      />
    </Box>
  );
};

export default Loader;
