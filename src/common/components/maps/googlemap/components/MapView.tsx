import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import TerrainIcon from '@mui/icons-material/Terrain';
import PhotoAlbumIcon from '@mui/icons-material/PhotoAlbum';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ContrastIcon from '@mui/icons-material/Contrast';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useState } from 'react';
import { useAppSelector } from '../../../../../app/redux/hooks';

interface MapOptions {
  setMapOptions: (value: string) => void;
  mapOptions: string;
}
const MapView = ({ setMapOptions, mapOptions }: any) => {
  // Create state to manage the SpeedDial open/close
  const { mapTheme } = useAppSelector((state: any) => state.mapTheme);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [icon, setIcon] = useState(
    mapTheme === 'satellite' || mapTheme === 'hybrid' ? false : true
  );

  //Speedial menu
  const speedDialActions = icon
    ? [
        { icon: <SatelliteAltIcon />, name: 'Satellite', id: `satellite` },
        { icon: <TerrainIcon />, name: 'Terrain', id: 'terrain' },
        { icon: <DarkModeIcon />, name: 'Night mode', id: 'nightmode' },
        { icon: <ContrastIcon />, name: 'Silver', id: 'silver' },
        { icon: <AutoAwesomeIcon />, name: 'Retro', id: 'retro' }
      ]
    : [
        { icon: <MyLocationIcon />, name: 'Map', id: `roadmap` },
        { icon: <PhotoAlbumIcon />, name: 'Labels', id: 'hybrid' }
      ];
  // Handle SpeedDial open and close
  const handleSpeedDialOpen = () => {
    setSpeedDialOpen(true);
  };

  const handleSpeedDialClose = () => {
    setSpeedDialOpen(false);
  };
  // Function to handle map style change
  const handleMapStyleChange = (mapId: string) => {
    if (
      mapId === 'satellite' &&
      ['roadmap', 'terrain', 'retro', 'nightmode', 'silver'].includes(mapOptions)
    ) {
      setMapOptions('satellite');
      setIcon(false);
    } else if (mapId === 'terrain' && ['terrain', 'roadmap'].includes(mapOptions)) {
      setMapOptions(mapId);
    } else if (mapId === 'roadmap' && ['satellite', 'hybrid'].includes(mapOptions)) {
      setMapOptions('roadmap');
      setIcon(true);
    } else if (mapId === 'hybrid' && ['satellite', 'hybrid'].includes(mapOptions)) {
      setMapOptions(mapOptions === 'hybrid' ? 'satellite' : mapId);
    } else {
      setMapOptions(mapId);
    }
  };

  return (
    <SpeedDial
      ariaLabel='SpeedDial for Map Options'
      sx={{
        position: 'absolute',
        bottom: '120px',
        right: '1px',
        size: 'small',
        '.MuiSpeedDial-fab': {
          backgroundColor: '#3239ea',
          height: '40px',
          width: '40px'
        },
        '.MuiSpeedDial-fab:hover': {
          backgroundColor: '#3239ea',
          height: '42px',
          width: '42px'
        }
      }}
      icon={
        <SpeedDialIcon openIcon={<VisibilityIcon />} icon={<SettingsSuggestIcon />} />
      }
      open={speedDialOpen}
      onOpen={handleSpeedDialOpen}
      onClose={handleSpeedDialClose}
    >
      {speedDialActions.map(action => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={() => handleMapStyleChange(action.id)}
        />
      ))}
    </SpeedDial>
  );
};

export default MapView;
