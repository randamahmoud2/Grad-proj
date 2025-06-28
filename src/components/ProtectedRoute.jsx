import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, getUserRole } = useAuth();
  const location = useLocation();
  const userRole = getUserRole();

  console.log('ProtectedRoute Debug:', {
    isAuthenticated: isAuthenticated(),
    userRole,
    allowedRoles,
    currentPath: location.pathname
  });

  if (!isAuthenticated()) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user's role is allowed
  if (allowedRoles && !allowedRoles.some(role => role.toLowerCase() === userRole?.toLowerCase())) {
    console.log('Role not allowed, redirecting to role dashboard');
    return <Navigate to={`/${userRole}/Dashboard`} replace />;
  }

  console.log('Access granted, rendering protected content');
  return children;
};

export default ProtectedRoute; 