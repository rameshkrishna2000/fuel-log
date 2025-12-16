import { Box, InputLabel, FormHelperText, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';
import SelectCurrency from 'react-select-currency';
import './CustomCurrency.scss';

type CustomCurrencyFieldProps = {
  helperText?: React.ReactNode;
  id?: string;
  label?: string;
  style?: string;
  placeholder: string;
  name: string;
  defaultValue?: string;
  error?: boolean;
  disabled?: boolean;
  value?: string;
  setValue?: any;
  onChange?: (value: string, name: string) => void;
  control: any;
  color?: 'primary' | 'secondary';
  onKeyPress?: any;
  onInput?: any;
  trigger?: any;
  isOptional?: boolean;
};

const CustomCurrencyField = ({
  label,
  disabled,
  placeholder,
  style,
  name,
  onKeyPress,
  control,
  value: values,
  defaultValue,
  setValue,
  trigger,
  isOptional = false
}: CustomCurrencyFieldProps) => {
  const inputStyle = {
    border: 'none',
    display: 'none'
  };

  return (
    <Box className='custom-currency-input' key={values}>
      {label && (
        <InputLabel
          className='currency-label'
          required={!isOptional && label ? true : false}
        >
          {label}
        </InputLabel>
      )}
      <Controller
        name={name}
        control={control}
        defaultValue=''
        render={({
          field: { onChange: fieldOnChange, value, ...rest },
          fieldState: { error }
        }) => (
          <>
            <SelectCurrency
              placeholder={placeholder}
              disabled={disabled}
              value={values}
              name={name}
              onCurrencySelected={''}
              onChange={(selectedValue: any) => {
                if (setValue) setValue(name, selectedValue.target.value);
                trigger(name);
              }}
              onInput={(e: React.FormEvent<HTMLInputElement>) => {
                if (setValue) setValue(name, '');
              }}
              isClearable
              className={error ? 'custom-select-error' : 'currency-select'}
              containerClass='currency-select-input'
              inputStyle={
                error
                  ? inputStyle
                  : {
                      border: 'none',
                      height: style === 'share' ? '36px' : '55px',
                      display: 'none'
                    }
              }
            />
            {error && (
              <FormHelperText sx={{ marginTop: '4px' }} error>
                {error.message}
              </FormHelperText>
            )}
          </>
        )}
      />
    </Box>
  );
};

export default CustomCurrencyField;
