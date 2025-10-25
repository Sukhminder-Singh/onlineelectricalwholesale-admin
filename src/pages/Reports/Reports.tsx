import React, { useState } from 'react';
import PageBreadCrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { DollarLineIcon, GroupIcon, BoxIconLine, TaskIcon, ArrowUpIcon, ArrowDownIcon, BoxIcon, AlertIcon, CheckCircleIcon } from '../../icons';

type ReportTab = 'sales' | 'inventory';

// Report Card Component
interface ReportCardProps {
  title: string;
  value: string | number;
  percentage?: number;
  isPositive?: boolean;
  icon: React.ReactNode;
  subtitle?: string;
}

const ReportCard: React.FC<ReportCardProps> = ({
  title,
  value,
  percentage,
  isPositive = true,
  icon,
  subtitle,
}) => {
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
          <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mb-2">
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

// Sales Report Component
const SalesReport: React.FC = () => {
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

  const salesChartOptions: ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ['#3b82f6'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        type: 'vertical',
        colorStops: [
          { offset: 0, color: '#3b82f6', opacity: 0.4 },
          { offset: 100, color: '#3b82f6', opacity: 0.1 },
        ],
      },
    },
    grid: {
      show: true,
      borderColor: '#f1f5f9',
      strokeDashArray: 5,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: '12px', colors: '#64748b' } },
    },
    yaxis: {
      labels: {
        style: { fontSize: '12px', colors: '#64748b' },
        formatter: (value) => value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`,
      },
    },
    tooltip: {
      theme: 'light',
      y: { formatter: (value) => `$${value.toLocaleString()}` },
    },
    legend: { show: false },
  };

  const salesChartSeries = [{
    name: 'Sales',
    data: [44000, 55000, 57000, 56000, 61000, 58000, 63000, 60000, 66000, 62000, 68000, 65000],
  }];

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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sales Overview
          </h3>
        </div>
        <div className="p-6">
          <Chart
            options={salesChartOptions}
            series={salesChartSeries}
            type="area"
            height={350}
          />
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Sales
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">John Doe</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">#12345</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">$156.50</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Completed</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Jan 15, 2024</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Jane Smith</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">#12344</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">$89.25</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Pending</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Jan 15, 2024</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Inventory Report Component
const InventoryReport: React.FC = () => {
  const inventoryMetrics = [
    {
      title: 'Total Products',
      value: '930',
      percentage: 5.2,
      isPositive: true,
      icon: <BoxIcon className="w-6 h-6" />,
      subtitle: 'In catalog',
    },
    {
      title: 'Low Stock Items',
      value: '45',
      percentage: 12.5,
      isPositive: false,
      icon: <AlertIcon className="w-6 h-6" />,
      subtitle: 'Need restock',
    },
    {
      title: 'Out of Stock',
      value: '12',
      percentage: 8.3,
      isPositive: false,
      icon: <BoxIconLine className="w-6 h-6" />,
      subtitle: 'Critical items',
    },
    {
      title: 'Well Stocked',
      value: '850',
      percentage: 15.7,
      isPositive: true,
      icon: <CheckCircleIcon className="w-6 h-6" />,
      subtitle: 'Healthy stock',
    },
  ];

  const inventoryChartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 350,
      fontFamily: 'Inter, sans-serif',
    },
    colors: ['#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'],
    labels: ['In Stock', 'Low Stock', 'Out of Stock', 'Overstocked'],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: { fontSize: '12px', fontWeight: '600', colors: ['#ffffff'] },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { show: true, fontSize: '16px', fontWeight: '600', color: '#374151' },
            value: { show: true, fontSize: '24px', fontWeight: '700', color: '#111827' },
            total: {
              show: true,
              label: 'Total Items',
              fontSize: '14px',
              fontWeight: '600',
              color: '#6b7280',
              formatter: () => '930',
            },
          },
        },
      },
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px',
      fontWeight: '500',
    },
  };

  const inventoryChartSeries = [850, 45, 12, 23];

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {inventoryMetrics.map((metric, index) => (
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

      {/* Inventory Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Stock Level Distribution
          </h3>
        </div>
        <div className="p-6">
          <div className="max-w-md mx-auto">
            <Chart
              options={inventoryChartOptions}
              series={inventoryChartSeries}
              type="donut"
              height={350}
            />
          </div>
        </div>
      </div>

      {/* Low Stock Alert Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Low Stock Alert
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Min Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Wireless Bluetooth Headphones</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Electronics</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600 dark:text-red-400">5</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">20</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Critical</span></td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Smartphone Case Premium</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Accessories</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-yellow-600 dark:text-yellow-400">8</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">25</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Low</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('sales');

  const tabs = [
    { id: 'sales' as ReportTab, label: 'Sales Reports', count: null },
    { id: 'inventory' as ReportTab, label: 'Inventory Reports', count: null },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sales':
        return <SalesReport />;
      case 'inventory':
        return <InventoryReport />;
      default:
        return <SalesReport />;
    }
  };

  return (
    <>
      <PageMeta title="Reports - Admin Dashboard" description="View comprehensive sales and inventory reports with detailed analytics and metrics" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reports
            </h1>
            <PageBreadCrumb pageTitle="Reports" />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                  transition-colors duration-200
                `}
              >
                {tab.label}
                {tab.count && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {renderTabContent()}
        </div>
      </div>
    </>
  );
};

export default Reports;