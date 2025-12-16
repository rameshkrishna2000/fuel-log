import CustomDataGrid from '../../../../../../common/components/customized/customdatagrid/CustomDataGrid';

interface Props {
  tripsRows: any;
  columns: any;
  BookingLoad: boolean;
}

const Bookings = ({ tripsRows, columns, BookingLoad }: Props) => {
  return <CustomDataGrid rows={tripsRows} columns={columns} loading={BookingLoad} />;
};

export default Bookings;
