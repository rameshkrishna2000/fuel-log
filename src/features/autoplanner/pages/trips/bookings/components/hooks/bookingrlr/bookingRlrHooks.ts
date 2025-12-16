import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../../../../../../app/redux/hooks';
import {
  clearBookings,
  GetGrpBookings
} from '../../../../../../redux/reducer/autoPlannerSlices/autoplanner';

export const useCommonFunctionRLR = ({ search }: any) => {
  const dispatch = useAppDispatch();
  const clearFilter = async (payloads: any) => {
    await dispatch(GetGrpBookings({ ...payloads, mode: 'RLR' }));
  };

  const submitFilter = async (payloads: any) => {
    await dispatch(GetGrpBookings({ ...payloads, search: search, mode: 'RLR' }));
  };
  return {
    clearFilter,
    submitFilter
  };
};

export const useCommonUseEffects = ({
  setFilter,
  search,
  sort,
  submitFilter,
  clearFilter,
  customTours,

  payloads
}: any) => {
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState<any>([]);
  useEffect(() => {
    setFilter({
      search: search,
      sort: sort,
      clearFilters: clearFilter,
      submitFilters: submitFilter
    });
  }, [search, sort]);

  useEffect(() => {
    if (customTours) {
      const updatedRows = customTours?.map((item: any, index: number) => ({
        ...item,
        id: index + 1
      }));
      setRows(updatedRows);
    }
  }, [customTours]);
  useEffect(() => {
    dispatch(GetGrpBookings({ ...payloads, mode: 'RLR' }));

    return () => {
      dispatch(clearBookings());
    };
  }, []);
  return {
    rows,
    setRows
  };
};
