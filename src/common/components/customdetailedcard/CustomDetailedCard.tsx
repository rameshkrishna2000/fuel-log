import React, { useEffect, useState } from 'react';
import {
  Box,
  CardActions,
  Collapse,
  Dialog,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography
} from '@mui/material';
import { Icon } from '@iconify/react';
import constant from '../../../utils/constants';
import CustomButton from '../buttons/CustomButton';
import { useAppDispatch, useAppSelector } from '../../../app/redux/hooks';
import {
  deactivateAction,
  tripTypesAction
} from '../../../features/yaantrac/redux/reducer/yaantracSlices/mytripsSlice';
import constants from '../../../utils/constants';
import { dashboardVehiclesStatusAction } from '../../../features/yaantrac/redux/reducer/yaantracSlices/dashboardSlice';
import {
  capitalizeFirstLetter,
  convertEpochToDateString,
  findAddress
} from '../../../utils/commonFunctions';
import './CustomDetailedCard.scss';

interface Data {
  UpdatedAt: string;
  Speed: string;
  Signal?: string;
  IgnitionOnTime?: string;
  TodayDistance: string;
  TotalDistance: string;
}

interface Props {
  rowData?: any;
  data?: any;
  showActivate?: boolean;
}

type TripDeactivateData = {
  endTimestamp: number;
  startTimestamp: number;
  tripID: number;
  tripcode: string;
  vehicleNumber: string;
  tripType: string;
  setDeactivate: any;
};

