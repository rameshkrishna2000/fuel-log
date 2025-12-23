import PhoneInput from 'react-phone-input-2';
import {
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  InputLabel
} from '@mui/material';
import 'react-phone-input-2/lib/style.css';
import './CustomTextField.scss';
import { useEffect, useRef, useState } from 'react';
import { CheckCircleIcon } from 'lucide-react';

type CustomTextFieldProps = {
  id?: string;
  label?: string;
  color?: 'primary' | 'secondary';
  error?: boolean;
  style?: string;
  helperText?: any;
  value?: string;
  onChange?: any;
  disabled?: boolean;
  placeholder?: string;
  setValue?: any;
  country?: string;
  name?: any;
  isOptional?: boolean;
  getValues?: any;
  disableCountry?: boolean;
  margin?: any;
  loading?: boolean;
};

function PhoneNoTextField({
  label,
  value,
  onChange,
  disabled,
  setValue,
  error = false,
  country,
  style,
  name,
  isOptional,
  helperText,
  getValues,
  margin = '10px',
  loading
}: CustomTextFieldProps) {
  const inputStyle = {
    border: '1px solid #d32f2f'
  };
  const countryCode: any = useRef();
  const [isCountry, setIsCountry] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (countryCode?.current && getValues && !getValues(name)) {
      setIsCountry(prev => prev + 1);
    }
  }, [countryCode.current, getValues && getValues(name)]);

  return (
    <Box className='custom-phone-input-container' key={isCountry}>
      <InputLabel id='phone-label'>
        {label}
        {!isOptional && label ? <span style={{ color: 'red' }}> *</span> : ''}
      </InputLabel>
      <Box sx={{ marginBottom: margin }}>
        <Box sx={{ position: 'relative' }}>
          <PhoneInput
            placeholder={label ? label : 'Mobile Number'}
            // alwaysDefaultMask
            specialLabel=''
            copyNumbersOnly={false}
            disabled={disabled}
            // disableDropdown={country ? true : false}
            countryCodeEditable={country ? false : true}
            value={`${value}`}
            country={country ? country : undefined}
            onChange={(value, formattedValue: any) => {
              const regex = new RegExp(`^${formattedValue?.dialCode}`);
              const number = value.replace(regex, '');
              if (countryCode?.current && !value) {
                setIsCountry(prev => prev + 1);
              }
              const dialCode = formattedValue?.dialCode;
              let formattedNumber = value;
              if (formattedValue)
                if (value?.match(regex)) {
                  const number = value.replace(regex, '').trim();
                  formattedNumber = `+${dialCode}-${number}`;
                }
              onChange(formattedNumber);
              setValue(name, formattedNumber);
            }}
            inputStyle={
              error
                ? inputStyle
                : {
                    border: '1px solid #ccc',
                    height: style === 'share' ? '36px' : '55px'
                  }
            }
          />
          {loading && (
            <InputAdornment position='end' className='phone-input-adornment'>
              <CircularProgress color='inherit' size={'20px'} />
            </InputAdornment>
          )}
        </Box>

        {error && <Box className='phoneNo-error'>{helperText}</Box>}
      </Box>
    </Box>
  );
}

export default PhoneNoTextField;
