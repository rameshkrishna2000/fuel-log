import { useState } from 'react';
import { useAppDispatch } from '../../app/redux/hooks';
import { debounce } from 'lodash';

//custom hook to handle pagination,search,sort ,filter
export const usePagination = ({
  pageno = 1,
  pagesize = 10,
  searchValue = '',
  url,
  payloads,
  otherFunctions
}: any) => {
  const [pageNo, setPageNo] = useState(pageno);
  const [pageSize, setPageSize] = useState(pagesize);
  const [search, setSearch] = useState(searchValue);
  const [sort, setSorting] = useState<any>(null);

  const dispatch = useAppDispatch();
  const handlePagination = async (newModel: any) => {
    const { page: newPageNo, pageSize: newPageSize } = newModel;
    setPageNo(newPageNo + 1);
    setPageSize(newPageSize);
    if (otherFunctions) {
      otherFunctions({ pageNo: newPageNo + 1, pageSize: newPageSize });
      return;
    }
    await dispatch(url({ pageNo: newPageNo + 1, pageSize: newPageSize, ...payloads }));
  };

  const handleSearchChange = debounce(async (value: any) => {
    setSearch(value);
    setPageNo(1);
    await dispatch(url({ pageNo: 1, pageSize: pageSize, search: value, ...payloads }));
  }, 500);

  const handleSortChange = async (sortModel: any) => {
    const [{ field, sort }] = sortModel;
    setSorting({
      sortBy: sort.toUpperCase(),
      sortField: field
    });
    await dispatch(
      url({
        pageNo: 1,
        pageSize: pageSize,
        search: search,
        sortBy: sort.toUpperCase(),
        sortField: field
      })
    );
  };

  return {
    pageNo,
    pageSize,
    search,
    sort,
    setPageNo,
    setPageSize,
    setSearch,
    setSorting,
    handlePagination,
    handleSearchChange,
    handleSortChange
  };
};
