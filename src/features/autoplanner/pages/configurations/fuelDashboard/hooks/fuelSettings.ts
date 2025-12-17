import { useEffect, useState } from 'react';
import {
  addFuelStation,
  addFuelType,
  addPaymentMethod,
  deactivateFuelStation,
  deactivateFuelType,
  deactivatePaymentMethod,
  deleteFuelStation,
  deleteFuelType,
  deletePaymentMethod,
  getFuelStation,
  getFuelType,
  getPaymentMethod,
  updateFuelStation,
  updateFuelType,
  updatePaymentMethod
} from '../../../../../../common/redux/reducer/commonSlices/driverFuelSlice';
import { debounce } from '../../../../../../utils/commonFunctions';
import { GridRowModes } from '@mui/x-data-grid';

export const roleList = ['Fuel Type', 'Fuel Station', 'Payment Method'];

export const useFuelSettingsState = () => {
  const [tabValue, setTabValue] = useState<any>(0);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchValue, setSearchValue] = useState('');
  const [sorting, setSorting] = useState<any>(null);
  const [openActivatePopup, setOpenActivatePopup] = useState(false);
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [rowModesModel, setRowModesModel] = useState<any>({});
  const [isCreatingRow, setIsCreatingRow] = useState(false);
  const [tempNewRow, setTempNewRow] = useState<any>(null);
  return {
    tabValue,
    setTabValue,
    pageNo,
    setPageNo,
    pageSize,
    setPageSize,
    searchValue,
    setSearchValue,
    sorting,
    setSorting,
    openActivatePopup,
    setOpenActivatePopup,
    openDeletePopup,
    setOpenDeletePopup,
    selectedRow,
    setSelectedRow,
    rowModesModel,
    setRowModesModel,
    isCreatingRow,
    setIsCreatingRow,
    tempNewRow,
    setTempNewRow
  };
};

export const useHandleDeactivate = ({ setSelectedRow, setOpenActivatePopup }: any) => {
  const handleDeactivate = async (row: any) => {
    setSelectedRow(row);
    setOpenActivatePopup(true);
  };
  return { handleDeactivate };
};

export const useHandleConfirmDeactivate = ({
  selectedRow,
  tabValue,
  dispatch,
  setPageNo,
  pageSize,
  searchValue,
  sorting,
  setOpenActivatePopup,
  setSelectedRow
}: any) => {
  const handleConfirmDeactivate = async () => {
    if (!selectedRow) return;

    switch (tabValue) {
      case 0:
        const typePayload = {
          id: selectedRow?.id,
          isActive: selectedRow?.isActive
        };
        await dispatch(deactivateFuelType(typePayload));
        setPageNo(1);
        await dispatch(
          getFuelType({
            pageNo: 1,
            pageSize: pageSize,
            search: searchValue,
            sortBy: sorting?.sortBy,
            sortByDirection: sorting?.sortByDirection
          })
        );
        break;
      case 1:
        const payload = {
          isActive: selectedRow?.isActive,
          id: selectedRow?.id
        };
        await dispatch(deactivateFuelStation(payload));
        setPageNo(1);
        await dispatch(
          getFuelStation({
            pageNo: 1,
            pageSize: pageSize,
            search: searchValue,
            sortBy: sorting?.sortBy,
            sortByDirection: sorting?.sortByDirection
          })
        );
        break;
      case 2:
        const payloads = {
          isActive: selectedRow?.isActive,
          id: selectedRow?.id
        };
        await dispatch(deactivatePaymentMethod(payloads));
        setPageNo(1);
        await dispatch(
          getPaymentMethod({
            pageNo: 1,
            pageSize: pageSize,
            search: searchValue,
            sortBy: sorting?.sortBy,
            sortByDirection: sorting?.sortByDirection
          })
        );
        break;
      default:
        break;
    }

    setOpenActivatePopup(false);
    setSelectedRow(null);
  };
  return { handleConfirmDeactivate };
};

