import { useAppDispatch } from '../../../../../../app/redux/hooks';
import { useState } from 'react';
import {
  autoGenerateUpdateTripsAction,
  getExcelAction,
  getStandardDriverNames,
  getStandardVehicles,
  PvtGrpUpdate
} from '../../../../redux/reducer/autoPlannerSlices/autoGenerateSlice';
import { getTodayTours } from '../../../../redux/reducer/autoPlannerSlices/todayToursSlice';

import { Icon } from '@iconify/react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { capitalizeFirstLetter } from '../../../../../../utils/commonFunctions';
import EditIcon from '@mui/icons-material/Edit';

// Jobs screen's UI functionalities in Today Tours
export const useJobActions = ({
  setCallApi,
  setSelectedRow,
  setVehicleValue,
  setValidationErrorsMake,
  clearExternalVehicleErrors,
  internalReset,
  externalReset,
  selectedRow,
  driverNameDropdown,
  scheduleDate,
  PageSize,
  isOverview,
  setPageNo
}: any) => {
  const [hotelGuestView, setHotelGuestView] = useState(null);
  const [open, setOpen] = useState(false);
  const [external, setExternal] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  //function to handle detailed view
  const handleHotelsandGuestsView = (row: any) => {
    setHotelGuestView(row);
  };

  const handleOpenDialog = async (row: any) => {
    setCallApi(true);
    setSelectedRow(row);
    if (!row) return;

    const mode = row?.mode;
    let overview = null;

    if (['SIC', 'TSIC'].includes(mode)) {
      overview = row?.standardTourOverview;
    } else if (['PVT', 'GRP'].includes(mode)) {
      overview = row?.customTourOverview;
    }
    const isExternal = overview?.isExternalVehicle === 1;
    setExternal(isExternal);

    setVehicleValue('vehicle', isExternal ? 'external' : 'internal');

    if (isExternal) {
      setVehicleValue(
        'vehicleNumber',
        overview?.vehicleNumber === 'Unassigned' ? '' : overview?.vehicleNumber || ''
      );
      setVehicleValue(
        'driverName',
        overview?.driverName === 'Unassigned' ? '' : overview?.driverName || ''
      );

      setVehicleValue(
        'driverNumber',
        overview?.contactNumber === 'Unassigned' ||
          overview?.driverContactNumber === 'Unassigned'
          ? ''
          : overview?.contactNumber || overview?.driverContactNumber || ''
      );
      setVehicleValue('passengerCount', overview?.seatingCapacity || '');
    } else {
      setVehicleValue(
        'vehicleNumber',
        overview?.vehicleNumber === 'Unassigned' ? '' : overview?.vehicleNumber || ''
      );
      setVehicleValue(
        'driverName',
        overview?.driverID === 'Unassigned' ? '' : overview?.driverID || ''
      );
      setVehicleValue(
        'driverNumber',
        overview?.driverContactNumber === 'Unassigned' ||
          overview?.contactNumber === 'Unassigned'
          ? ''
          : overview?.driverContactNumber || overview?.contactNumber || ''
      );

      setVehicleValue('passengerCount', overview?.seatingCapacity || '');
    }

    const payload = {
      autoplannerID: row.date,
      tripMode: row?.mode,
      tourName: row?.tourName,
      totalPassengers: row?.totalGuests,
      vehicleNumber: row?.vehicleNumber,
      assignedVehicle: row?.vehicleNumber,
      isCurrentSchedule: true,
      journeyId: overview?.journeyId || ''
    };

    setOpen(true);
    if (!isExternal) {
      dispatch(getStandardVehicles(payload));
      if (row?.vehicleNumber !== 'Unassigned') {
        dispatch(getStandardDriverNames(payload));
      }
    }
  };

  const handleCancel = () => {
    setSelectedRow('');
    setCallApi(false);
    setOpen(false);
    setValidationErrorsMake({ driverNumber: 'no-error', phone: 'no-error' });
    clearExternalVehicleErrors();
    internalReset();
    externalReset();
  };

  const onvehicleSubmit = async (params: any) => {
    const isPVTGRP = ['PVT', 'GRP']?.includes(selectedRow?.mode);
    // const isSICTSIC = ['SIC', 'TSIC'].includes(selectedRow?.mode);
    const external = params?.vehicle === 'external';

    // const isStandard = selectedRow.standardTourOverview !== null;
    const SICTSICPayload = {
      id: selectedRow.standardTourOverview?.id || selectedRow.id,
      tourName: selectedRow.standardTourOverview?.tourName || selectedRow.tourName,
      pickupWindow: selectedRow.standardTourOverview?.pickupWindow,
      returnTime: selectedRow.standardTourOverview?.returnTime,
      totalAdultCount: selectedRow.standardTourOverview?.totalAdultCount,
      totalChildCount: selectedRow.standardTourOverview?.totalChildCount || 0,
      netCount: selectedRow.standardTourOverview?.netCount,
      isExternalVehicle: external ? 1 : 0,
      isReturnTrip: selectedRow.standardTourOverview?.isReturnTrip || 0,
      modifyVehicleDriver: null,
      driverContactNumber: params?.driverNumber,
      //internal
      vehicleNumber: params?.vehicleNumber,
      driverID: params?.driverName || selectedRow.standardTourOverview?.driverID,
      driverName:
        driverNameDropdown?.find((value: any) => value?.id === params?.driverName)
          ?.driverName || params?.driverName,
      //external
      externalVehicleView: external
        ? {
            vehicleNumber: params?.vehicleNumber,
            driverName: params?.driverName,
            driverID:
              params?.driverName && params?.driverNumber
                ? `${params?.driverName}${params?.driverNumber}`
                : null,
            mobileNumber: params?.driverNumber,
            seatingCapacity: params?.passengerCount
          }
        : null
    };

    const PVTGRPPayload = {
      agentName: selectedRow.customTourOverview?.agentName,
      guestName: selectedRow.customTourOverview?.guestName,
      source: selectedRow.customTourOverview?.source,
      startLat: selectedRow.customTourOverview?.startLat,
      startLng: selectedRow.customTourOverview?.startLng,
      destination: selectedRow.customTourOverview?.destination,
      endLat: selectedRow.customTourOverview?.endLat,
      endLng: selectedRow.customTourOverview?.endLng,
      time: selectedRow.customTourOverview?.time,
      childCount: selectedRow.customTourOverview?.childCount || 0,
      isCustomRoute: 1,

      adultCount: selectedRow.customTourOverview?.adultCount || 0,
      refNumber: selectedRow.customTourOverview?.refNumber || '',
      tourName: selectedRow.customTourOverview?.destination,

      isExternalVehicle: external ? 1 : 0,
      journeyId: selectedRow.customTourOverview?.journeyId,

      modifyVehicleDriver: null,

      //internal
      driverID: params?.driverName,
      driverName:
        driverNameDropdown?.find((value: any) => value?.id === params?.driverName)
          ?.driverName || params?.driverName,
      vehicleNumber: params?.vehicleNumber,
      // external
      seatingCapacity: params?.passengerCount,
      contactNumber: params?.driverNumber
    };

    const pageDetails = {
      autoplannerID: scheduleDate,
      tripMode: selectedRow?.mode,
      isCurrentSchedule: true
    };
    const payload = isPVTGRP ? PVTGRPPayload : SICTSICPayload;
    const datas = { payload, pageDetails, todatTrips: true };
    const action = await (!isPVTGRP
      ? dispatch(autoGenerateUpdateTripsAction(datas as any))
      : dispatch(PvtGrpUpdate(datas as any)));

    if (
      action.type === autoGenerateUpdateTripsAction.fulfilled.type ||
      action.type === PvtGrpUpdate.fulfilled.type
    ) {
      setCallApi(false);
      setOpen(false);
      const payload = {
        PageNo: 1,
        PageSize: PageSize,
        autoplannerID: scheduleDate,
        tripMode: 'ALL'
      };

      setPageNo(1);
      if (isOverview) {
        await dispatch(getTodayTours(payload));
      } else {
        await dispatch(getExcelAction(payload));
      }
    }
  };

  const groupColumns: any = [
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 100,
      width: 50,
      flex: 1,
      sortable: false,
      renderCell: ({ row }: any) => {
        return (
          <Tooltip
            enterDelay={200}
            leaveDelay={200}
            title={[null, 'Upcoming']?.includes(row?.status) ? 'Upcoming' : row?.status}
          >
            <Icon
              icon={
                row?.status === 'Completed'
                  ? 'mdi:tick-circle-outline'
                  : row?.status === 'Skipped'
                  ? 'mdi:skip-next-circle-outline'
                  : [null, 'Upcoming']?.includes(row?.status)
                  ? 'ic:sharp-pending-actions'
                  : 'bx:trip'
              }
              height={18}
              width={18}
              color={
                row?.status === 'Completed'
                  ? '#00b25c'
                  : row?.status === 'Skipped'
                  ? '#6c757d'
                  : [null, 'Upcoming']?.includes(row?.status)
                  ? 'orange'
                  : '#c7a107'
              }
            />
          </Tooltip>
        );
      }
    },
    {
      field: 'timeFrom',
      headerName: 'Time',
      flex: 1,
      minWidth: 50,
      renderCell: (params: any) => {
        let timeStr = params.value;

        if (!timeStr) return '';

        let [hours, minutes] = timeStr.split(':').map(Number);
        let period = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12 || 12;

        return (
          <Tooltip
            enterDelay={200}
            leaveDelay={200}
            title={`${hours.toString().padStart(2, '0')}:${minutes
              .toString()
              .padStart(2, '0')} ${period}`}
          >
            <Chip
              label={`${hours.toString().padStart(2, '0')}:${minutes
                .toString()
                .padStart(2, '0')} ${period}`}
              size='small'
              sx={{
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }}
            />
          </Tooltip>
        );
      }
    },
    {
      field: 'tourName',
      headerName: 'Tour Name / From-To',
      minWidth: 200,
      flex: 1,
      renderCell: ({ row }: any) => {
        return row?.tourName ? (
          <Tooltip
            enterDelay={200}
            leaveDelay={200}
            title={row?.tourName?.replace('->', '-')}
          >
            <Box
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
                fontWeight: '500',
                color: '#424242'
              }}
            >
              {row?.tourName?.replace('->', '-')}
            </Box>
          </Tooltip>
        ) : (
          <Box>-</Box>
        );
      }
    },
    {
      field: 'mode',
      headerName: 'Mode',
      flex: 1,
      minWidth: 80,
      renderCell: ({ row }: any) => (
        <span style={{ fontWeight: '500' }}>
          {row.mode ? capitalizeFirstLetter(row.mode) : '-'}
        </span>
      )
    },
    {
      field: 'vehicleNumber',
      headerName: 'Vehicle No.',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: ({ value, row }: any) => {
        const isNotRlR = row?.mode !== 'RLR' && ['Upcoming', null]?.includes(row?.status);

        return (
          <Tooltip
            enterDelay={200}
            leaveDelay={200}
            title={isNotRlR ? 'Click to change vehicle' : 'Not allowed'}
          >
            <Box
              onClick={isNotRlR ? () => handleOpenDialog(row) : undefined}
              tabIndex={isNotRlR ? 0 : undefined}
              onKeyDown={(event: any) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  isNotRlR && handleOpenDialog(row);
                }
              }}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 1,
                px: 1.8,
                py: 0.5,
                borderRadius: '20px',
                width: '120px',
                cursor: isNotRlR ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                backgroundColor:
                  value?.toLowerCase() === 'unassigned' ? '#ffebee' : '#e8f5e8',
                color: value?.toLowerCase() === 'unassigned' ? '#c62828' : '#2e7d32',
                border: '1px solid',
                borderColor:
                  value?.toLowerCase() === 'unassigned' ? '#f44336' : '#66bb6a',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor:
                    value?.toLowerCase() === 'unassigned' ? '#ffcdd2' : '#c8e6c9',
                  transform: isNotRlR ? 'scale(1.03)' : 'none'
                },
                pointerEvents: isNotRlR ? 'auto' : 'none',
                opacity: isNotRlR ? 1 : 0.5
              }}
            >
              <span style={{ flex: 1 }}>
                {value?.toLowerCase() === 'unassigned' ? value : value?.toUpperCase()}
              </span>
              {isNotRlR && <EditIcon sx={{ fontSize: 16 }} />}
            </Box>
          </Tooltip>
        );
      }
    },

    {
      field: 'driverContact',
      headerName: 'Driver Contact No.',
      flex: 1,
      minWidth: 250,
      renderCell: (params: any) => {
        const hasContactNumber = params.value == 'null';

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '75%',
              backgroundColor: hasContactNumber ? '#f1f8e9' : '#fff3e0',
              borderRadius: '8px',
              padding: '4px 8px',
              justifyContent: 'center',
              border: hasContactNumber ? '1px solid #8bc34a' : '1px solid #ff9800'
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', fontWeight: '500' }}>
              {params.value || 'No contact'}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'name',
      headerName: 'Driver Name',
      flex: 1,
      minWidth: 150,
      renderCell: (params: any) => (
        <span style={{ fontWeight: '500' }}>
          {params.value ? capitalizeFirstLetter(params.value) : '-'}
        </span>
      )
    },
    {
      field: 'tripsView',
      headerName: 'Jobs',
      flex: 1,
      minWidth: 150,
      renderCell: (params: any) => (
        <Box
          className='view-available'
          tabIndex={0}
          onClick={event => {
            event.stopPropagation();
            setCallApi(true);
            if (isOverview) {
              handleHotelsandGuestsView(params?.row);
            }
          }}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setCallApi(true);
              if (isOverview) {
                handleHotelsandGuestsView(params?.row);
              }
            }
          }}
        >
          <Icon
            icon='fluent:guest-add-20-filled'
            className='view-available-icon'
            onKeyDown={(e: any) => {}}
          />
          <Typography className='view-available-text'>View</Typography>
        </Box>
      )
    }
  ]?.map((value: any) => ({
    ...value,
    headerAlign: ['tourName', 'name', 'mode'].includes(value.field) ? 'left' : 'center',
    align: ['tourName', 'name', 'mode'].includes(value.field) ? 'left' : 'center',
    sortable: false
  }));

  return {
    handleHotelsandGuestsView,
    hotelGuestView,
    setHotelGuestView,
    handleOpenDialog,
    handleCancel,
    onvehicleSubmit,
    open,
    setOpen,
    external,
    setExternal,
    groupColumns
  };
};
