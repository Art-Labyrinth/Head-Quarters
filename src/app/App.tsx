import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PrivateRoute from './PrivateRoute.tsx';
import {useUserStore} from "../entities/user";

import {Login} from '../pages/auth/login';
import {Dashboard} from '../pages/dashboard';
import {NotFound} from "../pages/not-found";

function App() {
  const { isLoggedIn } = useUserStore()

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={
              <PrivateRoute isAllowed={isLoggedIn} redirectTo="/">
                <Dashboard />
              </PrivateRoute>
            }
          />
            <Route path="*" element={<NotFound/>}/>
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