export const useHandleTabChange = ({
  setIsCreatingRow,
  setTempNewRow,
  setRowModesModel,
  setPageNo,
  setPageSize,
  setValue,
  setSearchValue,
  setSorting,
  resetField,
  clearErrors,
  dispatch,
  setTabValue,
  rowModesModel
}: any) => {
  const handleTabChange = async (event: any, newValue: number) => {
    setIsCreatingRow(false);
    setTempNewRow(null);

    // Reset all row modes to View mode to close any open edits
    const resetRowModesModel: any = {};
    Object.keys(rowModesModel).forEach(key => {
      resetRowModesModel[key] = { mode: GridRowModes.View, ignoreModifications: true };
    });
    setRowModesModel(resetRowModesModel);

    // Clear the row modes model completely after a short delay
    setTimeout(() => {
      setRowModesModel({});
    }, 0);

    setTabValue(newValue);
    setPageNo(1);
    setPageSize(5);
    setValue('search', '');
    setSearchValue('');
    setSorting(null);

    resetField('name', {
      defaultValue: '',
      keepError: false,
      keepDirty: false,
      keepTouched: false
    });
    clearErrors('name');

    switch (newValue) {
      case 0:
        await dispatch(getFuelType({ pageNo: 1, pageSize: 5 }));
        break;
      case 1:
        await dispatch(getFuelStation({ pageNo: 1, pageSize: 5 }));
        break;
      case 2:
        await dispatch(getPaymentMethod({ pageNo: 1, pageSize: 5 }));
        break;
      default:
        break;
    }
  };
  return { handleTabChange };
};

export const useHandlePagination = ({
  setPageNo,
  setPageSize,
  searchValue,
  sorting,
  tabValue,
  dispatch
}: any) => {
  const handlePagination = async (newModel: any) => {
    const { page: newPageNo, pageSize: newPageSize } = newModel;
    setPageNo(newPageNo + 1);
    setPageSize(newPageSize);
    const payload = {
      pageNo: newPageNo + 1,
      pageSize: newPageSize,
      search: searchValue,
      sortBy: sorting?.sortBy,
      sortByDirection: sorting?.sortByDirection
    };
    switch (tabValue) {
      case 0:
        await dispatch(getFuelType(payload));
        break;
      case 1:
        await dispatch(getFuelStation(payload));
        break;
      case 2:
        await dispatch(getPaymentMethod(payload));
        break;
      default:
        break;
    }
  };
  return { handlePagination };
};

export const useHandleSearchChange = ({
  setSearchValue,
  setValue,
  setPageNo,
  pageSize,
  sorting,
  tabValue,
  dispatch
}: any) => {
  const handleSearchChange = debounce(async (value: any) => {
    setSearchValue(value);
    setValue('search', value);
    setPageNo(1);
    const payload = {
      pageNo: 1,
      pageSize: pageSize,
      search: value,
      sortBy: sorting?.sortBy,
      sortByDirection: sorting?.sortByDirection
    };
    switch (tabValue) {
      case 0:
        await dispatch(getFuelType(payload));
        break;
      case 1:
        await dispatch(getFuelStation(payload));
        break;
      case 2:
        await dispatch(getPaymentMethod(payload));
        break;
      default:
        break;
    }
  }, 1000);
  return { handleSearchChange };
};

export const useHandleSortChange = ({
  setPageNo,
  setSorting,
  pageSize,
  searchValue,
  tabValue,
  dispatch
}: any) => {
  const handleSortChange = async (sortModel: any) => {
    setPageNo(1);
    if (sortModel.length === 0) {
      setSorting(null);
      const payload = {
        pageNo: 1,
        pageSize: pageSize,
        search: searchValue
      };
      switch (tabValue) {
        case 0:
          await dispatch(getFuelType(payload));
          break;
        case 1:
          await dispatch(getFuelStation(payload));
          break;
        case 2:
          await dispatch(getPaymentMethod(payload));
          break;
        default:
          break;
      }
      return;
    }

    const [{ field, sort }] = sortModel;

    setSorting({
      sortBy: field,
      sortByDirection: sort.toUpperCase()
    });
    const payload = {
      pageNo: 1,
      pageSize: pageSize,
      search: searchValue,
      sortBy: field,
      sortByDirection: sort.toUpperCase()
    };
    switch (tabValue) {
      case 0:
        await dispatch(getFuelType(payload));
        break;
      case 1:
        await dispatch(getFuelStation(payload));
        break;
      case 2:
        await dispatch(getPaymentMethod(payload));
        break;
      default:
        break;
    }
  };
  return { handleSortChange };
};

export const useHandleBack = ({ navigate }: any) => {
  const handleBack = () => {
    navigate('/fuel-dashboard');
  };
  return { handleBack };
};

export const useHandleAddRow = ({
  tabValue,
  setTempNewRow,
  setIsCreatingRow,
  setRowModesModel
}: any) => {
  const handleAddRow = () => {
    const newRowId = `temp-${Date.now()}`;
    let newRow: any = {
      id: newRowId,
      isActive: true,
      isNew: true,
      name: ''
    };
    if (tabValue === 0) {
      newRow.name = '';
    } else if (tabValue === 1) {
      newRow.name = '';
    } else if (tabValue === 2) {
      newRow.name = '';
    }
    setTempNewRow(newRow);
    setIsCreatingRow(true);
    setRowModesModel({
      [newRowId]: { mode: GridRowModes.Edit }
    });
  };
  return { handleAddRow };
};

export const useHandleEdit = ({
  trigger,
  setIsCreatingRow,
  setTempNewRow,
  resetField,
  clearErrors,
  tabValue,
  dispatch,
  setPageNo,
  pageSize,
  searchValue,
  sorting
}: any) => {
  const handleEditingRowSave = async (newRow: any, oldRow: any) => {
    const isNewRow = newRow.isNew === true;

    const isValid = await trigger('name');

    if (!isValid) {
      throw new Error('Validation failed');
    }

    setIsCreatingRow(false);
    setTempNewRow(null);

    resetField('name', {
      defaultValue: '',
      keepError: false,
      keepDirty: false,
      keepTouched: false
    });

    clearErrors('name');

    switch (tabValue) {
      case 0:
        if (isNewRow) {
          const payload = {
            fuelType: newRow.name
          };
          await dispatch(addFuelType(payload));
        } else {
          const payload = {
            id: newRow.id,
            fuelType: newRow.name
          };
          await dispatch(updateFuelType(payload));
        }
        setPageNo(1);
        const typePayload = {
          pageNo: 1,
          pageSize: pageSize,
          search: searchValue,
          sortBy: sorting?.sortBy,
          sortByDirection: sorting?.sortByDirection
        };
        await dispatch(getFuelType(typePayload));
        break;

      case 1:
        if (isNewRow) {
          const payload = {
            name: newRow.name
          };
          await dispatch(addFuelStation(payload));
        } else {
          const payload = {
            fuelStationId: newRow.id,
            name: newRow.name
          };
          await dispatch(updateFuelStation(payload));
        }
        setPageNo(1);
        const stationPayload = {
          pageNo: 1,
          pageSize: pageSize,
          search: searchValue,
          sortBy: sorting?.sortBy,
          sortByDirection: sorting?.sortByDirection
        };
        await dispatch(getFuelStation(stationPayload));
        break;

      case 2:
        if (isNewRow) {
          const payload = {
            name: newRow.name
          };
          await dispatch(addPaymentMethod(payload));
        } else {
          const payload = {
            paymentMethodId: newRow.id,
            name: newRow.name
          };
          await dispatch(updatePaymentMethod(payload));
        }
        setPageNo(1);
        const paymentPayload = {
          pageNo: 1,
          pageSize: pageSize,
          search: searchValue,
          sortBy: sorting?.sortBy,
          sortByDirection: sorting?.sortByDirection
        };
        await dispatch(getPaymentMethod(paymentPayload));
        break;

      default:
        break;
    }

    return newRow;
  };
  return { handleEditingRowSave };
};

export const useHandleEditStart = ({ setValue }: any) => {
  const handleEditingRowStart = (id: any, row: any) => {
    if (row.name) {
      setValue('name', row.name);
    }
  };
  return { handleEditingRowStart };
};

export const useHandleDelete = ({ setSelectedRow, setOpenDeletePopup }: any) => {
  const handleDelete = async (row: any) => {
    setSelectedRow(row);
    setOpenDeletePopup(true);
  };
  return { handleDelete };
};

