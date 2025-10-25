import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1,
  animated = true
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  const animationClasses = animated ? 'animate-pulse' : '';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  };

  const skeletonClasses = `${baseClasses} ${animationClasses} ${variantClasses[variant]} ${className}`;

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${skeletonClasses} h-4`}
            style={{
              width: index === lines - 1 ? '60%' : width || '100%'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={skeletonClasses}
      style={{
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100px')
      }}
    />
  );
};

// Specific skeleton components for common use cases
export const SkeletonText: React.FC<Omit<SkeletonProps, 'variant'> & { lines?: number }> = (props) => (
  <Skeleton {...props} variant="text" />
);

export const SkeletonAvatar: React.FC<Omit<SkeletonProps, 'variant' | 'height'> & { size?: number }> = ({ 
  size = 40, 
  ...props 
}) => (
  <Skeleton 
    {...props} 
    variant="circular" 
    width={size} 
    height={size} 
  />
);

export const SkeletonCard: React.FC<Omit<SkeletonProps, 'variant'> & { 
  showAvatar?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
}> = ({ 
  showAvatar = true, 
  showTitle = true, 
  showDescription = true,
  className = '',
  ...props 
}) => (
  <div className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
    <div className="flex items-start space-x-3">
      {showAvatar && <SkeletonAvatar size={48} />}
      <div className="flex-1 space-y-2">
        {showTitle && <SkeletonText width="60%" />}
        {showDescription && <SkeletonText lines={2} />}
      </div>
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ 
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => (
  <div className={`space-y-3 ${className}`}>
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, index) => (
        <SkeletonText key={index} width="25%" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <SkeletonText key={colIndex} width="25%" />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton; 