import {
  flexRender,
  getCoreRowModel,
  RowData,
  useReactTable
} from '@tanstack/react-table';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';

import { Icon } from '@iconify/react';
import './../../ratecard/RateCard.scss';
import CustomTimePicker from '../../../../../../../common/components/customized/customtimepicker/CustomTimePicker';
import CustomButton from '../../../../../../../common/components/buttons/CustomButton';
import CustomTextField from '../../../../../../../common/components/customized/customtextfield/CustomTextField';
import { CircularProgress } from '@mui/material';
import { useEditableTableColumn } from './componentdata/EditableTableComponentData';
import { useEditTableActions } from './hooks/editabletablehooks/tableEditCellActions';
import { editableTableFormSubmission } from './hooks/editabletablehooks/editableTableFormSubmission';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

type EditableTableProps = {
  control: any;
  columns: any;
  data: any;
  updateTour: any;
  modeIndex: any;
  modeFields: any;
  getValues?: any;
  loading?: any;
  trigger?: any;
  setValue?: any;
  setError?: any;
  clearErrors?: any;
  setEditingRow: any;
  isMobile?: boolean;
  editingRow: any;
};

export function EditableTable({
  control,
  columns,
  data,
  updateTour,
  modeIndex,
  modeFields,
  getValues,
  loading,
  trigger,
  setValue,
  setError,
  clearErrors,
  setEditingRow,
  editingRow,
  isMobile = false
}: EditableTableProps) {
  const theme = useTheme();

  const { startEdit, cancelEdit, saveEdit, updateSeatersData } = useEditTableActions({
    updateTour,
    modeIndex,
    setEditingRow,
    modeFields
  });

  const {
    handleDialogClose,
    handleAddOnSubmit,
    isOpenDialog,
    setIsOpenDialog,
    isaddOnIndex,
    setIsAddOnIndex,
    addOnChanges
  } = editableTableFormSubmission({
    data,
    updateTour,
    modeIndex,
    modeFields,
    clearErrors,
    control,
    setError
  });

  const { finalColumns } = useEditableTableColumn({
    columns,
    editingRow,
    isMobile,
    saveEdit,
    cancelEdit,
    startEdit
  });

  const table = useReactTable({
    data: data ?? [],
    columns: finalColumns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnPinning: true,
    initialState: {
      columnPinning: { left: ['tourName'] }
    }
  });

  return (
    <>
      <div
        style={{
          overflowX: table?.getAllLeafColumns()?.length > 5 ? 'auto' : 'visible',
          maxWidth: table?.getAllLeafColumns()?.length > 5 ? '1280px' : '100%'
        }}
      >
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px'
            }}
          >
            <CircularProgress size={32} thickness={4} />
          </div>
        ) : data?.length > 0 ? (
          <table
            style={{
              borderCollapse: 'collapse',
              width: '100%',
              minWidth: isMobile ? '600px' : '100%'
            }}
          >
            <thead>
              {table?.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    const isFirst = header.column.id === 'tourName';
                    const isLast = header.column.id === 'actions';

                    return (
                      <th
                        key={header.id}
                        style={{
                          minWidth: isLast ? '60px' : '13rem',
                          backgroundColor: '#fff',
                          padding: '8px',
                          border: '1px solid #d4d7db',
                          height: '5vh',
                          position: isFirst || isLast ? 'sticky' : 'static',
                          left: isFirst ? 0 : undefined,
                          right: isLast ? 0 : undefined,
                          zIndex: isFirst || isLast ? 2 : 1
                        }}
                      >
                        <span>{String(header.column.columnDef.header)}</span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table?.getRowModel().rows.map((row, rowindex) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell: any, cellIndex) => {
                    const isFirst = cellIndex === 0;
                    const isLast = cellIndex === row?.getVisibleCells()?.length - 1;
                    const hasAddOns = 0;

                    return (
                      <td
                        key={cell.id}
                        style={{
                          minWidth: isLast
                            ? isMobile
                              ? '50px'
                              : '60px'
                            : isMobile
                            ? '100px'
                            : '13rem',
                          padding: isMobile ? '6px' : '10px',
                          border: '2px solid #80808033',
                          textAlign: 'center',
                          fontSize: isFirst
                            ? isMobile
                              ? '0.7rem'
                              : '12px'
                            : isMobile
                            ? '0.8rem'
                            : 'inherit',
                          color: isFirst ? 'black' : '#16a34a',
                          position: isFirst || isLast ? 'sticky' : 'static',
                          left: isFirst ? 0 : undefined,
                          right: isLast ? 0 : undefined,
                          background: 'white',
                          zIndex: isFirst || isLast ? 1 : 0,
                          verticalAlign: 'middle'
                        }}
                      >
                        {[isLast, isFirst]?.includes(true) ? (
                          flexRender(cell.column.columnDef.cell, cell.getContext())
                        ) : editingRow === row.index && !isFirst ? (
                          <CustomTextField
                            key={cell.id}
                            control={control}
                            name={`modes.${modeIndex}.tours.${row?.index}.seaters.${
                              cellIndex - 1
                            }.baseCost`}
                            placeholder='Base Cost'
                            id={`modes.${modeIndex}.tours.${row?.index}.seaters.${
                              cellIndex - 1
                            }.baseCost`}
                            type={'number'}
                            onChangeCallback={(event: any) => {
                              updateSeatersData(cell, row.index, event);
                            }}
                            isDecimal={true}
                          />
                        ) : (
                          <></>
                        )}

                        {![isFirst, isLast, editingRow === row.index]?.some(Boolean) && (
                          <div className='add-ons-parent'>
                            {Boolean(
                              getValues(
                                `modes.${modeIndex}.tours.${row?.index}.seaters.${
                                  cellIndex - 1
                                }.baseCost`
                              )
                            ) && (
                              <Tooltip title='Add-on'>
                                <Icon
                                  icon='mdi:edit-circle'
                                  width='24'
                                  height='24'
                                  style={{
                                    cursor: 'pointer',
                                    color: 'rgb(163 146 22)',
                                    position: 'absolute',
                                    top: isMobile ? '-6px' : '-8px',
                                    right: isMobile ? '-2px' : '-4px',
                                    backgroundColor: 'white',
                                    borderRadius: '50%'
                                  }}
                                  onClick={() => {
                                    setIsOpenDialog(true);
                                    setIsAddOnIndex({
                                      rowId: row?.index,
                                      columnId: cell?.column?.id
                                    });
                                  }}
                                />
                              </Tooltip>
                            )}

                            <span>
                              {' '}
                              {getValues(
                                `modes.${modeIndex}.tours.${row?.index}.seaters.${
                                  cellIndex - 1
                                }.baseCost`
                              )}
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: 500,
              color: '#666',
              height: '100%',
              // backgroundColor: '#f9f9f9',
              borderRadius: '8px'
            }}
          >
            No data found
          </div>
        )}
      </div>

      {/* Add-ons Dialog */}
      {isOpenDialog && (
        <Dialog open={true} maxWidth='md' fullWidth>
          <DialogContent>
            <Typography
              variant='h5'
              gutterBottom
              sx={{
                fontWeight: 600,
                letterSpacing: 0.5,
                color: '#212121',
                mb: 3
              }}
            >
              Add-on for Seater{' '}
              {(() => {
                const seater = data[isaddOnIndex.rowId]?.seaters?.find(
                  (s: any) => s.seater.toString() === isaddOnIndex.columnId
                );
                return seater?.seater;
              })()}{' '}
              - {data[isaddOnIndex.rowId]?.tourName}
            </Typography>

            <Box
              className='addratecard-close'
              sx={{ position: 'absolute', top: 10, right: 10, zIndex: 3 }}
            >
              <Icon
                icon='ic:round-close'
                className='ratecard-close-icon'
                onClick={handleDialogClose}
              />
            </Box>

            <Grid container spacing={1}>
              {(() => {
                const seater = data[isaddOnIndex.rowId]?.seaters?.find(
                  (s: any) => s.seater.toString() === isaddOnIndex.columnId
                );

                const seaterIndex = data[isaddOnIndex.rowId]?.seaters?.findIndex(
                  (s: any) => s.seater.toString() === isaddOnIndex.columnId
                );

                if (!seater || seaterIndex === -1) return null;

                return seater.addOns?.map((addOn: any, addOnIndex: number) => {
                  const changeKey = `${isaddOnIndex.rowId}-${isaddOnIndex.columnId}-${addOnIndex}`;
                  const changes = addOnChanges[changeKey] || {};

                  return (
                    <Grid item xs={12} key={addOnIndex}>
                      {/* <Typography variant='subtitle2'>Add-on {addOnIndex + 1}</Typography> */}
                      <Grid container spacing={isMobile ? 0.5 : 1}>
                        <Grid item xs={isMobile ? 12 : 3}>
                          <CustomTextField
                            id={`${addOnIndex}.name`}
                            label='Add-on Name'
                            name={`modes.${modeIndex}.tours.${isaddOnIndex.rowId}.seaters.${seaterIndex}.addOns.${addOnIndex}.name`}
                            control={control}
                            placeholder='Add-on name'
                            isOptional
                            onChangeCallback={(e: any) => {
                              setValue(
                                `modes.${modeIndex}.tours.${isaddOnIndex.rowId}.seaters.${seaterIndex}.addOns.${addOnIndex}.name`,
                                e
                              );
                            }}
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <CustomTextField
                            id={addOnIndex.toString()}
                            label='Add-on Cost'
                            name={`modes.${modeIndex}.tours.${isaddOnIndex.rowId}.seaters.${seaterIndex}.addOns.${addOnIndex}.addCost`}
                            control={control}
                            placeholder='Cost'
                            type='number'
                            isOptional
                            isDecimal={true}
                            onChangeCallback={(e: any) => {
                              setValue(
                                `modes.${modeIndex}.tours.${isaddOnIndex.rowId}.seaters.${seaterIndex}.addOns.${addOnIndex}.addCost`,
                                e,
                                { shouldValidate: true }
                              );
                              // if (e === 0) {
                              //   setValue(
                              //     `modes.${modeIndex}.tours.${isaddOnIndex.rowId}.seaters.${seaterIndex}.addOns.${addOnIndex}.startTime`,
                              //     null
                              //   );
                              //   setValue(
                              //     `modes.${modeIndex}.tours.${isaddOnIndex.rowId}.seaters.${seaterIndex}.addOns.${addOnIndex}.endTime`,
                              //     null
                              //   );
                              // }
                            }}
                          />
                        </Grid>
                        <Grid item xs={isMobile ? 12 : 3}>
                          <CustomTimePicker
                            id={`${addOnIndex}.startTime`}
                            name={`modes.${modeIndex}.tours.${isaddOnIndex.rowId}.seaters.${seaterIndex}.addOns.${addOnIndex}.startTime`}
                            control={control}
                            label='Start Time'
                            isClock={true}
                            isOptional={true}
                            isDisabled={
                              getValues(
                                `modes.${modeIndex}.tours.${isaddOnIndex.rowId}.seaters.${seaterIndex}.addOns.${addOnIndex}.addCost`
                              ) > 0
                                ? false
                                : true
                            }
                            values={addOn?.startTime ? addOn?.startTime : null}
                            // onTimeChange={(e: any) => {
                            //   setValue(
                            //     `modes.${modeIndex}.tours.${isaddOnIndex.rowId}.seaters.${seaterIndex}.addOns.${addOnIndex}.startTime`,
                            //     e?.$d
                            //   );
                            // }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                height: isMobile ? 32 : 35
                              },
                              '& .MuiInputBase-input': {
                                padding: isMobile ? '8px 10px' : '10px 12px',
                                fontSize: isMobile ? '0.8rem' : '14px'
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={isMobile ? 12 : 3}>
                          <CustomTimePicker
                            id={`${addOnIndex}.endTime`}
                            name={`modes.${modeIndex}.tours.${isaddOnIndex.rowId}.seaters.${seaterIndex}.addOns.${addOnIndex}.endTime`}
                            control={control}
                            label='End Time'
                            isOptional={true}
                            isDisabled={
                              getValues(
                                `modes.${modeIndex}.tours.${isaddOnIndex.rowId}.seaters.${seaterIndex}.addOns.${addOnIndex}.addCost`
                              ) > 0
                                ? false
                                : true
                            }
                            values={addOn?.endTime ? addOn.endTime : null}
                            // onTimeChange={(e: any) => {
                            //   setValue(
                            //     `modes.${modeIndex}.tours.${isaddOnIndex.rowId}.seaters.${seaterIndex}.addOns.${addOnIndex}.endTime`,
                            //     e?.$d
                            //   );
                            // }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                height: isMobile ? 32 : 35
                              },
                              '& .MuiInputBase-input': {
                                padding: isMobile ? '8px 10px' : '10px 12px',
                                fontSize: isMobile ? '0.8rem' : '14px'
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  );
                });
              })()}
            </Grid>
          </DialogContent>

          <DialogActions sx={{ padding: isMobile ? '8px 16px' : '16px 24px' }}>
            <CustomButton
              category='Cancel'
              className='cancel'
              onClick={handleDialogClose}
              size={isMobile ? 'small' : 'medium'}
            />
            <CustomButton
              category='Save'
              type='submit'
              className='saveChanges'
              onClick={handleAddOnSubmit}
              size={isMobile ? 'small' : 'medium'}
            />
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
