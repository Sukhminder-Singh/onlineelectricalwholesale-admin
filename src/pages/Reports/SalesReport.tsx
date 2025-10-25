import React from 'react';
import ReportCard from './ReportCard';
import SalesChart from './SalesChart';
import { DollarLineIcon, GroupIcon, BoxIconLine, TaskIcon } from '../../icons';

export const SalesReport: React.FC = () => {
  // Sample sales data - in real app, this would be fetched from API
  const salesMetrics = [
    {
      title: 'Total Revenue',
      value: '$124,350',
      percentage: 12.5,
      isPositive: true,
      icon: <DollarLineIcon className="w-6 h-6" />,
      subtitle: 'This month',
    },
    {
      title: 'Total Orders',
      value: '1,845',
      percentage: 8.2,
      isPositive: true,
      icon: <TaskIcon className="w-6 h-6" />,
      subtitle: 'This month',
    },
    {
      title: 'New Customers',
      value: '246',
      percentage: 15.3,
      isPositive: true,
      icon: <GroupIcon className="w-6 h-6" />,
      subtitle: 'This month',
    },
    {
      title: 'Avg Order Value',
      value: '$67.42',
      percentage: 3.1,
      isPositive: false,
      icon: <BoxIconLine className="w-6 h-6" />,
      subtitle: 'This month',
    },
  ];

  const topProducts = [
    { name: 'Wireless Bluetooth Headphones', sales: 156, revenue: '$12,480' },
    { name: 'Smartphone Case Premium', sales: 134, revenue: '$8,040' },
    { name: 'USB-C Charging Cable', sales: 98, revenue: '$2,940' },
    { name: 'Laptop Stand Adjustable', sales: 87, revenue: '$6,525' },
    { name: 'Wireless Mouse', sales: 76, revenue: '$3,800' },
  ];

  const recentSales = [
    { id: '#12345', customer: 'John Doe', amount: '$156.50', date: '2024-01-15', status: 'Completed' },
    { id: '#12344', customer: 'Jane Smith', amount: '$89.25', date: '2024-01-15', status: 'Pending' },
    { id: '#12343', customer: 'Mike Johnson', amount: '$234.75', date: '2024-01-14', status: 'Completed' },
    { id: '#12342', customer: 'Sarah Wilson', amount: '$67.80', date: '2024-01-14', status: 'Completed' },
    { id: '#12341', customer: 'Tom Brown', amount: '$198.40', date: '2024-01-13', status: 'Refunded' },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'refunded':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {salesMetrics.map((metric, index) => (
          <ReportCard
            key={index}
            title={metric.title}
            value={metric.value}
            percentage={metric.percentage}
            isPositive={metric.isPositive}
            icon={metric.icon}
            subtitle={metric.subtitle}
          />
        ))}
      </div>

      {/* Sales Chart */}
      <SalesChart title="Sales Overview" />

      {/* Additional Reports Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Selling Products
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/20 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {product.sales} sales
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {product.revenue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Sales
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentSales.map((sale, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {sale.customer}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Order {sale.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {sale.amount}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {sale.date}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                        {sale.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;