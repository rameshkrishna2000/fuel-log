import {
  Box,
  Dialog,
  DialogContent,
  DialogProps,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import CustomButton from '../../../../../components/buttons/CustomButton';
import CustomDataGrid from '../../../../../components/customized/customdatagrid/CustomDataGrid';
import DriverMapping from './components/DriverMapping';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import {
  Driver as DriverType,
  deactivateDriver,
  deleteDriver,
  getDriver,
  getUnmapVehicle,
  mappingDeactivateDriver
} from '../../../../../../common/redux/reducer/commonSlices/driverSlice';
import { Icon } from '@iconify/react';
import {
  debounce,
  epochToDateFormat,
  fileNameFormat,
  useAbort,
  usePagination
} from '../../../../../../utils/commonFunctions';
import CustomIconButton from '../../../../../components/buttons/CustomIconButton';
import constants from '../../../../../../utils/constants';
import CustomBreadcrumbs from '../../../../../components/custombreadcrumbs/CustomBreadcrumbs';

import CustomCarousel from '../../../../../components/carousel/CustomCarousel';
import styled from '@emotion/styled';
import CustomDaySelectionCard from '../../../../../components/customdayselectioncard/CustomDaySelectionCard';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import CustomTextField from '../../../../../components/customized/customtextfield/CustomTextField';
import { useForm } from 'react-hook-form';

import './Driver.scss';
// import constant from '../../../../../../utils/constants';
import CustomPortal from '../../../../../components/portals/CustomPortal';
import MenuIcon from '@mui/icons-material/Menu';
import { GridActionsCellItem } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CustomSecondaryVehicle from '../../../../../components/customdayselectioncard/customdSecondaryVehicle/CustomSecondaryVehicle';
import ConfirmationPopup from '../../../../../components/confirmationpopup/ConfirmationPopup';

function Driver() {
  const { data, isLoading, type } = useAppSelector(state => state?.driver);
  const [open, setOpen] = useState<boolean>(false);
  const [isDialog, setIsDialog] = useState('');
  const [selected, setSelected] = useState(true);
  const [payload, setPayload] = useState<any>();
  const [isMapping, setIsMapping] = useState(true);
  const [rows, setRows] = useState<DriverType[]>([]);
  const [textValue, setTextValue] = useState<DriverType | any>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);
  const [filter, setFilter] = useState('');
  const [view, setView] = useState<boolean>(false);
  const [imageCard, setImageCard] = useState<boolean>(false);
  const [files, setFiles] = useState<any[]>([]);
  const { pageSize, pageNo, pagination, setPageNo, setPageSize } = usePagination(20);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState<boolean>(false);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [viewData, setViewData] = useState<any>();
  const [availabilityData, setAvailabilityData] = React.useState<{
    firstName: string;
    lastName: string;
    driverAvailability: Array<{ day: string; fromHours: string; toHours: string }>;
    breakWindows: Array<{ day: string; breakFrom: string; breakTo: string }>;
  } | null>(null);

  const { data: profileData } = useAppSelector(state => state.auth);

  const { category } = useAppSelector(state => state.RoleModuleAccess);

  const dispatch = useAppDispatch();
  const createAbort = useAbort();

  const { control } = useForm();

  let roletype = profileData?.role;

  const isAP = roletype === 'ROLE_AUTOPLANNER_ADMIN' || roletype === 'ROLE_OPERATOR';

  const handleAvailabilityOpen = (row: {
    firstName: string;
    lastName: string;
    driverAvailability: any;
  }) => {
    const breakWindows = row.driverAvailability.flatMap(
      ({ day, driverBreakWindowList }: any) =>
        driverBreakWindowList.map(({ breakFrom, breakTo }: any) => ({
          day,
          breakFrom,
          breakTo
        }))
    );
    setAvailabilityData({
      firstName: row.firstName,
      lastName: row.lastName,
      driverAvailability: row.driverAvailability,
      breakWindows
    });
    setIsAvailabilityOpen(true);
  };

  const handleViewOpen = (row: {
    firstName: string;
    lastName: string;
    vehicleInfoList: any;
  }) => {
    setViewData({
      firstName: row.firstName,
      lastName: row.lastName,
      vehicleInfoList: row.vehicleInfoList
    });
    setIsViewOpen(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDeactivate = async () => {
    await dispatch(
      deactivateDriver({
        driverid: textValue.driverID
      })
    );
    setPageNo(pageNo);
    setPageSize(pageSize);
    setIsDialog('');
    // await dispatch(getUnmapVehicle(createAbort().abortCall.signal));
    await dispatch(getDriver({ ...payload, pageNo, pageSize }));
  };

  const handleMappingDeactivate = async () => {
    await dispatch(
      mappingDeactivateDriver({
        vehicleNumber: textValue.vehicleNumber
      })
    );
    setIsDialog('');
    // await dispatch(getUnmapVehicle(createAbort().abortCall.signal));
    await dispatch(getDriver({ ...payload, pageNo, pageSize }));
  };

  interface Pagination {
    page: number;
    pageSize: number;
  }

  const handleDriverPagination = async (newPagination: Pagination) => {
    await dispatch(getDriver({ ...payload, ...pagination(newPagination) }));
  };

  const handleFilterChange = useCallback(
    debounce(async (event: string, trip: string) => {
      setFilter(event);
      if (rows) {
        setPageNo(1);
        const payloadDriver = {
          ...payload,
          search: event,
          pageNo: 1,
          pageSize: pageSize
        };
        setPayload(payloadDriver);
      }
    }),
    [pageSize, payload]
  );

  const handleSortModelChange = (model: any) => {
    const payloads = {
      ...payload,
      sortBy: model[0]?.sort,
      sortByField: model[0]?.field
    };
    setPayload(payloads);
  };

  const handleDeleteDriver = async () => {
    await dispatch(
      deleteDriver({
        driverid: textValue.driverID
      })
    );
    setIsDialog('');
    await dispatch(getDriver({ ...payload, pageNo, pageSize }));
  };
  const BlurryDialog = styled(Dialog)<DialogProps>(({ theme }) => ({
    backgroundColor: 'rgba(60, 60, 60, 0.5)'
  }));

  const handleAvailability = async (row: any) => {
    setSelected(true);
    handleAvailabilityOpen({
      firstName: row.firstName,
      lastName: row.lastName,
      driverAvailability: row.driverAvailability
    });
    handleClose();
  };

  const columns = [
    {
      field: 'actions',
      title: 'actions',
      type: 'actions',
      headerName: `${constants.Action}`,
      flex: 1,
      minWidth: 100,
      maxWidth: 100,
      sortable: false,
      getActions: (params: any) => {
        const row = params?.row;
        const isAP =
          roletype === 'ROLE_OPERATOR' ||
          roletype === 'ROLE_AUTOPLANNER_ADMIN' ||
          category === 'OPERATION_USER';
        const isDisabled = row?.isActive === 0;

        return [
          // View Trips
          !isAP ? (
            <GridActionsCellItem
              icon={<CustomIconButton showTooltip={false} category='View' />}
              label={`${constants.View} Trips`}
              onClick={() => {
                setSelected(true);
                setTextValue(row);
              }}
              disabled={row?.isActive === 0}
              showInMenu
            />
          ) : null,

          // Update
          row?.isActive === 0 ? (
            <GridActionsCellItem
              icon={<CustomIconButton showTooltip={false} category='Edit' />}
              label={constants.Update}
              onClick={() => {
                setOpen(true);
                setSelected(true);
                setIsMapping(false);
                setTextValue(row);
              }}
              disabled
              showInMenu
            />
          ) : (
            <GridActionsCellItem
              icon={<CustomIconButton showTooltip={false} category='Edit' />}
              label={constants.Update}
              onClick={() => {
                setOpen(true);
                setSelected(true);
                setIsMapping(false);
                setTextValue(row);
              }}
              showInMenu
            />
          ),

          // Documents
          row?.driverInsurance || row?.driverMedical || row?.driverLicense ? (
            <GridActionsCellItem
              icon={<FilePresentIcon style={{ color: '#9f9f01' }} />}
              label='Documents'
              onClick={() => {
                handleImage(row);
                setSelected(true);
                setTextValue(row);
              }}
              disabled={!row?.isActive}
              showInMenu
            />
          ) : null,

          // Assign Driver
          row?.isActive === 0 ? (
            <GridActionsCellItem
              icon={<CustomIconButton showTooltip={false} category='Driver' />}
              label={constants.Assign}
              onClick={() => {
                setOpen(true);
                setIsMapping(true);
                setSelected(true);
                setTextValue(row);
              }}
              disabled
              showInMenu
            />
          ) : (
            <GridActionsCellItem
              icon={<CustomIconButton showTooltip={false} category='Driver' />}
              label={constants.Assign}
              onClick={() => {
                setOpen(true);
                setIsMapping(true);
                setSelected(true);
                setTextValue(row);
              }}
              showInMenu
            />
          ),

          // Active / Deactive
          row?.isActive === 0 ? (
            <GridActionsCellItem
              icon={<CustomIconButton showTooltip={false} category='Active' />}
              label={constants.ActiveStatus}
              onClick={() => {
                setIsDialog('dialog');
                setTextValue(row);
              }}
              showInMenu
            />
          ) : (
            <GridActionsCellItem
              icon={<CustomIconButton showTooltip={false} category='Deactive' />}
              label={constants.Deactive}
              onClick={() => {
                setIsDialog('dialog');
                setTextValue(row);
              }}
              showInMenu
            />
          ),

          // Remove Driver
          // row?.isActive === 0 || row?.vehicleNumber === null ? (
          //   <GridActionsCellItem
          //     icon={<CustomIconButton showTooltip={false} category='Mapping' />}
          //     label={constants.RemoveDriver}
          //     onClick={() => {
          //       setIsDialog('remove');
          //       setTextValue(row);
          //     }}
          //     disabled
          //     showInMenu
          //   />
          // ) : (
          //   <GridActionsCellItem
          //     // icon={<PersonAddIcon />}
          //     icon={<CustomIconButton showTooltip={false} category='Mapping' />}
          //     label={constants.RemoveDriver}
          //     onClick={() => {
          //       setIsDialog('remove');
          //       setTextValue(row);
          //     }}
          //     showInMenu
          //   />
          // ),

          // Delete
          row?.isActive === 0 ? (
            <GridActionsCellItem
              icon={<CustomIconButton showTooltip={false} category='Deletes' />}
              label={constants.Delete}
              onClick={() => {
                setIsDialog('Delete');
                setTextValue(row);
              }}
              disabled
              showInMenu
            />
          ) : (
            <GridActionsCellItem
              icon={<CustomIconButton showTooltip={false} category='Deletes' />}
              label={constants.Delete}
              onClick={() => {
                setIsDialog('Delete');
                setTextValue(row);
              }}
              showInMenu
            />
          )
        ].filter(Boolean);
      }
    },
    {
      field: 'isActive',
      headerName: `${constants.Active}`,
      flex: 1,
      minWidth: 80,
      sortable: false,
      maxWidth: 80,
      renderCell: (params: any) => (
        <IconButton
          onClick={event => {
            event.stopPropagation();
            setIsDialog('dialog');
            setSelected(true);
            setTextValue(params?.row);
            handleClose();
          }}
        >
          {params?.row?.isActive === 1 ? (
            <Icon
              icon='carbon:circle-filled'
              style={{ color: '#0EBC93', fontSize: '16px' }}
              onClick={event => {
                event.stopPropagation();
                setIsDialog('dialog');
                setSelected(true);
                setTextValue(params?.row);
                handleClose();
              }}
            />
          ) : (
            <Icon
              icon='carbon:circle-filled'
              style={{ color: '#FF2532', fontSize: '16px' }}
              onClick={event => {
                event.stopPropagation();
                setIsDialog('dialog');
                setSelected(true);
                setTextValue(params?.row);
                handleClose();
              }}
            />
          )}
        </IconButton>
      )
    },

    {
      field: 'firstName',
      headerName: `${constants.FirstName}`,
      flex: 1,
      minWidth: 120,
      renderCell: ({ value }: { value: string | undefined }) => {
        const name = value ? value : '';
        return (
          <Tooltip title={name} placement='top' arrow>
            <Typography>{name}</Typography>
          </Tooltip>
        );
      }
    },
    {
      field: 'lastName',
      headerName: `${constants.LastName}`,
      flex: 1,
      minWidth: 120,
      renderCell: ({ value }: { value: string | undefined }) => {
        const name = value?.trim() || '-';

        return name === '-' ? (
          <Typography>{name}</Typography>
        ) : (
          <Tooltip title={name} placement='top' arrow>
            <Typography>{name}</Typography>
          </Tooltip>
        );
      }
    },

    {
      field: 'contactPhone',
      headerName: `${constants.ContactPhone}`,
      flex: 1,
      minWidth: 150,
      sortable: false
    },
    {
      field: 'vehicleNumber',
      headerName: `${constants.PrimaryVehicle}`,
      flex: 1,
      minWidth: 150,
      renderCell: (params: any) => {
        const value = params?.row?.vehicleInfoList?.find(
          (item: any) => item.isPrimary === 1
        );
        return value?.vehicleNumber ? value?.vehicleNumber?.toUpperCase() : 'N/A';
      }
    },
    {
      field: 'secondaryVehicle',
      headerName: `${constants.SecondaryVehicle}`,
      flex: 1,
      minWidth: 150,
      // renderCell: (params: any) => {
      //   const value = params?.row?.vehicleInfoList?.filter(
      //     (item: any) => item.isPrimary === 0
      //   );
      //   return value?.length > 1 ? (
      //     <Box
      //       onClick={event => {
      //         handleView(params?.row);
      //       }}
      //       sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      //     >
      //       {value.length}
      //       <VisibilityIcon sx={{ color: '#3239ea', width: '20px', height: '20px' }} />
      //     </Box>
      //   ) : value?.length > 0 ? (
      //     value?.[0]
      //   ) : (
      //     'N/A'
      //   );
      // }
      renderCell: (params: any) => {
        const value = params?.row?.vehicleInfoList?.find(
          (item: any) => item.isPrimary === 0
        );
        return value?.vehicleNumber ? value?.vehicleNumber?.toUpperCase() : 'N/A';
      }
    },
    {
      field: 'preferredSeatings',
      headerName: 'Seating Capacity',
      flex: 1,
      minWidth: 150,
      renderCell: (params: any) => {
        const value = params?.row?.vehicleInfoList?.find(
          (item: any) => item.isPrimary === 1
        );
        return value?.seatingCapacity ? value?.seatingCapacity : 'N/A';
      }
    },
    {
      field: 'availability',
      headerName: 'Availability',
      sortable: false,
      flex: 1,
      minWidth: 150,
      renderCell: (params: any) => {
        return (
          <Box
            className='view-available'
            onClick={event => {
              event.stopPropagation();
              handleAvailability(params?.row);
            }}
          >
            <Icon icon='mdi:calendar-clock' className='view-available-icon' />
            <Typography className='view-available-text'>View</Typography>
          </Box>
        );
      }
    }
  ];

  const handleUpdate = (rowValue: any) => {
    setIsDialog('menu');
    setSelected(true);
    setTextValue(rowValue);
    setOpen(true);
    setIsMapping(false);
    handleClose();
  };

  const handleUpdateDriver = (row: any) => {
    setTextValue(row);
    setOpen(true);
    setSelected(true);
    setIsMapping(false);
  };

  const handleImage = (row: any) => {
    handleClose();
    if (row?.driverLicense || row?.driverInsurance || row?.driverMedical) {
      setImageCard(true);
      let uploadedFiles: any[] = [];
      if (row?.driverLicense?.length > 0) {
        const updatedFiles = row?.driverLicense?.map((item: any, index: number) => ({
          url: item,
          name: fileNameFormat(row?.driverLicenseFileName[index])
        }));
        uploadedFiles.push(...updatedFiles);
      }
      if (row?.driverInsurance?.length > 0) {
        const updatedFiles = row?.driverInsurance?.map((item: any, index: number) => ({
          url: item,
          name: fileNameFormat(row?.driverInsuranceFileName[index])
        }));
        uploadedFiles.push(...updatedFiles);
      }
      if (row?.driverMedical?.length > 0) {
        const updatedFiles = row?.driverMedical?.map((item: any, index: number) => ({
          url: item,
          name: fileNameFormat(row?.driverMedicalFileName[index])
        }));
        uploadedFiles.push(...updatedFiles);
      }

      setFiles(uploadedFiles);
    }
  };

  // useEffect(() => {
  //   if (payload) {
  //     dispatch(
  //       getDriver({
  //         ...payload
  //         // pageNo: pageNo,
  //         // pageSize: pageSize
  //       })
  //     );
  //     handleClose();
  //   }
  // }, [payload]);

  // useEffect(() => {
  //   dispatch(
  //     getDriver({
  //       ...payload,
  //       pageNo: pageNo,
  //       pageSize: pageSize
  //     })
  //   );
  // }, []);
  useEffect(() => {
    dispatch(
      getDriver({
        ...payload,
        pageNo: pageNo,
        pageSize: pageSize
      })
    );
    handleClose();
  }, [payload]);

  useEffect(() => {
    if (data?.driverProfileInfoList !== null && data?.driverProfileInfoList !== undefined)
      setRows(
        data?.driverProfileInfoList?.map((row: DriverType, index: number) => ({
          ...row,
          id: index,
          createdAT: epochToDateFormat(row?.createdAT)
        }))
      );
  }, [data]);

  return (
    <>
      <Box className='driver'>
        <Box className='driver-title'>
          {roletype !== 'ROLE_OPERATOR_ADMIN' && roletype !== 'ROLE_AGENT' && view ? (
            <CustomBreadcrumbs
              itemOne={constants.Driver}
              itemTwo='Trips'
              itemTwoState={view}
              setView={setView}
              handleItemOneClick={() => {
                handleClose();
              }}
            />
          ) : (
            <Typography className='heading'>{constants.Driver}</Typography>
          )}
          {!view && (
            <Box>
              <Box className='add-driver'>
                {!view && (
                  <CustomButton
                    className='saveChanges'
                    category='Add Driver'
                    onClick={() => {
                      setOpen(true);
                      setTextValue('');
                      setSelected(false);
                      setIsMapping(false);
                    }}
                  />
                )}
              </Box>
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
          )}
        </Box>
        {!view && (
          <CustomDataGrid
            rowCount={data?.count ?? 0}
            type='logistics'
            loading={isLoading && type === 'drivers'}
            rows={rows}
            sortingMode='server'
            onSortModelChange={handleSortModelChange}
            onPaginationModelChange={handleDriverPagination}
            columns={columns}
            paginationModel={{
              page: pageNo && data?.count ? pageNo - 1 : 0,
              pageSize: pageSize ? pageSize : 20
            }}
            pageNo={pageNo}
            pageSize={pageSize}
            onRowClick={(id, row) => {
              row.isActive === 1 && handleUpdate(row);
            }}
          />
        )}
        {isAvailabilityOpen && availabilityData && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
          >
            <CustomDaySelectionCard
              onClose={() => setIsAvailabilityOpen(false)}
              firstName={availabilityData.firstName}
              lastName={availabilityData.lastName}
              driverAvailability={availabilityData.driverAvailability}
              breakWindows={availabilityData.breakWindows}
            />
          </Box>
        )}

        {isViewOpen && viewData && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
          >
            <CustomSecondaryVehicle
              onClose={() => setIsViewOpen(false)}
              firstName={viewData.firstName}
              lastName={viewData.lastName}
              vehicleInfoList={viewData.vehicleInfoList}
            />
          </Box>
        )}

        {open && (
          <DriverMapping
            setOpen={setOpen}
            open={open}
            setPageNo={setPageNo}
            setPageSize={setPageSize}
            selected={selected}
            pageNo={pageNo}
            pageSize={pageSize}
            setSelected={setSelected}
            isMapping={isMapping}
            textValue={textValue}
            filterPayload={{ ...payload, search: filter }}
            setTextValue={setTextValue}
          />
        )}

        {isDialog === 'remove' && (
          <Dialog open={isDialog === 'remove'}>
            <Box
              sx={{
                textAlign: 'center',
                padding: '5%',
                minWidth: '350px'
              }}
            >
              <Typography>
                {roletype === 'ROLE_AUTOPLANNER_ADMIN' || roletype === 'ROLE_OPERATOR'
                  ? constants.DriverDeleteConfirmation
                  : constants.Remove}
              </Typography>
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
                    onClick={() => {
                      handleMappingDeactivate();
                    }}
                    loading={isLoading && type === 'remove-mapping'}
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
        )}

        {/* Deactivate Popup */}
        {isDialog === 'dialog' ? (
          <Dialog open={isDialog === 'dialog'}>
            <Box
              sx={{
                textAlign: 'center',
                padding: '5%',
                minWidth: '350px'
              }}
            >
              <Typography>
                {textValue.isActive === 1
                  ? constants.DriverDeactivate
                  : constants.DriverActivate}
              </Typography>
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
                    loading={isLoading && type === 'active-driver'}
                    category='Yes'
                    onClick={handleDeactivate}
                  />
                </Box>
                <CustomButton
                  className='cancel'
                  category='No'
                  onClick={() => {
                    setIsDialog('');
                    const { abortCall } = createAbort();
                  }}
                />
              </Box>
            </Box>
          </Dialog>
        ) : (
          <ConfirmationPopup
            open={isDialog === 'dialog'}
            onClose={() => {
              setIsDialog('');
              const { abortCall } = createAbort();
            }}
            loading={isLoading && type === 'active-driver'}
            onConfirm={handleDeactivate}
            title='Deactivate Driver'
            messages={[
              'You are about to deactivate this driver.',
              'This action may impact any scheduled assignments or routes.'
            ]}
            confirmText='Yes, Deactivate'
            cancelText='Cancel'
          />
        )}

        {/* Delete Driver Popup */}
        {/* {isDialog === 'Delete' && !isAP ? (
          <Dialog open={isDialog === 'Delete'}>
            <Box
              sx={{
                textAlign: 'center',
                padding: '5%',
                minWidth: '350px'
              }}
            >
              <Typography>{constants.DeleteConfirmation}</Typography>
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
                    loading={isLoading && type === 'delete-driver'}
                    category='Yes'
                    onClick={() => {
                      handleDeleteDriver();
                    }}
                  />
                </Box>
                <CustomButton
                  className='cancel'
                  category='No'
                  onClick={() => {
                    setIsDialog('');
                    if (isLoading && type === 'delete-driver') {
                      const { abortCall } = createAbort();
                    }
                  }}
                />
              </Box>
            </Box>
          </Dialog>
        ) : (
          <ConfirmationPopup
            open={isDialog === 'Delete'}
            onClose={() => {
              setIsDialog('');
              if (isLoading && type === 'delete-driver') {
                const { abortCall } = createAbort();
              }
            }}
            loading={isLoading && type === 'delete-driver'}
            onConfirm={() => {
              handleDeleteDriver();
            }}
            title='Delete Driver'
            messages={[
              'You are about to permanently remove this driver.',
              'This action cannot be undone and may affect associated schedules or assignments.'
            ]}
            confirmText='Yes, Delete'
            cancelText='No'
          />
        )} */}
        {isDialog === 'Delete' && (
          <Dialog open={isDialog === 'Delete'}>
            <Box
              sx={{
                textAlign: 'center',
                padding: '5%',
                minWidth: '350px'
              }}
            >
              <Typography>{constants.DriverDeleteConfirmation}</Typography>
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
                    loading={isLoading && type === 'delete-driver'}
                    category='Yes'
                    onClick={() => {
                      handleDeleteDriver();
                    }}
                  />
                </Box>
                <CustomButton
                  className='cancel'
                  category='No'
                  onClick={() => {
                    setIsDialog('');
                    if (isLoading && type === 'delete-driver') {
                      const { abortCall } = createAbort();
                    }
                  }}
                />
              </Box>
            </Box>
          </Dialog>
        )}
        {/* 
        {isDialog === 'Delete' &&
          (roletype === 'ROLE_AUTOPLANNER_ADMIN' || roletype === 'ROLE_OPERATOR') && (
           
          )} */}
        {imageCard && (
          <BlurryDialog
            open={true}
            fullWidth
            fullScreen
            maxWidth='md'
            className='dialog'
            onClose={() => setImageCard(false)}
            PaperProps={{
              style: {
                backgroundColor: 'transparent',
                boxShadow: 'none'
              }
            }}
          >
            <DialogContent
              className='dialogContent'
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Box className='closeIcon icon-position d-flex'>
                <CustomIconButton
                  category='CloseValue'
                  onClick={() => {
                    setImageCard(false);
                  }}
                />
              </Box>
              <CustomCarousel image={files} />
            </DialogContent>
          </BlurryDialog>
        )}
      </Box>
    </>
  );
}

export default Driver;
