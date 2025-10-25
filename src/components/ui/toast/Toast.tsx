import React, { useEffect, useState } from 'react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show toast with animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-hide toast
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for exit animation
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [id, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'border-success-500 bg-success-50 dark:border-success-500/30 dark:bg-success-500/15',
          icon: 'text-success-500',
          iconBg: 'bg-success-100 dark:bg-success-500/20'
        };
      case 'error':
        return {
          container: 'border-error-500 bg-error-50 dark:border-error-500/30 dark:bg-error-500/15',
          icon: 'text-error-500',
          iconBg: 'bg-error-100 dark:bg-error-500/20'
        };
      case 'warning':
        return {
          container: 'border-warning-500 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/15',
          icon: 'text-warning-500',
          iconBg: 'bg-warning-100 dark:bg-warning-500/20'
        };
      case 'info':
        return {
          container: 'border-blue-light-500 bg-blue-light-50 dark:border-blue-light-500/30 dark:bg-blue-light-500/15',
          icon: 'text-blue-light-500',
          iconBg: 'bg-blue-light-100 dark:bg-blue-light-500/20'
        };
      default:
        return {
          container: 'border-gray-500 bg-gray-50 dark:border-gray-500/30 dark:bg-gray-500/15',
          icon: 'text-gray-500',
          iconBg: 'bg-gray-100 dark:bg-gray-500/20'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`rounded-lg border p-4 shadow-lg ${styles.container}`}>
        <div className="flex items-start gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${styles.iconBg}`}>
            <div className={styles.icon}>
              {getIcon()}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              {title}
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {message}
            </p>
          </div>
          
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(id), 300);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast; 