import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  backdrop?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = 'Loading...',
  variant = 'primary',
  backdrop = true,
  className = '',
  children
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className={`absolute inset-0 flex items-center justify-center ${
        backdrop ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm' : ''
      } z-50`}>
        <div className="flex flex-col items-center space-y-3 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <LoadingSpinner 
            size="lg" 
            variant={variant} 
            text={text}
            showText={true}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay; 