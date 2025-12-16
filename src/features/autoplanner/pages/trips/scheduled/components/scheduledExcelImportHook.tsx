import { Box, Tooltip } from '@mui/material';
import { Controller } from 'react-hook-form';
import PhoneNoTextField from '../../../../../../common/components/customized/customtextfield/PhoneNoTextField';
import {
  clearWhatsapp,
  getExcelAction
} from '../../../../redux/reducer/autoPlannerSlices/autoGenerateSlice';
import { useAppDispatch } from '../../../../../../app/redux/hooks';

export const useInvalidColumn = ({
  control,
  setValue,
  handleGuestContactChange
}: {
  control: any;
  setValue: any;
  handleGuestContactChange: (value: any, journeyId: string) => void;
}) => {
  const invalidColumns: any[] = [
    {
      field: 'time',
      headerName: 'Time',
      minWidth: 100,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => {
        let timeStr = params.value;
        if (!timeStr) return '';

        let [hours, minutes] = timeStr.split(':').map(Number);
        let period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;

        return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
      }
    },
    { field: 'agentName', headerName: 'Agent', minWidth: 150, flex: 1, sortable: false },
    { field: 'mode', headerName: 'Mode', minWidth: 100, flex: 1, sortable: false },
    {
      field: 'refNumber',
      headerName: 'Ref No.',
      minWidth: 150,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => (
        <Tooltip title={params.value || ''}>
          <span>{params.value ? params.value : '-'}</span>
        </Tooltip>
      )
    },
    {
      field: 'guestName',
      headerName: 'Guest',
      minWidth: 220,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => (
        <Tooltip title={params.value || ''}>
          <span>{params.value ? params.value : '-'}</span>
        </Tooltip>
      )
    },
    {
      field: 'guestContactNumber',
      headerName: 'Guest Contact Number',
      minWidth: 250,
      flex: 1,
      renderCell: (params: any) => {
        const row: any = params.row;
        const journeyId = row.journeyID;

        return (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              px: 1
            }}
          >
            <Controller
              name='phone'
              control={control}
              defaultValue=''
              rules={{ required: true }}
              render={() => (
                <PhoneNoTextField
                  setValue={setValue}
                  name='phone'
                  isOptional
                  margin='2px'
                  style='share'
                  onChange={(e: any) => handleGuestContactChange(e, journeyId)}
                />
              )}
            />
          </Box>
        );
      }
    },
    {
      field: 'source',
      headerName: 'From',
      minWidth: 250,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => (
        <Tooltip title={params.row.source} arrow>
          <Box
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}
          >
            {params.row.source}
          </Box>
        </Tooltip>
      )
    },
    {
      field: 'destination',
      headerName: 'To',
      minWidth: 250,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => (
        <Tooltip title={params.row.destination} arrow>
          <Box
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}
          >
            {params.row.destination}
          </Box>
        </Tooltip>
      )
    },
    {
      field: 'vehicleNumber',
      headerName: 'Vehicle No',
      minWidth: 100,
      flex: 1,
      sortable: false,
      renderCell: ({ value }: any) =>
        value?.toLowerCase() === 'unassigned' ? value : value?.toUpperCase()
    }
  ];

  return { invalidColumns };
};

export const useExcelImportHook = ({
  setAnchorEl,
  setIsDialog,
  reset,
  setOnly,
  tripPayload,
  filterPayload,
  PageSize,
  scheduleDate,
  agent,
  guest,
  tour,
  vehicle
}: any) => {
  const dispatch = useAppDispatch();

  /** ───────────────────────────────
   * Close main import dialog
   ─────────────────────────────── */
  const handleClose = () => {
    setAnchorEl(null);
    dispatch(clearWhatsapp());
    setIsDialog('');
    reset();
    setOnly(false);
  };

  /** ───────────────────────────────
   * Close invalid data dialog
   ─────────────────────────────── */
  const handleInvalidClose = () => {
    dispatch(clearWhatsapp());
    setIsDialog('');

    const payload = {
      ...tripPayload,
      ...filterPayload,
      PageNo: 1,
      PageSize,
      autoplannerID: scheduleDate,
      tripMode: 'ALL',
      agentName: agent,
      guestName: guest,
      tourName: tour,
      vehicleNumber: vehicle
    };

    dispatch(getExcelAction(payload));
  };

  return {
    handleClose,
    handleInvalidClose
  };
};
