import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../../../app/config/axiosInstance';
import URLs from '../../../../utils/appURLs';
import { updateToast } from './toastSlice';
import { externalVehicleColumns } from '../../../pages/user/reports/components/reportsColumns';
import { epochToDateFormatSg } from '../../../../utils/commonFunctions';

type ReturnedType = any;

export interface DevicestateProps {
  isLoading: boolean;
  deviceList: string[] | [];
  error: string | null;
}

export interface Payload {
  report?: string | null;
  startDate?: number | null;
  endDate?: number | null;
  deviceID?: string | null;
  pageno?: number | null;
  pagesize?: number | null;
  toast?: boolean | null;
  signal?: any;
}

//Initial state for reports
export interface ReportstateProps {
  isLoading: boolean;
  error: Object | null;
  rows: any;
  isActive?: [];
  columns: Array<{
    title: string;
    field: string;
    headerName: string;
    flex: number;
    minWidth: number;
  }>;
  count: number | null;
  pdfURL?: null | string;
  excelURL?: null | string;
  externalVehicle?: null | any;
}

const reportState: ReportstateProps = {
  isLoading: false,
  error: null,
  rows: [],
  columns: [],
  count: null,
  pdfURL: null,
  excelURL: null,
  externalVehicle: null
};

interface pdfExcel {
  isLoading: boolean;
  data: any;
  error: string | null;
}
const pdfExcelState: pdfExcel = {
  isLoading: false,
  data: null,
  error: null
};

const deviceState: DevicestateProps = {
  isLoading: false,
  deviceList: [],
  error: null
};

//action for external vehicle report
export const getExternalVehicleReport = createAsyncThunk<any, any>(
  'externalvehicle',
  async (data, thunkApi) => {
    const { startDate, endDate, pageno, pagesize, toast } = data;
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `${URLs.EXTERNAL_VEHICLE_REPORT}fromEpoch=${startDate}&toEpoch=${endDate}&pageNo=${pageno}&pageSize=${pagesize}`
      });
      if (response?.data?.data?.vehicleDetails?.length > 0 && toast) {
        thunkApi.dispatch(
          updateToast({
            show: true,
            message: 'External Vehicle Report generated successfully',
            severity: 'success'
          })
        );
      } else {
        thunkApi.dispatch(
          updateToast({
            show: true,
            message: 'No reports found',
            severity: 'warning'
          })
        );
      }
      return response;
    } catch (err: any) {
      if (err?.message !== 'canceled') {
        thunkApi.dispatch(
          updateToast({
            show: true,
            message: err.response?.data?.message,
            severity: 'error'
          })
        );
      }
      return thunkApi.rejectWithValue(err);
    }
  }
);
const reportDialogAction = createSlice({
  name: 'report/dialog',
  initialState: {
    isShowMap: false,
    Polyline: {},
    Waypoints: [],
    externalVehicle: null
  },
  reducers: {
    updateIsShowMap: (state, action) => {
      state.isShowMap = action.payload;
    },
    updatePolyline: (state, action) => {
      state.Polyline = action.payload;
    },
    updateWaypoints: (state, action) => {
      state.Waypoints = action.payload;
    },
    setExternalVehicle: (state: any, action) => {
      state.externalVehicle = action.payload;
    }
  }
});

//reducer for external vehicle report
export const externalVehicleReportSlice = createSlice({
  name: 'externalVehicle',
  initialState: reportState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getExternalVehicleReport.pending, state => {
        state.isLoading = true;
        state.rows = [];
        state.columns = [];
      })
      .addCase(getExternalVehicleReport.fulfilled, (state, action) => {
        state.isLoading = false;
        const {
          data: {
            data: { vehicleDetails, vehicleCount, timezone }
          }
        } = action.payload;
        if (vehicleDetails?.length > 0) {
          state.rows = vehicleDetails?.map((item: any, index: number) => ({
            ...item,
            id: index + 1,
            date: epochToDateFormatSg(item?.epochDate, timezone),
            vehicleNumber: item.vehicleNumber.toUpperCase(),
            noOfTrips: item?.tourDetails?.length,
            type: 'externalVehicle'
          }));
        }
        state.count = vehicleCount;
        state.columns = externalVehicleColumns;
      })
      .addCase(getExternalVehicleReport.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.message ?? 'Something went wrong';
      });
  }
});

//action for autoplanner reports  pdf and excel
export const getAutoplannerPDFExcel = createAsyncThunk<any, any>(
  'pdfExcel',
  async (data, thunkApi) => {
    const { startDate, endDate, report, mail, format } = data;
    let URL = `${URLs.AUTOPLANNER_PDF_EXCEL}fromEpoch=${startDate}&toEpoch=${endDate}&reportType=${format}&report=${report}`;
    if (mail) {
      URL += `&email=${mail}`;
    }
    try {
      const response = await axiosInstance({ method: 'GET', url: URL });
      if (response?.data?.data && !mail) {
        thunkApi.dispatch(
          updateToast({
            show: true,
            message: `${format === 'pdf' ? 'PDF' : 'Excel'} Downloaded successfully`,
            severity: 'success'
          })
        );
      } else if (mail) {
        thunkApi.dispatch(
          updateToast({
            show: true,
            message: response?.data?.message,
            severity: 'success'
          })
        );
      }
      return response;
    } catch (err: any) {
      thunkApi.dispatch(
        updateToast({
          show: true,
          message: err?.response?.data?.message,
          severity: 'error'
        })
      );
      return thunkApi.rejectWithValue(err);
    }
  }
);

//reducer for autoplanner reports pdf and excel
const getAutoplannerPDFExcelSlice = createSlice({
  name: 'pdfExcel',
  initialState: pdfExcelState,
  reducers: {
    clearReportURLS: state => {
      state.data = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getAutoplannerPDFExcel.pending, (state, action: any) => {
        state.isLoading = true;
        state.data = null;
      })
      .addCase(getAutoplannerPDFExcel.fulfilled, (state, action: any) => {
        state.isLoading = false;
        const {
          data: { data }
        } = action.payload;
        state.data = data;
      })
      .addCase(getAutoplannerPDFExcel.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.response?.data?.message ?? 'Something went wrong';
      });
  }
});

export const externalVehicleReportData = externalVehicleReportSlice.reducer;
export const autoplannerReportsPDFExcelData = getAutoplannerPDFExcelSlice.reducer;
export const { clearReportURLS } = getAutoplannerPDFExcelSlice.actions;
export const reportDialog = reportDialogAction.reducer;
export const { updateIsShowMap, updatePolyline, updateWaypoints, setExternalVehicle } =
  reportDialogAction.actions;
