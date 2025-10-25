import React from 'react';
import { useLoading } from '../../../context/LoadingContext';
import LoadingSpinner from './LoadingSpinner';

interface GlobalLoadingIndicatorProps {
  className?: string;
  showProgress?: boolean;
  position?: 'top' | 'bottom' | 'center';
}

const GlobalLoadingIndicator: React.FC<GlobalLoadingIndicatorProps> = ({
  className = '',
  showProgress = true,
  position = 'top'
}) => {
  const { globalLoading, loadingCount } = useLoading();

  if (!globalLoading.isLoading && loadingCount === 0) {
    return null;
  }

  const positionClasses = {
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0',
    center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  };

  const containerClasses = {
    top: 'h-1',
    bottom: 'h-1',
    center: 'min-h-20'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-[9999] ${className}`}>
      {position === 'center' ? (
        // Center overlay
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col items-center space-y-3">
            <LoadingSpinner 
              size="lg" 
              variant={globalLoading.variant} 
              text={globalLoading.message || `Loading... (${loadingCount} operations)`}
              showText={true}
            />
            {showProgress && globalLoading.progress !== undefined && globalLoading.progress > 0 && (
              <div className="w-full max-w-xs">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${globalLoading.progress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
                  {Math.round(globalLoading.progress)}%
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Top/Bottom progress bar
        <div className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${containerClasses[position]}`}>
          <div className="relative h-full">
            <div className="absolute inset-0 bg-blue-600 animate-pulse" />
            {showProgress && globalLoading.progress !== undefined && globalLoading.progress > 0 && (
              <div 
                className="absolute inset-0 bg-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${globalLoading.progress}%` }}
              />
            )}
            {globalLoading.message && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-white font-medium px-2">
                  {globalLoading.message}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalLoadingIndicator; 