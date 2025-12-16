import React, { useState } from 'react';
import { Typography, Box, Checkbox, Grid, IconButton, Dialog } from '@mui/material';
import CustomTimePicker from '../customized/customtimepicker/CustomTimePicker';
import CustomButton from '../buttons/CustomButton';
import { AddCircleOutline } from '@mui/icons-material';
import { Icon } from '@iconify/react';
import './CustomDaySelection.scss';

interface CustomDaySelectionProps {
  day: any;
  index: number;
  setValue: any;
  isSelected: boolean;
  disableTime: boolean;
  onSelect: (index: number, id: string) => void;
  control: any;
  errors: any;
  minPickTime?: any;
  handleMinTime?: (date: Date, type: 'from' | 'to') => void;
  getValues: any;
  trigger?: any;
  handleFromTime?: any;
  handleToTime?: any;
  update?: any;
  maxPickTimes?: any;
  textValue?: any;
}

const CustomDaySelection: React.FC<CustomDaySelectionProps> = ({
  day,
  index,
  onSelect,
  update,
  handleFromTime,
  handleToTime,
  control,
  trigger,
  errors,
  minPickTime,
  getValues,
  textValue,
  maxPickTimes
}) => {
  const [breakTime, setBreakTime] = useState<boolean>(false);

  const handleMinTime = (event: string, type: string) => {
    // trigger(`availableDays.${index}.breakIntervals`);
  };

  const handleAddBreaks = (index: number) => {
    update(index, {
      ...day,
      breakIntervals: [
        ...(day?.breakIntervals ?? []),
        { breakTimeFrom: null, breakTimeTo: null }
      ]
    });
  };

  const handleClose = () => {
    update(index, {
      ...day,
      breakIntervals: day?.breakIntervals
        ?.filter((value: any) => value?.previousFrom != null && value?.previousTo != null)
        ?.map((item: any) => ({
          ...item,
          breakTimeFrom: item.previousFrom,
          breakTimeTo: item.previousTo
        }))
    });

    trigger(`availableDays`);
    setBreakTime(false);
  };

  // const validateBreakIntervals = async (props: any) => {
  //   const isValid = props?.breakIntervals?.every(
  //     (interval: any) => interval?.breakTimeFrom && interval?.breakTimeTo
  //   );

  //   const isValid00 = props?.breakIntervals?.filter(
  //     (interval: any) => interval?.breakTimeFrom && interval?.breakTimeTo
  //   );

  //   trigger(`availableDays.${index}.breakIntervals`);
  //   if (isValid && !Boolean(errors?.availableDays?.[index]?.breakIntervals?.length > 0)) {
  //     if (!errors?.availableDays) {
  //       await update(index, {
  //         ...day,
  //         breakIntervals: day?.breakIntervals?.map((item: any) => ({
  //           ...item,
  //           previousFrom: item.breakTimeFrom,
  //           previousTo: item?.breakTimeTo
  //         }))
  //       });
  //       setBreakTime(false);
  //     }
  //   }
  // };

  const validateBreakIntervals = async (props: any) => {
    const intervals = props?.breakIntervals || [];

    const cleanedIntervals = intervals.filter(
      (interval: any) => interval.breakTimeFrom !== null || interval.breakTimeTo !== null
    );

    const isValid = cleanedIntervals.every(
      (interval: any) => interval.breakTimeFrom && interval.breakTimeTo
    );
    await trigger(`availableDays.${index}.breakIntervals`);

    // if (isValid && !errors?.availableDays?.[index]?.breakIntervals?.length > 0) {
    if (isValid && !Boolean(errors?.availableDays?.[index]?.breakIntervals)) {
      await update(index, {
        ...day,
        breakIntervals: cleanedIntervals.map((item: any) => ({
          ...item,
          previousFrom: item.breakTimeFrom,
          previousTo: item.breakTimeTo
        }))
      });

      setBreakTime(false);
    }
  };

  return (
    <Box className='custom-day-total-section'>
      <Box className='custom-day-selection-wrapper'>
        <Box className='custom-day-selection-card'>
          <Checkbox checked={day.day} onClick={() => onSelect(index, day)} />
          <Typography className='day-label'>{day.label}</Typography>
        </Box>

        <Box className='custom-time-picker-container'>
          <Box className='custom-time-picker-box from-datepicker'>
            <CustomTimePicker
              id='from'
              name={`availableDays.${index}.fromTime`}
              control={control}
              label='From'
              isOptional={!day.day}
              values={getValues(`availableDays.${index}.fromTime`)}
              isClock
              onTimeChange={(date: any) => handleFromTime(index, date, day)}
              isDisabled={!getValues(`availableDays.${index}.day`)}
            />
          </Box>

          <Box className='custom-time-picker-box to-datepicker'>
            <CustomTimePicker
              id='to'
              name={`availableDays.${index}.toTime`}
              control={control}
              label='To'
              isOptional={!day.day}
              values={getValues(`availableDays.${index}.toTime`)}
              isClock
              onTimeChange={(date: any) => {
                if (date) {
                  handleToTime(index, date, day);
                }
              }}
              minTime={minPickTime[index]}
              isDisabled={
                !getValues(`availableDays.${index}.day`) ||
                !getValues(`availableDays.${index}.fromTime`)
              }
            />
          </Box>
        </Box>
      </Box>

      {day?.fromTime && day?.toTime && (
        <CustomButton
          className='break-view'
          category='Break Details'
          onClick={() => {
            setBreakTime(true);
          }}
        />
      )}

      {breakTime && (
        <Dialog
          open={breakTime}
          maxWidth='sm'
          fullWidth
          // onClose={() => setBreakTime(false)}
        >
          <Typography variant='h6' align='center' gutterBottom className='manage-break'>
            Driver Break Windows
          </Typography>

          <Typography
            variant='body2'
            align='center'
            color='textSecondary'
            sx={{ fontStyle: 'italic' }}
          >
            (Note: break window must be above 30 mins)
          </Typography>

          {day?.breakIntervals?.length <= 0 ||
          day?.breakIntervals?.length === undefined ? (
            <Box className='break-btn-container' sx={{ paddingTop: '10px' }}>
              <CustomButton
                category='Add Break'
                className='break-btn'
                variant='outlined'
                startIcon={<AddCircleOutline />}
                onClick={() => {
                  handleAddBreaks(index);
                }}
              />
            </Box>
          ) : (
            <Box className='cutom-days'>
              {day?.breakIntervals?.map((breakItem: any, breakIndex: any) => (
                <Box key={breakItem.id} className='custom-day-break'>
                  <Grid container>
                    <Grid item xs={12}>
                      <Box className='custom-break-add'>
                        <Typography variant='subtitle1'>
                          Break {breakIndex + 1}
                        </Typography>
                        <IconButton
                          onClick={() => {
                            update(index, {
                              ...day,
                              breakIntervals: day.breakIntervals.filter(
                                (_: any, i: any) => i !== breakIndex
                              )
                            });

                            trigger(`availableDays.${index}.breakIntervals`);
                          }}
                        >
                          <Icon icon='ic:baseline-delete' className='delete-btn' />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={12} paddingTop={'0 !important'} mb={1}>
                      <CustomTimePicker
                        id={`break-${breakIndex}-from`}
                        name={`availableDays.${index}.breakIntervals.${breakIndex}.breakTimeFrom`}
                        control={control}
                        values={getValues(
                          `availableDays.${index}.breakIntervals.${breakIndex}.breakTimeFrom`
                        )}
                        label='From'
                        minTime={minPickTime[index]?.subtract(1, 'hour')}
                        maxTime={maxPickTimes[index]?.subtract(1, 'hour')}
                        isOptional={true}
                        onTimeChange={(event: any) => {
                          if (event?.$d) {
                            handleMinTime(event.$d, 'from');
                            update(index, {
                              ...day,
                              breakIntervals: day?.breakIntervals?.map(
                                (item: any, i: number) =>
                                  breakIndex === i
                                    ? { ...item, breakTimeFrom: event.$d }
                                    : item
                              )
                            });
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} paddingTop={'0 !important'} mb={1}>
                      <CustomTimePicker
                        id={`break-${breakIndex}-to`}
                        name={`availableDays.${index}.breakIntervals.${breakIndex}.breakTimeTo`}
                        control={control}
                        values={getValues(
                          `availableDays.${index}.breakIntervals.${breakIndex}.breakTimeTo`
                        )}
                        isOptional={
                          getValues(
                            `availableDays.${index}.breakIntervals.${breakIndex}.breakTimeFrom`
                          )
                            ? false
                            : true
                        }
                        label='To'
                        minTime={minPickTime[index]?.subtract(1, 'hour')}
                        maxTime={maxPickTimes[index]?.subtract(1, 'hour')}
                        onTimeChange={(event: any) => {
                          if (event?.$d) {
                            handleMinTime(event.$d, 'to');
                            update(index, {
                              ...day,
                              breakIntervals: day?.breakIntervals?.map(
                                (item: any, i: number) =>
                                  breakIndex === i
                                    ? { ...item, breakTimeTo: event.$d }
                                    : item
                              )
                            });
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          )}

          <Box className='bottom-break-btn'>
            <Box
              sx={{
                display: 'flex',
                justifyContent:
                  day?.breakIntervals?.length !== 0 &&
                  day?.breakIntervals?.length !== undefined
                    ? 'space-between'
                    : 'flex-end'
              }}
            >
              {day?.breakIntervals?.length !== 0 &&
              day?.breakIntervals?.length !== undefined ? (
                <CustomButton
                  category='Add Break'
                  variant='outlined'
                  startIcon={<AddCircleOutline />}
                  onClick={() => {
                    handleAddBreaks(index);
                  }}
                />
              ) : (
                ''
              )}
              <Box display={'flex'} alignItems={'center'} justifyContent={'end'}>
                <Box marginRight='15px'>
                  <CustomButton
                    category='Cancel'
                    className='cancel'
                    onClick={handleClose}
                  />
                </Box>
                <CustomButton
                  category='Save'
                  className='saveChanges'
                  onClick={() => {
                    validateBreakIntervals(day);
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Box className='error-break'>
            {errors.availableDays?.[0]?.['breakIntervals']?.['message'] ||
              errors.availableDays?.[1]?.['breakIntervals']?.['message']}
          </Box>
        </Dialog>
      )}
    </Box>
  );
};

export default CustomDaySelection;
