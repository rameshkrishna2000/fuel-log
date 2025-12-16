import React, { useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Divider,
  Box,
  Menu,
  MenuItem,
  Grid,
  Tooltip,
  Zoom,
  Dialog,
  DialogContent,
  Slide
} from '@mui/material';
import { useSpring, animated } from '@react-spring/web';
import demofile from '../../../assets/files/sampleInput.xlsx';
import ExcelIcon from '../../../assets/images/excel.png';
import PhoneIcon from '@mui/icons-material/Phone';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { TransitionProps } from '@mui/material/transitions';
import EmailIcon from '@mui/icons-material/Email';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CustomButton from '../../../../../common/components/buttons/CustomButton';
import AddAgent from './components/addAgents';
import * as XLSX from 'xlsx';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import constant from '../../../../../utils/constants';
import { Icon, Icon as IconifyIcon } from '@iconify/react';
import { useAppDispatch, useAppSelector } from '../../../../../app/redux/hooks';
import { useForm } from 'react-hook-form';
import CustomTextField from '../../../../../common/components/customized/customtextfield/CustomTextField';
import './agents.scss';
import { debounce, useAbort } from '../../../../../utils/commonFunctions';
import CustomDialogGrid from '../../../../../common/components/customdialogGrid/CustomDialogGrid';
import ErrorDialog from '../../trips/bookings/components/ErrorDialog';
import { agentImportAction } from '../../../redux/reducer/autoPlannerSlices/autoplannerConfigurationSlice';
import { getAgent } from '../../../redux/reducer/autoPlannerSlices/agentslice';
import { updateToast } from '../../../../../common/redux/reducer/commonSlices/toastSlice';
import CustomTab from '../../../../../common/components/tab/CustomTab';
import InfiniteScroll from '../../../../../common/components/infinitescroll/InfiniteScroll';
import RateCard from './ratecard/RateCard';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import {
  useCardActions,
  useCommanSates,
  useFilterPaginationhook,
  useRenderEffect,
  useTabHook
} from './agentsHook';
import { updateData } from '../../../../../common/redux/reducer/commonSlices/websocketSlice';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const Agent = ({ onScroll, setApi, clearState }: any) => {
  const {
    open,
    setOpen,
    selectedAgents,
    setselectedAgents,
    isDialog,
    setIsDialog,
    viewDialogGrid,
    setViewDialogGrid,
    importButtonDisable,
    setImportButtonDisable,
    filter,
    setFilter,
    jsonDATA,
    setJsonData,
    isHover,
    setIsHover,
    excelData,
    setExcelData,
    deleteError,
    setDeleteError,
    importFile,
    setImportFile,
    errorShow,
    setErrorShow,
    excelRows,
    setExcelRows,
    INexcelRows,
    page,
    setPage,
    isScroll,
    setIsScroll
  } = useCommanSates();

  const dispatch = useAppDispatch();
  const inputRef = useRef<any>();

  const { isLoading } = useAppSelector(state => state.excelImportAgents);
  const {
    data: agentDetails,
    count: agentDetailsCount,
    isLoading: agentDetailsLoading
  } = useAppSelector(state => state.autoplannerAgent);

  const { company } = useAppSelector(state => state.RoleModuleAccess);

  const { count: rateCardDeatilsCount } = useAppSelector(
    state => state.getRateCardDetailsReducer
  );
  const deleteAgentData = useAppSelector(state => state.autoagentDelete);

  const error: any = useAppSelector(
    state => state.excelImportAgents.data || [{ invalidExcelRows: [] }]
  );
  const { data } = useAppSelector(state => state.auth);
  const { child } = useAppSelector(state => state.childComponent);
  const { category } = useAppSelector(state => state.RoleModuleAccess);

  let roletype = data?.role;
  const APagent = roletype === 'ROLE_AGENT';
  const APsuperAdmin = roletype === 'ROLE_AUTOPLANNER_ADMIN';
  const APoperator = roletype === 'ROLE_OPERATOR';
  let roleList = ['Agent Admin', 'Rate Card'];

  const createAbort = useAbort();

  const { control, setValue } = useForm<any>({});

  const { handleTrip, role, setTabValue, tabValue, setRole } = useTabHook(
    setIsScroll,
    setValue,
    createAbort
  );

  const {
    handleUpdateVehicle,
    handleMenuClose,
    handleMenuClick,
    anchorEl,
    handleDeleteTrip,
    onclose
  } = useCardActions({
    setselectedAgents,
    setDeleteError,
    setOpen,
    setIsScroll,
    selectedAgents,
    role,
    page,
    setIsDialog
  });

  const { handleFilterChange, handleInfinitePagination } = useFilterPaginationhook({
    setIsScroll,
    setFilter,
    role,
    agentDetailsLoading
  });

  const props = useSpring({
    val: role !== 'RATE_CARD' ? agentDetailsCount : rateCardDeatilsCount,
    from: { val: 0 },
    config: { duration: 300 }
  });

  const agentCountSpring = useSpring({
    from: { transform: 'translateY(-50px)', opacity: 0 },
    to: { transform: 'translateY(0px)', opacity: 1 },
    config: { tension: 200, friction: 12 },
    delay: 300
  });

  const capitalizeFirstLetter = (text: string) => {
    return text?.charAt(0)?.toUpperCase() + text?.slice(1);
  };

  const handleViewOpen = () => {
    setViewDialogGrid(false);
    setImportButtonDisable(false);
  };

  const handleClose = () => {
    setIsDialog('');
    dispatch(updateData({ progress: 'FAILED', date: 'Loading', action: 'ExcelUpload' }));
    // if (connection) connection.close();
  };

  const handleImportFile = () => {
    setIsDialog('Import');
  };

  const handleDialogGridClose = () => {
    setViewDialogGrid(false);
  };

  const handleRemoveUploadedFile = () => {
    setImportFile(null);
    setExcelRows([]);
    setImportButtonDisable(true);
    setErrorShow(false);
  };

  const handleCloseImport = () => {
    if (!isLoading) {
      setIsDialog('');
      setImportFile(null);
      setExcelRows([]);
      setErrorShow(false);
    }
  };

  const handleUpload = () => {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = '.xlsx,.xls';
    inputElement.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) return;
      const allowedExtensions = ['xlsx', 'xls'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        dispatch(
          updateToast({
            show: true,
            message: 'Please upload a valid Excel file (.xlsx or .xls)',
            severity: 'warning'
          })
        );
        setImportFile(null);
        return;
      }
      const fileReader = new FileReader();
      fileReader.onload = (event: any) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX?.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let originalObj: any = {};

        for (const keys in sheet) {
          originalObj[`${keys}`] =
            keys === '!margins' || keys === '!ref'
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
    }
    const payload = {
      pageNo: page,
      pageSize: 20,
      role: role,
      signal: createAbort().abortCall.signal
    };
    const action = await dispatch(agentImportAction({ file: importFile, invalidRows }));
    if (action.type === agentImportAction.fulfilled.type) {
      dispatch(getAgent(payload));
    }
    if (action.type === agentImportAction.rejected.type) {
      dispatch(
        updateData({ progress: 'FAILED', date: 'Loading', action: 'ExcelUpload' })
      );
    }
    //     if (connection) connection.close();
    //   } else {
    //     dispatch(updateData({ progress: 0, date: 'Loading', action: 'ExcelUpload' }));
    //   }
    //   setImportFilePickup(importFile);
    if (!isLoading) {
      handleCloseImport();
      setImportButtonDisable(true);
      if (error.invalidExcelRows?.length === 0) {
        dispatch(getAgent(createAbort().abortCall.signal));
      }
    }
    // } else setErrorShow(true);
    if (error) {
      setIsDialog('Error');
    }
    // if (connection !== null) connection.close();
    // dispatch(createConnection(''));
  };

  //handle pagination

  // useEffect(() => {
  //   if (!excelData) return;

  //   const headers = excelData[0].map((header: string) => header.toLowerCase().trim());

  //   const excelJSON = excelData
  //     .slice(1)
  //     .filter((row: any[]) =>
  //       row.some((value: any) => value !== undefined && value !== '')
  //     )
  //     .map((row: any[], index: number) => {
  //       const rowObject = headers.reduce(
  //         (acc: Record<string, any>, header: string, colIndex: number) => {
  //           acc[header] = row[colIndex]; // Map column value based on header name
  //           return acc;
  //         },
  //         {}
  //       );

  //       return {
  //         id: index + 1,
  //         sno: index + 1,
  //         agent: rowObject['agent'],
  //         contactPerson: rowObject['contact person'],
  //         contactnumber: rowObject['contact number'],
  //         emailaddress: rowObject['email address'],
  //         websiteURL: rowObject['website url'] ? rowObject['website url'] : null,
  //         country: rowObject['country']
  //       };
  //     });

  //   setJsonData(excelJSON);

  //   let filteredData = excelJSON.filter(
  //     ({
  //       agent,
  //       contactPerson,
  //       contactnumber,
  //       emailaddress,
  //       country,
  //       websiteURL,
  //       tour,
  //       child
  //     }: any) => {
  //       // If all specified fields are not strings → invalid
  //       if (
  //         [
  //           typeof agent,
  //           typeof contactPerson,
  //           typeof contactnumber,
  //           typeof emailaddress,
  //           typeof country,
  //           typeof websiteURL
  //         ].every(type => type !== 'string')
  //       ) {
  //         return true;
  //       }

  //       // If any required field is undefined → invalid
  //       if (
  //         [
  //           agent,
  //           contactPerson,
  //           contactnumber,
  //           emailaddress,
  //           country,
  //           websiteURL
  //         ].includes(undefined)
  //       ) {
  //         return true;
  //       }

  //       if (typeof agent === 'string') {
  //         return false;
  //       }
  //       if (
  //         websiteURL &&
  //         typeof websiteURL === 'string' &&
  //         !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/.test(websiteURL)
  //       ) {
  //         return true;
  //       }

  //       return false;
  //     }
  //   );

  //   setExcelRows(filteredData);
  //   setINExcelRows(filteredData);
  //   filteredData?.length === 0 && setImportButtonDisable(false);
  //   setViewDialogGrid(true);
  // }, [excelData]);

  useEffect(() => {
    if (excelData?.length > 1) {
      const allowedHeaders = new Set([
        'User Name',
        'Password',
        'Contact Person',
        'Contact Number',
        'Email Address',
        'Country',
        'Website Url'
      ]);

      const actualHeaders = excelData[0].map((header: string) => header.trim());
      const headersLower = actualHeaders.map((header: string) => header.toLowerCase());

      const allowedHeadersLower = Array.from(allowedHeaders).map(h => h.toLowerCase());

      const invalidHeaderRegex = /[^a-z\s]/i;

      const invalidHeaders = actualHeaders.filter(
        (header: any) =>
          !allowedHeadersLower.includes(header.toLowerCase()) ||
          invalidHeaderRegex.test(header)
      );

      const missingHeader = allowedHeadersLower.filter(
        allowedHeader => !headersLower.includes(allowedHeader)
      );

      if (invalidHeaders.length > 0) {
        dispatch(
          updateToast({
            show: true,
            message: `Invalid header names found: ${invalidHeaders.join(', ')}`,
            severity: 'warning'
          })
        );
        return;
      } else if (missingHeader?.length > 0) {
        dispatch(
          updateToast({
            show: true,
            message: `Missing required headers: ${missingHeader.join(', ')}`,
            severity: 'warning'
          })
        );
        return;
      }

      const excelJSON = excelData
        .slice(1)
        .filter((row: any) =>
          row.some((value: any) => value !== undefined && value !== '')
        )
        .map((row: any, index: number) => {
          const rowObject = actualHeaders.reduce(
            (acc: any, header: string, colIndex: number) => {
              acc[header] = row[colIndex];
              return acc;
            },
            {}
          );
          return {
            id: index + 1,
            username: rowObject['User Name'],
            password: rowObject['Password'],
            contactPerson: rowObject['Contact Person'],
            contactNumber: rowObject['Contact Number'],
            email: rowObject['Email Address'],
            country: rowObject['Country'],
            website: rowObject['Website Url']
          };
        });

      setJsonData(excelJSON);

      let filteredData = excelJSON?.filter(
        ({
          id,
          username,
          password,
          contactPerson,
          contactNumber,
          email,
          country,
          website
        }: any) => {
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).{8,}$/;
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          const websiteRegex =
            /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/;
          const usernameRegex = /^(?=.*[a-z])[a-z0-9]+$/;
          const nameRegex = /^[A-Za-z\s]+$/;
          const contactNumberRegex = /^\+\d{1,4}[\s-]?\d{4,}$/;

          if (
            typeof username !== 'string' ||
            username.trim() === '' ||
            !/^(?=.*[a-z])[a-z0-9]+$/.test(username)
          ) {
            return true;
          } else if (typeof password !== 'string' || password.trim() === '') {
            return true;
          } else if (!passwordRegex.test(password)) {
            return true;
          } else if (
            typeof contactPerson !== 'string' ||
            contactPerson.trim() === '' ||
            !nameRegex.test(contactPerson)
          ) {
            return true;
          } else if (
            typeof contactNumber !== 'string' ||
            contactNumber.trim() === '' ||
            !contactNumberRegex.test(contactNumber)
          ) {
            return true;
          } else if (typeof email !== 'string' || email.trim() === '') {
            return true;
          } else if (!emailRegex.test(email)) {
            return true;
          } else if (
            typeof country !== 'string' ||
            country.trim() === '' ||
            !nameRegex.test(country)
          ) {
            return true;
          } else if (
            typeof website === 'string' &&
            website.trim() !== '' &&
            !websiteRegex.test(website)
          ) {
            return true;
          }

          return false;
        }
      );

      setExcelRows(filteredData);
      filteredData?.length === 0 && setImportButtonDisable(false);
      setViewDialogGrid(true);
    }
  }, [excelData]);

  let excelColumns = [
    {
      field: 'id',
      headerName: 'Row No',
      minWidth: 150,
      flex: 1
    },
    {
      field: 'username',
      headerName: 'User Name',
      minWidth: 150,
      flex: 1,
      cellClassName: (params: any) => {
        const usernameRegex = /^(?=.*[a-z])[a-z0-9]+$/;
        if (
          typeof params.value !== 'string' ||
          params.value.trim() === '' ||
          !usernameRegex.test(params.value)
        ) {
          return 'super-app-theme--cell';
        }
      }
    },
    {
      field: 'password',
      headerName: 'Password',
      minWidth: 150,
      flex: 1,
      cellClassName: (params: any) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).{8,}$/;
        const value = params.value;
        if (
          typeof value !== 'string' ||
          value.trim() === '' ||
          !passwordRegex.test(value)
        ) {
          return 'super-app-theme--cell';
        }
      }
    },
    {
      field: 'contactPerson',
      headerName: 'Contact Person',
      minWidth: 150,
      flex: 1,
      cellClassName: (params: any) => {
        const nameRegex = /^[A-Za-z\s]+$/;
        if (
          typeof params.value !== 'string' ||
          params.value.trim() === '' ||
          !nameRegex.test(params.value)
        ) {
          return 'super-app-theme--cell';
        }
      }
    },
    {
      field: 'contactNumber',
      headerName: 'Contact Number',
      minWidth: 150,
      flex: 1,
      cellClassName: (params: any) => {
        const contactNumberRegex = /^\+\d{1,4}[\s-]?\d{4,}$/;
        if (
          typeof params.value !== 'string' ||
          params.value.trim() === '' ||
          !contactNumberRegex.test(params.value)
        ) {
          return 'super-app-theme--cell';
        }
      }
    },
    {
      field: 'email',
      headerName: 'Email Address',
      minWidth: 200,
      flex: 1,
      cellClassName: (params: any) => {
        const value = params.value;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (typeof value !== 'string' || value.trim() === '' || !emailRegex.test(value)) {
          return 'super-app-theme--cell';
        }
      }
    },
    {
      field: 'country',
      headerName: 'Country',
      minWidth: 150,
      flex: 1,
      cellClassName: (params: any) => {
        const nameRegex = /^[A-Za-z\s]+$/;
        if (
          typeof params.value !== 'string' ||
          params.value.trim() === '' ||
          !nameRegex.test(params.value)
        ) {
          return 'super-app-theme--cell';
        }
      }
    },
    {
      field: 'website',
      headerName: 'Website URL',
      minWidth: 200,
      flex: 1,
      cellClassName: (params: any) => {
        const value = params.value;
        const urlRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/;
        if (typeof value === 'string' && value.trim() !== '' && !urlRegex.test(value)) {
          return 'super-app-theme--cell';
        }
      }
    }
  ];

  useRenderEffect({
    setApi,
    handleInfinitePagination,
    agentDetails,
    agentDetailsCount,
    deleteAgentData,
    setDeleteError,
    APagent,
    APsuperAdmin,
    setRole,
    APoperator,
    role,
    page
  });

  return (
    <Box className={`${APagent ? 'agent-padding' : ''} agent-container`}>
      {APagent && (
        <Box className={'agent-box'}>
          <Icon icon='mdi:office-building' className='icon' />
          <Typography className='text'>
            <strong>Company Name:</strong> {capitalizeFirstLetter(company) || 'N/A'}
          </Typography>
        </Box>
      )}

      <Box className='agent-header'>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          marginBottom='20px'
          className='agent-header-btns'
        >
          <Box display='flex' alignItems='center'>
            {error?.invalidExcelRows?.length > 0 && (
              <Tooltip
                title='View Invalid Data'
                TransitionProps={{ timeout: 300 }}
                TransitionComponent={Zoom}
                placement='top'
                arrow
              >
                <Box
                  onClick={() => {
                    setIsDialog('Error');
                  }}
                  sx={{ cursor: 'pointer', marginRight: '16px' }}
                >
                  <Icon icon='mingcute:question-fill' className='invalid-data-icon' />
                </Box>
              </Tooltip>
            )}

            {(APoperator || APsuperAdmin || APagent) && (
              <CustomButton
                className='saveChanges'
                category={
                  role !== 'RATE_CARD'
                    ? `Add ${APagent ? 'Agent User' : 'Agent Admin'}`
                    : 'Add Rate Card'
                }
                onClick={() => {
                  if (role !== 'RATE_CARD') {
                    setOpen(true);
                    setselectedAgents(null);
                  } else {
                    child.add();
                  }
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      <Box
        className='agent-header-search'
        sx={{ width: '100%', marginTop: APagent ? '10px' : 0 }}
      >
        {!APagent && (
          <Box sx={{ overflowX: 'auto', maxWidth: '100%' }}>
            <CustomTab onChange={handleTrip} value={tabValue} tabList={roleList} />
          </Box>
        )}
        {APagent && (
          <Typography sx={{ fontSize: '22px', fontWeight: 600, marginRight: '20px' }}>
            Agent Users
          </Typography>
        )}
        <Typography variant='h5' sx={{ fontWeight: 600, position: 'relative' }}>
          Total {role !== 'RATE_CARD' ? 'Users' : 'Ratecards'}:
          <animated.span style={agentCountSpring}>
            {props.val.to(val => Math.floor(val))}
          </animated.span>
        </Typography>
        <Box sx={{ width: 200 }}>
          <CustomTextField
            name='search'
            control={control}
            id='filter-input'
            placeholder='Search...'
            value={filter}
            variant='standard'
            icon={<SearchOutlinedIcon color='primary' />}
            onChangeCallback={(e: any) =>
              role !== 'RATE_CARD' ? handleFilterChange(e) : child.filter(e)
            }
          />
        </Box>
        {role !== 'RATE_CARD' && (
          <>
            {agentDetailsLoading && !isScroll ? (
              <Box className='loader'>
                <Box className='spinner'></Box>
              </Box>
            ) : agentDetails && agentDetails?.length === 0 ? (
              <Box className='loader'>
                <Typography paragraph>No Data Found</Typography>
              </Box>
            ) : (
              <>
                {agentDetails?.length > 0 ? (
                  <>
                    <Box
                      onScroll={() => {
                        setIsScroll(true);
                        const { scrollTop, scrollHeight, clientHeight } =
                          inputRef.current;
                        const data = { scrollTop, scrollHeight, clientHeight };
                        // if (scrollTop !== 0) {
                        onScroll(data);
                        // }
                      }}
                      ref={inputRef}
                      sx={{
                        width: '100%',
                        padding: '20px',
                        height:
                          agentDetailsCount > 20 && !APsuperAdmin
                            ? '76vh'
                            : APsuperAdmin
                            ? '64vh'
                            : '70vh',
                        overflowY: 'auto'
                      }}
                    >
                      <Grid container spacing={1.5}>
                        {agentDetails?.map((agent: any, index: any) => (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Card
                              className='agent-card'
                              sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                              }}
                            >
                              <Box className='agent-card-header'>
                                <Box className='agent-card-title'>
                                  <Avatar className='agent-avatar'>
                                    {capitalizeFirstLetter(
                                      APagent
                                        ? agent.contactPersonName?.charAt(0) || ''
                                        : agent.companyName?.charAt(0) || ''
                                    )}
                                  </Avatar>

                                  <Box className='agent-title-text'>
                                    <Tooltip
                                      title={
                                        APagent
                                          ? `Name : ${agent.contactPersonName || ''}`
                                          : `Agent name : ${agent.companyName || ''}`
                                      }
                                      arrow
                                      placement='top-start'
                                    >
                                      <Typography className='agent-title'>
                                        {capitalizeFirstLetter(
                                          APagent
                                            ? agent.contactPersonName || 'N/A'
                                            : agent.companyName || 'N/A'
                                        )}
                                      </Typography>
                                    </Tooltip>

                                    {!APagent && (
                                      <Tooltip
                                        title={capitalizeFirstLetter(
                                          agent.contactPersonName
                                            ? agent.contactPersonName
                                            : 'Agent Profile'
                                        )}
                                        arrow
                                        placement='bottom-start'
                                      >
                                        <Typography className='agent-subheader'>
                                          {agent.contactPersonName
                                            ? agent.contactPersonName
                                            : 'Agent Profile'}
                                        </Typography>
                                      </Tooltip>
                                    )}
                                  </Box>
                                </Box>
                                <Box
                                  className='agent-menu-icon'
                                  onClick={e => handleMenuClick(e, agent)}
                                  id='button'
                                  tabIndex={0}
                                  onKeyDown={(event: any) => {
                                    if (event.key === 'Enter') {
                                      handleMenuClick(event, agent);
                                    }
                                  }}
                                >
                                  <MoreVertIcon />
                                </Box>
                              </Box>
                              <Divider />
                              <CardContent>
                                {/* <Tooltip title={agent.companyName} arrow>
                                  <Box className='agent-card-contents'>
                                    <BusinessIcon sx={{ color: '#767aeb', mr: 1 }} />
                                    <Typography
                                      noWrap
                                      className='content-overflow'
                                      variant='body1'
                                    >
                                      {agent.companyName || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Tooltip> */}

                                <Tooltip title={agent.contactNumber} arrow>
                                  <Box
                                    className='agent-card-contents'
                                    onClick={() =>
                                      (window.location.href = `tel:${agent.contactNumber}`)
                                    }
                                  >
                                    <PhoneIcon sx={{ color: '#767aeb', mr: 1 }} />
                                    <Typography
                                      noWrap
                                      className='content-overflow'
                                      variant='body1'
                                    >
                                      {agent.contactNumber}
                                    </Typography>
                                  </Box>
                                </Tooltip>

                                <Tooltip title={agent.email} arrow>
                                  <Box
                                    className='agent-card-contents'
                                    onClick={() =>
                                      (window.location.href = `mailto:${agent.email}`)
                                    }
                                  >
                                    <EmailIcon sx={{ color: '#767aeb', mr: 1 }} />
                                    <Typography
                                      noWrap
                                      className='content-overflow'
                                      variant='body1'
                                    >
                                      {agent.email}
                                    </Typography>
                                  </Box>
                                </Tooltip>
                                {role == 'ROLE_AGENT' && (
                                  <Tooltip title={agent.rateCardName} arrow>
                                    <Box className='agent-card-contents'>
                                      <CreditCardIcon sx={{ color: '#767aeb', mr: 1 }} />
                                      <Typography
                                        noWrap
                                        className='content-overflow'
                                        variant='body1'
                                      >
                                        {agent.rateCardName
                                          ? capitalizeFirstLetter(agent.rateCardName)
                                          : '-'}
                                      </Typography>
                                    </Box>
                                  </Tooltip>
                                )}
                                {/* 
                          <Tooltip title={agent.country} arrow>
                            <Box className='agent-card-contents'>
                              <LocationOnIcon sx={{ color: '#767aeb', mr: 1 }} />
                              <Typography
                                noWrap
                                className='content-overflow'
                                variant='body1'
                              >
                                {agent.country}
                              </Typography>
                            </Box>
                          </Tooltip> */}

                                {/* Timezone - Add this after country */}
                                {/* {agent.timezone && (
                            <Tooltip title={`Timezone: ${agent.timezone}`} arrow>
                              <Box className='agent-card-contents'>
                                <AccessTimeIcon sx={{ color: '#767aeb', mr: 1 }} />
                                <Typography
                                  noWrap
                                  className='content-overflow'
                                  variant='body1'
                                >
                                  {agent.timezone}
                                </Typography>
                              </Box>
                            </Tooltip>
                          )} */}
                                {role == 'ROLE_AGENT' && (
                                  <Box
                                    mt={2}
                                    sx={{ display: 'flex', justifyContent: 'flex-end' }}
                                  >
                                    <CustomButton
                                      className='viewWebsite'
                                      category={
                                        agent.website
                                          ? 'View Website'
                                          : 'No Website Available'
                                      }
                                      onClick={() => {
                                        if (agent.website) {
                                          const formattedUrl = /^https?:\/\//i.test(
                                            agent.website
                                          )
                                            ? agent.website
                                            : `https://${agent.website}`;
                                          window.open(formattedUrl, '_blank');
                                        }
                                      }}
                                      disabled={!agent.website}
                                      sx={{
                                        background: agent.website
                                          ? ' linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                          : '#f0f0f0',
                                        color: agent.website ? '#fff' : '#9e9e9e',
                                        fontWeight: agent.website ? 'normal' : 'bold',
                                        padding: '10px 20px',
                                        borderRadius: '10px',
                                        width: '100%',
                                        boxShadow: agent.website
                                          ? '0 2px 8px rgba(0, 102, 204, 0.3)'
                                          : 'none',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          backgroundColor: agent.website
                                            ? '#80bfff'
                                            : '#e0e7f5',
                                          boxShadow: agent.website
                                            ? '0 4px 8px rgba(0, 102, 204, 0.4)'
                                            : 'none',
                                          color: agent.website ? '#fff' : '#9e9e9e'
                                        }
                                      }}
                                      startIcon={
                                        agent.website && <IconifyIcon icon='mdi:web' />
                                      }
                                    />
                                  </Box>
                                )}
                              </CardContent>

                              <Menu
                                id='button'
                                tabIndex={0}
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                              >
                                <MenuItem
                                  className='menu-dialog'
                                  id='button'
                                  tabIndex={0}
                                  onKeyDown={(event: any) => {
                                    if (event.key === 'Enter') {
                                      handleUpdateVehicle();
                                    }
                                  }}
                                  onClick={handleUpdateVehicle}
                                  key='update'
                                >
                                  <IconifyIcon
                                    icon='ic:baseline-edit'
                                    className='menu-icon update'
                                  />
                                  {constant.Update}
                                </MenuItem>
                                <MenuItem
                                  className='menu-dialog'
                                  id='button'
                                  tabIndex={0}
                                  onKeyDown={(event: any) => {
                                    if (event.key === 'Enter') {
                                      setIsDialog('Delete');
                                      handleMenuClose();
                                    }
                                  }}
                                  onClick={() => {
                                    setIsDialog('Delete');
                                    handleMenuClose();
                                  }}
                                >
                                  <IconifyIcon
                                    icon='ic:outline-delete'
                                    className='menu-icon'
                                    style={{ color: '#FF4343' }}
                                  />
                                  {constant.Delete}
                                </MenuItem>
                              </Menu>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </>
                ) : (
                  <Box className='no-agent'>
                    <Typography className='text'>No Data Found</Typography>
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Box>
      {role === 'RATE_CARD' && <RateCard />}

      <Dialog open={isDialog === 'Delete'}>
        <Box
          sx={{
            textAlign: 'center',
            padding: '5%',
            minWidth: '350px'
          }}
        >
          <Typography>Are you sure you want to delete this user?</Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              paddingTop: '5%',
              justifyContent: 'center'
            }}
          >
            <Box sx={{ marginRight: '12px' }}>
              <CustomButton
                className='saveChanges'
                category='Yes'
                loading={deleteAgentData?.isLoading}
                onClick={() => {
                  handleDeleteTrip();
                }}
              />
            </Box>
            <CustomButton
              className='cancel'
              category='No'
              onClick={() => {
                setIsDialog('');
              }}
            />
          </Box>
        </Box>
      </Dialog>
      <Dialog
        open={isDialog === 'Import'}
        className='import-dialog animate__animated animate__zoomIn'
        BackdropProps={{
          invisible: true
        }}
      >
        <Box className='import-file-dialog'>
          <Box className='d-flex import-file-head'>
            <Typography paragraph className='import-file-title'>
              Import Agent File
            </Typography>
            <Box className='import-file-close' onClick={handleCloseImport}>
              <Icon icon='ic:round-close' className='import-file-close-icon' />
            </Box>
          </Box>
          {importFile?.name ? (
            <Box className='uploaded-file'>
              <Box component={'img'} src={ExcelIcon} className='uploaded-excel-icon' />
              <Typography paragraph className='uploaded-excel-name'>
                {importFile.name}
              </Typography>
              <Box className='remove-uploaded-file' onClick={handleRemoveUploadedFile}>
                <Icon icon='ic:round-close' />
              </Box>
            </Box>
          ) : (
            <Box className='import-form'>
              <Box className='upload-btn' onClick={handleUpload}>
                Click to Upload file
              </Box>
              {errorShow && (
                <Typography className='file-error-message'>Select File</Typography>
              )}
            </Box>
          )}
          <Box className='disclaimer'>
            <Box className='disclaimer-head'>
              <Icon icon='fluent-color:warning-24' style={{ fontSize: '22px' }} />
              <Typography paragraph className='disclaimer-title'>
                Only files in the specified format are allowed for upload
              </Typography>
              <Tooltip
                title='Click to download the sample sheet'
                TransitionProps={{ timeout: 300 }}
                TransitionComponent={Zoom}
                arrow
              >
                <Box
                  className='download-demo-file'
                  component='a'
                  href={demofile}
                  download
                >
                  <Icon icon='tabler:download' className='file-download-icon' />
                </Box>
              </Tooltip>
            </Box>
          </Box>

          {viewDialogGrid && excelRows?.length > 0 && (
            <CustomDialogGrid
              rows={excelRows}
              type='autoplannertrip'
              columns={excelColumns}
              view={viewDialogGrid}
              handleViewClose={handleDialogGridClose}
              handleViewOpen={handleViewOpen}
            />
          )}

          <Box
            className='import-file-submit'
            sx={{
              justifyContent: excelRows?.length > 0 ? 'space-between' : 'flex-end'
            }}
          >
            {excelRows?.length > 0 && (
              <Tooltip
                onMouseOver={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
                title='Invalid Excel Data'
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
                  <Icon icon='mingcute:question-fill' className='excel-data-icon' />
                </Box>
              </Tooltip>
            )}
            <Box sx={{ display: 'flex' }}>
              <Box sx={{ marginRight: '12px' }}>
                <CustomButton
                  className='cancel'
                  category='Cancel'
                  onClick={handleCloseImport}
                />
              </Box>
              <CustomButton
                className='saveChanges'
                category='Import'
                disabled={importButtonDisable}
                loading={isLoading}
                onClick={handleImportfile}
              />
            </Box>
          </Box>
        </Box>
      </Dialog>
      <Dialog
        open={deleteError}
        onClose={onclose}
        maxWidth='xs'
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: 5,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(255, 107, 107, 0.25)',
            backdropFilter: 'blur(12px)',
            boxShadow:
              '0 25px 50px rgba(255, 107, 107, 0.25), 0 10px 20px rgba(0, 0, 0, 0.1)'
          }
        }}
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(6px)'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box
            sx={{
              height: 6,
              background: 'linear-gradient(90deg, #ff4e50, #f9d423)'
            }}
          />

          <Box sx={{ p: 3, pb: 2.5, position: 'relative' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ErrorOutlineIcon sx={{ color: '#ff4e50', fontSize: 28 }} />
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    color: '#e74c3c',
                    letterSpacing: 0.5
                  }}
                >
                  Unable to Delete
                </Typography>
              </Box>

              <IconButton
                onClick={onclose}
                sx={{
                  width: 38,
                  height: 38,
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  color: '#2c3e50',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255,107,107,0.15)',
                    color: '#e74c3c'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {deleteAgentData.data?.message && (
              <Box sx={{ pl: 0.5 }}>
                {deleteAgentData.data?.message
                  .split('.')
                  .filter((msg: string) => msg.trim())
                  .map((msg: string, i: number) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        mb: 1.5,
                        gap: 1.5
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          mt: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#e74c3c'
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: '0.95rem',
                          fontWeight: i === 2 ? 600 : 400,
                          color: i === 2 ? '#e74c3c' : '#2c3e50',
                          lineHeight: 1.5
                        }}
                      >
                        {msg.trim()}.
                      </Typography>
                    </Box>
                  ))}
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {agentDetailsCount > 20 && (
        <Box className='agent-pagination'>
          {/* <Pagination
            count={Math.ceil(agentDetailsCount / 20)}
            page={page}
            onChange={handlePageChange}
            variant='outlined'
            shape='rounded'
          /> */}
        </Box>
      )}
      {open && (
        <AddAgent
          setOpen={setOpen}
          open={open}
          selected={selectedAgents}
          roles={role}
          page={page}
          tabValue={tabValue}
          clearState={clearState}
          setIsScroll={setIsScroll}
          setTabValue={setTabValue}
        />
      )}
      {error?.invalidExcelRows?.length > 0 ? (
        <ErrorDialog isOpen={isDialog === 'Error'} onClose={handleClose} errors={error} />
      ) : (
        ''
      )}
    </Box>
  );
};

export default InfiniteScroll(Agent);
