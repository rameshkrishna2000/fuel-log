import { useCallback, useEffect, useState } from 'react';
import { debounce } from '../../../../utils/commonFunctions';

export const userCommonStates = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [view, setView] = useState<boolean>(false);
  const [roleType, setRoleType] = useState<string>('Add Role');
  const [message, setMessage] = useState<string>('');
  const [selectedFeature, setSelectedFeature] = useState('');
  return {
    isOpen,
    setIsOpen,
    view,
    setView,
    roleType,
    setRoleType,
    message,
    setMessage,
    selectedFeature,
    setSelectedFeature
  };
};

export const useEffectRoles = ({ data, setRow, dispatch, urls }: any) => {
  useEffect(() => {
    if (data?.length > 0) {
      setRow(data);
    } else {
      setRow([]);
    }
  }, [data]);

  useEffect(() => {
    dispatch(urls.getRoles());
  }, []);
};

export const useMenuActionController = ({ setView, dispatch, urls, deleteRole }: any) => {
  const [filteredRow, setFilteredRow] = useState<any>(null);
  const [isDelete, setIsDelete] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setView(false);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    if (filteredRow?.roleId) {
      let action1 = await dispatch(urls.deleteRole({ id: filteredRow?.roleId }));
      if (deleteRole.fulfilled.type === action1.type) {
        dispatch(urls.getRoles());
      }
    }
    setIsDelete(false);
  };

  return {
    handleClick,
    handleClose,
    handleDelete,
    filteredRow,
    setFilteredRow,
    isDelete,
    setIsDelete,
    anchorEl,
    setAnchorEl
  };
};

export const useCommonFunctions = ({
  cardData,

  setView
}: any) => {
  const [featureData, setFeatureData] = useState<any>([]);
  const [filter, setFilter] = useState('');
  const [row, setRow] = useState<any>();

  const handleFilterChange = useCallback(
    debounce((event: string) => {
      setFilter(event);
      const searchValue = event?.toLowerCase();
      const filterData = cardData?.filter((item: any) => {
        const roleName = item?.roleName?.toLowerCase();
        return roleName && searchValue ? roleName.includes(searchValue) : true;
      });
      setRow(filterData);
    }),
    [cardData, row]
  );

  const handleView = (params: any) => {
    const feature = params?.featureAccessResponseList?.map((value: any) => ({
      feature: value?.featureName,
      module: value?.modules?.map((module: any) => ({
        field: module?.moduleName,
        checked: [
          { action: 'GET', checked: false, disabled: true },
          { action: 'ADD', checked: false, disabled: true },
          { action: 'UPDATE', checked: false, disabled: true },
          { action: 'PATCH', checked: false, disabled: true },
          { action: 'DELETE', checked: false, disabled: true }
        ]?.map((item: any) =>
          module?.accessType?.includes(item?.action) ? true : item?.checked
        )
      }))
    }));

    setFeatureData(feature);
    setView(true);
  };

  return {
    handleFilterChange,
    handleView,
    featureData,
    setFeatureData,
    filter,
    setFilter,
    row,
    setRow
  };
};
