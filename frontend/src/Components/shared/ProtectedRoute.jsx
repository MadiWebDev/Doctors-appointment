import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from './Spinner';

/**
 * allowedRoles — string (single role) or array of role strings
 * Waits for auth initialization before deciding.
 * Returns <Outlet /> when checks pass.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { isLoggedIn, role, initialized } = useAuth();

  // Wait until we know auth state
  if (!initialized) {
    return <Spinner fullPage />;
  }

  // Not logged in → send to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Role check — support both string and array
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (roles.length > 0 && !roles.includes(role)) {
      // Redirect to their own dashboard instead of login
      const redirectPath = role ? `/${role}/dashboard` : '/login';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
