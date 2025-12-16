import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {
  deactivateRegular,
  deleteRegular,
  getRegularTour
} from '../../../redux/reducer/autoPlannerSlices/regularSlices';
import { useFetchApi } from './hooks/fieldsControl';
import { useAppSelector } from '../../../../../app/redux/hooks';
import { usePagination, useTableDatas } from './hooks/regularDatas';
import AddRegularMode from './components/AddRegularMode';
import TourDays from './components/tourDays/TourDays';
import CustomButton from '../../../../../common/components/buttons/CustomButton';
import CustomDataGrid from '../../../../../common/components/customized/customdatagrid/CustomDataGrid';
import CustomDeletePopup from '../../../../../common/components/customdelete/CustomDeletePopup';
import CustomTextField from '../../../../../common/components/customized/customtextfield/CustomTextField';
import ConfirmationPopup from '../../../../../common/components/confirmationpopup/ConfirmationPopup';
import './RegularMode.scss';
const RegularMode = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, count } = useAppSelector(
    state => state.getRegular ?? { data: [] }
  );
  const urls = [deleteRegular, deactivateRegular, getRegularTour];

  const {
    pageNo,
    pageSize,
    search,
    sort,
    handlePagination,
    handleSearchChange,
    handleSortChange,
    setPageNo,
    setPageSize
  } = usePagination({
    pageno: 1,
    pagesize: 10,
    url: getRegularTour
  });
  const {
    rows,
    columns,
    filteredRow,
    setFilteredRow,
    setActionMessage,
    actionMessage,
    handleUpdate,
    availability,
    setAvailability
  } = useTableDatas(data, setIsOpen, urls, setPageNo, setPageSize);
  const { isLoading: deleteLoading } = useAppSelector(state => state.deleteRegular);
  const { isLoading: deactivateLoading } = useAppSelector(
    state => state.deactivateRegular
  );

  const { control } = useForm();

  useFetchApi({ urls: [{ url: getRegularTour, payload: { pageNo: 1, pageSize: 10 } }] });

  return (
    <Box>
      <Box className={'regular-tourmode-button'}>
        <CustomButton
          className='saveChanges'
          category='Add Regular'
          onClick={() => setIsOpen(true)}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Box sx={{ width: 200 }}>
          <CustomTextField
            control={control}
            name='search'
            placeholder='Search...'
            id='search'
            variant={'standard'}
            value={search}
            icon={<SearchOutlinedIcon color='primary' />}
            onChangeCallback={e => {
              handleSearchChange(e);
            }}
          />
        </Box>
      </Box>

      <Box className='regular-datagrid'>
        <CustomDataGrid
          rows={rows ?? []}
          columns={columns}
          rowCount={count}
          loading={isLoading}
          onPaginationModelChange={handlePagination}
          pageNo={pageNo}
          pageSize={pageSize}
          paginationModel={{
            page: pageNo && count ? pageNo - 1 : 0,
            pageSize: pageSize ?? 5
          }}
          type={'logistics'}
          onRowClick={(id, row) => {
            row.isActive === 1 && handleUpdate(row);
          }}
          onSortModelChange={handleSortChange}
        />
      </Box>
      {isOpen && (
        <AddRegularMode
          open={isOpen}
          setOpen={setIsOpen}
          filteredRow={filteredRow}
          setFilteredRow={setFilteredRow}
          setPageNo={setPageNo}
          setPageSize={setPageSize}
        />
      )}
      {actionMessage['action'] ? (
        <CustomDeletePopup
          message={actionMessage['message']}
          open={actionMessage['action']}
          handleClose={() => {
            setActionMessage({ action: false, message: '', actionName: null });
            setFilteredRow(null);
          }}
          handleDelete={actionMessage['actionName']}
          isLoading={deactivateLoading || deleteLoading}
        />
      ) : (
        <ConfirmationPopup
          open={actionMessage['action']}
          onClose={() => {
            setActionMessage({ action: false, message: '', actionName: null });
            setFilteredRow(null);
          }}
          loading={deactivateLoading || deleteLoading}
          onConfirm={actionMessage['actionName']}
          title={`${actionMessage['message']}`}
          messages={[
            // 'You are about to Delete this driver.',
            'This action may impact any scheduled Trips or routes.'
          ]}
          confirmText={`Yes, ${
            actionMessage['message'] === 'Are you sure want to deactivate this tour?'
              ? 'Deactivate'
              : 'Delete'
          }`}
          cancelText='Cancel'
        />
      )}
      {availability?.length > 0 && (
        <TourDays
          header={filteredRow?.tourName}
          tableHeaders={[
            { head: 'Day', size: 6 },
            { head: 'Availability', size: 6 }
          ]}
          onClose={() => {
            setAvailability([]);
            setFilteredRow(null);
          }}
          availability={availability}
        />
      )}
    </Box>
  );
};

export default RegularMode;
