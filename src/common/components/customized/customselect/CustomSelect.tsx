import {
  Box,
  InputLabel,
  TextField,
  Autocomplete,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { KeyboardArrowDown, Label } from '@mui/icons-material';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { useAppSelector } from '../../../../app/redux/hooks';
import { SxProps, Theme } from '@mui/material/styles';
import './CustomSelect.scss';

interface SelectedValueType {
  trips?: string;
  findVehicle?: string;
  vehicleStatus: string;
}

interface CustomSelectProps<
  Options extends { id: string; label: string; is?: number },
  TField extends FieldValues
> {
  id: string;
  className?: string;
  control: Control<TField>;
  name: Path<TField> | any;
  label?: string;
  options: Options[];
  defaultValue?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  variant?: string | any;
  onClick?: any;
  onChange?: any;
  onChanges?: any;
  onSelect?: (e: any) => void;
  values?: Options;
  selectedValue?: SelectedValueType;
  isDisabled?: boolean;
  value?: any;
  loading?: boolean;
  onInputChange?: any;
  isOptional?: boolean;
  sx?: SxProps<Theme>;
}

const CustomSelect = <
  Options extends { id: string; label: string; is?: number },
  TField extends FieldValues
>({
  id,
  className = '',
  control,
  name,
  label,
  options,
  defaultValue,
  placeholder,
  icon,
  values,
  variant,
  onClick,
  onChange,
  onChanges,
  onSelect,
  isDisabled,
  selectedValue,
  loading = false,
  onInputChange,
  isOptional = false,
  sx
}: CustomSelectProps<Options, TField>) => {
  const theme = useAppSelector(state => state.theme.theme);

  return (
    <Box className={`custom-select ${className} ${theme}`}>
      <InputLabel
        className='label'
        sx={{
          '.MuiInputLabel-asterisk': {
            color: 'red'
          }
        }}
        required={label && !isOptional ? true : false}
      >
        {label}
      </InputLabel>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const { onChange, value } = field;

          const selectedOption =
            options?.find(option => {
              if (selectedValue?.vehicleStatus === '') {
                return defaultValue === option.id;
              } else if (values) {
                return values.id === option.id;
              } else {
                return value === option.id;
              }
            }) ?? null;

          return (
            <Autocomplete
              id={id}
              options={options}
              loading={loading}
              noOptionsText={
                name === 'vehicle' || name === 'selectVehicle' || name === 'vehicles'
                  ? 'No vehicle found'
                  : name === 'report'
                  ? 'No report found'
                  : name === 'trips'
                  ? 'No trips found'
                  : name === 'vehiclenumber'
                  ? 'No more vehicle to assign'
                  : 'No options'
              }
              size='small'
              isOptionEqualToValue={(option, value) => {
                return option?.label === value?.label;
              }}
              popupIcon={<KeyboardArrowDown />}
              value={selectedOption}
              disabled={Boolean(isDisabled)}
              // getOptionLabel={option => {
              //   return option.label;
              // }}
              onInputChange={(e: any, newValue: string) => {
                if (onInputChange) onInputChange(e, newValue);
              }}
              groupBy={(option: any) => option.group}
              onChange={(e: any, newValue) => {
                if (onChanges) onChanges(e, newValue);
                onChange(newValue ? newValue.id : null);
              }}
              onSelect={onSelect}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault(); // Prevent form submission or page refresh
                }
              }}

              renderInput={params => (
                <TextField
                  className='custom-text-field'
                  margin='dense'
                  sx={sx}
                  {...params}
                  error={Boolean(error)}
                  helperText={error?.message}
                  variant={variant ? variant : 'outlined'}
                  placeholder={placeholder}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment className='adornment' position='start'>
                        {icon}
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress color='inherit' size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
            />
          );
        }}
      />
    </Box>
  );
};

export default CustomSelect;
