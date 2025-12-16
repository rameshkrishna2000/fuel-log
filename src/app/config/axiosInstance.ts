import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Store } from 'redux';
import { useAppDispatch } from '../redux/hooks';
import { accessStatus } from '../../common/redux/reducer/commonSlices/loginSlice';

let store: Store;
let tokenRefreshTimer: any;

export const injectStore = (_store: Store) => (store = _store);

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_SERVICE_CONTEXT,
  withCredentials: true
});

axiosInstance.interceptors.request.use((req: any) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;

  return req;
});

axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => res,
  (err: any) => {
    const dispatch = store.dispatch;
    const status = err.response?.status;
    const token = localStorage.getItem('token');
    const isKeepMeLogin = localStorage.getItem('isKeepSignedIn');

    if (status === 401 && Boolean(token) && isKeepMeLogin === 'true') {
      // localStorage.removeItem('token');
      localStorage.setItem('toast', 'false');
      refreshToken();
    } else if (status === 401 && Boolean(token)) {
      dispatch(accessStatus(String(status)));
      localStorage.removeItem('token');
      localStorage.setItem('status', status);
      localStorage.setItem('toast', 'false');
      window.dispatchEvent(new Event('storage'));
    } else if (status === 403 && Boolean(token)) {
      dispatch(accessStatus(String(status)));
      localStorage.setItem('toast', 'false');
      localStorage.setItem('status', status);
      window.dispatchEvent(new Event('storage'));
    } else if (status === 405 && Boolean(token)) {
      dispatch(accessStatus(String(status)));
      localStorage.setItem('toast', 'false');
      localStorage.setItem('status', status);
      window.dispatchEvent(new Event('storage'));
    } else if (status !== 401) {
      localStorage.setItem('toast', 'true');
    }
    return Promise.reject(err);
  }
);

// function to get refresh the token
const refreshToken = async () => {
  try {
    const response = await axiosInstance({
      method: 'POST',
      url: `${import.meta.env.VITE_APP_SERVICE_CONTEXT}user/refresh/token`
    });
    const { token: refreshToken, expiresIn } = response?.data?.data;

    // update the token in local storage
    localStorage.setItem('token', refreshToken);
    localStorage.setItem('expiresIn', expiresIn);

    // setupTokenRefreshTimer();
  } catch (error: any) {
    const dispatch = store.dispatch;
    if (error?.status === 401) {
      localStorage.setItem('status', String(error?.status));
      dispatch(accessStatus(String(error?.status)));
    }

    console.error('Token refresh failed:', error);
  }
};

export default axiosInstance;