function CustomDetailedCard({ rowData, data, showActivate }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [address, setAddress] = useState('');

  const dispatch = useAppDispatch();

  //APIs
  const { rows } = useAppSelector(state => state.tripTypes);
  const tripsLiveStatusData = useAppSelector(state => state.liveStatusTripSlice);
  const allVehicleData = useAppSelector(state => state.dashboardVehiclesStatus);
  const { isLoading } = useAppSelector(state => state.deactivateTripSlice);

  const filteredData: any[] = rows?.filter((item: any) => item.id === rowData?.tripID);
  const tripliveData: any[] = tripsLiveStatusData?.data.filter(
    (item: any) => item.vehicleName == rowData?.vehicleNumber
  );

  const initialData: any[] = allVehicleData?.data.filter(
    (item: any) => item.id == rowData?.vehicleNumber
  );
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const sameVehicle = rowData?.vehicleNumber === (data as any)?.vehicle_number;

  const datas: Data[] = [
    {
      UpdatedAt:
        data && sameVehicle
          ? convertEpochToDateString(Number(data.update_time))
          : tripliveData[0]
          ? convertEpochToDateString(tripliveData[0]?.lastUpdate)
          : convertEpochToDateString(initialData[0]?.updatedAt),
      Speed:
        data && sameVehicle
          ? `${data.speed} kmph`
          : tripliveData[0]
          ? `${tripliveData[0]?.speedKPH} kmph`
          : initialData[0]?.info?.speed,
      // Signal: data && sameVehicle ? data.gsm_signal : '3',
      // IgnitionOnTime:
      //   data && sameVehicle && data?.ignition_onTime != 0
      //     ? convertEpochToDateString(data?.ignition_onTime)
      //     : '00:00:00',
      TodayDistance:
        data && sameVehicle && tripliveData[0]
          ? `${parseFloat(tripliveData[0]?.dayKM).toFixed(2)} km`
          : `${parseFloat(initialData[0]?.info?.todayDistance).toFixed(2)} km`,
      TotalDistance:
        data && sameVehicle
          ? `${parseFloat(data.total_distance).toFixed(2)} km`
          : `${parseFloat(initialData[0]?.info?.totalDistance).toFixed(2)} km`
    }
  ];

  const insertSpaceBeforeUppercase = (inputString: string) => {
    return inputString.replace(/(?<!^)(?=[A-Z])/g, ' ');
  };

  const deactivateTrip = async () => {
    const payload: TripDeactivateData = {
      endTimestamp: rowData?.endTimestamp,
      startTimestamp: rowData?.startTimestamp,
      tripID: rowData?.tripID,
      tripcode: rowData?.code,
      vehicleNumber: rowData?.vehicleNumber,
      tripType: rowData?.tripType,
      setDeactivate: setDeactivateOpen
    };
    await dispatch(deactivateAction(payload));

    // setDeactivateOpen(false);
    await dispatch(
      tripTypesAction({ tripType: rowData.tripType, pageNo: 1, pageSize: 5 })
    );
    await dispatch(tripTypesAction({ tripType: 'Scheduled', pageNo: 1, pageSize: 5 }));
  };

  useEffect(() => {
    dispatch(dashboardVehiclesStatusAction({ arg1: 'total', arg2: false }));
    // dispatch(liveStatusAction());
    if (initialData.length > 0)
      findAddress(initialData[0]?.lat, initialData[0]?.lng).then(res => {
        return setAddress(res);
      });
  }, []);

  useEffect(() => {
    if (data?.latitude)
      findAddress(parseFloat(data?.latitude), parseFloat(data?.longitude)).then(res => {
        return setAddress(res);
      });
  }, [data]);

  return (
    <Box className='cards'>
      {tripsLiveStatusData.isLoading ? (
        <>
          <Box className='loader-head'>
            <Box sx={{ display: 'flex' }}>
              <Skeleton variant='circular' width={40} height={40} />
              <Box className='head-content'>
                <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
                <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
              </Box>
            </Box>
            <Skeleton variant='rectangular' width={30} height={30} />
          </Box>
          {[...Array(6)].map((_, index) => (
            <Box className='loader-body' key={index}>
              <Skeleton variant='text' className='loader-body-content' />
              <Skeleton variant='text' className='loader-body-content' />
            </Box>
          ))}
          <Skeleton
            variant='rectangular'
            width={150}
            height={15}
            sx={{ marginBottom: '10px' }}
          />
          <Skeleton variant='text' className='address-loader' />
          <Skeleton variant='text' className='address-loader' />
          <Box className='loader-footer'>
            <Skeleton variant='text' sx={{ fontSize: '1rem', width: '60px' }} />
          </Box>
        </>
      ) : (
        <>
          <>
            <Box className='cardheader d-flex'>
              <Box className='cardheader d-flex'>
                <Icon
                  icon='carbon:circle-filled'
                  style={{
                    color: initialData[0]?.status === 'Offline' ? '#ff2532' : '#0ebc93'
                  }}
                  className={'activeIcon'}
                />
                <Box>
                  <Typography paragraph m={0} className='cardhead'>
                    {rowData?.vehicleNumber.toUpperCase()}
                  </Typography>
                  <Typography
                    paragraph
                    m={0}
                    sx={{
                      color: rowData?.tripView
                        ? rowData?.vehicle_status === 'Offline'
                          ? '#ff2532'
                          : '#0ebc93'
                        : initialData[0]?.status === 'Offline'
                        ? '#ff2532'
                        : '#0ebc93'
                    }}
                    className={'cardActive'}
                  >
                    {rowData?.tripView
                      ? capitalizeFirstLetter(rowData?.vehicle_status)
                      : capitalizeFirstLetter(initialData[0]?.status)}
                  </Typography>
                </Box>
              </Box>
              <Box
                className='expanded-icon d-flex'
                justifyContent='center'
                onClick={handleExpandClick}
              >
                <Icon
                  icon={expanded ? 'icon-park-outline:down' : 'icon-park-outline:up'}
                />
              </Box>
            </Box>
            <Collapse in={expanded} timeout='auto' unmountOnExit>
              <Box sx={{ maxHeight: '350px', overflow: 'auto' }}>
                <TableContainer className='table'>
                  <Table aria-label='simple table'>
                    <TableBody>
                      {datas?.map((row, rowIndex) => (
                        <React.Fragment key={`row-${rowIndex}`}>
                          {Object.entries(row).map(([key, value]) => (
                            <React.Fragment key={key}>
                              <TableRow
                                sx={{
                                  '&:last-child td, &:last-child th': { border: 0 }
                                }}
                              >
                                <TableCell className='dataKeys'>
                                  {insertSpaceBeforeUppercase(key)}
                                </TableCell>
                                <TableCell className={`dataValues dataCells ${key}`}>
                                  {key === 'Signal' ? (
                                    <Icon
                                      className='signalIcon'
                                      style={{
                                        color:
                                          value == 0
                                            ? 'gray'
                                            : value == 1
                                            ? '#fd4954'
                                            : value == 2
                                            ? '#faba43'
                                            : value == 3
                                            ? '#ff9e2f'
                                            : '#3cc13b'
                                      }}
                                      icon={
                                        value === 0
                                          ? 'ph:cell-signal-x-bold'
                                          : value === 1
                                          ? 'ic:round-signal-cellular-alt-1-bar'
                                          : value === 2
                                          ? 'ic:round-signal-cellular-alt-2-bar'
                                          : value === 3
                                          ? 'ic:round-signal-cellular-alt-3-bar'
                                          : 'ph:cell-signal-high-bold'
                                      }
                                    />
                                  ) : (
                                    value
                                  )}
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          ))}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box>
                  <Typography paragraph m={0} mb={1} className='cardLocation'>
                    {constant.CurrentLocation}
                  </Typography>
                  <Typography paragraph m={0} mb={1} className='cardLocationContent'>
                    {address}
                  </Typography>
                </Box>
              </Box>
              <CardActions sx={{ padding: '15px 0 0 0' }}>
                {showActivate && (
                  <CustomButton
                    category={
                      filteredData[0]?.isActive
                        ? constants.Deactive
                        : constants.ActiveStatus
                    }
                    className='cancel'
                    onClick={() => setDeactivateOpen(true)}
                  />
                )}
              </CardActions>
            </Collapse>
          </>

          {deactivateOpen && (
            <Dialog open={deactivateOpen}>
              <Box
                sx={{
                  textAlign: 'center',
                  alignItems: 'center',
                  padding: '5%',
                  width: '300px'
                }}
              >
                <Typography>
                  {filteredData[0]?.isActive ? constants.Deactivate : constants.Activate}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    padding: '5%',
                    justifyContent: 'center'
                  }}
                >
                  <Box sx={{ marginRight: '12px' }}>
                    <CustomButton
                      className='saveChanges'
                      category='Yes'
                      loading={isLoading}
                      onClick={() => {
                        deactivateTrip();
                      }}
                    />
                  </Box>
                  <CustomButton
                    className='cancel'
                    category='No'
                    onClick={() => {
                      setDeactivateOpen(false);
                    }}
                  />
                </Box>
              </Box>
            </Dialog>
          )}
        </>
      )}
    </Box>
  );
}

export default CustomDetailedCard;
