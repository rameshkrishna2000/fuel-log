import { Suspense, lazy, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Loader from '../common/components/customized/customloader/CustomLoader';

import { useAppSelector } from '../app/redux/hooks';
import TripsManagement from '../common/pages/user/trips/TripsManagement';
import AutoPlanner from '../features/autoplanner/pages/trips/bookings/AutoPlanner';
import Configuration from '../common/pages/user/configuration/Configuration';
import Driver from '../common/pages/user/configuration/components/driver/Driver';
import RouteConfiguration from '../features/autoplanner/pages/configurations/tour/RouteConfiguration';
import VehicleConfiguration from '../features/autoplanner/pages/configurations/vehicleconfiguration/VehicleConfiguration';
import Agent from '../features/autoplanner/pages/configurations/agents/agents';
import AutoPlannerTrip from '../features/autoplanner/pages/trips/bookings/AutoPlannerTrip';
import AutoGenerateView from '../features/autoplanner/pages/trips/scheduled/AutoGenerateView';
import PickupLocations from '../features/autoplanner/pages/configurations/locations/PickupLocations';
import CustomExcelLoader from '../common/components/customExcelLoader/CustomExcelLoader';
import AvailableTourSummary from '../features/autoplanner/pages/trips/summary/AvailableTourSummary';

import TodayTours from '../features/autoplanner/pages/dashboard/TodayTours';
import VehicleOnboard from '../features/autoplanner/pages/configurations/vehicleconfiguration/VehicleOnboard';

import RegularMode from '../features/autoplanner/pages/configurations/regular/RegularMode';

import Roles from '../common/pages/roles/Roles';
import Users from '../features/autoplanner/pages/trips/Users';
import OperationTeam from '../features/autoplanner/pages/trips/OperationTeam';
import LoginRedirect from '../common/components/loginredirect/LoginRedirect';
import Reports from '../common/pages/user/reports/Reports';
import FuelDashboard from '../features/autoplanner/pages/configurations/fuelDashboard/FuelDashboard';
import FuelSettings from '../features/autoplanner/pages/configurations/fuelDashboard/components/FuelSettings';

const Help = lazy(() => import('../common/pages/user/settings/help/Help'));
// const Analytics = lazy(() => import('../pages/user/analytics/Analytics'));
// const DeliveryAnalytics = lazy(() => import('../pages/user/analytics/DeliveryAnalytics'));

const Management = lazy(() => import('../common/pages/user/management/Management'));

function PrivateRoutes() {
  const { data } = useAppSelector(state => state.auth);
  const { category } = useAppSelector(state => state.RoleModuleAccess);

  let roletype = data?.role;

  const APagent = roletype === 'ROLE_AGENT';
  const APsubAgents = roletype === 'ROLE_SUB_AGENT';
  const deliveryTracking = roletype === 'ROLE_DT_ADMIN';
  const APsuperAdmin = roletype === 'ROLE_AUTOPLANNER_ADMIN';
  const APOperationUser = category === 'OPERATION_USER';
  const APoperator = roletype === 'ROLE_OPERATOR';
  const logistics = roletype === 'ROLE_LOGISTICS_ADMIN';

  const { pathname } = useLocation();

  const LoginRerender = useCallback(() => {
    return <LoginRedirect />;
  }, [pathname]);
  return (
    <Suspense fallback={<Loader />}>
      {APagent || APsubAgents ? (
        <Routes>
          <Route path='*' element={<Navigate to='/today-trips' />} />
          <Route path='/today-trips' element={<TodayTours />} />
          <Route path='/trips' element={<TripsManagement />}>
            <Route path='autoplannertrips' element={<AutoPlanner />}>
              <Route path='tours' element={<AutoPlannerTrip />} />
              <Route path='scheduled-tour' element={<AutoGenerateView />} />
            </Route>
          </Route>
          {!APsubAgents && <Route path='/configuration/agents' element={<Agent />} />}
        </Routes>
      ) : APsuperAdmin || APoperator || APOperationUser ? (
        <Routes>
          <Route path='*' element={<Navigate to='/today-trips' />} />
          <Route path='/today-trips' element={<TodayTours />} />
          <Route path='/trips' element={<TripsManagement />}>
            <Route path='autoplannertrips' element={<AutoPlanner />}>
              <Route path='tours' element={<AutoPlannerTrip />} />
              <Route path='tour-summary' element={<AvailableTourSummary />} />
              <Route path='scheduled-tour' element={<AutoGenerateView />} />
            </Route>
          </Route>

          <Route path='/users' element={<Users />}>
            <Route path='operationteam' element={<OperationTeam />} />
            <Route path='company' element={<Agent />} />
            <Route path='roles' element={<Roles />} />
          </Route>
          <Route path='/fuel-dashboard' element={<FuelDashboard />} />
          <Route path='fuel-settings' element={<FuelSettings />} />

          <Route path='/configuration' element={<Configuration />}>
            <Route path='driver' element={<Driver />} />

            <Route path='roles' element={<Roles />} />

            <Route path='routeconfiguration' element={<RouteConfiguration />} />
            <Route path='regular' element={<RegularMode />} />
            <Route path='vehicleconfiguration' element={<VehicleOnboard />} />
            <Route path='pickupLocations' element={<PickupLocations />} />

            {!APoperator && <Route path='agents' element={<Agent />} />}
          </Route>
          <Route path='/management' element={<Management />}>
            <Route path='reports' element={<Reports />} />
            <Route path='agents' element={<Agent />} />
          </Route>
        </Routes>
      ) : (
        <></>
      )}
      <LoginRerender />
      <CustomExcelLoader />
    </Suspense>
  );
}

export default PrivateRoutes;
