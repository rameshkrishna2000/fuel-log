import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Collapse,
  Dialog,
  Divider,
  Drawer,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  Tooltip,
  Typography,
  useMediaQuery,
  Zoom
} from '@mui/material';
import CustomDataGrid from '../../../../../common/components/customized/customdatagrid/CustomDataGrid';
import { useCallback, useEffect, useRef, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import CustomButton from '../../../../../common/components/buttons/CustomButton';
import { Icon } from '@iconify/react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import CustomTextField from '../../../../../common/components/customized/customtextfield/CustomTextField';
import { Controller, useForm } from 'react-hook-form';
import PhoneNoTextField from '../../../../../common/components/customized/customtextfield/PhoneNoTextField';
import { useAppDispatch, useAppSelector } from '../../../../../app/redux/hooks';
import {
  asyncSuccessAction,
  clearAsyncSuccess,
  clearTourProccedSummary,
  clearTourSaveSummary,
  clearTourSummary,
  downloadSummaryAction,
  getInitialTourSummaryAction,
  getSummaryDriversList,
  getTransferVehicle,
  summaryInfo,
  tourSummaryPlanFrozenAction,
  tourSummaryProccedAction,
  tourSummaryProccedResultAction,
  updateDriverAssign
} from '../../../redux/reducer/autoPlannerSlices/tourSummary';
import nodata from '../../../../../app/assets/images/nodata.png.png';
import noLocationFound from '../../../../../app/assets/images/location-not-found.png.webp';
import {
  capitalizeFirstLetter,
  convertTo12HourFormat,
  debounce,
  epochToDateFormatSg,
  isValidField
} from '../../../../../utils/commonFunctions';
import CustomSelect from '../../../../../common/components/customized/customselect/CustomSelect';
import { useNavigate } from 'react-router-dom';
import { updateToast } from '../../../../../common/redux/reducer/commonSlices/toastSlice';
import {
  createConnection,
  updateData
} from '../../../../../common/redux/reducer/commonSlices/websocketSlice';
import AssignLoader from './component/AssignLoader';
import VehicleUtility from './component/VehicleUtility';
import { Carousel } from 'react-responsive-carousel';
import CustomBreadcrumbs from '../../../../../common/components/custombreadcrumbs/CustomBreadcrumbs';
import './TourSummary.scss';
import ModifyVehicle from './component/ModifyVehicle';
import { contactNumberValidation } from '../../../redux/reducer/autoPlannerSlices/autoplanner';

interface TourDetails {
  tourName: string;
  pickupWindow: string;
  returnTime: string;
  totalAdultCount: number;
  totalChildCount: number;
  netCount: number;
  hotels: any;
}

interface TourInfo {
  vehicleNumber: string;
  totalSeating: number;
  toursUndertaken: number;
  tourInfos: {
    tourName: string;
    filledSeating: number;
    emptySeats: number;
    pickupTime: string;
    returnTime: string;
  }[];
}

interface VehicleRow {
  sno: number;
  id: number;
  coaches: string;
  seating: number;
  driver: string;
  contactNumber: string;
  selected: number;
  driverID: string;
  isChosen: number;
}

interface VehicleSuggestion {
  mainToursHandled: number;
  reusePotential: number;
  seatingCapacity: number;
  transfersHandled: number;
}

interface Props {
  summaryDate: number;
  view: boolean;
  setView: React.Dispatch<React.SetStateAction<boolean>>;
  timeZone: string;
}

const TourSummary = ({ summaryDate, view, setView, timeZone }: Props) => {
  const [mode, setMode] = useState<number>(0);
  const [rows, setRows] = useState<TourDetails[]>([]);
  const [customTourRows, setCustomTourRows] = useState<TourDetails[]>([]);
  const [vehicleWiseRows, setVehicleWiseRows] = useState<any[]>([]);
  const [vehilceRows, setVehilceRows] = useState<VehicleRow[] | any[]>([]);
  const [guideRows, setGuideRows] = useState<any[]>([]);
  const [selectedTour, setSelectedTour] = useState<any>(null);
  const [transferValues, setTransferValues] = useState<any>([]);
  const [vehicleValues, setVehicleValues] = useState<any>([]);
  const [transrows, settransRows] = useState<TourDetails[]>([]);
  const [viewDetails, setViewDetails] = useState<boolean>(false);
  const [seatingCapacity, setSeatingCapacity] = useState<number>(0);
  const [triggerCount, setTriggerCount] = useState<number>(0);
  const [viewCustomTourDetails, setViewCustomTourDetails] = useState<boolean>(false);
  const [viewTourInfo, setViewTourInfo] = useState<boolean>(false);
  const [viewVehicles, setViewVehicles] = useState<boolean>(false);
  const [downloadLabel, setDownloadLabel] = useState<string>('');
  const [nextMode, setNextMode] = useState<string>('');
  const [addExternal, setAddExternal] = useState<boolean>(false);
  const [isCarousel, setIsCarousel] = useState<boolean>(true);
  const [showmsg, setShowmsg] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [viewMessage, setViewMessage] = useState<boolean>(false);
  const [assigning, setAssigning] = useState<boolean>(false);
  const [stopLoader, setStopLoader] = useState<boolean>(false);
  const [openSumbitAlert, setOpenSumbitAlert] = useState<boolean>(false);
  const [skipMode, setSkipMode] = useState<boolean>(false);
  const [viewTransfer, setViewTransfer] = useState<boolean>(false);
  const [proceed, setProceed] = useState<boolean>(false);
  const [feedDialog, setFeedDialog] = useState<boolean>(false);
  const [sugDialog, setSugDialog] = useState<boolean>(false);
  const [planed, setPlaned] = useState<string[]>([]);
  const [passengerRows, setPassengerRows] = useState<any[]>([]);
  const [driverRows, setDriverRows] = useState<any[]>([]);
  const [customTourPassengerRows, setCustomTourPassengerRows] = useState<any[]>([]);
  const [suggestionRow, setSuggestionRow] = useState<any[]>([]);
  const [tourInfoRows, setTourInfoRows] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [totalSummary, setTotalSummary] = useState<any>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [transferProceed, setTransferProceed] = useState<boolean>(false);
  const [automation, setAutomation] = useState(false);
  const [wise, setWise] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTransferVehicle, setIsTransferVehicle] = useState<boolean>(false);
  const [allVehicles, setAllVehicles] = useState<any>([]);
  const [assignType, setAssignType] = useState<string>('');
  const [assignLoader, setAssignLoader] = useState<any>(null);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [openConnectionError, setOpenConnectionError] = useState<boolean>(false);
  const [sugExpanded, setSugExpanded] = useState<boolean>(false);
  const [waitShow, setWaitShow] = useState<boolean>(false);
  const [isNext, setIsNext] = useState<boolean>(false);
  const [isHideNote, setIsHideNote] = useState<boolean>(false);
  const [isShowNote, setIsShowNote] = useState<boolean>(false);
  const [openAddGuide, setOpenAddGuide] = useState<boolean>(false);
  const [openViewGuide, setOpenViewGuide] = useState<boolean>(false);
  const [openModifyVehicle, setOpenModifyVehicle] = useState<boolean>(false);
  const [currentMessage, setCurrentMessage] = useState('Loading...');
  const [viewDriverDetails, setViewDriverDetails] = useState<boolean>(false);
  const [isdataMismatch, setIsdataMismatch] = useState<boolean>(false);

  const [passangerCount, setPassangerCount] = useState({
    totalTourPassengers: 0,
    totalRemainingPassengers: 0,
    totalAllottedPassengers: 0
  });

  const [validationErrors, setValidationErrorsMake] = useState<any>();
  const [callAsync, setCallAsync] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const topRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<any>(null);

  const isSm = useMediaQuery('(max-width:700px)');
  const isMd = useMediaQuery('(max-width:1050px)');
  const isLg = useMediaQuery('(min-width:960px)');

  const initialTourSummary = useAppSelector((state: any) => state.initialTourSummary);
  const tourSummaryProcced = useAppSelector((state: any) => state.tourSummaryProcced);
  const tourSummaryProccedResult = useAppSelector(
    (state: any) => state.tourSummaryProccedResult
  );
  const tourSummaryPlanFrozen = useAppSelector(
    (state: any) => state.tourSummaryPlanFrozen
  );
  const tourSummaryDownload = useAppSelector((state: any) => state.downloadSummary);
  const { data: summaryDrivers } = useAppSelector(
    (state: any) => state.summaryDriversList
  );
  const { isLoading: updateDriverLoader } = useAppSelector(
    state => state.updateSummaryDrivers
  );
  const steps = useAppSelector(
    state => state.initialTourSummary?.data?.data?.modes ?? []
  );
  const feedbacks = useAppSelector(
    state => state.tourSummaryProccedResult?.data?.data?.feedBackResponse ?? []
  );

  const vehicleNumbers = vehilceRows.map((item: any) => item.vehicleNumber.toLowerCase());

  const driverContactNumber = vehilceRows.map((item: any) => item.contactNumber);

  const contactError = useAppSelector(state => state.ContactNumberValidation);

  const {
    isLoading: asyncSuccessLoading,
    data: asyncSuccessData,
    error
  } = useAppSelector(state => state.asyncSuccess);
  const { connection, data: result } = useAppSelector(state => state.websocket);

  const messages = ['Loading...', 'Please wait', "Don't go back", 'Almost done'];

  const schema = yup.object().shape({
    vehicleNo: yup
      .string()
      .required('Enter vehicle number')
      .matches(/^[A-Za-z0-9]*$/, 'Only letters and numbers allowed without spaces')
      .test(
        'valid-length',
        'Enter a valid vehicle number',
        value => (value?.length || 0) >= 4
      )
      .max(20, 'Maximum 20 characters')
      .test('has-letter', 'Must include at least one letter', value =>
        /[A-Za-z]/.test(value || '')
      )
      .test('has-number', 'Must include at least one number', value =>
        /[0-9]/.test(value || '')
      )
      .test('unique-vehicle', 'External vehicle already exists', value => {
        return !vehicleNumbers.includes(value.toLowerCase() || '');
      }),

    capacity: yup
      .number()
      .required('Enter seating capacity')
      .min(1, 'Seating capacity Must be atleast 1')
      .max(249, 'Seating capacity must be below 249')
      .test('not-start-with-zero', 'Seating capacity cannot start with 0', value => {
        return value !== undefined && value !== null && !/^0/.test(value.toString());
      })
      .typeError('Enter seating capacity'),
    driverName: yup
      .string()
      .required('Enter driver name')
      .min(3, 'Driver name must be more than 2 characters')
      .matches(/^[a-zA-Z\s]+$/, 'Driver name must only contain characters'),
    phone: yup
      .string()
      .trim()
      .required('Enter contact number')
      .test('basic-contact', 'Invalid contact number', value => {
        if (!value) return true;
        const phoneRegex = /^\+?[0-9]{1,4}[- ]?[0-9]{7,15}$/;
        return phoneRegex.test(value);
      })
      .test(
        'unique number',
        'Contact number already exist',
        value => !driverContactNumber.includes(value || '')
      )
      .test('is-number', 'Enter contact number', function (value: any) {
        return value;
      })
      .test('phone-error', 'Enter valid contact number', function (value: any) {
        if (validationErrors && value && validationErrors.status !== 200) {
          return this.createError({ message: validationErrors });
        } else {
          return true;
        }
      }),
    driver: yup.string().notRequired()
  });

  const transferSchema = yup.object().shape({
    vehicle: yup.string().notRequired()
  });

  const guideSchema = yup.object().shape({
    guideName: yup
      .string()
      .required('Enter guide name')
      .min(3, 'Guide name must be more than 2 characters')
      .matches(/^[a-zA-Z\s]+$/, 'Guide name must only contain characters'),
    guideNo: yup
      .string()
      .trim()
      .required('Enter contact number')
      .test('basic-contact', 'Invalid contact number', value => {
        if (!value) return true;
        const phoneRegex = /^\+?[0-9]{1,4}[- ]?[0-9]{7,15}$/;
        return phoneRegex.test(value);
      })
      .test('is-number', 'Enter contact number', function (value: any) {
        return value;
      })
      .test('phone-error', 'Enter valid contact number', function (value: any) {
        if (validationErrors && value && validationErrors.status !== 200) {
          return this.createError({ message: validationErrors });
        } else {
          return true;
        }
      }),
    hotelName: yup.string().required('Select hotel name')
  });

  const {
    control,
    handleSubmit,
    clearErrors,
    setValue,
    trigger,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });
  const { control: transferControl } = useForm({
    resolver: yupResolver(transferSchema)
  });

  const {
    control: guideControl,
    clearErrors: guideClearErrors,
    reset: guideReset,
    handleSubmit: handleGuideSubmit,
    trigger: guideTrigger,
    setValue: guideSetValue,
    formState: { errors: guideError }
  } = useForm({
    resolver: yupResolver(guideSchema)
  });

  const summaryDriversList = summaryDrivers?.map((item: any) => ({
    id: item?.driverID,
    label: item?.driverName,
    mobile: item?.mobileNumber
  }));

  const vehicleOptions: any =
    totalSummary?.vehicleInputs?.length > 0
      ? totalSummary?.vehicleInputs
          ?.filter((vehicle: any) => vehicle.isTransferVehicle === 1)
          .map((item: any) => ({
            id: item?.vehicleNumber,
            label: `${item?.vehicleNumber.toUpperCase()} (${item?.remainingCapacity})`
          }))
      : [];

  const column = [
    { field: 'sno', headerName: 'S.No', minWidth: 70, flex: 1 },
    {
      field: 'tourName',
      headerName: 'Tour Name',
      minWidth: 300,
      flex: 1,
      renderCell: (params: any) => (
        <Tooltip title={params.row.tourName} arrow>
          <Box
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}
          >
            {params.row.tourName}
          </Box>
        </Tooltip>
      )
    },
    { field: 'pickupWindow', headerName: 'Pickup  Window', minWidth: 200, flex: 1 },
    { field: 'returnTime', headerName: 'Drop Time', minWidth: 150, flex: 1 },
    { field: 'totalPassengers', headerName: 'Passenger Count', minWidth: 130, flex: 1 },
    {
      field: 'actions',
      headerName: 'Action',
      minWidth: 120,
      flex: 1,
      renderCell: (params: any) => (
        <Box
          onClick={event => handleViewDetails(event, params.row)}
          role='button'
          tabIndex={0}
          onKeyDown={(event: any) => {
            if (event.key === 'Enter') handleViewDetails(event, params.row);
          }}
        >
          <Tooltip title='View passanger details' placement='right' arrow>
            <Typography className='view-details'>View Details</Typography>
          </Tooltip>
        </Box>
      )
    }
  ].map((item: any) => ({
    ...item,
    align: ['actions']?.includes(item?.field) ? 'center' : 'left',
    headerAlign: ['actions']?.includes(item?.field) ? 'center' : 'left'
  }));

  const customTourColumn = [
    { field: 'sno', headerName: 'S.No', minWidth: 60, flex: 1 },
    { field: 'pickupTime', headerName: 'Pickup Time', minWidth: 100, flex: 1 },
    {
      field: 'pickup',
      headerName: 'Pickup',
      minWidth: 220,
      flex: 1,
      renderCell: (params: any) => (
        <Tooltip title={params.row.pickup} arrow>
          <Box
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}
          >
            {params.row.pickup}
          </Box>
        </Tooltip>
      )
    },
    {
      field: 'drop',
      headerName: 'Drop',
      minWidth: 220,
      flex: 1,
      renderCell: (params: any) => (
        <Tooltip title={params.row.drop} arrow>
          <Box
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}
          >
            {params.row.drop}
          </Box>
        </Tooltip>
      )
    },
    { field: 'eta', headerName: 'ETA', minWidth: 100, flex: 1 },
    { field: 'totalPassengers', headerName: 'Passenger Count', minWidth: 130, flex: 1 },
    { field: 'vehicleNumber', headerName: 'Vehicle No', minWidth: 130, flex: 1 },
    {
      field: 'actions',
      headerName: 'Action',
      minWidth: 120,
      flex: 1,
      renderCell: (params: any) => (
        <Box onClick={event => handleViewCustomTourDetails(event, params.row)}>
          <Tooltip title='View details' placement='right' arrow>
            <Typography className='view-details'>View Details</Typography>
          </Tooltip>
        </Box>
      )
    }
  ];

  const VehicleWiseColumn = [
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
      field: 'totalToursUndertaken',
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

  const transferColumn = [
    { field: 'sno', headerName: 'S.No', minWidth: 70, flex: 1 },
    { field: 'transtourName', headerName: 'Tour Name', minWidth: 200, flex: 1 },
    { field: 'transferFrom', headerName: 'Transfer From', minWidth: 300, flex: 1 },
    { field: 'time', headerName: 'Time', minWidth: 150, flex: 1 },
    { field: 'transferTo', headerName: 'Transfer To', minWidth: 300, flex: 1 },
    { field: 'transferCount', headerName: 'Transfer Count', minWidth: 130, flex: 1 },
    {
      field: 'actions',
      headerName: 'Vehicle',
      minWidth: 200,
      flex: 1,
      align: 'center',
      renderCell: (params: any) => {
        return (
          <Box sx={{ width: '100%' }}>
            {params.row.vehicleNumber ? (
              params.row?.vehicleNumber.toUpperCase()
            ) : (
              <CustomSelect
                control={transferControl}
                id={`vehicle-${params.id}`}
                name={`vehicle-${params.id}`}
                defaultValue={params.row.vehicleNumber}
                placeholder='Select Vehicle'
                options={vehicleOptions}
                isDisabled={automation}
                onChanges={(event: any, value: any) => handleChange(value, params.row)}
              />
            )}
          </Box>
        );
      }
    }
  ];

  const vehicleColumn = [
    {
      field: 'vehicleNumber',
      headerName: 'Coaches',
      minWidth: 150,
      flex: 1,
      renderCell: (params: any) => {
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <Typography>{params?.row?.vehicleNumber?.toUpperCase()}</Typography>
            {params?.row?.isExternalVehicle ? (
              <Tooltip
                title='This vehicle is only for the current tour summary'
                placement='right'
                arrow
              >
                <Icon
                  icon='ep:warning-filled'
                  style={{
                    fontSize: '20px',
                    marginLeft: '10px',
                    color: 'orange',
                    cursor: 'pointer'
                  }}
                />
              </Tooltip>
            ) : (
              ''
            )}
          </Box>
        );
      }
    },
    { field: 'seatingCapacity', headerName: 'Seating Capacity', minWidth: 100, flex: 1 },
    {
      field: 'driverName',
      headerName: 'Driver Details',
      minWidth: 100,
      renderCell: (params: any) => {
        return !params?.row?.isAssign ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <IconButton
              onClick={(e: any) => {
                e.stopPropagation();
                setViewDriverDetails(true);
                setDriverRows(params?.row?.driverDetails);
              }}
            >
              <Icon icon='mdi:eye' width='24' height='24' color='#3239ea' />
            </IconButton>
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              marginTop: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ width: '85%' }}>
              <CustomSelect
                id='driver'
                name='driver'
                control={control}
                placeholder='Select driver'
                options={summaryDriversList ?? []}
                onChanges={async (e: any, newValue: any) => {
                  if (newValue?.id) {
                    handleDriverChange(
                      newValue,
                      params?.row?.vehicleNumber.toLowerCase()
                    );
                  }
                }}
              />
            </Box>
            <Icon
              icon='ic:round-close'
              style={{ fontSize: '20px', cursor: 'pointer' }}
              onClick={() => {
                let driverRows = vehilceRows?.map((item, index: number) => ({
                  ...item,
                  isAssign: false
                }));

                setVehilceRows(driverRows);
              }}
            />
          </Box>
        );
      },
      flex: 1
    }
    // {
    //   field: 'contactNumber',
    //   headerName: 'Contact Number',
    //   minWidth: 150,
    //   flex: 1
    // }
  ];

  const suggestionColumn = [
    { field: 'sno', headerName: 'Vehicles', minWidth: 100, flex: 1 },
    {
      field: 'seatingCapacity',
      headerName: 'Seating Capacity',
      minWidth: 120,
      flex: 1
    },
    {
      field: 'mainToursHandled',
      headerName: 'Main Tours',
      minWidth: 100,
      flex: 1
    },
    {
      field: 'transfersHandled',
      headerName: 'Transfer',
      minWidth: 100,
      flex: 1
    },
    {
      field: 'reusePotential',
      headerName: 'Total Tours',
      minWidth: 100,
      flex: 1
    }
  ];

  const getHotelsByTour = (tourName: string) => {
    const tour = guideRows.find(tour => tour.tourName === tourName);
    if (!tour) return [];
    return tour.hotels
      .filter((hotel: any) => !hotel.guideName)
      .map((hotel: any) => ({
        id: hotel.hotelName,
        label: hotel.hotelName
      }));
  };

  const getGuidesByTour = (tourName: any) => {
    const tour = guideRows.find(t => t.tourName === tourName);
    return tour
      ? Array.from(
          new Set(tour.hotels.map((hotel: any) => hotel.guideName).filter(Boolean))
        ).join(', ')
      : [];
  };

  const getGuidesNoByTour = (tourName: any) => {
    const tour = guideRows.find(t => t.tourName === tourName);
    return tour
      ? Array.from(
          new Set(tour.hotels.map((hotel: any) => hotel.contactNumber).filter(Boolean))
        ).join(', ')
      : [];
  };

  const handleAddGuide = (row: any) => {
    setOpenAddGuide(true);
    setSelectedTour(row);
  };

  const handleViewGuide = (row: any) => {
    setOpenViewGuide(true);
    setSelectedTour(row);
  };

  const handleNext = () => {
    if (selectedTab < components.length - 1) {
      setSelectedTab(selectedTab + 1);
      setIsNext(true);
    }
  };

  const handlePrev = () => {
    if (selectedTab > 0) {
      setSelectedTab(selectedTab - 1);
      setIsNext(false);
    }
  };

  const handleCloseAddGuide = () => {
    setOpenAddGuide(false);
    guideClearErrors('guideName');
    guideClearErrors('guideNo');
    guideClearErrors('hotelName');
    clearErrors('phone');
    guideReset();
  };

  const handleCloseViewGuide = () => {
    setOpenViewGuide(false);
  };

  const handleSkip = async (label: string) => {
    if (
      (tourSummaryProccedResult?.data?.data !== null &&
        tourSummaryProccedResult?.data?.data !== undefined &&
        totalSummary !== tourSummaryProccedResult?.data?.data) ||
      (initialTourSummary?.data?.data !== null &&
        initialTourSummary?.data?.data !== undefined &&
        totalSummary !== initialTourSummary?.data?.data)
    ) {
      setSkipMode(true);
      setNextMode(label);
      setOpenModifyVehicle(false);
      return;
    }
    await dispatch(clearTourSummary());
    await dispatch(clearTourProccedSummary());
    await dispatch(clearTourSaveSummary());
    setTotalSummary(null);
    setSelectedRows([]);
    setIsShowNote(false);
    setVehicleWiseRows([]);
    setGuideRows([]);
    settransRows([]);
    setMode(steps.indexOf(label));
    const payload = {
      date: summaryDate,
      mode: label,
      modes: steps.join(','),
      totalSummary: [],
      sessionID: sessionId
    };
    dispatch(getInitialTourSummaryAction(payload));
  };

  const handlemodeOtherMode = async (label: string) => {
    setMode(steps.indexOf(label));
    const payload = {
      date: summaryDate,
      mode: label,
      modes: steps.join(','),
      totalSummary: [],
      sessionID: sessionId
    };
    dispatch(getInitialTourSummaryAction(payload));
    setNextMode('');
    setSkipMode(false);
    await dispatch(clearTourSummary());
    await dispatch(clearTourProccedSummary());
    await dispatch(clearTourSaveSummary());
    setTotalSummary(null);
    setSelectedRows([]);
    setOpenModifyVehicle(false);
    setIsShowNote(false);
    setVehicleWiseRows([]);
    setGuideRows([]);
    settransRows([]);
  };

  const addNewGuide = (params: any) => {
    const hotels = guideRows.map(tour => {
      if (tour.id === selectedTour.id) {
        return {
          ...tour,
          hotels: tour.hotels.map((hotel: any) =>
            hotel.hotelName === params.hotelName
              ? { ...hotel, guideName: params.guideName, contactNumber: params.guideNo }
              : hotel
          )
        };
      }
      return tour;
    });
    const tourInfos = {
      ...selectedTour,
      hotels: selectedTour.hotels.map((hotel: any) =>
        hotel.hotelName === params.hotelName
          ? { ...hotel, guideName: params.guideName, contactNumber: params.guideNo }
          : hotel
      )
    };
    const updatedData = {
      ...totalSummary,
      guideInfos: hotels
    };
    setTotalSummary(updatedData);
    setGuideRows(hotels);
    setSelectedTour(tourInfos);
    handleCloseAddGuide();
  };

  const removeGuide = (index: number) => {
    const hotels = guideRows.map(tour => {
      if (tour.id === selectedTour.id) {
        return {
          ...tour,
          hotels: tour.hotels.map((hotel: any, inx: number) =>
            inx === index ? { ...hotel, guideName: null, contactNumber: null } : hotel
          )
        };
      }
      return tour;
    });
    const tourInfos = {
      ...selectedTour,
      hotels: selectedTour.hotels.map((hotel: any, inx: number) =>
        inx === index ? { ...hotel, guideName: null, contactNumber: null } : hotel
      )
    };
    const updatedData = {
      ...totalSummary,
      guideInfos: hotels
    };
    setTotalSummary(updatedData);
    setGuideRows(hotels);
    setSelectedTour(tourInfos);
    const disable = tourInfos.hotels.some((hotel: any) => hotel.guideName !== null);
    if (!disable) handleCloseViewGuide();
  };

  const guideColumn = [
    {
      field: 'tourName',
      headerName: 'Tour Name',
      minWidth: 150,
      flex: 1,
      renderCell: (params: any) => (
        <Tooltip title={params.row.tourName} arrow>
          <Box
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}
          >
            {params.row.tourName}
          </Box>
        </Tooltip>
      )
    },
    {
      field: 'guide Name',
      headerName: 'Guide Name',
      minWidth: 250,
      flex: 1,
      renderCell: (params: any) => {
        return (
          <Typography>
            {getGuidesByTour(params?.row?.tourName)
              ? getGuidesByTour(params?.row?.tourName)
              : '-'}
          </Typography>
        );
      }
    },
    {
      field: 'guideContactNo',
      headerName: 'Guide Contact No',
      minWidth: 250,
      flex: 1,
      renderCell: (params: any) => {
        return (
          <Typography>
            {getGuidesNoByTour(params?.row?.tourName)
              ? getGuidesNoByTour(params?.row?.tourName)
              : '-'}
          </Typography>
        );
      }
    },
    {
      field: 'addGuide',
      headerName: 'Add Guide',
      minWidth: 120,
      flex: 1,
      renderCell: (params: any) => {
        return (
          <Typography
            sx={{
              cursor: 'pointer',
              color: '#fff',
              background: 'linear-gradient(45deg, #66bb6a 30%, #43a047 90%)',
              padding: '4px 15px',
              borderRadius: '25px',
              fontWeight: 500,
              fontSize: '12px',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(45deg, #43a047 30%, #66bb6a 90%)',
                transform: 'scale(1.1)'
              }
            }}
            onClick={() => handleAddGuide(params?.row)}
          >
            Add Guide
          </Typography>
        );
      }
    },
    {
      field: 'viewGuide',
      headerName: 'View Guide',
      minWidth: 120,
      flex: 1,
      renderCell: (params: any) => {
        const disable = params?.row.hotels.some((hotel: any) => hotel.guideName !== null);
        return (
          <Typography
            sx={{
              cursor: !disable ? 'default' : 'pointer',
              color: '#fff',
              background: !disable
                ? '#aaa'
                : 'linear-gradient(45deg, #42a5f5 30%, #1e88e5 90%)',
              padding: '4px 15px',
              borderRadius: '25px',
              fontWeight: 500,
              fontSize: '12px',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: !disable
                  ? '#aaa'
                  : 'linear-gradient(45deg, #1e88e5 30%, #42a5f5 90%)',
                transform: !disable ? 'scale(1)' : 'scale(1.1)'
              }
            }}
            onClick={() => {
              disable && handleViewGuide(params?.row);
            }}
          >
            View Guide
          </Typography>
        );
      }
    }
  ];

  const handleNavigate = () => {
    navigate('/trips/autoplannertrips/scheduled-tour', {
      state: { date: summaryDate }
    });
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleSugExpandClick = () => {
    setSugExpanded(!sugExpanded);
  };

  // for seleted row
  const handleSelectionChange = (selection: number[]) => {
    setSelectedRows(selection);
    const sorted = [...vehilceRows].sort((a, b) => {
      const aSelected = selection.includes(a.id) ? 1 : 0;
      const bSelected = selection.includes(b.id) ? 1 : 0;
      if (aSelected !== bSelected) {
        return bSelected - aSelected;
      }
      return b.seatingCapacity - a.seatingCapacity;
    });
    setVehilceRows(sorted);
  };

  // view passenger details
  const handleViewDetails = (event: any, row: TourDetails) => {
    setViewDetails(true);
    setPassengerRows(row?.hotels);
  };

  // view custom tour details
  const handleViewCustomTourDetails = (event: any, row: any) => {
    setViewCustomTourDetails(true);
    setCustomTourPassengerRows(row);
  };

  // view tour info details
  const handleViewTourInfo = (row: TourInfo) => {
    setViewTourInfo(true);
    setTourInfoRows(row?.tourInfos);
    setSeatingCapacity(row?.totalSeating);
  };

  const handleDriverChange = async (driver: any, vehicle: string) => {
    await dispatch(
      updateDriverAssign({
        driverid: driver.id,
        vehicle: vehicle
      })
    );
    let updatedVehicle = totalSummary?.vehicleInputs?.map((item: any) => ({
      ...item,
      driverName: item?.vehicleNumber === vehicle ? driver?.label : item?.driverName,
      contactNumber:
        item?.vehicleNumber === vehicle ? driver?.mobile : item?.contactNumber
    }));
    setProceed(true);
    setTotalSummary({ ...totalSummary, vehicleInputs: updatedVehicle });
    setValue('driver', '');
  };

  const handleChange = (value: any, row: any) => {
    const findVehicle = allVehicles.find(
      (vehicle: any) => vehicle.vehicleNumber === value?.id
    );
    if (totalSummary !== null) {
      const updatedData = {
        ...totalSummary,
        transferInstances: totalSummary.transferInstances.map((transfer: any) => {
          const guestsMatch = transfer.id === row?.id;
          if (guestsMatch && findVehicle) {
            return {
              ...transfer,
              vehicleNumber: findVehicle.vehicleNumber.toLowerCase(),
              driverName: findVehicle.driverName,
              contactNumber: findVehicle.contactNumber,
              isExternalVehicle: findVehicle.isExternalVehicle
            };
          }

          return transfer;
        })
      };
      setTotalSummary(updatedData);
    }
  };

  // view passenger details
  const openAddExternalVehicle = (type: string) => {
    setAssignType(type);
    setAddExternal(true);
    type === 'Transfer' && setIsTransferVehicle(true);
  };

  const handleClearError = (mode: any) => {
    if (mode !== assignType) {
      clearErrors('capacity');
      clearErrors('driverName');
      clearErrors('phone');
      clearErrors('vehicleNo');
      reset();
    }
  };

  // close external vehicle add
  const handleCloseExternal = () => {
    setAddExternal(false);
    setIsTransferVehicle(false);
    clearErrors('capacity');
    clearErrors('driverName');
    clearErrors('phone');
    clearErrors('vehicleNo');
    // setValidationErrorsMake('');
    guideClearErrors('guideNo');
    reset();
  };
  const addVehicle = (params: any) => {
    const duplicateVehicle = totalSummary?.vehicleInputs?.find(
      (value: any) =>
        value.vehicleNumber.toLowerCase() === params.vehicleNo.trim().toLowerCase()
    );
    if (duplicateVehicle) {
      dispatch(
        updateToast({
          show: true,
          message: `${params.vehicleNo.trim()} already exists`,
          severity: 'warning'
        })
      );
      return;
    }
    const newVehicle = {
      committedTimeWindows: [],
      contactNumber: params.phone,
      driverID: params.driverName + params.phone,
      id: params.vehicleNo.trim().toLowerCase(),
      sno: vehilceRows?.length + 1,
      driverName: params.driverName.trim(),
      isActive: 1,
      isChosen: 0,
      isExternalVehicle: 1,
      isTransferVehicle: isTransferVehicle ? 1 : 0,
      isMapped: 1,
      driverHours: {
        start: '00:00',
        end: '23:55'
      },
      driverDetails: [
        {
          contactNumber: params.phone,
          driverID: params.driverName + params.phone,
          driverHours: {
            start: '00:00',
            end: '23:55'
          },
          driverName: params.driverName.trim(),
          committedTimeWindows: [],
          driverBreakWindows: [],
          isPrimary: 0
        }
      ],
      remainingCapacity: params.capacity,
      seatingCapacity: params.capacity,
      vehicleNumber: params.vehicleNo.trim().toLowerCase()
    };
    dispatch(
      updateToast({
        show: true,
        message: 'Vehicle added successfully',
        severity: 'success'
      })
    );
    setAddExternal(false);
    setIsTransferVehicle(false);
    reset();
    if (totalSummary) {
      const balanceVehicle = totalSummary.vehicleInputs.map(
        (items: any, index: number) => ({
          ...items,
          id: items.vehicleNumber,
          sno: index + 1
        })
      );
      const updatedData = {
        ...totalSummary,
        vehicleInputs: [newVehicle, ...balanceVehicle]
      };
      setTotalSummary(updatedData);
      setVehilceRows(updatedData?.vehicleInputs);
      const allVehicleData = updatedData?.vehicleInputs.map((items: any, index: any) => ({
        ...items,
        sno: index + 1,
        id: items.vehicleNumber
      }));
      setAllVehicles(allVehicleData);
    }
  };

  const handleProceed = () => {
    const selectedData = vehilceRows.filter(item => selectedRows.includes(item.id));
    if (totalSummary?.vehicleInputs) {
      const updatedData = {
        ...totalSummary,
        vehicleInputs: [
          ...totalSummary?.vehicleInputs.map((vehicle: any) => {
            const isChosen = selectedData.some(
              comp => comp.vehicleNumber.toLowerCase() === vehicle.vehicleNumber
            )
              ? 1
              : 0;

            return {
              ...vehicle,
              isChosen: isChosen
            };
          }),
          ...selectedData
            .filter(comp =>
              totalSummary
                ? !totalSummary?.vehicleInputs?.some(
                    (vle: any) => vle.driverID === comp.driverID
                  )
                : []
            )
            .map(newVehicle => ({
              ...newVehicle,
              isChosen: 1
            }))
        ]
      };
      dispatch(clearAsyncSuccess());
      setTotalSummary(updatedData);
      setShowmsg(!showmsg);
      setProceed(true);
    }
  };

  const handleViewTransferDetails = (value: any) => {
    setTransferValues(value);
    setViewTransfer(true);
  };

  const handleViewVehicleDetails = (value: any) => {
    setVehicleValues(value);
    setViewVehicles(true);
  };

  const tabButton = [
    {
      name: 'Tours',
      icon: 'bx:trip'
    },
    {
      name: 'Vehicles',
      icon: 'tdesign:vehicle-filled'
    },
    {
      name: 'Guide',
      icon: 'fluent:notepad-person-16-filled'
    },
    {
      name: 'Transfer',
      icon: 'icon-park-solid:transfer'
    },
    {
      name: 'utilization',
      icon: 'mdi:electric-vehicle-charger'
    }
  ];

  const handleShowVehicleNo = (value: any) => {
    const uniqueVehicles = value.reduce((acc: any, item: any) => {
      const normalizedVehicleNumber = item.vehicleNumber?.toUpperCase();
      const seatingCapacity = item.seatingCapacity ?? '';
      const vehicleDisplay = `${normalizedVehicleNumber} (${seatingCapacity})`;
      if (
        !acc.some(
          (vehicle: string) =>
            vehicle?.split(' (')[0]?.toUpperCase() === normalizedVehicleNumber
        ) &&
        normalizedVehicleNumber !== null &&
        normalizedVehicleNumber !== undefined
      ) {
        acc.push(vehicleDisplay);
      }
      return acc;
    }, []);
    const vehicles = uniqueVehicles.join(', ').replace(/^,|,$/g, '').trim();
    const displayName =
      vehicles?.length > 20 ? vehicles.substring(0, 20) + '...' : vehicles;
    return displayName;
  };

  const formatVehicleSuggestions = (vehicles: VehicleSuggestion[]): string => {
    const vehicleCount: Record<number, number> = vehicles?.reduce(
      (acc, { seatingCapacity }) => {
        acc[seatingCapacity] = (acc[seatingCapacity] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );
    const formattedSuggestions = Object?.entries(vehicleCount)?.map(
      ([capacity, count]) => `${capacity}-seater${count > 1 ? 's' : ''} (${count})`
    );
    return formattedSuggestions?.join(', ')?.replace(/,([^,]*)$/, ' and$1');
  };

  const handleSubmitTour = async (schedule: boolean) => {
    dispatch(clearAsyncSuccess());
    setCallAsync(false);
    setAssignLoader(null);
    if (
      (passangerCount.totalTourPassengers !== passangerCount.totalAllottedPassengers ||
        tourSummaryProccedResult?.data?.data?.transferInstances?.some(
          (item: any) => item?.vehicleNumber === null
        ) ||
        initialTourSummary?.data?.data?.transferInstances?.some(
          (item: any) => item?.vehicleNumber === null
        )) &&
      !schedule
    ) {
      setOpenSumbitAlert(true);
      return;
    }
    const payload = {
      date: summaryDate,
      mode: steps[mode],
      totalSummary: totalSummary,
      sessionID: sessionId
    };
    setOpenSumbitAlert(false);
    if (!isHideNote) await dispatch(tourSummaryPlanFrozenAction(payload));
    await dispatch(clearTourSummary());
    await dispatch(clearTourProccedSummary());
    await dispatch(clearTourSaveSummary());
    setTotalSummary(null);
    setSelectedRows([]);
    setIsShowNote(false);
    setVehicleWiseRows([]);
    setOpenModifyVehicle(false);
    setGuideRows([]);
    settransRows([]);
    setPlaned([...planed, steps[mode]]);
    const newMode = mode + 1;
    const payloads = {
      date: summaryDate,
      mode: steps?.length === newMode ? steps[mode] : steps[newMode],
      modes: steps.join(','),
      totalSummary: [],
      sessionID: sessionId
    };
    await dispatch(getInitialTourSummaryAction(payloads));
    setCurrentMessage('Loading...');
    setMode(steps?.length === newMode ? mode : newMode);
    if (topRef.current) {
      topRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFeedbackOpen = () => {
    setFeedDialog(true);
  };

  const handleValidate = useCallback(
    debounce((event: any) => {
      dispatch(contactNumberValidation(event));
    }),
    [dispatch]
  );

  //   const handleValidate = useCallback(
  //   debounce(async (event: any, field: any) => {
  //     const res: any = await dispatch(contactNumberValidation(event));
  //     setValidationErrorsMake((prev: any) => ({
  //       ...prev,
  //       [field]: res?.payload?.status !== 200 ? res?.payload : 'no-error'
  //     }));
  //   }),
  //   [dispatch]
  // );

  const handleSuggestionsOpen = () => {
    setSugDialog(true);
  };

  const handleShowWait = () => {
    setWaitShow(true);
    setTimeout(() => {
      setWaitShow(false);
    }, 5000);
  };

  const handleSummaryDownload = async (mode: string) => {
    setIsDownloading(true);
    setDownloadLabel(mode);
    const payload = {
      date: summaryDate,
      mode: mode
    };
    const URL = await dispatch(downloadSummaryAction(payload));
    const fileUrl = URL?.payload?.data;
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', 'Autoplanner_Schedule.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setIsDownloading(false);
  };

  useEffect(() => {
    if (connection) {
      connection.onopen = () => {};

      connection.onmessage = (e: any) => {
        if (
          JSON.parse(e?.data)?.autoplannerID === summaryDate &&
          JSON.parse(e?.data)?.mode === steps[mode] &&
          JSON.parse(e?.data)?.action === 'ASSIGN'
        ) {
          setAssignLoader(JSON.parse(e?.data));
        }
        dispatch(updateData(JSON.parse(e?.data)));
      };

      connection.onclose = () => {
        dispatch(updateData(null));
        setAssignLoader(null);
      };
    }
  }, [connection, steps, mode]);

  useEffect(() => {
    const processResult = async () => {
      if (
        parseFloat(result?.progress) === 100 &&
        tourSummaryProcced?.data?.stateID &&
        result?.action === 'ASSIGN' &&
        !stopLoader
      ) {
        const payload = {
          date: summaryDate,
          stateID: tourSummaryProcced?.data?.stateID,
          sessionID: tourSummaryProcced?.data?.sessionID
        };
        dispatch(updateData(null));
        setAssignLoader(null);
        const action = await dispatch(tourSummaryProccedResultAction(payload));
        if (
          action.type === tourSummaryProccedResultAction.fulfilled.type ||
          action.type === tourSummaryProccedResultAction.rejected.type
        ) {
          setStopLoader(true);
        }
      }
    };
    processResult();
  }, [result, tourSummaryProcced]);

  useEffect(() => {
    const processAsyncResult = async () => {
      if (
        asyncSuccessData &&
        parseFloat(asyncSuccessData?.progress) === 100 &&
        tourSummaryProcced?.data?.stateID &&
        asyncSuccessData?.action === 'SummaryActionEvent' &&
        !stopLoader
      ) {
        const payload = {
          date: summaryDate,
          stateID: tourSummaryProcced?.data?.stateID,
          sessionID: tourSummaryProcced?.data?.sessionID
        };
        dispatch(updateData(null));
        setAssignLoader(null);
        const action = await dispatch(tourSummaryProccedResultAction(payload));
        if (
          action.type === tourSummaryProccedResultAction.fulfilled.type ||
          action.type === tourSummaryProccedResultAction.rejected.type
        ) {
          setStopLoader(true);
        }
      }
    };

    processAsyncResult();
  }, [asyncSuccessData, tourSummaryProcced]);

  useEffect(() => {
    if (asyncSuccessData?.progress) {
      setAssignLoader(asyncSuccessData);
    }
  }, [asyncSuccessData]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (!tourSummaryProcced.isLoading && assigning && connection) {
      if (isNaN(parseFloat(assignLoader?.progress))) {
        intervalId = setInterval(() => {
          if (triggerCount < 3) {
            if (connection) {
              connection.close();
              dispatch(clearAsyncSuccess());
            }

            dispatch(createConnection(''));
            handleShowWait();
            setTriggerCount(triggerCount + 1);
          } else {
            // setOpenConnectionError(true);
            setCallAsync(true);
            dispatch(clearAsyncSuccess());
            if (connection) connection.close();
            clearInterval(intervalId!);
          }
        }, 20000);
      }
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [assigning, tourSummaryProcced.isLoading, assignLoader, connection, triggerCount]);

  useEffect(() => {
    let interval: any;
    if (callAsync) {
      interval = setInterval(async () => {
        if (!asyncSuccessLoading && asyncSuccessData?.progress !== '100' && !error) {
          await dispatch(asyncSuccessAction('SummaryActionEvent'));
        } else if (callAsync && error) {
          setOpenConnectionError(true);
        }
      }, 2000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [callAsync, asyncSuccessData, error]);

  useEffect(() => {
    if (selectedRows?.length > 0 || automation) {
      setIsHideNote(false);
      setIsShowNote(false);
    } else setIsHideNote(true);
  }, [selectedRows, automation]);

  useEffect(() => {
    if (proceed && isHideNote) {
      setIsShowNote(true);
      setTransferProceed(false);
      setProceed(false);
      return;
    }
    if (totalSummary !== null && proceed) {
      const payload = {
        date: summaryDate,
        mode: steps[mode],
        planFrozen: 0,
        vehicleInputsChanged: 1,
        totalSummary: totalSummary,
        sessionID: sessionId,
        isAutomateTransfer: automation ? 1 : 0
      };
      dispatch(tourSummaryProccedAction(payload));
      dispatch(getSummaryDriversList(summaryDate));
      setTransferProceed(false);
      setProceed(false);
      setAssigning(true);
    }
  }, [totalSummary, summaryDate, proceed, isHideNote]);

  useEffect(() => {
    if (initialTourSummary?.data?.data !== null) {
      setTotalSummary(initialTourSummary?.data?.data);
      const summary = initialTourSummary?.data?.data;
      if (!initialTourSummary.isLoading)
        setPassangerCount({
          totalTourPassengers: summary?.totalTourPassengers,
          totalRemainingPassengers: summary?.totalRemainingPassengers,
          totalAllottedPassengers: summary?.totalAllottedPassengers
        });
      setAutomation(false);
    }
    if (
      initialTourSummary?.data?.data !== null &&
      initialTourSummary?.data?.data?.standardTourDetails !== undefined
    )
      setSessionId(initialTourSummary?.data?.data?.sessionID);
    if (
      initialTourSummary?.data?.data !== null &&
      initialTourSummary?.data?.data?.standardTourDetails !== undefined &&
      initialTourSummary?.data?.data?.standardTourDetails !== null
    ) {
      const tourRows = initialTourSummary?.data?.data.standardTourDetails?.map(
        (items: any, index: number) => {
          const [startTime, endTime] = items.pickupWindow.split('-');
          return {
            ...items,
            sno: index + 1,
            id: index + 1,
            returnTime: convertTo12HourFormat(items.returnTime),
            pickupWindow: `${convertTo12HourFormat(startTime)} - ${convertTo12HourFormat(
              endTime
            )}`
          };
        }
      );
      setRows(tourRows);
    }
    if (
      initialTourSummary?.data?.data !== null &&
      initialTourSummary?.data?.data?.customTourInfos !== undefined &&
      initialTourSummary?.data?.data?.customTourInfos !== null
    ) {
      const customTourRows = initialTourSummary?.data?.data.customTourInfos?.map(
        (items: any, index: number) => {
          return {
            ...items,
            sno: index + 1,
            id: index + 1,
            pickup: items?.from?.locationAddress,
            drop: items?.to?.locationAddress,
            vehicleNumber: items?.vehicleNumber
              ? `${items?.vehicleNumber?.toUpperCase()} (${items?.vehicleCapacity})`
              : 'NA',
            pickupTime: convertTo12HourFormat(items?.serviceWindow?.start),
            eta: convertTo12HourFormat(items?.serviceWindow?.end)
          };
        }
      );
      setCustomTourRows(customTourRows);
    }
    if (initialTourSummary?.data?.data?.vehicleUtilityInfoList === null) {
      setWise(false);
    }
    if (
      initialTourSummary?.data?.data !== null &&
      initialTourSummary?.data?.data?.vehicleInputs !== undefined
    ) {
      const vehicleDetails = initialTourSummary?.data?.data?.vehicleInputs?.map(
        (items: any, index: any) => ({
          ...items,
          sno: index + 1,
          id: items.vehicleNumber,
          vehicleNumber: items.vehicleNumber.toUpperCase(),
          isAssign: false
        })
      );
      if (vehicleDetails?.length > 0) {
        const sortedVehicles = [...vehicleDetails].sort((a, b) => {
          if (a.isChosen !== b.isChosen) {
            return b.isChosen - a.isChosen;
          }
          return b.seatingCapacity - a.seatingCapacity;
        });
        setVehilceRows(sortedVehicles);
      }
      const allVehicleData = initialTourSummary?.data?.data?.vehicleInputs?.map(
        (items: any, index: any) => ({
          ...items,
          sno: index + 1,
          id: items.vehicleNumber
        })
      );
      setAllVehicles(allVehicleData);
      const isSelected = initialTourSummary?.data?.data?.vehicleInputs
        ?.filter((value: any) => value.isChosen === 1)
        ?.map((value: any) => value.vehicleNumber.toLowerCase());
      if (!initialTourSummary?.isLoading) setSelectedRows(isSelected);
    }
    if (
      initialTourSummary?.data?.data !== null &&
      initialTourSummary?.data?.data?.guideInfos !== undefined
    ) {
      const guideInfo = initialTourSummary?.data?.data?.guideInfos?.map(
        (items: any, index: any) => ({
          ...items,
          id: index + 1
        })
      );
      setGuideRows(guideInfo);
    }
    if (
      initialTourSummary?.data?.data !== null &&
      initialTourSummary?.data?.data?.vehicleUtilityInfoList !== undefined &&
      initialTourSummary?.data?.data?.vehicleUtilityInfoList !== null
    ) {
      const tourInfoRows = initialTourSummary?.data?.data?.vehicleUtilityInfoList?.map(
        (items: any, index: number) => {
          return {
            ...items,
            sno: index + 1,
            id: index + 1
          };
        }
      );
      setVehicleWiseRows(tourInfoRows);
    }
    if (
      initialTourSummary?.data?.data !== null &&
      initialTourSummary?.data?.data?.vehicleSuggestions !== undefined
    ) {
      const suggestions = initialTourSummary?.data?.data?.vehicleSuggestions?.map(
        (items: any, index: number) => {
          return {
            ...items,
            id: index + 1,
            sno: `Vehicle ${index + 1}`
          };
        }
      );
      setSuggestionRow(suggestions);
    }
  }, [initialTourSummary]);

  useEffect(() => {
    if (tourSummaryProccedResult?.data?.data !== null) {
      setTotalSummary(tourSummaryProccedResult?.data?.data);
      const summary = tourSummaryProccedResult?.data?.data;
      if (!tourSummaryProccedResult.isLoading) {
        setPassangerCount({
          totalTourPassengers: summary?.totalTourPassengers,
          totalRemainingPassengers: summary?.totalRemainingPassengers,
          totalAllottedPassengers: summary?.totalAllottedPassengers
        });
        setAutomation(false);
      }
    }
    if (
      tourSummaryProccedResult?.data?.data !== null &&
      tourSummaryProccedResult?.data?.data?.standardTourDetails !== undefined
    )
      setSessionId(tourSummaryProccedResult?.data?.data?.sessionID);
    if (
      tourSummaryProccedResult?.data?.data !== null &&
      tourSummaryProccedResult?.data?.data?.standardTourDetails !== undefined &&
      tourSummaryProccedResult?.data?.data?.standardTourDetails !== null
    ) {
      const tourRows = tourSummaryProccedResult?.data?.data.standardTourDetails?.map(
        (items: any, index: number) => {
          const [startTime, endTime] = items.pickupWindow.split('-');
          return {
            ...items,
            sno: index + 1,
            id: index + 1,
            returnTime: convertTo12HourFormat(items.returnTime),
            pickupWindow: `${convertTo12HourFormat(startTime)} - ${convertTo12HourFormat(
              endTime
            )}`
          };
        }
      );
      setRows(tourRows);
    }
    if (
      tourSummaryProccedResult?.data?.data !== null &&
      tourSummaryProccedResult?.data?.data?.customTourInfos !== undefined &&
      tourSummaryProccedResult?.data?.data?.customTourInfos !== null
    ) {
      const customTourRows = tourSummaryProccedResult?.data?.data.customTourInfos?.map(
        (items: any, index: number) => {
          return {
            ...items,
            sno: index + 1,
            id: index + 1,
            pickup: items?.from?.locationAddress,
            drop: items?.to?.locationAddress,
            vehicleNumber: items?.vehicleNumber
              ? `${items?.vehicleNumber?.toUpperCase()} (${items?.vehicleCapacity})`
              : 'NA',
            pickupTime: convertTo12HourFormat(items?.serviceWindow?.start),
            eta: convertTo12HourFormat(items?.serviceWindow?.end)
          };
        }
      );
      setCustomTourRows(customTourRows);
    }
    if (tourSummaryProccedResult?.data?.data?.vehicleUtilityInfoList === null) {
      setWise(false);
    }
    if (
      tourSummaryProccedResult?.data?.data !== null &&
      tourSummaryProccedResult?.data?.data?.vehicleUtilityInfoList !== undefined &&
      tourSummaryProccedResult?.data?.data?.vehicleUtilityInfoList !== null
    ) {
      const tourInfoRows =
        tourSummaryProccedResult?.data?.data.vehicleUtilityInfoList?.map(
          (items: any, index: number) => {
            return {
              ...items,
              sno: index + 1,
              id: index + 1
            };
          }
        );
      setVehicleWiseRows(tourInfoRows);
    }
    if (
      tourSummaryProccedResult?.data?.data !== null &&
      tourSummaryProccedResult?.data?.data?.vehicleInputs !== undefined
    ) {
      const vehicleDetails = tourSummaryProccedResult?.data?.data?.vehicleInputs?.map(
        (items: any, index: any) => ({
          ...items,
          sno: index + 1,
          id: items.vehicleNumber,
          vehicleNumber: items.vehicleNumber.toUpperCase(),
          isAssign: false
        })
      );
      if (vehicleDetails?.length > 0) {
        const sortedVehicles = [...vehicleDetails].sort((a, b) => {
          if (a.isChosen !== b.isChosen) {
            return b.isChosen - a.isChosen;
          }
          return b.seatingCapacity - a.seatingCapacity;
        });
        setVehilceRows(sortedVehicles);
      }
      const allVehicleData = tourSummaryProccedResult?.data?.data?.vehicleInputs?.map(
        (items: any, index: any) => ({
          ...items,
          sno: index + 1,
          id: items.vehicleNumber
        })
      );
      setAllVehicles(allVehicleData);
      const isSelected = tourSummaryProccedResult?.data?.data?.vehicleInputs
        .filter((value: any) => value.isChosen === 1)
        .map((value: any) => value.vehicleNumber.toLowerCase());
      if (!tourSummaryProccedResult?.isLoading) setSelectedRows(isSelected);
    }
    if (
      tourSummaryProccedResult?.data?.data !== null &&
      tourSummaryProccedResult?.data?.data?.transferInstances !== undefined &&
      tourSummaryProccedResult?.data?.data?.transferInstances !== null
    ) {
      const transRow: any = tourSummaryProccedResult?.data?.data?.transferInstances

        ?.map((items: any, index: number) => ({
          ...items,
          transtourName: items.tourName,
          transferFrom: items.from.locationAddress,
          transferTo: items.to.locationAddress,
          transferCount: items.totalCount
        }))
        .filter((value: any) => value?.vehicleNumber === null)
        .map((filteredItem: any, index: number) => ({ ...filteredItem, sno: index + 1 }));
      settransRows(transRow);
      transRow.map((value: any, index: number) => {
        if (value.message !== null) setViewMessage(true);
      });
    }
    if (
      tourSummaryProccedResult?.data?.data !== null &&
      tourSummaryProccedResult?.data?.data?.guideInfos !== undefined
    ) {
      const guideInfo = tourSummaryProccedResult?.data?.data?.guideInfos.map(
        (items: any, index: any) => ({
          ...items,
          id: index + 1
        })
      );
      setGuideRows(guideInfo);
    }
  }, [tourSummaryProccedResult]);

  useEffect(() => {
    if (tourSummaryPlanFrozen.isLoading) {
      const interval = setInterval(() => {
        if (currentMessage !== 'Almost done')
          setCurrentMessage(prev => {
            const currentIndex = messages.indexOf(prev);
            return messages[(currentIndex + 1) % messages?.length];
          });
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [tourSummaryPlanFrozen.isLoading, currentMessage]);

  useEffect(() => {
    const payload = {
      date: summaryDate,
      planFrozen: 0,
      vehicleInputsChanged: 0,
      totalSummary: [],
      sessionID: sessionId,
      isAutomateTransfer: 0
    };
    dispatch(getInitialTourSummaryAction(payload));
    dispatch(getSummaryDriversList(summaryDate));
    if (connection) connection.close();
    dispatch(clearAsyncSuccess());
    dispatch(createConnection(''));
    // dispatch(getTransferVehicle({ autoplannerID: summaryDate, mode: 'Transfer' }));
    return () => {
      dispatch(clearTourSummary());
      dispatch(clearTourProccedSummary());
      dispatch(clearTourSaveSummary());
      if (connection) {
        connection.close();
      }
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: any) => {
      if (isDownloading) return;
      event.preventDefault();
      event.returnValue =
        'Are you sure you want to leave? Your changes may not be saved.';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDownloading]);

  useEffect(() => {
    setValidationErrorsMake(contactError.data);
  }, [contactError]);

  useEffect(() => {
    if (validationErrors) {
      trigger('phone');
      guideTrigger('guideNo');
    }
  }, [validationErrors]);

  useEffect(() => {
    if (initialTourSummary?.data?.data?.feedBackResponse?.length > 0) {
      setIsdataMismatch(true);
    }
  }, [initialTourSummary]);

  useEffect(() => {
    const handleBackButton = (event: PopStateEvent) => {
      if (isDownloading) return;
      event.preventDefault();
      window.history.pushState(null, '', window.location.href);
      const confirmed = window.confirm(
        'Are you sure you want to go back? Your changes may not be saved.'
      );
      if (confirmed) {
        setView(false);
      }
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handleBackButton);
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isDownloading]);

  useEffect(() => {
    const handleBeforeUnload = (event: any) => {
      if (isDownloading) return;
      event.preventDefault();
      event.returnValue =
        'Are you sure you want to leave? Your changes may not be saved.';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDownloading]);

  const components = [
    <Box
      className='tour-details-table  carousel-boxs'
      key={1}
      sx={{ maxHeight: isCarousel ? 'none' : '550px' }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'end'
        }}
      >
        {vehicleWiseRows?.length > 0 ? (
          <FormControlLabel
            label='Vehicle utilization'
            onChange={(e: any) => {
              setWise(e.target.checked);
            }}
            control={<Switch size='small' checked={wise} />}
          />
        ) : (
          ''
        )}
      </Box>
      {!wise ? (
        <>
          {customTourRows?.length === 0 ? (
            <CustomDataGrid
              rows={rows}
              columns={column}
              type={'noPageNation'}
              paginationMode={'client'}
              title='Tour Summary'
              stopAnimation={true}
            />
          ) : (
            <CustomDataGrid
              rows={customTourRows}
              columns={customTourColumn}
              type={'noPageNation'}
              paginationMode={'client'}
              title='Tour Summary'
              stopAnimation={true}
            />
          )}
        </>
      ) : (
        <CustomDataGrid
          rows={vehicleWiseRows}
          columns={VehicleWiseColumn}
          type={'noPageNation'}
          paginationMode={'client'}
          title='Tour Summary'
          stopAnimation={true}
        />
      )}
    </Box>,
    <Box
      className='vehicle-details-table  carousel-boxs'
      key={2}
      sx={{ maxHeight: isCarousel ? 'none' : '600px' }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'end'
        }}
      >
        {customTourRows?.length !== 0 && (
          <FormControlLabel
            label='Automation'
            onChange={(e: any) => {
              setAutomation(e.target.checked);
            }}
            control={<Switch size='small' checked={automation} />}
          />
        )}
      </Box>
      <CustomDataGrid
        rows={vehilceRows}
        columns={vehicleColumn}
        checkboxSelection={true}
        onRowSelectionModelChange={handleSelectionChange}
        type={'noPageNation'}
        paginationMode={'client'}
        disableRowOnClickToSelect={false}
        loading={updateDriverLoader}
        selection={selectedRows}
        title='Select Vehicles'
        stopAnimation={true}
      />
    </Box>,
    guideRows?.length > 0 && (
      <Box
        className='guide-details-table carousel-boxs'
        key={3}
        sx={{ maxHeight: isCarousel ? 'none' : '500px' }}
      >
        <Collapse in={expanded} timeout='auto' unmountOnExit>
          <CustomDataGrid
            rows={guideRows}
            columns={guideColumn}
            type={'noPageNation'}
            paginationMode={'client'}
            title='Assign Guide'
            stopAnimation={true}
          />
        </Collapse>
      </Box>
    ),
    transrows?.length > 0 && (
      <Box
        className='tour-details-table transfer-details-table carousel-boxs'
        key={4}
        sx={{ maxHeight: isCarousel ? 'none' : '550px' }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'end'
          }}
        >
          <FormControlLabel
            label='Automation'
            onChange={(e: any) => {
              setAutomation(e.target.checked);
            }}
            control={<Switch size='small' checked={automation} />}
          />
        </Box>
        <CustomDataGrid
          rows={transrows}
          columns={transferColumn}
          type={'noPageNation'}
          paginationMode={'client'}
          rowHeight={40}
          title='Transfer Summary'
          stopAnimation={true}
        />
      </Box>
    ),
    vehicleWiseRows?.length > 0 && (
      <Box className=' carousel-boxs' key={5}>
        <VehicleUtility
          rows={vehicleWiseRows}
          mode={steps[mode]}
          isCustom={
            tourSummaryProccedResult?.data?.data?.customTourInfos?.length > 0 ||
            initialTourSummary?.data?.data?.customTourInfos?.length > 0
          }
        />
      </Box>
    )
  ].filter(Boolean);

  useEffect(() => {
    if (isShowNote) {
      dispatch(
        updateToast({
          show: true,
          message: ' Select at least one vehicle',
          severity: 'warning'
        })
      );
    }
  }, [isShowNote, showmsg]);

  useEffect(() => {
    if (selectedTab > components.length - 1) {
      setSelectedTab(0);
    }
  }, [tourSummaryProccedResult, selectedTab, components]);

  return (
    <Box className='tour-summary-component' ref={topRef}>
      {tourSummaryPlanFrozen.isLoading && (
        <Box className='save-loader'>
          <Box className='loading-message'>{currentMessage}</Box>
        </Box>
      )}
      <AssignLoader
        assigning={assigning}
        setAssigning={setAssigning}
        progress={parseFloat(assignLoader?.progress) || 0}
        proceedLoading={tourSummaryProcced.isLoading}
        resultLoading={tourSummaryProccedResult.isLoading}
        stopLoader={stopLoader}
        setStopLoader={setStopLoader}
        waitShow={waitShow}
      />
      {initialTourSummary?.isLoading ? (
        <Box className='summary-loader'>
          <Box className='loader' />
        </Box>
      ) : (
        <>
          {steps?.length === 0 && steps ? (
            <>
              <CustomBreadcrumbs
                className='tracking-heading'
                itemOne={'Tour Summary'}
                itemTwo={`${epochToDateFormatSg(summaryDate, timeZone)}`}
                itemTwoState={view}
                setView={setView}
                handleItemOneClick={() => {
                  dispatch(
                    summaryInfo(
                      <Box sx={{ maxWidth: '400px' }}>
                        <Alert severity='warning'>
                          RLR need to be added before scheduling.
                        </Alert>
                      </Box>
                    )
                  );
                  if (connection) connection.close();
                }}
              />
              {/* <Box className='no-report-img'>
                <Box
                  component={'img'}
                  src={nodata}
                  alt='No Report Found'
                  className='no-report-found'
                />
              </Box> */}

              <Box className='no-report-img'>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <LocationOffIcon
                    sx={{
                      fontSize: 120,
                      color: '#9e9e9e'
                    }}
                  />
                  <Typography
                    variant='h6'
                    sx={{
                      color: '#757575',
                      fontWeight: 600,
                      letterSpacing: '0.5px'
                    }}
                  >
                    INVALID LOCATION FOUND
                  </Typography>
                </Box>
              </Box>

              {initialTourSummary?.data?.data?.feedBackResponse?.length > 0 && (
                <Dialog open={isdataMismatch} maxWidth='sm' fullWidth>
                  <Box sx={{ p: 3, position: 'relative' }}>
                    <IconButton
                      onClick={() => {
                        setIsdataMismatch(false);
                      }}
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'grey.500',
                        '&:hover': {
                          bgcolor: 'grey.100'
                        }
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          fontSize: 20,
                          fontWeight: 600,
                          color: 'error.main',
                          mb: 0.5
                        }}
                      >
                        Route Validation Required
                      </Box>
                      <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
                        Unable to generate pathways for the following locations
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                      {initialTourSummary?.data?.data?.feedBackResponse?.map(
                        (item: any, index: any) => (
                          <Box
                            key={index}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              bgcolor: 'grey.50',
                              border: '1px solid',
                              borderColor: 'grey.200',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: 'primary.main',
                                boxShadow: 1
                              }
                            }}
                          >
                            <Box
                              sx={{
                                fontSize: 15,
                                fontWeight: 600,
                                color: 'text.primary',
                                mb: 1
                              }}
                            >
                              {item.title || 'No pathway. Please validate the locations'}
                            </Box>
                            <Box
                              sx={{
                                fontSize: 13,
                                color: 'text.secondary',
                                lineHeight: 1.5
                              }}
                            >
                              {item.reason || 'No valid route found'}
                            </Box>
                          </Box>
                        )
                      )}
                    </Box>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        bgcolor: 'info.lighter',
                        border: '1px solid',
                        borderColor: 'info.light'
                      }}
                    >
                      <Box sx={{ fontSize: 13, color: 'info.dark', lineHeight: 1.6 }}>
                        💡 Please verify the location names and coordinates, then try
                        again.
                      </Box>
                    </Box>
                  </Box>
                </Dialog>
              )}
            </>
          ) : steps?.length > mode ? (
            <>
              {feedbacks?.length > 0 && feedbacks !== null ? (
                <Box className='feedback-btn'>
                  <Box className='feedback-button' onClick={handleFeedbackOpen}>
                    <Icon
                      icon='fluent:person-feedback-24-regular'
                      className='feedback-button-icon'
                    />
                    <Typography paragraph className='feedback-content'>
                      Feedback
                    </Typography>
                  </Box>
                </Box>
              ) : (
                ''
              )}
              {suggestionRow?.length > 0 ? (
                <Box className='suggestions-btn'>
                  <Box className='suggestions-button' onClick={handleSuggestionsOpen}>
                    <Icon icon='mage:light-bulb' className='suggestions-button-icon' />
                    <Typography paragraph className='suggestions-content'>
                      suggestions
                    </Typography>
                  </Box>
                </Box>
              ) : (
                ''
              )}
              <Box className='summary-nav'>
                {transrows?.some(
                  (item: any) => item?.vehicleNumber === null && item?.message !== null
                ) && (
                  <Tooltip
                    title={'Transfer instruction'}
                    TransitionProps={{ timeout: 300 }}
                    TransitionComponent={Zoom}
                    arrow
                  >
                    <Icon
                      icon='mdi:bus-warning'
                      className='summary-transfer-message'
                      onClick={() => setViewMessage(true)}
                    />
                  </Tooltip>
                )}
                <Box className='passenger-box'>
                  <Tooltip
                    title={`Total ${
                      customTourRows?.length > 0 ? 'Bookings' : 'Passengers'
                    }`}
                    TransitionProps={{ timeout: 300 }}
                    TransitionComponent={Zoom}
                    arrow
                  >
                    <Box
                      className='passenger-count'
                      sx={{
                        background: 'linear-gradient(to right, #eef2ff, #e0e7ff)',
                        color: '#4f46e5'
                      }}
                    >
                      <Icon icon='fluent:people-20-filled' className='count-icon' />
                      <Typography className='count-text'>
                        {passangerCount.totalTourPassengers || 0}
                      </Typography>
                    </Box>
                  </Tooltip>
                  <Divider className='count-divider' />
                  <Tooltip
                    title={`Remaining ${
                      customTourRows?.length > 0 ? 'Bookings' : 'Passengers'
                    }`}
                    TransitionProps={{ timeout: 300 }}
                    TransitionComponent={Zoom}
                    arrow
                  >
                    <Box
                      className='passenger-count count-center'
                      sx={{
                        background: 'linear-gradient(to right, #fef2f2, #fee2e2)',
                        color: '#ff7575'
                      }}
                    >
                      <Icon icon='fluent:people-error-20-filled' className='count-icon' />
                      <Typography className='count-text'>
                        {passangerCount.totalRemainingPassengers || 0}
                      </Typography>
                    </Box>
                  </Tooltip>
                  <Divider className='count-divider' />
                  <Tooltip
                    title={`Allotted  ${
                      customTourRows?.length > 0 ? 'Bookings' : 'Passengers'
                    }`}
                    TransitionProps={{ timeout: 300 }}
                    TransitionComponent={Zoom}
                    arrow
                  >
                    <Box
                      className='passenger-count'
                      sx={{
                        background: 'linear-gradient(to right, #f0fdf4, #dcfce7)',
                        color: '#48c573'
                      }}
                    >
                      <Icon
                        icon='fluent:people-checkmark-20-filled'
                        className='count-icon'
                      />
                      <Typography className='count-text'>
                        {passangerCount.totalAllottedPassengers || 0}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Box>
                <Box className='summary-layout'>
                  <ButtonGroup variant='outlined' aria-label='Basic button group'>
                    <Button
                      onClick={() => {
                        setIsCarousel(true);
                        setSelectedTab(0);
                      }}
                      className={isCarousel ? 'layout-active' : ''}
                    >
                      <Icon icon='hugeicons:layout-right' width='18' height='18' />
                    </Button>
                    <Button
                      onClick={() => setIsCarousel(false)}
                      className={!isCarousel ? 'layout-active' : ''}
                    >
                      <Icon icon='hugeicons:layout-3-row' width='18' height='18' />
                    </Button>
                  </ButtonGroup>
                </Box>
              </Box>
              <Box className='summary-header'>
                <CustomBreadcrumbs
                  className='tracking-heading'
                  itemOne={'Tour Summary'}
                  itemTwo={`${epochToDateFormatSg(summaryDate, timeZone)}`}
                  itemTwoState={view}
                  setView={() => {}}
                  handleItemOneClick={() => {
                    if (
                      (tourSummaryProccedResult?.data?.data !== null &&
                        tourSummaryProccedResult?.data?.data !== undefined &&
                        totalSummary !== tourSummaryProccedResult?.data?.data) ||
                      (initialTourSummary?.data?.data !== null &&
                        initialTourSummary?.data?.data !== undefined &&
                        totalSummary !== initialTourSummary?.data?.data)
                    ) {
                      const confirmed = window.confirm(
                        'Are you sure you want to go back? Your changes may not be saved.'
                      );
                      if (confirmed) {
                        dispatch(clearAsyncSuccess());
                        setCallAsync(false);
                        setView(false);
                      }
                    } else {
                      setView(false);
                    }

                    dispatch(
                      summaryInfo(
                        <Box sx={{ maxWidth: '400px' }}>
                          <Alert severity='warning'>
                            RLR need to be added before scheduling.
                          </Alert>
                        </Box>
                      )
                    );
                    if (connection) {
                      connection.close();
                    }
                  }}
                />
                {steps?.length > 1 ? (
                  <Box className='summary-steps' sx={{ width: isLg ? '50%' : '100%' }}>
                    <Stepper activeStep={mode} alternativeLabel nonLinear>
                      {steps.map((label: any, index: number) => (
                        <Step
                          key={label}
                          onClick={() => handleSkip(label)}
                          completed={planed.includes(label)}
                        >
                          <StepLabel className='summary-steps-label'>
                            <Typography
                              paragraph
                              className='summary-steps-label-text'
                              role='button'
                              tabIndex={0}
                              onKeyDown={(event: any) => {
                                if (event.key === 'Enter') handleSkip(label);
                              }}
                            >
                              {label}
                            </Typography>
                            {planed.includes(label) ? (
                              <Tooltip
                                title='Downlaod'
                                placement='right'
                                TransitionProps={{ timeout: 300 }}
                                TransitionComponent={Zoom}
                                arrow
                              >
                                <Icon
                                  icon={
                                    tourSummaryDownload.isLoading &&
                                    label === downloadLabel
                                      ? 'codex:loader'
                                      : 'entypo:download'
                                  }
                                  className={`summary-download-icon ${
                                    tourSummaryDownload.isLoading &&
                                    label === downloadLabel
                                      ? 'loader-active'
                                      : ''
                                  }`}
                                  onClick={event => {
                                    event.stopPropagation();
                                    handleSummaryDownload(label);
                                  }}
                                />
                              </Tooltip>
                            ) : (
                              ''
                            )}
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </Box>
                ) : (
                  <Typography sx={{ fontWeight: 600, fontSize: '18px' }}>
                    {steps[mode]}
                  </Typography>
                )}
                {planed.length > 0 && (
                  <Box className='nav-schedule' onClick={handleNavigate}>
                    <Icon icon='eva:navigation-2-fill' width='18' height='18' />
                    <Typography className='nav-schedule-text'>View Scheduled</Typography>
                  </Box>
                )}
              </Box>
              <Box className='summary-body-component'>
                {isCarousel ? (
                  <>
                    {/* Navigation Arrows */}
                    <Box className='carousel-nav-arrows'>
                      <button
                        className={`${
                          selectedTab === 0 ? 'disabled-tab' : ''
                        } next-arrow`}
                        onClick={handlePrev}
                        disabled={selectedTab === 0}
                      >
                        <Icon icon='si:arrow-left-fill' width='24' height='24' />
                        <Typography
                          className={`${selectedTab === 0 ? 'disable-btn' : ''}`}
                        >
                          Prev
                        </Typography>
                      </button>
                      <button
                        className={`next-arrow ${
                          selectedTab === components.length - 1 ? 'disabled-tab' : ''
                        }`}
                        onClick={handleNext}
                        disabled={selectedTab === components.length - 1}
                      >
                        <Typography
                          className={`${
                            selectedTab === components.length - 1 ? 'disable-btn' : ''
                          }`}
                        >
                          Next
                        </Typography>
                        <Icon icon='si:arrow-right-fill' width='24' height='24' />
                      </button>
                    </Box>
                    <Box
                      className={`carousel-layout animate__animated  animate__faste ${
                        isNext ? 'animate__slideInRight' : 'animate__slideInLeft'
                      }`}
                    >
                      {components[selectedTab]}
                    </Box>
                  </>
                ) : (
                  <Box className='normal-boxes'>{components}</Box>
                )}
                <Box className='summary-plan-schedule'>
                  <Box className='summary-footer-left'>
                    {isCarousel && (
                      <Box className='carousel-tabs'>
                        {components.map((value: any, index) => (
                          <button
                            key={index}
                            className={`carousel-tab-button ${
                              selectedTab === index ? 'carousel-active' : ''
                            }`}
                            onClick={() => {
                              if (selectedTab > index) {
                                setIsNext(false);
                              } else setIsNext(true);
                              setSelectedTab(index);
                            }}
                          >
                            <Icon
                              icon={tabButton[parseFloat(value.key) - 1].icon}
                              fontSize={'15px'}
                            />
                            {tabButton[parseFloat(value.key) - 1].name}
                          </button>
                        ))}
                      </Box>
                    )}
                    {isCarousel && <Divider className='footer-divider' />}
                    <Box
                      className='custom-summary-button-black'
                      onClick={() => {
                        openAddExternalVehicle(steps[mode]);
                      }}
                    >
                      <Icon icon='mingcute:add-fill' width='18' height='18' />
                      <Typography className='summary-button-text'>
                        Add External Vehicle
                      </Typography>
                    </Box>
                  </Box>
                  <Box className='summary-footer-right'>
                    <Box className='custom-summary-button' onClick={handleProceed}>
                      <Typography className='summary-button-text'>Schedule</Typography>
                    </Box>
                    <Box
                      className='summary-plan-schedule-btn'
                      onClick={() => handleSubmitTour(false)}
                    >
                      <Typography className='summary-button-text'>{`Save`}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              {viewDetails && (
                <Dialog
                  open={viewDetails}
                  className='tour-dialog animate__animated animate__zoomIn animate__fast'
                  BackdropProps={{
                    invisible: true
                  }}
                >
                  <Box
                    className='routes-view'
                    sx={{ width: isMd ? '100% !important' : '1000px !important' }}
                  >
                    <Box className='routes-view-header'>
                      <Typography
                        variant='h6'
                        sx={{
                          color: '#333',
                          fontWeight: 600
                        }}
                      >
                        Tour Details
                      </Typography>
                      <Box
                        className='routes-close'
                        onClick={() => setViewDetails(false)}
                        role='button'
                        tabIndex={0}
                        onKeyDown={(event: any) => {
                          if (event.key === 'Enter') setViewDetails(false);
                        }}
                      >
                        <Icon icon='ic:round-close' className='routes-close-icon' />
                      </Box>
                    </Box>
                    <Box className='passenger-details'>
                      <Grid container spacing={2} className='passenger-details-values'>
                        <Grid item sm={5} className='details-values head'>
                          Hotels
                        </Grid>
                        <Grid item sm={2} className='details-values head'>
                          Total Passengers
                        </Grid>
                        <Grid item sm={3} className='details-values head'>
                          Passengers Details
                        </Grid>
                        <Grid item sm={2} className='details-values head'>
                          Transfer
                        </Grid>
                      </Grid>
                      {passengerRows?.length > 0 &&
                        passengerRows.map((items: any, index: any) => {
                          return (
                            <Grid
                              container
                              key={index}
                              spacing={2}
                              className='passenger-details-values'
                            >
                              <Grid item sm={5} className='details-values'>
                                {index + 1}. {items.name}
                              </Grid>
                              <Grid item sm={2} className='details-values'>
                                {items.totalCount}
                              </Grid>
                              <Grid item sm={3} className='details-values'>
                                <Box
                                  onClick={() =>
                                    handleViewVehicleDetails(items?.passengerBookings)
                                  }
                                >
                                  <Tooltip
                                    title='View Passengers details'
                                    arrow
                                    placement='right'
                                  >
                                    {handleShowVehicleNo(items?.passengerBookings) ? (
                                      <Typography className='view-details vehicle-no'>
                                        {handleShowVehicleNo(items?.passengerBookings)}
                                      </Typography>
                                    ) : (
                                      <Typography
                                        className='view-details'
                                        role='button'
                                        tabIndex={0}
                                        onKeyDown={(event: any) => {
                                          if (event.key === 'Enter')
                                            handleViewVehicleDetails(
                                              items?.passengerBookings
                                            );
                                        }}
                                      >
                                        View passengers
                                      </Typography>
                                    )}
                                  </Tooltip>
                                </Box>
                              </Grid>
                              <Grid item sm={2} className='details-values'>
                                {items?.passengerBookings[0].transferInstance === null ? (
                                  <Typography paragraph className='details-values'>
                                    N/A
                                  </Typography>
                                ) : (
                                  <Box
                                    onClick={() =>
                                      handleViewTransferDetails(items?.passengerBookings)
                                    }
                                  >
                                    <Tooltip
                                      title='View transfer details'
                                      placement='right'
                                      arrow
                                    >
                                      <Typography className='view-details'>
                                        View Transfer
                                      </Typography>
                                    </Tooltip>
                                  </Box>
                                )}
                              </Grid>
                            </Grid>
                          );
                        })}
                    </Box>
                  </Box>
                </Dialog>
              )}
              <Dialog
                open={viewCustomTourDetails}
                className='tour-dialog animate__animated animate__zoomIn animate__fast'
                BackdropProps={{
                  invisible: true
                }}
              >
                <Box
                  className='routes-view'
                  sx={{ width: isMd ? '100% !important' : '1000px !important' }}
                >
                  <Box className='routes-view-header'>
                    <Typography
                      variant='h6'
                      sx={{
                        color: '#333',
                        fontWeight: 600
                      }}
                    >
                      Tour Details
                    </Typography>
                    <Box
                      className='routes-close'
                      onClick={() => setViewCustomTourDetails(false)}
                    >
                      <Icon icon='ic:round-close' className='routes-close-icon' />
                    </Box>
                  </Box>
                  <Box className='passenger-details'>
                    <Grid container spacing={2} className='passenger-details-values'>
                      <Grid item sm={3} className='details-values head'>
                        Agent Name
                      </Grid>
                      <Grid item sm={3} className='details-values head'>
                        Guest Name
                      </Grid>
                      <Grid item sm={2} className='details-values head'>
                        Vehicle
                      </Grid>
                      <Grid item sm={2} className='details-values head'>
                        Driver Name
                      </Grid>
                      <Grid item sm={2} className='details-values head'>
                        Contact No
                      </Grid>
                    </Grid>
                    {[customTourPassengerRows]?.length > 0 &&
                      [customTourPassengerRows].map((items: any, index: any) => {
                        return (
                          <Grid
                            container
                            key={index}
                            spacing={2}
                            className='passenger-details-values'
                          >
                            <Grid item sm={3} className='details-values'>
                              {items.agent_name}
                            </Grid>
                            <Grid item sm={3} className='details-values'>
                              {items.guest_name}
                            </Grid>
                            <Grid item sm={2} className='details-values'>
                              {items.vehicleNumber ? items.vehicleNumber : 'NA'}
                            </Grid>
                            <Grid item sm={2} className='details-values'>
                              {items.driverName ? items.driverName : '-'}
                            </Grid>
                            <Grid item sm={2} className='details-values'>
                              {items.contactNumber ? items.contactNumber : '-'}
                            </Grid>
                          </Grid>
                        );
                      })}
                  </Box>
                </Box>
              </Dialog>
              <Dialog
                open={viewTourInfo}
                className='tour-dialog animate__animated animate__zoomIn animate__fast'
                BackdropProps={{
                  invisible: true
                }}
              >
                <Box
                  className='routes-view'
                  sx={{ width: isMd ? '100% !important' : '1000px !important' }}
                >
                  <Box className='routes-view-header'>
                    <Typography
                      variant='h6'
                      sx={{
                        color: '#333',
                        fontWeight: 600
                      }}
                    >
                      Tour Info
                    </Typography>
                    <Box
                      className='routes-close'
                      onClick={() => setViewTourInfo(false)}
                      role='button'
                      tabIndex={0}
                      onKeyDown={(event: any) => {
                        if (event.key === 'Enter') setViewTourInfo(false);
                      }}
                    >
                      <Icon icon='ic:round-close' className='routes-close-icon' />
                    </Box>
                  </Box>
                  <Box className='passenger-details'>
                    <Grid container spacing={2} className='passenger-details-values'>
                      <Grid item sm={4} className='details-values head'>
                        Tour Name / From - To
                      </Grid>
                      <Grid item sm={2} className='details-values head'>
                        Mode
                      </Grid>
                      <Grid item sm={2} className='details-values head'>
                        Filled Seating
                      </Grid>
                      <Grid item sm={2} className='details-values head'>
                        Pickup Time
                      </Grid>
                      <Grid item sm={2} className='details-values head'>
                        Return Time
                      </Grid>
                    </Grid>
                    {tourInfoRows?.length > 0 &&
                      tourInfoRows.map((items: any, index: any) => {
                        return (
                          <Grid
                            container
                            key={index}
                            spacing={2}
                            className='passenger-details-values'
                          >
                            <Grid item sm={4} className='details-values'>
                              {index + 1}. {items.tourName}
                            </Grid>
                            <Grid item sm={2} className='details-values'>
                              {items.mode}
                            </Grid>
                            <Grid item sm={2} className='details-values'>
                              {items.filledSeating
                                ? `${items.filledSeating}/${seatingCapacity}`
                                : '-'}
                            </Grid>
                            <Grid item sm={2} className='details-values'>
                              {convertTo12HourFormat(items.pickupTime)}
                            </Grid>
                            <Grid item sm={2} className='details-values'>
                              {convertTo12HourFormat(items.returnTime)}
                            </Grid>
                          </Grid>
                        );
                      })}
                  </Box>
                </Box>
              </Dialog>
              {viewDriverDetails && (
                <Dialog
                  open={viewDriverDetails}
                  className='tour-dialog animate__animated animate__zoomIn animate__fast'
                  BackdropProps={{
                    invisible: true
                  }}
                  maxWidth='xs'
                  fullWidth
                >
                  <Box
                    className='routes-view'
                    // sx={{ width: isMd ? '100% !important' : '1000px !important' }}
                  >
                    <Box className='routes-view-header'>
                      <Typography
                        variant='h6'
                        sx={{
                          color: '#333',
                          fontWeight: 600
                        }}
                      >
                        Driver Details
                      </Typography>
                      <Box
                        className='routes-close'
                        onClick={() => setViewDriverDetails(false)}
                      >
                        <Icon icon='ic:round-close' className='routes-close-icon' />
                      </Box>
                    </Box>
                    <Box className='passenger-details'>
                      <Grid container spacing={2} className='passenger-details-values'>
                        <Grid item sm={5} className='details-values head'>
                          Driver Name
                        </Grid>
                        <Grid item sm={5} className='details-values head'>
                          Contact Number
                        </Grid>
                      </Grid>
                      {driverRows?.length > 0 &&
                        driverRows.map((items: any, index: any) => {
                          return (
                            <Grid
                              container
                              key={index}
                              spacing={2}
                              className='passenger-details-values'
                            >
                              <Grid item sm={5} className='details-values'>
                                {index + 1}.
                                {items?.driverName
                                  ? capitalizeFirstLetter(items?.driverName)
                                  : 'N?A'}
                              </Grid>
                              <Grid item sm={5} className='details-values'>
                                {items.contactNumber}
                              </Grid>
                            </Grid>
                          );
                        })}
                    </Box>
                  </Box>
                </Dialog>
              )}
              {addExternal && (
                <Dialog
                  open={addExternal}
                  className='tour-dialog animate__animated animate__zoomIn animate__fast'
                  BackdropProps={{
                    invisible: true
                  }}
                >
                  <Box
                    className='routes-view'
                    sx={{
                      overflowY: 'hidden',
                      width: isSm ? '100% !important' : '500px !important'
                    }}
                  >
                    <Box
                      className='routes-view-header'
                      sx={{ padding: '20px 20px 0 !important' }}
                    >
                      <Typography
                        variant='h6'
                        sx={{
                          color: '#333',
                          fontWeight: 600
                        }}
                      >
                        {`Add External Vehicle (${assignType})`}
                      </Typography>
                      <Box className='routes-close' onClick={handleCloseExternal}>
                        <Icon icon='ic:round-close' className='routes-close-icon' />
                      </Box>
                    </Box>
                    <Box
                      component={'form'}
                      onSubmit={handleSubmit(addVehicle)}
                      sx={{
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        padding: '0 20px 20px 20px'
                      }}
                    >
                      {customTourRows?.length === 0 && (
                        <Box className='summary-layout'>
                          <ButtonGroup variant='outlined' aria-label='Basic button group'>
                            <Button
                              onClick={() => {
                                setAssignType(steps[mode]);
                                // handleClearError(steps[mode]);
                              }}
                              className={
                                assignType !== 'Transfer'
                                  ? 'layout-active layout-btn'
                                  : 'layout-btn'
                              }
                            >
                              {steps[mode]}
                            </Button>
                            <Button
                              onClick={() => {
                                setAssignType('Transfer');
                                // handleClearError('Transfer');
                                setIsTransferVehicle(true);
                              }}
                              className={
                                assignType === 'Transfer'
                                  ? 'layout-active layout-btn'
                                  : 'layout-btn'
                              }
                            >
                              Transfer
                            </Button>
                          </ButtonGroup>
                        </Box>
                      )}
                      <CustomTextField
                        id='vehicle-no'
                        control={control}
                        name='vehicleNo'
                        label='Vehicle Number'
                        placeholder='Vehicle number'
                        maxlength={20}
                      />
                      <CustomTextField
                        id='capacity'
                        control={control}
                        name='capacity'
                        label='Seating Capacity'
                        type={'number'}
                        placeholder='Seating capacity'
                      />
                      <CustomTextField
                        id='driver-name'
                        control={control}
                        name='driverName'
                        label='Driver Name'
                        placeholder='Driver name'
                      />
                      <Controller
                        name='phone'
                        control={control}
                        defaultValue='+65'
                        rules={{ required: true }}
                        render={({ field }) => (
                          <PhoneNoTextField
                            {...field}
                            setValue={setValue}
                            disableCountry={true}
                            country={'sg'}
                            style='share'
                            label='Contact Number'
                            error={Boolean(errors?.phone?.message)}
                            helperText={errors.phone?.message}
                            onChange={(e: any) => {
                              if (e) {
                                const emptySpace = /^.+\s.+$/g;
                                const isValid = isValidField('contactnumber', e);
                                if (e && !emptySpace.test(e) && isValid) {
                                  handleValidate(e);
                                }
                              }
                              trigger('phone');
                            }}
                          />
                        )}
                      />
                      <Box className='add-external-vehicle-btn'>
                        <CustomButton
                          category={'Add Vehicle'}
                          className='saveChanges'
                          type='submit'
                        />
                      </Box>
                    </Box>
                  </Box>
                </Dialog>
              )}

              <Dialog
                open={feedDialog}
                className='feedback-dialog animate__animated animate__zoomIn animate__fast'
                BackdropProps={{
                  invisible: true
                }}
                fullWidth
                sx={{ minWidth: '250px' }}
                onClose={() => setFeedDialog(false)}
              >
                <Box className='feedback-container'>
                  <Box className='feedback-header'>
                    <Typography paragraph className='feedback-title'>
                      Feedback
                    </Typography>
                    <Box className='feedback-close' onClick={() => setFeedDialog(false)}>
                      <Icon icon='ic:round-close' className='feedback-close-icon' />
                    </Box>
                  </Box>
                  <Box className='feedback-details'>
                    {feedbacks !== null &&
                      feedbacks?.map((feed: any, index: number) => {
                        const { title, reason } = feed;
                        if (feed)
                          return (
                            <Box key={index} className='feedbacks'>
                              <Typography paragraph className='heading'>
                                {title}
                              </Typography>
                              <Typography paragraph className='content'>
                                {reason}
                              </Typography>
                            </Box>
                          );
                      })}
                  </Box>
                </Box>
              </Dialog>
              {suggestionRow?.length > 0 && suggestionRow !== undefined ? (
                <Dialog
                  open={sugDialog}
                  className='feedback-dialog animate__animated animate__zoomIn animate__fast'
                  BackdropProps={{
                    invisible: true
                  }}
                  onClose={() => setSugDialog(false)}
                >
                  <Box
                    className='feedback-container'
                    sx={{ maxWidth: isSm ? '100%' : '600px' }}
                  >
                    <Box className='feedback-header'>
                      <Typography paragraph className='feedback-title'>
                        Suggestions
                      </Typography>
                      <Box className='feedback-close' onClick={() => setSugDialog(false)}>
                        <Icon icon='ic:round-close' className='feedback-close-icon' />
                      </Box>
                    </Box>
                    <Box className='feedback-details'>
                      <Typography paragraph className='suggestions-notes'>
                        A great choice for this tour includes{' '}
                        {formatVehicleSuggestions(suggestionRow)},{' '}
                        <b>Total {suggestionRow?.length} vehicles</b>.
                      </Typography>
                      <Box className='suggestions-details-table'>
                        <Box className='suggestions-d-flex'>
                          <Typography sx={{ fontWeight: 600 }}>Details</Typography>
                          <Box
                            className='suggestions-expanded-icon'
                            onClick={handleSugExpandClick}
                          >
                            <Icon
                              icon={
                                expanded
                                  ? 'icon-park-outline:down'
                                  : 'icon-park-outline:up'
                              }
                            />
                          </Box>
                        </Box>
                        <Collapse in={sugExpanded} timeout='auto' unmountOnExit>
                          <CustomDataGrid
                            rows={suggestionRow}
                            columns={suggestionColumn}
                            loading={initialTourSummary.isLoading}
                            type={'noPageNation'}
                            paginationMode={'client'}
                            stopAnimation={true}
                          />
                        </Collapse>
                      </Box>
                      <Box className='suggestions-warn'>
                        <Icon
                          icon='fluent-color:warning-24'
                          style={{ fontSize: '20px', marginRight: '5px' }}
                        />
                        <Typography>
                          These suggestions are based on the availability of vehicles.
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Dialog>
              ) : (
                ''
              )}

              <Dialog
                open={openSumbitAlert}
                className='feedback-dialog animate__animated animate__zoomIn animate__fast'
                BackdropProps={{
                  invisible: true
                }}
                onClose={() => setOpenSumbitAlert(false)}
              >
                <Box className='feedback-container'>
                  <Box className='feedback-header'>
                    <Typography paragraph className='feedback-title'>
                      Alert
                    </Typography>
                    <Box
                      className='feedback-close'
                      onClick={() => setOpenSumbitAlert(false)}
                    >
                      <Icon icon='ic:round-close' className='feedback-close-icon' />
                    </Box>
                  </Box>
                  <Box className='alert-component'>
                    <Typography className='alert-title'>
                      Are you sure you want to plan schedule?
                    </Typography>
                    <Typography className='alert-content'>
                      There are{' '}
                      {tourSummaryProccedResult?.data?.data?.totalRemainingPassengers > 0
                        ? `${
                            tourSummaryProccedResult?.data?.data?.totalRemainingPassengers
                          } ${customTourRows?.length > 0 ? 'bookings' : 'passengers'} `
                        : initialTourSummary?.data?.data?.totalRemainingPassengers &&
                          tourSummaryProccedResult?.data?.data
                            ?.totalRemainingPassengers !== 0
                        ? `${initialTourSummary?.data?.data?.totalRemainingPassengers} ${
                            customTourRows?.length > 0 ? 'bookings' : 'passengers'
                          } `
                        : ' '}
                      {tourSummaryProccedResult?.data?.data?.transferInstances?.some(
                        (item: any) => item?.vehicleNumber === null
                      ) &&
                      tourSummaryProccedResult?.data?.data?.totalRemainingPassengers !== 0
                        ? 'and '
                        : ''}
                      {tourSummaryProccedResult?.data?.data?.transferInstances?.some(
                        (item: any) => item?.vehicleNumber === null
                      ) &&
                        `${
                          tourSummaryProccedResult?.data?.data?.transferInstances?.filter(
                            (item: any) => item?.vehicleNumber === null
                          ).length
                        } transfers `}
                      still unassigned. If you proceed, you will need to assign them
                      manually in the Excel file.
                    </Typography>
                    <Box className='alert-conform-btn'>
                      <CustomButton
                        category={'No'}
                        className='cancel'
                        onClick={() => setOpenSumbitAlert(false)}
                      />
                      <CustomButton
                        category={'Yes'}
                        className='saveChanges'
                        loading={tourSummaryPlanFrozen.isLoading}
                        onClick={() => handleSubmitTour(true)}
                      />
                    </Box>
                  </Box>
                </Box>
              </Dialog>
              <Dialog
                open={skipMode}
                className='feedback-dialog animate__animated animate__zoomIn animate__fast'
                BackdropProps={{
                  invisible: true
                }}
                onClose={() => setSkipMode(false)}
              >
                <Box className='feedback-container'>
                  <Box className='feedback-header'>
                    <Typography paragraph className='feedback-title'>
                      Alert !
                    </Typography>
                    <Box className='feedback-close' onClick={() => setSkipMode(false)}>
                      <Icon icon='ic:round-close' className='feedback-close-icon' />
                    </Box>
                  </Box>
                  <Box className='alert-component'>
                    <Typography className='alert-title'>
                      Are you sure about changing the mode?
                    </Typography>
                    <Typography className='alert-content'>
                      If you click Yes, the changes might not be saved until the plan
                      schedule.
                    </Typography>
                    <Box className='alert-conform-btn'>
                      <CustomButton
                        category={'No'}
                        className='cancel'
                        onClick={() => setSkipMode(false)}
                      />
                      <CustomButton
                        category={'Yes'}
                        className='saveChanges'
                        onClick={() => handlemodeOtherMode(nextMode)}
                      />
                    </Box>
                  </Box>
                </Box>
              </Dialog>
              <Dialog
                open={openConnectionError}
                className='feedback-dialog animate__animated animate__zoomIn animate__fast'
                BackdropProps={{
                  invisible: true
                }}
                sx={{ zIndex: '4000' }}
              >
                <Box className='feedback-container' sx={{ minWidth: '350px' }}>
                  <Box className='feedback-header'>
                    <Typography paragraph className='feedback-title'>
                      Alert
                    </Typography>
                  </Box>
                  <Box className='alert-component'>
                    <Typography className='alert-title'>Scheduling failed.</Typography>
                    <Typography className='alert-content'>
                      Kindly schedule again.
                    </Typography>
                    <Box className='alert-conform-btn'>
                      <CustomButton
                        category={'Ok'}
                        className='saveChanges'
                        onClick={() => {
                          setOpenConnectionError(false);
                          setAssigning(false);
                          setStopLoader(false);
                          setView(false);
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Dialog>
              {viewMessage &&
                !tourSummaryProccedResult.isLoading &&
                transrows?.some(
                  (item: any) => item?.vehicleNumber === null && item?.message !== null
                ) && (
                  <Drawer anchor='top' open={viewMessage}>
                    <Box className='transfer-summary-message'>
                      <Box className='transfer-head'>
                        <Typography paragraph className='message-content'>
                          Transfer vehicle instruction message
                        </Typography>
                        <Box
                          className='routes-close'
                          onClick={() => setViewMessage(false)}
                        >
                          <Icon icon='ic:round-close' className='routes-close-icon' />
                        </Box>
                      </Box>
                      {!tourSummaryProccedResult.isLoading &&
                        transrows.map((items: any, index: number) => {
                          if (items.message !== null)
                            return (
                              <Box className='transfer-message'>{items.message}</Box>
                            );
                        })}
                    </Box>
                  </Drawer>
                )}
              <Dialog
                open={viewTransfer}
                className='transfer-dialog animate__animated animate__zoomIn animate__fast'
                BackdropProps={{
                  invisible: true
                }}
                onClose={() => setViewTransfer(false)}
              >
                <Box
                  className='transfer-view'
                  sx={{ width: isMd ? '100% !important' : '800px !important' }}
                >
                  <Typography
                    variant='h6'
                    sx={{
                      color: '#333',
                      fontWeight: 600
                    }}
                  >
                    Transfer Details
                  </Typography>
                  <Box className='transfer-close' onClick={() => setViewTransfer(false)}>
                    <Icon icon='ic:round-close' className='transfer-close-icon' />
                  </Box>
                </Box>
                <Box className='transfer-container'>
                  <Grid container spacing={2} className='passenger-details-values'>
                    <Grid item sm={2} className='details-values head'>
                      From
                    </Grid>
                    <Grid item sm={2} className='details-values head'>
                      To
                    </Grid>
                    <Grid item sm={2} className='details-values head'>
                      Time
                    </Grid>
                    <Grid item sm={2} className='details-values head'>
                      Vehicle No
                    </Grid>
                    <Grid item sm={2} className='details-values head'>
                      Driver Name
                    </Grid>
                    <Grid item sm={2} className='details-values head'>
                      Contact Number
                    </Grid>
                  </Grid>
                  {transferValues?.map((value: any, index: number) => (
                    <>
                      {value.transferInstance !== null && (
                        <Grid container spacing={2} className='passenger-details-values'>
                          <Grid item sm={2} className='details-values'>
                            {value?.transferInstance.from.locationAddress}
                          </Grid>
                          <Grid item sm={2} className='details-values'>
                            {value?.transferInstance.to.locationAddress}
                          </Grid>
                          <Grid item sm={2} className='details-values'>
                            {value?.transferInstance?.time
                              ? convertTo12HourFormat(value?.transferInstance?.time)
                              : '-'}
                          </Grid>
                          <Grid item sm={2} className='details-values'>
                            {value?.transferInstance?.vehicleNumber
                              ? `${value?.transferInstance?.vehicleNumber?.toUpperCase()}(${
                                  value?.transferInstance?.seatingCapacity
                                })`
                              : 'N/A'}
                          </Grid>
                          <Grid item sm={2} className='details-values'>
                            {value?.transferInstance.driverName
                              ? value?.transferInstance.driverName
                              : '-'}
                          </Grid>
                          <Grid item sm={2} className='details-values'>
                            {value?.transferInstance.contactNumber
                              ? value?.transferInstance.contactNumber
                              : '-'}
                          </Grid>
                        </Grid>
                      )}
                    </>
                  ))}
                </Box>
              </Dialog>
              <Dialog
                open={viewVehicles}
                className='transfer-dialog animate__animated animate__zoomIn animate__fast'
                BackdropProps={{
                  invisible: true
                }}
                onClose={() => setViewVehicles(false)}
              >
                <Box
                  className='transfer-view'
                  sx={{ width: isMd ? '100% !important' : '800px !important' }}
                >
                  <Typography
                    variant='h6'
                    sx={{
                      color: '#333',
                      fontWeight: 600
                    }}
                  >
                    Passengers Details
                  </Typography>
                  <Box
                    className='transfer-close'
                    onClick={() => setViewVehicles(false)}
                    role='button'
                    tabIndex={0}
                    onKeyDown={(event: any) => {
                      if (event.key === 'Enter') setViewVehicles(false);
                    }}
                  >
                    <Icon icon='ic:round-close' className='transfer-close-icon' />
                  </Box>
                </Box>
                <Box className='transfer-container'>
                  <Grid container spacing={2} className='passenger-details-values'>
                    <Grid item sm={3} className='details-values head'>
                      Guest Name
                    </Grid>
                    <Grid item sm={3} className='details-values head'>
                      Total Passengers
                    </Grid>
                    <Grid item sm={3} className='details-values head'>
                      Pickup Time
                    </Grid>
                    <Grid item sm={3} className='details-values head'>
                      Vehicle No
                    </Grid>
                  </Grid>
                  {vehicleValues?.map((value: any, index: number) => (
                    <Grid container spacing={2} className='passenger-details-values'>
                      <Grid item sm={3} className='details-values'>
                        {value.guestName}
                      </Grid>
                      <Grid item sm={3} className='details-values'>
                        {value.passengers}
                      </Grid>
                      <Grid item sm={3} className='details-values'>
                        {value.pickupTime ? convertTo12HourFormat(value.pickupTime) : '-'}
                      </Grid>
                      <Grid item sm={3} className='details-values'>
                        {value.vehicleNumber
                          ? `${value?.vehicleNumber?.toUpperCase()} (${
                              value?.seatingCapacity
                            })`
                          : 'N/A'}
                      </Grid>
                    </Grid>
                  ))}
                </Box>
              </Dialog>
              <Dialog
                open={openAddGuide}
                className='tour-dialog animate__animated animate__zoomIn animate__fast'
                BackdropProps={{
                  invisible: true
                }}
              >
                <Box
                  className='routes-view'
                  sx={{
                    padding: '20px',
                    width: isSm ? '100% !important' : '500px !important'
                  }}
                >
                  <Box className='routes-view-header' sx={{ padding: '0 !important' }}>
                    <Typography
                      variant='h6'
                      sx={{
                        color: '#333',
                        fontWeight: 600
                      }}
                    >
                      {`Add Guide`}
                    </Typography>
                    <Box className='routes-close' onClick={handleCloseAddGuide}>
                      <Icon icon='ic:round-close' className='routes-close-icon' />
                    </Box>
                  </Box>
                  <Box component={'form'} onSubmit={handleGuideSubmit(addNewGuide)}>
                    <CustomTextField
                      id='guide-name'
                      control={guideControl}
                      name='guideName'
                      label='Guide Name'
                      placeholder='Enter guide name'
                      maxlength={50}
                    />
                    <Controller
                      name='guideNo'
                      control={guideControl}
                      defaultValue='+65'
                      rules={{ required: true }}
                      render={({ field }) => (
                        <PhoneNoTextField
                          {...field}
                          setValue={guideSetValue}
                          style='share'
                          country='sg'
                          label='Contact Number'
                          error={Boolean(guideError?.guideNo?.message)}
                          helperText={guideError?.guideNo?.message}
                          onChange={(e: any) => {
                            if (e) {
                              const emptySpace = /^.+\s.+$/g;
                              const isValid = isValidField('contactnumber', e);
                              if (e && !emptySpace.test(e) && isValid) {
                                handleValidate(e);
                              }
                            }
                            guideTrigger('guideNo');
                          }}
                        />
                      )}
                    />

                    <Box sx={{ padding: '8px' }} />
                    <CustomSelect
                      id='hotel-name'
                      control={guideControl}
                      name='hotelName'
                      label='Hotel Name'
                      placeholder='Select hotel Name'
                      options={getHotelsByTour(selectedTour?.tourName)}
                    />
                    <Box className='add-external-vehicle-btn'>
                      <CustomButton
                        category='Save'
                        className='saveChanges'
                        type='submit'
                      />
                    </Box>
                  </Box>
                </Box>
              </Dialog>
              <Dialog
                open={openViewGuide}
                className='transfer-dialog animate__animated animate__zoomIn animate__fast'
                BackdropProps={{
                  invisible: true
                }}
              >
                <Box className='transfer-view'>
                  <Typography
                    variant='h6'
                    sx={{
                      color: '#333',
                      fontWeight: 600
                    }}
                  >
                    {`Guide`}
                  </Typography>
                  <Box className='transfer-close' onClick={handleCloseViewGuide}>
                    <Icon icon='ic:round-close' className='routes-close-icon' />
                  </Box>
                </Box>
                <Box className='transfer-container'>
                  <Grid container spacing={2} className='passenger-details-values'>
                    <Grid item sm={4} className='details-values head'>
                      Hotel Name
                    </Grid>
                    <Grid item sm={3} className='details-values head'>
                      Guide Name
                    </Grid>
                    <Grid item sm={3} className='details-values head'>
                      Guide No
                    </Grid>
                    <Grid item sm={2} className='details-values head'>
                      Remove
                    </Grid>
                  </Grid>
                  {selectedTour?.hotels?.map((value: any, index: number) => {
                    if (value.guideName !== null)
                      return (
                        <Grid container spacing={2} className='passenger-details-values'>
                          <Grid item sm={4} className='details-values'>
                            {value.hotelName}
                          </Grid>
                          <Grid item sm={3} className='details-values'>
                            {value.guideName}
                          </Grid>
                          <Grid item sm={3} className='details-values'>
                            {value.contactNumber}
                          </Grid>
                          <Grid item sm={2} className='details-values'>
                            <Icon
                              icon='ic:baseline-delete'
                              onClick={() => removeGuide(index)}
                              className='delete-icon'
                            />
                          </Grid>
                        </Grid>
                      );
                  })}
                </Box>
              </Dialog>
              <ModifyVehicle
                open={openModifyVehicle}
                setOpen={setOpenModifyVehicle}
                loader={
                  initialTourSummary?.isLoading || tourSummaryProccedResult?.isLoading
                }
                totalSummary={totalSummary}
                setTotalSummary={setTotalSummary}
                customTourRows={customTourRows}
                loading={tourSummaryProccedResult.isLoading}
                setProceed={setProceed}
              />
            </>
          ) : (
            ''
          )}
        </>
      )}
    </Box>
  );
};

export default TourSummary;
