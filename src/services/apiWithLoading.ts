import React from 'react';
import { useLoading } from '../context/LoadingContext';
import { useDataFetching } from '../hooks/useDataFetching';
import apiRequest, { ApiResponse } from './api';

// Enhanced API service with loading integration
export class ApiServiceWithLoading {
  private static instance: ApiServiceWithLoading;
  private loadingContext: any = null;

  static getInstance(): ApiServiceWithLoading {
    if (!ApiServiceWithLoading.instance) {
      ApiServiceWithLoading.instance = new ApiServiceWithLoading();
    }
    return ApiServiceWithLoading.instance;
  }

  setLoadingContext(context: any) {
    this.loadingContext = context;
  }

  private async withLoading<T>(
    apiCall: () => Promise<T>,
    message?: string
  ): Promise<T> {
    if (this.loadingContext) {
      this.loadingContext.showLoading(message);
    }

    try {
      const result = await apiCall();
      return result;
    } finally {
      if (this.loadingContext) {
        this.loadingContext.hideLoading();
      }
    }
  }

  // Generic API methods with loading
  async get<T>(endpoint: string, message?: string): Promise<T> {
    return this.withLoading(
      () => apiRequest<T>(endpoint),
      message || 'Loading data...'
    );
  }

  async post<T>(endpoint: string, data: any, message?: string): Promise<T> {
    return this.withLoading(
      () => apiRequest<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
      message || 'Saving data...'
    );
  }

  async put<T>(endpoint: string, data: any, message?: string): Promise<T> {
    return this.withLoading(
      () => apiRequest<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
      message || 'Updating data...'
    );
  }

  async delete<T>(endpoint: string, message?: string): Promise<T> {
    return this.withLoading(
      () => apiRequest<T>(endpoint, {
        method: 'DELETE',
      }),
      message || 'Deleting data...'
    );
  }

  async patch<T>(endpoint: string, data: any, message?: string): Promise<T> {
    return this.withLoading(
      () => apiRequest<T>(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
      message || 'Updating data...'
    );
  }
}

// Hook for using API with loading
export function useApiWithLoading() {
  const loadingContext = useLoading();
  const apiService = ApiServiceWithLoading.getInstance();
  
  // Set the loading context for the API service
  React.useEffect(() => {
    apiService.setLoadingContext(loadingContext);
  }, [loadingContext]);

  return apiService;
}

// Hook for data fetching with loading integration
export function useApiDataWithLoading<T>(
  apiCall: () => Promise<T>,
  options: {
    message?: string;
    immediate?: boolean;
    retryCount?: number;
    retryDelay?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    dependencies?: any[];
  } = {}
) {
  const { message, ...fetchOptions } = options;
  const loadingContext = useLoading();

  const fetchWithLoading = React.useCallback(async (): Promise<T> => {
    loadingContext.showLoading(message);
    try {
      const result = await apiCall();
      return result;
    } finally {
      loadingContext.hideLoading();
    }
  }, [apiCall, message, loadingContext]);

  return useDataFetching(fetchWithLoading, fetchOptions);
}

// Specialized hooks for common operations
export function useCategoriesWithLoading() {
  const apiService = useApiWithLoading();
  
  const getCategories = React.useCallback(async () => {
    return apiService.get<any[]>('/categories', 'Loading categories...');
  }, [apiService]);

  const createCategory = React.useCallback(async (category: any) => {
    return apiService.post<any>('/categories', category, 'Creating category...');
  }, [apiService]);

  const updateCategory = React.useCallback(async (id: string, category: any) => {
    return apiService.put<any>(`/categories/${id}`, category, 'Updating category...');
  }, [apiService]);

  const deleteCategory = React.useCallback(async (id: string) => {
    return apiService.delete<ApiResponse>(`/categories/${id}`, 'Deleting category...');
  }, [apiService]);

  return {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
}

export function useProductsWithLoading() {
  const apiService = useApiWithLoading();
  
  const getProducts = React.useCallback(async () => {
    return apiService.get<any[]>('/products', 'Loading products...');
  }, [apiService]);

  const createProduct = React.useCallback(async (product: any) => {
    return apiService.post<any>('/products', product, 'Creating product...');
  }, [apiService]);

  const updateProduct = React.useCallback(async (id: string, product: any) => {
    return apiService.put<any>(`/products/${id}`, product, 'Updating product...');
  }, [apiService]);

  const deleteProduct = React.useCallback(async (id: string) => {
    return apiService.delete<ApiResponse>(`/products/${id}`, 'Deleting product...');
  }, [apiService]);

  return {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
}

// Export the singleton instance
export const apiServiceWithLoading = ApiServiceWithLoading.getInstance(); 