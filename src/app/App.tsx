import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PrivateRoute from './PrivateRoute.tsx';
import {useUserStore} from "../entities/user";

import {Login} from '../pages/auth/login';
import {Dashboard} from '../pages/dashboard';
import {NotFound} from "../pages/not-found";
import {VolunteerPage} from "../pages/volunteer";
import {MasterPage} from "../pages/master";
import {TicketPage} from "../pages/ticket";
import {SettingsPage} from "../pages/settings";
import {canAccessDashboard, canAccessSettings, hasModuleRight} from '../shared/lib/permissions';

function App() {
  const { isLoggedIn, session } = useUserStore()

  const canDashboardPage = canAccessDashboard(session)
  const canMastersPage = hasModuleRight(session, 'masters', 1)
  const canVolunteersPage = hasModuleRight(session, 'volunteers', 1)
  const canTicketsPage = hasModuleRight(session, 'tickets', 1)
  const canSettingsPage = canAccessSettings(session)

  const defaultRoute = canDashboardPage
    ? '/dashboard'
    : canMastersPage
      ? '/masters'
      : canVolunteersPage
        ? '/volunteers'
        : canTicketsPage
          ? '/tickets'
          : canSettingsPage
            ? '/settings'
            : '/login'

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<PrivateRoute isAllowed={isLoggedIn}>{canDashboardPage ? <Dashboard /> : <Navigate to={defaultRoute} />}</PrivateRoute>}/>
          <Route path="/dashboard" element={<PrivateRoute isAllowed={isLoggedIn}>{canDashboardPage ? <Dashboard /> : <Navigate to={defaultRoute} />}</PrivateRoute>}/>
          <Route path="/volunteers" element={<PrivateRoute isAllowed={isLoggedIn}>{canVolunteersPage ? <VolunteerPage /> : <NotFound />}</PrivateRoute>} />
          <Route path="/masters" element={<PrivateRoute isAllowed={isLoggedIn}>{canMastersPage ? <MasterPage /> : <NotFound />}</PrivateRoute>} >
            <Route path=":id" element={<PrivateRoute isAllowed={isLoggedIn}>{canMastersPage ? <MasterPage /> : <NotFound />}</PrivateRoute>} />
          </Route>
          <Route path="/tickets" element={<PrivateRoute isAllowed={isLoggedIn}>{canTicketsPage ? <TicketPage /> : <NotFound />}</PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute isAllowed={isLoggedIn}>{canSettingsPage ? <SettingsPage /> : <NotFound />}</PrivateRoute>} />
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
