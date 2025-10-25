import React from 'react';
import LoadingOverlay from './LoadingOverlay';
import Skeleton, { SkeletonText } from './Skeleton';

interface WithLoadingOptions {
  showSkeleton?: boolean;
  skeletonProps?: {
    lines?: number;
    className?: string;
  };
  overlayProps?: {
    text?: string;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    backdrop?: boolean;
  };
}

export function withLoading<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  options: WithLoadingOptions = {}
) {
  const {
    showSkeleton = true,
    skeletonProps = { lines: 3 },
    overlayProps = {}
  } = options;

  return React.forwardRef<any, T & { loading?: boolean; error?: Error | null }>((props, ref) => {
    const { loading = false, error = null, ...restProps } = props;

    if (loading && showSkeleton) {
      return (
        <div className="space-y-4">
          <SkeletonText lines={skeletonProps.lines} className={skeletonProps.className} />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 text-center">
          <div className="text-red-600 dark:text-red-400 mb-2">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="font-medium">Something went wrong</p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {error.message || 'An error occurred while loading the data.'}
          </p>
        </div>
      );
    }

    return (
      <LoadingOverlay isLoading={loading} {...overlayProps}>
        <WrappedComponent ref={ref} {...(restProps as T)} />
      </LoadingOverlay>
    );
  });
}

// Hook for easy loading state management
export function useComponentLoading() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const withLoadingState = React.useCallback(async <T,>(
    asyncFunction: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = React.useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    withLoadingState,
    reset,
    setLoading,
    setError
  };
} 