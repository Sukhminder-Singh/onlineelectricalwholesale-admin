import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  ShoppingBag, 
  DollarSign,
  Clock,
  Package,
  CreditCard,
  Truck,
  RefreshCw
} from 'lucide-react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/ui/button/Button';
import { useCustomer, type Customer } from '../../context/CustomerContext';
import { orderApi } from '../../services/api';
import { showErrorToast } from '../../components/ui/toast';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCustomerById, isLoading: customerLoading } = useCustomer();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const foundCustomer = getCustomerById(id);
      setCustomer(foundCustomer || null);
      
      // Load orders for this customer
      if (foundCustomer) {
        loadCustomerOrders(id);
      }
    }
  }, [id, getCustomerById]);

  const loadCustomerOrders = async (customerId: string) => {
    setIsLoadingOrders(true);
    setOrdersError(null);
    
    try {
      // Try to fetch orders from API
      try {
        const apiOrders = await orderApi.getCustomerOrders(customerId);
        
        // Transform API orders to the local format
        const transformedOrders: Order[] = apiOrders.map((order: any) => ({
          id: order.id || order._id,
          orderNumber: order.orderNumber || `ORD-${order.id}`,
          date: order.createdAt || order.orderDate || new Date().toISOString(),
          status: order.status.toLowerCase() as any,
          total: order.totalAmount || order.total || 0,
          items: order.items ? order.items.length : 0,
        }));
        
        setOrders(transformedOrders);
      } catch (apiError) {
        console.warn('Failed to fetch orders from API:', apiError);
        setOrdersError('Failed to load orders');
      }
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleRefreshOrders = () => {
    if (id) {
      loadCustomerOrders(id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getOrderStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const isLoading = customerLoading || isLoadingOrders;

  if (customerLoading) {
    return (
      <>
        <PageMeta title="Customer Details | TailAdmin" description="View customer information" />
        <PageBreadcrumb pageTitle="Customer Details" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading customer details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!customer) {
    return (
      <>
        <PageMeta title="Customer Not Found | TailAdmin" description="Customer not found" />
        <PageBreadcrumb pageTitle="Customer Not Found" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Customer Not Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              The customer you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/customer/list">
              <Button>Back to Customer List</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title={`${customer.firstName} ${customer.lastName} | TailAdmin`}
        description="View customer details and order history"
      />
      <PageBreadcrumb pageTitle={`${customer.firstName} ${customer.lastName}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {customer.firstName} {customer.lastName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Customer since {formatDate(customer.createdAt)}
              </p>
            </div>
          </div>
          <Link to={`/customer/edit/${customer.id}`}>
            <Button className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Customer
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Overview */}
            <ComponentCard title="Customer Overview">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {customer.firstName} {customer.lastName}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {customer.email}
                    </span>
                    {customer.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {customer.phone}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      {customer.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <ShoppingBag className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{customer.totalOrders}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(customer.totalSpent)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'Never'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Order</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <CreditCard className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {customer.totalOrders > 0 ? formatCurrency(customer.totalSpent / customer.totalOrders) : '$0'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Order</p>
                </div>
              </div>

              {customer.notes && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notes</h4>
                  <p className="text-gray-600 dark:text-gray-400">{customer.notes}</p>
                </div>
              )}
            </ComponentCard>

            {/* Order History */}
            <ComponentCard title="Recent Orders">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {orders.length} order{orders.length !== 1 ? 's' : ''} found
                </p>
                <button
                  onClick={handleRefreshOrders}
                  disabled={isLoadingOrders}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh Orders"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              
              {isLoadingOrders ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-3"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
                  </div>
                </div>
              ) : ordersError ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{ordersError}</p>
                  <button
                    onClick={handleRefreshOrders}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Try again
                  </button>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No orders found for this customer</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Order</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Items</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                          onClick={() => navigate(`/order/details/${order.id}`)}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {order.orderNumber}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                            {formatDate(order.date)}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                            {order.items} item{order.items !== 1 ? 's' : ''}
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                            {formatCurrency(order.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ComponentCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <ComponentCard title="Contact Information">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <a
                      href={`mailto:${customer.email}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {customer.email}
                    </a>
                  </div>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                      <a
                        href={`tel:${customer.phone}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {customer.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </ComponentCard>

            {/* Address Information */}
            {(customer.address || customer.city || customer.country) && (
              <ComponentCard title="Address Information">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {customer.address && <p>{customer.address}</p>}
                    {(customer.city || customer.state || customer.postalCode) && (
                      <p>
                        {[customer.city, customer.state, customer.postalCode]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                    {customer.country && <p>{customer.country}</p>}
                  </div>
                </div>
              </ComponentCard>
            )}

            {/* Account Information */}
            <ComponentCard title="Account Information">
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Customer ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">{customer.id}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Member Since</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(customer.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {customer.status}
                  </span>
                </div>
              </div>
            </ComponentCard>
          </div>
        </div>
      </div>
    </>
  );
}