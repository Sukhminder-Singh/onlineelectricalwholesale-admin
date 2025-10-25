import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

interface LoadingContextType {
  globalLoading: LoadingState;
  setGlobalLoading: (loading: LoadingState) => void;
  showLoading: (message?: string, variant?: LoadingState['variant']) => void;
  hideLoading: () => void;
  updateProgress: (progress: number) => void;
  loadingCount: number;
  incrementLoading: () => void;
  decrementLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [globalLoading, setGlobalLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: '',
    progress: 0,
    variant: 'primary'
  });
  
  const [loadingCount, setLoadingCount] = useState(0);

  const setGlobalLoading = useCallback((loading: LoadingState) => {
    setGlobalLoadingState(loading);
  }, []);

  const showLoading = useCallback((message?: string, variant: LoadingState['variant'] = 'primary') => {
    setGlobalLoadingState({
      isLoading: true,
      message: message || 'Loading...',
      progress: 0,
      variant
    });
  }, []);

  const hideLoading = useCallback(() => {
    setGlobalLoadingState({
      isLoading: false,
      message: '',
      progress: 0,
      variant: 'primary'
    });
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setGlobalLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress))
    }));
  }, []);

  const incrementLoading = useCallback(() => {
    setLoadingCount(prev => prev + 1);
  }, []);

  const decrementLoading = useCallback(() => {
    setLoadingCount(prev => Math.max(0, prev - 1));
  }, []);

  const value: LoadingContextType = {
    globalLoading,
    setGlobalLoading,
    showLoading,
    hideLoading,
    updateProgress,
    loadingCount,
    incrementLoading,
    decrementLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Hook for automatic loading state management
export const useAutoLoading = (isLoading: boolean, message?: string) => {
  const { incrementLoading, decrementLoading } = useLoading();

  React.useEffect(() => {
    if (isLoading) {
      incrementLoading();
    } else {
      decrementLoading();
    }
  }, [isLoading, incrementLoading, decrementLoading]);

  React.useEffect(() => {
    return () => {
      if (isLoading) {
        decrementLoading();
      }
    };
  }, [isLoading, decrementLoading]);
}; 