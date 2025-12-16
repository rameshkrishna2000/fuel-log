import { Box, Tooltip, Typography } from '@mui/material';
import {
  capitalizeFirstLetter,
  convertTo12HourFormat
} from '../../../../../../../../utils/commonFunctions';

export const useColumnRLR = () => {
  const columns = [
    {
      title: 'Date and Time',
      field: 'date',
      headerName: 'Date and Time',
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }: any) => {
        return (
          <Typography noWrap sx={{ fontSize: '12px' }}>
            {`${row?.date}, ${convertTo12HourFormat(row?.time)}`}
          </Typography>
        );
      }
    },
    {
      title: 'Tour Name',
      field: 'guest_name',
      headerName: 'Tour Name',
      flex: 1,
      minWidth: 200
    },
    {
      title: 'Agent Name',
      field: 'agent_name',
      headerName: 'Agent Name',
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }: any) => {
        return Boolean(row?.agent_name) ? row?.agent_name : '-';
      }
    },
    {
      title: 'Driver Name',
      field: 'driverName',
      headerName: 'Driver Name',
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }: any) => {
        return Boolean(row?.driverName) ? capitalizeFirstLetter(row?.driverName) : '-';
      }
    },
    {
      title: 'Vehicle No',
      field: 'vehicleNumber',
      headerName: 'Vehicle No',
      flex: 1,
      minWidth: 160,
      renderCell: ({ row }: any) => {
        return Boolean(row?.vehicleNumber) ? row?.vehicleNumber.toUpperCase() : '-';
      }
    },
    {
      title: 'Ref Number',
      field: 'refNumber',
      headerName: 'Ref Number',
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }: any) => {
        return Boolean(row?.ref_number) ? row?.ref_number : '-';
      }
    },
    {
      title: 'From',
      headerName: 'From',
      field: 'source',
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }: any) => {
        return (
          <Box sx={{ width: '200px', display: 'flex' }}>
            <Tooltip title={row?.from?.locationAddress}>
              <Typography noWrap sx={{ fontSize: '12px' }}>
                {row?.from?.locationAddress}
              </Typography>
            </Tooltip>
          </Box>
        );
      }
    },

    {
      title: 'To',
      headerName: 'To',
      field: 'destination',
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }: any) => {
        return (
          <Box
            sx={{
              width: '200px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Tooltip title={row?.to?.locationAddress}>
              <Typography noWrap sx={{ fontSize: '12px' }}>
                {row?.to?.locationAddress}
              </Typography>
            </Tooltip>
          </Box>
        );
      }
    },
    {
      title: 'Total Passengers',
      field: 'totalPassengers',
      headerName: 'Total Passengers',
      sortable: false,
      flex: 1,
      minWidth: 120,
      renderCell: ({ row }: any) => {
        return Boolean(row?.totalPassengers) ? row?.totalPassengers : '-';
      }
    }
  ]?.map((item: any) => ({
    ...item,
    sortable: false
  }));
  return {
    columns
  };
};
