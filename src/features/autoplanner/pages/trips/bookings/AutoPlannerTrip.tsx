import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  Zoom,
  Grid,
  Badge,
  Alert,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  DialogActions,
} from "@mui/material";
import { Icon } from "@iconify/react";
import AddTrip from "./components/AddTrip";
import { useAppDispatch, useAppSelector } from "../../../../../app/redux/hooks";
import constant from "../../../../../utils/constants";
import {
  capitalizeFirstLetter,
  convertDatetoEpoch,
  convertSecondsToTimes,
  convertToEpoch4,
  convertToEpochWithTimezone,
  epochToDateFormatSg,
  getEpochToDate,
  getTomorrowEpoch,
  useAbort,
} from "../../../../../utils/commonFunctions";
import CustomButton from "../../../../../common/components/buttons/CustomButton";
import CustomDialog from "../../../../../common/components/customdialog/CustomDialog";
import ExcelIcon from "../../../assets/images/excel.png";
import { useForm } from "react-hook-form";
import CustomSelect from "../../../../../common/components/customized/customselect/CustomSelect";
import dayjs from "dayjs";
import demofile from "../../../assets/files/sampleInput.xlsx";
import CustomDateCalendar from "../../../../../common/components/customized/customcalendar/CustomCalendar";
import * as XLSX from "xlsx";
import CustomDialogGrid from "../../../../../common/components/customdialogGrid/CustomDialogGrid";
import BookingSic from "./components/BookingSic";
import BookingTsic from "./components/BookingTsic";
import BookingGrp from "./components/BookingGrp";
import BookingPvt from "./components/BookingPvt";
import CustomTab from "../../../../../common/components/tab/CustomTab";
import CustomTextField from "../../../../../common/components/customized/customtextfield/CustomTextField";
import NewMainPickup from "./components/NewMainPickup";
import ErrorDialog from "./components/ErrorDialog";
import {
  updateData,
  createConnection,
} from "../../../../../common/redux/reducer/commonSlices/websocketSlice";
import {
  autoPlannerAgentAction,
  autoPlannerDeleteAction,
  autoPlannerImportTripsAction,
  autoPlannerRoutesAction,
  autoPlannerTripsAction,
  clearNewPickup,
  GetGrpBookings,
} from "../../../redux/reducer/autoPlannerSlices/autoplanner";
import { updateToast } from "../../../../../common/redux/reducer/commonSlices/toastSlice";
import { getMyProfileAction } from "../../../../../common/redux/reducer/commonSlices/myProfileSlice";
import "./AutoPlannerTrip.scss";
import {
  asyncSuccessAction,
  clearAsyncSuccess,
} from "../../../redux/reducer/autoPlannerSlices/tourSummary";
import BookingRLR from "./components/BookingRLR";
import BookingAll from "./components/BookingAll";
import ConfirmationPopup from "../../../../../common/components/confirmationpopup/ConfirmationPopup";
import BookingDeadlineConfig from "../../configurations/locations/TimeConfiguration/TimeConfig";
import { Apartment } from "@mui/icons-material";
import { gettimeConfiguration } from "../../../redux/reducer/autoPlannerSlices/autoplannerConfigurationSlice";
import { AlertCircle } from "lucide-react";

