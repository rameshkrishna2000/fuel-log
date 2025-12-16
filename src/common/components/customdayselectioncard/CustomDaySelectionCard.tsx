import React from 'react';
import { Box, Card, Typography, Grid, Divider, Stack } from '@mui/material';
import { Icon } from '@iconify/react';
import { capitalizeFirstLetter, convertTimeFormat } from '../../../utils/commonFunctions';
import './CustomDaySelectionCard.scss';

interface CustomDaySelectionCardProps {
  onClose: () => void;
  firstName: string;
  lastName: string;
  driverAvailability: { day: string; fromHours: string; toHours: string }[];
  breakWindows: { day: string; breakFrom: string; breakTo: string }[];
}

const CustomDaySelectionCard: React.FC<CustomDaySelectionCardProps> = ({
  onClose,
  firstName,
  lastName,
  driverAvailability,
  breakWindows
}) => {
  const formatTime = (from: string, to: string) => `${from} - ${to}`;

  const workingDays = driverAvailability
    .map(({ day, fromHours, toHours }) => {
      const breakWindowList = breakWindows
        .filter(breakItem => breakItem.day.toLowerCase() === day.toLowerCase())
        .map(breakItem =>
          formatTime(
            convertTimeFormat(breakItem.breakFrom),
            convertTimeFormat(breakItem.breakTo)
          )
        );

      return {
        day,
        workHours: formatTime(convertTimeFormat(fromHours), convertTimeFormat(toHours)),
        breakTimes: breakWindowList.length > 0 ? breakWindowList : null
      };
    })
    .filter(({ workHours }) => workHours !== 'NA');

  return (
    <Box className='dayselection-container'>
      <Card className='dayselection-card' elevation={4}>
        <Box className='dayselection-card-header'>
          <Typography className='dayselection-name'>
            {`${capitalizeFirstLetter(firstName)} ${
              lastName ? capitalizeFirstLetter(lastName) : ''
            }`}
          </Typography>
          <Icon
            icon='mdi:close-circle'
            className='dayselection-close-icon'
            onClick={onClose}
          />
        </Box>
        <Box className='dayselection-card-contents'>
          <Grid container>
            <Grid item xs={4}>
              <Typography className='dayselection-card-column'>Day</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className='dayselection-card-column'>Work Hours</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className='dayselection-card-column'>Break Hours</Typography>
            </Grid>
          </Grid>
        </Box>

        <Box className='dayselection-workingdays'>
          <Grid container spacing={2} sx={{ textAlign: 'center' }}>
            {workingDays.map(({ day, workHours, breakTimes }, index) => (
              <React.Fragment key={day}>
                <Grid
                  item
                  xs={4}
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#eef7ff' : '#fff',
                    borderRadius: '6px',
                    padding: '12px'
                  }}
                >
                  <Typography className='day-selectfirst'>
                    {capitalizeFirstLetter(day)}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={4}
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#eef7ff' : '#fff',
                    padding: '12px'
                  }}
                >
                  <Typography className='work-hours-day'>{workHours}</Typography>
                </Grid>

                <Grid
                  item
                  xs={4}
                  sx={{
                    backgroundColor: breakTimes
                      ? '#ffeaea'
                      : index % 2 === 0
                      ? '#eef7ff'
                      : '#fff',
                    padding: '12px'
                  }}
                >
                  {breakTimes ? (
                    <Stack spacing={1}>
                      {breakTimes.map((breakTime, i) => (
                        <Typography className='dayselection-breaktimes' key={i}>
                          {breakTime}
                        </Typography>
                      ))}
                    </Stack>
                  ) : (
                    <Typography className='no-break'>No Break</Typography>
                  )}
                </Grid>
                {index < workingDays.length - 1 && (
                  <Grid item xs={12}>
                    <Divider sx={{ backgroundColor: '#ddd' }} />
                  </Grid>
                )}
              </React.Fragment>
            ))}
          </Grid>
        </Box>
      </Card>
    </Box>
  );
};

export default CustomDaySelectionCard;
