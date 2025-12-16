import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  InputLabel,
  TextField,
  Autocomplete,
  InputAdornment,
  IconButton,
  Paper,
  Tooltip
} from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Icon } from '@iconify/react';
import './CustomSearch.scss';
import { useAppSelector } from '../../../../app/redux/hooks';

interface SelectedValueType {
  trips: string;
  findVehicle: string;
  vehicleStatus: string;
}

interface CustomSelectProps<
  Options extends { id: string; label: string },
  TField extends FieldValues
> {
  inputValue?: string;
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
  handleSearchClick?: any;
  onChanges?: any;
  onSelect?: (e: any) => void;
  values?: Options;
  selectedValue?: SelectedValueType;
  isDisabled?: boolean;
  value?: any;
  loading?: boolean;
  handleInputChange?: (event: any, newValue: string) => void;
  startAdornment?: boolean;
  isOptional?: boolean;
}

const CustomSearch = <
  Options extends { id: string; label: string },
  TField extends FieldValues
>({
  inputValue,
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
  handleSearchClick,
  onChanges,
  onSelect,
  isDisabled,
  selectedValue,
  startAdornment = true,
  loading = false,
  handleInputChange,
  isOptional = false
}: CustomSelectProps<Options, TField>) => {
  const theme = useAppSelector(state => state.theme.theme);
  const [valueSet, setValueSet] = useState<any>(null);

  const OverflowTooltip = ({ text }: { text: string }) => {
    const textRef = useRef<HTMLDivElement>(null);
    const [hover, setHover] = useState(false);

    const tooltipText = text.includes(':')
      ? text.split(':').slice(1).join(':').trim()
      : text;

    useEffect(() => {
      const checkOverflow = () => {
        if (textRef.current) {
          setHover(textRef.current.scrollWidth > textRef.current.clientWidth);
        }
      };
      checkOverflow();
      window.addEventListener('resize', checkOverflow);
      return () => window.removeEventListener('resize', checkOverflow);
    }, []);

    return (
      <Tooltip title={tooltipText} disableHoverListener={!hover} arrow placement='left'>
        <div
          ref={textRef}
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '210px'
          }}
        >
          {text}
        </div>
      </Tooltip>
    );
  };

  return (
    <Box className={`custom-search ${className} ${theme}`}>
      <InputLabel
        className='label'
        sx={{ '.MuiInputLabel-asterisk': { color: 'red' } }}
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
              size='small'
              popupIcon={<KeyboardArrowDown />}
              value={selectedOption}
              disabled={Boolean(isDisabled)}
              onInputChange={(e: React.SyntheticEvent, newValue: string) => {
                if (handleInputChange && e?.type === 'change')
                  handleInputChange(e, newValue);
              }}
              ListboxProps={{ style: { maxHeight: '120px' } }}
              onChange={(e, newValue: any) => {
                if (onChanges) onChanges(e, newValue);
                const searchValue = newValue
                  ? {
                      id: newValue?.id,
                      label: newValue?.label
                    }
                  : null;
                // setValueSet(searchValue);
                onChange(newValue ? newValue.id : null);
              }}
              onSelect={onSelect}
              getOptionLabel={option => option?.id}
              isOptionEqualToValue={(option, value) => {
                return option?.label === value?.label;
              }}
              PaperComponent={props => (
                <Paper
                  {...props}
                  style={{
                    maxWidth: 240,
                    overflowY: 'auto',
                    whiteSpace: 'nowrap'
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} style={{ cursor: 'pointer' }}>
                  <OverflowTooltip text={option.label} />
                </li>
              )}
              clearOnBlur={false}
              renderInput={params => (
                <TextField
                  className='custom-text-field'
                  {...params}
                  margin='dense'
                  variant={variant || 'outlined'}
                  placeholder={placeholder}
                  error={Boolean(error)}
                  helperText={error?.message}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: startAdornment ? (
                      <InputAdornment className='adornment' position='start'>
                        {valueSet ? valueSet?.label.split(':')[0] + ' :' : ''}
                      </InputAdornment>
                    ) : (
                      <></>
                    ),
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton disabled={isDisabled}>
                          <Icon
                            icon='mdi:magnify'
                            width='24'
                            height='24'
                            style={{ color: '#485cf0', right: '0px' }}
                            onClick={handleSearchClick}
                          />
                        </IconButton>
                      </InputAdornment>
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
export default CustomSearch;
