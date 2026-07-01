import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import AuthLoading from './AuthLoading';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isLoadingAuth, authChecked, user } = useAuth();

  if (isLoadingAuth || !authChecked) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/403" replace />;
  }

  return children;
}
