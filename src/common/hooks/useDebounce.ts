//custom hook for debounce
import { useCallback, useMemo } from 'react';

const useDebounce = (func: any, delay: number = 500) => {
  const debounce = (func: any, delay: number) => {
    let timer: any;
    return (...args: any) => {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const memoizedFunction = useCallback(func, []);

  const debouncedFunction = useMemo(() => {
    return debounce(memoizedFunction, delay);
  }, [memoizedFunction]);

  return debouncedFunction;
};

export { useDebounce };
