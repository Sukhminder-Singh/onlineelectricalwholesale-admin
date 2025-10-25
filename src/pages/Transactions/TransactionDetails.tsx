import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Badge from "../../components/ui/badge/Badge";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import { ChevronLeftIcon, EditIcon, DownloadIcon } from "../../icons";
import { CreditCard, DollarSign, User, FileText, TrendingUp, AlertCircle, Download, Loader2 } from "lucide-react";
import { transactionApi, Transaction } from "../../services/api";


const TransactionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transaction details from API
  useEffect(() => {
    const fetchTransaction = async () => {
      if (!id) {
        navigate("/transaction/list", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const transactionData = await transactionApi.getById(id);
        setTransaction(transactionData);
      } catch (err) {
        console.error('Failed to fetch transaction:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch transaction details');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id, navigate]);

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "Completed":
        return "success";
      case "Processing":
        return "info";
      case "Pending":
        return "warning";
      case "Failed":
        return "error";
      case "Refunded":
        return "light";
      default:
        return "light";
    }
  };

  const getPaymentMethodIcon = (method: Transaction["paymentMethod"]) => {
    switch (method) {
      case "Credit Card":
        return <CreditCard className="w-5 h-5" />;
      case "PayPal":
        return <DollarSign className="w-5 h-5" />;
      case "Bank Transfer":
        return <TrendingUp className="w-5 h-5" />;
      case "Digital Wallet":
        return <CreditCard className="w-5 h-5" />;
      case "Cash":
        return <DollarSign className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
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

  const getInvoiceStatusColor = (status: Transaction["invoice"]["status"]) => {
    switch (status) {
      case "Paid":
        return "success";
      case "Sent":
        return "info";
      case "Draft":
        return "light";
      case "Overdue":
        return "error";
      case "Cancelled":
        return "error";
      default:
        return "light";
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    // Handle NaN, null, undefined, or invalid numbers
    const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(safeAmount);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <PageBreadCrumb pageTitle="Transaction Details" />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">Loading transaction details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 md:p-6">
        <PageBreadCrumb pageTitle="Transaction Details" />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Failed to load transaction
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => navigate("/transaction/list")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-2"
              >
                Back to List
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!transaction) {
    return (
      <div className="p-4 md:p-6">
        <PageBreadCrumb pageTitle="Transaction Details" />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Transaction not found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The transaction you're looking for doesn't exist or has been removed.
              </p>
              <button
                onClick={() => navigate("/transaction/list")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageBreadCrumb pageTitle="Transaction Details" />
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/transaction/list")}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Transaction {transaction.transactionId}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Processed on {formatDate(transaction.transactionDate)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
              <DownloadIcon className="w-4 h-4" />
              Export
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
              <EditIcon className="w-4 h-4" />
              Actions
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Transaction Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Fees</label>
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                    -{formatCurrency(transaction.fees)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Amount</label>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(transaction.netAmount)}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <div className="mt-1">
                    <Badge size="md" color={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getPaymentMethodIcon(transaction.paymentMethod)}
                    <span className="text-gray-900 dark:text-white">{transaction.paymentMethod}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Reference</label>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">
                    {transaction.reference}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Customer Information
            </h2>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {transaction.customer.avatar ? (
                  <img
                    src={transaction.customer.avatar}
                    alt={transaction.customer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg font-medium">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {transaction.customer.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {transaction.customer.email}
                </p>
                {transaction.customer.phone && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {transaction.customer.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Billing Address
            </h3>
            <div className="space-y-1 text-gray-600 dark:text-gray-400">
              <p>{transaction.billingAddress.street}</p>
              <p>
                {transaction.billingAddress.city}, {transaction.billingAddress.state} {transaction.billingAddress.zipCode}
              </p>
              <p>{transaction.billingAddress.country}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoice Details
              </h3>
              {transaction.invoice.downloadUrl && (
                <button
                  onClick={() => window.open(transaction.invoice.downloadUrl, '_blank')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Invoice Number</label>
                <p className="text-gray-900 dark:text-white font-mono text-sm">{transaction.invoice.invoiceNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                <div className="mt-1">
                  <Badge size="sm" color={getInvoiceStatusColor(transaction.invoice.status)}>
                    {transaction.invoice.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Invoice Date</label>
                  <p className="text-gray-900 dark:text-white text-sm">{formatDate(transaction.invoice.invoiceDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</label>
                  <p className="text-gray-900 dark:text-white text-sm">{formatDate(transaction.invoice.dueDate)}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Subtotal:</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(transaction.invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Tax:</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(transaction.invoice.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Discount:</span>
                    <span className="text-red-600 dark:text-red-400">-{formatCurrency(transaction.invoice.discountAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span className="text-gray-900 dark:text-white">Total:</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(transaction.invoice.totalAmount)}</span>
                  </div>
                </div>
              </div>
              {transaction.invoice.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                  <p className="text-gray-900 dark:text-white text-sm mt-1">{transaction.invoice.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Related Order */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Related Order
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Order ID</label>
                <button
                  onClick={() => navigate(`/order/details/${transaction.orderId.split('-').pop()}`)}
                  className="block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  {transaction.orderId}
                </button>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                <p className="text-gray-900 dark:text-white">{transaction.description}</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Payment Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Processor</label>
                <p className="text-gray-900 dark:text-white">{transaction.paymentProcessor}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Merchant ID</label>
                <p className="text-gray-900 dark:text-white font-mono text-sm">{transaction.merchantId}</p>
              </div>
              {transaction.authorizationCode && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Auth Code</label>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">{transaction.authorizationCode}</p>
                </div>
              )}
              {transaction.settlementDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Settlement Date</label>
                  <p className="text-gray-900 dark:text-white">{formatDate(transaction.settlementDate)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Technical Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">IP Address</label>
                <p className="text-gray-900 dark:text-white font-mono text-sm">{transaction.ipAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Device</label>
                <p className="text-gray-900 dark:text-white capitalize">{transaction.metadata.deviceType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Source</label>
                <p className="text-gray-900 dark:text-white capitalize">{transaction.metadata.source}</p>
              </div>
              {transaction.metadata.campaign && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Campaign</label>
                  <p className="text-gray-900 dark:text-white">{transaction.metadata.campaign}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;