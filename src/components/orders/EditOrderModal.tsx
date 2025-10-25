import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import { useModal } from "../../hooks/useModal";
import Select from "../form/Select";
import InputField from "../form/input/InputField";
import { CheckCircleIcon, InfoIcon, EditIcon } from "../../icons";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paymentStatus: "Paid" | "Pending" | "Failed" | "Refunded";
  orderDate: string;
  trackingNumber?: string;
  notes?: string;
}

interface EditOrderModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedOrder: Partial<Order>) => void;
  onSendUpdate?: () => void;
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onSave,
  onSendUpdate,
}) => {
  const [formData, setFormData] = useState({
    status: order.status,
    paymentStatus: order.paymentStatus,
    trackingNumber: order.trackingNumber || "",
    notes: order.notes || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset form when order changes
  useEffect(() => {
    setFormData({
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber || "",
      notes: order.notes || "",
    });
    setShowSuccess(false);
  }, [order]);

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Processing", label: "Processing" },
    { value: "Shipped", label: "Shipped" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const paymentStatusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Paid", label: "Paid" },
    { value: "Failed", label: "Failed" },
    { value: "Refunded", label: "Refunded" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave(formData);
      setShowSuccess(true);
      
      // Auto-hide success message and close modal
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error saving order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber || "",
      notes: order.notes || "",
    });
  };

  const hasChanges = 
    formData.status !== order.status ||
    formData.paymentStatus !== order.paymentStatus ||
    formData.trackingNumber !== (order.trackingNumber || "") ||
    formData.notes !== (order.notes || "");

  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md mx-auto">
        <div className="p-6 sm:p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100 dark:bg-success-500/20 mb-4">
            <CheckCircleIcon className="h-8 w-8 text-success-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Order Updated Successfully! 🎉
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The order {order.orderNumber} has been updated with the new information.
          </p>
          {onSendUpdate && (
            <button
              onClick={() => {
                setShowSuccess(false);
                onSendUpdate();
              }}
              className="text-brand-500 hover:text-brand-600 text-sm font-medium"
            >
              Send update notification to customer →
            </button>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-4xl mx-auto">
      <div className="p-4 sm:p-6 lg:p-8 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand-100 dark:bg-brand-500/20 rounded-lg">
            <EditIcon className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Order
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {order.orderNumber} • {order.customer.firstName} {order.customer.lastName}
            </p>
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">
              <span className="text-brand-600 dark:text-brand-400 font-medium text-sm">
                {order.customer.firstName?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {order.customer.firstName} {order.customer.lastName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {order.customer.email}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-semibold text-gray-900 dark:text-white">
                ${order.total.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(order.orderDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Status Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order Status
              </label>
              <Select
                options={statusOptions}
                value={formData.status}
                onChange={(value) => handleInputChange("status", value)}
                placeholder="Select status"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Status
              </label>
              <Select
                options={paymentStatusOptions}
                value={formData.paymentStatus}
                onChange={(value) => handleInputChange("paymentStatus", value)}
                placeholder="Select payment status"
              />
            </div>
          </div>

          {/* Tracking Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tracking Number
            </label>
            <InputField
              type="text"
              value={formData.trackingNumber}
              onChange={(e) => handleInputChange("trackingNumber", e.target.value)}
              placeholder="Enter tracking number (optional)"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Internal Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Add any internal notes about this order..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4">
            <div className="flex gap-3">
              <InfoIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-800 dark:text-blue-300 font-medium mb-1">
                  Customer Notification
                </p>
                <p className="text-blue-700 dark:text-blue-400">
                  After saving changes, you can send an update notification to the customer 
                  with the new order status and tracking information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            disabled={!hasChanges || isLoading}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Reset Changes
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-auto"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditOrderModal;