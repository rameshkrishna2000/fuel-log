import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  CardHeader,
  IconButton,
  Divider,
  Box,
  Alert,
  Menu,
  MenuItem,
  Grid,
  Tooltip,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  useMediaQuery,
  Chip,
  Slide,
  Button
} from '@mui/material';
import { useSpring, animated } from '@react-spring/web';

import PhoneIcon from '@mui/icons-material/Phone';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { TransitionProps } from '@mui/material/transitions';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import * as XLSX from 'xlsx';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Icon, Icon as IconifyIcon } from '@iconify/react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../../app/redux/hooks';
import { updateData } from '../../../../common/redux/reducer/commonSlices/websocketSlice';
import { updateToast } from '../../../../common/redux/reducer/commonSlices/toastSlice';
import { agentImportAction } from '../../redux/reducer/autoPlannerSlices/autoplannerConfigurationSlice';
import { getAgent } from '../../redux/reducer/autoPlannerSlices/agentslice';
import { debounce, useAbort } from '../../../../utils/commonFunctions';
import CustomButton from '../../../../common/components/buttons/CustomButton';
import CustomTextField from '../../../../common/components/customized/customtextfield/CustomTextField';
import CustomTab from '../../../../common/components/tab/CustomTab';
import constant from '../../../../utils/constants';
import CustomDialogGrid from '../../../../common/components/customdialogGrid/CustomDialogGrid';
import ErrorDialog from './bookings/components/ErrorDialog';
import InfiniteScroll from '../../../../common/components/infinitescroll/InfiniteScroll';
import AddOperator from './AddOperator/AddOperator';
import { resetUserRoleState } from '../../../../common/redux/reducer/commonSlices/roleSlice';
import CustomIconButton from '../../../../common/components/buttons/CustomIconButton';
import {
  useCardActions,
  useCommanOperatorSates,
  useFilterPaginationhook,
  useRenderEffect,
  useTabHook
} from './operationTeamHook';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const App = ({ onScroll, setApi, clearState }: any) => {
  const dispatch = useAppDispatch();
  const inputRef = useRef<any>();
  const { isLoading } = useAppSelector(state => state.excelImportAgents);
  const {
    data: agentDetails,
    count: agentDetailsCount,
    isLoading: agentDetailsLoading
  } = useAppSelector(state => state.autoplannerAgent);
  const deleteAgentData = useAppSelector(state => state.autoagentDelete);

  const RoleAccess = useAppSelector(state => state.GETuserRole);

  const error: any = useAppSelector(
    state => state.excelImportAgents.data || [{ invalidExcelRows: [] }]
  );
  const { data } = useAppSelector(state => state.auth);
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
    view,
    setView,
    setJsonData,
    isHover,
    setIsHover,
    excelData,
    selectedFeature,
    setSelectedFeature,
    setExcelData,
    deleteError,
    setDeleteError,
    importFile,
    setImportFile,
    errorShow,
    setErrorShow,
    excelRows,
    featureData,
    setFeatureData,
    setExcelRows,
    INexcelRows,
    page,
    setPage,
    isScroll,
    setIsScroll
  } = useCommanOperatorSates();

  const { control, setValue } = useForm<any>({});

  const createAbort = useAbort();

  const { handleTrip, role, setTabValue, tabValue, setRole } = useTabHook(
    setIsScroll,
    setValue,
    createAbort
  );

  const {
    handleUpdateVehicle,
    handleUserAccess,
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
    setView,
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

  let roletype = data?.role;
  const APagent = roletype === 'ROLE_AGENT';
  const APsuperAdmin = roletype === 'ROLE_AUTOPLANNER_ADMIN';
  const ApOperator = roletype === 'ROLE_OPERATOR';

  let roleList = [...(APsuperAdmin ? ['Operation Admin'] : []), 'Operation User'];

  const isLg = useMediaQuery('(min-width:810px)');

  const props = useSpring({
    val: agentDetailsCount,
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
    return text.charAt(0).toUpperCase() + text.slice(1);
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

  // useEffect(() => {
  //   if (ApOperator) {
  //     setTabValue(1);
  //   }
  // }, []);

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
    role,
    ApOperator,
    page,
    RoleAccess,
    setFeatureData,
    setSelectedFeature
  });

  return (
    <Box className={`${APagent ? 'agent-padding' : ''} agent-container`}>
      <Box className='agent-header'>
        <Box display={'flex'} marginBottom={'20px'} className='agent-header-btns'>
          {error?.invalidExcelRows?.length > 0 ? (
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
                sx={{ cursor: 'pointer' }}
              >
                <Icon icon='mingcute:question-fill' className='invalid-data-icon' />
              </Box>
            </Tooltip>
          ) : null}
          {/* <CustomButton
            sx={{ marginRight: '20px', padding: '6px 15px !important' }}
            className='cancel'
            category='Import'
            // disabled={uploading}
            startIcon={<Icon icon='mage:file-upload' />}
            onClick={handleImportFile}
          /> */}
          <CustomButton
            className='saveChanges'
            category={`Add ${
              role === 'ROLE_OPERATOR' ? 'Operation Admin' : 'Operation User'
            }`}
            onClick={() => {
              setOpen(true);
              setselectedAgents(null);
            }}
          />
        </Box>
      </Box>
      <Box
        className='agent-header-search'
        sx={{ width: APagent && isLg ? 'calc(100% - 280px)' : '100%' }}
      >
        {!APagent && (
          <Box sx={{ overflowX: 'auto', maxWidth: '100%' }}>
            <CustomTab onChange={handleTrip} value={tabValue} tabList={roleList} />
          </Box>
        )}
        {APagent && (
          <Typography sx={{ fontSize: '22px', fontWeight: 600, marginRight: '20px' }}>
            Sub Agents
          </Typography>
        )}
        <Typography variant='h5' sx={{ fontWeight: 600, position: 'relative' }}>
          Total Users:
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
            onChangeCallback={(e: any) => handleFilterChange(e)}
          />
        </Box>
      </Box>
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
                  const { scrollTop, scrollHeight, clientHeight } = inputRef.current;
                  const data = { scrollTop, scrollHeight, clientHeight };
                  // if (scrollTop !== 0) {
                  onScroll(data);
                  // }
                }}
                ref={inputRef}
                sx={{
                  padding: '20px',
                  height:
                    agentDetailsCount > 20 && !APsuperAdmin
                      ? '60vh'
                      : APsuperAdmin || ApOperator
                      ? '60vh'
                      : '85vh',
                  overflowY: 'auto'
                }}
              >
                <Grid container spacing={1.5}>
                  {agentDetails?.map((agent: any, index: any) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <Card className='agent-card'>
                        <Box className='agent-card-header'>
                          <Box className='agent-card-title'>
                            <Avatar className='agent-avatar'>
                              {capitalizeFirstLetter(agent.userName?.charAt(0))}
                            </Avatar>
                            <Box className='agent-title-text'>
                              <Tooltip
                                title={`Username : ${agent.userName}`}
                                arrow
                                placement='top-start'
                              >
                                <Typography className='agent-title'>
                                  {agent.userName}
                                </Typography>
                              </Tooltip>
                              <Tooltip
                                title={capitalizeFirstLetter(
                                  agent.contactPersonName
                                    ? agent.contactPersonName
                                    : 'N/A'
                                )}
                                arrow
                                placement='bottom-start'
                              >
                                <Typography className='agent-subheader'>
                                  {agent.contactPersonName
                                    ? agent.contactPersonName
                                    : 'N/A'}
                                </Typography>
                              </Tooltip>
                            </Box>
                          </Box>
                          <Box
                            className='agent-menu-icon'
                            onClick={(e: any) => handleMenuClick(e, agent)}
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
                          {agent.roles?.map((r: any, i: number) => (
                            <Tooltip key={r.id ?? i} title={r.role} arrow>
                              <Box
                                className='agent-card-contents'
                                onClick={() => {
                                  handleUserAccess(r.id);
                                }}
                              >
                                <PersonIcon sx={{ color: '#767aeb', mr: 1 }} />
                                <Typography
                                  noWrap
                                  className='content-overflow'
                                  variant='body1'
                                >
                                  {r.role}
                                </Typography>
                              </Box>
                            </Tooltip>
                          ))}

                          {/* Parent Role */}
                          {/* {agent.parentName && (
                            <Tooltip title={`Parent Role: ${agent.parentName}`} arrow>
                              <Box className='agent-card-contents'>
                                <SupervisorAccountIcon sx={{ color: '#767aeb', mr: 1 }} />
                                <Typography
                                  noWrap
                                  className='content-overflow'
                                  variant='body1'
                                >
                                  {agent.parentName}
                                </Typography>
                              </Box>
                            </Tooltip>
                          )} */}
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
                                // sx={{ width: '170px' }}
                              >
                                {agent.email}
                              </Typography>
                            </Box>
                          </Tooltip>

                          {/* <Tooltip title={agent.country} arrow>
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

                          {/* <Box
                            mt={2}
                            sx={{ display: 'flex', justifyContent: 'flex-end' }}
                          >
                            <CustomButton
                              className='viewWebsite'
                              category={
                                agent.website ? 'View Website' : 'No Website Available'
                              }
                              onClick={() => {
                                if (agent.website) {
                                  // window.open(agent.website, '_blank');
                                  const formattedUrl = /^https?:\/\//i.test(agent.website)
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
                                  backgroundColor: agent.website ? '#80bfff' : '#e0e7f5',
                                  boxShadow: agent.website
                                    ? '0 4px 8px rgba(0, 102, 204, 0.4)'
                                    : 'none',

                                  color: agent.website ? '#fff' : '#9e9e9e'
                                }
                              }}
                              startIcon={agent.website && <IconifyIcon icon='mdi:web' />}
                            />
                          </Box> */}
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
                            onClick={handleUpdateVehicle}
                            key='update'
                            id='button'
                            tabIndex={0}
                            onKeyDown={(event: any) => {
                              if (event.key === 'Enter') {
                                handleUpdateVehicle();
                              }
                            }}
                          >
                            <IconifyIcon
                              icon='ic:baseline-edit'
                              className='menu-icon update'
                            />
                            {constant.Update}
                          </MenuItem>
                          <MenuItem
                            className='menu-dialog'
                            onClick={() => {
                              setIsDialog('Delete');
                              handleMenuClose();
                            }}
                            id='button'
                            tabIndex={0}
                            onKeyDown={(event: any) => {
                              if (event.key === 'Enter') {
                                setIsDialog('Delete');
                                handleMenuClose();
                              }
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
              <Box component={'img'} className='uploaded-excel-icon' />
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
                  //   href={demofile}
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
      {view && (
        <Dialog
          open={view}
          maxWidth={'sm'}
          PaperProps={{
            sx: {
              height: '70%',
              '.css-1sthlmf-MuiGrid-root': {
                backgroundColor: '#eef7ff',
                padding: '10px',
                borderRadius: '1rem'
              }
            }
          }}
          fullWidth
          className='subuser-feature-view animate__animated animate__zoomInRight'
          slotProps={{ backdrop: { invisible: true } }}
        >
          <DialogContent>
            <Box className='feature-content'>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>Role Acess</Typography>
              </Box>
              <Box
                className='closeIcon icon-position d-flex'
                onClick={() => {
                  setView(false);
                  dispatch(resetUserRoleState());
                }}
              >
                <CustomIconButton category='CloseValue' />
              </Box>
            </Box>

            <Box
              sx={{
                height: '40vh',
                overflow: 'auto',
                mt: 2
              }}
            >
              <Grid container className='subuser-view'>
                {['Module', 'READ', 'CREATE', 'MODIFY', 'STATUS(A/D)', 'REMOVE'].map(
                  (label, index) => (
                    <Grid item lg={2} md={2} sm={2} xs={2} key={index}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        {label}
                      </Typography>
                    </Grid>
                  )
                )}
                <Grid container direction={'column'}>
                  {featureData
                    .find((f: any) => f.feature === selectedFeature)
                    ?.module?.map((mod: any, index: number) => (
                      <Grid paddingTop={2} container key={index}>
                        <Grid item lg={2} md={2} sm={2} xs={2}>
                          <Typography title={mod.field} className='feature-field'>
                            {capitalizeFirstLetter(mod.field)}
                          </Typography>
                        </Grid>
                        {mod?.checked?.map((item: any) => (
                          <Grid item lg={2} md={2} sm={2} xs={2}>
                            <Icon
                              icon={
                                item === true ? 'mdi:tick-circle' : 'ic:baseline-cancel'
                              }
                              width='20'
                              color={item === true ? 'rgb(14, 188, 147)' : '#ff0000'}
                              height='20'
                            />
                          </Grid>
                        ))}
                      </Grid>
                    ))}
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
        </Dialog>
      )}
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
        <AddOperator
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

export default InfiniteScroll(App);
