import { useNavigate } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useOrder } from "../../context/OrderContext";
import { EyeIcon } from "../../icons";

export default function RecentOrders() {
  const navigate = useNavigate();
  const { filteredOrders, isLoading, isAuthenticated } = useOrder();
  
  // Get the 5 most recent orders
  const recentOrders = filteredOrders
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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

  const handleViewAll = () => {
    navigate('/order/list');
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/order/details/${orderId}`);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Latest {recentOrders.length} orders
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleViewAll}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            See all
          </button>
        </div>
      </div>
      
      <div className="max-w-full overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading orders...</span>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {!isAuthenticated() ? 'Please log in to view orders' : 'No recent orders found'}
            </p>
          </div>
        ) : (
          <Table>
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Order Details
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Customer
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Total
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell className="py-3">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {order.orderNumber}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {formatDate(order.orderDate)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {order.customer?.firstName} {order.customer?.lastName}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {order.customer?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-800 text-theme-sm dark:text-white/90 font-medium">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      size="sm"
                      color={getStatusColor(order.status)}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <button
                      onClick={() => handleViewOrder(order.id)}
                      className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                      title="View Order Details"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}