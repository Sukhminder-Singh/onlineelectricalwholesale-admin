import React, { useEffect, useState } from 'react';
import { LoadingSpinner, LoadingOverlay, SkeletonText } from './index';
import { useLoading } from '../../../context/LoadingContext';

interface PageLoadingWrapperProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: Error | null;
  skeleton?: boolean;
  skeletonLines?: number;
  loadingText?: string;
  className?: string;
}

const PageLoadingWrapper: React.FC<PageLoadingWrapperProps> = ({
  children,
  loading = false,
  error = null,
  skeleton = true,
  skeletonLines = 3,
  loadingText = 'Loading page...',
  className = ''
}) => {
  const { incrementLoading, decrementLoading } = useLoading();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Simulate initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Track loading state globally
  useEffect(() => {
    if (loading) {
      incrementLoading();
    } else {
      decrementLoading();
    }

    return () => {
      if (loading) {
        decrementLoading();
      }
    };
  }, [loading]); // Remove incrementLoading and decrementLoading from dependencies

  // Show skeleton during initial load or when loading is true
  if ((isInitialLoading || loading) && skeleton) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="space-y-4">
          <SkeletonText lines={skeletonLines} />
          <SkeletonText lines={skeletonLines} />
          <SkeletonText lines={skeletonLines} />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-64 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium">Something went wrong</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {error.message || 'An error occurred while loading the page.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading overlay for non-skeleton loading
  if (loading && !skeleton) {
    return (
      <LoadingOverlay isLoading={true} text={loadingText}>
        {children}
      </LoadingOverlay>
    );
  }

  // Show content
  return <>{children}</>;
};

export default PageLoadingWrapper; 