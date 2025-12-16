import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import LoginRedirect from '../loginredirect/LoginRedirect';

interface PortalProps {
  children: ReactNode;
  containerId: string;
}

const CustomPortal: any = (WrappedComponent: React.FC<any>) => {
  const EnhancedComponent = () => {
    const [status, setStatus] = useState(false);
    const [childState, setChildState] = useState<any>({ dependencies: [] });

    const RedirectLogin = useCallback(() => {
      return <LoginRedirect />;
    }, [status]);

    useEffect(() => {
      const handleStatus = () => {
        setStatus(true);
      };
      (window as any)?.addEventListener('storage', handleStatus);

      return () => {
        (window as any).removeEventListener('storage', null);
      };
    }, [...childState.dependencies]);
    return (
      <WrappedComponent setChildState={setChildState}>
        <RedirectLogin />
      </WrappedComponent>
    );
  };

  return EnhancedComponent;
};

export default CustomPortal;
