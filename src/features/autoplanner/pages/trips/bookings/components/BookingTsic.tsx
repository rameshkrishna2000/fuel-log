import {
  Box,
  IconButton,
  Menu,
  Tooltip,
  Typography,
  MenuItem,
  Dialog
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import CustomDataGrid from '../../../../../../common/components/customized/customdatagrid/CustomDataGrid';
import {
  capitalizeFirstLetter,
  convertEpochToDateString,
  convertTo12HourFormat,
  debounce
} from '../../../../../../utils/commonFunctions';
import { Icon } from '@iconify/react';
import constant from '../../../../../../utils/constants';
import CustomBreadcrumbs from '../../../../../../common/components/custombreadcrumbs/CustomBreadcrumbs';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';
import AddTrip from './AddTrip';
import { useForm } from 'react-hook-form';
import CustomTextField from '../../../../../../common/components/customized/customtextfield/CustomTextField';
import {
  autoPlannerBookingAction,
  autoPlannerDeleteAction,
  autoPlannerTripsAction
} from '../../../../redux/reducer/autoPlannerSlices/autoplanner';
import { GridActionsCellItem } from '@mui/x-data-grid';
import ConfirmationPopup from '../../../../../../common/components/confirmationpopup/ConfirmationPopup';
import {
  useCommonFunctionTSIC,
  useCommonStatesTSIC,
  useCommonUseeffectTSIC,
  useMenuActionControllerTSIC
} from './hooks/bookingtsic/bookingTsicHooks';
import { useColumnTsic } from './hooks/bookingtsic/bookingTsicColumns';

interface Props {
  payloads: any;
  agentName: any;
  setBreadCrumbs: any;
  setExpanded: any;
  clearFilter: any;
  setPageSizes: any;
  pageSizes: number;
  filterPayload: any;
}

interface Row {
  id: number;
  agentname: string;
  guestname: string;
  fromlocation: string;
  tolocation: string;
  startDateTime: string;
  adultcount: number;
  childcount: number;
  referenceid: number;
  tripType: string;
  source: string;
  startLat: number;
  startLng: number;
  target: string;
  passengerJourneys: any[];
  targetLat: number;
  targetLng: number;
  groupId: string;
}

interface PaginationModel {
  page: number;
  pageSize: number;
}

const BookingTsic = ({
  payloads,
  agentName,
  setBreadCrumbs,
  setPageSizes,
  pageSizes,
  setExpanded,
  clearFilter,
  filterPayload
}: Props) => {
  const tripsData = useAppSelector(state => state.AutoPlannerTrip);
  const { data } = useAppSelector(state => state.auth);
  const Routes = useAppSelector(state => state.autoPlannerRoutes.data || []);
  const Agents = useAppSelector(state => state.autoPlannerAgent.data || []);
  const { isLoading } = useAppSelector(state => state.AutoPlannerDeleteTrip);
  const { category } = useAppSelector(state => state.RoleModuleAccess);
  const BookingData = useAppSelector(state => state.AutoPlannerBooking);

  const APOperationUser = category === 'OPERATION_USER';

  const dispatch = useAppDispatch();

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

  const {
    view,
    setView,
    isDialog,
    setIsDialog,
    pageSize,
    setPageSize,
    rows,
    setRows,
    pageNo,
    setPageNo,
    tripPayload,
    setTripPayload,
    bookingsPayload,
    setBookingsPayload
  } = useCommonStatesTSIC({ pageSizes });

  // const openMenu = Boolean(anchorEl);

  const {
    handleFilterChange,
    handleBookingsPaginationModelChange,
    handlePaginationModelChange,
    handleSortModelChange,
    filter,
    setFilter,
    IspageSize,
    setIsPageSize,
    IspageNo,
    setIsPageNo,
    sortModel,
    setSortModel,
    tripsGroupRows,
    setGroupTripsRows
  } = useCommonFunctionTSIC({
    rows,
    tripPayload,
    setTripPayload,
    bookingsPayload,
    setPageSize,
    setPageNo
  });
  
  const {
    handleMenuClose,
    handleViewTrip,
    handleUpdateTrip,
    handleDeleteTrip,
    handleMenuClick,
    handleViewGroupTrip,
    isOpen,
    setIsOpen,
    viewOpen,
    setViewOpen,
    selectedGroup,
    setSelectedGroup,
    anchorEl,
    setAnchorEl,
    selectedRow,
    setSelectedRow
  } = useMenuActionControllerTSIC({
    pageNo,
    pageSize,
    setIsDialog,
    setBookingsPayload,
    agentName,
    setView,
    setPageSizes
  });

  const { groupColumns, columns } = useColumnTsic({
    handleViewGroupTrip,
    constant,
    handleMenuClick,
    handleUpdateTrip,
    data,
    APOperationUser,
    setIsDialog,
    handleMenuClose
  });

  const payloadSIC = {
    ...payloads,
    ...tripPayload,
    tripMode: 'TSIC'
  };

  const { setTripsRows, tripsRows, rowCount, setRowCount, IsrowCount, setIsRowCount } =
    useCommonUseeffectTSIC({
      setBreadCrumbs,
      setView,
      view,
      setPageNo,
      setPageSize,
      tripPayload,
      payloads,
      setTripPayload,
      BookingData,
      tripsData,
      setRows
    });

  // useEffect(() => {
  //   if (payload) {
  //     const payloadSIC = {
  //       ...payload,
  //       tripMode: 'TSIC'
  //     };
  //     setTripPayload({ ...payload, tripMode: 'TSIC' });
  //     dispatch(autoPlannerTripsAction(payloadSIC));
  //   }
  // }, [payload]);

  return (
    <Box>
      <Box className='trip-datas'>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <CustomBreadcrumbs
            className='tracking-heading'
            itemOne={'Tour'}
            itemTwo={'Bookings'}
            itemTwoState={view}
            setView={setView}
            handleItemOneClick={() => {
              if (view) dispatch(autoPlannerTripsAction(payloadSIC));
            }}
          />
          {!view && (
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
          )}
        </Box>
        {!view ? (
          <CustomDataGrid
            rows={tripsGroupRows}
            sortingMode='server'
            columns={groupColumns}
            loading={tripsData?.isLoading}
            onSortModelChange={handleSortModelChange}
            onRowClick={(event: any, row) => {
              handleViewGroupTrip(event, row);
              setSelectedGroup(row);
            }}
            rowCount={rowCount}
            type='logistics'
            onPaginationModelChange={handlePaginationModelChange}
            pageNo={pageNo}
            pageSize={pageSize}
            paginationModel={{
              page: pageNo && rowCount ? pageNo - 1 : 0,
              pageSize: pageSize ? pageSize : 10
            }}
          />
        ) : (
          <CustomDataGrid
            rows={tripsRows}
            rowCount={IsrowCount}
            columns={columns}
            pageNo={IspageNo}
            onRowClick={(event: any, row) => {
              handleUpdateTrip();
              if (selectedGroup !== null) {
                const value = {
                  source: row.source,
                  startLat: row.startLat,
                  startLng: row.startLng,
                  // startTimestamp: selectedGroup.startTimestamp,
                  destination: selectedGroup.destination,
                  endLat: selectedGroup.endLat,
                  endLng: selectedGroup.endLng,
                  endTimestamp: selectedGroup.endTimestamp,
                  tripTotalDuration: selectedGroup.tripTotalDuration,
                  mode: selectedGroup.mode
                };
                setSelectedRow({ ...row, ...value, ...selectedGroup });
              }
            }}
            type='autoplanner'
            pageSize={IspageSize}
            loading={BookingData?.isLoading}
            paginationModel={{
              page: IspageNo && IsrowCount ? IspageNo - 1 : 0,
              pageSize: IspageSize
            }}
            onPaginationModelChange={handleBookingsPaginationModelChange}
          />
        )}
      </Box>

      <Dialog open={isDialog === 'Delete'}>
        <Box
          sx={{
            textAlign: 'center',
            padding: '5%',
            minWidth: '350px'
          }}
        >
          <Typography>{constant.DeleteTrip}</Typography>
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
                loading={isLoading}
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
      {/* {isDialog === 'Delete' && (
        <ConfirmationPopup
          open={isDialog === 'Delete'}
          loading={isLoading}
          onClose={() => setIsDialog('')}
          onConfirm={() => {
            handleDeleteTrip();
          }}
          title='Delete Booking'
          messages={[
            'This booking includes scheduled entries.',
            'Deleting it will also remove all associated schedules.'
          ]}
          confirmText='Yes, Delete'
          cancelText='No'
        />
      )} */}

      {isOpen && (
        <AddTrip
          isOpen={isOpen}
          filterPayload={filterPayload}
          setIsOpen={setIsOpen}
          selectedRow={selectedRow}
          pageDetails={tripPayload}
          selectedGroup={selectedGroup}
          // setTripMode={handleTrip}
          Agents={agentNames}
          Routes={configuredRoute}
        />
      )}
    </Box>
  );
};

export default BookingTsic;
