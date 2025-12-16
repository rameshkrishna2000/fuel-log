import { useAppDispatch } from '../../../../../../app/redux/hooks';
import { GetGrpBookings } from '../../../../redux/reducer/autoPlannerSlices/autoplanner';
import { useEffect } from 'react';

import { Icon } from '@iconify/react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { capitalizeFirstLetter } from '../../../../../../utils/commonFunctions';


// Today Dashboard Adhoc Functionality handling Hook
export const useAdhocFunction = ({
  setRefreshLoader,
  setPageSize,
  setPageNo,
  autoplannerID,
  setBadgeCount,
  ViewAdhocReqData,
  APsubAgent,
  APagent,
  setCallApi,
  setIsDialog,
  setSelectedTripRow,
  isAP
}: any) => {
  const dispatch = useAppDispatch();

  const handlePaginationAdhocReq = async (newPaginationModel: any) => {
    setRefreshLoader(true);

    const { pageSize: newPageSize, page: newPageNo } = newPaginationModel;
    setPageSize(newPageSize);
    setPageNo(newPageNo + 1);

    const payload = {
      mode: 'ALL',
      pageNo: newPageNo + 1,
      pageSize: newPageSize,
      autoplannerID: autoplannerID,
      isAdhoc: true
    };

    try {
      await dispatch(GetGrpBookings(payload));
    } finally {
      setRefreshLoader(false);
    }
  };

  useEffect(() => {
    setBadgeCount(ViewAdhocReqData?.data?.count ?? 0);
  }, [ViewAdhocReqData?.data?.count]);

  const adhocReqColumns: any[] = [
    ...(isAP
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
              const adhocAccepted = row?.adhocAccepted;
              const isAdhoc =
                row?.isAdhoc && ['Upcoming', null]?.includes(row?.tripStatus);

              if (adhocAccepted) {
                return [
                  <GridActionsCellItem
                    sx={{ marginLeft: '10px' }}
                    icon={
                      <Tooltip title='This booking is already accepted'>
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
                  />
                ];
              }

              return isAdhoc
                ? APagent || APsubAgent
                  ? [
                      <GridActionsCellItem
                        icon={
                          <Icon
                            icon='mdi:pencil'
                            height={18}
                            width={18}
                            color='#0d9488'
                          />
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
                      />,
                      <GridActionsCellItem
                        icon={
                          <Icon
                            icon='mdi:delete'
                            height={18}
                            width={18}
                            color='#dc2626'
                          />
                        }
                        label='Delete'
                        onClick={(e: any) => {
                          e.stopPropagation();
                          setSelectedTripRow(row);
                          setIsDialog('delete');
                          setCallApi(true);
                        }}
                        sx={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&:hover': {
                            backgroundColor: '#fef2f2'
                          }
                        }}
                        showInMenu
                      />
                    ]
                  : [
                      <GridActionsCellItem
                        icon={
                          <Icon
                            icon='mdi:pencil'
                            height={18}
                            width={18}
                            color='#0d9488'
                          />
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
                    />
                  ];
            }
          }
        ]
      : []),

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
      minWidth: 150,
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
        } else {
          return (
            <Typography sx={{ fontSize: '0.75rem', fontWeight: '500' }}>
              {params.row?.guestContactNumber || '-'}
            </Typography>
          );
        }

        const hasContactNumber = params.row?.driverContactNumber === 'null';

        // return params?.row?.isGuestArrived === 'Skipped' ||
        //   params?.row?.tripStatus === 'Completed' ? (
        //   <Tooltip
        //     enterDelay={200}
        //     leaveDelay={200}
        //     title={
        //       params?.row?.tripStatus === 'Completed'
        //         ? "Contact number can't be updated for completed bookings"
        //         : "Contact number can't be updated for skipped guests"
        //     }
        //   >
        //     <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
        //       {Boolean(params.row?.guestContactNumber)
        //         ? params?.row?.guestContactNumber
        //         : '-'}
        //     </Typography>
        //   </Tooltip>
        // ) : (
        //   <Box
        //     sx={{
        //       display: 'flex',
        //       alignItems: 'center',
        //       width: '100%',
        //       backgroundColor: hasContactNumber ? '#f1f8e9' : '#fff3e0',
        //       borderRadius: '8px',
        //       padding: '4px 8px',
        //       border: hasContactNumber ? '1px solid #8bc34a' : '1px solid #ff9800'
        //     }}
        //     onClick={event => {
        //       event.stopPropagation();
        //       setCallApi(true);
        //       setSelectedTripRow(params.row);
        //       setValue('phone', params?.row?.guestContactNumber);
        //       setIsDialog('AddContact');
        //     }}
        //   >
        //     <Icon
        //       icon={hasContactNumber ? 'ph:phone-plus' : 'ph:arrows-clockwise'}
        //       style={{
        //         color: hasContactNumber ? '#4CAF50' : '#ff9800',
        //         cursor: 'pointer',
        //         fontSize: '20px',
        //         marginRight: '8px',
        //         userSelect: 'none'
        //       }}
        //       className={'activeIcon'}
        //       onClick={() => {
        //         setCallApi(true);
        //         setIsDialog('AddContact');
        //       }}
        //     />

        //     <Typography
        //       sx={{ fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer' }}
        //     >
        //       {params.row?.guestContactNumber || 'Add contact'}
        //     </Typography>
        //   </Box>
        // );
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
              // display: 'flex',
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
      headerName: 'Destination',
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
    }
  ].map((item: any) => ({
    ...item,
    sortable: false,
    headerAlign: [
      'source',
      'destination',
      'from',
      'to',
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
      'from',
      'to',
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

  return { handlePaginationAdhocReq, adhocReqColumns };
};
