import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Grid,
  Alert,
  Fade,
  Chip,
  Stack,
  Skeleton
} from '@mui/material';
import { AccessTime, Save, Cancel, CheckCircle, Warning } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import {
  gettimeConfiguration,
  timeConfiguration
} from '../../../../redux/reducer/autoPlannerSlices/autoplannerConfigurationSlice';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';

interface TimeConfig {
  hours: number;
  minutes: number;
  seconds: number;
  period: 'AM' | 'PM';
}

const BookingDeadlineConfig = ({ setIsTime }: any) => {
  const [selectedTime, setSelectedTime] = useState<TimeConfig>({
    hours: 12,
    minutes: 0,
    seconds: 0,
    period: 'AM'
  });

  const [savedTime, setSavedTime] = useState<TimeConfig | null>(null);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const timeLoading = useAppSelector((state: any) => state.TimeConfiguration?.isLoading);
  const ConfiguredTimeloading = useAppSelector(state => state.ConfiguredTime.isLoading);

  const dispatch = useAppDispatch();

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutesSeconds = Array.from({ length: 60 }, (_, i) => i);

  const handleTimeChange = (field: keyof TimeConfig, value: number | string) => {
    setSelectedTime(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatTime = (timeObj: TimeConfig = selectedTime): string => {
    const { hours, minutes, seconds, period } = timeObj;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      // .padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
      .padStart(2, '0')} ${period}`;
  };

  const handleUpdate = (): void => {
    setIsEditMode(true);
  };

  function convertSecondsToTime(totalSeconds: number): TimeConfig {
    let hours24 = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let period: 'AM' | 'PM' = 'AM';
    let hours = hours24;

    if (hours24 === 0) {
      hours = 12;
      period = 'AM';
    } else if (hours24 === 12) {
      hours = 12;
      period = 'PM';
    } else if (hours24 > 12) {
      hours = hours24 - 12;
      period = 'PM';
    } else {
      period = 'AM';
    }

    return {
      hours,
      minutes,
      seconds,
      period
    };
  }

  function getTotalSeconds(timeObj: any) {
    let { hours, minutes, seconds, period } = timeObj;

    if (period === 'AM' && hours === 12) {
      hours = 0;
    } else if (period === 'PM' && hours !== 12) {
      hours += 12;
    }

    return hours * 3600 + minutes * 60 + seconds;
  }

  const handleSave = async (params: any) => {
    const totalSeconds = getTotalSeconds(params);
    setSavedTime(selectedTime);
    setShowSuccess(true);
    setIsEditMode(false);
    const res = await dispatch(timeConfiguration(totalSeconds));
    if (res?.meta?.requestStatus === 'fulfilled') {
      setIsTime(false);
    }
  };

  const handleCancel = (): void => {
    if (savedTime) {
      setSelectedTime(savedTime);
    } else {
      setSelectedTime({
        hours: 12,
        minutes: 0,
        seconds: 0,
        period: 'AM'
      });
    }
    setIsEditMode(false);
  };

  // useEffect(() => {
  //   dispatch(gettimeConfiguration());
  // }, []);

  useEffect(() => {
    dispatch(gettimeConfiguration()).then((res: any) => {
      if (res?.payload?.data?.cutoffTime !== undefined) {
        const timeObj = convertSecondsToTime(res.payload.data.cutoffTime);
        setSelectedTime(timeObj);
        setSavedTime(timeObj);
      }
    });
  }, [dispatch]);

  if (ConfiguredTimeloading) {
    return (
      <Box sx={{ maxWidth: 400, p: 2 }}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Stack direction='row' alignItems='center' spacing={1.5} sx={{ mb: 2 }}>
            <Skeleton variant='circular' width={40} height={40} />
            <Box>
              <Skeleton variant='text' width={180} height={28} />
              <Skeleton variant='text' width={220} height={20} />
            </Box>
          </Stack>

          <Grid container spacing={1.5} sx={{ mb: 3 }}>
            {[1, 2, 3].map(index => (
              <Grid item xs={4} key={index}>
                <Skeleton variant='rectangular' width='100%' height={40} />
              </Grid>
            ))}
          </Grid>

          <Paper
            variant='outlined'
            sx={{
              p: 2,
              mb: 3,
              borderColor: 'primary.200'
            }}
          >
            <Skeleton variant='text' width='60%' height={18} sx={{ mx: 'auto' }} />
            <Skeleton variant='text' width='40%' height={38} sx={{ mx: 'auto', my: 1 }} />
            <Skeleton variant='rectangular' width='80%' height={24} sx={{ mx: 'auto' }} />
          </Paper>

          <Box mt={3} sx={{ textAlign: 'right' }}>
            <Skeleton
              variant='rectangular'
              width={90}
              height={35}
              sx={{ display: 'inline-block', mr: 1 }}
            />
            <Skeleton
              variant='rectangular'
              width={90}
              height={35}
              sx={{ display: 'inline-block' }}
            />
          </Box>
        </Paper>
      </Box>
    );
  } else
    return (
      <Box sx={{ maxWidth: 400, p: 2 }} className='time-config'>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}
          className='form-fields'
        >
          {/* Header */}
          <Stack direction='row' alignItems='center' spacing={1.5} sx={{ mb: 2 }}>
            <AccessTime color='primary' />
            <Box>
              <Typography variant='h6' component='h1' fontWeight={600}>
                Booking Deadline
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Agents can only book trips before this time
              </Typography>
            </Box>
          </Stack>

          {/* Time Selectors */}
          <Grid container spacing={1.5} sx={{ mb: 3 }}>
            <Grid item xs={4}>
              <FormControl fullWidth size='small'>
                <InputLabel>Hours</InputLabel>
                <Select
                  value={selectedTime.hours}
                  label='Hours'
                  MenuProps={{
                    PaperProps: {
                      style: { maxHeight: 200, top: 237 }
                    }
                  }}
                  onChange={e => handleTimeChange('hours', Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                    <MenuItem key={hour} value={hour}>
                      {hour.toString().padStart(2, '0')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={4}>
              <FormControl fullWidth size='small'>
                <InputLabel>Min</InputLabel>
                <Select
                  value={selectedTime.minutes}
                  label='Min'
                  MenuProps={{
                    PaperProps: {
                      style: { maxHeight: 200, top: 237 }
                    }
                  }}
                  onChange={e => handleTimeChange('minutes', Number(e.target.value))}
                >
                  {Array.from({ length: 60 }, (_, i) => i).map(min => (
                    <MenuItem key={min} value={min}>
                      {min.toString().padStart(2, '0')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={4}>
              <FormControl fullWidth size='small'>
                <InputLabel>Period</InputLabel>
                <Select
                  value={selectedTime.period}
                  label='Period'
                  onChange={e => handleTimeChange('period', e.target.value)}
                >
                  <MenuItem value='AM'>AM</MenuItem>
                  <MenuItem value='PM'>PM</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Cutoff Time Display */}
          <Paper
            variant='outlined'
            sx={{
              p: 2,
              mb: 3,
              bgcolor: 'primary.50',
              borderColor: 'primary.200'
            }}
          >
            <Typography
              variant='caption'
              color='primary.main'
              fontWeight={500}
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              Booking Cutoff Time
            </Typography>
            <Typography
              variant='h4'
              component='div'
              sx={{
                fontFamily: 'monospace',
                fontWeight: 600,
                color: 'primary.dark',
                my: 1,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              {formatTime()}
            </Typography>
            <Chip
              icon={<Warning />}
              label='No trip bookings allowed after this time'
              size='small'
              color='warning'
              variant='outlined'
            />
          </Paper>

          {/* Buttons */}
          <Box mt={3} sx={{ textAlign: 'right' }}>
            <CustomButton
              category='Cancel'
              className='cancel'
              sx={{ marginRight: '10px' }}
              onClick={() => setIsTime(false)}
            />
            <CustomButton
              category='Save'
              className='saveChanges'
              type='submit'
              loading={timeLoading}
              onClick={() => handleSave(selectedTime)}
            />
          </Box>
        </Paper>
      </Box>
    );
};

export default BookingDeadlineConfig;
