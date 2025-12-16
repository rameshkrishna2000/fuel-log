import Radio from '@mui/material/Radio';
import { FormControl, FormControlLabel, FormLabel, RadioGroup } from '@mui/material';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import './CustomRadioButton.scss';

interface CustomRadioButtonProps<TField extends FieldValues> {
  formlabel?: string;
  name: Path<TField>;
  radiobutton1: string;
  radiobutton2: string;
  radiobutton3?: string;
  value1: string;
  value?: string;
  value2: string;
  value3?: string;
  control: Control<TField>;
  onChangeCallback?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const CustomRadioButton = <TField extends FieldValues>({
  formlabel,
  name,
  radiobutton1,
  radiobutton2,
  radiobutton3,
  value1,
  value2,
  value3,
  value: fieldValue,
  control,
  value,
  disabled = false,
  onChangeCallback
}: CustomRadioButtonProps<TField>) => (
  <FormControl sx={{ marginTop: '4px', marginBottom: '4px' }}>
    <FormLabel id='demo-radio-buttons-group-label' className='radio-formlabel'>
      {formlabel}
    </FormLabel>
    <Controller
      rules={{ required: true }}
      name={name}
      control={control}
      render={({ field }) => (
        <RadioGroup
          row
          value={fieldValue ?? value}
          defaultValue={value1}
          aria-labelledby='demo-radio-buttons-group-label'
          name={name}
          onChange={onChangeCallback}
        >
          <FormControlLabel
            className='radio-controllabel'
            value={value1}
            control={<Radio disabled={disabled} size='small' />}
            label={radiobutton1}
          />
          <FormControlLabel
            className='radio-controllabel'
            value={value2}
            control={<Radio disabled={disabled} size='small' />}
            label={radiobutton2}
          />
          {value3 && (
            <FormControlLabel
              className='radio-controllabel'
              value={value3}
              control={<Radio disabled={disabled} size='small' />}
              label={radiobutton3}
            />
          )}
        </RadioGroup>
      )}
    />
  </FormControl>
);

export default CustomRadioButton;
