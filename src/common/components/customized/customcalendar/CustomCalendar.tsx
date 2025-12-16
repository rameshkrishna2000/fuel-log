import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Box, Typography } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import './CustomCalendar.scss';
import { useAppSelector } from '../../../../app/redux/hooks';

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
  disableFuture?: boolean;
  disablePast?: boolean;
  onDateChange?: any;
  value?: any;
  defaultValue?: Dayjs | null;
  onAccept?: (e: any) => void;
  type?: string;
  minDate?: any;
  maxDate?: any;
  isOptional?: boolean;
  size?: 'medium' | 'small' | undefined;
  margin?: 'none' | 'dense' | 'normal' | undefined;
  variant?: 'filled' | 'outlined' | 'standard' | undefined;
}

const CustomDateCalendar = <TField extends FieldValues>({
  id,
  name,
  control,
  label,
  placeholder,
  onDateChange,
  disableFuture,
  disablePast,
  isDisabled,
  className,
  value,
  type,
  size = 'small',
  margin = 'dense',
  variant = 'outlined',
  isOptional = false,
  onAccept,
  defaultValue = null,
  ...props
}: CalendarProps<TField>) => {
  const { minDate, maxDate } = props;

  const { timezone } = useAppSelector(state => state.myProfile.data);

  return (
    <Box className='custom-date-time-picker'>
      <Typography
        className={`${className}`}
        sx={{
          color: '#26134b !important',
          fontWeight: 500,
          fontSize: '13px',
          fontFamily: 'Inter,sans-serif'
        }}
      >
        {label}
        {!isOptional ? (
          <Box component={'span'} className='optional-date'>
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
          render={({ fieldState: { error } }) => (
            <DatePicker
              className={`${className} daterange-calendar`}
              defaultValue={defaultValue}
              value={value ? dayjs.tz(value, timezone) : null}
              format='DD/MM/YYYY'
              onAccept={onAccept}
              disabled={isDisabled}
              disableFuture={disableFuture}
              disablePast={disablePast}
              minDate={minDate}
              maxDate={maxDate}
              onChange={onDateChange}
              slotProps={{
                textField: {
                  id,
                  className: className ? className : 'custom-text-field',
                  placeholder,
                  margin: margin,
                  variant: variant,
                  size: size,
                  error: Boolean(error),
                  helperText: error?.message
                }
              }}
            />
          )}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default CustomDateCalendar;
