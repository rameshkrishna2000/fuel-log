import { Box, Dialog, Grid, Stack, Typography } from '@mui/material';
import CustomSelect from '../../../../common/components/customized/customselect/CustomSelect';
import CustomButton from '../../../../common/components/buttons/CustomButton';
import { useEffect } from 'react';
import CustomDataGrid from '../../../../common/components/customized/customdatagrid/CustomDataGrid';

import './Reports.scss';
import { useAppDispatch, useAppSelector } from '../../../../app/redux/hooks';
import * as yup from 'yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import CustomDateTimeCalendar from '../../../../common/components/customized/customdatetimecalendar/CustomDateTimeCalendar';
import constant from '../../../../utils/constants';
import dayjs from 'dayjs';
import CustomDialog from '../../../../common/components/customdialog/CustomDialog';
import Loader from '../../../../common/components/customized/customloader/CustomLoader';
import { getMyProfileAction } from '../../../../common/redux/reducer/commonSlices/myProfileSlice';
import CustomToolbar from '../../../../common/components/customized/customtoolbar/CustomToolbar';
import CustomBreadcrumbs from '../../../../common/components/custombreadcrumbs/CustomBreadcrumbs';
import {
  useCommonStateHandlers,
  useFetchReport,
  useHandleSideEffects,
  useReportPayload,
  useReportsDateHandler,
  useReportSubmit,
  useReportTypes,
  useSendMail
} from './hooks/reportHooks';
import ReportMail from './components/ReportMail';
import { useAbort } from '../../../../utils/commonFunctions';
import { useDynamicYupSchema } from '../../../../common/hooks/useDynamicSchema';
import { mailFields, reportFormFields } from './components/reportFields';
import { usePagination } from '../../../../common/hooks/usePagination';
import {
  clearReportURLS,
  setExternalVehicle,
  updateIsShowMap
} from '../../../redux/reducer/commonSlices/reportSlice';
import { tourColumns } from './components/reportsColumns';
export interface PaginationModel {
  page: number;
  pageSize: number;
}

