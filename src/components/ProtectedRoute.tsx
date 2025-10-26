import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { authUtils } from '../services/auth';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  requireAdmin = false 
}) => {
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();
  const location = useLocation();

  // (Removed unused memoized authState to avoid lint warnings)

  // Additional validation check for stored data - Less aggressive
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Double-check that we have valid stored data
      const storedToken = authUtils.getToken();
      const storedUser = authUtils.getCurrentUser();
      
      if (!storedToken || !storedUser) {
        console.log('Stored data mismatch in ProtectedRoute, logging out...');
        authUtils.safeClearAuth('Stored data mismatch in ProtectedRoute');
        return;
      }
      
      // Only check if token is expired (most important check)
      if (authUtils.isTokenExpired()) {
        console.log('Token expired in ProtectedRoute, logging out...');
        authUtils.safeClearAuth('Token expired in ProtectedRoute');
        return;
      }
      
      // Remove format check as it's unnecessary and can cause false logouts
    }
  }, [isLoading, isAuthenticated, user]);



  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Check if we have valid authentication data - Simplified validation
  const hasValidAuth = isAuthenticated && user && authUtils.getToken() && !authUtils.isTokenExpired();

  // Only redirect if definitely not authenticated to prevent reload loops
  if (!isLoading && !hasValidAuth) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Redirect to sign-in with an error notice if user is not admin but admin access is required
  if (!isLoading && requireAdmin && !isAdmin) {
    return <Navigate to="/signin" state={{ error: 'Admin access required. Please sign in with an admin account.' }} replace />;
  }

  // Only render if we're not loading and we have valid authentication
  if (!isLoading && hasValidAuth) {
    return <Outlet />;
  }

  // Fallback loading state
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
};

export default ProtectedRoute; 