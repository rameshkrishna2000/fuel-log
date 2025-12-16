import {
  Box,
  InputLabel,
  TextField,
  Autocomplete,
  InputAdornment,
  Chip,
  Checkbox
} from '@mui/material';

import { KeyboardArrowDown } from '@mui/icons-material';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { useAppSelector } from '../../../../app/redux/hooks';

import { useEffect, useRef, useState } from 'react';

import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

import './CustomMultiSelect.scss';

interface SelectedValueType {
  trips: string;
  findVehicle: string;
  vehicleStatus: string;
}

interface CustomSelectProps<
  Options extends { id: string; label: string },
  TField extends FieldValues
> {
  id?: string;
  className?: string;
  control?: Control<TField>;
  name?: Path<TField> | any;
  label?: string;
  options: Options[];
  placeholder?: string;
  icon?: React.ReactNode;
  onClick?: any;
  onChange?: any;
  onChanges?: any;
  loading?: boolean;
  onSelect?: (e: any) => void;
  isDisabled?: boolean;
  value?: any;
  setValue?: any;
  initialValue?: string[] | null;
  mappedList?: { id: string; label: string }[] | any;
  loadtype?: any;
  type?: any;
  width?: string;
  isOptional?: boolean;
}

const CustomMultiSelect = <
  Options extends { id: string; label: string },
  TField extends FieldValues
>({
  id,
  className = '',
  control,
  name,
  label,
  options,
  placeholder,
  icon,
  setValue,
  onChanges,
  initialValue,
  mappedList,
  type,
  isDisabled,
  isOptional = false,
  width = '100px',
  loading = false
}: CustomSelectProps<Options, TField>) => {
  const theme = useAppSelector(state => state.theme.theme);

  const [val, setVal] = useState<any>([]);
  const [newOption, setNewOption] = useState<any>([...options]);
  const [placeHolder, setPlaceHolder] = useState<string | undefined>(placeholder);
  const valueRef = useRef<any>(null);

  const outlineIcon = <CheckBoxOutlineBlankIcon fontSize='small' />;
  const checkedIcon = <CheckBoxIcon fontSize='small' />;

  const handleChange = (value: any) => {
    const isSelectAll = value?.some((item: any) => item?.id === 'selectAll');
    const allIds = newOption?.map((item: any) => item.id);
    const selectedIds = value?.map((item: any) => item.id);
    const noOptionRemoved = newOption?.every(
      (item: any) => selectedIds.includes(item.id) || item.id === 'selectAll'
    );

    if (isSelectAll) {
      if (!val?.includes('selectAll')) {
        setVal(allIds);
        setValue(name, newOption);
      } else if (!noOptionRemoved) {
        const filtered = newOption.filter(
          (item: any) => selectedIds.includes(item.id) && item.id !== 'selectAll'
        );
        setVal(filtered.map((item: any) => item.id));
        setValue(name, filtered);
      } else {
        setVal(selectedIds);
        setValue(name, value);
      }
    } else {
      if (val?.includes('selectAll')) {
        setVal([]);
        setValue(name, []);
      } else if (noOptionRemoved) {
        setVal(allIds);
        setValue(name, newOption);
      } else {
        setVal(selectedIds);
        setValue(name, value);
      }
    }
  };

  useEffect(() => {
    setNewOption(options);
    const preSelected = options?.filter(item => val?.includes(item?.id));
    setPlaceHolder(preSelected?.length === 0 ? placeholder : '');
  }, [options]);

  useEffect(() => {
    setVal(initialValue || []);
  }, [initialValue]);

  useEffect(() => {
    if (mappedList?.length > 0) {
      handleChange(mappedList);
    }
  }, [mappedList]);

  useEffect(() => {
    if (val?.length > 0) {
      const selectedLabels = options
        ?.filter(option => val.includes(option.id) && option.id !== 'selectAll')
        ?.map(item => item.id.toUpperCase())
        ?.join(', ');
      setPlaceHolder(selectedLabels);
    } else {
      setPlaceHolder(placeholder);
    }
  }, [val, options]);

  return (
    <Box className={`custom-multiselect ${className} ${theme}`}>
      <InputLabel className='label'>
        {label}
        {!isOptional && label ? <span style={{ color: 'red' }}> *</span> : ''}
      </InputLabel>

      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Autocomplete
            id={id}
            options={newOption}
            loading={loading}
            ref={valueRef}
            disableCloseOnSelect
            multiple
            groupBy={(option: any) => option.category}
            limitTags={1}
            size='small'
            value={options.filter(item => val.includes(item.id))}
            onInputChange={(e: any) => {
              valueRef.current.value = e?.target?.value;
            }}
            onChange={(e: any, newValue: any) => {
              // setValue(name, newValue);
              handleChange(newValue);
              onChanges?.(e, newValue);
            }}
            getOptionDisabled={(option: any) => !!option.disabled}
            isOptionEqualToValue={(option, value) => option?.label === value?.label}
            getOptionLabel={option => option.label}
            popupIcon={<KeyboardArrowDown />}
            renderTags={() => null}
            renderOption={(props: any, option, { selected }) => {
              const { key, ...optionProps } = props;
              return (
                <li key={key} {...optionProps}>
                  <Checkbox
                    icon={outlineIcon}
                    checkedIcon={checkedIcon}
                    checked={selected}
                    sx={{ marginLeft: '-20px' }}
                  />
                  {option.label}
                </li>
              );
            }}
            renderInput={params => (
              <TextField
                className='custom-text-field'
                margin='dense'
                {...params}
                error={Boolean(error)}
                helperText={error?.message}
                placeholder={placeHolder}
                sx={{
                  'input::placeholder': {
                    color: val?.length > 0 ? '#3239ea' : 'grey !important',
                    opacity: 1,
                    width: width,
                    textOverflow: 'ellipsis'
                  }
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position='start'>{icon}</InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  )
                }}
              />
            )}
          />
        )}
      />
    </Box>
  );
};

export default CustomMultiSelect;
