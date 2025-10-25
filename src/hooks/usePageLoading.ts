import { useState, useEffect, useCallback, useRef } from 'react';
import { useLoading } from '../context/LoadingContext';

interface UsePageLoadingOptions {
  initialDelay?: number;
  showGlobalLoading?: boolean;
}

export function usePageLoading(options: UsePageLoadingOptions = {}) {
  const { initialDelay = 500, showGlobalLoading = true } = options;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { showLoading, hideLoading } = useLoading();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        isInitialized.current = true;
      }, initialDelay);

      return () => clearTimeout(timer);
    }
  }, [initialDelay]);

  const setPageLoading = useCallback((loading: boolean, message?: string) => {
    setIsLoading(loading);
    if (showGlobalLoading) {
      if (loading) {
        showLoading(message || 'Loading...');
      } else {
        hideLoading();
      }
    }
  }, [showGlobalLoading, showLoading, hideLoading]);

  const setPageError = useCallback((err: Error | null) => {
    setError(err);
    if (err && showGlobalLoading) {
      showLoading('Error occurred', 'danger');
      setTimeout(() => hideLoading(), 3000);
    }
  }, [showGlobalLoading, showLoading, hideLoading]);

  return {
    isLoading,
    error,
    setPageLoading,
    setPageError
  };
} 