function Reports() {
  const role = localStorage.getItem('role');

  const dispatch = useAppDispatch();
  // const { deviceList } = useAppSelector(
  //   (state: { devicelist: DevicestateProps }) => state.devicelist
  // );

  //custom hook to handle component states
  const {
    isDownload,
    isDeviceDisabled,
    isDateDisabled,
    toDateDisabled,
    setIsDeviceDisabled,
    setIsDownload,
    setIsDateDisabled,
    setToDateDisabled,
    setReportType,
    report,
    setNoLoad,
    noLoad,
    setPayloads,
    payloads
  } = useCommonStateHandlers();

  const { createFormFields } = useDynamicYupSchema(null);

  const { schema: mailSchema } = createFormFields(mailFields);

  //custom hook to fetch report
  const { getData } = useFetchReport();

  //custom hook for abort requests
  // const createAbort = useAbort();

  //custom hook to generate reportPayload
  const { handleReportPayload } = useReportPayload({
    setPayloads,
    getData,
    payloads,
    setNoLoad
  });

  //custom hook to handle Pagination
  const { pageNo, pageSize, handlePagination, setPageNo, setPageSize } = usePagination({
    pageno: 1,
    pagesize: 10,
    otherFunctions: handleReportPayload
  });

  // const signal = createAbort().abortCall.signal;

  const { timezone } = useAppSelector(state => state.myProfile.data);

  //custom hook to get report data
  const {
    selectedReportType,
    handleGetReportClick,
    startDate,
    endDate,
    vehicle,
    vehicleNo,
    difference,
    createAbort
  } = useReportSubmit({
    setIsDeviceDisabled,
    setIsDownload,
    setIsDateDisabled,
    setToDateDisabled,
    setPageNo,
    setPageSize,
    setPayloads,
    timezone
  });

  const { rows, columns, isLoading, count } = useAppSelector(
    (state: any) =>
      state[selectedReportType] || { rows: [], columns: [], pdfURL: '', excelURL: '' }
  );

  const { email } = useAppSelector((state: any) => state.myProfile.data || { email: '' });

  const { isShowMap, Polyline, Waypoints, externalVehicle } = useAppSelector(
    state => state.reportDialog
  );

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    reset,
    resetField,
    trigger,
    formState
  } = useForm<any>({
    resolver: async (data: any, context: any, options: any) => {
      const updates = reportFormFields(data);
      const { schema }: any = createFormFields(updates);
      return yupResolver(schema)(data, context, options);
    }
  } as any);

  const {
    control: mailControl,
    handleSubmit: mailSubmit,
    getValues: getMailValues,
    setValue: setMailValues,
    clearErrors: mailClearErrors,
    reset: mailReset,
    resetField: mailResetField
  } = useForm({
    resolver: yupResolver(mailSchema)
  });

  //custom hook for report types
  const { reportType, handleReport } = useReportTypes({
    resetField,
    setValue,
    clearErrors,
    setIsDeviceDisabled,
    setToDateDisabled,
    setReportType,
    setIsDownload,
    setIsDateDisabled
  });

  //custom hook for reports date fields
  const {
    handleCustomFrom,
    handleCustomTo,
    handleFromDate,
    handleToDate,
    getStartDate,
    getEndDate,
    setGetStartDate,
    setGetEndDate
  } = useReportsDateHandler({
    setValue,
    clearErrors,
    trigger,
    setToDateDisabled
  });

  //custom hook to send mail
  const { mailLoad, newMail, drawer, setDrawer, sendMail, setNewMail } = useSendMail({
    mailResetField,
    payloads
  });

  const tourRows: any = externalVehicle?.tourDetails.map((item: any, index: number) => ({
    ...item,
    id: index + 1,
    driverName: item?.driverName.toUpperCase()
  }));

  const selectAllOption = { id: 'selectAll', label: 'Select All' };

  const documentOption = [
    { id: 'PDF', label: 'PDF' },
    { id: 'EXCEL', label: 'Excel' }
  ];

  useHandleSideEffects({
    mountEvents: [{ url: getMyProfileAction }],
    cleanUpEvents: () => {
      dispatch(setExternalVehicle(null));
      dispatch(clearReportURLS());
      createAbort().abortCall.abort();
    },
    mailResetField,
    setDrawer,
    setNewMail,
    reset: reset,
    setMailValues,
    email,
    newMail,
    drawer
  });

  return (
    <>
      <Grid
        className='report-container'
        container
        gap={0.5}
        component='form'
        spacing={2}
        onSubmit={handleSubmit(handleGetReportClick)}
        columnSpacing={{ xs: 10, sm: 2, md: 3 }}
        alignItems={'center'}
        marginBottom={1.5}
        sx={{
          marginTop: 0,
          width: '100%',
          marginLeft: 0
        }}
      >
        {/* Report Type Selection */}
        <Grid item xs={12} sm={4} md={4} lg={2} marginTop={'7px'}>
          <CustomSelect
            id='select-report'
            options={reportType}
            control={control}
            name='report'
            placeholder='Report Type'
            onChanges={async (event: any, newValue: any) => {
              handleReport(newValue?.id);
              setGetStartDate(null);
              setGetEndDate(null);
              setToDateDisabled(true);
            }}
            className='reports-select animate__animated animate__slideInRight'
          />
        </Grid>

        {/* Vehicle Selection */}

        {/* Start Date */}
        {report !== 'DeviceHealth' && (
          <Grid item xs={12} sm={4} md={4} lg={2}>
            <CustomDateTimeCalendar
              id='select-startdate'
              name='startDate'
              control={control}
              disableFuture={true}
              disablePast={false}
              value={getStartDate}
              format='DD/MM/YYYY hh:mm a'
              placeholder='Start Date'
              getStartDate={getStartDate}
              isDisabled={isDateDisabled}
              className='reports-calendar animate__animated animate__slideInRight'
              onDateSelect={(start: Date, end: Date) => handleCustomFrom(start, end)}
              onDateChange={(date: Date) => handleFromDate(date)}
              type='report'
            />
          </Grid>
        )}

        {/* End Date */}
        {report !== 'DeviceHealth' && (
          <Grid item xs={12} sm={4} md={4} lg={2}>
            <CustomDateTimeCalendar
              id='select-enddate'
              name='endDate'
              control={control}
              placeholder='End Date'
              format='DD/MM/YYYY hh:mm a'
              disableFuture={true}
              disablePast={false}
              className='reports-calendar animate__animated animate__slideInRight'
              getStartDate={getStartDate}
              value={getEndDate}
              onDateSelect={(start: Date, end: Date) => handleCustomTo(start, end)}
              onDateChange={(date: Date) => handleToDate(date)}
              minDateTime={
                getStartDate !== null ? dayjs(getStartDate?.getTime() + 1000 * 600) : null
              }
              maxDateTime={dayjs()
                .set('hour', new Date().getHours())
                .set('minutes', new Date().getMinutes())
                .startOf('minute')}
              isDisabled={toDateDisabled}
              type='report'
            />
          </Grid>
        )}

        {/* Submit Button */}
        <Grid item xs={12} sm={4} md={4} lg={2}>
          <CustomButton
            className='get-report animate__animated animate__slideInRight'
            category='Get Report'
            type='submit'
            loading={isLoading}
            noLoad={noLoad}
          />
        </Grid>

        {/* Download & Mail Button */}
        {rows.length > 0 && isDownload ? (
          <Grid
            item
            lg={2.2}
            md={4}
            sm={5.5}
            xs={5.5}
            position={'absolute'}
            sx={{ top: '9px', right: '10px' }}
          >
            <Stack
              direction={'row'}
              gap={'20px'}
              sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
            >
              {difference || selectedReportType === 'DeviceHealth' ? (
                <CustomToolbar
                  docPayload={{
                    reportType: report,
                    payload: {
                      report: report,
                      startDate: payloads.startDate,
                      endDate: payloads.endDate,
                      deviceID: vehicle
                    }
                  }}
                />
              ) : (
                ''
              )}
              <CustomButton
                className='mail-button animate__animated animate__slideInRight'
                icon={'material-symbols:send'}
                category='Mail'
                onClick={() => setDrawer(true)}
              />
            </Stack>
          </Grid>
        ) : (
          ''
        )}
      </Grid>
      {/*  {difference && <CustomToolbar docPayload={docPayload} />} */}
      <Box sx={{ position: 'relative' }}>
        <Box className='title'>
          {rows.length > 0 && (
            <Typography className='heading report-title'>
              {selectedReportType &&
                `${selectedReportType
                  ?.replace(/([A-Z][a-z])/g, ' $1')
                  .replace(/(\d)/g, ' $1')} ${constant.Reports}`}{' '}
              <Typography className='reports-date'>
                {startDate !== '' || endDate !== '' ? (
                  <span>
                    <strong className='start-end'>{constant.Reportgeneration}</strong>
                    {startDate} - {endDate}{' '}
                    {vehicleNo && (
                      <strong className='vehicle-no'>{constant.VehicleDetails}</strong>
                    )}
                    {vehicleNo}
                  </span>
                ) : (
                  ''
                )}
              </Typography>
            </Typography>
          )}
        </Box>
        {selectedReportType === 'ExternalVehicle' && rows.length > 0 && (
          <CustomBreadcrumbs
            itemOne={'External Vehicles'}
            itemTwo={'Tour Details'}
            itemTwoState={externalVehicle}
            handleItemOneClick={() => {
              dispatch(setExternalVehicle(null));
            }}
            setView={() => {
              dispatch(setExternalVehicle(null));
            }}
          />
        )}
        <Box>
          {!externalVehicle && rows.length > 0 ? (
            <CustomDataGrid
              rows={rows}
              columns={columns}
              rowCount={count}
              loading={isLoading}
              onPaginationModelChange={handlePagination}
              pageNo={pageNo}
              pageSize={pageSize}
              pageSizeOptions={[10, 20, 30]}
              paginationModel={{
                page: pageNo ? pageNo - 1 : 0,
                pageSize: pageSize ? pageSize : 5
              }}
            />
          ) : externalVehicle && rows.length > 0 ? (
            <CustomDataGrid
              rows={tourRows}
              columns={tourColumns}
              loading={isLoading}
              paginationMode={'client'}
            />
          ) : (
            <></>
          )}
        </Box>
      </Box>

      {isLoading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '300px'
          }}
        >
          <Loader />
        </Box>
      )}

      {isShowMap && (
        <CustomDialog
          view={isShowMap}
          tripsData={Polyline}
          locations={Waypoints}
          isShowMap={isShowMap}
          handleViewClose={() => {
            dispatch(updateIsShowMap(false));
          }}
          maplegend={false}
          module={
            ['TripCompliance', 'TripDetails']?.includes(selectedReportType)
              ? 'trips'
              : 'report'
          }
        />
      )}

      {drawer && (
        <ReportMail
          mailLoad={mailLoad}
          drawer={drawer}
          mailSubmit={mailSubmit}
          mailReset={mailReset}
          sendMail={sendMail}
          mailControl={mailControl}
          documentOption={documentOption}
          setDrawer={setDrawer}
        />
      )}
    </>
  );
}
export default Reports;
