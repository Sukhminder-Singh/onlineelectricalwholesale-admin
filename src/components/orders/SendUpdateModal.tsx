import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import InputField from "../form/input/InputField";
import Select from "../form/Select";
import { PaperPlaneIcon, CheckCircleIcon, MailIcon, ChatIcon, InfoIcon } from "../../icons";

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

interface SendUpdateModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSend: (notificationData: NotificationData) => void;
}

interface NotificationData {
  method: "email" | "sms" | "both";
  template: "custom" | "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  subject: string;
  message: string;
  includeTracking: boolean;
}

const SendUpdateModal: React.FC<SendUpdateModalProps> = ({
  order,
  isOpen,
  onClose,
  onSend,
}) => {
  const [formData, setFormData] = useState<NotificationData>({
    method: "email",
    template: "custom",
    subject: "",
    message: "",
    includeTracking: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Template definitions
  const getEmailTemplate = (status: string, customerName: string, orderNumber: string, trackingNumber?: string) => {
    const templates = {
      pending: {
        subject: `Order Confirmation - ${orderNumber}`,
        message: `Hi ${customerName},\n\nThank you for your order! We have received your order ${orderNumber} and it's currently pending processing.\n\nOrder Details:\n- Order Number: ${orderNumber}\n- Status: Pending\n\nWe'll send you another update once we begin processing your order.\n\nIf you have any questions, please don't hesitate to contact our customer service team.\n\nThank you for choosing us!\n\nBest regards,\nCustomer Service Team`
      },
      processing: {
        subject: `Order Processing - ${orderNumber}`,
        message: `Hi ${customerName},\n\nGreat news! Your order ${orderNumber} is now being processed. We're carefully preparing your items for shipment.\n\nOrder Details:\n- Order Number: ${orderNumber}\n- Status: Processing\n\nWe'll send you another update with tracking information once your order is shipped.\n\nEstimated processing time: 1-2 business days\n\nThank you for your patience!\n\nBest regards,\nFulfillment Team`
      },
      shipped: {
        subject: `Order Shipped - ${orderNumber}`,
        message: `Hi ${customerName},\n\nYour order ${orderNumber} has been shipped and is on its way to you!${trackingNumber ? `\n\nTracking Information:\n- Tracking Number: ${trackingNumber}\n- You can track your package using the tracking number above` : ''}\n\nOrder Details:\n- Order Number: ${orderNumber}\n- Status: Shipped\n- Estimated delivery: 3-5 business days\n\nYou'll receive an email notification once your package is delivered.\n\nThank you for your business!\n\nBest regards,\nShipping Team`
      },
      delivered: {
        subject: `Order Delivered - ${orderNumber}`,
        message: `Hi ${customerName},\n\nGreat news! Your order ${orderNumber} has been delivered successfully.\n\nOrder Details:\n- Order Number: ${orderNumber}\n- Status: Delivered\n- Delivery completed on: ${new Date().toLocaleDateString()}\n\nWe hope you're happy with your purchase! If you have any questions or concerns about your order, please don't hesitate to contact us.\n\nWe'd love to hear about your experience. Consider leaving us a review!\n\nThank you for choosing us!\n\nBest regards,\nCustomer Service Team`
      },
      cancelled: {
        subject: `Order Cancellation - ${orderNumber}`,
        message: `Hi ${customerName},\n\nWe regret to inform you that your order ${orderNumber} has been cancelled.\n\nOrder Details:\n- Order Number: ${orderNumber}\n- Status: Cancelled\n- Cancellation Date: ${new Date().toLocaleDateString()}\n\nReason for cancellation: [Please specify reason]\n\nIf you paid for this order, a full refund will be processed within 3-5 business days to your original payment method.\n\nIf you have any questions about this cancellation or need assistance placing a new order, please contact our customer service team.\n\nWe apologize for any inconvenience.\n\nBest regards,\nCustomer Service Team`
      },
      refunded: {
        subject: `Refund Processed - ${orderNumber}`,
        message: `Hi ${customerName},\n\nWe have processed a refund for your order ${orderNumber}.\n\nRefund Details:\n- Order Number: ${orderNumber}\n- Refund Amount: [Amount will be shown on your statement]\n- Processing Date: ${new Date().toLocaleDateString()}\n- Expected in account: 3-5 business days\n\nThe refund has been issued to your original payment method. Please allow 3-5 business days for the refund to appear in your account.\n\nIf you don't see the refund after this time period, please contact your bank or payment provider, or reach out to our customer service team for assistance.\n\nThank you for your understanding.\n\nBest regards,\nCustomer Service Team`
      }
    };
    
    return templates[status as keyof typeof templates] || {
      subject: `Order Update - ${orderNumber}`,
      message: `Hi ${customerName},\n\nThis is an update regarding your order ${orderNumber}.\n\nCurrent Status: ${status}\n\nIf you have any questions, please don't hesitate to contact us.\n\nThank you!\n\nBest regards,\nCustomer Service Team`
    };
  };

  // Generate default message based on order status
  useEffect(() => {
    if (isOpen) {
      // Set template based on order status
      const statusTemplate = order.status.toLowerCase() as keyof typeof getEmailTemplate;
      const template = getEmailTemplate(order.status.toLowerCase(), `${order.customer.firstName} ${order.customer.lastName}`, order.orderNumber, order.trackingNumber);
      
      setFormData({
        method: "email",
        template: statusTemplate in { pending: 1, processing: 1, shipped: 1, delivered: 1, cancelled: 1, refunded: 1 } ? statusTemplate : "custom",
        subject: template.subject,
        message: template.message,
        includeTracking: Boolean(order.trackingNumber),
      });
      setShowSuccess(false);
    }
  }, [isOpen, order]);

  const notificationMethods = [
    { value: "email", label: "Email Only" },
    { value: "sms", label: "SMS Only" },
    { value: "both", label: "Email & SMS" },
  ];

  const templateOptions = [
    { value: "custom", label: "Custom Message" },
    { value: "pending", label: "Pending Order Template" },
    { value: "processing", label: "Processing Order Template" },
    { value: "shipped", label: "Shipped Order Template" },
    { value: "delivered", label: "Delivered Order Template" },
    { value: "cancelled", label: "Cancelled Order Template" },
    { value: "refunded", label: "Refund Processed Template" },
  ];

  const handleInputChange = (field: keyof NotificationData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTemplateChange = (templateType: string) => {
    if (templateType === "custom") {
      setFormData(prev => ({
        ...prev,
        template: "custom",
        subject: `Order Update - ${order.orderNumber}`,
        message: `Hi ${order.customer.firstName} ${order.customer.lastName},\n\nThis is an update regarding your order ${order.orderNumber}.\n\nCurrent Status: ${order.status}\n\nIf you have any questions, please don't hesitate to contact us.\n\nThank you!\n\nBest regards,\nCustomer Service Team`
      }));
    } else {
      const template = getEmailTemplate(templateType, `${order.customer.firstName} ${order.customer.lastName}`, order.orderNumber, order.trackingNumber);
      setFormData(prev => ({
        ...prev,
        template: templateType as any,
        subject: template.subject,
        message: template.message
      }));
    }
  };

  const handleSend = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onSend(formData);
      setShowSuccess(true);
      
      // Auto-close success modal
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error sending notification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "email":
        return <MailIcon className="w-4 h-4" />;
      case "sms":
        return <ChatIcon className="w-4 h-4" />;
      case "both":
        return (
          <div className="flex gap-1">
            <MailIcon className="w-3 h-3" />
            <ChatIcon className="w-3 h-3" />
          </div>
        );
      default:
        return <MailIcon className="w-4 h-4" />;
    }
  };

  const isFormValid = formData.subject.trim() && formData.message.trim();

  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md mx-auto">
        <div className="p-6 sm:p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100 dark:bg-success-500/20 mb-4">
            <CheckCircleIcon className="h-8 w-8 text-success-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Notification Sent Successfully! 📧
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The update has been sent to {order.customer.firstName} {order.customer.lastName} via {formData.method === "both" ? "email and SMS" : formData.method}.
            {formData.template !== "custom" && (
              <span className="block mt-1 text-sm">
                Using {templateOptions.find(t => t.value === formData.template)?.label}
              </span>
            )}
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Customer will receive the notification shortly.
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-4xl mx-auto">
      <div className="p-4 sm:p-6 lg:p-8 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
            <PaperPlaneIcon className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Send Order Update
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Notify customer about order {order.orderNumber}
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                {order.customer.firstName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {order.customer.firstName} {order.customer.lastName}
              </p>
              <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>📧 {order.customer.email}</span>
                {order.customer.phone && (
                  <span>📱 {order.customer.phone}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">Current Status</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {order.status}
              </div>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Notification Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notification Method
            </label>
            <Select
              options={notificationMethods}
              value={formData.method}
              onChange={(value) => handleInputChange("method", value)}
              placeholder="Select notification method"
            />
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Template
            </label>
            <Select
              options={templateOptions}
              value={formData.template}
              onChange={handleTemplateChange}
              placeholder="Select email template"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Choose a pre-designed template or create a custom message
            </p>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject Line
            </label>
            <InputField
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              placeholder="Enter email subject"
            />
          </div>

          {/* Message */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Message
              </label>
              {formData.template !== "custom" && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded-full">
                  Using {templateOptions.find(t => t.value === formData.template)?.label}
                </span>
              )}
            </div>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Compose your message to the customer..."
              rows={8}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            <div className="mt-2 flex justify-between items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formData.message.length} characters
              </div>
              {formData.template !== "custom" && (
                <button
                  type="button"
                  onClick={() => handleTemplateChange("custom")}
                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Switch to custom message
                </button>
              )}
            </div>
          </div>

          {/* Template Actions */}
          {formData.template !== "custom" && (
            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <InfoIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                    Template Active
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleTemplateChange(formData.template)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Regenerate Template
                </button>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                This message was generated from the {templateOptions.find(t => t.value === formData.template)?.label.toLowerCase()}. You can edit it or regenerate it.
              </p>
            </div>
          )}

          {/* Tracking Number Option */}
          {order.trackingNumber && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
              <input
                type="checkbox"
                id="includeTracking"
                checked={formData.includeTracking}
                onChange={(e) => handleInputChange("includeTracking", e.target.checked)}
                className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              <label htmlFor="includeTracking" className="text-sm text-blue-800 dark:text-blue-300">
                Include tracking number ({order.trackingNumber}) in the message
              </label>
            </div>
          )}

          {/* Preview */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Preview
              </h4>
              {formData.template !== "custom" && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 rounded-full">
                  📧 Template: {templateOptions.find(t => t.value === formData.template)?.label}
                </span>
              )}
            </div>
            <div className="bg-white dark:bg-gray-900 rounded border p-3 text-sm">
              <div className="font-medium text-gray-900 dark:text-white mb-2">
                {formData.subject || "Subject will appear here"}
              </div>
              <div className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {formData.message || "Message will appear here"}
              </div>
              {formData.includeTracking && order.trackingNumber && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tracking: {order.trackingNumber}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!isFormValid || isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-auto"
          >
            {getMethodIcon(formData.method)}
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              `Send ${formData.method === "both" ? "Notifications" : formData.method === "email" ? "Email" : "SMS"}`
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SendUpdateModal;