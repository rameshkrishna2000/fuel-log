import { GridActionsCellItem } from '@mui/x-data-grid';
import { Icon } from '@iconify/react';
import { Tooltip } from '@mui/material';
import { convertEpoctoTimeZoneDate } from '../../../../../../../../utils/commonFunctions';

interface Column {
  field: string;
  headerName: string;
  minWidth: number;
  flex: number;
  renderCell?: (params: { row: any }) => any;
  textAlign?: string;
}

export const useColumns = ({
  handleUpdateTrip,
  handleMenuClick,
  data,
  APOperationUser,
  setIsDialog,
  handleMenuClose,
  profile,
  constant
}: any) => {
  const groupColumns: Column[] = [
    {
      field: 'actions',
      headerName: 'Action',
      minWidth: 150,
      flex: 1,
      type: 'actions',
      maxWidth: 100,
      getActions: (params: any) => {
        const actions = [
          <GridActionsCellItem
            key='edit'
            icon={<Icon icon='ic:baseline-edit' className='menu-icon update' />}
            label={constant?.Update}
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
    {
      field: 'agent_name',
      headerName: 'Agent Name',
      minWidth: 150,
      flex: 1
    },

    {
      field: 'guest_name',
      headerName: 'Guest Name',
      minWidth: 170,
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

    {
      field: 'totalPassengers',
      headerName: 'Total Passengers',
      minWidth: 150,
      flex: 1
    },
    {
      field: 'startTimestamp',
      headerName: 'Start Date and Time',
      minWidth: 200,
      flex: 1,
      renderCell: (params: any) =>
        params.value ? convertEpoctoTimeZoneDate(params.value, profile.timezone) : '-'
    },
    {
      field: 'from',
      headerName: 'From',
      minWidth: 300,
      flex: 1,
      renderCell: (params: any) => (
        <Tooltip title={params.value || ''}>
          <span>{params.value}</span>
        </Tooltip>
      )
    },
    {
      field: 'to',
      headerName: 'To',
      minWidth: 300,
      flex: 1,
      renderCell: (params: any) => (
        <Tooltip title={params.value || ''}>
          <span>{params.value}</span>
        </Tooltip>
      )
    }
  ].map((item: any) => ({
    ...item,
    sortable: false,
    align: ['actions']?.includes(item?.field) ? 'center' : 'left',
    headerAlign: ['actions']?.includes(item?.field) ? 'center' : 'left'
  }));

  return {
    groupColumns
  };
};
