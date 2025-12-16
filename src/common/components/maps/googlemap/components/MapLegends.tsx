import { Box, Collapse, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import './MapLegends.scss';
type module = {
  module?: string;
};
const MapLegends = ({ module }: module) => {
  const [expanded, setExpanded] = useState<boolean>(true);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const legendsDetails =
    module == 'trips'
      ? [
          {
            name: 'Actual route',
            icon: 'gis:polyline-pt',
            color: '#f82d2d'
          },
          {
            name: 'Planned route',
            icon: 'gis:polyline-pt',
            color: '#3239ea'
          }
        ]
      : [
          {
            name: 'Bike',
            icon: 'solar:map-arrow-up-bold',
            color: '#0000FF'
          },
          {
            name: 'Car',
            icon: 'solar:map-arrow-up-bold',
            color: 'red'
          },
          {
            name: 'Bus',
            icon: 'solar:map-arrow-up-bold',
            color: '#fd7810'
          },
          {
            name: 'Truck',
            icon: 'solar:map-arrow-up-bold',
            color: 'green'
          }
        ];

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setExpanded(false);
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <Box className='legends'>
      <Box className='d-flex'>
        <Typography paragraph className='Legend-head'>
          Legends
        </Typography>
        <Box
          className='expanded-icon d-flex'
          justifyContent='center'
          onClick={handleExpandClick}
        >
          <Icon
            icon={expanded ? 'icon-park-outline:down' : 'icon-park-outline:up'}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleExpandClick();
              } 
            }}
          />
        </Box>
      </Box>
      <Collapse in={expanded} timeout='auto' unmountOnExit>
        {legendsDetails?.map((item, index) => (
          <Box key={index} className='legend-details d-flex'>
            <Icon
              icon={item.icon}
              style={{ color: item.color }}
              className='marker-icon'
            />
            <Typography paragraph className='legend-details-name'>
              {item.name}
            </Typography>
          </Box>
        ))}
      </Collapse>
    </Box>
  );
};

export default MapLegends;
