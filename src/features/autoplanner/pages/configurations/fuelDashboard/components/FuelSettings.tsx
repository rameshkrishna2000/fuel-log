import { Box } from '@mui/material';
import './FuelSettings.scss';
import CustomTab from '../../../../../../common/components/tab/CustomTab';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';
import { useNavigate } from 'react-router-dom';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import CustomDataGrid from '../../../../../../common/components/customized/customdatagrid/CustomDataGrid';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import { Icon } from '@iconify/react';
import CustomTextField from '../../../../../../common/components/customized/customtextfield/CustomTextField';
import { useForm } from 'react-hook-form';
import CustomActivatePopup from '../../../../../../common/components/customactive/CustomActivatePopup';
import CustomDeletePopup from '../../../../../../common/components/customdelete/CustomDeletePopup';
import { useSettingsColumns } from '../hooks/SettingsColumns';
import {
  roleList,
  useCurrentColumns,
  useCurrentRows,
  useCurrentRowsCount,
  useFuelSettingsEffect,
  useFuelSettingsState,
  useHandleAddRow,
  useHandleBack,
  useHandleConfirmDeactivate,
  useHandleConfirmDelete,
  useHandleDeactivate,
  useHandleDelete,
  useHandleEdit,
  useHandleEditCancel,
  useHandleEditStart,
  useHandlePagination,
  useHandleProcessRow,
  useHandleSearchChange,
  useHandleSortChange,
  useHandleTabChange
} from '../hooks/fuelSettings';

