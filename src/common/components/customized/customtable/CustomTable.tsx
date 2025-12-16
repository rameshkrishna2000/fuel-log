import { Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import Paper from '@mui/material/Paper';
import { capitalizeFirstLetter } from '../../../../utils/commonFunctions';
import './CustomTable.scss';

const CustomTable: React.FC<any> = props => {
  return (
    <TableContainer component={Paper} sx={{ height: 'auto', width: 'auto' }}>
      <Table sx={{ minWidth: 250 }} aria-label='simple table'>
        <TableBody>
          {props.info.map((row: any, index: number) => (
            <TableRow key={index}>
              <TableCell align='left' sx={{ padding: '4px', fontSize: '10px' }}>
                {capitalizeFirstLetter(row.label)}
              </TableCell>
              <TableCell
                align='left'
                sx={{
                  padding: '4px',
                  fontSize: '10px',
                  color: 'grey',
                  fontWeight: 'bold'
                }}
              >
                {row.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomTable;
