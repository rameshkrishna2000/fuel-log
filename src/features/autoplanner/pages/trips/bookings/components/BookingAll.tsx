import { Box, Tooltip, Typography, Dialog } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import CustomDataGrid from '../../../../../../common/components/customized/customdatagrid/CustomDataGrid';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import {
  capitalizeFirstLetter,
  convertEpochToDateString,
  convertEpoctoTimeZoneDate
} from '../../../../../../utils/commonFunctions';
import constant from '../../../../../../utils/constants';
import { Icon } from '@iconify/react';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';
import AddTrip from './AddTrip';
import CustomTextField from '../../../../../../common/components/customized/customtextfield/CustomTextField';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useForm } from 'react-hook-form';
import { debounce } from 'lodash';
import {
  autoPlannerDeleteAction,
  GetAllBookings,
  GetGrpBookings
} from '../../../../redux/reducer/autoPlannerSlices/autoplanner';
import { GridActionsCellItem } from '@mui/x-data-grid';

interface Column {
  field: string;
  headerName: string;
  minWidth: number;
  flex: number;
  renderCell?: (params: { row: any }) => any;
  textAlign?: string;
}

interface PaginationModel {
  page: number;
  pageSize: number;
}

interface Props {
  setBreadCrumbs: any;
  payloads: any;
  setPageSizes: any;
  pageSizes: number;
  filterPayload: any;
}

