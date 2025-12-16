import { Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import './ZoomControl.scss';

interface Props {
  defaultZoom: number | undefined;
  setDefaultZoom: React.Dispatch<React.SetStateAction<any>>;
}

const ZoomControl = ({ defaultZoom, setDefaultZoom }: Props) => {
  const zoomIn = () => {
    if (defaultZoom) setDefaultZoom(defaultZoom + 1);
  };

  const zoomOut = () => {
    if (defaultZoom) setDefaultZoom(defaultZoom - 1);
  };

  return (
    <Box
      sx={{ position: 'absolute', bottom: '50px', right: '10px', zIndex: 1 }}
      className='zoom-control'
    >
      <Box
        onClick={zoomIn}
        className='zoom-btn'
        sx={{ color: '#7e7a87' }}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            zoomIn();
          }
        }}
      >
        <AddIcon />
      </Box>
      <Box className='divider' />
      <Box
        onClick={zoomOut}
        className='zoom-btn'
        sx={{ color: '#7e7a87' }}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            zoomOut();
          }
        }}
      >
        <RemoveIcon />
      </Box>
    </Box>
  );
};

export default ZoomControl;
