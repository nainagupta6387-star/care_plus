import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAuthToken } from '../../api';

export const getDashboardForRole = (role) => {
  switch (role) {
    case 'patient':
      return '/patient-dashboard';
    case 'doctor':
      return '/doctor-dashboard';
    case 'admin':
      return '/admin-dashboard';
    case 'receptionist':
      return '/receptionist-dashboard';
    default:
      return '/patient-dashboard';
  }
};

export const PublicRoute = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect');

  const token = getAuthToken();
  const storedUserJson = localStorage.getItem('careplus_patient_user');
  const user = storedUserJson ? JSON.parse(storedUserJson) : null;

  // If user is already logged in, block access to Login/Register and redirect to target or role dashboard
  if (token && user) {
    const targetPath = redirectTarget ? decodeURIComponent(redirectTarget) : getDashboardForRole(user.role);
    return <Navigate to={targetPath} replace />;
  }

  return <Outlet />;
};
