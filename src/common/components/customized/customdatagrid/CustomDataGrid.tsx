import {
  DataGrid,
  GridFeatureMode,
  GridInputRowSelectionModel,
  GridPagination,
  GridToolbarQuickFilter
} from '@mui/x-data-grid';
import { Box, Stack, TablePaginationProps, Typography } from '@mui/material';
import MuiPagination from '@mui/material/Pagination';
import { useEffect, useRef, useState } from 'react';
import './CustomDataGrid.scss';
import MenuIcon from '@mui/icons-material/Menu';
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
  tabsValue
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
        ref={tableContainerRef}
        rowHeight={35}
        className={`${disableSelectAll && 'row-selection'}`}
        rows={rows}
        hideFooterPagination={hideFooterPagination}
        columns={columns}
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
        getRowHeight={() => rowHeight}
        pageSizeOptions={handePageSize(pageSizeOptions)}
        onPaginationModelChange={onPaginationModelChange}
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
