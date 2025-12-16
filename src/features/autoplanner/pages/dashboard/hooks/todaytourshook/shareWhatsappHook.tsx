import { useAppDispatch } from '../../../../../../app/redux/hooks';
import { clearContactError } from '../../../../redux/reducer/autoPlannerSlices/autoplanner';
import { useEffect, useLayoutEffect, useState } from 'react';
import {
  clearWhatsapp,
  guestContactUpdateAction,
  sendwhatsappAction
} from '../../../../redux/reducer/autoPlannerSlices/autoGenerateSlice';

import { Box, Tooltip } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import PhoneNoTextField from '../../../../../../common/components/customized/customtextfield/PhoneNoTextField';

// Share Whatsapp functionalities for hanldling the whatsapp share
export const useWhatsappAction = ({
  scheduleDate,
  setIsDialog,
  invalidRows,
  autoplannerID,
  setInvalidRows,
  validationErrors,
  phoneTrigger,
  sendwhatsapp,
  data,
  isLoading,
  handleGuestContactChange,
  count
}: any) => {
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [guestContactList, setGuestContactList] = useState<
    { autoplannerID: number; guestContactNumber: string; journyId: string }[]
  >([]);
  const { control: phoneControl, setValue: settingValue, reset } = useForm({});

  const dispatch = useAppDispatch();

  const handleSendWhatsapp = async () => {
    const payload = {
      autoplannerId: scheduleDate
    };
    const action = await dispatch(sendwhatsappAction(payload));

    if (!(action?.payload?.data?.data?.length > 0)) {
      setIsDialog('');
    }

    // setIsDialog('');
  };

  const handleSkip = async () => {
    const payload = {
      autoplannerId: scheduleDate,
      skippingPhoneNumber: true
    };
    await dispatch(sendwhatsappAction(payload));
    dispatch(clearWhatsapp());
    setIsDialog('');
  };

  const handleUpdateContact = async () => {
    const filteredRows = invalidRows?.filter((item: any) => item?.contactNumber);

    const payloadData = filteredRows?.map((item: any) => ({
      autoplannerID,
      guestContactNumber: item?.contactNumber,
      journyId: item?.journeyID
    }));
    if (payloadData?.length > 0) {
      await dispatch(guestContactUpdateAction(payloadData));
    }
    setGuestContactList([]);
    const payload = {
      autoplannerId: scheduleDate
    };
    const action = await dispatch(sendwhatsappAction(payload));

    if (
      action?.payload?.status == 200 &&
      action.payload.data?.message === 'All messages sent successfully'
    ) {
      setIsDialog('');
    }
  };

  const handleInvalidClose = () => {
    dispatch(clearWhatsapp());
    setIsDialog('');
    // const payload = {
    //   ...tripPayload,
    //   ...filterPayload,
    //   PageNo: 1,
    //   PageSize: PageSize,
    //   autoplannerID: scheduleDate,
    //   tripMode: 'ALL',
    //   agentName: agent,
    //   guestName: guest,
    //   tourName: tour,
    //   vehicleNumber: vehicle
    // };
    // dispatch(getExcelAction(payload));
  };

  useEffect(() => {
    if (validationErrors?.phone) {
      phoneTrigger('phone');
    }
  }, [validationErrors?.phone]);

  useEffect(() => {
    if (sendwhatsapp?.data?.data?.length === 0) {
      setRows([]);
    }

    if (sendwhatsapp?.data?.data?.length > 0) {
      const invalidContact = sendwhatsapp?.data?.data?.map(
        (item: any, index: number) => ({
          ...item,
          id: index + 1,
          isError: false,
          contactNumber: '',
          color: ''
        })
      );

      setInvalidRows(invalidContact);
    } else {
      setInvalidRows([]);
    }
  }, [sendwhatsapp?.data?.data]);

  useEffect(() => {
    if (sendwhatsapp?.data?.count > 0) {
      setIsDialog('Nocontact');
    }
  }, [sendwhatsapp]);

  useLayoutEffect(() => {
    if (data?.length === 0) {
      setRows([]);
    }

    if (data?.length > 0) {
      const getExcel = data?.map((item: any, index: number) => ({
        ...item,
        id: index + 1,
        driver: item.driverName + ' - ' + item.driverContactNumber,
        totalCount: item?.adultCount + item?.childCount,
        color: ['Not Arrived']?.includes(item?.isGuestArrived)
          ? '#ffe0db'
          : ['Arrived']?.includes(item?.isGuestArrived)
          ? '#d6ffce'
          : item?.isGuestArrived === 'Skipped'
          ? '#D9D3D0'
          : '#fff',
        trfOrGuide:
          item.transferInstance !== null
            ? `TRF BY ${
                item.transferInstance?.driverName
              } ${item.transferInstance?.vehicleNumber?.toUpperCase()} ${
                item?.transferInstance.contactNumber
              }`
            : item.guideName
            ? `GUIDE ${item.guideName} ${item.guideContactNumber}`
            : ''
      }));

      setRows(getExcel);
      setRowCount(count);
    } else if (!isLoading) {
      setRows([]);
    }
  }, [data, isLoading]);

  useEffect(() => {
    return () => {
      dispatch(clearContactError());
    };
  }, []);

  useEffect(() => {
    return () => {
      dispatch(clearWhatsapp());
    };
  }, []);

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
        <Tooltip enterDelay={200} leaveDelay={200} title={params.value || ''}>
          <span>{params.value}</span>
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
        <Tooltip enterDelay={200} leaveDelay={200} title={params.value || ''}>
          <span>{params.value}</span>
        </Tooltip>
      )
    },
    {
      field: 'guestContactNumber',
      headerName: 'Guest Contact Number',
      minWidth: 250,
      flex: 1,
      renderCell: (params: any) => {
        const row: any = params.row as { journeyId: string };
        const journyId = row.journeyID;

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
              control={phoneControl}
              defaultValue={''}
              rules={{ required: true }}
              render={({ field }: any) => (
                <PhoneNoTextField
                  setValue={settingValue}
                  name='phone'
                  isOptional={true}
                  style='share'
                  margin={'2px'}
                  onChange={(e: any) => {
                    handleGuestContactChange(e, journyId);
                  }}
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
        <Tooltip enterDelay={200} leaveDelay={200} title={params.row.source} arrow>
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
        <Tooltip enterDelay={200} leaveDelay={200} title={params.row.destination} arrow>
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
  ].map((item: any) => ({ ...item, sortable: false }));

  return {
    handleSkip,
    handleSendWhatsapp,
    handleUpdateContact,
    handleInvalidClose,
    rows,
    setRows,
    rowCount,
    setRowCount,
    invalidColumns
  };
};
