import { Routes, Route, useLocation } from 'react-router-dom';
import Login from '../common/pages/login/Login';
import PrivateRouteApp from './PrivateRouteApp';
import ForgetPassword from '../common/pages/forget-password/ForgetPassword';
import PassengerTripTracking from '../features/autoplanner/pages/trips/scheduled/components/PassengerTripTracking';

function PublicRoutes() {
  let token = localStorage.getItem('token');
  let status = localStorage.getItem('status');
  const { pathname } = useLocation();

  return (
    <Routes>
      <Route
        path='*'
        element={
          (token !== null || status) && pathname.split('/')[1] !== 'trip-tracking' ? (
            <PrivateRouteApp />
          ) : (
            <Login />
          )
        }
      />
      <Route path='/login' element={<Login />} />
      <Route path='/forgetpassword' element={<ForgetPassword />} />
      {/* <Route path='/deliverytracking' element={<Trips />} /> */}

      {/* <Route path='/vieworders' element={<ViewOrders />} /> */}
      <Route path='/tracking' element={<PassengerTripTracking />} />
    </Routes>
  );
}

export default PublicRoutes;
