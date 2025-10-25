import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface ChartTabProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: { id: string; label: string }[];
}

const ChartTab: React.FC<ChartTabProps> = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-3 py-2 font-medium w-full rounded-md text-sm hover:text-gray-900 dark:hover:text-white ${
            activeTab === tab.id
              ? 'shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

interface SalesChartProps {
  title?: string;
  showDateFilter?: boolean;
}

const SalesChart: React.FC<SalesChartProps> = ({ 
  title = "Sales Analytics", 
  showDateFilter = true 
}) => {
  const [activeTab, setActiveTab] = useState('monthly');

  // Sample data - in real app, this would be fetched from API
  const getSalesData = () => {
    switch (activeTab) {
      case 'monthly':
        return [44000, 55000, 57000, 56000, 61000, 58000, 63000, 60000, 66000, 62000, 68000, 65000];
      case 'quarterly':
        return [156000, 175000, 189000, 195000];
      case 'yearly':
        return [720000, 850000, 960000, 1100000, 1250000];
      default:
        return [44000, 55000, 57000, 56000, 61000, 58000, 63000, 60000, 66000, 62000, 68000, 65000];
    }
  };

  const getCategories = () => {
    switch (activeTab) {
      case 'monthly':
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      case 'quarterly':
        return ["Q1", "Q2", "Q3", "Q4"];
      case 'yearly':
        return ["2020", "2021", "2022", "2023", "2024"];
      default:
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    }
  };

  const series = [
    {
      name: 'Sales',
      data: getSalesData(),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      fontFamily: 'Outfit, sans-serif',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: ['#465fff'],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'straight',
      width: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        type: 'vertical',
        colorStops: [
          {
            offset: 0,
            color: '#465fff',
            opacity: 0.4,
          },
          {
            offset: 100,
            color: '#465fff',
            opacity: 0.1,
          },
        ],
      },
    },
    grid: {
      show: true,
      borderColor: '#f1f5f9',
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    xaxis: {
      categories: getCategories(),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: '12px',
          colors: '#64748b',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          colors: '#64748b',
        },
        formatter: (value) => {
          return value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`;
        },
      },
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => `$${value.toLocaleString()}`,
      },
    },
    legend: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300,
          },
        },
      },
    ],
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {showDateFilter && (
            <ChartTab
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabs={[
                { id: 'monthly', label: 'Monthly' },
                { id: 'quarterly', label: 'Quarterly' },
                { id: 'yearly', label: 'Yearly' },
              ]}
            />
          )}
        </div>
      </div>
      <div className="p-6">
        <div className="min-w-[650px] overflow-x-auto">
          <Chart
            options={options}
            series={series}
            type="area"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default SalesChart;