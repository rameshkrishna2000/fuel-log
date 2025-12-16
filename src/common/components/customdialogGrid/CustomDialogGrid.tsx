import { Box, Dialog, DialogContent, Typography } from '@mui/material';
import CustomDataGrid from '../customized/customdatagrid/CustomDataGrid';
import CustomButton from '../buttons/CustomButton';
import './CustomDialog.scss';

interface Props {
  readonly view?: boolean;
  readonly handleViewClose?: () => void;
  rows: any;
  columns: any;
  loading?: boolean;
  handleViewOpen?: () => void;
  type: string | null;
}

function CustomDialogGrid({
  view,
  handleViewClose,
  rows,
  columns,
  loading,
  type = null,
  handleViewOpen
}: Props) {
  return (
    <Dialog open={view ?? false} className='dialog' sx={{ position: 'relative' }}>
      <DialogContent className='dialogContent'>
        {type && <Typography className='invalid-excel'>Invalid Data in Excel</Typography>}

        <Box sx={{ width: '100%', height: '75%', overflowY: 'auto', padding: '20px' }}>
          <CustomDataGrid
            rows={rows}
            columns={columns}
            type='noPageNation'
            paginationMode={'client'}
            loading={loading}
          />
        </Box>
        {type && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '10px',
              position: 'absolute',
              bottom: 20,
              right: 20
            }}
          >
            <Typography>
              Are you sure want to import excel Without this invalid data?
            </Typography>
            <CustomButton className='cancel' category='No' onClick={handleViewClose} />
            <CustomButton
              className='saveChanges'
              category='Yes'
              onClick={handleViewOpen}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CustomDialogGrid;
