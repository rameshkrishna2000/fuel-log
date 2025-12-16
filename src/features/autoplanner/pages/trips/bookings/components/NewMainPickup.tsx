import { Box, Dialog, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import CustomDataGrid from '../../../../../../common/components/customized/customdatagrid/CustomDataGrid';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';
import './NewMainPickup.scss';
import { clearNewPickup, newPickupUpdateAction } from '../../../../redux/reducer/autoPlannerSlices/autoplanner';
import { updateData } from '../../../../../../common/redux/reducer/commonSlices/websocketSlice';


interface Pickup {
  id: number;
  latitude: number;
  longitude: number;
  locationAddress: string;
  isMain: 0 | 1;
  invalidRows: any;
}

interface Props {
  importFile: any;
  setImportFile: any;
  invalidRows: any;
}

const NewMainPickup = ({ importFile, setImportFile, invalidRows }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [pickupRows, setPickupRows] = useState<Pickup[]>([]);
  const [loader, setLoader] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  const newPickupData = useAppSelector(state => state.importAutoPlannerTrip);
  const { isLoading } = useAppSelector(state => state.newPickupLocation);
  const { connection } = useAppSelector(state => state.websocket);

  const locationsListColumn = [
    {
      field: 'locationAddress',
      headerName: 'Address',
      minWidth: 450,
      flex: 1
    }
  ];

  const handleClose = () => {
    setIsOpen(false);
    setImportFile(null);
    dispatch(clearNewPickup());
    setLoader(false);
    dispatch(updateData({ progress: 'FAILED', date: 'Loading', action: 'ExcelUpload' }));
    if (connection) connection.close();
  };

  // for seleted row
  const handleSelectionChange = (selection: number[]) => {
    setSelectedRows(selection);
    const difference =
      selection.filter(item => !selectedRows.includes(item))[0] ||
      selectedRows.filter(item => !selection.includes(item))[0];
    const lastSelectedObject = pickupRows.find((item: Pickup) => item.id === difference);

    if (lastSelectedObject) {
      const updatedObject = {
        ...lastSelectedObject,
        isMain: !lastSelectedObject.isMain ? 1 : 0
      };
      setPickupRows(
        pickupRows?.map(value => {
          if (value.id === updatedObject.id) {
            return {
              ...value,
              isMain: value.isMain ? 0 : 1
            };
          }
          return value;
        })
      );
    }
  };

  const handleUpdateMain = async () => {
    setLoader(isLoading);
    const newPickupRows = pickupRows.map(({ id, ...rest }) => rest);
    const payload = {
      file: importFile,
      importPickupHotels: newPickupRows,
      skippings: invalidRows
    };
    await dispatch(newPickupUpdateAction(payload));
    setIsOpen(false);
    setImportFile(null);
    dispatch(clearNewPickup());
    setLoader(false);
  };

  useEffect(() => {
    const pickupData = newPickupData?.data;
    if (pickupData?.length > 0) {
      const data = pickupData?.map((item: any, index: number) => ({
        ...item,
        id: index + 1
      }));
      setPickupRows(data);
      setSelectedRows(
        data.filter((item: Pickup) => item.isMain === 1).map((item: Pickup) => item.id)
      );
      setIsOpen(true);
    } else setPickupRows([]);
  }, [newPickupData]);

  return (
    <Dialog
      open={isOpen}
      className='new-main-pickup-dialog animate__animated animate__zoomIn'
      BackdropProps={{
        invisible: true
      }}
    >
      <Box className='main-pickup-dialog'>
        <Box className='d-flex main-pickup-head'>
          <Typography paragraph className='main-pickup-title'>
            New Pickup Location
          </Typography>
          <Box className='main-pickup-close' onClick={handleClose}>
            <Icon icon='ic:round-close' className='main-pickup-close-icon' />
          </Box>
        </Box>
        <Box className='main-pickup-content'>
          <CustomDataGrid
            rows={pickupRows}
            columns={locationsListColumn}
            onRowSelectionModelChange={handleSelectionChange}
            type={'noPageNation'}
            paginationMode={'client'}
            loading={newPickupData?.isLoading}
            selection={selectedRows}
            disableSelectAll={true}
            checkboxSelection={true}
          />
        </Box>
        <Box className='new-pickup-save'>
          <Box sx={{ marginRight: '12px' }}>
            <CustomButton className='cancel' category='Cancel' onClick={handleClose} />
          </Box>
          <CustomButton
            className='saveChanges'
            category='Save'
            loading={loader}
            onClick={handleUpdateMain}
          />
        </Box>
      </Box>
    </Dialog>
  );
};

export default NewMainPickup;