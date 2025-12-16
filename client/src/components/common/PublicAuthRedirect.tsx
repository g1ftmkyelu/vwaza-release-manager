import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface PublicAuthRedirectProps {
  children: React.ReactNode;
}

const PublicAuthRedirect: React.FC<PublicAuthRedirectProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-bg-primary">
        <LoadingSpinner />
      </div>
    );
  }

  if (isAuthenticated) {
    // If authenticated, redirect to their respective dashboard
    return <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/artist/dashboard'} replace />;
  }

  return <>{children}</>;
};

export default PublicAuthRedirect;