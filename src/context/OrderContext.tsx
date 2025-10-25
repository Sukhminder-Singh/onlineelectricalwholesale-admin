import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { orderApi, OrderFormData, OrderUpdateData, OrderFilters, ApiOrderResponse } from '../services/api';
import { useAuth } from './AuthContext';

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    image?: string;
    category?: string;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  discount?: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded' | 'Partially Refunded';
  paymentMethod: string;
  orderDate: string;
  shippedDate?: string;
  deliveredDate?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

interface OrderContextType {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  
  // Order operations
  addOrder: (orderData: OrderFormData) => Promise<Order>;
  updateOrder: (id: string, orderData: Partial<OrderUpdateData>) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  refreshOrders: (filters?: OrderFilters) => Promise<void>;
  
  // Filtering and search
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  statusFilter: 'all' | 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
  setStatusFilter: React.Dispatch<React.SetStateAction<'all' | 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned'>>;
  paymentStatusFilter: 'all' | 'Paid' | 'Pending' | 'Failed' | 'Refunded' | 'Partially Refunded';
  setPaymentStatusFilter: React.Dispatch<React.SetStateAction<'all' | 'Paid' | 'Pending' | 'Failed' | 'Refunded' | 'Partially Refunded'>>;
  
  // Advanced filters
  dateRange: { start: string; end: string };
  setDateRange: React.Dispatch<React.SetStateAction<{ start: string; end: string }>>;
  amountRange: { min: string; max: string };
  setAmountRange: React.Dispatch<React.SetStateAction<{ min: string; max: string }>>;
  
  filteredOrders: Order[];
  
  // Statistics
  getTotalOrders: () => number;
  getTotalRevenue: () => number;
  getTotalSubtotal: () => number;
  getOrdersByStatus: (status: Order['status']) => number;
  getOrdersByPaymentStatus: (paymentStatus: Order['paymentStatus']) => number;
  
  // Sorting
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  sortOrder: 'asc' | 'desc';
  setSortOrder: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
  
