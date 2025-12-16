import { useAppDispatch } from '../../../../../../app/redux/hooks';
import {
  convertDatetoEpoch,
  convertISTToTimeZone
} from '../../../../../../utils/commonFunctions';
import { getExcelAction } from '../../../../redux/reducer/autoPlannerSlices/autoGenerateSlice';
import {
  AddAdhocVehicle,
  autoPlannerAddTripsAction,
  autoPlannerUpdateTripsAction,
  GetGrpBookings
} from '../../../../redux/reducer/autoPlannerSlices/autoplanner';

// Form Submission functionalities with onSubmit function
export const useAdhocFormSubmission = ({
  tripType,
  formatISTtoTime,
  pvtRoute,
  timezone,
  vehicleType,
  APsubAgent,
  APagent,
  adhocTransferVehicle,
  transferVehicleType,
  selectedRow,
  handleClose,
  autoplannerID,
  setBadgeCount,
  pageDetailss,
  adhocVehicle,
  epochStartOfTodaySG,
  adhocTransferDropdown,
  adhocDropdown
}: any) => {
  const dispatch = useAppDispatch();

  const onSubmit = async (params: any) => {
    const standard = tripType === 'SIC' || tripType === 'TSIC';
    const bufferTimeFormatted =
      !standard && params.bufferTime ? formatISTtoTime(params.bufferTime) : null;
    const payload = {
      adultCount: params.adultcount,
      agentName: params?.agentname ? params?.agentname : 0,
      childCount: params.childcount ? params.childcount : 0,
      date: params.tripDate ? params.tripDate : null,
      destination:
        pvtRoute === 'Custom' || !standard
          ? params.destinationAddress?.destination ?? null
          : null,
      endLat:
        pvtRoute === 'Custom' || !standard
          ? params.destinationAddress?.endLat ?? null
          : null,
      endLng:
        pvtRoute === 'Custom' || !standard
          ? params.destinationAddress?.endLng ?? null
          : null,
      guestName: params.guestname,
      mode: params.triptype,
      refNumber: params?.referenceno ? params?.referenceno : '',
      tourName: params?.configuredRoute ? params?.configuredRoute : null,
      source: params.sourceAddress?.source ?? null,
      startLat: params.sourceAddress?.startLat ?? null,
      ...(params.phone &&
        params.phone.includes('-') &&
        params.phone.split('-')[1] && { guestContactNumber: params.phone }),

      startLng: params.sourceAddress?.startLng ?? null,
      ...(['PVT', 'GRP']?.includes(tripType)
        ? { isCustomRoute: pvtRoute === 'Custom' ? 1 : 0 }
        : { isCustomRoute: 0 }),
      time: params.startdate
        ? // ? convertTimeFormat(formatISTtoHHMM(params.startdate))
          convertISTToTimeZone(params.startdate, timezone)
        : null,
      startTimestamp: params.startdate
        ? convertDatetoEpoch(params.startdate) / 1000
        : null,
      bufferTime: bufferTimeFormatted,
      ...(!APagent &&
        !APsubAgent && {
          isExternalVehicle: vehicleType === 'External' ? 1 : 0
        }),
      ...(!APagent && !APsubAgent && { vehicleNumber: params?.vehicleNumber }),
      ...(vehicleType === 'Internal'
        ? {
            seatingCapacity: adhocDropdown?.find(
              (item: any) => item?.id === params?.vehicleNumber
            )?.seatingCapacity
          }
        : { seatingCapacity: params?.seatingCapacity }),
      ...(vehicleType !== 'Internal'
        ? { driverName: params?.driverName, contactNumber: params?.contactNumber }
        : {}),

      ...(vehicleType === 'Internal' && adhocTransferDropdown?.length > 0
        ? { transferVehicleNumber: params?.transferVehicleNumber }
        : {}),

      ...(vehicleType === 'Internal' && transferVehicleType !== 'Internal'
        ? {
            transferDriverName: params?.transferDriverName,
            transferContactNumber: params?.transferContactNumber
          }
        : {}),

      ...(adhocTransferVehicle?.data?.mainHotelResponses?.length > 0
        ? { mainHotelResponse: adhocTransferVehicle?.data?.mainHotelResponses[0] }
        : {}),
      ...(adhocTransferDropdown?.length > 0 && transferVehicleType === 'Internal'
        ? {
            transferCapacity: adhocTransferDropdown?.find(
              (item: any) => item?.id === params?.transferVehicleNumber
            )?.seatingCapacity
          }
        : { transferCapacity: params?.transferCapacity }),

      ...(adhocTransferVehicle?.data?.mainHotelResponses?.length > 0 && {
        isExternalTransfer: transferVehicleType === 'External' ? 1 : 0
      }),
      ...(selectedRow?.journeyId && { journeyID: selectedRow?.journeyId }),
      ...(selectedRow?.tripID && { tripID: selectedRow?.tripID }),
      ...(selectedRow?.disposalPickupWindow
        ? { disposalPickupWindow: selectedRow?.disposalPickupWindow }
        : params?.disposalPickupWindow
        ? { disposalPickupWindow: params?.disposalPickupWindow }
        : {})
    };

    const addAdhocTrips = selectedRow
      ? {
          date: epochStartOfTodaySG,
          data: payload,
          journeyID: selectedRow?.journeyId,
          method: 'PUT'
        }
      : { date: epochStartOfTodaySG, data: payload, method: 'POST' };

    if (APagent || APsubAgent) {
      const action1 = selectedRow
        ? await dispatch(
            autoPlannerUpdateTripsAction({ payload, APagent, APsubAgent, selectedRow })
          )
        : await dispatch(autoPlannerAddTripsAction({ payload, APagent, APsubAgent }));

      if (
        action1.type === autoPlannerAddTripsAction.fulfilled.type ||
        action1.type === autoPlannerUpdateTripsAction.fulfilled.type
      ) {
        handleClose();

        const res: any = await dispatch(
          GetGrpBookings({
            mode: 'ALL',
            pageNo: 1,
            pageSize: 20,
            autoplannerID: autoplannerID,
            isAdhoc: true
          })
        );
        setBadgeCount(res?.payload?.data?.count ?? 0);
      }
    } else {
      const res = await dispatch(AddAdhocVehicle(addAdhocTrips));
      if (res.type === AddAdhocVehicle.fulfilled.type) {
        const payload = {
          PageNo: pageDetailss?.pageNo,
          PageSize: pageDetailss?.pageSize,
          autoplannerID: epochStartOfTodaySG,
          tripMode: 'ALL'
        };
        handleClose();

        await dispatch(getExcelAction(payload));

        const res: any = await dispatch(
          GetGrpBookings({
            mode: 'ALL',
            pageNo: 1,
            pageSize: 20,
            autoplannerID: autoplannerID,
            isAdhoc: true
          })
        );
        setBadgeCount(res?.payload?.data?.count ?? 0);
      }
    }
  };

  return {
    onSubmit
  };
};
