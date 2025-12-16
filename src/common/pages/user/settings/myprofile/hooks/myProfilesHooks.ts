import { deleteToken, getMessaging } from 'firebase/messaging';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const useMyProfileHooks = (urls: any) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const messaging = getMessaging();
  const [selectedBadge, setSelectedBadge] = useState<number | null>(1);

  const { connection } = useAppSelector(state => state.websocket);

  //logoutchanges
  const handleSignout = async () => {
    const fireBasetoken = localStorage.getItem('firebaseToken');
    await dispatch(urls.logout({ fireBaseToken: fireBasetoken }));
    const key = localStorage.getItem('isKeepSignedIn');
    if (key === 'false') {
      localStorage.setItem('isKeepSignedIn', 'false');
    }
    await deleteToken(messaging);
    navigate('/');
    if (connection) {
      connection.close();
    }
    localStorage.clear();
    localStorage.removeItem('lastVisitedPage');
    localStorage.removeItem('token');
    dispatch({ type: 'RESET' });
  };

  const handleBadgeClick = (badgeNumber: number): void => {
    setSelectedBadge(badgeNumber);
  };
  return { handleBadgeClick, handleSignout, selectedBadge };
};
