import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import { EyeIcon, EditIcon, MoreDotIcon, PaperPlaneIcon } from "../../icons";
import { Search } from "lucide-react";
import { useModal } from "../../hooks/useModal";
import Toast from "../../components/ui/toast/Toast";


// Define TypeScript interfaces for Quote Requests
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  avatar?: string;
}

interface QuoteItem {
  id: string;
  productName: string;
  quantity: number;
  requestedPrice?: number;
  suggestedPrice?: number;
  image: string;
  sku?: string;
  description?: string;
}

interface QuoteRequest {
  id: string;
  quoteNumber: string;
  customer: Customer;
  items: QuoteItem[];
  totalItems: number;
  estimatedValue?: number;
  finalQuoteValue?: number;
  status: "Pending" | "Under Review" | "Quoted" | "Accepted" | "Rejected" | "Expired";
  priority: "Low" | "Medium" | "High" | "Urgent";
  requestDate: string;
  expiryDate?: string;
  notes?: string;
  message?: string;
  attachments?: string[];
}

// Sample quote request data
const quoteRequestData: QuoteRequest[] = [
  {
    id: "1",
    quoteNumber: "QR-2024-001",
    customer: {
      id: "c1",
      name: "Sarah Johnson",
      email: "sarah.johnson@techcorp.com",
      phone: "+1 (555) 123-4567",
      company: "TechCorp Solutions",
      avatar: "/images/user/user-01.jpg"
    },
    items: [
      {
        id: "i1",
        productName: "MacBook Pro 16\" M3",
        quantity: 25,
        requestedPrice: 2200,
        image: "/images/product/product-01.jpg",
        sku: "MBP-16-M3",
        description: "Latest MacBook Pro with M3 chip for office deployment"
      },
      {
        id: "i2",
        productName: "Magic Mouse",
        quantity: 25,
        requestedPrice: 85,
        image: "/images/product/product-02.jpg",
        sku: "MM-2023",
        description: "Wireless magic mouse"
      }
    ],
    totalItems: 2,
    estimatedValue: 57125,
    status: "Under Review",
    priority: "High",
    requestDate: "2024-01-15",
    expiryDate: "2024-02-15",
    message: "We need bulk pricing for our new office setup. Looking for the best wholesale rates.",
    notes: "Bulk purchase for office expansion"
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
        productName: "iPhone 15 Pro",
        quantity: 100,
        requestedPrice: 1050,
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
    notes: "Recurring monthly order potential"
  },
  {
    id: "3",
    quoteNumber: "QR-2024-003",
    customer: {
      id: "c3",
      name: "Emma Davis",
      email: "emma@creativestudio.com",
      phone: "+1 (555) 345-6789",
      company: "Creative Studio",
      avatar: "/images/user/user-03.jpg"
    },
    items: [
      {
        id: "i4",
        productName: "iPad Air",
        quantity: 15,
        requestedPrice: 520,
        image: "/images/product/product-04.jpg",
        sku: "IPAD-AIR-5",
        description: "iPad Air for design team"
      },
      {
        id: "i5",
        productName: "Apple Pencil",
        quantity: 15,
        requestedPrice: 110,
        image: "/images/product/product-05.jpg",
        sku: "PENCIL-2",
        description: "Apple Pencil 2nd generation"
      }
    ],
    totalItems: 2,
    estimatedValue: 9450,
    finalQuoteValue: 8900,
    status: "Accepted",
    priority: "Low",
    requestDate: "2024-01-13",
    expiryDate: "2024-02-13",
    message: "We need these for our design team expansion.",
    notes: "Customer accepted quote - ready to convert to order"
  },
  {
    id: "4",
    quoteNumber: "QR-2024-004",
    customer: {
      id: "c4",
      name: "James Wilson",
      email: "james@startuptech.io",
      phone: "+1 (555) 456-7890",
      company: "StartupTech",
      avatar: "/images/user/user-04.jpg"
    },
    items: [
      {
        id: "i6",
        productName: "AirPods Pro",
        quantity: 50,
        requestedPrice: 200,
        image: "/images/product/product-06.jpg",
        sku: "APP-3",
        description: "AirPods Pro for employee perks"
      }
    ],
    totalItems: 1,
    estimatedValue: 10000,
    status: "Pending",
    priority: "Low",
    requestDate: "2024-01-12",
    expiryDate: "2024-02-12",
    message: "Looking for bulk pricing for employee gifts.",
    notes: "New customer - first quote request"
  },
  {
    id: "5",
    quoteNumber: "QR-2024-005",
    customer: {
      id: "c5",
      name: "Lisa Anderson",
      email: "lisa@digitalmedia.com",
      phone: "+1 (555) 567-8901",
      company: "Digital Media Corp",
      avatar: "/images/user/user-05.jpg"
    },
    items: [
      {
        id: "i7",
        productName: "MacBook Air M2",
        quantity: 10,
        requestedPrice: 1050,
        image: "/images/product/product-07.jpg",
        sku: "MBA-M2",
        description: "MacBook Air for video editors"
      }
    ],
    totalItems: 1,
    estimatedValue: 10500,
    status: "Expired",
    priority: "Medium",
    requestDate: "2024-01-05",
    expiryDate: "2024-01-20",
    message: "Need these for our new video editing team.",
    notes: "Quote expired - follow up needed"
  }
];

