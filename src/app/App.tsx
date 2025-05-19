import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../pages/auth/login/ui.tsx';
import Dashboard from '../pages/dashboard/ui.tsx';
import PrivateRoute from './PrivateRoute.tsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
