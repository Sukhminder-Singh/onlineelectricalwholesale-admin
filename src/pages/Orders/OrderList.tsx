import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { EyeIcon, EditIcon, MoreDotIcon, PaperPlaneIcon } from "../../icons";
import { Search, ArrowUpDown, Download, Filter, X, Calendar, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import EditOrderModal from "../../components/orders/EditOrderModal";
import SendUpdateModal from "../../components/orders/SendUpdateModal";
import { useModal } from "../../hooks/useModal";
import { useOrder } from "../../context/OrderContext";
import { showSuccessToast, showErrorToast } from "../../components/ui/toast";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";

const OrderList = () => {
  try {
    return <OrderListContent />;
  } catch (error) {
    console.error('Error in OrderList component:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Component Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            An error occurred in the OrderList component. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

const OrderListContent = () => {
  const navigate = useNavigate();
  const { isLoading: authLoading } = useAuth();
  
  // Always call hooks first, before any conditional returns
  let orderContext;
  try {
    orderContext = useOrder();
  } catch (error) {
    console.error('Error accessing OrderContext:', error);
    orderContext = null;
  }

  // State hooks - must be called in same order every time
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Modal states
  const editModal = useModal();
  const sendUpdateModal = useModal();

  // Now handle error states after all hooks are called
  if (!orderContext) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error Loading Orders
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            There was an error loading the order data. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Safely destructure context with fallbacks
  const {
    filteredOrders = [],
    searchTerm = '',
    setSearchTerm = () => {},
    statusFilter = 'all',
    setStatusFilter = () => {},
    paymentStatusFilter = 'all',
    setPaymentStatusFilter = () => {},
    dateRange = { start: '', end: '' },
    setDateRange = () => {},
    amountRange = { min: '', max: '' },
    setAmountRange = () => {},
    isLoading = false,
    updateOrder = async () => ({} as any),
    deleteOrder = async () => {},
    getTotalOrders = () => 0,
    getTotalRevenue = () => 0,
    getTotalSubtotal = () => 0,
    getOrdersByStatus = () => 0,
    getOrdersByPaymentStatus = () => 0,
    sortBy = 'orderDate',
    setSortBy = () => {},
    sortOrder = 'desc',
    setSortOrder = () => {},
    isAuthenticated = () => false,
  } = orderContext || {};

  // All useEffect hooks must be called before any conditional returns
  useEffect(() => {
    try {
      if (Array.isArray(filteredOrders)) {
        const hasFallbackOrders = filteredOrders.some(order => order && order.id && order.id.startsWith('fallback-'));
        setIsFallbackMode(hasFallbackOrders);
      }
    } catch (error) {
      console.error('Error in useEffect for fallback mode detection:', error);
      setIsFallbackMode(false);
    }
  }, [filteredOrders]);


  // Orders are automatically loaded by OrderContext on mount

  // Show loading state while auth or data is being fetched
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {authLoading ? 'Authenticating...' : 'Loading orders...'}
          </p>
        </div>
      </div>
    );
  }



  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "success";
      case "Processing":
        return "info";
      case "Shipped":
        return "primary";
      case "Pending":
        return "warning";
      case "Cancelled":
        return "error";
      case "Returned":
        return "info";
      default:
        return "light";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "success";
      case "Pending":
        return "warning";
      case "Failed":
        return "error";
      case "Refunded":
      case "Partially Refunded":
        return "info";
      default:
        return "light";
    }
  };

  const formatCurrency = (amount: number) => {
    // Handle NaN, null, undefined, or invalid numbers
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '$0.00';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Filter management functions
  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentStatusFilter('all');
    setDateRange({ start: '', end: '' });
    setAmountRange({ min: '', max: '' });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter !== 'all') count++;
    if (paymentStatusFilter !== 'all') count++;
    if (dateRange.start || dateRange.end) count++;
    if (amountRange.min || amountRange.max) count++;
    return count;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Modal handlers
  const handleEditOrder = (order: any) => {
    setSelectedOrder(order);
    editModal.openModal();
  };

  const handleSendUpdate = (order: any) => {
    setSelectedOrder(order);
    sendUpdateModal.openModal();
  };

  const handleSaveOrder = async (updatedData: any) => {
    if (!selectedOrder) return;
    
    try {
      await updateOrder(selectedOrder.id, updatedData);
      showSuccessToast(
        'Order Updated',
        `Order ${selectedOrder.orderNumber} has been updated successfully.`
      );
      editModal.closeModal();
    } catch (error) {
      showErrorToast('Error', 'Failed to update order. Please try again.');
    }
  };

  const handleSendNotification = async (notificationData: any) => {
    if (!selectedOrder) return;
    
    try {
      // Here you would typically call an API to send the notification
      
      showSuccessToast(
        'Notification Sent',
        `Update notification sent to ${selectedOrder.customer.firstName} ${selectedOrder.customer.lastName} via ${notificationData.method}.`
      );
      
      sendUpdateModal.closeModal();
    } catch (error) {
      showErrorToast('Error', 'Failed to send notification. Please try again.');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(orderId);
        showSuccessToast('Order Deleted', 'Order has been deleted successfully.');
      } catch (error) {
        showErrorToast('Error', 'Failed to delete order. Please try again.');
      }
    }
  };

  const handleExport = () => {
    // Implement export functionality
    showSuccessToast('Export Started', 'Order data export has been initiated.');
  };

  const sortOptions = [
    { value: 'orderDate', label: 'Order Date' },
    { value: 'orderNumber', label: 'Order Number' },
    { value: 'customerName', label: 'Customer Name' },
    { value: 'total', label: 'Total Amount' },
    { value: 'status', label: 'Status' },
    { value: 'paymentStatus', label: 'Payment Status' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Returned', label: 'Returned' },
  ];

  const paymentStatusOptions = [
    { value: 'all', label: 'All Payment Statuses' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Refunded', label: 'Refunded' },
    { value: 'Partially Refunded', label: 'Partially Refunded' },
  ];

  return (
    <>
      <PageMeta
        title="Order Management | TailAdmin"
        description="Manage and track all customer orders"
      />
      <PageBreadcrumb pageTitle="Order Management" />
      
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Orders
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage and track all customer orders
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
            
            {/* Modern Search and Filter Section */}
            <div className="space-y-4">
              {/* Main Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search orders by number, customer, email, status, or amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-brand-500 dark:focus:border-brand-500 text-sm bg-gray-50 dark:bg-gray-800 transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Quick Filters */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Filters:</span>
                  
                  {/* Status Filter */}
                  <div className="relative">
                    <Select
                      value={statusFilter}
                      onChange={(value) => setStatusFilter(value as any)}
                      options={statusOptions}
                      placeholder="Status"
                    />
                  </div>

                  {/* Payment Status Filter */}
                  <div className="relative">
                    <Select
                      value={paymentStatusFilter}
                      onChange={(value) => setPaymentStatusFilter(value as any)}
                      options={paymentStatusOptions}
                      placeholder="Payment"
                    />
                  </div>
                </div>

                {/* Advanced Filters Toggle */}
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    showAdvancedFilters 
                      ? 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/20 dark:border-brand-800 dark:text-brand-400' 
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">Advanced</span>
                  {getActiveFiltersCount() > 0 && (
                    <span className="bg-brand-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                  {showAdvancedFilters ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {/* Clear All Filters */}
                {getActiveFiltersCount() > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Clear all
                  </button>
                )}
              </div>

              {/* Advanced Filters Panel */}
              {showAdvancedFilters && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Date Range Filter */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Calendar className="h-4 w-4" />
                        Date Range
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                          placeholder="Start date"
                        />
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                          placeholder="End date"
                        />
                      </div>
                    </div>

                    {/* Amount Range Filter */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <DollarSign className="h-4 w-4" />
                        Amount Range
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={amountRange.min}
                          onChange={(e) => setAmountRange({ ...amountRange, min: e.target.value })}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                          placeholder="Min amount"
                        />
                        <input
                          type="number"
                          value={amountRange.max}
                          onChange={(e) => setAmountRange({ ...amountRange, max: e.target.value })}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                          placeholder="Max amount"
                        />
                      </div>
                    </div>

                    {/* Sort Controls */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <ArrowUpDown className="h-4 w-4" />
                        Sort Order
                      </label>
                      <div className="flex gap-2">
                        <Select
                          value={sortBy}
                          onChange={(value) => setSortBy(value)}
                          options={sortOptions}
                          placeholder="Sort by"
                        />
                        <button
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                          className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                          title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                        >
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Filter Chips */}
              {getActiveFiltersCount() > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 text-brand-800 text-sm rounded-full dark:bg-brand-900/30 dark:text-brand-400">
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-1 hover:text-brand-600 dark:hover:text-brand-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                      Status: {statusFilter}
                      <button
                        onClick={() => setStatusFilter('all')}
                        className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {paymentStatusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full dark:bg-green-900/30 dark:text-green-400">
                      Payment: {paymentStatusFilter}
                      <button
                        onClick={() => setPaymentStatusFilter('all')}
                        className="ml-1 hover:text-green-600 dark:hover:text-green-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {(dateRange.start || dateRange.end) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full dark:bg-purple-900/30 dark:text-purple-400">
                      Date: {dateRange.start || '...'} to {dateRange.end || '...'}
                      <button
                        onClick={() => setDateRange({ start: '', end: '' })}
                        className="ml-1 hover:text-purple-600 dark:hover:text-purple-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {(amountRange.min || amountRange.max) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full dark:bg-orange-900/30 dark:text-orange-400">
                      Amount: ${amountRange.min || '0'} - ${amountRange.max || '∞'}
                      <button
                        onClick={() => setAmountRange({ min: '', max: '' })}
                        className="ml-1 hover:text-orange-600 dark:hover:text-orange-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Authentication Status */}
        {!isAuthenticated() && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Authentication Required
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>
                    You need to be logged in to access the orders API. 
                    Please log in to view real order data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fallback Mode Warning */}
        {isFallbackMode && isAuthenticated() && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Demo Mode
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    Orders API is not available. You're viewing sample data. 
                    Changes will be saved locally only. To connect to the real API, 
                    please ensure the backend server is running with the orders endpoint.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getTotalOrders()}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Filter className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Subtotal</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(getTotalSubtotal())}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Filter className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(getTotalRevenue())}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getOrdersByStatus('Pending')}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Filter className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Paid Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getOrdersByPaymentStatus('Paid')}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {searchTerm ? `Search Results (${filteredOrders.length})` : `Order List (${filteredOrders.length})`}
              </h2>
              <div className="flex items-center gap-3">
                {isLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500"></div>
                    Loading...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-b bg-gray-50 dark:bg-gray-800/50">
                <TableRow>
                  <TableCell
                    isHeader
                    className="py-4 px-6 font-semibold text-gray-700 text-left text-sm dark:text-gray-300"
                  >
                    Order Details
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-4 px-6 font-semibold text-gray-700 text-left text-sm dark:text-gray-300"
                  >
                    Customer
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-4 px-6 font-semibold text-gray-700 text-left text-sm dark:text-gray-300"
                  >
                    Items
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-4 px-6 font-semibold text-gray-700 text-left text-sm dark:text-gray-300"
                  >
                    Subtotal
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-4 px-6 font-semibold text-gray-700 text-left text-sm dark:text-gray-300"
                  >
                    Total
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-4 px-6 font-semibold text-gray-700 text-left text-sm dark:text-gray-300"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-4 px-6 font-semibold text-gray-700 text-left text-sm dark:text-gray-300"
                  >
                    Payment
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-4 px-6 font-semibold text-gray-700 text-left text-sm dark:text-gray-300"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        {searchTerm ? (
                          <div>
                            <p className="text-lg font-medium mb-2">No orders found</p>
                            <p className="text-sm">No orders match your search criteria "<span className="font-medium">{searchTerm}</span>"</p>
                            <button
                              onClick={() => setSearchTerm("")}
                              className="mt-3 text-brand-500 hover:text-brand-600 text-sm font-medium"
                            >
                              Clear search
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-lg font-medium mb-2">No orders found</p>
                            <p className="text-sm">There are no orders with the current filter settings.</p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  Array.isArray(filteredOrders) ? filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      {/* Order Details */}
                      <TableCell className="py-4 px-6">
                        <div className="space-y-1">
                          <button
                            onClick={() => navigate(`/order/details/${order.id}`)}
                            className="font-semibold text-gray-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400 transition-colors cursor-pointer"
                          >
                            {order.orderNumber}
                          </button>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(order.orderDate)}
                          </p>
                        </div>
                      </TableCell>

                      {/* Customer */}
                      <TableCell className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {order.customer?.firstName || ''} {order.customer?.lastName || ''}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {order.customer?.email || ''}
                          </p>
                        </div>
                      </TableCell>

                      {/* Items */}
                      <TableCell className="py-4 px-6">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </span>
                      </TableCell>

                      {/* Subtotal */}
                      <TableCell className="py-4 px-6">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(order.subtotal || 0)}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <div>Tax: {formatCurrency(order.tax || 0)}</div>
                          <div>Shipping: {order.shipping === 0 ? 'Free' : formatCurrency(order.shipping || 0)}</div>
                          {order.discount && order.discount > 0 && (
                            <div className="text-red-500">Discount: -{formatCurrency(order.discount)}</div>
                          )}
                        </div>
                      </TableCell>

                      {/* Total */}
                      <TableCell className="py-4 px-6">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(order.total || 0)}
                        </p>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-4 px-6">
                        <Badge
                          size="sm"
                          color={getStatusColor(order.status || 'Pending')}
                        >
                          {order.status || 'Pending'}
                        </Badge>
                      </TableCell>

                      {/* Payment Status */}
                      <TableCell className="py-4 px-6">
                        <Badge
                          size="sm"
                          color={getPaymentStatusColor(order.paymentStatus || 'Pending')}
                          variant="light"
                        >
                          {order.paymentStatus || 'Pending'}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => navigate(`/order/details/${order.id}`)}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title="View Order Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditOrder(order)}
                            className="p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edit Order"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleSendUpdate(order)}
                            className="p-2 text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Send Update"
                          >
                            <PaperPlaneIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Order"
                          >
                            <MoreDotIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 px-6 text-center text-gray-500 dark:text-gray-400">
                        Error loading orders data
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Modals */}
        {selectedOrder && (
          <>
            <EditOrderModal
              order={selectedOrder}
              isOpen={editModal.isOpen}
              onClose={editModal.closeModal}
              onSave={handleSaveOrder}
              onSendUpdate={() => {
                editModal.closeModal();
                sendUpdateModal.openModal();
              }}
            />
            
            <SendUpdateModal
              order={selectedOrder}
              isOpen={sendUpdateModal.isOpen}
              onClose={sendUpdateModal.closeModal}
              onSend={handleSendNotification}
            />
          </>
        )}
      </div>
    </>
  );
};

export default OrderList;