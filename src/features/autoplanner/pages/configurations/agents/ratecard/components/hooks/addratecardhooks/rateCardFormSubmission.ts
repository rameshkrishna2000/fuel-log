import { useAppDispatch } from '../../../../../../../../../app/redux/hooks';
import { updateToast } from '../../../../../../../../../common/redux/reducer/commonSlices/toastSlice';
import {
  addRatecard,
  clearRateCard,
  getRatecardDetails,
  updateRatecard
} from '../../../../../../../redux/reducer/autoPlannerSlices/rateCardSlice';

type AddOn = {
  addOnId?: any;
  name?: string;
  addCost?: number;
  startTime?: number;
  endTime?: number;
};

type Seater = {
  seaterId?: any;
  seater: number;
  baseCost: number;
  addOns: AddOn[];
};

type Tour = {
  tourId?: any;
  tourName: string;
  mode: string;
  isAddOn?: boolean;
  seaters: Seater[];
};

type Modes = {
  mode: string;
  isApiCall?: boolean;
  tours: Tour[];
};

type RateCardData = {
  rateCardId?: any;
  rateCardName: string;
  currency: string;
  modes: Modes[];
};

//Form Submission Functionalities For Rate Card
export const useRateCardFormSubmission = ({
  selectedCard,
  reset,
  clearErrors,
  setIsOpen,
  setIsSelected,
  isSelected,
  clearState,
  setSelectedCard
}: any) => {
  const dispatch = useAppDispatch();

  const buildRateCardPayload = (formData: any) => {
    const tours = formData.modes.flatMap((mode: any) =>
      mode.tours
        .map((tour: any) => ({
          tourId: tour?.tourId,
          tourName: tour.tourName,
          mode: tour.mode,
          isAddOn: tour.isAddOn,
          seaters: tour.seaters
            .filter((seater: any) => Number(seater.baseCost) > 0)
            .map((seater: any) => ({
              seaterId: seater?.seaterId,
              seater: Number(seater.seater),
              baseCost: Number(seater.baseCost),
              addOns: seater.prevaddOns
                ?.filter((addOn: any) => Number(addOn.addCost) > 0)
                ?.map((addOn: any) => ({
                  addOnId: addOn.addOnId,
                  name: addOn.name || undefined,
                  addCost: Number(addOn.addCost),
                  startTime: Math.floor(new Date(addOn.startTime).getTime() / 1000),
                  endTime: Math.floor(new Date(addOn.endTime).getTime() / 1000)
                }))
            }))
        }))
        .filter((tour: any) => tour.seaters.length > 0)
    );

    return {
      rateCardId: selectedCard?.rateCardId || undefined,
      rateCardName: formData.rateCardName,
      currency: formData.currency,
      tours
    };
  };

  const onSubmit = async (data: RateCardData) => {
    const payload = buildRateCardPayload(data);
    let res;
    if (payload.tours?.length === 0) {
      dispatch(
        updateToast({
          show: true,
          message: 'Base cost is needed for atleast one tour and seaters',
          severity: 'warning'
        })
      );

      return;
    }
    if (isSelected) {
      res = await dispatch(updateRatecard(payload));
    } else {
      res = await dispatch(addRatecard(payload));
    }

    if (res?.meta?.requestStatus === 'fulfilled') {
      reset();
      clearErrors();
      setIsOpen(false);
      setIsSelected(null);
      handleDialogClose();

      const data = { pageNo: 1, pageSize: 12 };
      dispatch(clearRateCard());
      clearState();
      await dispatch(getRatecardDetails(data));
    }
  };

  const handleDialogClose = () => {
    reset();
    clearErrors();
    setIsOpen(false);
    setIsSelected(null);
    setSelectedCard(null);
  };

  return {
    buildRateCardPayload,
    onSubmit,
    handleDialogClose
  };
};
