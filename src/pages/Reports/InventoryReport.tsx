import React from 'react';
import ReportCard from './ReportCard';
import InventoryChart from './InventoryChart';
import { BoxIcon, BoxIconLine, AlertIcon, CheckCircleIcon } from '../../icons';

export const InventoryReport: React.FC = () => {
  // Sample inventory data - in real app, this would be fetched from API
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

  const lowStockItems = [
    { name: 'Wireless Bluetooth Headphones', stock: 5, minStock: 20, category: 'Electronics' },
    { name: 'Smartphone Case Premium', stock: 8, minStock: 25, category: 'Accessories' },
    { name: 'USB-C Charging Cable', stock: 12, minStock: 30, category: 'Cables' },
    { name: 'Laptop Stand Adjustable', stock: 3, minStock: 15, category: 'Accessories' },
    { name: 'Wireless Mouse', stock: 7, minStock: 20, category: 'Electronics' },
  ];

  const outOfStockItems = [
    { name: 'Premium Laptop Bag', lastStock: '2024-01-10', category: 'Bags' },
    { name: 'Bluetooth Speaker', lastStock: '2024-01-12', category: 'Audio' },
    { name: 'Phone Tripod', lastStock: '2024-01-08', category: 'Accessories' },
    { name: 'Webcam HD 1080p', lastStock: '2024-01-05', category: 'Electronics' },
  ];

  const categoryStock = [
    { category: 'Electronics', total: 245, inStock: 220, lowStock: 15, outOfStock: 10 },
    { category: 'Accessories', total: 186, inStock: 170, lowStock: 12, outOfStock: 4 },
    { category: 'Clothing', total: 324, inStock: 310, lowStock: 12, outOfStock: 2 },
    { category: 'Home & Garden', total: 156, inStock: 142, lowStock: 12, outOfStock: 2 },
    { category: 'Sports', total: 89, inStock: 85, lowStock: 3, outOfStock: 1 },
  ];

  const getStockLevelColor = (current: number, min: number) => {
    const percentage = (current / min) * 100;
    if (percentage <= 25) return 'bg-red-500';
    if (percentage <= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

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
      <InventoryChart title="Stock Level Distribution" />

      {/* Additional Reports Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Low Stock Alert
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {item.stock}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Min: {item.minStock}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getStockLevelColor(item.stock, item.minStock)}`}
                      style={{ width: `${Math.max((item.stock / item.minStock) * 100, 5)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Out of Stock Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Out of Stock Items
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {outOfStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                      Out of Stock
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Since {item.lastStock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Stock Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Stock by Category
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Category</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Total</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">In Stock</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Low Stock</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Out of Stock</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Stock Rate</th>
                </tr>
              </thead>
              <tbody>
                {categoryStock.map((category, index) => {
                  const stockRate = ((category.inStock / category.total) * 100).toFixed(1);
                  return (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                        {category.category}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-700 dark:text-gray-300">
                        {category.total}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {category.inStock}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                          {category.lowStock}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          {category.outOfStock}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`font-medium ${
                          parseFloat(stockRate) >= 90 
                            ? 'text-green-600 dark:text-green-400'
                            : parseFloat(stockRate) >= 70
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {stockRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};


export default InventoryReport;