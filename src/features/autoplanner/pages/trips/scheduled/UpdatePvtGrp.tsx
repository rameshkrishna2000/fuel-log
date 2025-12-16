import { Box, Dialog, DialogContent, Grid, Typography } from '@mui/material';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  findAddress,
  formatISTtoTime,
  useAbort
} from '../../../../../utils/commonFunctions';

import './UpdateScheduleTrip.scss';

import {
  getExcelAction,
  getStandardVehicles,
  PvtGrpUpdate
} from '../../../redux/reducer/autoPlannerSlices/autoGenerateSlice';
import {
  updateCenter,
  updateZoom
} from '../../../../../common/redux/reducer/commonSlices/mapSlice';
import GoogleMap from '../../../../../common/components/maps/googlemap/GoogleMap';
import GoogleTripDirections from '../../../../../common/components/maps/googledirection/GoogleTripDirections';
import CustomIconButton from '../../../../../common/components/buttons/CustomIconButton';
import CustomSelect from '../../../../../common/components/customized/customselect/CustomSelect';
import CustomTextField from '../../../../../common/components/customized/customtextfield/CustomTextField';
import PhoneNoTextField from '../../../../../common/components/customized/customtextfield/PhoneNoTextField';
import CustomRadioButton from '../../../../../common/components/customized/customradiobutton/CustomRadioButton';
import GoogleSearchBox from '../../../../../common/components/maps/googlesearchbox/GoogleSearchBox';
import CustomTimePicker from '../../../../../common/components/customized/customtimepicker/CustomTimePicker';
import CustomButton from '../../../../../common/components/buttons/CustomButton';
import { useAppDispatch, useAppSelector } from '../../../../../app/redux/hooks';
import {
  autoPlannerAgentAction,
  clearContactError,
  clearDriverName,
  contactNumberValidation
} from '../../../redux/reducer/autoPlannerSlices/autoplanner';
import {
  usePvtGrpEffects,
  usePvtGrpOptions,
  usePvtGrpUpdateActions,
  usePvtGrpUpdateHook
} from './UpdatePvtGrpHook';
import UpdatePvtGrpFields from './updatePvtGrpFields';

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  autoplannerID: any;
  setTripMode?: any;
  tripMode?: string;
  selectedRow: any;
  excelPayload?: any;
  selectedTripRow: any;
  pageDetail: { pageNo: number; pageSize: number };
  Agents: { id: string; label: string }[];
  filterPayload?: any;
  setPageSize?: any;
  setSearchValue?: any;
  setFilterPayload?: any;
  filterClear?: any;
}

interface Select {
  id: string;
  label: string;
}

interface UpdatePayload {
  agentName: string;
  guestName: string;
  adultCount: number;
  childCount: number;
  refNumber: string;
  vehicleNumber?: string;
  source: string | null;
  startLat: number | null;
  startLng: number | null;
  tourName: string | null;
  time: string | null;
  driverName: string;
  passengerCount: number;
  driverNumber: number;
  filterPayload?: any;
}

