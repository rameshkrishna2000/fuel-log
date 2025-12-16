import {
  Box,
  IconButton,
  Menu,
  Tooltip,
  Typography,
  MenuItem,
  Dialog
} from '@mui/material';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import CustomDataGrid from '../../../../../../common/components/customized/customdatagrid/CustomDataGrid';
import {
  capitalizeFirstLetter,
  convertDatetoEpoch,
  convertEpochToDateString,
  convertTo12HourFormat,
  debounce
} from '../../../../../../utils/commonFunctions';
import { Icon } from '@iconify/react';
import constant from '../../../../../../utils/constants';
import CustomBreadcrumbs from '../../../../../../common/components/custombreadcrumbs/CustomBreadcrumbs';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';
import AddTrip from './AddTrip';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CustomTextField from '../../../../../../common/components/customized/customtextfield/CustomTextField';
import { useForm } from 'react-hook-form';
import { autoPlannerTripsAction } from '../../../../redux/reducer/autoPlannerSlices/autoplanner';
import {
  useCommonFunctionSIC,
  useCommonStatesSIC,
  useCommonUseffectsSIC,
  useMenuActionControllerSIC
} from './hooks/bookingsic/bookingSicHooks';
import { useColumnsSIC } from './hooks/bookingsic/bookingSicColumns';

interface Props {
  payloads: any;
  agentName: any;
  setBreadCrumbs: any;
  pageSizes: number;
  setExpanded: any;
  clearFilter: any;
  setPageSizes: any;
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
  startTimestamp?: number;
}

const BookingSic = ({
  payloads,
  agentName,
  setPageSizes,
  pageSizes,
  setBreadCrumbs,
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

  const APoperationUser = category === 'OPERATION_USER';
  const APadmin = data?.role === 'ROLE_AUTOPLANNER_ADMIN';
  const APOperator = data?.role === 'ROLE_OPERATOR';

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

  const BookingData = useAppSelector(state => state.AutoPlannerBooking);

  const {
    selectedGroup,
    setSelectedGroup,
    isDialog,
    setIsDialog,
    pageSize,
    setPageSize,
    tripsRows,
    setTripsRows,
    pageNo,
    setPageNo,
    IsrowCount,
    setIsRowCount,
    sortModel,
    setSortModel,
    tripsGroupRows,
    setGroupTripsRows,
    filter,
    setFilter
  } = useCommonStatesSIC({ pageSizes });
  // const openMenu = Boolean(anchorEl);

  const {
    handleViewGroupTrip,
    handleSortModelChange,
    handleBookingsPaginationModelChange,
    handlePaginationModelChange,
    handleBookings,
    handleFilterChange,
    view,
    setView,
    rows,
    setRows,
    IspageNo,
    setIsPageNo,
    IspageSize,
    setIsPageSize,
    tripPayload,
    setTripPayload,
    rowCount,
    setRowCount,
    bookingsPayload,
    setBookingsPayload
  } = useCommonFunctionSIC({
    setSelectedGroup,
    agentName,
    setSortModel,
    setPageNo,
    setPageSize,
    setFilter,
    pageSize,
    setPageSizes,
    setBreadCrumbs,
    tripsData,
    pageNo,
    payloads
  });

  const {
    handleMenuClose,
    handleViewTrip,
    handleUpdateTrip,
    handleDeleteTrip,
    handleMenuClick,
    setIsOpen,
    isOpen,
    viewOpen,
    setViewOpen,
    setAnchorEl,
    anchorEl,
    selectedRow,
    setSelectedRow
  } = useMenuActionControllerSIC({
    pageNo,
    pageSize,
    setIsDialog,
    selectedGroup
  });

  const { columns, groupColumns } = useColumnsSIC({
    handleViewGroupTrip,
    constant,
    handleMenuClick,
    APoperationUser,
    APadmin,
    APOperator,
    handleUpdateTrip,
    handleMenuClose,
    setIsDialog
  });

  useCommonUseffectsSIC({
    BookingData,
    setTripsRows,
    setIsRowCount,
    rows,
    setGroupTripsRows
  });

  const payloadSIC = {
    ...payloads,
    ...tripPayload,
    tripMode: 'SIC'
  };

  // useEffect(() => {
  //   if (payload) {
  //     const payloadSIC = {
  //       ...payload,
  //       tripMode: 'SIC'
  //     };
  //     setTripPayload({ ...payload, tripMode: 'SIC' });
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
            onRowClick={(event: any, row) => {
              handleViewGroupTrip(event, row);
              setSelectedGroup(row);
            }}
            loading={tripsData?.isLoading}
            onSortModelChange={handleSortModelChange}
            rowCount={rowCount}
            type='logistics'
            onPaginationModelChange={handlePaginationModelChange}
            pageNo={pageNo}
            pageSize={pageSize}
            paginationModel={{
              page: pageNo && rowCount ? pageNo - 1 : 0,
              pageSize: pageSize ? pageSize : 20
            }}
          />
        ) : (
          <CustomDataGrid
            rows={tripsRows}
            rowCount={IsrowCount}
            type='autoplanner'
            columns={columns}
            onRowClick={(event: any, row) => {
              handleUpdateTrip();
              if (selectedGroup !== null) {
                const value = {
                  source: row.source,
                  startLat: row.startLat,
                  startLng: row.startLng,
                  // startTimestamp: row.startTimestamp,
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
            pageNo={IspageNo}
            paginationModel={{
              page: IspageNo && IsrowCount ? IspageNo - 1 : 0,
              pageSize: IspageSize
            }}
            pageSize={IspageSize}
            loading={BookingData?.isLoading}
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

export default BookingSic;
