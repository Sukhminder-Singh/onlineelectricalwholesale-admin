import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import { 
  ChevronLeftIcon, 
  EditIcon, 
  PaperPlaneIcon, 
  MailIcon, 
  UserIcon,
  CalenderIcon,
  DollarLineIcon,
  FileIcon
} from "../../icons";
import { useModal } from "../../hooks/useModal";
import Toast from "../../components/ui/toast/Toast";
import EditQuoteModal from "../../components/quotes/EditQuoteModal";
import SendQuoteUpdateModal from "../../components/quotes/SendQuoteUpdateModal";
import { QuoteRequest, QuoteItem, QuoteCustomer, QuoteAttachment } from "../../services/api";

// Sample quote request data (same as in QuoteRequestList)
const quoteRequestData: QuoteRequest[] = [
  {
    id: "1",
    quoteNumber: "QR-2024-001",
    customer: {
      id: "c1",
      name: "Sukhminder",
      email: "sarah.johnson@techcorp.com",
      phone: "+1 (555) 123-4567",
      company: "TechCorp Solutions",
      avatar: "/images/user/user-01.jpg"
    },
    items: [
      {
        id: "i1",
        productId: "prod1",
        productName: "MacBook Pro 16\" M3",
        quantity: 25,
        requestedPrice: 2200,
        suggestedPrice: 2150,
        image: "/images/product/product-01.jpg",
        sku: "MBP-16-M3",
        description: "Latest MacBook Pro with M3 chip for office deployment"
      },
      {
        id: "i2",
        productId: "prod2",
        productName: "Magic Mouse",
        quantity: 25,
        requestedPrice: 85,
        suggestedPrice: 82,
        image: "/images/product/product-02.jpg",
        sku: "MM-2023",
        description: "Wireless magic mouse"
      }
    ],
    totalItems: 2,
    estimatedValue: 57125,
    finalQuoteValue: 55800,
    status: "Under Review",
    priority: "High",
    requestDate: "2024-01-15",
    expiryDate: "2024-02-15",
    message: "We need bulk pricing for our new office setup. Looking for the best wholesale rates.",
    notes: "Bulk purchase for office expansion",
    attachments: [
      {
        id: "att1",
        filename: "company-requirements.pdf",
        originalName: "company-requirements.pdf",
        url: "/attachments/company-requirements.pdf",
        size: 1024000,
        type: "application/pdf",
        uploadedAt: "2024-01-15T10:00:00Z"
      },
      {
        id: "att2",
        filename: "office-layout.png",
        originalName: "office-layout.png",
        url: "/attachments/office-layout.png",
        size: 512000,
        type: "image/png",
        uploadedAt: "2024-01-15T10:05:00Z"
      }
    ],
    createdAt: "2024-01-15T09:00:00Z",
    currency: "USD"
  },
  {
    id: "2",
    quoteNumber: "QR-2024-002",
    customer: {
      id: "c2",
      name: "Michael Chen",
      email: "procurement@retailplus.com",
      phone: "+1 (555) 234-5678",
      company: "RetailPlus Inc",
      avatar: "/images/user/user-02.jpg"
    },
    items: [
      {
        id: "i3",
        productId: "prod3",
        productName: "iPhone 15 Pro",
        quantity: 100,
        requestedPrice: 1050,
        suggestedPrice: 1020,
        image: "/images/product/product-03.jpg",
        sku: "IP15-PRO",
        description: "iPhone 15 Pro for retail inventory"
      }
    ],
    totalItems: 1,
    estimatedValue: 105000,
    finalQuoteValue: 98000,
    status: "Quoted",
    priority: "Medium",
    requestDate: "2024-01-14",
    expiryDate: "2024-02-14",
    message: "Looking for competitive pricing for retail inventory.",
    notes: "Recurring monthly order potential",
    createdAt: "2024-01-14T09:00:00Z",
    currency: "USD"
  },
  // Add other quote requests as needed...
];

const QuoteRequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string } | null>(null);

  // Modal states
  const {
    isOpen: isEditModalOpen,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useModal();

  const {
    isOpen: isSendUpdateModalOpen,
    openModal: openSendUpdateModal,
    closeModal: closeSendUpdateModal,
  } = useModal();

  useEffect(() => {
    if (id) {
      // Simulate API call
      setTimeout(() => {
        const foundQuote = quoteRequestData.find(quote => quote.id === id);
        setQuoteRequest(foundQuote || null);
        setIsLoading(false);
      }, 500);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!quoteRequest) {
    return (
      <div className="w-full max-w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Quote Request Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The quote request you're looking for doesn't exist or may have been removed.
          </p>
          <button
            onClick={() => navigate("/quote/list")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Quote Requests
          </button>
        </div>
      </div>
    );
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "under review":
        return "info";
      case "quoted":
        return "primary";
      case "accepted":
        return "success";
      case "rejected":
        return "error";
      case "expired":
        return "light";
      default:
        return "light";
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "light";
    }
  };

  // Calculate totals
  const calculateTotalRequestedValue = () => {
    return quoteRequest.items.reduce((total, item) => {
      return total + (item.requestedPrice || 0) * item.quantity;
    }, 0);
  };

  const calculateTotalSuggestedValue = () => {
    return quoteRequest.items.reduce((total, item) => {
      return total + (item.suggestedPrice || item.requestedPrice || 0) * item.quantity;
    }, 0);
  };

  // Handle save quote updates
  const handleSaveQuote = async (updatedQuote: Partial<QuoteRequest>) => {
    try {
      // Here you would typically make an API call to update the quote
      console.log('Updating quote:', updatedQuote);
      
      // Update local state
      setQuoteRequest(prev => prev ? { ...prev, ...updatedQuote } : null);
      
      // Show success toast
      setToast({
        id: 'quote-updated',
        type: 'success',
        title: 'Quote Updated',
        message: 'Quote request has been updated successfully.'
      });
    } catch (error) {
      console.error('Error updating quote:', error);
      setToast({
        id: 'quote-error',
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update quote request. Please try again.'
      });
    }
  };

  // Handle send quote update
  const handleSendUpdate = async (updateData: {
    recipient: string;
    subject: string;
    message: string;
  }) => {
    try {
      // Here you would typically make an API call to send the update
      console.log('Sending update:', updateData);
      
      // Show success toast
      setToast({
        id: 'update-sent',
        type: 'success',
        title: 'Update Sent',
        message: `Update has been sent to ${updateData.recipient} via email.`
      });
    } catch (error) {
      console.error('Error sending update:', error);
      setToast({
        id: 'send-error',
        type: 'error',
        title: 'Send Failed',
        message: 'Failed to send update. Please try again.'
      });
    }
  };

  return (
    <div className="w-full max-w-full mx-auto p-4 sm:p-6 lg:p-8">
      <PageBreadCrumb 
        pageTitle={`Quote Request - ${quoteRequest.quoteNumber}`}
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
          <button
            onClick={() => navigate("/quote/list")}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {quoteRequest.quoteNumber}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Quote request details and management
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge color={getStatusColor(quoteRequest.status)}>
            {quoteRequest.status}
          </Badge>
          <Badge color={getPriorityColor(quoteRequest.priority)}>
            {quoteRequest.priority} Priority
          </Badge>
          
          <button
            onClick={openEditModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <EditIcon className="w-4 h-4" />
            <span>Update Quote</span>
          </button>
          
          <button
            onClick={openSendUpdateModal}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <PaperPlaneIcon className="w-4 h-4" />
            <span>Send Update</span>
          </button>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="space-y-6">
          {/* Quote Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Requested Items ({quoteRequest.totalItems})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader>Product</TableCell>
                    <TableCell isHeader>SKU</TableCell>
                    <TableCell isHeader>Quantity</TableCell>
                    <TableCell isHeader>Requested Price</TableCell>
                    <TableCell isHeader>Suggested Price</TableCell>
                    <TableCell isHeader>Total</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quoteRequest.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {item.productName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {item.sku}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <span className="font-medium">
                          {item.quantity.toLocaleString()}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <span className="font-medium">
                          ${item.requestedPrice?.toLocaleString() || 'N/A'}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          ${item.suggestedPrice?.toLocaleString() || 'TBD'}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <span className="font-medium">
                          ${((item.suggestedPrice || item.requestedPrice || 0) * item.quantity).toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Quote Summary */}
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Requested Total:</span>
                  <span className="font-medium">${calculateTotalRequestedValue().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Suggested Total:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    ${calculateTotalSuggestedValue().toLocaleString()}
                  </span>
                </div>
                {quoteRequest.finalQuoteValue && (
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-gray-900 dark:text-white">Final Quote:</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      ${quoteRequest.finalQuoteValue.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

        {/* Additional Information Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Customer Information
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {quoteRequest.customer.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {quoteRequest.customer.company}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MailIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {quoteRequest.customer.email}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {quoteRequest.customer.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quote Details
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Request Date:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(quoteRequest.requestDate).toLocaleDateString()}
                </span>
              </div>
              
              {quoteRequest.expiryDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Expiry Date:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(quoteRequest.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Items:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {quoteRequest.totalItems}
                </span>
              </div>

              {quoteRequest.estimatedValue && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Value:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${quoteRequest.estimatedValue.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {quoteRequest.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Internal Notes
                </h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {quoteRequest.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Customer Message and Attachments Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Message */}
          {quoteRequest.message && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Customer Message
                </h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {quoteRequest.message}
                </p>
              </div>
            </div>
          )}

          {/* Attachments */}
          {quoteRequest.attachments && quoteRequest.attachments.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Attachments
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {quoteRequest.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <FileIcon className="w-5 h-5 text-gray-400" />
                      <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                        {attachment.originalName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {(attachment.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast notifications */}
      {toast && (
        <Toast
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Modals */}
      <EditQuoteModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        quote={quoteRequest}
        onSave={handleSaveQuote}
      />

      <SendQuoteUpdateModal
        isOpen={isSendUpdateModalOpen}
        onClose={closeSendUpdateModal}
        quote={quoteRequest}
        onSend={handleSendUpdate}
      />
    </div>
  );
};

export default QuoteRequestDetails;