const UpdatePVTGRP = ({
  isOpen,
  setIsOpen,
  selectedRow,
  selectedTripRow,
  pageDetail,
  autoplannerID,
  tripMode,
  setTripMode,
  excelPayload,
  filterPayload,
  setPageSize,
  Agents,
  setSearchValue,
  setFilterPayload,
  filterClear
}: Props) => {
  const dispatch = useAppDispatch();

  const {
    sourceAddress,
    setSourceAddress,
    destinationAddress,
    setDestinationAddress,
    tripMarker,
    setTripMarker,
    external,
    setExternal,
    isDrag,
    setIsDrag,
    seatCapacity,
    setSeatCapacity,
    validationErrors,
    setValidationErrorsMake
  } = usePvtGrpUpdateHook();

  const { data: dropDownData, isLoading: dropdownLoading } = useAppSelector(
    state => state.getStandardVehicles
  );
  const AgentsDropdown = useAppSelector(state => state.autoPlannerAgent.data || []);
  const { isLoading } = useAppSelector(state => state.updatePvtGrpScheduled);

  const { data } = useAppSelector(state => state.auth);
  let role = data?.role;
  const createAbort = useAbort();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const schema = () =>
    yup.object().shape({
      agentName: yup
        .string()
        .required('Select Agent Name')
        .matches(/^[a-zA-Z0-9\s.-]*$/, 'Agent Name Can Only Contain Letters and Numbers'),
      guestName: yup.string().required('Enter Guest Name'),
      adultCount: yup
        .number()
        // .matches(/^\d+$/, 'Enter Valid Count')
        .required('Enter Adult Count')
        .min(1, 'Adult Count Must be Atleast 1')
        .typeError('Enter Adult Count'),
      phone: yup
        .string()
        .optional()
        .test('basic-contact', 'Invalid contact number', value => {
          if (!value) return true;
          const phoneRegex = /^\+?[0-9]{1,4}[- ]?[0-9]{7,15}$/;
          return phoneRegex.test(value);
        })
        .test(
          'phone-error',
          'Enter valid contact number',
          function (value: any, field: any) {
            if (
              validationErrors?.phone &&
              value &&
              validationErrors?.phone !== 'No Error'
            ) {
              return this.createError({ message: validationErrors?.phone });
            } else {
              return true;
            }
          }
        ),
      childCount: yup
        .number()
        .notRequired()
        .min(0, 'Child Count Cannot be Below 0')
        .max(50, 'Child Count Must Not Exceed 50')
        .typeError('Child Count Cannot be Below 0'),
      refNumber: yup.string().notRequired(),
      vehicle: yup.string().oneOf(['internal', 'external']).notRequired(),
      vehicleNumber: yup.string().when('vehicle', {
        is: 'internal',
        then: () => yup.string().required('Select vehicle number'),
        otherwise: () =>
          yup
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
      }),
      driverName: yup.string().when('vehicle', {
        is: 'external',
        then: () => yup.string().required('Enter Driver Name'),
        otherwise: () => yup.string().notRequired()
      }),
      passengerCount: yup.number().when('vehicle', {
        is: 'external',
        then: () =>
          yup
            .number()
            .typeError('Enter a valid number')
            .required('Enter Seat Capacity')
            .max(249, 'Seat capacity must be less than 250')
            .min(1, 'Seat Capacity must be greater than 0'),
        otherwise: () => yup.number().notRequired()
      }),

      driverNumber: yup.string().when('vehicle', {
        is: 'external',
        then: () =>
          yup
            .string()
            .required('Enter Contact Number')
            .test('basic-contact', 'Invalid contact number', value => {
              if (!value) return true;
              const phoneRegex = /^\+?[0-9]{1,4}[- ]?[0-9]{7,15}$/;
              return phoneRegex.test(value);
            })
            .test('phone-error', 'Enter valid contact number', function (value: any) {
              if (
                validationErrors?.driverNumber &&
                value &&
                validationErrors?.driverNumber !== 'No Error'
              ) {
                return this.createError({ message: validationErrors?.driverNumber });
              } else {
                return true;
              }
            }),
        otherwise: () => yup.string().notRequired()
      }),
      sourceAddress: yup
        .object()
        .shape({
          source: yup.string().required('Enter Pickup Location'),
          startLat: yup.number().required('Enter Latitude for Pickup Location'),
          startLng: yup.number().required('Enter Longitude for Pickup Location')
        })
        .test(
          'different-source-destination',
          'Pickup and drop should not be the same',
          function (value) {
            const tour = this.parent?.tourORdestination || '';
            if (tour && value?.source === tour) {
              return this.createError({
                path: `${this.path}.source`,
                message: 'Pickup and drop should not be the same'
              });
            }
            return true;
          }
        ),
      tourORdestination: yup.string().required('Choose Return Time'),
      time: yup.object().required('Choose Return Time')
    });

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    reset,
    trigger,
    getValues,
    formState: { errors }
  } = useForm<any>({
    resolver: yupResolver(schema())
  });

  const { handleClose, handleMarkerDrag, handleValidate } = usePvtGrpUpdateActions({
    setIsOpen,
    reset,
    dispatch,
    setSourceAddress,
    setDestinationAddress,
    setValidationErrorsMake,
    contactNumberValidation,
    setValue,
    autoplannerID
  });

  const { agentNames, standardVehicles } = usePvtGrpOptions({
    AgentsDropdown,
    dropDownData,
    selectedTripRow
  });

  const onSubmit = async (params: any) => {
    let payload: any = {
      agentName: params.agentName,
      guestName: params.guestName,
      source: params.sourceAddress.source,
      startLat: params.sourceAddress.startLat,
      startLng: params.sourceAddress.startLng,
      destination: params?.destinationAddress?.destination,
      endLat: params.destinationAddress.endLat,
      endLng: params.destinationAddress.endLng,
      time: formatISTtoTime(params.time),
      childCount: params.childCount,
      ...(params.phone &&
        params.phone.includes('-') &&
        params.phone.split('-')[1] && { guestContactNumber: params.phone }),
      isCustomRoute: selectedTripRow?.isCustomRoute,
      seatingCapacity: params.passengerCount
        ? params.passengerCount
        : selectedTripRow.seatingCapacity,
      adultCount: params.adultCount,
      refNumber: params.refNumber,
      tourName: selectedTripRow.destination,
      vehicleNumber: params.vehicleNumber === 'Unassigned' ? null : params.vehicleNumber,
      driverName: params.driverName === 'Unassigned' ? null : params.driverName,
      contactNumber: params.driverNumber === 'Unassigned' ? null : params.driverNumber,
      isExternalVehicle: params.vehicle === 'internal' ? 0 : 1,
      journeyId: selectedTripRow.journeyId,
      driverID:
        params.vehicle === 'internal'
          ? selectedTripRow.driverID
          : `${params?.driverName}${params?.driverNumber}`,
      modifyVehicleDriver: selectedTripRow.modifyVehicleDriver
    };

    const pageDetails = {
      ...pageDetail,
      ...filterPayload,
      autoplannerID: autoplannerID,
      tripMode: tripMode,
      id: selectedRow?.id
    };
    const data = { payload, pageDetails };
    // const allPayload = { ...filterPayload, ...excelPayload, searchFor: '' };
    const allPayload = { ...excelPayload, searchFor: '' };

    const action = await dispatch(PvtGrpUpdate(data));
    if (action.type === PvtGrpUpdate.fulfilled.type) {
      setSearchValue('search', '');
      filterClear();
      handleClose();
      setPageSize(20);
      dispatch(clearDriverName());

      if (excelPayload) dispatch(getExcelAction(allPayload));
    }
  };

  usePvtGrpEffects({
    dispatch,
    data,
    destinationAddress,
    setValue,
    createAbort,
    sourceAddress,
    trigger,
    validationErrors,
    autoplannerID,
    tripMode,
    selectedTripRow,
    setExternal,
    setTripMarker,
    setSourceAddress,
    setDestinationAddress,
    clearErrors,
    getStandardVehicles,
    tripMarker
  });

  return (
    <Box className='add-trip-component'>
      <Dialog
        open={isOpen}
        fullScreen
        sx={{ padding: 3, zIndex: 1, position: 'absolute' }}
        className='add-trip-dialog animate__animated animate__zoomIn'
        BackdropProps={{
          invisible: true
        }}
      >
        <DialogContent
          sx={{ overflow: 'hidden', padding: 0 }}
          className='add-trip-dialog-content'
        >
          <Grid
            container
            sx={{
              flexDirection: { xs: 'column-reverse', md: 'row', sm: 'row' }
            }}
            className='add-trip-grid-container'
          >
            <Grid item xs={12} md={8} sm={8} lg={9} sx={{ overflow: 'hidden' }} p={2}>
              <Box
                sx={{
                  width: '100%',
                  height: '87vh',
                  overflow: { xs: 'scroll', md: 'hidden' },
                  borderRadius: '10px'
                }}
              >
                <GoogleMap>
                  <GoogleTripDirections
                    locations={tripMarker}
                    isDraggable={false}
                    setTripMarker={setTripMarker}
                    handleMarker={handleMarkerDrag}
                    showPath={true}
                  />
                </GoogleMap>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sm={4} lg={3} className='add-trip-grid-item'>
              <Box className='add-trip-header'>
                <Typography className='add-booking-title'>
                  {'Update Scheduled Booking'}
                </Typography>
              </Box>
              <Box
                className='closeIcon icon-position d-flex close-icon-index'
                onClick={() => handleClose()}
              >
                <CustomIconButton category='CloseValue' />
              </Box>
              <Box
                className='add-trip-form animate__animated animate__zoomIn animate__slow'
                component='form'
                sx={{
                  height: 'fit-content',
                  maxHeight: '82vh',
                  overflowY: 'auto',
                  paddingRight: '15px'
                }}
                onSubmit={handleSubmit(onSubmit)}
              >
                <UpdatePvtGrpFields
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  trigger={trigger}
                  getValues={getValues}
                  clearErrors={clearErrors}
                  agentNames={agentNames}
                  standardVehicles={standardVehicles}
                  dropdownLoading={dropdownLoading}
                  external={external}
                  setExternal={setExternal}
                  setIsDrag={setIsDrag}
                  setValidationErrorsMake={setValidationErrorsMake}
                  selectedTripRow={selectedTripRow}
                  selectedRow={selectedRow}
                  setSeatCapacity={setSeatCapacity}
                  sourceAddress={sourceAddress}
                  handleValidate={handleValidate}
                  setSourceAddress={setSourceAddress}
                />
                <Box mt={3} mb={2} sx={{ textAlign: 'right' }}>
                  <CustomButton
                    category='Cancel'
                    className='cancel'
                    sx={{ marginRight: '10px' }}
                    onClick={() => handleClose()}
                  />
                  <CustomButton
                    category={'Save'}
                    loading={isLoading}
                    className='saveChanges'
                    type='submit'
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default UpdatePVTGRP;
