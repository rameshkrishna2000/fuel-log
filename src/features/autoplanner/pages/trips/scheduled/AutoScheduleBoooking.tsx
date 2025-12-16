import CustomDataGrid from '../../../../../common/components/customized/customdatagrid/CustomDataGrid';

interface Props {
  rows: any[];
  columns: any[];
  loading: boolean;
}
const AutoScheduleBoooking = ({ rows, columns, loading }: Props) => {
  return <CustomDataGrid rows={rows} columns={columns} loading={loading} />;
};

export default AutoScheduleBoooking;
