import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Badge from "../../components/ui/badge/Badge";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { ChevronLeftIcon, EditIcon, PaperPlaneIcon, TrashBinIcon } from "../../icons";
import EditOrderModal from "../../components/orders/EditOrderModal";
import SendUpdateModal from "../../components/orders/SendUpdateModal";
import { useModal } from "../../hooks/useModal";
import { useOrder } from "../../context/OrderContext";
import { showSuccessToast, showErrorToast } from "../../components/ui/toast";
import Button from "../../components/ui/button/Button";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrderById, updateOrder, deleteOrder, isLoading } = useOrder();
  const [order, setOrder] = useState<any>(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  
  // Modal states
  const editModal = useModal();
  const sendUpdateModal = useModal();

  // Load order data
  useEffect(() => {
    if (id) {
      const orderData = getOrderById(id);
      if (orderData) {
        setOrder(orderData);
        setIsFallbackMode(orderData.id.startsWith('fallback-'));
      } else {
        showErrorToast('Error', 'Order not found');
        navigate('/order/list');
      }
    } else {
      navigate('/order/list', { replace: true });
    }
  }, [id, getOrderById, navigate]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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

  // Modal handlers
  const handleEditOrder = () => {
    editModal.openModal();
  };

  const handleSendUpdate = () => {
    sendUpdateModal.openModal();
  };

  const handleSaveOrder = async (updatedData: any) => {
    if (!order) return;
    
    try {
      const updatedOrder = await updateOrder(order.id, updatedData);
      setOrder(updatedOrder);
      showSuccessToast(
        'Order Updated',
        `Order ${order.orderNumber} has been updated successfully.`
      );
      editModal.closeModal();
    } catch (error) {
      showErrorToast('Error', 'Failed to update order. Please try again.');
    }
  };

  const handleSendNotification = async (notificationData: any) => {
    if (!order) return;
    
    try {
      // Here you would typically call an API to send the notification
      
      showSuccessToast(
        'Notification Sent',
        `Update notification sent to ${order.customer.firstName} ${order.customer.lastName} via ${notificationData.method}.`
      );
      
      sendUpdateModal.closeModal();
    } catch (error) {
      showErrorToast('Error', 'Failed to send notification. Please try again.');
    }
  };

  const handleDeleteOrder = async () => {
    if (!order) return;
    
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await deleteOrder(order.id);
        showSuccessToast('Order Deleted', 'Order has been deleted successfully.');
        navigate('/order/list');
      } catch (error) {
        showErrorToast('Error', 'Failed to delete order. Please try again.');
      }
    }
  };

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Order ${order.orderNumber} | TailAdmin`}
        description="View detailed order information"
      />
      <PageBreadcrumb pageTitle={`Order ${order.orderNumber}`} />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/order/list")}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Order {order.orderNumber}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Placed on {formatDate(order.orderDate)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleEditOrder}
                variant="outline"
                className="flex items-center gap-2"
              >
                <EditIcon className="w-4 h-4" />
                Edit Order
              </Button>
              <Button 
                onClick={handleSendUpdate}
                className="flex items-center gap-2"
              >
                <PaperPlaneIcon className="w-4 h-4" />
                Send Update
              </Button>
              <Button 
                onClick={handleDeleteOrder}
                variant="outline"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
              >
                <TrashBinIcon className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Fallback Mode Warning */}
        {isFallbackMode && (
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
                    This order is from sample data. Changes will be saved locally only. 
                    To connect to the real API, please ensure the backend server is running with the orders endpoint.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        SKU: {item.sku}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(item.totalPrice)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(item.unitPrice)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Customer Information
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  {order.customer.avatar ? (
                    <img
                      src={order.customer.avatar}
                      alt={`${order.customer.firstName} ${order.customer.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg font-medium">
                      {order.customer.firstName.charAt(0)}{order.customer.lastName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {order.customer.firstName} {order.customer.lastName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.customer.email}
                  </p>
                  {order.customer.phone && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {order.customer.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Shipping Address
                </h3>
                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Billing Address
                </h3>
                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                  <p>{order.billingAddress.street}</p>
                  <p>
                    {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}
                  </p>
                  <p>{order.billingAddress.country}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Order Notes
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {order.notes}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <Badge size="sm" color={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 dark:text-gray-400">Payment:</span>
                  <Badge size="sm" color={getPaymentStatusColor(order.paymentStatus)} variant="light">
                    {order.paymentStatus}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    Payment Method: {order.paymentMethod}
                  </p>
                  {order.trackingNumber && (
                    <p className="text-gray-600 dark:text-gray-400">
                      Tracking: {order.trackingNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Order Timeline
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Order Placed
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.orderDate)}
                    </p>
                  </div>
                </div>
                
                {order.shippedDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Order Shipped
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(order.shippedDate)}
                      </p>
                    </div>
                  </div>
                )}
                
                {order.deliveredDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Order Delivered
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(order.deliveredDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Price Breakdown
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(order.tax)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="text-gray-900 dark:text-white">
                    {order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}
                  </span>
                </div>
                {order.discount && order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Discount</span>
                    <span className="text-gray-900 dark:text-white">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                )}
                <hr className="border-gray-200 dark:border-gray-700" />
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <EditOrderModal
          order={order}
          isOpen={editModal.isOpen}
          onClose={editModal.closeModal}
          onSave={handleSaveOrder}
          onSendUpdate={() => {
            editModal.closeModal();
            sendUpdateModal.openModal();
          }}
        />
        
        <SendUpdateModal
          order={order}
          isOpen={sendUpdateModal.isOpen}
          onClose={sendUpdateModal.closeModal}
          onSend={handleSendNotification}
        />
      </div>
    </>
  );
};

export default OrderDetails;