import {
  DataGrid,
  GridFeatureMode,
  GridInputRowSelectionModel,
  GridPagination,
  GridToolbarQuickFilter,
  GridRowModesModel,
  GridRowModes,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons
} from '@mui/x-data-grid';
import {
  Box,
  Stack,
  TablePaginationProps,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import MuiPagination from '@mui/material/Pagination';
import { useEffect, useRef, useState } from 'react';
import './CustomDataGrid.scss';
import MenuIcon from '@mui/icons-material/Menu';
import {
  DeleteOutline,
  Edit,
  CheckCircle,
  Block,
  Save,
  Cancel
} from '@mui/icons-material';

interface CustomDataGridProps {
  readonly rows: any;
  readonly columns: any;
  readonly loading?: boolean;
  readonly onRowClick?: (id: number, row: any) => void;
  onPaginationModelChange?: any;
  pageSize?: number | any;
  pageNo?: number;
  type?: string;
  title?: string;
  paginationModel?: any;
  onRowSelectionModelChange?: (selectionModel: any) => void;
  rowCount?: number | any;
  height?: string;
  selection?: GridInputRowSelectionModel | undefined;
  marginTop?: string;
  checkboxSelection?: boolean;
  sortingMode?: GridFeatureMode;
  onSortModelChange?: any;
  rowHeight?: number;
  stopAnimation?: boolean;
  disableSelectAll?: boolean;
  disableRowOnClickToSelect?: boolean;
  geofenceTableHeight?: boolean;
  tabsValue?: number;
  paginationMode?: any;
  hideFooterPagination?: boolean;
  sortingOrder?: any;
  toolbar?: any;
  pageSizeOptions?: any;
  // Inline editing props
  enableInlineEditing?: boolean;
  onEditingRowSave?: (newRow: GridRowModel, oldRow: GridRowModel) => Promise<any> | any;
  onEditingRowCancel?: () => void;
  onEditingRowStart?: (id: GridRowId, row: any) => void;
  handledeactive?: (row: any) => void;
  handleDelete?: (row: any) => void;
  processRowUpdate?: (
    newRow: GridRowModel,
    oldRow: GridRowModel
  ) => Promise<GridRowModel> | GridRowModel;
  onProcessRowUpdateError?: (error: Error) => void;
  rowModesModel?: GridRowModesModel;
  onRowModesModelChange?: (newModel: GridRowModesModel) => void;
}

// component for no rows
const NoRowsOverlay = () => {
  return <Stack className='custom-stack2'>No Data Found</Stack>;
};

function CustomDataGrid({
  rows,
  rowHeight,
  columns,
  loading,
  title,
  onPaginationModelChange,
  onRowClick,
  onSortModelChange,
  selection,
  onRowSelectionModelChange,
  type,
  paginationModel,
  toolbar = 'logistics',
  paginationMode = 'server',
  pageSize = 20,
  rowCount = 0,
  sortingOrder = ['desc', 'asc'],
  checkboxSelection = false,
  sortingMode = 'client',
  height,
  stopAnimation = false,
  pageSizeOptions = [5, 10, 15, 20],
  disableSelectAll = false,
  disableRowOnClickToSelect = true,
  hideFooterPagination = false,
  marginTop,
  geofenceTableHeight,
  tabsValue,
  // Inline editing props
  enableInlineEditing = false,
  onEditingRowSave,
  onEditingRowCancel,
  onEditingRowStart,
  handledeactive,
  handleDelete,
  processRowUpdate,
  onProcessRowUpdateError,
  rowModesModel = {},
  onRowModesModelChange
}: CustomDataGridProps): JSX.Element {
  const [pageCount, setPageCount] = useState<number>();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // for click row
  const handleRowClick = (params: any) => {
    if (onRowClick) {
      onRowClick(params.id, params.row);
    }
  };

  const calculatePageCount = () => {
    if (rowCount <= 0 || pageSize <= 0) {
      setPageCount(0);
      return 0;
    }

    // Calculate total number of pages
    const pageCount = Math.ceil(rowCount / pageSize);
    setPageCount(pageCount);
    return pageCount;
  };

  const getRowClassName = (params: any) => {
    return params.row.color ? `row-color-${params.row.id}` : '';
  };

  useEffect(() => {
    calculatePageCount();
  }, [pageSize, rowCount]);

  // Inline editing handlers
  const handleEditClick = (id: GridRowId, row: any) => () => {
    if (onEditingRowStart) {
      onEditingRowStart(id, row);
    }
    if (onRowModesModelChange) {
      onRowModesModelChange({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    }
  };

  const handleSaveClick = (id: GridRowId) => () => {
    if (onRowModesModelChange) {
      onRowModesModelChange({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    }
  };

  const handleCancelClick = (id: GridRowId) => () => {
    if (onRowModesModelChange) {
      onRowModesModelChange({
        ...rowModesModel,
        [id]: { mode: GridRowModes.View, ignoreModifications: true }
      });
    }
    if (onEditingRowCancel) {
      onEditingRowCancel();
    }
  };

  const handleRowEditStart: GridEventListener<'rowEditStart'> = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleProcessRowUpdate = async (newRow: GridRowModel, oldRow: GridRowModel) => {
    try {
      let updatedRow = newRow;

      if (processRowUpdate) {
        updatedRow = await processRowUpdate(newRow, oldRow);
      } else if (onEditingRowSave) {
        const result = await onEditingRowSave(newRow, oldRow);
        updatedRow = result || newRow;
      }

      return updatedRow;
    } catch (error) {
      if (onProcessRowUpdateError) {
        onProcessRowUpdateError(error as Error);
      }
      throw error;
    }
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    if (onRowModesModelChange) {
      onRowModesModelChange(newRowModesModel);
    }
  };

  // Add actions column if inline editing is enabled
  const columnsWithActions = enableInlineEditing
    ? [
        ...columns,
        {
          field: 'actions',
          type: 'actions',
          headerName: 'Actions',
          width: 150,
          cellClassName: 'actions',
          getActions: ({ id, row }: any) => {
            const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
            const isNewRow = row.isNew === true;

            const isAnyRowInEditMode = Object.values(rowModesModel).some(
              (mode: any) => mode?.mode === GridRowModes.Edit
            );

            if (isInEditMode) {
              return [
                <GridActionsCellItem
                  icon={
                    <Tooltip title='Save'>
                      <Save sx={{ color: '#4779f4' }} />
                    </Tooltip>
                  }
                  label='Save'
                  sx={{ color: 'primary.main' }}
                  onClick={handleSaveClick(id)}
                />,
                <GridActionsCellItem
                  icon={
                    <Tooltip title='Cancel'>
                      <Cancel sx={{ color: 'rgb(248, 11, 11)' }} />
                    </Tooltip>
                  }
                  label='Cancel'
                  onClick={handleCancelClick(id)}
                  color='inherit'
                />
              ];
            }

            if (isNewRow) {
              return [];
            }

            const shouldDisableActions = isAnyRowInEditMode && !isInEditMode;

            return [
              // ...(handledeactive
              //   ? [
              //       <GridActionsCellItem
              //         icon={
              //           row.isActive ? (
              //             <Tooltip title={shouldDisableActions ? '' : 'Deactivate'}>
              //               <Block
              //                 sx={{
              //                   color:
              //                     shouldDisableActions || !row.isActive
              //                       ? 'gray'
              //                       : 'rgb(255, 69, 0)'
              //                 }}
              //               />
              //             </Tooltip>
              //           ) : (
              //             <Tooltip title={shouldDisableActions ? '' : 'Activate'}>
              //               <CheckCircle
              //                 sx={{
              //                   color: shouldDisableActions ? 'gray' : 'rgb(34, 197, 94)'
              //                 }}
              //               />
              //             </Tooltip>
              //           )
              //         }
              //         label={row.isActive ? 'Deactivate' : 'Activate'}
              //         onClick={() => handledeactive(row)}
              //         disabled={shouldDisableActions}
              //       />
              //     ]
              //   : []),
              <GridActionsCellItem
                icon={
                  <Tooltip title={shouldDisableActions || !row.isActive ? '' : 'Update'}>
                    <Edit
                      sx={{
                        color:
                          shouldDisableActions || row.isActive === false
                            ? 'gray'
                            : '#4779f4'
                      }}
                    />
                  </Tooltip>
                }
                label='Update'
                onClick={handleEditClick(id, row)}
                disabled={row.isActive === false || shouldDisableActions}
              />
              // ...(handleDelete
              //   ? [
              //       <GridActionsCellItem
              //         icon={
              //           <Tooltip
              //             title={shouldDisableActions || !row.isActive ? '' : 'Delete'}
              //           >
              //             <DeleteOutline
              //               sx={{
              //                 color:
              //                   shouldDisableActions || row.isActive === false
              //                     ? 'gray'
              //                     : 'rgb(248, 11, 11)'
              //               }}
              //             />
              //           </Tooltip>
              //         }
              //         label='Delete'
              //         onClick={() => handleDelete(row)}
              //         disabled={row.isActive === false || shouldDisableActions}
              //       />
              //     ]
              //   : [])
            ];
          }
        }
      ]
    : columns;

  function Pagination({
    page,
    onPageChange,
    className
  }: Pick<TablePaginationProps, 'page' | 'onPageChange' | 'className'>) {
    return (
      <MuiPagination
        color='primary'
        className={className}
        count={pageCount ? pageCount : 0}
        page={page + 1}
        onChange={(event: any, newPage: any) => {
          onPageChange(event as any, newPage - 1);
        }}
      />
    );
  }

  function CustomPagination(props: any) {
    return <GridPagination ActionsComponent={Pagination} {...props} />;
  }

  // handle pageSize options
  const handePageSize = (params: any) => {
    let pageSizeOrder = params?.toSorted((a: any, b: any) => a - b);
    let result = pageSizeOrder?.every((item: any) => item % 5 === 0);
    return result ? pageSizeOrder : [5, 10, 15, 20];
  };

  const QuickSearchToolbar = () => {
    return (
      <>
        <Box className={`quick-searchbar ${title && 'quick-space'}`}>
          {title && <Typography>{title}</Typography>}
          <Stack>
            <GridToolbarQuickFilter
              quickFilterParser={searchInput =>
                searchInput.split(',').map(value => value.trim())
              }
              quickFilterFormatter={quickFilterValues => {
                return quickFilterValues.join(', ');
              }}
            />
          </Stack>
        </Box>
      </>
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const grid = tableContainerRef.current;
      if (!grid) return;

      const scrollableElement: any = grid.querySelector('.MuiDataGrid-virtualScroller');
      if (!scrollableElement) return;

      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;

      const handleMouseDown = (e: MouseEvent) => {
        isDown = true;
        scrollableElement.classList.add('active-slider-table');
        startX = e.pageX - scrollableElement.getBoundingClientRect().left;
        scrollLeft = scrollableElement.scrollLeft;
      };

      const handleMouseLeave = () => {
        isDown = false;
        scrollableElement.classList.remove('active-slider-table');
      };

      const handleMouseUp = () => {
        isDown = false;
        scrollableElement.classList.remove('active-slider-table');
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scrollableElement.getBoundingClientRect().left;
        const walk = x - startX;
        scrollableElement.scrollLeft = scrollLeft - walk;
      };

      scrollableElement.addEventListener('mousedown', handleMouseDown);
      scrollableElement.addEventListener('mouseleave', handleMouseLeave);
      scrollableElement.addEventListener('mouseup', handleMouseUp);
      scrollableElement.addEventListener('mousemove', handleMouseMove);

      return () => {
        scrollableElement.removeEventListener('mousedown', handleMouseDown);
        scrollableElement.removeEventListener('mouseleave', handleMouseLeave);
        scrollableElement.removeEventListener('mouseup', handleMouseUp);
        scrollableElement.removeEventListener('mousemove', handleMouseMove);
      };
    }, 100); // wait 100ms for the grid to mount

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      className={'custom-box2'}
      height={geofenceTableHeight ? '230px' : height}
      marginTop={marginTop}
    >
      {rows && (
        <style>
          {rows
            ?.map(
              (row: any) =>
                row?.color &&
                `.row-color-${row.id} { background-color: ${
                  row?.color
                } !important; color: ${row?.textColor || '#000'} !important; }`
            )
            .join(' ')}
        </style>
      )}
      <DataGrid
        key={rowCount}
        ref={tableContainerRef}
        // rowHeight={35}
        className={`${disableSelectAll && 'row-selection'}`}
        rows={rows}
        hideFooterPagination={hideFooterPagination}
        columns={columnsWithActions}
        rowCount={rowCount ? rowCount : undefined}
        disableColumnSelector={true}
        onRowSelectionModelChange={newSelectionModel =>
          onRowSelectionModelChange && onRowSelectionModelChange(newSelectionModel)
        }
        checkboxSelection={checkboxSelection}
        disableColumnFilter={true}
        sortingMode={sortingMode}
        disableDensitySelector={true}
        disableColumnMenu
        disableRowSelectionOnClick={disableRowOnClickToSelect}
        onRowDoubleClick={handleRowClick}
        rowSelectionModel={selection}
        getRowClassName={getRowClassName}
        sortingOrder={sortingOrder}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: pageSize,
              page: 0
            }
          }
        }}
        paginationModel={paginationModel}
        onSortModelChange={onSortModelChange}
        paginationMode={paginationMode}
        getRowHeight={params => {
          const isNew = params?.model?.isNew === true;
          const isEditing = rowModesModel[params.id]?.mode === 'edit';
          return isNew || isEditing ? 70 : 35;
        }}
        pageSizeOptions={handePageSize(pageSizeOptions)}
        onPaginationModelChange={onPaginationModelChange}
        // Inline editing props
        editMode={enableInlineEditing ? 'row' : undefined}
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStart={handleRowEditStart}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={handleProcessRowUpdate}
        onProcessRowUpdateError={onProcessRowUpdateError}
        slots={{
          moreActionsIcon: MenuIcon,
          noRowsOverlay: NoRowsOverlay,
          noResultsOverlay: NoRowsOverlay,
          toolbar: type !== toolbar ? QuickSearchToolbar : undefined,
          pagination: rowCount === 0 && type !== toolbar ? undefined : CustomPagination
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: rows?.length > 0,
            quickFilterProps: { debounceMs: 500 }
          },
          baseCheckbox: {
            tabIndex: 0
          }
          // row: { tabIndex: 0 },
          // cell: { tabIndex: 0 }
        }}
        autoHeight={geofenceTableHeight ? false : true}
        disableVirtualization
        loading={loading}
      />
    </Box>
  );
}

export default CustomDataGrid;
