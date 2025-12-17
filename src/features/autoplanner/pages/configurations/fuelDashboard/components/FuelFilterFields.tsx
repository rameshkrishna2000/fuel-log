import { Delete, Edit, LocationOn, Visibility } from '@mui/icons-material';
import { useAppSelector } from '../../../../../../app/redux/hooks';
import { convertDriverEpochToDateTime } from '../../../../../../utils/commonFunctions';
import { Box } from '@mui/material';

export const useFuelFilterColumns = ({
  setIsMap,
  handleMap,
  setSelectedValue,
  setIsOpen,
  setIsDelete,
  setSelectedId,
  setIsUpdate
}: any) => {
  const { timezone } = useAppSelector(state => state.myProfile.data);

  const columns = [
    {
      field: 'dateAndTime',
      headerName: 'Date',
      flex: 1,
      minWidth: 150,
      renderCell: (value: any) => {
        return convertDriverEpochToDateTime(value?.row?.dateAndTime, timezone);
      }
    },
    {
      field: 'vehicleNumber',
      headerName: 'Vehicle',
      flex: 1,
      minWidth: 120
    },
    {
      field: 'driver',
      headerName: 'Driver',
      flex: 1,
      minWidth: 120
    },
    {
      field: 'fuelType',
      headerName: 'Fuel Type',
      flex: 1,
      minWidth: 120
    },
    {
      field: 'volume',
      headerName: 'Fuel Volume',
      flex: 1,
      minWidth: 100
    },
    {
      field: 'adblueVolume',
      headerName: 'AdBlue Volume',
      flex: 1,
      minWidth: 120,
      renderCell: (value: any) => {
        return value?.row?.adblueVolume ? value?.row?.adblueVolume : 'NA';
      }
    },
    {
      field: 'fuelStation',
      headerName: 'Station',
      flex: 1,
      minWidth: 120
    },
    {
      field: 'cost',
      headerName: 'Cost',
      flex: 1,
      minWidth: 100,
      renderCell: (value: any) => {
        return value?.row?.cost ? value?.row?.cost : 'NA';
      }
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1,
      minWidth: 100,
      sortable: false,
      renderCell: (value: any) => {
        return (
          <LocationOn
            className='fuel-loc-icon'
            onClick={() => {
              setIsMap(true);
              handleMap(value?.row);
            }}
          />
        );
      }
    },
    {
      field: 'action',
      headerName: 'Actions',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (value: any) => {
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              cursor: 'pointer'
            }}
          >
            <Visibility
              className='fuel-view-icon'
              onClick={() => {
                setSelectedValue(value?.row);
                setIsOpen(true);
              }}
            />
            <Edit
              className='fuel-view-icon-edit'
              onClick={() => {
                setSelectedValue(value?.row);
                setIsUpdate(true);
              }}
            />
            <Delete
              className='fuel-view-icon-del'
              onClick={() => {
                setSelectedId(value?.row?.fuelEntryId);
                setIsDelete(true);
              }}
            />
          </Box>
        );
      }
    }
  ];
  return { columns };
};
