import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDataFetchingOptions<T> {
  initialData?: T;
  immediate?: boolean;
  retryCount?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  dependencies?: any[];
}

interface UseDataFetchingReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setData: (data: T) => void;
  reset: () => void;
}

export function useDataFetching<T>(
  fetchFunction: () => Promise<T>,
  options: UseDataFetchingOptions<T> = {}
): UseDataFetchingReturn<T> {
  const {
    initialData = null,
    immediate = true,
    retryCount = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    dependencies = []
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
    retryCountRef.current = 0;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [initialData]);

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const result = await fetchFunction();
      
      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      setData(result);
      retryCountRef.current = 0;
      onSuccess?.(result);
    } catch (err) {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      onError?.(error);

      // Retry logic
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchData();
        }, retryDelay * retryCountRef.current);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, retryCount, retryDelay, onSuccess, onError]);

  const refetch = useCallback(async (): Promise<void> => {
    retryCountRef.current = 0;
    await fetchData();
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    setData,
    reset
  };
}

// Specialized hooks for common use cases
export function useApiData<T>(
  apiCall: () => Promise<T>,
  options: Omit<UseDataFetchingOptions<T>, 'fetchFunction'> = {}
): UseDataFetchingReturn<T> {
  return useDataFetching(apiCall, options);
}

export function useLocalStorageData<T>(
  key: string,
  defaultValue: T,
  options: Omit<UseDataFetchingOptions<T>, 'fetchFunction' | 'initialData'> = {}
): UseDataFetchingReturn<T> {
  const fetchFromStorage = useCallback(async (): Promise<T> => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
      return defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }, [key, defaultValue]);

  const { setData, ...rest } = useDataFetching(fetchFromStorage, {
    initialData: defaultValue,
    ...options
  });

  const setDataWithStorage = useCallback((newData: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(newData));
      setData(newData);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, setData]);

  return {
    ...rest,
    setData: setDataWithStorage
  };
} 