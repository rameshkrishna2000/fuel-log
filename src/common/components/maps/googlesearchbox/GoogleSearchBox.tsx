import { Box, InputLabel } from '@mui/material';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import Autocomplete from 'react-google-autocomplete';
import { useEffect, useRef } from 'react';
import './GoogleSearchBox.scss';

const googleMapsApiKey = import.meta.env.VITE_APP_GOOGLE_MAP_API_KEY;

interface GoogleSearchBoxProps<TField extends FieldValues> {
  id: string;
  control: Control<TField>;
  name: Path<TField>;
  label?: string | null;
  placeholder?: string;
  value?: string;
  country?: string;
  setAddress?: any;
  setValue?: any;
  onchange?: any;
  isOptional?: any;
  onChangeCallback?: any;
  disabled?: boolean;
}

const GoogleSearchBox = <TField extends FieldValues>({
  id,
  control,
  name,
  value,
  setAddress,
  label = null,
  onchange,
  country,
  disabled = false,
  isOptional = false,
  onChangeCallback,
  placeholder
}: GoogleSearchBoxProps<TField>) => {
  const autocompleteRef: any = useRef(null);

  useEffect(() => {
    if (autocompleteRef?.current) {
      (autocompleteRef.current as any).value = value === undefined ? '' : value;
      autocompleteRef.current.disabled = disabled;
    }
  }, [value]);

  useEffect(() => {
    if (autocompleteRef?.current) {
      (autocompleteRef.current as any).placeholder =
        placeholder ?? (autocompleteRef.current as any).placeholder;
    }
  }, [placeholder]);

  return (
    <Box className='google-search'>
      {label && (
        <InputLabel
          className='google-search-label'
          sx={{
            '.MuiInputLabel-asterisk': {
              color: 'red !important'
            }
          }}
          required={!isOptional}
        >
          {label}
        </InputLabel>
      )}
      <Controller
        name={name}
        control={control}
        render={({ fieldState: { error } }: any) => {
          return (
            <>
              <Autocomplete
                ref={autocompleteRef}
                aria-placeholder='Search'
                id={id}
                className={
                  error
                    ? 'google-search-autocomplete-error'
                    : 'google-search-autocomplete'
                }
                apiKey={googleMapsApiKey}
                defaultValue={value}
                onChange={(place: any) => {
                  if (onchange) onchange(place);
                }}
                onPlaceSelected={(place: any) => {
                  if (setAddress) setAddress(place);
                  if (onChangeCallback) onChangeCallback(place);
                }}
                options={{
                  types: [],
                  componentRestrictions: country === 'sg' ? { country: 'SG' } : undefined
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                  }
                }}
              />
              {error && !isOptional && (
                <Box component={'p'} className='warning'>
                  {label === 'Source' ||
                  label === 'Source Address' ||
                  label === 'Pickup Location'
                    ? error?.source?.message
                    : label === 'Destination' || label === 'Drop Location'
                    ? error?.destination?.message || error?.message
                    : label === 'Delivery Address'
                    ? error?.delivery?.message
                    : label === 'Transfer Pickup Location'
                    ? error?.transfer?.message
                    : label === 'Address'
                    ? error?.addressLocation?.message ?? error?.source?.message
                    : label === 'Customer Address'
                    ? error?.customerLocation?.message
                    : label === 'Pickup   Location'
                    ? error?.source?.message
                    : label === 'Delivery Location'
                    ? error?.destination?.message
                    : label === 'Location'
                    ? 'Enter a location'
                    : error?.message}
                </Box>
              )}
            </>
          );
        }}
      />
    </Box>
  );
};

export default GoogleSearchBox;
