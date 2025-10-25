import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '../../icons';

interface ReportCardProps {
  title: string;
  value: string | number;
  percentage?: number;
  isPositive?: boolean;
  icon: React.ReactNode;
  subtitle?: string;
  loading?: boolean;
}

const ReportCard: React.FC<ReportCardProps> = ({
  title,
  value,
  percentage,
  isPositive = true,
  icon,
  subtitle,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
              {subtitle && <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>}
            </div>
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <div className="p-3 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 mb-2">
            {icon}
          </div>
          {percentage !== undefined && (
            <div className="flex items-center">
              <div
                className={`flex items-center text-xs font-medium ${
                  isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isPositive ? (
                  <ArrowUpIcon className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownIcon className="w-3 h-3 mr-1" />
                )}
                {Math.abs(percentage)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportCard;