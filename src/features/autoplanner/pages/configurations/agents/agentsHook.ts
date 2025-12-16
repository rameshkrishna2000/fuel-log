import { useCallback, useEffect, useState } from 'react';
import {
  agentDeleteAction,
  clearAgentError,
  clearUsers,
  getAgent
} from '../../../redux/reducer/autoPlannerSlices/agentslice';
import { clearState } from '../../../../../common/redux/reducer/commonSlices/mapSlice';
import { useAppDispatch } from '../../../../../app/redux/hooks';
import { debounce, useAbort } from '../../../../../utils/commonFunctions';

interface Agent {
  name: string;
  mobileNumber: string;
  country: string;
  email: string;
}

export const useCommanSates = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedAgents, setselectedAgents] = useState<Agent | any>(null);
  const [isDialog, setIsDialog] = useState('');
  const [viewDialogGrid, setViewDialogGrid] = useState<boolean>(false);
  const [importButtonDisable, setImportButtonDisable] = useState<boolean>(true);
  const [filter, setFilter] = useState('');
  const [jsonDATA, setJsonData] = useState<any | []>([]);
  const [isHover, setIsHover] = useState(false);
  const [excelData, setExcelData] = useState<any>(null);
  const [deleteError, setDeleteError] = useState<boolean>(false);
  const [importFile, setImportFile] = useState<any>(null);
  const [errorShow, setErrorShow] = useState<boolean>(false);
  const [excelRows, setExcelRows] = useState<[] | any>([]);
  const [INexcelRows, setINExcelRows] = useState<[] | any>([]);
  const [filteredData, setFilteredData] = useState<[] | any>([]);
  const [page, setPage] = useState(1);
  const [isScroll, setIsScroll] = useState<boolean>(false);

  return {
    open,
    setOpen,
    selectedAgents,
    setselectedAgents,
    isDialog,
    setIsDialog,
    viewDialogGrid,
    setViewDialogGrid,
    importButtonDisable,
    setImportButtonDisable,
    filter,
    setFilter,
    jsonDATA,
    setJsonData,
    isHover,
    setIsHover,
    excelData,
    setExcelData,
    deleteError,
    setDeleteError,
    importFile,
    setImportFile,
    errorShow,
    setErrorShow,
    excelRows,
    setExcelRows,
    INexcelRows,
    setINExcelRows,
    filteredData,
    setFilteredData,
    page,
    setPage,
    isScroll,
    setIsScroll
  };
};

export const useCardActions = ({
  setselectedAgents,
  setOpen,
  setIsScroll,
  selectedAgents,
  role,
  page,
  setIsDialog,
  setDeleteError
}: any) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const dispatch = useAppDispatch();
  const createAbort = useAbort();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, agent: Agent) => {
    setAnchorEl(event.currentTarget);
    setselectedAgents(agent);
  };

  const onclose = () => {
    setDeleteError(false);
    dispatch(clearAgentError());
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUpdateVehicle = () => {
    ``;
    setOpen(true);
    setAnchorEl(null);
  };

  const handleDeleteTrip = async () => {
    const getPayload = {
      pageNo: page,
      pageSize: 20,
      role: role,
      signal: createAbort().abortCall.signal
    };
    let payload = {
      id: selectedAgents.id
    };
    const params = { getPayload, payload };
    const res = await dispatch(agentDeleteAction(params));
    if (res?.meta?.requestStatus === 'fulfilled') {
      setIsScroll(false);
      clearState();
      dispatch(clearUsers());
      await dispatch(getAgent(getPayload));
      setIsDialog('');
    }
  };

  return {
    handleMenuClick,
    handleMenuClose,
    handleUpdateVehicle,
    anchorEl,
    handleDeleteTrip,
    onclose
  };
};

export const useTabHook = (setIsScroll: any, setValue: any, createAbort: any) => {
  const dispatch = useAppDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [role, setRole] = useState('');
  const handleTrip = async (e: any, newValue: any) => {
    setIsScroll(false);
    dispatch(clearUsers());
    clearState();
    setTabValue(newValue);
    setValue('search', '');
    switch (newValue) {
      case 0:
        setRole('ROLE_AGENT');
        break;
      case 1:
        setRole('RATE_CARD');
        break;
      default:
        break;
    }
    createAbort().abortCall.abort();
  };

  return {
    handleTrip,
    role,
    setRole,
    tabValue,
    setTabValue
  };
};

export const useFilterPaginationhook = ({
  setIsScroll,
  setFilter,
  role,
  agentDetailsLoading
}: any) => {
  const dispatch = useAppDispatch();
  const handleFilterChange = useCallback(
    debounce(async (event: any) => {
      setIsScroll(false);
      dispatch(clearUsers());
      clearState();
      setFilter(event);
      const payload = {
        pageNo: 1,
        pageSize: 20,
        role: role,
        searchFor: event ? event : ''
      };
      await dispatch(getAgent(payload));
    }),
    [role]
  );

  const handleInfinitePagination = useCallback(
    async (pageNo: number) => {
      // setIsScroll(true);
      // await dispatch(getLoadsConfigAction({ pageNo: pageNo, pageSize: 12 }));

      const payload = {
        pageNo: pageNo,
        pageSize: 8,
        role: role
        // signal: createAbort().abortCall.signal
      };
      await dispatch(getAgent(payload));
    },
    [agentDetailsLoading]
  );
  return {
    handleFilterChange,
    handleInfinitePagination
  };
};

export const useRenderEffect = ({
  setApi,
  handleInfinitePagination,
  agentDetails,
  agentDetailsCount,
  deleteAgentData,
  setDeleteError,
  APagent,
  APsuperAdmin,
  setRole,
  APoperator,
  role,
  page
}: any) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    setApi({
      handlePagination: handleInfinitePagination,
      fetchedData: agentDetails,
      count: agentDetailsCount
    });
  }, [agentDetails, handleInfinitePagination, agentDetailsCount]);

  useEffect(() => {
    if (deleteAgentData?.data?.message) {
      setDeleteError(true);
    }
  }, [deleteAgentData?.data?.message]);

  useEffect(() => {
    return () => {
      dispatch(clearUsers());
      clearState();
    };
  }, []);

  useEffect(() => {
    if (APagent) setRole('ROLE_SUB_AGENT');
    if (APsuperAdmin || APoperator) setRole('ROLE_AGENT');
  }, []);

  useEffect(() => {
    if (role && role !== 'RATE_CARD') {
      const payload = {
        pageNo: page,
        pageSize: 8,
        role: role
        // signal: createAbort().abortCall.signal
      };
      dispatch(getAgent(payload));
    }

    // return () => {
    //   createAbort().abortCall.abort();
    // };
  }, [role, page]);
};
