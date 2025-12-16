import { Box, Typography, Dialog } from '@mui/material';
import CustomDataGrid from '../../../../../../common/components/customized/customdatagrid/CustomDataGrid';
import { useAppSelector } from '../../../../../../app/redux/hooks';
import { capitalizeFirstLetter } from '../../../../../../utils/commonFunctions';
import constant from '../../../../../../utils/constants';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';
import AddTrip from './AddTrip';
import CustomTextField from '../../../../../../common/components/customized/customtextfield/CustomTextField';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useForm } from 'react-hook-form';
import {
  autoPlannerDeleteAction,
  GetGrpBookings
} from '../../../../redux/reducer/autoPlannerSlices/autoplanner';

import {
  useCommonFunctions,
  useCommonStates,
  useCommonUseEffects,
  useMenuActionController
} from './hooks/bookingpvt/bookingPvtHooks';
import { useColumns } from './hooks/bookingpvt/bookingPvtColumns';

interface Props {
  setExpanded: any;
  clearFilter: any;
  setBreadCrumbs: any;
  payloads: any;
  setPageSizes: any;
  pageSizes: number;
  filterPayload: any;
}

const BookingPvt = ({
  setExpanded,
  setPageSizes,
  pageSizes,
  clearFilter,
  setBreadCrumbs,
  payloads,
  filterPayload
}: Props) => {
  const tripsData = useAppSelector(state => state?.tripGRP);
  const deleteTrip = useAppSelector(state => state?.AutoPlannerDeleteTrip);
  const Routes = useAppSelector(state => state?.autoPlannerRoutes?.data || []);
  const Agents = useAppSelector(state => state?.autoPlannerAgent?.data || []);
  const { data } = useAppSelector(state => state?.auth);
  const profile = useAppSelector(state => state?.myProfile?.data);
  const mode = 'PVT';
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

  const urls = [autoPlannerDeleteAction, GetGrpBookings];

  const {
    pageNo,
    setPageNo,
    rows,
    setRows,
    isDialog,
    setIsDialog,
    pageSize,
    setPageSize,
    rowCount,
    setRowCount,
    view,
    setView,
    tripsGroupRows,
    setGroupTripsRows,
    tripPayload,
    setTripPayload
  } = useCommonStates({ pageSizes });


  const {
    handleFilterChange,
    handlePaginationModelChange,
    handleSortModelChange,
    filter,
    setFilter
  } = useCommonFunctions({
    rows,
    tripPayload,
    filterPayload,
    setTripPayload,
    setPageNo,
    setPageSize,
    payloads,
    urls
  });

  const {
    handleMenuClick,
    handleUpdateTrip,
    handleMenuClose,
    handleDeleteTrip,
    selectedRow,
    setSelectedRow,
    isOpen,
    setIsOpen
  } = useMenuActionController({
    setIsDialog,
    pageNo,
    pageSize,
    payloads,
    urls
  });

  const { groupColumns } = useColumns({
    handleUpdateTrip,
    handleMenuClick,
    data,
    APOperationUser,
    setIsDialog,
    handleMenuClose,
    profile,
    constant
  });

  useCommonUseEffects({
    tripPayload,
    urls,
    tripsData,
    setRows,
    setRowCount,
    rows,
    setGroupTripsRows,
    setBreadCrumbs,
    setView,
    view,
    setPageNo,
    setPageSize,
    pageSize,
    setPageSizes
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

export default BookingPvt;
