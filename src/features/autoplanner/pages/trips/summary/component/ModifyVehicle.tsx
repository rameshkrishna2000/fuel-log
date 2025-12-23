import { Box, Dialog, Tooltip, Typography } from '@mui/material';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';
import CustomDataGrid from '../../../../../../common/components/customized/customdatagrid/CustomDataGrid';
import { useEffect, useState } from 'react';
import CustomSelect from '../../../../../../common/components/customized/customselect/CustomSelect';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import './ModifyVehicle.scss';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setProceed: React.Dispatch<React.SetStateAction<boolean>>;
  loader: boolean;
  totalSummary: any;
  setTotalSummary: any;
  customTourRows: any;
  loading: boolean;
  submitTour: Function;
}
const ModifyVehicle = ({
  open,
  setOpen,
  loader,
  loading,
  totalSummary,
  setTotalSummary,
  customTourRows,
  setProceed,
  submitTour
}: Props) => {
  const [rows, setRows] = useState([]);
  const [values, setValues] = useState<{ [key: string]: string }>({});

  const [isSave, setIsSave] = useState(true);

  const schema = yup.object().shape({
    vehicle: yup.string().notRequired()
  });

  const { control } = useForm({
    resolver: yupResolver(schema)
  });

  const vehicleOptions = (vehicle: any, defaultVehicle: any) => {
    const allVehicle = [defaultVehicle, ...vehicle?.availableVehicles];
    return allVehicle
      ? allVehicle.map((item: any) => ({
          id: item?.vehicleNumber,
          label: `${item?.vehicleNumber.toUpperCase()} (${item?.vehicleCapacity}) ${
            item?.seatWastage !== 0 ? `[Seat Wastage: ${item?.seatWastage}%]` : ''
          }`
        }))
      : [defaultVehicle];
  };

  const handleChange = (value: any, row: any) => {
    if (totalSummary !== null && value?.id) {
      const updatedData = {
        ...totalSummary,
        customTourInfos: totalSummary.customTourInfos.map((transfer: any) => {
          const guestsMatch = transfer.journey_id === row?.journey_id;
          if (guestsMatch) {
            const updatedPreferences = (transfer.vehiclePreferences || []).map(
              (pref: any) => ({
                ...pref,
                isProcessed: 2
              })
            );
            updatedPreferences.push({
              vehicleNumber: value.id,
              isMainCoach: null,
              isExternalVehicle: row?.isExternalVehicle || 0,
              isProcessed: 0
            });
            return {
              ...transfer,
              vehiclePreferences: updatedPreferences
            };
          }

          return transfer;
        })
      };

      const isSave =
        JSON.stringify(
          totalSummary?.customTourInfos
            ?.filter((vehicle: any) => vehicle.isPopUpNeeded)
            ?.map((item: any) => item?.vehicleNumber)
        ) === JSON.stringify(Object.values({ ...values, [row?.journey_id]: value.id }));

      setIsSave(isSave);

      setValues(prev => ({ ...prev, [row.journey_id]: value.id }));
      setTotalSummary(updatedData);
    }
  };

  const column = [
    { field: 'pickupTime', headerName: 'Time', minWidth: 150, maxWidth: 150, flex: 1 },
    {
      field: 'pickup',
      headerName: 'Pickup',
      minWidth: 200,
      flex: 1,
      renderCell: (params: any) => (
        <Tooltip title={params.row.pickup} arrow>
          <Box
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}
          >
            {params.row.pickup}
          </Box>
        </Tooltip>
      )
    },
    {
      field: 'drop',
      headerName: 'Drop',
      minWidth: 200,
      flex: 1,
      renderCell: (params: any) => (
        <Tooltip title={params.row.drop} arrow>
          <Box
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}
          >
            {params.row.drop}
          </Box>
        </Tooltip>
      )
    },
    {
      field: 'totalPassengers',
      headerName: 'Passengers',
      minWidth: 100,
      maxWidth: 100,
      flex: 1
    },
    {
      field: 'actions',
      headerName: 'Vehicle',
      minWidth: 200,
      maxWidth: 300,
      flex: 1,
      align: 'center',
      renderCell: (params: any) => {
        const defaultVehicle = {
          vehicleNumber: params.row.vehicleNumber.split(' ')[0].toLowerCase(),
          vehicleCapacity: params.row.vehicleCapacity,
          seatWastage: 0
        };
        return (
          <Box sx={{ width: '100%', display: 'flex' }}>
            <Box sx={{ width: '100%', marginTop: '5px' }}>
              <CustomSelect
                control={control}
                id={`vehicle-${params.id}`}
                name={`vehicle-${params.id}`}
                defaultValue={params.row.vehicleNumber.split(' ')[0].toLowerCase()}
                placeholder='Select Vehicle'
                options={vehicleOptions(params?.row, defaultVehicle)}
                values={{
                  id:
                    values[params.row.journey_id] ||
                    params.row.vehicleNumber.split(' ')[0].toLowerCase()
                }}
                onChanges={(event: any, value: any) => {
                  handleChange(value, params.row);
                }}
              />
            </Box>
            {params?.row?.unassignedInfo && (
              <Tooltip title={params?.row?.unassignedInfo} arrow>
                <Icon
                  icon='material-symbols:info-rounded'
                  color='warning'
                  width='24'
                  height='24'
                />
              </Tooltip>
            )}
          </Box>
        );
      }
    }
  ];

  useEffect(() => {
    const customTour = customTourRows.filter((items: any) => items.isPopUpNeeded === 1);

    setRows(customTour);
    let currentAssignement = {};

    customTour?.forEach((assignment: any) => {
      currentAssignement = {
        ...currentAssignement,
        [assignment.journey_id]: assignment.vehicleNumber?.split(' ')[0].toLowerCase()
      };
    });
    setValues(currentAssignement);
    if (customTour?.length === 0 && !loading) setOpen(false);
    else if (customTour?.length > 0 && !loading) setOpen(true);
  }, [customTourRows, loading]);

  return (
    <Dialog
      open={open}
      className='modify-vehicle-dialog animate__animated animate__zoomIn animate__fast'
      BackdropProps={{
        invisible: true
      }}
      fullWidth
    >
      <Box className='modify-vehicle-dialog-container'>
        <Box className='modify-vehicle-dialog-header'>
          <Box sx={{ width: '80%' }}>
            <Typography paragraph className='modify-vehicle-title'>
              Vehicle Assignment Alert
            </Typography>
            <Typography paragraph className='modify-vehicle-description'>
              The selected vehicle for this tour results in higher seating wastage
            </Typography>
          </Box>
          <Box className='modify-vehicle-close' onClick={() => setOpen(false)}>
            <Icon icon='ic:round-close' className='modify-vehicle-close-icon' />
          </Box>
        </Box>
        <Box className='modify-vehicle-dialog-component'>
          <Box sx={{ height: '250px', overflow: 'auto' }}>
            <CustomDataGrid
              rows={rows}
              columns={column}
              loading={loader}
              type={'noPageNation'}
              paginationMode={'client'}
              stopAnimation={true}
              rowHeight={42}
            />
          </Box>
          <Box className='modify-vehicle-conform-btn'>
            <Typography paragraph className='modify-vehicle-description'>
              {isSave
                ? 'There may be some bookings still unassigned,if you proceed, you will need to assign them manually in the Excel file. '
                : 'Please confirm your vehicle selection from the dropdown, and click Reschedule to proceed with the current assignment'}
            </Typography>
            <CustomButton
              category={isSave ? 'Save' : 'Reschedule'}
              className={isSave ? 'saveChanges' : 'cancel'}
              onClick={() => {
                setOpen(false);
                if (isSave) {
                  submitTour(true);
                } else {
                  setProceed(true);
                }
              }}
            />
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ModifyVehicle;
