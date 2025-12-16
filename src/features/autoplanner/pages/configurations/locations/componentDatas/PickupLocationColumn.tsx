//pickuplocationcolumn.tsx

import { Box, IconButton, Tooltip } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';

interface Pickup {
  id: number;
  latitude: number;
  longitude: number;
  locationAddress: string;
  isMain: 0 | 1;
}

export const PickupLocationColumn = (handleViewLocation: any) => {
  return [
    {
      field: 'locationAddress',
      headerName: 'Address',
      minWidth: 850,
      flex: 1,
      sortable: false
    },
    {
      field: 'View',
      headerName: 'View Location',
      minWidth: 100,
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: ({ row }: { row: Pickup }) => (
        <Box sx={{ width: '40%', display: 'flex', justifyContent: 'space-evenly' }}>
          <Tooltip title='View location' placement='right' arrow>
            <IconButton>
              <PlaceIcon
                tabIndex={0}
                onClick={event => {
                  handleViewLocation(row);
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleViewLocation(row);
                  }
                }}
                className='location-icon-btn'
              />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];
};
