import { useEffect, useRef, useState } from 'react';

const InfiniteScroll: any = (WrappedComponent: React.FC<any>) => {
  const EnhancedComponent = () => {
    const [fetchURL, setFetchURL] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [previousPage, setPreviousPage] = useState<number>(0);
    const [lastPage, setLastPage] = useState<boolean>(false);

    //function to handle infinite scroll
    const handleScroll = (data: any) => {
      const { scrollTop, scrollHeight, clientHeight } = data;
      if (
        Math.floor(scrollTop + clientHeight) === scrollHeight ||
        Math.ceil(scrollTop + clientHeight) === scrollHeight
      ) {
        setCurrentPage(currentPage + 1);
      }
    };

    //function to reset the page
    const handleReset = () => {
      setCurrentPage(1);
      setPreviousPage(0);
      setLastPage(false);
      setFetchURL(null);
    };

    useEffect(() => {
      if (
        fetchURL?.fetchedData?.length === fetchURL?.count &&
        fetchURL?.count > 0 &&
        fetchURL?.fetchedData?.length > 0
      ) {
        setLastPage(true);
        return;
      }

      if (!lastPage && currentPage !== previousPage && currentPage > 1) {
        fetchURL?.handlePagination(currentPage);
        setPreviousPage(currentPage);
      }
    }, [currentPage, fetchURL?.fetchedData, fetchURL?.count, previousPage, lastPage]);

    return (
      <WrappedComponent
        onScroll={handleScroll}
        setApi={setFetchURL}
        clearState={handleReset}
      />
    );
  };
  return EnhancedComponent;
};

export default InfiniteScroll;
