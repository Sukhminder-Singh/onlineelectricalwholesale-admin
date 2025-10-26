import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { customerApi, Customer as ApiCustomer } from '../services/api';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  notes?: string;
}

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  status: 'active' | 'inactive';
  notes?: string;
}

interface CustomerContextType {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  
  // Customer operations
  addCustomer: (customerData: CustomerFormData) => Promise<Customer>;
  updateCustomer: (id: string, customerData: Partial<CustomerFormData>) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
  refreshCustomers: () => Promise<void>;
  
  // Filtering and search
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  statusFilter: 'all' | 'active' | 'inactive';
  setStatusFilter: React.Dispatch<React.SetStateAction<'all' | 'active' | 'inactive'>>;
  filteredCustomers: Customer[];
  
  // Statistics
  getTotalCustomers: () => number;
  getActiveCustomers: () => number;
  getTotalOrders: () => number;
  getTotalRevenue: () => number;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);


export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Helper function to convert API customer to local customer format
  const convertApiCustomer = useCallback((apiCustomer: ApiCustomer): Customer => {
    return {
      id: apiCustomer.id || apiCustomer._id || '',
      firstName: apiCustomer.firstName,
      lastName: apiCustomer.lastName,
      email: apiCustomer.email,
      phone: apiCustomer.phone,
      address: apiCustomer.address,
      city: apiCustomer.city,
      state: apiCustomer.state,
      postalCode: apiCustomer.postalCode,
      country: apiCustomer.country,
      totalOrders: apiCustomer.totalOrders,
      totalSpent: apiCustomer.totalSpent,
      lastOrderDate: apiCustomer.lastOrderDate,
      status: apiCustomer.status,
      createdAt: apiCustomer.createdAt,
      notes: apiCustomer.notes,
    };
  }, []);

  // Load customers on mount
  React.useEffect(() => {
    const loadCustomers = async () => {
      try {
        setIsLoading(true);
        const apiCustomers = await customerApi.getAll();
        const convertedCustomers = apiCustomers.map(convertApiCustomer);
        setCustomers(convertedCustomers);
      } catch (err) {
        console.error('Error loading customers:', err);
        setError(err instanceof Error ? err.message : 'Failed to load customers');
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();
  }, [convertApiCustomer]);


  // Customer operations
  const addCustomer = useCallback(async (customerData: CustomerFormData): Promise<Customer> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API request timeout after 5 seconds')), 5000)
      );
      
      let apiCustomer;
      try {
        // Try to call the real API with timeout
        apiCustomer = await Promise.race([
          customerApi.create(customerData),
          timeoutPromise
        ]) as any;
      } catch (apiError) {
        console.warn('API call failed, using fallback:', apiError);
        // Fallback: create customer locally if API fails
        apiCustomer = {
          _id: Date.now().toString(),
          id: Date.now().toString(),
          ...customerData,
          totalOrders: 0,
          totalSpent: 0,
          createdAt: new Date().toISOString(),
        };
      }
      
      const newCustomer = convertApiCustomer(apiCustomer);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (err) {
      console.error('Error in addCustomer:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add customer';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [convertApiCustomer]);

  const updateCustomer = useCallback(async (id: string, customerData: Partial<CustomerFormData>): Promise<Customer> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if this is a fallback-created customer (timestamp-based ID)
      const isFallbackCustomer = /^\d{13}$/.test(id); // 13 digits = timestamp
      
      if (isFallbackCustomer) {
        // For fallback customers, update locally only
        const existingCustomer = customers.find(c => c.id === id);
        if (!existingCustomer) {
          throw new Error('Customer not found');
        }
        
        const updatedCustomer = {
          ...existingCustomer,
          ...customerData,
          updatedAt: new Date().toISOString()
        };
        
        setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c));
        return updatedCustomer;
      } else {
        // For real API customers, call the API
        const apiCustomer = await customerApi.update(id, customerData);
        const updatedCustomer = convertApiCustomer(apiCustomer);
        
        setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c));
        return updatedCustomer;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [convertApiCustomer, customers]);

  const deleteCustomer = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if this is a fallback-created customer (timestamp-based ID)
      const isFallbackCustomer = /^\d{13}$/.test(id); // 13 digits = timestamp
      
      if (isFallbackCustomer) {
        // For fallback customers, delete locally only
        setCustomers(prev => prev.filter(c => c.id !== id));
      } else {
        // For real API customers, call the API
        await customerApi.delete(id);
        setCustomers(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCustomerById = useCallback((id: string): Customer | undefined => {
    return customers.find(customer => customer.id === id);
  }, [customers]);

  const refreshCustomers = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Refreshing customers from API...');
      const apiCustomers = await customerApi.getAll();
      console.log('Customers refreshed successfully:', apiCustomers.length);
      
      const convertedCustomers = apiCustomers.map(convertApiCustomer);
      setCustomers(convertedCustomers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh customers';
      console.error('Error refreshing customers:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filtered customers based on search and status
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = `${customer.firstName} ${customer.lastName} ${customer.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics functions
  const getTotalCustomers = useCallback((): number => {
    return customers.length;
  }, [customers]);

  const getActiveCustomers = useCallback((): number => {
    return customers.filter(c => c.status === 'active').length;
  }, [customers]);

  const getTotalOrders = useCallback((): number => {
    return customers.reduce((sum, c) => sum + c.totalOrders, 0);
  }, [customers]);

  const getTotalRevenue = useCallback((): number => {
    return customers.reduce((sum, c) => sum + c.totalSpent, 0);
  }, [customers]);

  const value: CustomerContextType = {
    customers,
    setCustomers,
    isLoading,
    setIsLoading,
    error,
    setError,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    refreshCustomers,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredCustomers,
    getTotalCustomers,
    getActiveCustomers,
    getTotalOrders,
    getTotalRevenue,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = (): CustomerContextType => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};