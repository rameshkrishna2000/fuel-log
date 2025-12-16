import {
  Box,
  MenuItem,
  IconButton,
  Tooltip,
  Menu,
  Typography,
  Dialog
} from '@mui/material';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import CustomDataGrid from '../../../../../../common/components/customized/customdatagrid/CustomDataGrid';

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
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
import { useForm } from 'react-hook-form';
import { debounce } from 'lodash';
import {
  autoPlannerDeleteAction,
  clearBookings,
  GetGrpBookings
} from '../../../../redux/reducer/autoPlannerSlices/autoplanner';
import { GridActionsCellItem } from '@mui/x-data-grid';
import ConfirmationPopup from '../../../../../../common/components/confirmationpopup/ConfirmationPopup';
import {
  useCommonFunctionsGRP,
  useCommonStatesGRP,
  useCommonUseEffectsGRP,
  useMenuActionControllerGRP
} from './hooks/bookinggrp/bookingGrpHooks';
import { useBookingGrpColumns } from './hooks/bookinggrp/bookingGrpColumns';

interface Props {
  payloads: any;
  setPageSizes: any;
  pageSizes: number;
  setExpanded: any;
  clearFilter: any;
  setBreadCrumbs: any;
  filterPayload: any;
}

const BookingGrp = ({
  payloads,
  setExpanded,
  setPageSizes,
  pageSizes,
  clearFilter,
  setBreadCrumbs,
  filterPayload
}: Props) => {
  const mode = 'GRP';

  const tripsData = useAppSelector(state => state.tripGRP);
  const { data } = useAppSelector(state => state.auth);
  const Routes = useAppSelector(state => state.autoPlannerRoutes.data || []);
  const Agents = useAppSelector(state => state.autoPlannerAgent.data || []);
  const deleteTrip = useAppSelector(state => state.AutoPlannerDeleteTrip);
  const profile = useAppSelector(state => state.myProfile.data);
  const { category } = useAppSelector(state => state.RoleModuleAccess);
  const APOperationUser = category === 'OPERATION_USER';

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

  // const openMenu = Boolean(anchorEl);
  const {
    pageNo,
    setPageNo,
    rows,
    setRows,
    pageSize,
    setPageSize,
    view,
    setView,
    tripsGroupRows,
    setGroupTripsRows,
    tripPayload,
    setTripPayload
  } = useCommonStatesGRP({ pageSizes });

  const {
    handleMenuClick,
    handleMenuClose,
    handleUpdateTrip,
    handleDeleteTrip,
    selectedRow,
    setSelectedRow,
    isOpen,
    setIsOpen,
    isDialog,
    setIsDialog,
    anchorEl,
    setAnchorEl
  } = useMenuActionControllerGRP({
    pageNo,
    pageSize,
    payloads
  });

  const {
    handleFilterChange,
    handleSortModelChange,
    handlePaginationModelChange,
    filter,
    setFilter
  } = useCommonFunctionsGRP({
    setPageSize,
    setPageNo,
    tripPayload,
    setTripPayload,
    rows,
    pageSize,
    setPageSizes
  });

  const { rowCount, setRowCount } = useCommonUseEffectsGRP({
    tripsData,
    rows,
    setRows,
    setGroupTripsRows,
    setBreadCrumbs,
    view,
    setView,
    setPageNo,
    setPageSize,
    tripPayload,
    payloads,
    setTripPayload
  });

  const { groupColumns } = useBookingGrpColumns({
    constant,
    handleMenuClick,
    handleUpdateTrip,
    data,
    APOperationUser,
    handleMenuClose,
    setIsDialog,
    profile
  });

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
        rows={tripsGroupRows ?? []}
        sortingMode='server'
        columns={groupColumns}
        loading={tripsData?.isLoading}
        onSortModelChange={handleSortModelChange}
        onRowClick={(event: any, row) => {
          handleUpdateTrip();
          setSelectedRow(row);
        }}
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
                loading={deleteTrip?.isLoading}
                onClick={() => {
                  handleDeleteTrip();
                  // setIsDialog('');
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
          onClose={() => setIsDialog('')}
          loading={deleteTrip?.isLoading}
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
          Agents={agentNames}
          Routes={configuredRoute}
          mode={mode}
          filterPayload={filterPayload}
        />
      )}
    </Box>
  );
};

export default BookingGrp;
