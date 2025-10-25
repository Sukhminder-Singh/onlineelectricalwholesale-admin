import { useState, useEffect } from 'react';

interface UseSimplePageLoadingOptions {
  initialDelay?: number;
}

export function useSimplePageLoading(options: UseSimplePageLoadingOptions = {}) {
  const { initialDelay = 500 } = options;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, initialDelay);

    return () => clearTimeout(timer);
  }, [initialDelay]);

  const setPageLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const setPageError = (err: Error | null) => {
    setError(err);
  };

  return {
    isLoading,
    error,
    setPageLoading,
    setPageError
  };
} 