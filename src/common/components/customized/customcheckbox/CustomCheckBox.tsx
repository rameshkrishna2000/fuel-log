import React from 'react';
import { Checkbox, FormControlLabel, FormHelperText, FormControl } from '@mui/material';
import { Controller, Control } from 'react-hook-form';
import './CustomCheckBox.scss';
interface CustomCheckBoxProps {
  name: string;
  value?: string;
  label?: string;
  control?: Control<any>;
  disabled?: boolean;
  size?: 'small' | 'medium' | undefined;
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isSelected?: boolean; // Prop to control if the checkbox is selected
  checked?: boolean;
  labelPlacement?: string;
}

const CustomCheckBox: React.FC<CustomCheckBoxProps> = ({
  name,
  value,
  label,
  control,
  disabled,
  size,
  checked,
  className = '',
  onChange,
  labelPlacement,
  isSelected
}) => {
  return (
    <Controller
      name={name}
      key={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl error={!!error} component='fieldset' className={'Custom-Check-Box'}>
          <FormControlLabel
            control={
              <Checkbox
                key={name}
                {...field}
                checked={checked} // Use isSelected prop to control checked state
                onChange={e => {
                  // field.onChange(e.target.checked ? value : ''); // Update form value based on checkbox state
                  if (onChange) onChange(e); // Call onChange if provided
                }}
                disabled={disabled}
                size={size}
                className={`custom-checkbox ${className}`}
              />
            }
            label={label}
            labelPlacement={labelPlacement === 'start' ? 'start' : undefined}
            className={`custom-checkbox-label ${className}`}
          />
          {error && <FormHelperText className='error'>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
};

export default CustomCheckBox;
