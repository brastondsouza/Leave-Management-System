import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../api/types';
import toast from 'react-hot-toast';
import Spinner from '../ui/Spinner';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !allowedRoles.includes(user.role)) {
      toast.error("Access denied. You do not have permission to view this page.");
    }
  }, [user, isLoading, isAuthenticated, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner size="lg" label="Checking permissions..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to default dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
