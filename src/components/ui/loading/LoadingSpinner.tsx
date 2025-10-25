import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
  text?: string;
  showText?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className = '',
  text = 'Loading...',
  showText = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const variantClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <div
          className={`${sizeClasses[size]} ${variantClasses[variant]} animate-spin rounded-full border-2 border-gray-300 border-t-current`}
        />
        {showText && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner; 