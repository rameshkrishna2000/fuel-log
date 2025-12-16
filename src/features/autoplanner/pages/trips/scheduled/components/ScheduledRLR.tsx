import { Box, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import CustomTextField from '../../../../../../common/components/customized/customtextfield/CustomTextField';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import { usePagination } from '../../../configurations/regular/hooks/regularDatas';
import CustomDataGrid from '../../../../../../common/components/customized/customdatagrid/CustomDataGrid';
import nodata from '../../../../../../app/assets/images/nodata.png.png';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { capitalizeFirstLetter } from '../../../../../../utils/commonFunctions';
import { switchTripsAction } from '../../../../redux/reducer/autoPlannerSlices/autoGenerateSlice';

const ScheduledRLR = ({ scheduleDate }: any) => {
  const dispatch = useAppDispatch();

  const { data, isLoading, count } = useAppSelector(state => state.switchTrip);
  const { control } = useForm();

  const [rows, setRows] = useState<any>([]);

  const {
    pageNo,
    pageSize,
    handlePagination,
    handleSearchChange,
    handleSortChange,
    search
  } = usePagination({
    page: 1,
    pagesize: 10,
    url: switchTripsAction,
    payloads: { autoplannerID: scheduleDate, tripMode: 'RLR' }
  });

  const columns = [
    {
      title: 'Tour Name',
      field: 'tourName',
      headerName: 'Tour Name',
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }: any) => {
        return Boolean(row?.tourName) ? row?.tourName : '-';
      }
    },
    {
      title: 'Agent Name',
      field: 'agentName',
      headerName: 'Agent Name',
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }: any) => {
        return Boolean(row?.agentName) ? row?.agentName : '-';
      }
    },
    {
      title: 'Ref Number',
      field: 'refNumber',
      headerName: 'Ref Number',
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }: any) => {
        return Boolean(row?.refNo) ? row?.refNo : '-';
      }
    },
    {
      title: 'From',
      headerName: 'From',
      field: 'source',
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }: any) => {
        return (
          <Box sx={{ width: '200px', display: 'flex', justifyContent: 'center' }}>
            <Tooltip title={row?.source}>
              <Typography noWrap sx={{ fontSize: '12px' }}>
                {row?.source}
              </Typography>
            </Tooltip>
          </Box>
        );
      }
    },
    {
      title: 'To',
      headerName: 'To',
      field: 'destination',
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }: any) => {
        return (
          <Box sx={{ width: '200px', display: 'flex', justifyContent: 'center' }}>
            <Tooltip title={row?.destination}>
              <Typography noWrap sx={{ fontSize: '12px' }}>
                {row?.destination}
              </Typography>
            </Tooltip>
          </Box>
        );
      }
    },
    {
      title: 'Start Time',
      field: 'time',
      headerName: 'Start Time',
      flex: 1,
      minWidth: 150,
      renderCell: (params: any) => {
        let timeStr = params.value;

        if (!timeStr) return '';

        let [hours, minutes] = timeStr.split(':').map(Number);
        let period = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12 || 12;

        return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
      }
    },

    {
      title: 'Child Count',
      field: 'childCount',
      headerName: 'Child Count',
      flex: 1,
      sortable: false,
      minWidth: 120,
      renderCell: ({ row }: any) => {
        return Boolean(row?.childCount) ? row?.childCount : '-';
      }
    },
    {
      title: 'Adult Count',
      field: 'adultCount',
      headerName: 'Adult Count',
      sortable: false,
      flex: 1,
      minWidth: 120,
      renderCell: ({ row }: any) => {
        return Boolean(row?.adultCount) ? row?.adultCount : '-';
      }
    },
    {
      title: 'Driver Name',
      field: 'driverName',
      headerName: 'Driver Name',
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }: any) => {
        return Boolean(row?.driverName) ? capitalizeFirstLetter(row?.driverName) : '-';
      }
    },
    {
      title: 'Vehicle No.',
      field: 'vehicleNumber',
      headerName: 'Vehicle No.',
      flex: 1,
      minWidth: 180,
      renderCell: ({ row }: any) => {
        return Boolean(row?.vehicleNumber) ? row?.vehicleNumber.toUpperCase() : '-';
      }
    },
    {
      title: 'Seating Capacity',
      field: 'seatingCapacity',
      headerName: 'Seating Capacity',
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }: any) => {
        return Boolean(row?.seatingCapacity) ? row?.seatingCapacity : '-';
      }
    }
  ]?.map((item: any) => ({
    ...item,
    align: 'center',
    headerAlign: 'center',
    sortable: false
  }));

  useEffect(() => {
    if (data) {
      const updatedRows = data?.map((item: any, index: number) => ({
        ...item,
        id: index + 1
      }));

      setRows(updatedRows);
    }
  }, [data]);
  useEffect(() => {
    dispatch(
      switchTripsAction({
        pageNo: 1,
        pageSize: 10,
        autoplannerID: scheduleDate,
        tripMode: 'RLR'
      })
    );
  }, [scheduleDate]);

  return (
    <Box sx={{ height: '70vh', overflow: 'auto' }}>
      <Typography
        sx={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'rgb(0 0 0 / 60%)',
          margin: '0px 10px'
        }}
      >
        Scheduled Tour
      </Typography>
      {(data?.length > 0 || search) && (
        <Box sx={{ width: 200, float: 'right' }}>
          <CustomTextField
            control={control}
            name='search'
            id='search'
            placeholder='Search...'
            onChangeCallback={value => {
              handleSearchChange(value);
            }}
            variant={'standard'}
            value={search}
            icon={<SearchOutlinedIcon color='primary' />}
          />
        </Box>
      )}

      {isLoading && !data ? (
        <Box className='blue-circle-loader'>
          <Box className='blue-circle-spinner'></Box>
        </Box>
      ) : data?.length === 0 ? (
        <Box className='no-report-img'>
          <Box
            component={'img'}
            src={nodata}
            alt='No Report Found'
            className='no-report-found'
          />
        </Box>
      ) : (
        <CustomDataGrid
          rows={rows ?? []}
          columns={columns}
          rowCount={count}
          loading={isLoading}
          type={'logistics'}
          pageNo={pageNo}
          pageSize={pageSize}
          onPaginationModelChange={handlePagination}
          onSortModelChange={handleSortChange}
          paginationModel={{ page: pageNo && count ? pageNo - 1 : 0, pageSize: pageSize }}
        />
      )}
    </Box>
  );
};

export default ScheduledRLR;
