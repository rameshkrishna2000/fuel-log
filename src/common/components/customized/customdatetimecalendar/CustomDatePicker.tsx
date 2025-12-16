import {
  LocalizationProvider,
  DatePicker,
  pickersLayoutClasses
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
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
  timeZone?: string;
  disableFuture?: boolean;
  disablePast?: boolean;
  onDateChange?: any;
  onDateSelect?: any;
  value?: any;
  defaultValue?: Dayjs | null;
  onAccept?: (e: any) => void;
  format?: string;
  type?: string;
  isOptional?: boolean;
}

const CustomDatePicker = <TField extends FieldValues>({
  id,
  name,
  control,
  label,
  placeholder,
  onDateChange,
  minDateTime = null,
  maxDateTime = null,
  isDisabled = false,
  className,
  timeZone = 'UTC',
  onDateSelect,
  value,
  format,
  isOptional = false,
  type,
  onAccept,
  disableFuture = false,
  disablePast = false
}: CalendarProps<TField>) => {
  const CustomActionBar = ({ onCancel }: any) => {
    const getRange = (daysAgoStart: number, daysAgoEnd: number) => {
      const now: any = dayjs().tz(timeZone);
      const startDate = now.subtract(daysAgoStart, 'day').startOf('day').$d;
      const endDate = now.subtract(daysAgoEnd, 'day').startOf('day').$d;
      onDateSelect?.(startDate, endDate);
      onCancel();
    };  

    const getToday = () => {
        
      const Day: any = dayjs().tz(timeZone);
      const start = Day.startOf('day').$d;
      const end = Day.startOf('day').$d;
      onDateSelect?.(start, end);
      onCancel();
    };

    const getTomorrow = () => {
      const Day: any = dayjs().tz(timeZone);
      const start = Day.add(1, 'day').startOf('day').$d;
      const end = Day.add(1, 'day').startOf('day').$d;
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
      <List className={className}>
        {actions.map(({ text, method }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton onClick={method}>
              <ListItemText primary={text} className='list-text' />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <Box className='custom-date-time-picker'>
      {label && (
        <Typography className='custom-date-time-label'>
          {label}
          {!isOptional && <span style={{ color: 'red' }}> *</span>}
        </Typography>
      )}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Controller
          name={name}
          control={control}
          render={({ field: { onChange }, fieldState: { error } }) => (
            <DatePicker
              format={format}
              className={className}
              value={value ? dayjs.tz(value, timeZone) : null}
              onChange={val => {
                onChange(val);
                onDateChange?.(val);
              }}
              onAccept={onAccept}
              disabled={isDisabled}
              disableFuture={disableFuture}
              disablePast={disablePast}
              minDate={minDateTime || undefined}
              maxDate={maxDateTime || undefined}
              slots={{ actionBar: CustomActionBar }}
              slotProps={{
                layout: {
                  sx: {
                    [`.${pickersLayoutClasses.actionBar}`]: {
                      gridColumn: 3,
                      gridRow: 2,
                      color: '#1976d2',
                      borderLeft: '1px solid rgba(0, 0, 0, 0.12)'
                    }
                  }
                },
                textField: {
                  id,
                  className: 'custom-text-field',
                  placeholder,
                  margin: 'dense',
                  variant: 'outlined',
                  size: 'small',
                  error: !!error,
                  helperText: error?.message,
                  spellCheck: false
                }
              }}
            />
          )}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default CustomDatePicker;