const QuoteRequestList = () => {
  const navigate = useNavigate();
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>(quoteRequestData);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [toast, setToast] = useState<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string } | null>(null);
  
  // Filter and search logic
  const filteredQuotes = quoteRequests.filter((quote) => {
    const matchesFilter = filter === "all" || quote.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = 
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

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

  // Handle view quote details
  const handleViewQuote = (quoteId: string) => {
    navigate(`/quote/details/${quoteId}`);
  };

  // Count quotes by status
  const getStatusCounts = () => {
    const counts = {
      all: quoteRequests.length,
      pending: 0,
      "under review": 0,
      quoted: 0,
      accepted: 0,
      rejected: 0,
      expired: 0
    };
    
    quoteRequests.forEach(quote => {
      counts[quote.status.toLowerCase() as keyof typeof counts]++;
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="w-full max-w-full mx-auto p-4 sm:p-6 lg:p-8">
      <PageBreadCrumb 
        pageTitle="Quote Requests"
      />

      {/* Header with stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Quote Requests Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage customer quote requests for bulk and wholesale orders
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.all}</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="text-sm text-orange-600 dark:text-orange-400">Pending</div>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{statusCounts.pending}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-sm text-blue-600 dark:text-blue-400">Under Review</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{statusCounts["under review"]}</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-sm text-purple-600 dark:text-purple-400">Quoted</div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{statusCounts.quoted}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-sm text-green-600 dark:text-green-400">Accepted</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{statusCounts.accepted}</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="text-sm text-red-600 dark:text-red-400">Rejected</div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">{statusCounts.rejected}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Expired</div>
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">{statusCounts.expired}</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by quote number, customer name, company, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under review">Under Review</option>
            <option value="quoted">Quoted</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredQuotes.length} of {quoteRequests.length} quote requests
        </div>
      </div>

      {/* Quote Requests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quote Requests ({filteredQuotes.length})
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage and track customer quote requests
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300 py-4">Quote #</TableCell>
                <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300 py-4">Customer</TableCell>
                <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300 py-4">Items</TableCell>
                <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300 py-4">Value</TableCell>
                <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300 py-4">Status</TableCell>
                <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300 py-4">Date</TableCell>
                <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300 py-4 text-right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <TableRow 
                  key={quote.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700"
                >
                  <TableCell className="py-4 px-6">
                    <div className="space-y-1">
                      <button
                        onClick={() => handleViewQuote(quote.id)}
                        className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors cursor-pointer text-left"
                      >
                        {quote.quoteNumber}
                      </button>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Exp: {quote.expiryDate ? new Date(quote.expiryDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {quote.customer.name}
                      </div>
                      {quote.customer.company && (
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {quote.customer.company}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {quote.customer.email}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                          {quote.totalItems}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          item{quote.totalItems !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 max-w-48 truncate" title={quote.items.map(item => item.productName).join(', ')}>
                        {quote.items.slice(0, 2).map(item => item.productName).join(', ')}
                        {quote.items.length > 2 && ` +${quote.items.length - 2} more`}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="font-bold text-lg text-gray-900 dark:text-white">
                        ${quote.finalQuoteValue ? quote.finalQuoteValue.toLocaleString() : (quote.estimatedValue?.toLocaleString() || 'TBD')}
                      </div>
                      {quote.finalQuoteValue && quote.estimatedValue && quote.finalQuoteValue !== quote.estimatedValue && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                          Est: ${quote.estimatedValue.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="py-4 px-6">
                    <Badge color={getStatusColor(quote.status)} size="sm">
                      {quote.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(quote.requestDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.ceil((new Date().getTime() - new Date(quote.requestDate).getTime()) / (1000 * 3600 * 24))} days ago
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => handleViewQuote(quote.id)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30"
                        title="View Details"
                      >
                        <EyeIcon className="w-3 h-3 mr-1" />
                        View
                      </button>
                      
                      <div className="relative group">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-md transition-colors">
                          <MoreDotIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Empty State */}
        {filteredQuotes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No quote requests found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Quote requests will appear here when customers submit them.'}
            </p>
          </div>
        )}
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
    </div>
  );
};

export default QuoteRequestList;