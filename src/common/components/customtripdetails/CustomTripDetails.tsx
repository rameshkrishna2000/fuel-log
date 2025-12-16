import { useState } from 'react';
import { Box, Collapse, Grid, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useAppSelector } from '../../../app/redux/hooks';
import { capitalizeFirstLetter } from '../../../utils/commonFunctions';
import './CustomTripDetails.scss';

const CustomTripDetails = ({ selectedRow }: any) => {
  const [expanded, setExpanded] = useState(true);
  const { data } = useAppSelector(state => state.auth);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const isValidDate = (date: any) => {
    return !isNaN(Date.parse(date));
  };

  const details = [
    {
      id: 1,
      Title: data?.role === 'ROLE_OPERATOR_ADMIN' ? 'Guest Name' : 'Agent Name',
      value:
        data?.role === 'ROLE_OPERATOR_ADMIN'
          ? selectedRow.guest_name
          : selectedRow.agent_name
    },
    { id: 2, Title: 'Adult Count', value: selectedRow.adult_count?.toString() || 'N/A' },
    { id: 3, Title: 'Child Count', value: selectedRow.child_count?.toString() || 'N/A' },
    {
      id: 4,
      Title: 'Start Date & Time',
      value: selectedRow.startTimestamp || 'N/A'
    },

    {
      id: 5,
      Title: 'End Date & Time',
      value: selectedRow.endTimestamp ? selectedRow.endTimestamp : 'N/A'
    },
    { id: 6, Title: 'Pickup Location', value: selectedRow.source || 'N/A' },
    { id: 7, Title: 'Drop Location', value: selectedRow.destination || 'N/A' }
  ];

  return (
    <Box className='whole1' onClick={handleExpandClick}>
      <Box className='whole d-flex'>
        <Box className='whole d-flex'>
          <Icon
            icon='iconamoon:profile-circle-fill'
            style={{ color: '#0ebc93' }}
            className={'activeIcon'}
          />
          <Box className='name-container'>
            <Typography className='let' paragraph m={0}>
              {data?.role === 'ROLE_OPERATOR_ADMIN'
                ? capitalizeFirstLetter(selectedRow?.agent_name)
                : capitalizeFirstLetter(selectedRow?.guest_name)}
            </Typography>
          </Box>
        </Box>
        <Box className='down-icon d-flex' justifyContent='center'>
          <Icon
            icon={expanded ? 'icon-park-outline:down' : 'icon-park-outline:up'}
            className='ico'
          />
        </Box>
      </Box>
      <Collapse in={expanded} timeout='auto' unmountOnExit>
        <Box sx={{ padding: '20px' }}>
          {details.map((item: any) => {
            if (
              item.id === 5 &&
              (!isValidDate(selectedRow.endTimestamp) || !selectedRow.endTimestamp)
            ) {
              return null;
            }

            return (
              <Grid
                container
                key={item.id}
                sx={{ flexDirection: 'row', overflow: 'auto' }}
              >
                <Grid item sm={item.id === 7 || item.id === 6 ? 12 : 6}>
                  <Typography className='ttl'>{item.Title}</Typography>
                </Grid>
                <Grid item sm={item.id === 7 || item.id === 6 ? 12 : 6}>
                  <Typography className='vlu'>{item.value}</Typography>
                </Grid>
              </Grid>
            );
          })}
        </Box>
      </Collapse>
    </Box>
  );
};

export default CustomTripDetails;
