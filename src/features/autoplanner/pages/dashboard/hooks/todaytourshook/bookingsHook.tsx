import { debounce as Debounce } from 'lodash';
import { useAppDispatch } from '../../../../../../app/redux/hooks';
import { contactNumberValidation } from '../../../../redux/reducer/autoPlannerSlices/autoplanner';
import { useState } from 'react';
import {
  clearWhatsapp,
  getExcelAction,
  guestContactUpdateAction,
  sendwhatsappAction
} from '../../../../redux/reducer/autoPlannerSlices/autoGenerateSlice';

import { Icon } from '@iconify/react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { GridActionsCellItem } from '@mui/x-data-grid';
import {
  capitalizeFirstLetter,
  epochToTimeFormat
} from '../../../../../../utils/commonFunctions';

// Bookings Tab UI Functionalities
export const useBookingsAction = ({
  setInvalidRows,
  autoplannerID,
  selectedTripRow,
  PageNo,
  PageSize,
  scheduleDate,
  searchEvent,
  restToggle,
  clearErrors,
  APsubAgent,
  APagent,
  setCallApi,
  setIsDialog,
  setSelectedTripRow,
  timeZone,
  setValue
}: any) => {
  const dispatch = useAppDispatch();

  const [sendWhatsApp, setSendWhatsApp] = useState(false);

  const handleGuestContactChange = Debounce(async (event: any, journey: any) => {
    if (!event) {
      handleGuestContactChange.cancel();
      setInvalidRows((prev: any) => {
        const updatedRows = prev?.map((item: any) => ({
          ...item,
          color: item?.journeyID === journey ? '' : item?.color,
          contactNumber: item?.journeyID === journey ? '' : item?.contactNumber,
          isError: item?.journeyID === journey ? false : item?.isError
        }));
        return updatedRows;
      });
    }

    if (event) {
      let action1 = await dispatch(contactNumberValidation(event));

      if (action1?.payload) {
        setInvalidRows((prev: any) => {
          const updatedRows = prev?.map((item: any) => ({
            ...item,
            color:
              item?.journeyID === journey
                ? action1.payload?.status !== 200
                  ? '#ff07078c'
                  : ''
                : item?.color,
            contactNumber: item?.journeyID === journey ? event : item?.contactNumber,
            isError:
              item?.journeyID === journey && event
                ? action1?.payload?.status !== 200
                : item?.isError
          }));

          return updatedRows;
        });
      }
    }
  }, 500);

  const onChangeNumberSubmit = async (params: any) => {
    const AddContactPayload = [
      {
        autoplannerID,
        guestContactNumber: params.phone,
        journyId: selectedTripRow?.journeyId
      }
    ];

    const ExcelPayload = {
      PageNo: PageNo,
      PageSize: PageSize,
      autoplannerID: scheduleDate,
      tripMode: 'ALL',
      searchFor: searchEvent ? searchEvent : ''
    };

    const action = await dispatch(guestContactUpdateAction(AddContactPayload));

    const payloads = {
      autoplannerId: scheduleDate,
      journeyId: selectedTripRow?.journeyId
    };
    if (sendWhatsApp) {
      await dispatch(sendwhatsappAction(payloads));
    }
    restToggle();
    handleClose();
    dispatch(getExcelAction(ExcelPayload));

    setSendWhatsApp(false);
  };

  const handleClose = () => {
    clearErrors('');
    dispatch(clearWhatsapp());
    setCallApi(false);
    setIsDialog('');
    setValue('phone', '');
    restToggle();
    setSendWhatsApp(false);
  };

  const columns: any[] = [
    ...(!(APsubAgent || APagent)
      ? [
          {
            field: 'actions',
            headerName: 'Action',
            type: 'actions',
            minWidth: 60,
            maxWidth: 60,
            flex: 1,
            sortable: false,
            getActions: ({ row }: any) => {
              const isAdhoc =
                row?.isAdhoc && ['Upcoming', null]?.includes(row?.tripStatus);

              return isAdhoc
                ? [
                    <GridActionsCellItem
                      icon={
                        <Icon icon='mdi:pencil' height={18} width={18} color='#0d9488' />
                      }
                      label='Update'
                      onClick={(e: any) => {
                        e.stopPropagation();
                        setSelectedTripRow(row);
                        setIsDialog('adhoc');
                        setCallApi(true);
                      }}
                      sx={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          backgroundColor: '#f0fdfa'
                        }
                      }}
                      showInMenu
                    />
                  ]
                : [
                    <GridActionsCellItem
                      sx={{ marginLeft: '10px' }}
                      icon={
                        <Tooltip title='Only upcoming ad-hoc bookings are editable'>
                          <span>
                            <Icon
                              icon='ic:round-lock'
                              className='menu-icon update'
                              color='grey'
                              height='20'
                              width='20'
                            />
                          </span>
                        </Tooltip>
                      }
                      label='Not Editable'
                      // onClick={(e: any) => e.stopPropagation()}
                      // disabled
                    />
                  ];
            }
          }
        ]
      : []),

    {
      field: 'status',
      headerName: 'Guest Status',
      minWidth: 100,
      maxWidth: 100,
      flex: 1,
      sortable: false,
      renderCell: ({ row }: any) => {
        const updateTime = row?.guestStatusChangeAt;
        return (
          <Tooltip
            enterDelay={200}
            leaveDelay={200}
            title={
              row?.isGuestArrived === 'Arrived'
                ? 'Onboarded'
                : row?.isGuestArrived === 'Not Arrived'
                ? 'No show'
                : row?.isGuestArrived === 'Skipped'
                ? 'Skipped'
                : 'Yet to board'
            }
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Icon
                icon={
                  row?.isGuestArrived === 'Arrived'
                    ? 'mdi:tick-circle-outline'
                    : row?.isGuestArrived === 'Not Arrived'
                    ? 'mingcute:close-circle-line'
                    : row?.isGuestArrived === 'Skipped'
                    ? 'mdi:skip-next-circle-outline'
                    : 'ic:sharp-pending-actions'
                }
                height={18}
                width={18}
                style={{ marginRight: '10px' }}
                color={
                  row?.isGuestArrived === 'Arrived'
                    ? '#00b25c'
                    : row?.isGuestArrived === 'Not Arrived'
                    ? '#ff0004'
                    : row?.isGuestArrived === 'Skipped'
                    ? '#6c757d'
                    : 'orange'
                }
              />
              {updateTime === 0 ? '' : `${epochToTimeFormat(updateTime, timeZone)}`}
            </Box>
          </Tooltip>
        );
      }
    },
    {
      field: 'time',
      headerName: 'Time',
      minWidth: 100,
      maxWidth: 100,
      flex: 1,
      sortable: false,
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
      field: 'agentName',
      headerName: 'Agent',
      minWidth: 150,
      flex: 1,
      sortable: false,
      renderCell: ({ row }: any) => {
        return (
          <Box component={'span'} sx={{ fontSize: '12px' }}>
            {row?.agentName ? capitalizeFirstLetter(row?.agentName) : '-'}
          </Box>
        );
      }
    },
    {
      field: 'mode',
      headerName: 'Mode',
      minWidth: 70,
      maxWidth: 70,
      flex: 1,
      sortable: false,
      renderCell: ({ row }: any) => {
        return (
          <Box component={'span'} sx={{ fontSize: '12px' }}>
            {row?.mode ? row?.mode?.toUpperCase() : '-'}
          </Box>
        );
      }
    },
    {
      field: 'refNumber',
      headerName: 'Ref No.',
      minWidth: 150,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => (
        <Tooltip enterDelay={200} leaveDelay={200} title={params.value || ''}>
          <span style={{ fontSize: '12px' }}>{params.value ? params.value : '-'}</span>
        </Tooltip>
      )
    },
    {
      field: 'guestName',
      headerName: 'Guest',
      minWidth: 200,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => (
        <Tooltip enterDelay={200} leaveDelay={200} title={params.value || ''}>
          <Typography
            noWrap
            sx={{ width: params?.value ? '200px' : '', fontSize: '12px' }}
          >
            {params.value ? capitalizeFirstLetter(params.value) : '-'}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'guestContactNumber',
      headerName: 'Guest Contact No.',
      minWidth: 200,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => {
        if (params.row?.mode === 'RLR') {
          return <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>-</Typography>;
        }

        const hasContactNumber = params.row?.driverContactNumber === 'null';

        return params?.row?.isGuestArrived === 'Skipped' ||
          params?.row?.tripStatus === 'Completed' ? (
          <Tooltip
            enterDelay={200}
            leaveDelay={200}
            title={
              params?.row?.tripStatus === 'Completed'
                ? "Contact number can't be updated for completed bookings"
                : "Contact number can't be updated for skipped guests"
            }
          >
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
              {Boolean(params.row?.guestContactNumber)
                ? params?.row?.guestContactNumber
                : '-'}
            </Typography>
          </Tooltip>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              backgroundColor: hasContactNumber ? '#f1f8e9' : '#fff3e0',
              borderRadius: '8px',
              padding: '4px 8px',
              border: hasContactNumber ? '1px solid #8bc34a' : '1px solid #ff9800'
            }}
            onClick={event => {
              event.stopPropagation();
              setCallApi(true);
              setSelectedTripRow(params.row);
              setValue('phone', params?.row?.guestContactNumber);
              setIsDialog('AddContact');
            }}
          >
            <Icon
              icon={hasContactNumber ? 'ph:phone-plus' : 'ph:arrows-clockwise'}
              style={{
                color: hasContactNumber ? '#4CAF50' : '#ff9800',
                cursor: 'pointer',
                fontSize: '20px',
                marginRight: '8px',
                userSelect: 'none'
              }}
              className={'activeIcon'}
              onClick={() => {
                setCallApi(true);
                setIsDialog('AddContact');
              }}
            />

            <Typography
              sx={{ fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer' }}
            >
              {params.row?.guestContactNumber || 'Add contact'}
            </Typography>
          </Box>
        );
      }
    },

    {
      field: 'adultCount',
      headerName: 'Adult Count',
      minWidth: 100,
      maxWidth: 100,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          size='small'
          sx={{
            backgroundColor: '#eff2f4',
            color: '#3239ea',
            fontWeight: 'bold'
          }}
        />
      )
    },
    {
      field: 'childCount',
      headerName: 'Child Count',
      minWidth: 100,
      maxWidth: 100,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          size='small'
          sx={{
            backgroundColor: '#eff2f4',
            color: '#3239ea',
            fontWeight: 'bold'
          }}
        />
      )
    },
    {
      field: 'tripStatus',
      headerName: 'Trip Status',
      minWidth: 120,
      maxWidth: 120,
      flex: 1,
      sortable: false,
      renderCell: ({ row }: any) => {
        const status: any = {
          Upcoming: 'Upcoming',
          Intransit: 'In-transit',
          Completed: 'Completed'
          // TotalJobs: 'Upcoming' + 'Completed' + 'In-transit'
        };
        return row?.tripStatus ? status[row?.tripStatus] : 'Upcoming';
      }
    },
    {
      field: 'source',
      headerName: 'From',
      minWidth: 250,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => (
        <Tooltip enterDelay={200} leaveDelay={200} title={params.row.source} arrow>
          <Box
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              fontWeight: '500',
              color: '#424242',
              display: 'flex',
              justifyContent: 'flex-start',
              width: params.row.source ? '100%' : ''
            }}
          >
            {params.row.source ? params.row.source : '-'}
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
        <Tooltip enterDelay={200} leaveDelay={200} title={params.row.destination} arrow>
          <Box
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              fontWeight: '500',
              color: '#424242',
              display: 'flex',
              justifyContent: 'flex-start',
              width: params.row.destination ? '100%' : ''
            }}
          >
            {params.row.destination ? params.row.destination : '-'}
          </Box>
        </Tooltip>
      )
    },
    {
      field: 'trfOrGuide',
      headerName: 'Transfer / Guide',
      minWidth: 270,
      maxWidth: 270,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => (
        <Tooltip enterDelay={200} leaveDelay={200} title={params.row.trfOrGuide} arrow>
          <Box
            sx={{
              fontWeight: 'bold',
              backgroundColor: params.row.trfOrGuide ? '#aaaaaa96' : '',
              padding: params.row.trfOrGuide ? '4px 8px' : '',
              borderRadius: params.row.trfOrGuide ? '6px' : '',
              color: params.row.trfOrGuide ? '#7b1fa2' : ''
            }}
          >
            {params.row.trfOrGuide ? params.row.trfOrGuide : '-'}
          </Box>
        </Tooltip>
      )
    },
    {
      field: 'driverName',
      headerName: 'Driver Name',
      minWidth: 150,
      sortable: false,
      flex: 1,
      renderCell: (params: any) => (
        <span style={{ fontWeight: '500' }}>
          {params.value ? capitalizeFirstLetter(params.value) : '-'}
        </span>
      )
    },
    {
      field: 'vehicleNumber',
      headerName: 'Vehicle No.',
      minWidth: 150,
      flex: 1,
      sortable: false,
      renderCell: ({ value }: any) => (
        <Tooltip enterDelay={200} leaveDelay={200} title={value?.toUpperCase()}>
          <Chip
            label={value?.toLowerCase() === 'unassigned' ? value : value?.toUpperCase()}
            size='small'
            sx={{
              width: '120px',
              backgroundColor:
                value?.toLowerCase() === 'unassigned' ? '#ffebee' : '#e8f5e8',
              color: value?.toLowerCase() === 'unassigned' ? '#c62828' : '#2e7d32',
              fontWeight: 'bold',
              fontFamily: 'monospace'
            }}
          />
        </Tooltip>
      )
    },
    {
      field: 'driverContactNumber',
      headerName: 'Driver Contact No.',
      minWidth: 150,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => (
        <span style={{ fontWeight: '500', color: '#424242' }}>{params.value}</span>
      )
    }
  ].map((item: any) => ({
    ...item,
    sortable: false,
    headerAlign: [
      'source',
      'destination',
      'agentName',
      'refNumber',
      'guestName',
      'tripStatus',
      'trfOrGuide',
      'driverName',
      'mode',
      'driverContactNumber'
    ]?.includes(item.field)
      ? 'left'
      : 'center',
    align: [
      'source',
      'destination',
      'agentName',
      'refNumber',
      'guestName',
      'tripStatus',
      'trfOrGuide',
      'driverName',
      'mode',
      'driverContactNumber'
    ]?.includes(item.field)
      ? 'left'
      : 'center'
  }));

  return {
    handleGuestContactChange,
    onChangeNumberSubmit,
    sendwhatsappAction,
    setSendWhatsApp,
    columns,
    handleClose
  };
};
