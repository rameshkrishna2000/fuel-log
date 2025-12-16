import { Box, CircularProgress, Grid } from '@mui/material';
import { ReactNode } from 'react';
import CustomCheckBox from '../customized/customcheckbox/CustomCheckBox';
import './CustomCardCheckBox.scss';

interface CustomNotificationProps {
  name: string;
  description?: string;
  className?: string;
  isLoading?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  control: any;
  field: string;
  checkboxList?: any;
  onChange?: any;
  disabled?: any;
}

const CustomCardcheckbox = ({
  field,
  name,
  className = '',
  isLoading = false,
  icon,
  control,
  description,
  checkboxList,
  onChange,
  disabled,
  onClick = () => {}
}: CustomNotificationProps) => {
  return (
    <Box
      id={name}
      className={'Custom-Card-Check-Box'}
      onClick={onClick}
      border={1}
      padding={2}
      borderRadius={4}
      borderColor={'grey.400'}
    >
      {isLoading && (
        <CircularProgress
          size={24}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginLeft: -12,
            marginTop: -12
          }}
        />
      )}
      {!isLoading && icon}
      <Grid container spacing={2}>
        <Grid item sm={8} xs={12}>
          <Box marginLeft={1} mt={1}>
            {`${name}:${description}`}
          </Box>
        </Grid>
        <Grid item sm={4} xs={12}>
          <Box display='flex' justifyContent={'end'}>
            {checkboxList.map((label: any) => (
              <Box key={label.name} marginRight={2}>
                <CustomCheckBox
                  name={field}
                  value={label.name}
                  control={control}
                  disabled={disabled}
                  checked={label.checked}
                  onChange={() => {
                    onChange(label.name);
                  }}
                />
                <Box component='span' className='checkbox-label'>
                  {label.name}
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomCardcheckbox;
