import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { LocalizationProvider, renderTimeViewClock, TimeView } from '@mui/x-date-pickers';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { Box, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import './CustomTimePicker.scss';

interface TimePickerProps<TField extends FieldValues> {
  id: string;
  name: Path<TField>;
  control: Control<TField>;
  label?: string;
  placeholder?: string;
  isDisabled?: boolean;
  readonly views?: undefined | TimeView[];
  format?: string;
  isClock?: boolean;
  className?: string;
  disableFuture?: boolean;
  setDefaultToTime?: boolean;
  minTime?: Dayjs | undefined;
  maxTime?: Dayjs | undefined;
  onTimeChange?: (time: Dayjs | null) => void;
  onAccept?: (time: Dayjs | null) => void;
  values?: any;
  isOptional?: boolean;
  sx?: any;
}

const CustomTimePicker = <TField extends FieldValues>({
  id,
  name,
  control,
  label,
  placeholder,
  isDisabled,
  className,
  views,
  format,
  isClock = true,
  minTime = undefined,
  maxTime = undefined,
  setDefaultToTime = false,
  onTimeChange,
  onAccept,
  isOptional = false,
  disableFuture,
  values,
  sx
}: TimePickerProps<TField>) => {
  return (
    <Box className='custom-time-picker'>
      {label && (
        <Typography className={className ?? 'timepicker-label'}>
          {label}
          {isOptional === false ? <span style={{ color: 'red' }}> *</span> : ''}
        </Typography>
      )}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Controller
          name={name}
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => {
            return (
              <Box sx={{ marginTop: '4px', marginBottom: '10px' }}>
                <TimePicker
                  sx={sx ?? {}}
                  views={views ? views : undefined}
                  format={format ? format : undefined}
                  className={`${error ? 'error-input' : 'default-input'}`}
                  value={
                    values ? dayjs(values) : setDefaultToTime && minTime ? minTime : null
                  }
                  minTime={minTime || undefined}
                  maxTime={maxTime || undefined}
                  ampm={isClock}
                  timeSteps={{ minutes: 1 }}
                  onChange={newValue => {
                    if (newValue && newValue.isValid()) {
                      onChange(newValue);
                      if (onTimeChange) {
                        onTimeChange(newValue);
                      }
                    } else {
                      onChange(null);
                      if (onTimeChange) {
                        onTimeChange(null);
                      }
                    }
                  }}
                  onAccept={onAccept}
                  disableFuture={disableFuture}
                  disabled={isDisabled}
                />
                {error?.message && (
                  <Typography className='time-error'>{error.message}</Typography>
                )}
              </Box>
            );
          }}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default CustomTimePicker;
