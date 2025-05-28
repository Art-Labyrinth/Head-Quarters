import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PrivateRoute from './PrivateRoute.tsx';
import {useUserStore} from "../entities/user";

import {Login} from '../pages/auth/login';
import {Dashboard} from '../pages/dashboard';
import {NotFound} from "../pages/not-found";
import {Volunteers} from "../pages/volunteers";

function App() {
  const { isLoggedIn } = useUserStore()

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<PrivateRoute isAllowed={isLoggedIn}><Dashboard /></PrivateRoute>}/>
          <Route path="/volunteers" element={<PrivateRoute isAllowed={isLoggedIn}><Volunteers /></PrivateRoute>} />
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
