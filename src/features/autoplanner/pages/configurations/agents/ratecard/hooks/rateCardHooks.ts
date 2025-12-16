import { useCallback, useEffect, useState } from 'react';
import { debounce } from '../../../../../../../utils/commonFunctions';

interface RateCardOnResponse {
  rateCardOnId: string;
  rateCardOnName: string;
  addCost: number;
  startTime: number;
  endTime: number;
}

interface SeaterResponse {
  seaterId: string;
  seater: string;
  baseCost: number;
  rateCardOnResponses?: RateCardOnResponse[];
}

interface TourResponse {
  tourId: string;
  tourName: string;
  mode?: string;
  seaterResponses?: SeaterResponse[];
}
interface RateCardItem {
  rateCardId: string;
  rateCardName: string;
  currency: string;
  tourResponses?: TourResponse[];
}

interface ExpandedTours {
  [key: string | number]: boolean;
}

export const useCommonStates = () => {
  const [message, setMessage] = useState('');

  return {
    message,
    setMessage
  };
};

export const useRateCardActions = ({ dispatch, urls, clearState }: any) => {
  const [isScroll, setIsScroll] = useState<boolean>(false);

  const handleInfinitePagination = useCallback(async (pageNo: number) => {
    setIsScroll(true);
    await dispatch(urls.getRatecardDetails({ pageNo: pageNo, pageSize: 12 }));
  }, []);

  const handleFilterChange = useCallback(
    debounce(async (event: any) => {
      setIsScroll(false);
      dispatch(urls.clearRateCard());
      clearState();
      await dispatch(
        urls.getRatecardDetails({ pageNo: 1, pageSize: 12, search: event || '' })
      );
    }),
    []
  );

  return {
    handleFilterChange,
    handleInfinitePagination,
    isScroll,
    setIsScroll
  };
};

export const useRateCardMenuController = ({ dispatch, urls, clearState }: any) => {
  const [isSelected, setIsSelected] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<RateCardItem | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deletePopup, setIsDeletePopup] = useState<boolean>(false);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUpdateRateCard = (event: any) => {
    event.stopPropagation();
    handleMenuClose();
    setIsSelected(true);
    setIsOpen(true);
  };

  const handleDelete = async () => {
    const res = await dispatch(urls.deleteRateCardDetails(selectedCard?.rateCardId));

    if (res?.meta?.requestStatus === 'fulfilled') {
      setIsDeletePopup(false);
      const data = { pageNo: 1, pageSize: 12 };
      dispatch(urls.clearRateCard());
      clearState();
      await dispatch(urls.getRatecardDetails(data));
    } else {
      setIsDeletePopup(false);
    }
  };

  const addRatecard = async (): Promise<void> => {
    setIsOpen(true);
    setIsSelected(false);
    setSelectedCard(null);
  };

  return {
    handleMenuClose,
    handleUpdateRateCard,
    handleDelete,
    addRatecard,
    isSelected,
    setIsSelected,
    isOpen,
    setIsOpen,
    selectedCard,
    setSelectedCard,
    anchorEl,
    setAnchorEl,
    deletePopup,
    setIsDeletePopup
  };
};

export const useCardDialogActions = ({ setSelectedCard }: any) => {
  const [expandedTours, setExpandedTours] = useState<ExpandedTours>({});
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const handleCardClick = (card: any): void => {
    setSelectedCard(card);
    setDialogOpen(true);
    setExpandedTours({});
  };

  const handleCloseDialog = (): void => {
    setDialogOpen(false);
    setSelectedCard(null);
  };

  const toggleTourExpansion = (tourId: string | number): void => {
    setExpandedTours((prev: any) => ({
      ...prev,
      [tourId]: !prev[tourId]
    }));
  };

  return {
    handleCardClick,
    handleCloseDialog,
    toggleTourExpansion,
    dialogOpen,
    setDialogOpen,
    expandedTours,
    setExpandedTours
  };
};

export const useRateCardEffects = ({
  rateCardDetails,
  setApi,
  handleInfinitePagination,
  rateCardDeatilsCount
}: any) => {
  const [rateData, setRateData] = useState([]);

  useEffect(() => {
    if (rateCardDetails?.length > 0) {
      setRateData(rateCardDetails);
    }
    return () => {
      setRateData([]);
    };
  }, [rateCardDetails]);

  useEffect(() => {
    setApi({
      handlePagination: handleInfinitePagination,
      fetchedData: rateData,
      count: rateCardDeatilsCount
    });
  }, [rateData, rateCardDeatilsCount]);
};

export const useRateCardInitEffects = ({
  dispatch,
  urls,
  handleFilterChange,
  addRatecard
}: any) => {
  useEffect(() => {
    dispatch(urls.getRatecardDetails({ pageNo: 1, pageSize: 12, search: '' }));
    return () => {
      dispatch(urls.clearRateCard());
    };
  }, []);

  useEffect(() => {
    dispatch(urls.setChildComponent({ filter: handleFilterChange, add: addRatecard }));
  }, []);
};
