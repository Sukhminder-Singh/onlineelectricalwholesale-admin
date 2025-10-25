import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface InventoryChartProps {
  title?: string;
}

const InventoryChart: React.FC<InventoryChartProps> = ({ 
  title = "Inventory Overview" 
}) => {
  // Sample inventory data
  const inventoryData = {
    inStock: 850,
    lowStock: 45,
    outOfStock: 12,
    overstocked: 23,
  };

  const total = Object.values(inventoryData).reduce((sum, value) => sum + value, 0);

  const series = Object.values(inventoryData);

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      height: 350,
      fontFamily: 'Outfit, sans-serif',
    },
    colors: ['#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'],
    labels: ['In Stock', 'Low Stock', 'Out of Stock', 'Overstocked'],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        return `${val.toFixed(1)}%`;
      },
      style: {
        fontSize: '12px',
        fontWeight: '600',
        colors: ['#ffffff'],
      },
      dropShadow: {
        enabled: false,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              offsetY: 10,
              formatter: (val: string) => {
                return val;
              },
            },
            total: {
              show: true,
              label: 'Total Items',
              fontSize: '14px',
              fontWeight: '600',
              color: '#6b7280',
              formatter: () => {
                return total.toString();
              },
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
      markers: {
        size: 3,
      },
      itemMargin: {
        horizontal: 15,
        vertical: 5,
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => {
          const percentage = ((value / total) * 100).toFixed(1);
          return `${value} items (${percentage}%)`;
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  const stockStats = [
    { 
      label: 'In Stock', 
      value: inventoryData.inStock, 
      color: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400' 
    },
    { 
      label: 'Low Stock', 
      value: inventoryData.lowStock, 
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600 dark:text-yellow-400' 
    },
    { 
      label: 'Out of Stock', 
      value: inventoryData.outOfStock, 
      color: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400' 
    },
    { 
      label: 'Overstocked', 
      value: inventoryData.overstocked, 
      color: 'bg-purple-500',
      textColor: 'text-purple-600 dark:text-purple-400' 
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Chart */}
          <div className="flex justify-center">
            <Chart
              options={options}
              series={series}
              type="donut"
              height={350}
            />
          </div>
          
          {/* Stats */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Stock Status Breakdown
            </h4>
            {stockStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stat.label}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${stat.textColor}`}>
                    {stat.value}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {((stat.value / total) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryChart;