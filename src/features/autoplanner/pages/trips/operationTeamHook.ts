// import { useAppDispatch } from '../../../../app/redux/hooks';
// import { clearState } from '../../../../common/redux/reducer/commonSlices/mapSlice';
// import { useAbort } from '../../../../utils/commonFunctions';
// import {
//   agentDeleteAction,
//   clearUsers,
//   getAgent
// } from '../../redux/reducer/autoPlannerSlices/agentslice';

import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '../../../../app/redux/hooks';
import { debounce, useAbort } from '../../../../utils/commonFunctions';
import {
  agentDeleteAction,
  clearAgentError,
  clearUsers,
  getAgent
} from '../../redux/reducer/autoPlannerSlices/agentslice';
import { clearState } from '../../../../common/redux/reducer/commonSlices/mapSlice';
import { userRoleGETAction } from '../../../../common/redux/reducer/commonSlices/roleSlice';

// export const useCardAction = (
//   page: any,
//   role: any,
//   selectedAgents: any,
//   setIsScroll: any,
//   setIsDialog: any
// ) => {
//   const dispatch = useAppDispatch();
//   const createAbort = useAbort();
//   const handleDeleteTrip = async () => {
//     const getPayload = {
//       pageNo: page,
//       pageSize: 20,
//       role: 'ROLE_OPERATOR',
//       ...(role === 'ROLE_OPERATOR_USER' && { category: 'OPERATION_USER' }),
//       signal: createAbort().abortCall.signal
//     };
//     let payload = {
//       id: selectedAgents.id
//     };
//     const params = { getPayload, payload };
//     const res = await dispatch(agentDeleteAction(params));
//     if (res?.meta?.requestStatus === 'fulfilled') {
//       setIsScroll(false);
//       clearState();
//       dispatch(clearUsers());
//       await dispatch(getAgent(getPayload));
//       setIsDialog('');
//     }
//   };

//   const handleMenuClick = (event: React.MouseEvent<HTMLElement>, agent: Agent) => {
//     setAnchorEl(event.currentTarget);
//     setselectedAgents(agent);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//   };
//   return {
//     handleDeleteTrip
//   };
// };

interface Agent {
  name: string;
  mobileNumber: string;
  country: string;
  email: string;
}

export const useCommanOperatorSates = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedAgents, setselectedAgents] = useState<Agent | any>(null);
  const [isDialog, setIsDialog] = useState('');
  const [viewDialogGrid, setViewDialogGrid] = useState<boolean>(false);
  const [importButtonDisable, setImportButtonDisable] = useState<boolean>(true);
  const [filter, setFilter] = useState('');
  const [view, setView] = useState<boolean>(false);
  const [jsonDATA, setJsonData] = useState<any | []>([]);
  const [isHover, setIsHover] = useState(false);
  const [excelData, setExcelData] = useState<any>(null);
  const [deleteError, setDeleteError] = useState<boolean>(false);
  const [importFile, setImportFile] = useState<any>(null);
  const [errorShow, setErrorShow] = useState<boolean>(false);
  const [excelRows, setExcelRows] = useState<[] | any>([]);
  const [selectedFeature, setSelectedFeature] = useState('');
  const [INexcelRows, setINExcelRows] = useState<[] | any>([]);
  const [filteredData, setFilteredData] = useState<[] | any>([]);
  const [page, setPage] = useState(1);
  const [isScroll, setIsScroll] = useState<boolean>(false);
  const [featureData, setFeatureData] = useState<any>([]);

  return {
    open,
    selectedFeature,
    featureData,
    setFeatureData,
    setSelectedFeature,
    view,
    setView,
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
  setView,
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

  const handleUserAccess = async (data: any) => {
    if (role !== 'ROLE_OPERATOR') {
      await dispatch(userRoleGETAction(data));
      setView(true);
    }
  };

  const onclose = () => {
    setDeleteError(false);
    dispatch(clearAgentError());
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUpdateVehicle = () => {
    setOpen(true);
    setAnchorEl(null);
  };

  const handleDeleteTrip = async () => {
    const getPayload = {
      pageNo: page,
      pageSize: 20,
      role: role,
      ...(role === 'ROLE_OPERATOR_USER' && { category: 'OPERATION_USER' }),
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
    handleUserAccess,
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
    switch (newValue) {
      case 0:
        setRole('ROLE_OPERATOR');
        break;
      case 1:
        setRole('ROLE_OPERATOR_USER');
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
        role: 'ROLE_OPERATOR',
        ...(role === 'ROLE_OPERATOR_USER' && { category: 'OPERATION_USER' }),
        searchFor: event ? event : ''
      };
      await dispatch(getAgent(payload));
    }),
    [role]
  );

  const handleInfinitePagination = useCallback(
    async (pageNo: number) => {
      // await dispatch(getLoadsConfigAction({ pageNo: pageNo, pageSize: 12 }));
      // if (!agentDetailsLoading)
      const payload = {
        pageNo: pageNo,
        pageSize: 8,
        role: role,
        ...(role === 'ROLE_OPERATOR_USER' && { category: 'OPERATION_USER' })
        // signal: createAbort().abortCall.signal
      };
      await dispatch(getAgent(payload));
      // }
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
  role,
  ApOperator,
  page,
  setSelectedFeature,
  setFeatureData,
  RoleAccess
}: any) => {
  const dispatch = useAppDispatch();

  const mapRoleDataToFeatureData = (roleData: any) => {
    if (!roleData?.featureAccessResponseList) return [];

    return roleData.featureAccessResponseList.map((feature: any) => ({
      feature: feature.featureName,
      module: feature.modules.map((mod: any) => ({
        field: mod.moduleName,
        checked: [
          mod.accessType.includes('GET'),
          mod.accessType.includes('ADD'),
          mod.accessType.includes('UPDATE'),
          mod.accessType.includes('PATCH'),
          mod.accessType.includes('DELETE')
        ]
      }))
    }));
  };

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
    if (role) {
      const payload = {
        pageNo: page,
        pageSize: 8,
        role: 'ROLE_OPERATOR',
        ...(role !== 'ROLE_OPERATOR' && { category: 'OPERATION_USER' })
      };
      dispatch(getAgent(payload));
    }
    // return () => {
    //   createAbort().abortCall.abort();
    // };
  }, [role, page]);

  useEffect(() => {
    if (APagent) setRole('ROLE_SUB_AGENT');
    if (APsuperAdmin) setRole('ROLE_OPERATOR');
    if (ApOperator) setRole('ROLE_OPERATOR_USER');
  }, []);

  useEffect(() => {
    if (RoleAccess?.data?.data) {
      const transformed = mapRoleDataToFeatureData(RoleAccess.data.data);
      setFeatureData(transformed);
      setSelectedFeature(transformed[0]?.feature || '');
    }
  }, [RoleAccess]);
};
