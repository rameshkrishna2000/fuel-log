import { Icon } from '@iconify/react';
import { capitalizeFirstLetter } from '../../../../../../utils/commonFunctions';
import { Controller } from 'react-hook-form';
import { Box, TextField } from '@mui/material';

export const useSettingsColumns = ({ control, trigger }: any) => {
  const fuelTypeColumns = [
    {
      field: 'isActive',
      headerName: 'Status',
      minWidth: 400,
      sortable: false,
      renderCell: (params: any) => (
        <Icon
          icon={'carbon:circle-filled'}
          style={{
            color: params?.row?.isActive ? '#0EBC93' : '#FF2532',
            fontSize: '16px'
          }}
        />
      )
    },
    {
      field: 'name',
      headerName: 'Fuel Type',
      flex: 1,
      editable: true,
      renderCell: (params: any) => capitalizeFirstLetter(params?.row?.name),
      renderEditCell: (params: any) => {
        return (
          <Controller
            name='name'
            control={control}
            defaultValue={params.value || ''}
            render={({ field, fieldState: { error } }) => (
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <TextField
                  {...field}
                  value={field.value || ''}
                  onChange={async e => {
                    const newValue = e.target.value;
                    field.onChange(newValue);
                    params.api.setEditCellValue({
                      id: params.id,
                      field: params.field,
                      value: newValue
                    });
                    await trigger('name');
                  }}
                  error={!!error}
                  helperText={error?.message || ''}
                  fullWidth
                  size='small'
                  autoFocus
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: '0.875rem'
                    },
                    '& .MuiFormHelperText-root': {
                      margin: 0,
                      fontSize: '0.75rem',
                      position: 'absolute',
                      bottom: '-18px',
                      whiteSpace: 'nowrap'
                    }
                  }}
                />
              </Box>
            )}
          />
        );
      }
    }
  ];

  const fuelStationColumns = [
    {
      field: 'isActive',
      headerName: 'Status',
      minWidth: 400,
      sortable: false,
      renderCell: (params: any) => (
        <Icon
          icon={'carbon:circle-filled'}
          style={{
            color: params?.row?.isActive ? '#0EBC93' : '#FF2532',
            fontSize: '16px'
          }}
        />
      )
    },
    {
      field: 'name',
      headerName: 'Station Name',
      flex: 1,
      editable: true,
      renderCell: (params: any) => capitalizeFirstLetter(params?.row?.name),
      renderEditCell: (params: any) => {
        return (
          <Controller
            name='name'
            control={control}
            defaultValue={params.value || ''}
            render={({ field, fieldState: { error } }) => (
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <TextField
                  {...field}
                  value={field.value || ''}
                  onChange={async e => {
                    const newValue = e.target.value;
                    field.onChange(newValue);
                    params.api.setEditCellValue({
                      id: params.id,
                      field: params.field,
                      value: newValue
                    });
                    await trigger('name');
                  }}
                  error={!!error}
                  helperText={error?.message || ''}
                  fullWidth
                  size='small'
                  autoFocus
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: '0.875rem'
                    },
                    '& .MuiFormHelperText-root': {
                      margin: 0,
                      fontSize: '0.75rem',
                      position: 'absolute',
                      bottom: '-18px',
                      whiteSpace: 'nowrap'
                    }
                  }}
                />
              </Box>
            )}
          />
        );
      }
    }
  ];

  const paymentMethodColumns = [
    {
      field: 'isActive',
      headerName: 'Status',
      minWidth: 400,
      sortable: false,
      renderCell: (params: any) => (
        <Icon
          icon={'carbon:circle-filled'}
          style={{
            color: params?.row?.isActive ? '#0EBC93' : '#FF2532',
            fontSize: '16px'
          }}
        />
      )
    },
    {
      field: 'name',
      headerName: 'Payment Method',
      flex: 1,
      editable: true,
      renderCell: (params: any) => capitalizeFirstLetter(params?.row?.name),
      renderEditCell: (params: any) => {
        return (
          <Controller
            name='name'
            control={control}
            defaultValue={params.value || ''}
            render={({ field, fieldState: { error } }) => (
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <TextField
                  {...field}
                  value={field.value || ''}
                  onChange={async e => {
                    const newValue = e.target.value;
                    field.onChange(newValue);
                    params.api.setEditCellValue({
                      id: params.id,
                      field: params.field,
                      value: newValue
                    });
                    await trigger('name');
                  }}
                  error={!!error}
                  helperText={error?.message || ''}
                  fullWidth
                  size='small'
                  autoFocus
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: '0.875rem'
                    },
                    '& .MuiFormHelperText-root': {
                      margin: 0,
                      fontSize: '0.75rem',
                      position: 'absolute',
                      bottom: '-18px',
                      whiteSpace: 'nowrap'
                    }
                  }}
                />
              </Box>
            )}
          />
        );
      }
    }
  ];
  return { fuelTypeColumns, fuelStationColumns, paymentMethodColumns };
};
