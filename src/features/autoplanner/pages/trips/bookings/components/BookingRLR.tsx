import CustomDataGrid from '../../../../../../common/components/customized/customdatagrid/CustomDataGrid';
import { useAppSelector } from '../../../../../../app/redux/hooks';
import { Box } from '@mui/material';
import CustomTextField from '../../../../../../common/components/customized/customtextfield/CustomTextField';
import { useForm } from 'react-hook-form';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { usePagination } from '../../../configurations/regular/hooks/regularDatas';

import { GetGrpBookings } from '../../../../redux/reducer/autoPlannerSlices/autoplanner';
import {
  useCommonFunctionRLR,
  useCommonUseEffects
} from './hooks/bookingrlr/bookingRlrHooks';
import { useColumnRLR } from './hooks/bookingrlr/bookingRlrColumns';

const BookingRLR = ({ payloads, setFilter }: any) => {
  const { customTours, count } = useAppSelector(
    (state: any) => state?.tripGRP?.data?.data
  ) || { customTours: [], count: 0 };
  const { isLoading } = useAppSelector((state: any) => state.tripGRP);

  const {
    pageNo,
    pageSize,
    search,
    sort,
    handlePagination,
    handleSearchChange,
    handleSortChange
  } = usePagination({
    pageno: 1,
    pagesize: 20,
    url: GetGrpBookings,
    payloads: { autoplannerID: payloads.autoplannerID, mode: 'RLR' }
  });

  const { control } = useForm();

  const { columns } = useColumnRLR();

  const { clearFilter, submitFilter } = useCommonFunctionRLR({
    search
  });

  const { rows } = useCommonUseEffects({
    setFilter,
    search,
    sort,
    submitFilter,
    clearFilter,
    customTours,

    payloads
  });

  return (
    <Box sx={{ height: '70vh', overflow: 'auto' }}>
      <Box sx={{ width: 200, float: 'right' }}>
        <CustomTextField
          control={control}
          name='search'
          id='search'
          placeholder='Search...'
          onChangeCallback={(value: string) => {
            handleSearchChange(value);
          }}
          icon={<SearchOutlinedIcon color='primary' />}
          variant={'standard'}
          value={search}
        />
      </Box>
      <CustomDataGrid
        rows={rows ?? []}
        columns={columns}
        loading={isLoading}
        type={'logistics'}
        rowCount={count}
        pageNo={pageNo}
        pageSize={pageSize}
        paginationModel={{ page: pageNo && count ? pageNo - 1 : 0, pageSize: pageSize }}
        onPaginationModelChange={handlePagination}
        onSortModelChange={handleSortChange}
      />
    </Box>
  );
};

export default BookingRLR;
