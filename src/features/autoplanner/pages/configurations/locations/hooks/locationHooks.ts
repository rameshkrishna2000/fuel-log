//locationhooks.tsx

import React, { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '../../../../../../app/redux/hooks';
import { debounce, PaginationModel } from '../../../../../../utils/commonFunctions';

interface Pickup {
  id: number;
  latitude: number;
  longitude: number;
  locationAddress: string;
  isMain: 0 | 1;
}

export const useStateHook = () => {
  const dispatch = useAppDispatch();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [pickupRows, setPickupRows] = useState<Pickup[]>([]);
  const [filter, setFilter] = useState('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return {
    selectedRows,
    setSelectedRows,
    pickupRows,
    setPickupRows,
    filter,
    setFilter,
    isOpen,
    setIsOpen,
    dispatch
  };
};

export const useLocationFunctionHooks = ({
  setIsOpen,
  selectedRows,
  pickupLocation,
  pageNo,
  pageSize,
  filter,
  pagination,
  setFilter,
  setPageNo,
  urls,
  dispatch
}: any) => {
  const handleViewLocation = (row: Pickup) => {
    setIsOpen(true);
    const marker = [
      {
        id: 'Actual address',
        name: 'myplace',
        lat: row.latitude,
        lng: row.longitude,
        address: row.locationAddress,
        info: { Mylocation: row.locationAddress }
      }
    ];
    dispatch(urls?.map(marker));
    dispatch(urls?.updateZoom(marker));
    dispatch(urls?.updateCenter(marker));
  };

  const handleSelectionChange = async (selection: number[]) => {
    // setSelectedRows(selection);
    const difference =
      selection.filter(item => !selectedRows.includes(item))[0] ||
      selectedRows.filter((item: any) => !selection.includes(item))[0];
    const lastSelectedObject = pickupLocation?.data?.pickupHotelViewList.find(
      (item: Pickup) => item.id === difference
    );

    if (lastSelectedObject) {
      const updatedObject = {
        ...lastSelectedObject,
        isMain: !lastSelectedObject.isMain ? 1 : 0
      };
      const getPayload = {
        pageNo: pageNo,
        pageSize: pageSize,
        location: filter
      };
      const payload = {
        updatedObject,
        getPayload
      };
      await dispatch(urls?.pickupConfigureUpdateAction(payload));
    }
  };

  const handlePaginationModelChange = (newPaginationModel: PaginationModel) => {
    dispatch(
      urls.getPickupLocationAction({
        ...pagination(newPaginationModel),
        location: filter
      })
    );
  };

  const handleFilterChange = useCallback(
    debounce((event: string) => {
      setFilter(event);
      const payload = {
        pageNo: 1,
        pageSize: pageSize,
        location: event
      };
      setPageNo(1);
      dispatch(urls.getPickupLocationAction(payload));
    }),
    [pageSize]
  );

  const handleCloseDetails = () => {
    setIsOpen(false);
  };

  return {
    handleViewLocation,
    handleSelectionChange,
    handlePaginationModelChange,
    handleFilterChange,
    handleCloseDetails
  };
};

export const useEffectLocationHook = ({
  pickupLocation,
  setPickupRows,
  setSelectedRows,
  pageNo,
  pageSize,
  filter,
  urls,
  dispatch
}: any) => {
  useEffect(() => {
    if (
      pickupLocation?.data !== null &&
      pickupLocation?.data?.pickupHotelViewList.length > 0
    ) {
      const pickupData = pickupLocation?.data?.pickupHotelViewList;
      setPickupRows(pickupData);
      setSelectedRows(
        pickupData
          .filter((item: Pickup) => item.isMain === 1)
          .map((item: Pickup) => item.id)
      );
    } else setPickupRows([]);
  }, [pickupLocation]);

  useEffect(() => {
    const payload = {
      pageNo: pageNo,
      pageSize: pageSize,
      location: filter
    };
    dispatch(urls?.getPickupLocationAction(payload));
  }, []);
};
