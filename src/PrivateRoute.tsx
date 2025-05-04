import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;