export const useHandleConfirmDelete = ({
  selectedRow,
  tabValue,
  dispatch,
  setPageNo,
  pageSize,
  searchValue,
  sorting,
  setOpenDeletePopup,
  setSelectedRow
}: any) => {
  const handleConfirmDelete = async () => {
    if (!selectedRow) return;

    switch (tabValue) {
      case 0:
        await dispatch(deleteFuelType(selectedRow?.id));
        setPageNo(1);
        const typePayload = {
          pageNo: 1,
          pageSize: pageSize,
          search: searchValue,
          sortBy: sorting?.sortBy,
          sortByDirection: sorting?.sortByDirection
        };
        await dispatch(getFuelType(typePayload));
        break;
      case 1:
        await dispatch(deleteFuelStation(selectedRow?.id));
        setPageNo(1);
        const stationPayload = {
          pageNo: 1,
          pageSize: pageSize,
          search: searchValue,
          sortBy: sorting?.sortBy,
          sortByDirection: sorting?.sortByDirection
        };
        await dispatch(getFuelStation(stationPayload));
        break;
      case 2:
        await dispatch(deletePaymentMethod(selectedRow?.id));
        setPageNo(1);
        const paymentPayload = {
          pageNo: 1,
          pageSize: pageSize,
          search: searchValue,
          sortBy: sorting?.sortBy,
          sortByDirection: sorting?.sortByDirection
        };
        await dispatch(getPaymentMethod(paymentPayload));
        break;
      default:
        break;
    }

    setOpenDeletePopup(false);
    setSelectedRow(null);
  };
  return { handleConfirmDelete };
};

export const useHandleEditCancel = ({
  setIsCreatingRow,
  setTempNewRow,
  resetField,
  clearErrors
}: any) => {
  const handleEditingRowCancel = () => {
    setIsCreatingRow(false);
    setTempNewRow(null);

    resetField('name', {
      defaultValue: '',
      keepError: false,
      keepDirty: false,
      keepTouched: false
    });

    clearErrors('name');
  };
  return { handleEditingRowCancel };
};

export const useHandleProcessRow = ({ tempNewRow, setRowModesModel }: any) => {
  const handleProcessRowUpdateError = (error: Error) => {

    if (tempNewRow) {
      setRowModesModel({
        [tempNewRow.id]: { mode: GridRowModes.Edit }
      });
    }
  };
  return { handleProcessRowUpdateError };
};

export const useCurrentRows = ({
  tabValue,
  fuelTypeData,
  fuelStationData,
  paymentMethodData,
  tempNewRow
}: any) => {
  const getCurrentRows = () => {
    let baseRows = [];
    switch (tabValue) {
      case 0:
        baseRows = fuelTypeData || [];
        break;
      case 1:
        baseRows = fuelStationData || [];
        break;
      case 2:
        baseRows = paymentMethodData || [];
        break;
      default:
        baseRows = [];
    }

    if (tempNewRow) {
      return [tempNewRow, ...baseRows];
    }
    return baseRows;
  };
  return { getCurrentRows };
};

export const useCurrentColumns = ({
  tabValue,
  fuelTypeColumns,
  fuelStationColumns,
  paymentMethodColumns
}: any) => {
  const getCurrentColumns = () => {
    switch (tabValue) {
      case 0:
        return fuelTypeColumns;
      case 1:
        return fuelStationColumns;
      case 2:
        return paymentMethodColumns;
      default:
        return fuelTypeColumns;
    }
  };
  return { getCurrentColumns };
};

export const useCurrentRowsCount = ({
  tabValue,
  fuelTypeCount,
  fuelStationCount,
  paymentCount
}: any) => {
  const getCurrentRowCount = () => {
    switch (tabValue) {
      case 0:
        return fuelTypeCount;
      case 1:
        return fuelStationCount;
      case 2:
        return paymentCount;
      default:
        return fuelTypeCount;
    }
  };
  return { getCurrentRowCount };
};

export const useFuelSettingsEffect = ({ dispatch }: any) => {
  useEffect(() => {
    dispatch(getFuelType({ pageNo: 1, pageSize: 5 }));
  }, []);
};
