import { useEffect, useLayoutEffect, useState } from 'react';
import { useAppDispatch } from '../../../../../app/redux/hooks';
import { useAbort } from '../../../../../utils/commonFunctions';

export const useDefaultPageHooks = (
  data: any,
  urls: {
    setDefaultView: any;
    getDefaultView: any;
    clearView: any;
  }
) => {
  const dispatch = useAppDispatch();
  const createAbort = useAbort();

  const [selectedPage, setSelectedPage] = useState<string | null>(data);

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPage(e.target.value);
  };

  const onSubmit = async () => {
    if (selectedPage) {
      dispatch(urls.setDefaultView(selectedPage));
    }
  };

  useEffect(() => {
    dispatch(urls.getDefaultView(createAbort().abortCall.signal));
    return () => {
      dispatch(urls.clearView());
      createAbort().abortCall.abort();
    };
  }, []);

  useLayoutEffect(() => {
    setSelectedPage(data);
  }, [data]);

  return { handleRadioChange, onSubmit, selectedPage };
};
