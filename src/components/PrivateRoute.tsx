import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import jwtDecode from 'jwt-decode';

interface PrivateRouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const { token, logout } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      logout();
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    logout();
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default PrivateRoute; 