const FuelSettings = () => {
  const schema = yup.object().shape({
    search: yup.string().notRequired(),
    name: yup
      .string()
      .when('$tabValue', {
        is: 0,
        then: schema =>
          schema
            .required('Fuel type is required')
            .matches(/^[a-zA-Z\s]*$/, 'Fuel type contains only alphabets'),
        otherwise: schema =>
          schema.when('$tabValue', {
            is: 1,
            then: schema =>
              schema
                .required('Fuel station is required')
                .matches(/^[a-zA-Z\s]*$/, 'Fuel station contains only alphabets'),
            otherwise: schema =>
              schema
                .required('Payment method is required')
                .matches(/^[a-zA-Z\s]*$/, 'Payment method contains only alphabets')
          })
      })
      .trim()
  });
  const {
    tabValue,
    setTabValue,
    pageNo,
    setPageNo,
    pageSize,
    setPageSize,
    searchValue,
    setSearchValue,
    sorting,
    setSorting,
    openActivatePopup,
    setOpenActivatePopup,
    openDeletePopup,
    setOpenDeletePopup,
    selectedRow,
    setSelectedRow,
    rowModesModel,
    setRowModesModel,
    isCreatingRow,
    setIsCreatingRow,
    tempNewRow,
    setTempNewRow
  } = useFuelSettingsState();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    data: fuelTypeData,
    isLoading: fuelTypeLoading,
    count: fuelTypeCount
  } = useAppSelector(state => state.getFuelType);
  const {
    data: fuelStationData,
    isLoading: fuelStationLoading,
    count: fuelStationCount
  } = useAppSelector(state => state.getFuelStation);
  const {
    data: paymentMethodData,
    isLoading: paymentLoading,
    count: paymentCount
  } = useAppSelector(state => state.getPaymentMethod);
  const { isLoading: addFuelTypeLoading } = useAppSelector(state => state.addFuelType);
  const { isLoading: addFuelStationLoading } = useAppSelector(
    state => state.addFuelStation
  );
  const { isLoading: addPaymentMethodLoading } = useAppSelector(
    state => state.addPaymentMethod
  );
  const { control, setValue, trigger, resetField, clearErrors } = useForm({
    resolver: yupResolver(schema),
    context: { tabValue }
  });
  const { fuelTypeColumns, fuelStationColumns, paymentMethodColumns } =
    useSettingsColumns({ control, trigger });
  const { handleDeactivate } = useHandleDeactivate({
    setSelectedRow,
    setOpenActivatePopup
  });
  const { handleConfirmDeactivate } = useHandleConfirmDeactivate({
    selectedRow,
    tabValue,
    dispatch,
    setPageNo,
    pageSize,
    searchValue,
    sorting,
    setOpenActivatePopup,
    setSelectedRow
  });
  const { handleTabChange } = useHandleTabChange({
    setIsCreatingRow,
    setTempNewRow,
    setRowModesModel,
    setPageNo,
    setPageSize,
    setValue,
    setSearchValue,
    setSorting,
    resetField,
    clearErrors,
    dispatch,
    setTabValue,
    rowModesModel
  });
  const { handlePagination } = useHandlePagination({
    setPageNo,
    setPageSize,
    searchValue,
    sorting,
    tabValue,
    dispatch
  });
  const { handleSearchChange } = useHandleSearchChange({
    setSearchValue,
    setValue,
    setPageNo,
    pageSize,
    sorting,
    tabValue,
    dispatch
  });
  const { handleSortChange } = useHandleSortChange({
    setPageNo,
    setSorting,
    pageSize,
    searchValue,
    tabValue,
    dispatch
  });
  const { handleBack } = useHandleBack({ navigate });
  const { handleAddRow } = useHandleAddRow({
    tabValue,
    setTempNewRow,
    setIsCreatingRow,
    setRowModesModel
  });
  const { handleEditingRowSave } = useHandleEdit({
    trigger,
    setIsCreatingRow,
    setTempNewRow,
    resetField,
    clearErrors,
    tabValue,
    dispatch,
    setPageNo,
    pageSize,
    searchValue,
    sorting
  });
  const { handleEditingRowStart } = useHandleEditStart({ setValue });
  const { handleDelete } = useHandleDelete({ setSelectedRow, setOpenDeletePopup });
  const { handleConfirmDelete } = useHandleConfirmDelete({
    selectedRow,
    tabValue,
    dispatch,
    setPageNo,
    pageSize,
    searchValue,
    sorting,
    setOpenDeletePopup,
    setSelectedRow
  });
  const { handleEditingRowCancel } = useHandleEditCancel({
    setIsCreatingRow,
    setTempNewRow,
    resetField,
    clearErrors
  });
  const { handleProcessRowUpdateError } = useHandleProcessRow({
    tempNewRow,
    setRowModesModel
  });
  const { getCurrentRows } = useCurrentRows({
    tabValue,
    fuelTypeData,
    fuelStationData,
    paymentMethodData,
    tempNewRow
  });
  const { getCurrentColumns } = useCurrentColumns({
    tabValue,
    fuelTypeColumns,
    fuelStationColumns,
    paymentMethodColumns
  });
  const { getCurrentRowCount } = useCurrentRowsCount({
    tabValue,
    fuelTypeCount,
    fuelStationCount,
    paymentCount
  });
  useFuelSettingsEffect({ dispatch });

  return (
    <Box className='fuel-settings-container'>
      <Box className='fuel-set-head'>
        <Box className='fuel-set-button'>
          <Icon
            icon='emojione-monotone:left-arrow'
            className='cancel fuel-set-back'
            onClick={handleBack}
            style={{ cursor: 'pointer', fontSize: '24px' }}
          />
          <CustomTab onChange={handleTabChange} value={tabValue} tabList={roleList} />
        </Box>
        <CustomButton
          category={
            tabValue === 0
              ? 'Add Fuel Type'
              : tabValue === 1
              ? 'Add Fuel Station'
              : 'Add Payment Method'
          }
          className='saveChanges fuel-set-add'
          loading={
            tabValue === 0
              ? addFuelTypeLoading
              : tabValue === 1
              ? addFuelStationLoading
              : addPaymentMethodLoading
          }
          onClick={handleAddRow}
          disabled={isCreatingRow}
        />
      </Box>

      <Box sx={{ marginTop: '20px', padding: '20px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box sx={{ width: 200 }}>
            <CustomTextField
              control={control}
              name='search'
              placeholder='Search...'
              id='search'
              variant={'standard'}
              icon={<SearchOutlinedIcon color='primary' />}
              onChangeCallback={e => {
                handleSearchChange(e);
              }}
            />
          </Box>
        </Box>
        <CustomDataGrid
          rows={getCurrentRows()}
          columns={getCurrentColumns()}
          rowModesModel={rowModesModel}
          onRowModesModelChange={setRowModesModel}
          loading={
            tabValue === 0
              ? fuelTypeLoading
              : tabValue === 1
              ? fuelStationLoading
              : paymentLoading
          }
          sortingMode='server'
          enableInlineEditing={true}
          onEditingRowSave={handleEditingRowSave}
          onEditingRowCancel={handleEditingRowCancel}
          onEditingRowStart={handleEditingRowStart}
          handledeactive={handleDeactivate}
          handleDelete={handleDelete}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          rowCount={getCurrentRowCount()}
          onPaginationModelChange={handlePagination}
          pageNo={pageNo}
          pageSize={pageSize}
          paginationModel={{
            page: pageNo && getCurrentRowCount() ? pageNo - 1 : 0,
            pageSize: pageSize ?? 5
          }}
          onSortModelChange={handleSortChange}
          type={'logistics'}
        />
      </Box>
      <CustomActivatePopup
        open={openActivatePopup}
        setOpen={setOpenActivatePopup}
        filteredRow={selectedRow}
        handleDeactivate={handleConfirmDeactivate}
        isLoading={
          tabValue === 0
            ? fuelTypeLoading
            : tabValue === 1
            ? fuelStationLoading
            : paymentLoading
        }
      />
      <CustomDeletePopup
        open={openDeletePopup}
        setOpen={setOpenDeletePopup}
        message='Are you sure you want to delete this item?'
        handleDelete={handleConfirmDelete}
        isLoading={
          tabValue === 0
            ? fuelTypeLoading
            : tabValue === 1
            ? fuelStationLoading
            : paymentLoading
        }
      />
    </Box>
  );
};

export default FuelSettings;
