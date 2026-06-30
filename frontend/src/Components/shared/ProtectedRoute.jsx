import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from './Spinner';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isLoggedIn, role, initialized, loading } = useAuth();

  if (!initialized || loading) {
    return <Spinner fullPage />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const redirectPath = role ? `/${role}/dashboard` : '/login';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
