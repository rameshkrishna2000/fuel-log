import { Icon } from '@iconify/react';
import {
  Box,
  Collapse,
  Dialog,
  Grid,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useEffect, useState } from 'react';
import './VehicleUtility.scss';
import { convertTo12HourFormat } from '../../../../../../utils/commonFunctions';
import CustomDataGrid from '../../../../../../common/components/customized/customdatagrid/CustomDataGrid';

interface Props {
  rows: any;
  mode: string;
  isCustom: boolean;
}

const VehicleUtility = ({ rows, mode, isCustom }: Props) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [utilityRows, setUtilityRows] = useState<any[]>([]);
  const [utilityRow, setUtilityRow] = useState<any[]>([]);
  const [seatingCapacity, setSeatingCapacity] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const isMd = useMediaQuery('(max-width:1050px)');

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const vehicleUtilityColumn = [
    { field: 'sno', headerName: 'S.No', minWidth: 70, flex: 1 },
    {
      field: 'vehicleNumber',
      headerName: 'Vehicle No',
      minWidth: 300,
      flex: 1,
      renderCell: ({ value }: any) => value.toUpperCase()
    },
    { field: 'totalSeating', headerName: 'Total Seating', minWidth: 200, flex: 1 },
    {
      field: 'currentModeToursUndertaken',
      headerName: 'Total Tours',
      minWidth: 200,
      flex: 1
    },
    {
      field: 'actions',
      headerName: 'Action',
      minWidth: 120,
      flex: 1,
      renderCell: (params: any) => (
        <Box onClick={event => handleViewTourInfo(params.row)}>
          <Tooltip title='View tour info' placement='right' arrow>
            <Typography className='view-details'>View tour info</Typography>
          </Tooltip>
        </Box>
      )
    }
  ];

  const handleViewTourInfo = (row: any) => {
    setIsOpen(true);
    const Tours = row?.tourInfos.filter(
      (tour: any) => tour.mode === mode || tour.parentMode === mode
    );
    setUtilityRows(Tours);
    setSeatingCapacity(row?.totalSeating);
  };

  useEffect(() => {
    const utilityRow = rows
      .filter((row: any) => row.currentModeToursUndertaken !== 0)
      .map((items: any, index: any) => ({
        ...items,
        sno: index + 1
      }));
    setUtilityRow(utilityRow);
  }, [rows]);

  return (
    <>
      {utilityRow?.length > 0 && (
        <Box className='vehicle-utility-details-table'>
          <Collapse in={expanded} timeout='auto' unmountOnExit>
            <CustomDataGrid
              rows={utilityRow}
              columns={vehicleUtilityColumn}
              type={'noPageNation'}
              paginationMode={'client'}
              title={`Vehicle utilization for ${mode}`}
            />
          </Collapse>
          <Dialog
            open={isOpen}
            className='vehicle-utility-dialog animate__animated animate__zoomIn animate__fast'
            BackdropProps={{
              invisible: true
            }}
          >
            <Box
              className='vehicle-utility-view'
              sx={{ width: isMd ? '100% !important' : '1000px !important' }}
            >
              <Box className='vehicle-utility-view-header'>
                <Typography
                  variant='h6'
                  sx={{
                    color: '#333',
                    fontWeight: 600
                  }}
                >
                  Tour Info
                </Typography>
                <Box className='vehicle-utility-close' onClick={() => setIsOpen(false)}>
                  <Icon icon='ic:round-close' className='vehicle-utility-close-icon' />
                </Box>
              </Box>
              <Box className='vehicle-utility-passenger-details'>
                <Grid
                  container
                  spacing={2}
                  className='vehicle-utility-passenger-details-values'
                >
                  <Grid item sm={4} className='vehicle-utility-values head'>
                    {isCustom ? 'From - To' : 'Tour Name'}
                  </Grid>
                  <Grid item sm={2} className='vehicle-utility-values head'>
                    Mode
                  </Grid>
                  <Grid item sm={2} className='vehicle-utility-values head'>
                    Filled Seating
                  </Grid>
                  <Grid item sm={2} className='vehicle-utility-values head'>
                    Pickup Time
                  </Grid>
                  <Grid item sm={2} className='vehicle-utility-values head'>
                    Return Time
                  </Grid>
                </Grid>
                {utilityRows.length > 0 &&
                  utilityRows.map((items: any, index: any) => {
                    return (
                      <Grid
                        container
                        key={index}
                        spacing={2}
                        className='vehicle-utility-passenger-details-values'
                      >
                        <Grid item sm={4} className='vehicle-utility-values'>
                          {index + 1}. {items.tourName}
                        </Grid>
                        <Grid item sm={2} className='vehicle-utility-values'>
                          {items.mode}
                        </Grid>
                        <Grid item sm={2} className='vehicle-utility-values'>
                          {items.filledSeating
                            ? `${items.filledSeating}/${seatingCapacity}`
                            : '-'}
                        </Grid>
                        <Grid item sm={2} className='vehicle-utility-values'>
                          {convertTo12HourFormat(items.pickupTime)}
                        </Grid>
                        <Grid item sm={2} className='vehicle-utility-values'>
                          {convertTo12HourFormat(items.returnTime)}
                        </Grid>
                      </Grid>
                    );
                  })}
              </Box>
            </Box>
          </Dialog>
        </Box>
      )}
    </>
  );
};

export default VehicleUtility;