const AutoPlannerTrip = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [isDialog, setIsDialog] = useState("");
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(20);
  const [pageNo, setPageNo] = useState(1);
  const [isTime, setIsTime] = useState<boolean>(false);

  const [filteerCount, setFilteerCount] = useState(0);
  const [importFile, setImportFile] = useState<any>(null);
  const [openConnectionError, setOpenConnectionError] =
    useState<boolean>(false);
  const [triggerCount, setTriggerCount] = useState<number>(0);
  const [importFilePickup, setImportFilePickup] = useState<any>(null);
  const [errorShow, setErrorShow] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [sortModel, setSortModel] = useState<any>([]);
  const [excelData, setExcelData] = useState<any>(null);
  const [alertClose, setAlertClose] = useState<boolean>(false);
  const [viewDialogGrid, setViewDialogGrid] = useState<boolean>(false);
  const [importButtonDisable, setImportButtonDisable] = useState<boolean>(true);
  const [jsonDATA, setJsonData] = useState<any | []>([]);
  const [breadcrumbs, setBreadCrumbs] = useState<any>({});
  const [excelRows, setExcelRows] = useState<[] | any>([]);
  const [INexcelRows, setINExcelRows] = useState<[] | any>([]);
  const [isHover, setIsHover] = useState(false);
  const [agent, setAgent] = useState("");
  const [filterPayload, setFilterPayload] = useState<any>("");
  const [bookingDate, setBookingDate] = useState<any>(0);
  const [tomorrow, setTomorrow] = useState<any>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [callAsync, setCallAsync] = useState(false);

  const [filters, setFilters] = useState<any>({});

  const abortController = useRef<any>(null);
  const dispatch = useAppDispatch();
  const createAbort = useAbort();

  const error: any = useAppSelector(
    (state) => state.importAutoPlannerTrip.data || [{ invalidExcelRows: [] }]
  );

  const tripsData = useAppSelector((state) => state.AutoPlannerTrip);
  const deleteTrip = useAppSelector((state) => state.AutoPlannerDeleteTrip);
  const Agents = useAppSelector((state) => state.autoPlannerAgent.data || []);
  const Routes = useAppSelector((state) => state.autoPlannerRoutes.data || []);
  const { isLoading } = useAppSelector((state) => state.importAutoPlannerTrip);
  const { data } = useAppSelector((state) => state.auth);
  const { connection, data: excelLoader } = useAppSelector(
    (state) => state.websocket
  );
  const profile = useAppSelector((state) => state.myProfile.data);
  const {
    isLoading: asynSuccessLoading,
    data: asyncSuccessData,
    error: asyncSuccessError,
  } = useAppSelector((state) => state.asyncSuccess);
  const Timedata = useAppSelector((state: any) => state.ConfiguredTime.data);

  const cutoffTime = Timedata?.data?.cutoffTime;

  const { updatedTime } = convertSecondsToTimes(cutoffTime);

  let roletype = data?.role;
  const APadmin = roletype === "ROLE_AUTOPLANNER_ADMIN";
  const APoperator = roletype === "ROLE_OPERATOR";
  const APagent = roletype === "ROLE_AGENT";
  const APsubAgents = roletype === "ROLE_SUB_AGENT";

  const [tripMode, setTripMode] = useState<string>(
    APagent || APsubAgents ? "ALL" : "SIC"
  );
  const [tripPayload, setTripPayload] = useState({
    pageNo,
    pageSize,
    autoplannerID: 0,
    isAll: APagent || APsubAgents,
  });

  const {
    control,
    setValue,
    clearErrors,
    getValues,
    reset,
    watch,
    handleSubmit,
  } = useForm({});

  const formatDate = (date: string | null) => {
    return date ? dayjs(date).format("DD/MM/YYYY") : "";
  };

  const handleClose = () => {
    setIsDialog("");
    dispatch(
      updateData({ progress: "FAILED", date: "Loading", action: "ExcelUpload" })
    );
    if (connection) connection.close();
  };

  const handleDeleteTrip = () => {
    if (selectedRow) {
      const payload = {
        selectedRow: selectedRow,
        pageDetails: { pageNo, pageSize },
        APagent,
        APsubAgenta: APsubAgents,
      };
      dispatch(autoPlannerDeleteAction(payload));
    }
  };

  const handleViewClose = () => {
    setViewOpen(false);
  };

  const handleDialogGridClose = () => {
    setViewDialogGrid(false);
  };

  // function for import bulk trip file
  const handleImportFile = () => {
    setIsDialog("Import");
    setImportFile(null);
    setOpenConnectionError(false);
    dispatch(clearAsyncSuccess());
    setCallAsync(false);
  };

  const handleRemoveUploadedFile = () => {
    setImportFile(null);
    setExcelRows([]);
    setImportButtonDisable(true);
    setErrorShow(false);
  };

  const handleCancel = () => {};

  const clearTripDateFilter = () => {
    reset({
      tripDate: "",
    });
    setValue("tripDate", undefined);
    setBookingDate(null);
  };

  const clearFilter = () => {
    reset({
      agentname: "",
      route: "",
      triptype: "",
      guestName: "",
      source: "",
      destination: "",
      tripDate: "",
      mode: "",
    });
    setBookingDate(null);
    setValue("tripDate", undefined);
    const payload = {
      ...tripPayload,
      pageNo: 1,
      pageSize: pageSize,
      autoplannerID: tomorrow,
      agentname: "",
      route: "",
      triptype: "",
      guestName: "",
      source: "",
      destination: "",
      tripDate: "",
      mode: "",
    };
    const filterClear = {
      agentname: "",
      route: "",
      triptype: "",
      guestName: "",
      source: "",
      destination: "",
      tripDate: "",
      mode: "",
    };
    setFilterPayload(filterClear);
    setTripPayload((prev: any) => ({
      ...prev,
      pageNo: 1,
      pageSize: pageSize,
      autoplannerID: tomorrow,
      agentname: "",
      route: "",
      triptype: "",
      guestName: "",
      source: "",
      destination: "",
      tripDate: "",
      mode: "",
    }));

    if (filters.clearFilters) {
      const { clearFilters, ...rest } = filters;
      clearFilters({ ...payload, ...rest });
    }
    setPageNo(1);
    setErrorMessage("");
    setFilteerCount(0);
    breadcrumbs.setViews(false);
    breadcrumbs.setPageNo(1);
    breadcrumbs.setPageSize(pageSize);
  };

  const configuredRoute = Routes?.map((value: any) => ({
    id: value.tourName,
    label: value.tourName,
    is: value.isTimeRequired,
  }));

  const agentNames =
    Agents?.map((value: string) => ({
      id: value,
      label: capitalizeFirstLetter(value),
    })) || [];

  const watchedFields = watch([
    "agentname",
    "route",
    "triptype",
    "tripDate",
    "guestName",
    "source",
    "destination",
    "mode",
  ]);

  useEffect(() => {
    const {
      agentname,
      route,
      triptype,
      tripDate,
      destination,
      source,
      guestName,
      mode,
    } = getValues();
    const tripDateObject = dayjs(tripDate, "DD/MM/YYYY");
    const now = dayjs();

    const isFuture = tripDate ? tripDateObject >= now : true;

    if (
      (agentname ||
        route ||
        triptype ||
        tripDate ||
        destination ||
        source ||
        guestName ||
        mode) &&
      isFuture
    ) {
      setErrorMessage("");
    }
  }, [watchedFields, getValues]);

  const onSubmit = async (data: any) => {
    const tripDateObject = dayjs(data?.tripDate, "DD/MM/YYYY");
    const now = dayjs().hour(0).minute(0).second(0).millisecond(0);
    const isFuture = data.tripDate ? tripDateObject >= now : true;

    const filter = {
      ...data,
      autoplannerID: data.tripDate
        ? profile?.timezone !== "UTC" &&
          convertToEpoch4(data.tripDate, profile?.timezone)
        : tripPayload.autoplannerID,
    };

    const payload = {
      ...tripPayload,
      pageNo: 1,
      pageSize,
      ...filter,
    };
    const {
      agentname,
      route,
      triptype,
      tripDate,
      destination,
      source,
      guestName,
      mode,
    } = getValues();

    const values = getValues();

    setFilterPayload(values);

    const filledFieldsCount = Object.values(values).filter(
      (value) => value !== undefined && value !== null && value !== ""
    ).length;

    setFilteerCount(filledFieldsCount);

    if (
      ![agentname, route, triptype, tripDate, source, guestName, mode]?.some(
        Boolean
      )
    ) {
      setErrorMessage("Please fill at least one field!");
      return;
    } else {
      if (isFuture) {
        setErrorMessage("");
        setTripPayload(payload);
        if (filters.submitFilters) {
          const { submitFilters } = filters;
          submitFilters(payload);
        }
        breadcrumbs.setViews(false);
        breadcrumbs.setPageNo(1);
        breadcrumbs.setPageSize(pageSize);
      } else {
        setErrorMessage("Select valid date");
      }
    }
    // setErrorMessage('');
  };

  const handleToggle = () => {
    setExpanded(!expanded);
    const signal = createAbort().abortCall.signal;
    dispatch(autoPlannerRoutesAction({ signal: signal, mode: tripMode }));
  };

  const filterClear = () => {
    if (expanded) clearFilter();
    setFilteerCount(0);
  };

  const handleCloseReupload = () => {
    dispatch(clearNewPickup());
  };

  const handleReupload = async () => {
    if (importFile !== null) {
      const invalidRows = excelRows.map((items: any) => items.sno);
      setErrorShow(false);
      const action = await dispatch(
        autoPlannerImportTripsAction({
          file: importFile,
          invalidRows,
          isReUpload: 0,
          skipDuplicate: 1,
        })
      );
      if (action.type === autoPlannerImportTripsAction.rejected.type) {
        dispatch(
          updateData({
            progress: "FAILED",
            date: "Loading",
            action: "ExcelUpload",
          })
        );
        if (connection) connection.close();
      } else {
        dispatch(
          updateData({ progress: 0, date: "Loading", action: "ExcelUpload" })
        );
        setAlertClose(true);
      }
      setImportFilePickup(importFile);
      if (!isLoading) {
        handleCloseImport();
        setImportButtonDisable(true);
      }
    } else setErrorShow(true);
    if (error) {
      setIsDialog("Error");
    }
    if (connection !== null) connection.close();
    dispatch(createConnection(""));
    setTriggerCount(0);
  };

  // funtion for import trips
  const handleUpload = () => {
    const inputElement = document.createElement("input");
    inputElement.type = "file";
    inputElement.accept = ".xlsx,.xls";
    inputElement.onchange = (event: any) => {
      const file = event.target.files[0];

      if (!file) return;
      const allowedExtensions = ["xlsx", "xls"];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        dispatch(
          updateToast({
            show: true,
            message: "Please upload a valid Excel file (.xlsx or .xls)",
            severity: "warning",
          })
        );
        setImportFile(null);
        return;
      }
      const fileReader = new FileReader();
      fileReader.onload = (event: any) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let originalObj: any = {};

        for (const keys in sheet) {
          originalObj[`${keys}`] =
            keys === "!margins" || keys === "!ref"
              ? sheet[keys]
              : { ...sheet[keys], v: sheet[keys].w };
        }
        if (originalObj) {
          const jsonData = XLSX.utils.sheet_to_json(originalObj, { header: 1 });
          setExcelData(jsonData);
        }
      };

      fileReader.readAsArrayBuffer(file);
      setImportFile(file);
    };

    inputElement.click();
  };

  const invalidRows = INexcelRows.map((items: any) => items.sno);

  const handleImportfile = async () => {
    if (importFile !== null) {
      const invalidRows = excelRows.map((items: any) => items.sno);
      setErrorShow(false);
      const action = await dispatch(
        autoPlannerImportTripsAction({
          file: importFile,
          invalidRows,
          isReUpload: 0,
        })
      );
      if (action.type === autoPlannerImportTripsAction.rejected.type) {
        dispatch(
          updateData({
            progress: "FAILED",
            date: "Loading",
            action: "ExcelUpload",
          })
        );
        if (connection) connection.close();
      } else {
        dispatch(
          updateData({ progress: 0, date: "Loading", action: "ExcelUpload" })
        );
        setAlertClose(true);
      }
      setImportFilePickup(importFile);
      if (!isLoading) {
        handleCloseImport();
        setImportButtonDisable(true);
      }
    } else setErrorShow(true);
    if (error) {
      setIsDialog("Error");
    }
    if (connection !== null) connection.close();
    dispatch(createConnection(""));
    setTriggerCount(0);
  };

  const handleCloseImport = () => {
    if (!isLoading) {
      setIsDialog("");

      setExcelRows([]);
      setErrorShow(false);
    }
  };

  useEffect(() => {
    if (connection) {
      connection.onopen = () => {};
      connection.onmessage = (e: any) => {
        dispatch(updateData(JSON.parse(e?.data)));
        const value = JSON.parse(e?.data)?.progress;
        if (
          value === "SAVED" &&
          JSON.parse(e?.data)?.action === "ExcelUpload"
        ) {
          setAlertClose(false);
          const signal = createAbort().abortCall.signal;
          const payload = {
            ...tripPayload,
            tripMode: tripMode,
            signal: signal,
          };
          if (tripMode !== "PVT" && tripMode !== "GRP") {
            dispatch(autoPlannerTripsAction(payload));
          } else {
            dispatch(GetGrpBookings(payload));
          }
        }
      };

      connection.onclose = () => {};
    }
  }, [connection]);

  useEffect(() => {
    if (excelData?.length > 1) {
      const allowedHeaders = new Set([
        "date",
        "time",
        "agent",
        "tour",
        "ref no",
        "guest",
        "guest contact number",
        "adult",
        "child",
        "from",
        "to",
      ]);
      const headers = excelData[0].map((header: string) =>
        header ? header?.toLowerCase()?.trim() : ""
      );

      const invalidHeaderRegex = /[^a-z\s]/i;

      const emptyHeader = headers.findIndex(
        (_: any, index: any) => !(index in headers)
      );

      if (emptyHeader !== -1) {
        setImportFile(null);
        dispatch(
          updateToast({
            show: true,
            message:
              "Empty header names found. Please check the Header row of the Excel file.",
            severity: "warning",
          })
        );
        return;
      }

      const invalidHeaders = headers.filter(
        (header: any) =>
          !allowedHeaders.has(header) || invalidHeaderRegex.test(header)
      );

      if (invalidHeaders.length > 0) {
        dispatch(
          updateToast({
            show: true,
            message: `Invalid header names found: ${invalidHeaders.join(", ")}`,
            severity: "warning",
          })
        );
        return;
      }

      const excelJSON = excelData
        .slice(1)
        .filter((row: any) =>
          row.some((value: any) => value !== undefined && value !== "")
        )
        .map((row: any, index: number) => {
          const rowObject = headers.reduce(
            (acc: any, header: string, colIndex: number) => {
              acc[header] = row[colIndex];
              return acc;
            },
            {}
          );

          return {
            id: index + 1,
            sno: index + 2,
            date: rowObject["date"],
            time: rowObject["time"],
            agent: rowObject["agent"],
            tour: rowObject["tour"],
            refNo: rowObject["refno"],
            guest: isNaN(rowObject["guest"])
              ? rowObject["guest"]
              : Number(rowObject["guest"]),
            guestcontactnumber: rowObject["guest contact number"]
              ? rowObject["guest contact number"]
              : null,
            adult: /^\d+$/.test(rowObject["adult"])
              ? Number(rowObject["adult"])
              : rowObject["adult"],
            child: /^\d+$/.test(rowObject["child"])
              ? Number(rowObject["child"])
              : rowObject["child"],
            source: isNaN(rowObject["from"])
              ? rowObject["from"]
              : Number(rowObject["from"]),
            destination: isNaN(rowObject["to"])
              ? rowObject["to"]
              : Number(rowObject["to"]),
          };
        });

      setJsonData(excelJSON);

      let filteredData = excelJSON.filter(
        ({
          sno,
          date,
          time,
          refNo,
          guest,
          source,
          destination,
          tour,
          agent,
          child,
          guestcontactnumber,
          adult,
        }: any) => {
          let regex =
            /^(0?[1-9]|[12][0-9]|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{2}$|^(0?[1-9]|[12][0-9]|3[01])-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}$/;
          let tomorrowDate = getTomorrowEpoch(profile?.timezone);
          let sheetDate = !regex.test(date)
            ? convertToEpochWithTimezone("01-Jan-1970", profile?.timezone)
            : convertToEpochWithTimezone(date, profile?.timezone);

          if (
            [
              typeof sno,
              typeof date,
              typeof time,
              typeof refNo,
              typeof tour,
              typeof guest,
              typeof source,
              typeof destination,
              typeof refNo,
              typeof guestcontactnumber,
              typeof agent,
            ].every((item) => item !== "string")
          ) {
            return true;
          } else if (!["PVT", "SIC", "GRP", "TSIC"].includes(tour?.trim())) {
            return true;
          } else if (child && typeof child !== "number") {
            return true;
          } else if (
            [
              sno,
              date,
              time,
              guest,
              source,
              destination,
              tour,
              agent,
              adult,
            ].includes(undefined)
          ) {
            return true;
          } else if (typeof adult !== "number") {
            return true;
          } else if (
            !/^(0?[1-9]|[12][0-9]|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{2}$|^(0?[1-9]|[12][0-9]|3[01])-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}$/.test(
              date
            )
          ) {
            return true;
          } else if (
            !/((1[0-2]|0?[1-9])(:([0-5][0-9])) ?([AaPp][Mm])$)/.test(time)
          ) {
            return true;
          } else if (sheetDate < tomorrowDate) {
            return true;
          } else if (
            [agent, guest, source, destination].some((item) => !isNaN(item))
          ) {
            return true;
          } else if (
            !(
              [
                ...(new Map(
                  excelJSON.map((item: any) => [item["date"], item])
                ).values() as any),
              ].length <= 1
            )
          ) {
            return true;
          } else return false;
        }
      );

      setExcelRows(filteredData);
      setINExcelRows(filteredData);
      filteredData?.length === 0 && setImportButtonDisable(false);
      setViewDialogGrid(true);
    }
  }, [excelData, profile?.timezone]);

  const handleViewOpen = () => {
    setViewDialogGrid(false);
    setImportButtonDisable(false);
  };

  const tourModes = [
    { id: "PVT", label: "PVT" },
    { id: "SIC", label: "SIC" },
    { id: "TSIC", label: "TSIC" },
    { id: "GRP", label: "GRP" },
  ];

  const handleTrip = async (e: any, newValue: any) => {
    setTabValue(newValue);
    setFilters({});
    switch (newValue) {
      case 0:
        setTripMode("SIC");
        break;
      case 1:
        setTripMode("TSIC");
        break;
      case 2:
        setTripMode("PVT");
        break;
      case 3:
        setTripMode("GRP");
        break;
      case 4:
        setTripMode("RLR");
        break;
      default:
        break;
    }
    createAbort().abortCall.abort();
    setPageNo(1);
    setPageSize(20);
  };

  let tripList = ["SIC", "TSIC", "PVT", "GRP", "RLR"];

  const handleAddTrip = () => {
    setIsOpen(true);
    setSelectedRow(null);
    setExpanded(false);
    setFilters({});
    clearFilter();
  };
  let excelColumns = [
    {
      field: "sno",
      headerName: "Row No",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "date",
      headerName: "Date",
      minWidth: 150,
      flex: 1,
      description:
        [
          ...(new Map(
            jsonDATA.map((item: any) => [item["date"], item])
          ).values() as any),
        ].length > 1
          ? "Date must be common for all trips"
          : "",
      renderCell: (params: any) => params.value,

      headerClassName: (params: any) => {
        let newArr = [
          ...(new Map(
            jsonDATA.map((item: any) => [item["date"], item])
          ).values() as any),
        ];
        if (!(newArr.length <= 1)) {
          return "super-app-theme--header";
        }
      },
      cellClassName: (params: any) => {
        let regex =
          /^(0?[1-9]|[12][0-9]|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{2}$|^(0?[1-9]|[12][0-9]|3[01])-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}$/;
        let tomorrowDate = getTomorrowEpoch(profile?.timezone);
        let sheetDate = !regex.test(params.value)
          ? convertToEpochWithTimezone("01-Jan-1970", profile?.timezone)
          : convertToEpochWithTimezone(params.value, profile?.timezone);
        let newArr = [
          ...(new Map(
            jsonDATA.map((item: any) => [item["date"], item])
          ).values() as any),
        ];
        if (!regex.test(params.value)) {
          return "super-app-theme--cell";
        } else if (sheetDate < tomorrowDate) {
          return "super-app-theme--cell";
        }
      },
    },
    {
      field: "time",
      headerName: "Time",
      minWidth: 150,
      flex: 1,
      cellClassName: (params: any) => {
        let regex = /((1[0-2]|0?[1-9])(:([0-5][0-9])) ?([AaPp][Mm])$)/;
        if (!regex.test(params.value)) return "super-app-theme--cell";
      },
    },
    {
      field: "agent",
      headerName: "Agent",
      minWidth: 150,
      flex: 1,
      cellClassName: (params: any) => {
        if (!params.value || !isNaN(params.value))
          return "super-app-theme--cell";
      },
    },
    {
      field: "tour",
      headerName: "Tour",
      minWidth: 150,
      flex: 1,
      cellClassName: (params: any) => {
        if (
          !["PVT", "SIC", "TSIC", "GRP"].includes(params.value) ||
          !params.value
        )
          return "super-app-theme--cell";
      },
    },
    {
      field: "refNo",
      headerName: "Ref No .",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "guest",
      headerName: "Guest",
      minWidth: 150,
      flex: 1,
      cellClassName: (params: any) => {
        if (!params.value) {
          return "super-app-theme--cell";
        } else if (typeof params.value !== "string") {
          return "super-app-theme--cell";
        }
      },
    },
    {
      field: "guestcontactnumber",
      headerName: "Guest Contact Number",
      minWidth: 200,
      flex: 1,
      cellClassName: (params: any) => {
        let regex = /^\+\d{1,3}\s\d{8,12}$/;
        if (params.value && !regex.test(params.value)) {
          return "super-app-theme--cell";
        }
      },
    },
    {
      field: "adult",
      headerName: "Adult",
      minWidth: 150,
      flex: 1,
      cellClassName: (params: any) => {
        if (typeof params.value !== "number" || !params.value)
          return "super-app-theme--cell";
      },
    },
    {
      field: "child",
      headerName: "Child",
      minWidth: 150,
      flex: 1,
      cellClassName: (params: any) => {
        if (params.value && typeof params.value !== "number")
          return "super-app-theme--cell";
      },
    },
    {
      field: "source",
      headerName: "Source",
      minWidth: 150,
      flex: 1,
      cellClassName: (params: any) => {
        if (!params.value || typeof params.value !== "string")
          return "super-app-theme--cell";
      },
    },
    {
      field: "destination",
      headerName: "Destination",
      minWidth: 150,
      flex: 1,
      cellClassName: (params: any) => {
        if (!params.value || typeof params.value !== "string")
          return "super-app-theme--cell";
      },
    },
  ];

  const handleShowWait = () => {
    dispatch(
      updateData({ progress: 0, date: "Please wait", action: "ExcelUpload" })
    );
    setTimeout(() => {
      dispatch(
        updateData({ progress: 0, date: "Loading", action: "ExcelUpload" })
      );
    }, 5000);
  };

  useEffect(() => {
    if (tripsData?.data?.data !== null && tripsData?.data?.data?.groupedTrips) {
      setRows(tripsData.data.data.groupedTrips);
    }
  }, [tripsData?.data]);

  useEffect(() => {
    if (sortModel.length > 0) {
      const payload = {
        ...tripPayload,
        pageNo: 1,
        pageSize: pageSize,
        sortByField: sortModel[0].field,
        sortBy: sortModel[0].sort,
      };
      setPageNo(1);
      setTripPayload(payload);
    }
  }, [sortModel]);

  useEffect(() => {
    if (
      excelLoader?.action === "ExcelUpload" &&
      !isNaN(excelLoader?.progress)
    ) {
      setUploading(true);
    } else if (isNaN(excelLoader?.progress)) {
      setUploading(false);
      if (connection) connection.close();
    }
  }, [excelLoader]);

  useEffect(() => {
    if (
      asyncSuccessData &&
      asyncSuccessData.action === "CommenceJobSheetProcessingEvent" &&
      asyncSuccessData?.progress !== "100"
    ) {
      setUploading(true);
    } else if (asyncSuccessData?.progress === "100" || asyncSuccessError) {
      setUploading(false);
    }
  }, [asyncSuccessData, asyncSuccessError]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (!isLoading && connection && alertClose) {
      if (
        !isNaN(parseFloat(excelLoader?.progress)) ||
        (parseFloat(excelLoader?.progress) === 0 &&
          excelLoader?.progress !== "SAVED" &&
          excelLoader?.action === "ExcelUpload")
      ) {
        intervalId = setInterval(() => {
          if (triggerCount < 3) {
            if (connection) connection.close();
            dispatch(createConnection(""));
            handleShowWait();
            setTriggerCount(triggerCount + 1);
          } else if (alertClose) {
            if (connection) connection.close();
            setCallAsync(true);
            // dispatch(asyncSuccessAction('CommenceJobSheetProcessingEvent'));
            // setOpenConnectionError(true);
            // dispatch(
            //   updateData({
            //     progress: 'FAILED',
            //     action: 'ExcelUpload'
            //   })
            // );
            // setAlertClose(false);
            if (intervalId) clearInterval(intervalId);
          }
        }, 20000);
      }
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [connection, triggerCount, isLoading, excelLoader, alertClose]);

  useEffect(() => {
    let interval: any;
    if (callAsync) {
      interval = setInterval(async () => {
        if (
          !asynSuccessLoading &&
          asyncSuccessData?.progress !== "100" &&
          !asyncSuccessError
        ) {
          await dispatch(asyncSuccessAction("CommenceJobSheetProcessingEvent"));
        } else if (callAsync && asyncSuccessError) {
          setOpenConnectionError(true);
          setAlertClose(false);
        }
      }, 2000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [callAsync, asyncSuccessError, asynSuccessLoading, asynSuccessLoading]);

  // useEffect(() => {
  //   const signal = createAbort().abortCall.signal;
  //   dispatch(getMyProfileAction(signal));
  //   dispatch(autoPlannerAgentAction(signal));

  //   return () => {
  //     if (abortController.current) abortController.current.abort();
  //     dispatch(clearNewPickup());
  //   };
  // }, []);

  useEffect(() => {
    if (profile?.timezone) {
      const tomorrowEpoch = getTomorrowEpoch(profile?.timezone);
      setTripPayload({ ...tripPayload, autoplannerID: tomorrowEpoch });
      setTomorrow(tomorrowEpoch);
    }
  }, [profile?.timezone]);

  useEffect(() => {
    dispatch(gettimeConfiguration());
    const abortController = createAbort().abortCall;
    dispatch(autoPlannerAgentAction(abortController?.signal));

    return () => {
      dispatch(clearNewPickup());
    };
  }, []);

  return (
    <Box>
      {!expanded && !breadcrumbs.views && (
        <Tooltip
          title="Filter"
          placement="right"
          arrow
          TransitionProps={{ timeout: 200 }}
          TransitionComponent={Zoom}
          sx={{ position: "absolute" }}
        >
          <IconButton
            onClick={handleToggle}
            className="filter-icon"
            sx={{
              marginTop: APagent || APsubAgents ? "0 !important" : "20px",
              marginRight: APagent || APsubAgents ? "0 !important" : "20px",
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 1,
            }}
          >
            <Badge badgeContent={filteerCount} color="primary">
              <Icon icon="mage:filter" />
            </Badge>
          </IconButton>
        </Tooltip>
      )}
      <Box className="auto-planner-tour-container">
        <Grid container>
          <Grid item lg={expanded ? 9 : 12}>
            <Box className="auto-planner-trip-container">
              <Box
                className="filter-bar-component"
                sx={{
                  width: { xs: "100%", lg: " calc(100% - 500px)" },
                  marginTop: APadmin || APoperator ? "10px" : "0",
                }}
              ></Box>

              {!APagent && !APsubAgents && (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    marginTop: "10px",
                    marginRight: expanded ? "320px" : "20px",
                  }}
                >
                  <Icon
                    icon="lets-icons:date-today-duotone"
                    width="18"
                    height="18"
                    style={{ color: "blue", marginRight: "5px" }}
                  />
                  <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>
                    {!tripPayload.autoplannerID
                      ? "Loading..."
                      : getEpochToDate(
                          tripPayload.autoplannerID,
                          profile?.timezone
                        )}
                  </Typography>
                </Box>
              )}

              {(APagent || APsubAgents) && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "left",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Typography sx={{ fontSize: "20px", fontWeight: 600 }}>
                    Bookings
                  </Typography>
                  <Box sx={{ mt: 0.5, mb: 1, mx: 1, width: "70%" }}>
                    <Alert
                      severity="warning"
                      sx={{
                        borderRadius: 2,
                        py: 0.5,
                        px: 1.5,
                        fontSize: "13px",
                        "& .MuiAlert-message": {
                          fontSize: "13px",
                          lineHeight: 1.4,
                        },
                        "& b": { fontSize: "13px" },
                      }}
                    >
                      Please note, the cut-off time for adding tomorrow’s
                      booking is <b>{cutoffTime ? updatedTime : "00:00"}</b>.
                      Kindly ensure all entries are completed before this time.
                    </Alert>
                  </Box>
                </Box>
              )}
              <Box
                className="d-flex"
                sx={{
                  marginBottom: APagent || APsubAgents ? "20px" : "0",
                }}
              >
                {/* <CustomBreadcrumbs
              className='tracking-heading'
              itemOne={'Tour'}
              itemTwo={'Bookings'}
              itemTwoState={view}
              setView={setView}
              handleItemOneClick={() => {
                if (view) dispatch(autoPlannerTripsAction(tripPayload));
              }}
            /> */}

                {(APagent || APsubAgents) && (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      marginTop: "10px",
                      marginRight: expanded ? "320px" : "20px",
                    }}
                  >
                    <Icon
                      icon="lets-icons:date-today-duotone"
                      width="18"
                      height="18"
                      style={{ color: "blue", marginRight: "5px" }}
                    />
                    <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>
                      {!tripPayload.autoplannerID
                        ? "Loading..."
                        : getEpochToDate(
                            tripPayload.autoplannerID,
                            profile?.timezone
                          )}
                    </Typography>
                  </Box>
                )}
                {/* {(APagent || APsubAgents) && (
                  <Box sx={{ my: 2, width: '50%' }}>
                    <Alert severity='info' sx={{ borderRadius: 2 }}>
                      Cut-off for tomorrow’s booking:{' '}
                      <b>{cutoffTime ? updatedTime : '00:00'}</b>. Complete all entries
                      before then.
                    </Alert>
                  </Box>
                )} */}

                {!APagent && !APsubAgents ? (
                  <Box
                    sx={{
                      padding: "20px",
                      overflowX: "auto",
                      maxWidth: "100%",
                    }}
                  >
                    <CustomTab
                      onChange={handleTrip}
                      value={tabValue}
                      tabList={tripList}
                    />
                  </Box>
                ) : (
                  ""
                )}

                <Box
                  display={"flex"}
                  gap={1}
                  className="button-group-trip"
                  sx={{
                    marginRight:
                      (APagent || APsubAgents) && !expanded ? "35px" : "0px  ",
                    justifyContent: "flex-end",
                  }}
                >
                  {error?.invalidExcelRows?.length > 0 ? (
                    <Tooltip
                      title="View Invalid Data"
                      TransitionProps={{ timeout: 300 }}
                      TransitionComponent={Zoom}
                      placement="top"
                      arrow
                    >
                      <Box
                        onClick={() => {
                          setIsDialog("Error");
                        }}
                        sx={{ cursor: "pointer" }}
                      >
                        <Icon
                          icon="mingcute:question-fill"
                          className="invalid-data-icon"
                        />
                      </Box>
                    </Tooltip>
                  ) : null}

                  {!APagent && !APsubAgents ? (
                    <CustomButton
                      sx={{
                        marginRight: "20px",
                        padding: "6px 15px !important",
                      }}
                      className="saveChanges"
                      category="Cutoff Time"
                      onClick={() => setIsTime(true)}
                    />
                  ) : (
                    ""
                  )}

                  {uploading ? (
                    <Tooltip
                      title={
                        "Once the sheet has been uploaded, you can import it"
                      }
                      TransitionProps={{ timeout: 300 }}
                      TransitionComponent={Zoom}
                      placement="top"
                      arrow
                    >
                      <Icon
                        icon="ep:warning-filled"
                        className="invalid-data-icon"
                        style={{ color: "orange" }}
                      />
                    </Tooltip>
                  ) : (
                    ""
                  )}
                  <CustomButton
                    sx={{ marginRight: "20px", padding: "6px 15px !important" }}
                    className="cancel"
                    category="Import"
                    disabled={uploading}
                    startIcon={<Icon icon="mage:file-upload" />}
                    onClick={handleImportFile}
                  />
                  <CustomButton
                    className="saveChanges"
                    category="Add Booking"
                    onClick={handleAddTrip}
                  />
                </Box>
              </Box>
              {isOpen && (
                <AddTrip
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                  selectedRow={selectedRow}
                  pageDetails={tripPayload}
                  setTripMode={handleTrip}
                  Agents={agentNames}
                  Routes={configuredRoute}
                />
              )}
              {viewOpen && (
                <CustomDialog
                  view={viewOpen}
                  handleViewClose={handleViewClose}
                  isGoogleMap={false}
                  selectedRow={selectedRow}
                />
              )}
              {viewDialogGrid && excelRows?.length > 0 && (
                <CustomDialogGrid
                  rows={excelRows}
                  type="autoplannertrip"
                  columns={excelColumns}
                  view={viewDialogGrid}
                  handleViewClose={handleDialogGridClose}
                  handleViewOpen={handleViewOpen}
                />
              )}
              {error?.invalidExcelRows?.length > 0 ? (
                <ErrorDialog
                  isOpen={isDialog === "Error"}
                  onClose={handleClose}
                  errors={error}
                />
              ) : (
                ""
              )}

              <Dialog open={isDialog === "Delete"}>
                <Box
                  sx={{
                    textAlign: "center",
                    padding: "5%",
                    minWidth: "350px",
                  }}
                >
                  <Typography>{constant.DeleteTrip}</Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      paddingTop: "5%",
                      justifyContent: "center",
                    }}
                  >
                    <Box sx={{ marginRight: "12px" }}>
                      <CustomButton
                        className="saveChanges"
                        category="Yes"
                        loading={deleteTrip?.isLoading}
                        onClick={() => {
                          handleDeleteTrip();
                          setIsDialog("");
                        }}
                      />
                    </Box>
                    <CustomButton
                      className="cancel"
                      category="No"
                      onClick={() => setIsDialog("")}
                    />
                  </Box>
                </Box>
              </Dialog>
              {tripMode === "SIC" && (
                <BookingSic
                  filterPayload={filterPayload}
                  payloads={tripPayload}
                  agentName={agent}
                  setBreadCrumbs={setBreadCrumbs}
                  setExpanded={setExpanded}
                  clearFilter={clearFilter}
                  setPageSizes={setPageSize}
                  pageSizes={pageSize}
                />
              )}
              {tripMode === "TSIC" && (
                <BookingTsic
                  payloads={tripPayload}
                  filterPayload={filterPayload}
                  agentName={agent}
                  setBreadCrumbs={setBreadCrumbs}
                  setExpanded={setExpanded}
                  clearFilter={clearFilter}
                  setPageSizes={setPageSize}
                  pageSizes={pageSize}
                />
              )}
              {tripMode === "GRP" && (
                <BookingGrp
                  payloads={tripPayload}
                  filterPayload={filterPayload}
                  setExpanded={setExpanded}
                  clearFilter={clearFilter}
                  setBreadCrumbs={setBreadCrumbs}
                  setPageSizes={setPageSize}
                  pageSizes={pageSize}
                />
              )}
              {tripMode === "PVT" && (
                <BookingPvt
                  payloads={tripPayload}
                  setExpanded={setExpanded}
                  filterPayload={filterPayload}
                  clearFilter={clearFilter}
                  setBreadCrumbs={setBreadCrumbs}
                  setPageSizes={setPageSize}
                  pageSizes={pageSize}
                />
              )}
              {tripMode === "RLR" && (
                <BookingRLR payloads={tripPayload} setFilter={setFilters} />
              )}
              {error.duplicateRows && (
                <Dialog
                  open={true}
                  onClose={handleCancel}
                  maxWidth="sm"
                  fullWidth
                >
                  <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AlertCircle color="#d32f2f" size={24} />
                      <Typography variant="h6" component="span">
                        Duplicate Entries Detected
                      </Typography>
                    </Box>
                  </DialogTitle>

                  <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      The uploaded sheet contains duplicate entries. If you
                      reupload, these duplicate entries may be removed.
                    </Alert>

                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ mt: 2, mb: 1, fontWeight: 600 }}
                    >
                      Duplicate Records Found:
                    </Typography>

                    <List
                      sx={{
                        bgcolor: "background.paper",
                        borderRadius: 1,
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      {error.duplicateRows.map((row: any, index: any) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemIcon>
                              <AlertCircle size={20} color="#ed6c02" />
                            </ListItemIcon>
                            <ListItemText
                              primary={row}
                              primaryTypographyProps={{
                                fontSize: "0.875rem",
                                color: "text.secondary",
                              }}
                            />
                          </ListItem>
                          {index < error.duplicateRows.length - 1 && (
                            <Divider />
                          )}
                        </React.Fragment>
                      ))}
                    </List>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 2 }}
                    >
                      Please review your data and choose an action below.
                    </Typography>
                  </DialogContent>

                  <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Box
                      sx={{
                        gap: "20px",
                        display: "flex",
                      }}
                    >
                      <CustomButton
                        className="cancel"
                        category="No"
                        onClick={() => {
                          handleCloseReupload();
                        }}
                      />
                      <Box sx={{ marginRight: "12px" }}>
                        <CustomButton
                          className="saveChanges"
                          category="ReUpload"
                          loading={isLoading}
                          onClick={() => {
                            handleReupload();
                          }}
                        />
                      </Box>
                    </Box>
                  </DialogActions>
                </Dialog>
              )}

              {tripMode === "ALL" && (
                <BookingAll
                  payloads={tripPayload}
                  filterPayload={filterPayload}
                  setBreadCrumbs={setBreadCrumbs}
                  setPageSizes={setPageSize}
                  pageSizes={pageSize}
                />
              )}
              <NewMainPickup
                importFile={importFilePickup}
                setImportFile={setImportFilePickup}
                invalidRows={invalidRows}
              />
              <Dialog
                open={openConnectionError}
                className="feedback-dialog animate__animated animate__zoomIn animate__fast"
                BackdropProps={{
                  invisible: true,
                }}
              >
                <Box className="feedback-container" sx={{ minWidth: "350px" }}>
                  <Box className="feedback-header">
                    <Typography paragraph className="feedback-title">
                      Alert
                    </Typography>
                  </Box>
                  <Box className="alert-component">
                    <Typography className="alert-title">
                      Failed to upload the Excel file
                    </Typography>
                    <Typography className="alert-content">
                      Please upload again.
                    </Typography>
                    <Box className="alert-conform-btn">
                      <CustomButton
                        category={"Ok"}
                        className="saveChanges"
                        onClick={() => {
                          dispatch(clearAsyncSuccess());
                          setOpenConnectionError(false);
                          setCallAsync(false);
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Dialog>

              <Dialog
                open={isDialog === "Import"}
                className="import-dialog animate__animated animate__zoomIn"
                BackdropProps={{
                  invisible: true,
                }}
              >
                <Box className="import-file-dialog">
                  <Box className="d-flex import-file-head">
                    <Typography paragraph className="import-file-title">
                      Import Trip File
                    </Typography>
                    <Box
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleCloseImport();
                        }
                      }}
                      className="import-file-close"
                      onClick={handleCloseImport}
                    >
                      <Icon
                        icon="ic:round-close"
                        className="import-file-close-icon"
                      />
                    </Box>
                  </Box>
                  {importFile?.name ? (
                    <Box className="uploaded-file">
                      <Box
                        component={"img"}
                        src={ExcelIcon}
                        className="uploaded-excel-icon"
                      />
                      <Typography paragraph className="uploaded-excel-name">
                        {importFile.name}
                      </Typography>
                      <Box
                        className="remove-uploaded-file"
                        onClick={handleRemoveUploadedFile}
                      >
                        <Icon icon="ic:round-close" />
                      </Box>
                    </Box>
                  ) : (
                    <Box className="import-form">
                      <Box
                        className="upload-btn"
                        onClick={handleUpload}
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleUpload();
                          }
                        }}
                      >
                        Click to Upload file
                      </Box>
                      {errorShow && (
                        <Typography className="file-error-message">
                          Select File
                        </Typography>
                      )}
                    </Box>
                  )}
                  <Box className="disclaimer">
                    <Box className="disclaimer-head">
                      <Icon
                        icon="fluent-color:warning-24"
                        style={{ fontSize: "22px" }}
                      />
                      <Typography paragraph className="disclaimer-title">
                        Only files in the specified format are allowed for
                        upload
                      </Typography>
                      <Tooltip
                        title="Click to download the sample sheet"
                        TransitionProps={{ timeout: 300 }}
                        TransitionComponent={Zoom}
                        arrow
                      >
                        <Box
                          className="download-demo-file"
                          component="a"
                          href={demofile}
                          download
                        >
                          <Icon
                            icon="tabler:download"
                            className="file-download-icon"
                          />
                        </Box>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box
                    className="import-file-submit"
                    sx={{
                      justifyContent:
                        excelRows?.length > 0 ? "space-between" : "flex-end",
                    }}
                  >
                    {excelRows?.length > 0 && (
                      <Tooltip
                        onMouseOver={() => setIsHover(true)}
                        onMouseLeave={() => setIsHover(false)}
                        title="Invalid Excel Data"
                        TransitionProps={{ timeout: 300 }}
                        open={!viewDialogGrid && isHover}
                        TransitionComponent={Zoom}
                        arrow
                      >
                        <Box
                          onClick={() => {
                            setViewDialogGrid(true);
                            setIsHover(false);
                          }}
                        >
                          <Icon
                            icon="mingcute:question-fill"
                            className="excel-data-icon"
                          />
                        </Box>
                      </Tooltip>
                    )}

                    <Box sx={{ display: "flex" }}>
                      <Box sx={{ marginRight: "12px" }}>
                        <CustomButton
                          className="cancel"
                          category="Cancel"
                          onClick={handleCloseImport}
                        />
                      </Box>
                      <CustomButton
                        className="saveChanges"
                        category="Import"
                        disabled={importButtonDisable}
                        loading={isLoading}
                        onClick={handleImportfile}
                      />
                    </Box>
                  </Box>
                </Box>
              </Dialog>

              {isTime && (
                <Dialog open={isTime}>
                  <BookingDeadlineConfig setIsTime={setIsTime} />
                </Dialog>
              )}
            </Box>
          </Grid>
          <Grid item lg={expanded ? 3 : 0}>
            {expanded && (
              <Box
                className={`filter-drawer ${
                  expanded ? "filter-show" : "filter-hide"
                }`}
              >
                <Box className="filterIcon">
                  <IconButton
                    onClick={handleToggle}
                    className="filterIconArrow"
                  >
                    <Icon
                      icon="weui:arrow-filled"
                      style={{ width: "35px", height: "35px" }}
                    />
                  </IconButton>
                  <Typography paragraph className="filterTitle">
                    Filter
                  </Typography>
                </Box>
                <Box
                  className={`filter-bar ${expanded ? "show" : ""}`}
                  component="form"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  {(APadmin || APoperator) && (
                    <Box className="filter-fields">
                      <CustomSelect
                        id="agentname"
                        control={control}
                        name="agentname"
                        label="Agent"
                        placeholder="Select Agent"
                        options={agentNames}
                        onChanges={(e: any, newValue: any) =>
                          setAgent(newValue?.id)
                        }
                        isOptional={true}
                      />
                    </Box>
                  )}
                  {tripMode === "SIC" || tripMode === "TSIC" ? (
                    <Box className="filter-fields">
                      <CustomSelect
                        id="route"
                        control={control}
                        name="route"
                        label="Tour Name"
                        placeholder="Select Tour Name"
                        options={configuredRoute}
                        isOptional={true}
                      />
                    </Box>
                  ) : tripMode !== "RLR" ? (
                    <Box>
                      <Box className="filter-fields">
                        <CustomTextField
                          id="guestName"
                          control={control}
                          name="guestName"
                          label="Guest Name"
                          placeholder="Enter the Guest Name"
                          isOptional={true}
                        />
                      </Box>
                      <Box className="filter-fields">
                        <CustomTextField
                          id="source"
                          control={control}
                          name="source"
                          label="Source"
                          placeholder="Enter the Source"
                          isOptional={true}
                        />
                      </Box>
                      <Box className="filter-fields">
                        <CustomTextField
                          id="destination"
                          control={control}
                          name="destination"
                          label="Destination"
                          placeholder="Enter the Destination"
                          isOptional={true}
                        />
                      </Box>
                      <Box className="filter-fields">
                        <CustomSelect
                          id="mode"
                          control={control}
                          name="mode"
                          label="Mode"
                          placeholder="Select Mode"
                          options={tourModes}
                          isOptional={true}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <></>
                  )}
                  <Box className="filter-fields">
                    <CustomDateCalendar
                      id="trip-date"
                      name="tripDate"
                      control={control}
                      type="user-profile"
                      className="calendar"
                      label="Tour Date"
                      value={bookingDate}
                      placeholder="Choose Date"
                      disablePast={true}
                      onDateChange={(date: any) => {
                        if (date?.$d == "Invalid Date") {
                          setValue("tripDate", "");
                          clearTripDateFilter();
                        }
                        if (date?.$d != "Invalid Date") {
                          setValue("tripDate", formatDate(date?.$d));
                          setBookingDate(convertDatetoEpoch(date?.$d));
                          clearErrors("tripDate");
                        } else setValue("tripDate", undefined);
                      }}
                      isOptional={true}
                    />
                  </Box>
                  <Grid container spacing={2} sx={{ marginTop: "20px" }}>
                    <Grid item xs={6}>
                      <CustomButton
                        category={"Clear Filter"}
                        sx={{ width: "100%", padding: "7.5px !important" }}
                        className="cancel"
                        onClick={filterClear}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CustomButton
                        category={"Filter"}
                        className="saveChanges"
                        sx={{ width: "100%" }}
                        loading={filteerCount > 0 ? tripsData.isLoading : false}
                        type="submit"
                      />
                    </Grid>
                  </Grid>
                </Box>

                {errorMessage && (
                  <Typography
                    sx={{ color: "#d32f2f", marginTop: 2, fontSize: "0.9rem" }}
                  >
                    {errorMessage}
                  </Typography>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AutoPlannerTrip;
