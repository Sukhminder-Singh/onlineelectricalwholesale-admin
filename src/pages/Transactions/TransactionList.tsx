import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import { EyeIcon, DownloadIcon, MoreDotIcon } from "../../icons";
import { Search, Filter, CreditCard, DollarSign, TrendingUp, Mail, Loader2, AlertCircle } from "lucide-react";
import { transactionApi, Transaction, TransactionFilters, TransactionStats } from "../../services/api";
import { mockTransactions } from "../../data/mockTransactions";


const TransactionList = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<keyof Transaction>("transactionDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const filters: TransactionFilters = {
          search: searchTerm || undefined,
          status: filter !== "all" ? filter : undefined,
          sortBy: sortField,
          sortOrder: sortDirection,
          page: currentPage,
          limit: 10
        };

        const [transactionsResponse, statsResponse] = await Promise.all([
          transactionApi.getAll(filters),
          transactionApi.getStats()
        ]);

        setTransactions(mockTransactions);
        setCurrentPage(transactionsResponse.pagination.currentPage);
        setTotalPages(transactionsResponse.pagination.totalPages);
        setTotalItems(transactionsResponse.pagination.totalItems);
        setStats(statsResponse);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [searchTerm, filter, sortField, sortDirection, currentPage]);

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

  const getPaymentMethodIcon = (method: Transaction["paymentMethod"]) => {
    switch (method) {
      case "Credit Card":
        return <CreditCard className="w-4 h-4" />;
      case "PayPal":
        return <DollarSign className="w-4 h-4" />;
      case "Bank Transfer":
        return <TrendingUp className="w-4 h-4" />;
      case "Digital Wallet":
        return <CreditCard className="w-4 h-4" />;
      case "Cash":
        return <DollarSign className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    // Handle NaN, null, undefined, or invalid numbers
    const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(safeAmount);
  };

  // Handle sending invoice via email
  const [sendingInvoice, setSendingInvoice] = useState<string | null>(null);
  
  const handleSendInvoice = async (transaction: Transaction) => {
    setSendingInvoice(transaction.id);
    
    try {
      await transactionApi.sendInvoice(transaction.id, {
        recipient: transaction.customer.email,
        subject: `Invoice ${transaction.invoice.invoiceNumber}`,
        message: `Please find attached your invoice ${transaction.invoice.invoiceNumber} for transaction ${transaction.transactionId}.`,
        includeInvoiceDetails: true
      });
      
      // Show success message
      alert(`✅ Invoice ${transaction.invoice.invoiceNumber} has been sent successfully to ${transaction.customer.email}`);
      
      console.log('Invoice sent successfully!');
    } catch (error) {
      console.error('Failed to send invoice:', error);
      alert('❌ Failed to send invoice. Please try again.');
    } finally {
      setSendingInvoice(null);
    }
  };

  // Use transactions directly since filtering is now handled by the API
  const filteredTransactions = transactions;

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Use stats from API or calculate from current page data as fallback
  const summary = useMemo(() => {
    if (stats) {
      console.log('Using API stats:', stats);
      return {
        totalTransactions: stats.totalTransactions || 0,
        totalAmount: stats.totalAmount || 0,
        totalFees: stats.totalFees || 0,
        netAmount: stats.netAmount || 0,
        avgTransaction: stats.avgTransaction || 0,
        paidInvoices: stats.paidInvoices || 0
      };
    }
    
    // Fallback calculation from current page data with proper null/undefined handling
    const total = filteredTransactions.reduce((sum, t) => {
      const amount = typeof t.amount === 'number' && !isNaN(t.amount) ? t.amount : 0;
      return sum + amount;
    }, 0);
    
    const fees = filteredTransactions.reduce((sum, t) => {
      const fee = typeof t.fees === 'number' && !isNaN(t.fees) ? t.fees : 0;
      return sum + fee;
    }, 0);
    
    const net = filteredTransactions.reduce((sum, t) => {
      const netAmount = typeof t.netAmount === 'number' && !isNaN(t.netAmount) ? t.netAmount : 0;
      return sum + netAmount;
    }, 0);
    
    const paidInvoices = filteredTransactions.filter(t => t.invoice?.status === "Paid").length;
    
    const calculatedSummary = {
      totalTransactions: totalItems || 0,
      totalAmount: total,
      totalFees: fees,
      netAmount: net,
      avgTransaction: filteredTransactions.length > 0 ? total / filteredTransactions.length : 0,
      paidInvoices
    };
    
    console.log('Using calculated summary:', calculatedSummary);
    console.log('Filtered transactions:', filteredTransactions);
    
    return calculatedSummary;
  }, [stats, filteredTransactions, totalItems]);

  // Show loading state
  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <PageBreadCrumb pageTitle="Transaction Management" />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 md:p-6">
        <PageBreadCrumb pageTitle="Transaction Management" />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Failed to load transactions
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <PageBreadCrumb 
        pageTitle="Transaction Management"
      />

      {/* Header Section with Summary Cards */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Transaction Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor and manage all order transactions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
              <DownloadIcon className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.totalTransactions}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(summary.totalAmount)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Fees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(summary.totalFees)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <CreditCard className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(summary.netAmount)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paid Invoices</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.paidInvoices}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Ready to send
                </p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions, orders, invoices, or customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-4 px-6 font-semibold text-gray-900 dark:text-white text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div 
                    className="flex items-center gap-2"
                    onClick={() => handleSort("transactionId")}
                  >
                    Transaction ID
                    {sortField === "transactionId" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="py-4 px-6 font-semibold text-gray-900 dark:text-white text-left"
                >
                  Customer
                </TableCell>
                <TableCell
                  isHeader
                  className="py-4 px-6 font-semibold text-gray-900 dark:text-white text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div 
                    className="flex items-center gap-2"
                    onClick={() => handleSort("amount")}
                  >
                    Amount
                    {sortField === "amount" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="py-4 px-6 font-semibold text-gray-900 dark:text-white text-left"
                >
                  Payment Method
                </TableCell>
                <TableCell
                  isHeader
                  className="py-4 px-6 font-semibold text-gray-900 dark:text-white text-left"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="py-4 px-6 font-semibold text-gray-900 dark:text-white text-left"
                >
                  Invoice
                </TableCell>
                <TableCell
                  isHeader
                  className="py-4 px-6 font-semibold text-gray-900 dark:text-white text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div 
                    className="flex items-center gap-2"
                    onClick={() => handleSort("transactionDate")}
                  >
                    Date
                    {sortField === "transactionDate" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="py-4 px-6 font-semibold text-gray-900 dark:text-white text-center"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <Search className="w-12 h-12 mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No transactions found</p>
                      <p className="text-sm">Try adjusting your search criteria or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow 
                    key={transaction.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-200"
                  >
                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col">
                        <button
                          onClick={() => navigate(`/transaction/details/${transaction.id}`)}
                          className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-left"
                        >
                          {transaction.transactionId}
                        </button>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Order: {transaction.orderId}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {transaction.customer.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.customer.email}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(transaction.amount)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Net: {formatCurrency(transaction.netAmount)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(transaction.paymentMethod)}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.paymentMethod}
                          </span>
                          {transaction.reference && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {transaction.reference}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-6">
                      <Badge
                        size="sm"
                        color={getStatusColor(transaction.status)}
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col">
                        <button
                          onClick={() => navigate(`/transaction/details/${transaction.id}`)}
                          className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-left text-sm"
                        >
                          {transaction.invoice.invoiceNumber}
                        </button>
                        <div className="mt-1">
                          <Badge
                            size="sm"
                            color={getInvoiceStatusColor(transaction.invoice.status)}
                          >
                            {transaction.invoice.status}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formatDate(transaction.transactionDate)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/transaction/details/${transaction.id}`)}
                          className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        
                        {/* Send Invoice button - only show for paid invoices */}
                        {transaction.invoice.status === "Paid" && (
                          <button
                            onClick={() => handleSendInvoice(transaction)}
                            disabled={sendingInvoice === transaction.id}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              sendingInvoice === transaction.id
                                ? 'text-gray-400 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
                                : 'text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            title={sendingInvoice === transaction.id ? "Sending Invoice..." : "Send Invoice via Email"}
                          >
                            {sendingInvoice === transaction.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        <button
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          title="More Options"
                        >
                          <MoreDotIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing {filteredTransactions.length} of {totalItems} transactions
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;