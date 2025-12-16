import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CustomDataGrid from '../../../../../../common/components/customized/customdatagrid/CustomDataGrid';
import { viewAdhocRequestRows } from './hooks/viewadhocrequest/componentData';

interface ViewAdhocRequestsProps {
  onClose: () => void;
  currentDatas: any;
  columns: any[];
  PageNo: number;
  PageSize: number;
  refreshLoader: boolean;
  handlePaginationModelChange: (model: any) => void;
  handleHotelsandGuestsView: (row: any) => void;
  setSelectedTripRow: any;
  setIsDialog: any;
  setIsViewAdhoc: any;
  setCallApi?: any;
}

const ViewAdhocRequests: React.FC<ViewAdhocRequestsProps> = ({
  onClose,
  currentDatas,
  columns,
  PageNo,
  PageSize,
  handlePaginationModelChange,
  setSelectedTripRow,
  setIsDialog,
  setIsViewAdhoc,
  setCallApi
}) => {
  const { mapCustomToursToAdhocRows } = viewAdhocRequestRows();

  const row = mapCustomToursToAdhocRows(currentDatas?.data?.customTours || []);
  const rowsWithId = (row || []).map((r: any) => ({
    id: r?.tripID,
    ...r
  }));

  return (
    <Box
      sx={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        height: '95vh',
        width: '100%'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #e5e7eb',
          p: 1.5,
          background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
          color: '#fff',
          flexShrink: 0
        }}
      >
        <Button
          onClick={() => {
            setIsViewAdhoc(false);
            onClose();
            setCallApi(false);
          }}
          startIcon={<ArrowBackIcon />}
          variant='outlined'
          size='small'
          sx={{
            borderColor: 'rgba(255,255,255,0.7)',
            color: '#fff',
            textTransform: 'none',
            fontSize: '13px',
            fontWeight: 500,
            '&:hover': {
              borderColor: '#fff',
              backgroundColor: 'rgba(255,255,255,0.12)'
            }
          }}
        >
          Back
        </Button>

        {/* Title */}
        <Typography
          variant='h6'
          sx={{
            fontSize: '15px',
            fontWeight: 600,
            flexGrow: 1,
            textAlign: 'center',
            pr: 7
          }}
        >
          Ad-hoc Requests
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 1
        }}
      >
        <CustomDataGrid
          rows={rowsWithId}
          columns={columns}
          type='logistics'
          onPaginationModelChange={handlePaginationModelChange}
          pageNo={PageNo}
          rowCount={currentDatas?.data?.count || 0}
          rowHeight={35}
          pageSize={PageSize}
          paginationModel={{
            page: PageNo && currentDatas?.data?.count ? PageNo - 1 : 0,
            pageSize: PageSize || 20
          }}
          onRowClick={(_id: number, row: any) => {
            if (!row?.adhocAccepted) {
              setSelectedTripRow(row);
              setIsDialog('adhoc');
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default ViewAdhocRequests;