const BookingAll = ({
  setPageSizes,
  pageSizes,
  setBreadCrumbs,
  payloads,
  filterPayload
}: Props) => {
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [pageNo, setPageNo] = useState(1);
  const [rows, setRows] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isDialog, setIsDialog] = useState('');
  const [pageSize, setPageSize] = useState(pageSizes || 20);
  const [filter, setFilter] = useState('');
  const [rowCount, setRowCount] = useState(0);
  const [view, setView] = useState<boolean>(false);
  const [tripsRows, setTripsRows] = useState<any[]>([]);
  const [tripPayload, setTripPayload] = useState({ pageNo, pageSize, isAll: true });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const tripsData = useAppSelector(state => state.tripGRP);
  const deleteTrip = useAppSelector(state => state.AutoPlannerDeleteTrip);
  const Routes = useAppSelector(state => state.autoPlannerRoutes.data || []);
  const Agents = useAppSelector(state => state.autoPlannerAgent.data || []);
  const profile = useAppSelector(state => state.myProfile.data);

  const handleMenuClick = (row: any) => {
    setSelectedRow(row);
  };

  const handleUpdateTrip = () => {
    handleMenuClose();
    setIsOpen(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const mode = 'ALL';

  const handleDeleteTrip = async () => {
    if (selectedRow) {
      const payload = {
        selectedRow: selectedRow,
        mode: 'ALL',
        pageDetails: tripPayload,
        BookingsAll: true
      };
      await dispatch(autoPlannerDeleteAction(payload));
      setIsDialog('');
    }
  };

  const { control } = useForm();

  const agentNames =
    Agents?.map((value: string) => ({
      id: value,
      label: capitalizeFirstLetter(value)
    })) || [];

  const configuredRoute =
    Routes?.map((value: string) => ({
      id: value,
      label: value
    })) || [];

  const dispatch = useAppDispatch();
  const groupColumns: Column[] = [
    {
      field: 'actions',
      headerName: 'Action',
      minWidth: 80,
      maxWidth: 80,
      flex: 1,
      type: 'actions',
      getActions: (params: any) => {
        const actions = [
          <GridActionsCellItem
            key='edit'
            icon={<Icon icon='ic:baseline-edit' className='menu-icon update' />}
            label={constant.Update}
            onClick={() => {
              handleMenuClick(params.row);
              handleUpdateTrip();
            }}
            showInMenu
          />,
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
        ];
        // if (params.row.isOwnedByUser) {
        //   actions.push(
        //     <GridActionsCellItem
        //       key='delete'
        //       icon={
        //         <Icon
        //           icon='ic:outline-delete'
        //           className='menu-icon'
        //           style={{ color: '#FF4343' }}
        //         />
        //       }
        //       label={constant.Delete}
        //       onClick={() => {
        //         handleMenuClick(params.row);
        //         setIsDialog('Delete');
        //         handleMenuClose();
        //       }}
        //       showInMenu
        //     />
        //   );
        // } else {
        //   actions.push(
        //     <GridActionsCellItem
        //       key='delete'
        //       icon={
        //         <Tooltip title={'This booking was created by the admin'} arrow>
        //           <Icon
        //             icon='material-symbols:info'
        //             className='menu-icon'
        //             style={{ color: '#FF4343' }}
        //           />
        //         </Tooltip>
        //       }
        //       label={'Delete unavailable'}
        //       showInMenu
        //     />
        //   );
        // }
        return actions;
      }
    },

    {
      field: 'startTimestamp',
      headerName: 'Date and Time',
      minWidth: 200,
      flex: 1,
      renderCell: (params: any) =>
        params.value ? convertEpoctoTimeZoneDate(params.value, profile.timezone) : '-'
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
      minWidth: 180,
      flex: 1,
      valueGetter: (params: any) => (params.value ? params.value : '-')
    },

    {
      field: 'totalPassengers',
      headerName: 'Total Passengers',
      minWidth: 160,
      flex: 1
    },
    {
      field: 'ref_number',
      headerName: 'Ref Number',
      minWidth: 160,
      flex: 1,
      valueGetter: (params: any) => (params.value ? params.value : '-')
    },
    {
      field: 'mode',
      headerName: 'Mode',
      minWidth: 100,
      flex: 1
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
      headerName: 'To / Tour',
      minWidth: 300,
      flex: 1,
      renderCell: (params: any) => (
        <Tooltip title={params.value || ''}>
          <span>{params.value}</span>
        </Tooltip>
      )
    }
  ].map((item: any) => ({ ...item, sortable: false }));

  const handleFilterChange = useCallback(
    debounce((event: string) => {
      setFilter(event);
      if (rows) {
        const payloadAll = {
          ...tripPayload,
          ...filterPayload,
          tripMode: 'ALL',
          search: event
        };
        setTripPayload(payloadAll);
        dispatch(GetGrpBookings(payloadAll));
      }
    }),
    [tripPayload, filterPayload]
  );

  const handlePaginationModelChange = (newPaginationModel: PaginationModel) => {
    const { pageSize: newPageSize, page: newPageNo } = newPaginationModel;
    setPageSize(newPageSize);
    setPageNo(newPageNo + 1);
    const newPage = newPageNo + 1;
    const payload = {
      ...tripPayload,
      pageNo: newPage,
      pageSize: newPageSize
    };
    setTripPayload(payload);
  };

  const handleSortModelChange = (model: any) => {
    const payload = {
      ...tripPayload,
      sortBy: model[0]?.sort,
      sortByField: model[0]?.field
    };
    setTripPayload(payload);
  };

  useEffect(() => {
    if (tripPayload) {
      const payloadAll = {
        ...tripPayload,
        tripMode: 'ALL'
      };
      dispatch(GetGrpBookings(payloadAll));
    }
  }, [tripPayload]);

  useEffect(() => {
    if (tripsData?.data?.data !== null && tripsData?.data?.data?.customTours) {
      setRows(tripsData.data.data.customTours);
      setRowCount(tripsData.data.data.count || 0);
    } else {
      setRows([]);
    }
  }, [tripsData?.data]);

  useEffect(() => {
    if (rows?.length > 0) {
      const data = rows?.map((item: any, index: number) => ({
        ...item,
        sno: index + 1,
        id: index + 1,
        from: item.from.locationAddress,
        to: item.to.locationAddress,
        startTimestamp: item.startTimestamp,
        endTimestamp: item.endTimestamp
          ? convertEpochToDateString(item.endTimestamp)
          : '-'
      }));
      setTripsRows(data);
    } else setTripsRows([]);
  }, [rows]);

  useEffect(() => {
    setBreadCrumbs({
      setViews: setView,
      views: view,
      setPageNo: setPageNo,
      setPageSize: setPageSize
    });
  }, [view, setPageNo, setPageSize]);

  useEffect(() => {
    const payload = {
      ...tripPayload,
      ...payloads
    };
    setTripPayload(payload);
  }, [payloads]);

  useEffect(() => {
    if (pageSize) setPageSizes(pageSize);
  }, [pageSize]);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          width: '100%'
        }}
      >
        <Box sx={{ width: 200 }}>
          <CustomTextField
            name='search'
            control={control}
            id='filter-input'
            placeholder='Search...'
            value={filter}
            variant='standard'
            icon={<SearchOutlinedIcon color='primary' />}
            onChangeCallback={(e: any) => handleFilterChange(e)}
          />
        </Box>
      </Box>
      <CustomDataGrid
        rows={tripsRows}
        sortingMode='server'
        columns={groupColumns}
        onRowClick={(event: any, row) => {
          handleUpdateTrip();
          setSelectedRow(row);
        }}
        loading={tripsData?.isLoading}
        onSortModelChange={handleSortModelChange}
        rowCount={rowCount}
        type='logistics'
        onPaginationModelChange={handlePaginationModelChange}
        pageNo={pageNo}
        pageSize={pageSize}
        paginationModel={{
          page: pageNo ? pageNo - 1 : 0,
          pageSize: pageSize ? pageSize : 20
        }}
      />

      <Dialog open={isDialog === 'Delete'}>
        <Box
          sx={{
            textAlign: 'center',
            padding: '5%',
            minWidth: '350px'
          }}
        >
          <Typography>{constant.DeleteBooking}</Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              paddingTop: '5%',
              justifyContent: 'center'
            }}
          >
            <Box sx={{ marginRight: '12px' }}>
              <CustomButton
                className='saveChanges'
                category='Yes'
                loading={deleteTrip?.isLoading}
                onClick={() => {
                  handleDeleteTrip();
                }}
              />
            </Box>
            <CustomButton
              className='cancel'
              category='No'
              onClick={() => setIsDialog('')}
            />
          </Box>
        </Box>
      </Dialog>
      {isOpen && (
        <AddTrip
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          selectedRow={selectedRow}
          pageDetails={tripPayload}
          filterPayload={filterPayload}
          Agents={agentNames}
          Routes={configuredRoute}
          mode={mode}
        />
      )}
    </Box>
  );
};

export default BookingAll;
