import { Dialog, DialogProps, styled } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { debounce } from '../../../../../../utils/commonFunctions';
import {
  clearDriverFuelData,
  getAllDriverFuel
} from '../../../../../../common/redux/reducer/commonSlices/driverFuelSlice';

export const useMemoDialog = ({ files }: any) => {
  const BlurryDialog = styled(Dialog)<DialogProps>(({ theme }) => ({
    backgroundColor: 'rgba(60, 60, 60, 0.5)'
  }));
  const MemoizedDialog = useCallback(BlurryDialog, [files?.length]);
  return { MemoizedDialog };
};

export const useDriverFuelStates = () => {
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [imageCard, setImageCard] = useState(false);
  const [files, setFiles] = useState<any>([]);
  const [isScroll, setIsScroll] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<any>();
  return {
    isDelete,
    setIsDelete,
    imageCard,
    setImageCard,
    files,
    setFiles,
    isScroll,
    setIsScroll,
    searchValue,
    setSearchValue,
    inputRef
  };
};

export const useHandleAddFuel = ({ navigate }: any) => {
  const handleAddFuel = () => {
    navigate('/add-driver-fuel');
  };
  return { handleAddFuel };
};

export const useHandleImage = ({ setImageCard, setFiles }: any) => {
  const handleImage = (item: any) => {
    setImageCard(true);
    const allFiles = [
      ...(item?.odometerAttachments || []).map((item: any) => ({
        url: item?.imageUrl,
        name: item?.originalFileName
      })),
      ...(item?.fuelReceiptAttachments || []).map((item: any) => ({
        url: item?.imageUrl,
        name: item?.originalFileName
      })),
      ...(item?.adblueReceiptAttachments || []).map((item: any) => ({
        url: item?.imageUrl,
        name: item?.originalFileName
      }))
    ];
    setFiles(allFiles);
  };
  return { handleImage };
};

export const useHandleUpdate = ({ navigate }: any) => {
  const handleUpdate = (item: any) => {
    navigate('/add-driver-fuel', {
      state: { selectedRow: item }
    });
  };
  return { handleUpdate };
};

export const useHandleSearch = ({
  setIsScroll,
  clearState,
  dispatch,
  setSearchValue
}: any) => {
  const handleSearchChange = useCallback(
    debounce(async (event: any) => {
      setIsScroll(false);
      setSearchValue(event);
      clearState();
      dispatch(clearDriverFuelData());
      await dispatch(getAllDriverFuel({ pageNo: 1, pageSize: 8, search: event }));
    }),
    []
  );
  return { handleSearchChange };
};

export const useHandleInfinitePage = ({ setIsScroll, dispatch, searchValue }: any) => {
  const handleInfinitePagination = useCallback(
    async (pageNo: number) => {
      setIsScroll(true);
      await dispatch(
        getAllDriverFuel({ pageNo: pageNo, pageSize: 8, search: searchValue })
      );
    },
    [searchValue]
  );
  return { handleInfinitePagination };
};

export const useDriverFuelEffects = ({
  dispatch,
  setApi,
  data,
  count,
  handleInfinitePagination
}: any) => {
  useEffect(() => {
    dispatch(clearDriverFuelData());
    dispatch(getAllDriverFuel({ pageNo: 1, pageSize: 8 }));
  }, []);

  useEffect(() => {
    setApi({
      handlePagination: handleInfinitePagination,
      fetchedData: data,
      count: count
    });
  }, [data, count]);
};
