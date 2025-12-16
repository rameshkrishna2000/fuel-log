import { Icon } from '@iconify/react';
import { Box, IconButton } from '@mui/material';

export const useEditableTableColumn = ({
  columns,
  editingRow,
  isMobile,
  saveEdit,
  cancelEdit,
  startEdit
}: any) => {
  const finalColumns: any = [
    ...columns,
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }: any) =>
        editingRow === row.index ? (
          <Box style={{ display: 'flex', gap: isMobile ? '4px' : '2px' }}>
            <Icon
              icon='hugeicons:tick-01'
              width={isMobile ? '18' : '22'}
              height={isMobile ? '18' : '22'}
              onClick={() => saveEdit(row.index)}
              style={{
                cursor: 'pointer',
                color: '#16a34a',
                marginRight: isMobile ? '5px' : '10px',
                border: '1px solid',
                borderRadius: '50%'
              }}
              role='button'
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  saveEdit(row.index);
                }
              }}
            />

            <Icon
              icon='ix:cancel'
              width={isMobile ? '16' : '20'}
              height={isMobile ? '16' : '20'}
              onClick={() => cancelEdit(row.index)}
              style={{
                cursor: 'pointer',
                color: 'rgb(163 22 22)',
                border: '1px solid',
                borderRadius: '50%'
              }}
              role='button'
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  cancelEdit(row.index);
                }
              }}
            />
          </Box>
        ) : (
          <IconButton
            onClick={() => startEdit(row.index)}
            size={isMobile ? 'small' : 'medium'}
          >
            <Icon
              icon='mdi:edit-outline'
              width='24'
              height='24'
              style={{ cursor: 'pointer', color: '#abab1c' }}
            />
          </IconButton>
        )
    }
  ];
  return {
    finalColumns
  };
};
