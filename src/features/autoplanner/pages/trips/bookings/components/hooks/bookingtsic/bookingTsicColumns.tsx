import { Icon } from '@iconify/react';
import { Box, Tooltip, Typography } from '@mui/material';
import { GridActionsCellItem } from '@mui/x-data-grid';

interface Row {
  id: number;
  agentname: string;
  guestname: string;
  fromlocation: string;
  tolocation: string;
  startDateTime: string;
  adultcount: number;
  childcount: number;
  referenceid: number;
  tripType: string;
  source: string;
  startLat: number;
  startLng: number;
  target: string;
  passengerJourneys: any[];
  targetLat: number;
  targetLng: number;
  groupId: string;
}

interface Column {
  field: string;
  headerName: string;
  minWidth: number;
  flex: number;
  renderCell?: (params: { row: Row }) => any;
  textAlign?: string;
}
export const useColumnTsic = ({
  handleViewGroupTrip,
  constant,
  handleMenuClick,
  handleUpdateTrip,
  data,
  APOperationUser,
  setIsDialog,
  handleMenuClose
}: any) => {
  const groupColumns: Column[] = [
    {
      field: 'actions',
      headerName: 'Action',
      minWidth: 150,
      flex: 1,
      renderCell: (params: any) => (
        <Box
          onClick={event => {
            event.stopPropagation();
            handleViewGroupTrip(event, params.row);
          }}
        >
          <Tooltip title='View group bookings' arrow>
            <Typography
              sx={{
                fontFamily: '"Inter", sans-serif !important',
                fontSize: '10px !important',
                fontWeight: '600 !important',
                color: 'var(--primary-color)',
                backgroundColor: '#dddeff',
                borderRadius: '15px',
                padding: '5px 10px',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'inline-block',
                transition: 'background-color 0.3s ease, color 0.3s ease',
                '&:hover': {
                  backgroundColor: '#00008b',
                  color: '#fff'
                }
              }}
            >
              View Bookings
            </Typography>
          </Tooltip>
        </Box>
      )
    },

    {
      field: 'tourName',
      headerName: 'Tour Name',
      minWidth: 230,
      flex: 1,
      renderCell: (params: any) => (
        <Tooltip title={params.value || ''}>
          <span>{params.value}</span>
        </Tooltip>
      )
    },

    {
      field: 'date',
      headerName: 'Trip Date',
      minWidth: 120,
      flex: 1
    },

    {
      field: 'pickupWindow',
      headerName: 'Pickup Time Window',
      minWidth: 200,
      flex: 1
    },
    {
      field: 'returnTime',
      headerName: 'Return Time',
      minWidth: 120,
      flex: 1
    },
    {
      field: 'mode',
      headerName: 'Tour Mode',
      minWidth: 120,
      flex: 1
    },
    {
      field: 'totalAdultCount',
      headerName: 'Adult Count',
      minWidth: 100,
      flex: 1,
      renderCell: (params: any) => (
        <Tooltip title={params.row.totalAdultCount} arrow>
          <Box
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}
          >
            {params.row.totalAdultCount}
          </Box>
        </Tooltip>
      )
    },
    {
      field: 'totalChildCount',
      headerName: 'Child Count',
      minWidth: 100,
      flex: 1,
      renderCell: (params: any) => (
        <Tooltip title={params.row.totalChildCount} arrow>
          <Box
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}
          >
            {params.row.totalChildCount}
          </Box>
        </Tooltip>
      )
    },
    {
      field: 'netCount',
      headerName: 'Total Passenger',
      minWidth: 130,
      flex: 1,
      renderCell: (params: any) => (
        <Tooltip title={params.row.netCount} arrow>
          <Box
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}
          >
            {params.row.netCount}
          </Box>
        </Tooltip>
      )
    }
  ].map((item: any) => ({
    ...item,
    sortable: false,
    align: ['actions']?.includes(item?.field) ? 'center' : 'left',
    headerAlign: ['actions']?.includes(item?.field) ? 'center' : 'left'
  }));

  const columns: Column[] = [
    {
      field: 'actions',
      headerName: 'Action',
      type: 'actions',
      minWidth: 100,
      maxWidth: 100,
      flex: 1,
      getActions: (params: any) => {
        const actions = [
          <GridActionsCellItem
            icon={<Icon icon='ic:baseline-edit' className='menu-icon update' />}
            label={constant.Update}
            onClick={() => {
              handleMenuClick(params.row);
              handleUpdateTrip();
            }}
            showInMenu
          />
        ];
        if (
          data?.role === 'ROLE_OPERATOR' ||
          data?.role === 'ROLE_AUTOPLANNER_ADMIN' ||
          APOperationUser
        ) {
          actions.push(
            <GridActionsCellItem
              key='delete'
              icon={
                <Icon
                  icon='ic:outline-delete'
                  className='menu-icon'
                  style={{ color: '#FF4343' }}
                />
              }
              label={constant.Delete}
              onClick={() => {
                handleMenuClick(params.row);
                setIsDialog('Delete');
                handleMenuClose();
              }}
              showInMenu
            />
          );
        }
        return actions;
      }
    },

    { field: 'agent_name', headerName: 'Agent Name', minWidth: 200, flex: 1 },
    {
      field: 'guest_name',
      headerName: 'Guest Name',
      minWidth: 200,
      flex: 1,
      renderCell: (params: any) => (
        <Tooltip title={params.value || ''}>
          <span>{params.value}</span>
        </Tooltip>
      )
    },
    {
      field: 'guestContactNumber',
      headerName: 'Guest Contact Number',
      minWidth: 200,
      flex: 1,
      valueGetter: (params: any) => (params.value ? params.value : '-')
    },
    { field: 'adult_count', headerName: 'Adult Count', minWidth: 130, flex: 1 },
    { field: 'child_count', headerName: 'Child Count', minWidth: 130, flex: 1 },
    {
      field: 'reference',
      headerName: 'Reference ID',
      minWidth: 120,
      flex: 1,
      renderCell: (params: any) => (
        <Tooltip title={params.value || ''}>
          <span>{params.value}</span>
        </Tooltip>
      )
    },
    {
      field: 'transferPickup',
      headerName: 'Pickup Location',
      minWidth: 250,
      flex: 1,
      renderCell: (params: any) => (
        <Tooltip title={params.value || ''}>
          <span>{params.value}</span>
        </Tooltip>
      )
    }
  ].map((item: any) => ({ ...item, sortable: false }));

  return { groupColumns, columns };
};
