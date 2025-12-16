import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../app/redux/hooks';
import { getMyProfileAction } from '../../../redux/reducer/commonSlices/myProfileSlice';
import { useAbort } from '../../../../utils/commonFunctions';
import './CustomDateTimeCalendar.scss';

interface CalendarProps<TField extends FieldValues> {
  id: string;
  name: Path<TField>;
  control: Control<TField>;
  label?: string;
  placeholder: string;
  getStartDate?: Date | null;
  minDateTime?: Dayjs | null;
  maxDateTime?: Dayjs | null;
  isDisabled?: boolean;
  className?: string;
  disableFuture: boolean;
  disablePast: boolean;
  onDateChange?: any;
  onDateSelect?: any;
  value?: any;
  defaultValue?: Dayjs | null;
  onAccept?: (e: any) => void;
  format?: string;
  type?: string;
  isOptional?: boolean;
  size?: 'medium' | 'small' | undefined;
  margin?: 'none' | 'dense' | 'normal' | undefined;
  variant?: 'filled' | 'outlined' | 'standard' | undefined;
  enableTodayDate?: boolean;
}

const CustomDateTimeCalendar = <TField extends FieldValues>({
  id,
  name,
  control,
  label,
  placeholder,
  onDateChange,
  minDateTime = null,
  disableFuture,
  disablePast,
  maxDateTime = null,
  isDisabled,
  className,
  onDateSelect,
  value,
  format,
  isOptional = false,
  type,
  onAccept,
  defaultValue = null,
  size = 'small',
  margin = 'dense',
  variant = 'outlined',
  enableTodayDate = false
}: CalendarProps<TField>) => {
  const [timeZone, setTimeZone] = useState<string>('UTC');
  const profile = useAppSelector(state => state.myProfile.data);

  const dispatch = useAppDispatch();
  const createAbort = useAbort();

  const CustomActionBar: any = (props: any) => {
    const { className, onCancel, onAccept } = props;

    const getRange = (daysAgoStart: number, daysAgoEnd: number) => {
      const now = dayjs().tz(timeZone);
      const startDate = now.subtract(daysAgoStart, 'day').startOf('day').toDate();
      const endDate = now
        .subtract(daysAgoEnd, 'day')
        .startOf('day')
        .hour(23)
        .minute(59)
        .second(0)
        .toDate();
      onDateSelect?.(startDate, endDate);
      onCancel();
    };

    const getToday = () => {
      const today = dayjs().tz(timeZone);
      const start = today.startOf('day').toDate();
      const end = today.isAfter(dayjs().tz(timeZone))
        ? dayjs().tz(timeZone).toDate()
        : today.toDate();
      onDateSelect?.(start, end);
      onCancel();
    };

    const getTomorrow = () => {
      const tomorrow = dayjs().tz(timeZone).add(1, 'day');
      const start = tomorrow.startOf('day').toDate();
      const end = tomorrow.startOf('day').hour(23).minute(59).second(0).toDate();
      onDateSelect?.(start, end);
      onCancel();
    };

    const actions =
      type === 'report'
        ? [
            { text: 'Last 30 days', method: () => getRange(30, 1) },
            { text: 'Last 7 days', method: () => getRange(7, 1) },
            { text: 'Yesterday', method: () => getRange(1, 1) },
            { text: 'Today', method: getToday }
          ]
        : type === 'historic'
        ? [
            { text: 'Last 3 days', method: () => getRange(3, 1) },
            { text: 'Yesterday', method: () => getRange(1, 1) },
            { text: 'Today', method: getToday }
          ]
        : type === 'summary'
        ? [
            { text: 'Last 3 days', method: () => getRange(3, 1) },
            { text: '1 week', method: () => getRange(3, 3) },
            { text: 'Yesterday', method: () => getRange(1, 1) },
            { text: 'Today', method: getToday },
            { text: 'Tomorrow', method: getTomorrow }
          ]
        : [
            { text: 'Last 90 days', method: () => getRange(90, 1) },
            { text: 'Last 60 days', method: () => getRange(60, 1) },
            { text: 'Last 30 days', method: () => getRange(30, 1) },
            { text: 'Last 7 days', method: () => getRange(7, 1) },
            { text: 'Yesterday', method: () => getRange(1, 1) },
            { text: 'Today', method: getToday }
          ];

    return (
      <>
        {(type === 'report' ||
          type === 'overview' ||
          type === 'historic' ||
          type === 'summary') && (
          <List className={className}>
            {actions.map(({ text, method }) => (
              <ListItem key={text} disablePadding>
                <ListItemButton onClick={method}>
                  <ListItemText primary={text} className='list-text' />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </>
    );
  };

  // useEffect(() => {
  //   if (profile?.timezone === 'UTC' || profile?.timezone === null)
  //     dispatch(getMyProfileAction(createAbort().abortCall.signal));
  //   return () => {
  //     createAbort().abortCall.abort();
  //   };
  // }, []);

  useEffect(() => {
    setTimeZone(profile?.timezone);
  }, [profile]);
  return (
    <Box className='custom-date-time-picker'>
      <Typography className='custom-date-time-label'>
        {label}
        {isOptional === false && label ? (
          <Box component={'span'} className='asterik-date'>
            *
          </Box>
        ) : (
          ''
        )}
      </Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Controller
          name={name}
          control={control}
          render={({ fieldState: { error } }) => {
            return (
              <DateTimePicker
                timezone={timeZone}
                format={format}
                className={className}
                defaultValue={defaultValue}
                minDateTime={minDateTime ? minDateTime : null}
                maxDateTime={maxDateTime}
                // value={value ? dayjs.tz(value, timeZone) : null}
                value={value ? dayjs(value) : null}
                onAccept={onAccept}
                disabled={isDisabled}
                disableFuture={disableFuture}
                disablePast={disablePast}
                shouldDisableDate={(date: any) => {
                  return (
                    enableTodayDate &&
                    (date?.isBefore(dayjs(), 'day') || date?.isAfter(dayjs(), 'day'))
                  );
                }}
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                  seconds: renderTimeViewClock
                }}
                onChange={onDateChange}
                slots={{
                  actionBar: CustomActionBar
                }}
                slotProps={{
                  layout: {
                    className: 'slot-times'
                  },
                  textField: {
                    id,
                    className: 'custom-text-field',
                    placeholder,
                    margin: margin,
                    variant: variant,
                    size: size,
                    error: Boolean(error),
                    helperText: error?.message,
                    spellCheck: false,
                    value: value ? dayjs.tz(value, timeZone) : null
                  }
                }}
              />
            );
          }}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default CustomDateTimeCalendar;