  // Authentication
  isAuthenticated: () => boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Generate fallback orders when API is not available
const generateFallbackOrders = (): Order[] => {
  const customers = [
    { id: '1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@email.com', phone: '+1 (555) 123-4567' },
    { id: '2', firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@email.com', phone: '+1 (555) 234-5678' },
    { id: '3', firstName: 'Emma', lastName: 'Davis', email: 'emma.davis@email.com', phone: '+1 (555) 345-6789' },
    { id: '4', firstName: 'James', lastName: 'Wilson', email: 'james.wilson@email.com', phone: '+1 (555) 456-7890' },
    { id: '5', firstName: 'Lisa', lastName: 'Anderson', email: 'lisa.anderson@email.com', phone: '+1 (555) 567-8901' },
  ];

  const products = [
    { id: '1', name: 'MacBook Pro 16" M3 Max', sku: 'MBP-16-M3-MAX-001', price: 2499 },
    { id: '2', name: 'Magic Mouse 2', sku: 'MM2-WHT-001', price: 99 },
    { id: '3', name: 'iPhone 15 Pro', sku: 'IPH-15-PRO-001', price: 1199 },
    { id: '4', name: 'iPad Air', sku: 'IPA-AIR-001', price: 599 },
    { id: '5', name: 'Apple Pencil', sku: 'APC-2ND-001', price: 129 },
    { id: '6', name: 'AirPods Pro', sku: 'APP-2ND-001', price: 249 },
    { id: '7', name: 'MacBook Air M2', sku: 'MBA-M2-001', price: 1199 },
  ];

  const statuses: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
  const paymentStatuses: Order['paymentStatus'][] = ['Paid', 'Pending', 'Failed', 'Refunded', 'Partially Refunded'];

  return Array.from({ length: 15 }, (_, index) => {
    const customer = customers[index % customers.length];
    const product = products[index % products.length];
    const status = statuses[index % statuses.length];
    const paymentStatus = paymentStatuses[index % paymentStatuses.length];
    const orderDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const quantity = Math.floor(Math.random() * 3) + 1;
    const itemTotalPrice = product.price * quantity;
    const subtotal = itemTotalPrice;
    const tax = subtotal * 0.08;
    const shipping = subtotal > 100 ? 0 : 15;
    const total = subtotal + tax + shipping;


    return {
      id: `fallback-${Date.now()}-${index}`,
      orderNumber: `ORD-2024-${String(index + 1).padStart(3, '0')}`,
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
      items: [{
        id: `item-${index}`,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: quantity,
        unitPrice: product.price,
        totalPrice: itemTotalPrice,
        image: `/images/product/product-${(index % 7) + 1}.jpg`,
        category: 'Electronics',
      }],
      subtotal,
      tax,
      shipping,
      discount: Math.random() > 0.8 ? subtotal * 0.1 : 0,
      total,
      status,
      paymentStatus,
      paymentMethod: 'Credit Card (**** 4567)',
      orderDate,
      shippedDate: status === 'Shipped' || status === 'Delivered' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      deliveredDate: status === 'Delivered' ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      shippingAddress: {
        street: `${Math.floor(Math.random() * 9999) + 1} Main Street`,
        city: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Seattle'][index % 5],
        state: ['NY', 'CA', 'IL', 'FL', 'WA'][index % 5],
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: 'United States',
      },
      billingAddress: {
        street: `${Math.floor(Math.random() * 9999) + 1} Main Street`,
        city: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Seattle'][index % 5],
        state: ['NY', 'CA', 'IL', 'FL', 'WA'][index % 5],
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: 'United States',
      },
      notes: Math.random() > 0.7 ? 'Please leave at front door if no one is home' : undefined,
      trackingNumber: status === 'Shipped' || status === 'Delivered' ? `1Z999AA${Math.floor(Math.random() * 1000000000)}` : undefined,
      createdAt: orderDate,
      updatedAt: new Date().toISOString(),
    };
  });
};

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'Paid' | 'Pending' | 'Failed' | 'Refunded' | 'Partially Refunded'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Helper function to convert API order to local order format
  const convertApiOrder = useCallback((apiOrder: ApiOrderResponse): Order => {

    // Helper function to capitalize first letter
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    const convertedOrder = {
      id: apiOrder._id || '',
      orderNumber: apiOrder.orderNumber,
      customer: {
        id: apiOrder.customer._id || '',
        firstName: apiOrder.customer.firstName,
        lastName: apiOrder.customer.lastName,
        email: apiOrder.customer.email,
        phone: apiOrder.customerPhone || '',
        avatar: undefined,
      },
      items: (apiOrder.items || []).map((item, index) => ({
        id: `${apiOrder._id}-item-${index}`,
        productId: item.product?._id || '',
        productName: item.productName,
        sku: item.sku,
        quantity: typeof item.quantity === 'number' ? item.quantity : Number(item.quantity) || 0,
        unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : Number(item.unitPrice) || 0,
        totalPrice: typeof item.totalPrice === 'number' ? item.totalPrice : Number(item.totalPrice) || 0,
        image: undefined,
        category: undefined,
      })),
      subtotal: typeof apiOrder.subtotal === 'number' ? apiOrder.subtotal : Number(apiOrder.subtotal) || 0,
      tax: typeof apiOrder.totalTax === 'number' ? apiOrder.totalTax : Number(apiOrder.totalTax) || 0,
      shipping: typeof apiOrder.shippingCost === 'number' ? apiOrder.shippingCost : Number(apiOrder.shippingCost) || 0,
      discount: typeof apiOrder.totalDiscount === 'number' ? apiOrder.totalDiscount : Number(apiOrder.totalDiscount) || 0,
      total: typeof apiOrder.totalAmount === 'number' ? apiOrder.totalAmount : Number(apiOrder.totalAmount) || 0,
      status: capitalize(apiOrder.status || 'pending') as Order['status'],
      paymentStatus: capitalize(apiOrder.paymentInfo?.paymentStatus || 'pending') as Order['paymentStatus'],
      paymentMethod: apiOrder.paymentInfo?.paymentMethod || 'Unknown',
      orderDate: apiOrder.createdAt,
      shippedDate: undefined,
      deliveredDate: undefined,
      shippingAddress: {
        street: apiOrder.shippingAddress?.addressLine1 || '',
        city: apiOrder.shippingAddress?.city || '',
        state: apiOrder.shippingAddress?.state || '',
        zipCode: apiOrder.shippingAddress?.postalCode || '',
        country: apiOrder.shippingAddress?.country || '',
      },
      billingAddress: {
        street: apiOrder.billingAddress?.addressLine1 || '',
        city: apiOrder.billingAddress?.city || '',
        state: apiOrder.billingAddress?.state || '',
        zipCode: apiOrder.billingAddress?.postalCode || '',
        country: apiOrder.billingAddress?.country || '',
      },
      notes: apiOrder.notes,
      trackingNumber: undefined,
      createdAt: apiOrder.createdAt,
      updatedAt: apiOrder.updatedAt,
    };

    return convertedOrder;
  }, []);

  // Initialize orders only after authentication is established
  React.useEffect(() => {
    // Don't initialize if auth is still loading
    if (authLoading) {
      return;
    }

    const initializeOrders = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // If user is not authenticated, don't try to fetch from API
        if (!isAuthenticated) {
          setOrders([]);
          setError('Authentication required. Please log in to view orders.');
          return;
        }

        const apiOrders = await orderApi.getAll();
        
        // Validate API response
        if (!apiOrders || !Array.isArray(apiOrders.data)) {
          throw new Error('Invalid API response format');
        }
        
        const convertedOrders = apiOrders.data.map((order, index) => {
          try {
            return convertApiOrder(order);
          } catch (convertError) {
            console.error(`Error converting order at index ${index}:`, convertError);
            // Return a fallback order if conversion fails
            return {
              id: `fallback-${Date.now()}-${index}`,
              orderNumber: `ORD-ERROR-${index}`,
              customer: { id: '', firstName: 'Unknown', lastName: 'Customer', email: '', phone: '', avatar: undefined },
              items: [],
              subtotal: 0,
              tax: 0,
              shipping: 0,
              discount: 0,
              total: 0,
              status: 'Pending' as const,
              paymentStatus: 'Pending' as const,
              paymentMethod: 'Unknown',
              orderDate: new Date().toISOString(),
              shippingAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
              billingAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
              notes: 'Error loading order data',
              trackingNumber: undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
        });
        
        setOrders(convertedOrders);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load orders';
        console.error('Error initializing orders:', err);
        
        // Check if it's an authentication error
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid token')) {
          setError('Authentication required. Please log in again.');
          setOrders([]);
        } else {
          // If API is not available and user is authenticated, show empty state instead of fallback data
          setError('Unable to load orders. Please check your connection and try again.');
          setOrders([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeOrders();
  }, [isAuthenticated, authLoading, convertApiOrder]); // Depend on auth state

  // Order operations
  const addOrder = useCallback(async (orderData: OrderFormData): Promise<Order> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API request timeout after 5 seconds')), 5000)
      );
      
      let apiOrder;
      try {
        // Try to call the real API with timeout
        apiOrder = await Promise.race([
          orderApi.create(orderData),
          timeoutPromise
        ]) as any;
      } catch (apiError) {
        // Fallback: create order locally if API fails
        apiOrder = {
          _id: Date.now().toString(),
          id: Date.now().toString(),
          orderNumber: `ORD-${Date.now()}`,
          ...orderData,
          customer: {
            id: orderData.customerId,
            firstName: 'Unknown',
            lastName: 'Customer',
            email: 'unknown@example.com',
          },
          subtotal: orderData.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0),
          tax: 0,
          shipping: 0,
          total: orderData.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0),
          status: 'Pending',
          paymentStatus: 'Pending',
          paymentMethod: orderData.paymentMethod,
          orderDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
      }
      
      const newOrder = convertApiOrder(apiOrder);
      setOrders(prev => [...prev, newOrder]);
      return newOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [convertApiOrder]);

  const updateOrder = useCallback(async (id: string, orderData: Partial<OrderUpdateData>): Promise<Order> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if this is a fallback order (starts with 'fallback-')
      const isFallbackOrder = id.startsWith('fallback-');
      
      if (isFallbackOrder) {
        // For fallback orders, update locally only
        const existingOrder = orders.find(o => o.id === id);
        if (!existingOrder) {
          throw new Error('Order not found');
        }
        
        const updatedOrder = {
          ...existingOrder,
          ...orderData,
          updatedAt: new Date().toISOString()
        };
        
        setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
        return updatedOrder;
      } else {
        // For real API orders, call the API
        const updatedOrder = await orderApi.update(id, orderData);
        
        setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
        return updatedOrder;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [convertApiOrder, orders]);

  const deleteOrder = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if this is a fallback order (starts with 'fallback-')
      const isFallbackOrder = id.startsWith('fallback-');
      
      if (isFallbackOrder) {
        // For fallback orders, delete locally only
        setOrders(prev => prev.filter(o => o.id !== id));
      } else {
        // For real API orders, call the API
        await orderApi.delete(id);
        setOrders(prev => prev.filter(o => o.id !== id));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOrderById = useCallback((id: string): Order | undefined => {
    return orders.find(order => order.id === id);
  }, [orders]);

  const refreshOrders = useCallback(async (filters?: OrderFilters): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiOrders = await orderApi.getAll(filters);
      const convertedOrders = apiOrders.data.map(convertApiOrder);
      setOrders(convertedOrders);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh orders';
      
      // Check if it's an authentication error
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid token')) {
        setError('Authentication required. Please log in again.');
      } else {
        // Check for various API not found error patterns
        const isApiNotFound = 
          errorMessage.includes('not found') || 
          errorMessage.includes('404') || 
          errorMessage.includes('Route /orders not found') ||
          errorMessage.includes('API request failed') ||
          (err as any)?.status === 404;
        
        if (isApiNotFound) {
          const fallbackOrders = generateFallbackOrders();
          setOrders(fallbackOrders);
          setError(null); // Clear error since we have fallback data
        } else {
          setError(errorMessage);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [convertApiOrder]);

  // Filtered orders based on search, status, payment status, date range, and amount range
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter
      const matchesSearch = `${order.orderNumber} ${order.customer?.firstName || ''} ${order.customer?.lastName || ''} ${order.customer?.email || ''} ${order.status} ${order.paymentStatus} ${order.total}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      // Payment status filter
      const matchesPaymentStatus = paymentStatusFilter === 'all' || order.paymentStatus === paymentStatusFilter;
      
      // Date range filter
      let matchesDateRange = true;
      if (dateRange.start || dateRange.end) {
        const orderDate = new Date(order.orderDate);
        if (dateRange.start) {
          const startDate = new Date(dateRange.start);
          matchesDateRange = matchesDateRange && orderDate >= startDate;
        }
        if (dateRange.end) {
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999); // Include the entire end date
          matchesDateRange = matchesDateRange && orderDate <= endDate;
        }
      }
      
      // Amount range filter
      let matchesAmountRange = true;
      if (amountRange.min || amountRange.max) {
        const orderTotal = order.total;
        if (amountRange.min) {
          const minAmount = parseFloat(amountRange.min);
          matchesAmountRange = matchesAmountRange && orderTotal >= minAmount;
        }
        if (amountRange.max) {
          const maxAmount = parseFloat(amountRange.max);
          matchesAmountRange = matchesAmountRange && orderTotal <= maxAmount;
        }
      }
      
      return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDateRange && matchesAmountRange;
    }).sort((a, b) => {
      let aValue: any = a[sortBy as keyof Order];
      let bValue: any = b[sortBy as keyof Order];
      
      // Handle nested properties
      if (sortBy === 'customerName') {
        aValue = `${a.customer?.firstName || ''} ${a.customer?.lastName || ''}`;
        bValue = `${b.customer?.firstName || ''} ${b.customer?.lastName || ''}`;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [orders, searchTerm, statusFilter, paymentStatusFilter, dateRange, amountRange, sortBy, sortOrder]);

  // Statistics functions
  const getTotalOrders = useCallback((): number => {
    return orders.length;
  }, [orders]);

  const getTotalRevenue = useCallback((): number => {
    return orders.reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const getTotalSubtotal = useCallback((): number => {
    return orders.reduce((sum, o) => sum + o.subtotal, 0);
  }, [orders]);

  const getOrdersByStatus = useCallback((status: Order['status']): number => {
    return orders.filter(o => o.status === status).length;
  }, [orders]);

  const getOrdersByPaymentStatus = useCallback((paymentStatus: Order['paymentStatus']): number => {
    return orders.filter(o => o.paymentStatus === paymentStatus).length;
  }, [orders]);

  const value: OrderContextType = {
    orders,
    setOrders,
    isLoading,
    setIsLoading,
    error,
    setError,
    addOrder,
    updateOrder,
    deleteOrder,
    getOrderById,
    refreshOrders,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    dateRange,
    setDateRange,
    amountRange,
    setAmountRange,
    filteredOrders,
    getTotalOrders,
    getTotalRevenue,
    getTotalSubtotal,
    getOrdersByStatus,
    getOrdersByPaymentStatus,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    isAuthenticated: () => isAuthenticated,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
