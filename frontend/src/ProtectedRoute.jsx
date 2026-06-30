// ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "@/Components/ui/Spinner";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Handle loading state
  if (loading) {
    return <PageLoader text="Verifying access..." />;
  }

  // Handle case when isAuthenticated is undefined or null
  if (typeof isAuthenticated === 'undefined' || isAuthenticated === null) {
    return <PageLoader text="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle case where user is null but isAuthenticated is true (edge case)
  if (!user) {
    return <PageLoader text="Loading user data..." />;
  }

  // Check role-based access
  if (allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If children are provided (direct usage), render them
  if (children) {
    return children;
  }

  // Otherwise render Outlet for nested routes
  return <Outlet />;
};

export default ProtectedRoute;
