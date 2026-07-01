import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from './Spinner';

/**
 * GuestRoute — wraps pages that should only be accessible to unauthenticated users.
 * If the user is already logged in, they get redirected to their role dashboard.
 */
const GuestRoute = () => {
  const { isLoggedIn, role, initialized } = useAuth();

  if (!initialized) {
    return <Spinner fullPage />;
  }

  if (isLoggedIn && role) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
