import React, { ReactNode, useState } from 'react';
import {
  Box,
  IconButton,
  InputLabel,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Icon } from '@iconify/react';
import { useAppSelector } from '../../../../app/redux/hooks';
import './CustomTextField.scss';

interface CustomTextFieldProps<TField extends FieldValues> {
  name: Path<TField>;
  control: Control<TField>;
  id: string;
  label?: string;
  value?: any;
  placeholder: string;
  isDecimal?: boolean;
  isOptional?: boolean;
  disabled?: boolean;
  maxlength?: number;
  type?: 'text' | 'number' | 'password' | 'address' | null;
  defaultValue?: string;
  onChangeCallback?: (e: string) => void;
  InputProps?: {
    startAdornment?: ReactNode;
    endAdornment?: ReactNode;
  };
  inputProps?: {
    maxLength?: number;
    style?: React.CSSProperties;
    readOnly?: any;
    step?: any;
    min?: any;
  };
  icon?: ReactNode;
  autoComplete?: string;
  variant?: string | any;
  onKeyDown?: any;
  inputRef?: any;
  loading?: boolean;
  dimensionOptions?: string[];
}

const CustomTextField = <TField extends FieldValues>({
  id,
  name,
  control,
  label,
  placeholder,
  isOptional = false,
  type,
  disabled,
  onChangeCallback,
  isDecimal = false,
  inputProps,
  defaultValue,
  onKeyDown,
  icon,
  loading,
  maxlength,
  variant,
  autoComplete = 'new-password',
  value: values,
  inputRef,
  dimensionOptions
}: CustomTextFieldProps<TField>) => {
  const [showPassword, setShowPassword] = useState(false);

  // function for show and hide password
  const handleTogglePassword = () => setShowPassword(!showPassword);

  const theme = useAppSelector(state => state.theme.theme);
  const dimensionOptionsList: any = dimensionOptions ?? [];
  const [unit, setUnit] = useState(dimensionOptionsList[0]);

  const inputPropsPassword = {
    endAdornment: (
      <>
        {type === 'password' && (
          <InputAdornment position='end'>
            <IconButton onClick={handleTogglePassword} edge='end'>
              {!showPassword ? (
                <Icon
                  icon='iconamoon:eye-off-light'
                  width='20'
                  height='20'
                  style={{ color: 'black' }}
                />
              ) : (
                <Icon
                  icon='iconamoon:eye-light'
                  width='20'
                  height='20'
                  style={{ color: 'black' }}
                />
              )}
            </IconButton>
          </InputAdornment>
        )}
      </>
    )
  };

  return (
    <Box className={`text-field ${theme}`}>
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
        render={({ field: { onChange, ref, value, ...rest }, fieldState: { error } }) => {
          return (
            <TextField
              id={id}
              inputRef={inputRef}
              className='custom-text-field'
              type={
                !showPassword && type === 'password'
                  ? 'password'
                  : type === 'number'
                  ? 'number'
                  : 'text'
              }
              onWheel={e => {
                if (type === 'number') e.currentTarget.blur();
              }}
              fullWidth
              value={value}
              defaultValue={defaultValue}
              onKeyDown={(e: any) => {
                if (onKeyDown) onKeyDown();

                if (
                  type === 'number' &&
                  isDecimal &&
                  ['e', '+', '-', '.']?.includes(e?.key)
                ) {
                  e?.preventDefault();
                }
                if (type === 'number' && ['e', '+', '-']?.includes(e?.key)) {
                  e?.preventDefault();
                }
              }}
              disabled={disabled}
              margin='dense'
              size='small'
              autoComplete={autoComplete}
              variant={variant ? variant : 'outlined'}
              placeholder={placeholder}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const updatedValue = e.target.value;
                if (onChangeCallback) {
                  onChangeCallback(updatedValue);
                }
                onChange(e);
              }}
              InputLabelProps={{
                className: 'inputPropsLabel'
              }}
              inputProps={{
                ...inputProps,
                min: type === 'number' ? 0 : undefined,
                maxLength: maxlength ? maxlength : undefined
              }}
              multiline={type === 'address'}
              rows={type === 'address' ? 4 : 1}
              InputProps={{
                endAdornment: (
                  <>
                    {loading ? (
                      <InputAdornment position='end'>
                        <CircularProgress size={15} />
                      </InputAdornment>
                    ) : type === 'password' ? (
                      inputPropsPassword.endAdornment
                    ) : null}
                  </>
                ),
                startAdornment: (
                  <>
                    {dimensionOptions && (
                      <InputAdornment position='start'>
                        <select
                          value={unit}
                          onChange={e => {
                            const selectedUnit = e.target.value;
                            setUnit(selectedUnit);
                          }}
                          style={{
                            border: 'none',
                            color: 'grey',
                            background: 'transparent',
                            fontSize: '0.9rem',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {dimensionOptionsList.map((item: any) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </InputAdornment>
                    )}
                    {icon && <InputAdornment position='start'>{icon}</InputAdornment>}
                  </>
                )
              }}
              error={Boolean(error)}
              helperText={error?.message}
              {...rest}
            />
          );
        }}
      />
    </Box>
  );
};

export default CustomTextField;
