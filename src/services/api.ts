// Using browser-native HeadersInit type compatible with fetch API
type HeadersInit = Headers | [string, string][] | Record<string, string>;

// API Base Configuration
// Use the same proxy configuration as auth.ts for consistency
const API_BASE_URL = '/api';

// Common headers for API requests
const getHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    // Add authentication token if available
    const token = localStorage.getItem('authToken');
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
};

// Generic API request function
const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
        headers: getHeaders(),
        ...options,
    };

    try {
        const response = await fetch(url, config);
        
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: `HTTP error! status: ${response.status}` };
            }
            
            // Handle specific error cases
            if (response.status === 400 && errorData.message?.includes('Invalid resource ID format')) {
            }
            
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // Handle empty responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            return data;
        }
        
        return {} as T;
    } catch (error) {
        throw error;
    }
};

// Category Types
export interface Category {
    id: string;
    _id?: string; // MongoDB ObjectId
    name: string;
    description?: string;
    parent?: string | { _id: string; name: string; id?: string } | null;
    image?: string;
    slug?: string;
    isActive?: boolean;
    order?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CategoryNode {
    key: string;
    label: string;
    data?: {
        image?: string;
        description?: string;
        slug?: string;
        [key: string]: any;
    };
    isActive: boolean;
    children?: CategoryNode[];
    parent?: CategoryNode | null;
}

export interface CategoryOrderUpdate {
    categories: Array<{
        id: string;
        order: number;
    }>;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

// Category API Functions
export const categoryApi = {
    // Get all categories
    getAll: async (): Promise<Category[]> => {
        const response = await apiRequest<{ success: boolean; data: Category[]; count: number }>('/categories');
        return response.data || [];
    },

    // Get category by ID
    getById: async (id: string): Promise<Category> => {
        const response = await apiRequest<{ success: boolean; data: Category }>(`/categories/${id}`);
        return response.data;
    },

    // Create new category with JSON data
    create: async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
        const response = await apiRequest<{ success: boolean; data: Category }>('/categories', {
            method: 'POST',
            body: JSON.stringify(category),
        });
        return response.data;
    },

    // Create new category with FormData (for file uploads)
    createWithFormData: async (formData: FormData): Promise<Category> => {
        const token = localStorage.getItem('authToken');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers,
            body: formData,
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result.data;
    },

    // Update category
    update: async (id: string, category: Partial<Category>): Promise<Category> => {
        const response = await apiRequest<{ success: boolean; data: Category }>(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(category),
        });
        return response.data;
    },

    // Delete category
    delete: async (id: string): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>(`/categories/${id}`, {
            method: 'DELETE',
        });
    },

    // Update category order
    updateOrder: async (orderData: CategoryOrderUpdate): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>('/categories/order', {
            method: 'PUT',
            body: JSON.stringify(orderData),
        });
    },

    // Bulk update categories
    bulkUpdate: async (categories: Category[]): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>('/categories/bulk', {
            method: 'PUT',
            body: JSON.stringify({ categories }),
        });
    },

    // Toggle category status
    toggleStatus: async (id: string, isActive: boolean): Promise<Category> => {
        const response = await apiRequest<{ success: boolean; data: Category }>(`/categories/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ isActive }),
        });
        return response.data;
    },
};

// Product Types
export interface ProductDimensions {
    length: number;
    width: number;
    height: number;
}

export interface ProductAttribute {
    id: string;
    value: string;
}

export interface QuantityLevel {
    level: number;
    minQuantity: string;
    maxQuantity: string;
    price: string;
    discount: string;
}

export interface ProductParcel {
    width: string;
    height: string;
    length: string;
    weight: string;
}

export interface AdditionalField {
    label: string;
    type: 'text' | 'number' | 'select' | 'textarea';
    value: string;
}

export interface ProductMeta {
    title: string;
    description: string;
    keywords: string;
}

export interface Product {
    _id?: string;
    productName: string;
    seller: string;
    sku: string;
    categories: string[];
    brandId: string;
    price: number;
    comparePrice?: number;
    costPrice?: number;
    stock: number;
    lowStockThreshold?: number;
    trackQuantity?: boolean;
    taxRate: number;
    guaranteePeriod: string;
    isReturnable: boolean;
    isCancelable: boolean;
    shortDescription: string;
    longDescription?: string;
    status: 'active' | 'inactive' | 'draft';
    isPublished: boolean;
    weight?: number;
    dimensions?: ProductDimensions;
    attributes: ProductAttribute[];
    quantityLevels: QuantityLevel[];
    parcel: ProductParcel;
    additionalFields: AdditionalField[];
    meta: ProductMeta;
    image360Url?: string;
    
    // Image fields
    mainImage?: string;
    otherImages?: string[];
    
    // Featured product properties
    isFeatured?: boolean;
    featuredOrder?: number;
    featuredAt?: string;
    
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductCreatePayload {
    productName: string;
    seller: string;
    sku: string;
    categories: string[];
    brandId: string;
    price: number;
    comparePrice?: number;
    costPrice?: number;
    stock: number;
    lowStockThreshold?: number;
    trackQuantity: boolean;
    taxRate: number;
    guaranteePeriod: string;
    isReturnable: boolean;
    isCancelable: boolean;
    shortDescription: string;
    longDescription?: string;
    status: 'active' | 'inactive' | 'draft';
    isPublished: boolean;
    weight?: number;
    dimensions?: ProductDimensions;
    attributes: ProductAttribute[];
    quantityLevels: QuantityLevel[];
    parcel: ProductParcel;
    additionalFields: AdditionalField[];
    meta: ProductMeta;
    image360Url?: string;
}

export interface ProductApiResponse {
    success: boolean;
    message: string;
    data: Product;
}

export interface ProductListResponse {
    success: boolean;
    data: Product[];
    total: number;
    page: number;
    limit: number;
}

export interface ProductFilters {
    search?: string;
    category?: string;
    brand?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

// Product API Functions
export const productApi = {
    // Get all products with filters
    getAll: async (filters?: ProductFilters): Promise<ProductListResponse> => {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });
        }
        
        const endpoint = queryParams.toString() ? `/products?${queryParams.toString()}` : '/products';
        const response = await apiRequest<ProductListResponse>(endpoint);
        return response;
    },

    // Admin: Get all products with full management visibility
    getAllAdmin: async (
        filters?: ProductFilters & {
            includeDeleted?: boolean;
            deletedOnly?: boolean;
            isPublished?: boolean;
            stockStatus?: string;
        }
    ): Promise<ProductListResponse> => {
        const queryParams = new URLSearchParams();
        // Map frontend filter keys to backend expectations
        const mapped: Record<string, any> = { ...(filters || {}) };
        if (mapped.category) {
            mapped.categories = mapped.category;
            delete mapped.category;
        }
        if (mapped.brand) {
            mapped.brandId = mapped.brand;
            delete mapped.brand;
        }

        const params = {
            status: 'all',
            includeDeleted: true,
            ...mapped
        } as Record<string, any>;

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, String(value));
            }
        });

        const endpoint = `/products/admin?${queryParams.toString()}`;
        const res = await apiRequest<{
            success: boolean;
            message: string;
            data: Product[];
            meta?: { pagination?: { currentPage: number; totalPages: number; totalItems: number; itemsPerPage: number } };
        }>(endpoint);

        const pagination = res.meta?.pagination;
        return {
            success: res.success,
            data: res.data,
            total: pagination?.totalItems ?? res.data?.length ?? 0,
            page: pagination?.currentPage ?? 1,
            limit: pagination?.itemsPerPage ?? (res.data?.length ?? 0),
        };
    },

    // Get product by ID
    getById: async (id: string): Promise<Product> => {
        const response = await apiRequest<ProductApiResponse>(`/products/${id}`);
        return response.data;
    },

    // Create new product (with FormData for file upload)
    create: async (formData: FormData): Promise<Product> => {
        // Do not set Content-Type header for FormData; browser will set it
        const token = localStorage.getItem('authToken');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const url = `${API_BASE_URL}/products`;
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return result.data || result;
    },

    // Update product
    update: async (id: string, formData: FormData): Promise<Product> => {
        const token = localStorage.getItem('authToken');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const url = `${API_BASE_URL}/products/${id}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: formData,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return result.data || result;
    },

    // Update product status
    updateStatus: async (id: string, status: 'active' | 'inactive' | 'draft'): Promise<Product> => {
        const response = await apiRequest<ProductApiResponse>(`/products/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
        return response.data;
    },

    // Update product stock (admin)
    updateStock: async (id: string, quantity: number): Promise<Product> => {
        const response = await apiRequest<ProductApiResponse>(`/products/${id}/stock`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity }),
        });
        return response.data;
    },

    // Toggle product published status
    togglePublished: async (id: string, isPublished: boolean): Promise<Product> => {
        const response = await apiRequest<ProductApiResponse>(`/products/${id}/publish`, {
            method: 'PATCH',
            body: JSON.stringify({ isPublished }),
        });
        return response.data;
    },

    // Delete product
    delete: async (id: string): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>(`/products/${id}`, {
            method: 'DELETE',
        });
    },

    // Bulk update products
    bulkUpdate: async (updates: Array<{ id: string; data: Partial<Product> }>): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>('/products/bulk', {
            method: 'PUT',
            body: JSON.stringify({ updates }),
        });
    },

    // Bulk delete products
    bulkDelete: async (productIds: string[]): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>('/products/bulk-delete', {
            method: 'DELETE',
            body: JSON.stringify({ productIds }),
        });
    },

    // Search products
    search: async (query: string, filters?: ProductFilters): Promise<ProductListResponse> => {
        const queryParams = new URLSearchParams();
        queryParams.append('search', query);
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });
        }
        
        const response = await apiRequest<ProductListResponse>(`/products/search?${queryParams.toString()}`);
        return response;
    },

    // Get product statistics
    getStats: async (): Promise<{
        total: number;
        active: number;
        inactive: number;
        draft: number;
        published: number;
        outOfStock: number;
        lowStock: number;
        totalValue: number;
    }> => {
        const response = await apiRequest<{ success: boolean; data: any }>('/products/stats');
        return response.data;
    },

    // Duplicate product
    duplicate: async (id: string): Promise<Product> => {
        const response = await apiRequest<ProductApiResponse>(`/products/${id}/duplicate`, {
            method: 'POST',
        });
        return response.data;
    },

    // Export products
    export: async (filters?: ProductFilters, format: 'excel' | 'csv' = 'excel'): Promise<{ url: string; filename: string }> => {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });
        }
        queryParams.append('format', format);
        
        const response = await apiRequest<{ success: boolean; data: { url: string; filename: string } }>(`/products/export?${queryParams.toString()}`);
        return response.data;
    },

    // Featured Products API
    // Get all featured products for admin management
    getFeatured: async (): Promise<ProductListResponse> => {
        try {
            const response = await apiRequest<ProductListResponse>('/products/admin/featured');
            return response;
        } catch (error) {
            // Fallback: If the featured endpoint doesn't exist, use the regular products API with filter
            console.warn('Featured products endpoint not available, using fallback with filter');
            const response = await apiRequest<{
                success: boolean;
                message: string;
                data: Product[];
                meta?: { pagination?: { currentPage: number; totalPages: number; totalItems: number; itemsPerPage: number } };
            }>('/products/admin?isFeatured=true&limit=100');
            
            const pagination = response.meta?.pagination;
            return {
                success: response.success,
                data: response.data,
                total: pagination?.totalItems ?? response.data?.length ?? 0,
                page: pagination?.currentPage ?? 1,
                limit: pagination?.itemsPerPage ?? (response.data?.length ?? 0),
            };
        }
    },

    // Set product as featured
    setFeatured: async (id: string): Promise<Product> => {
        const response = await apiRequest<ProductApiResponse>(`/products/${id}/feature`, {
            method: 'PATCH',
        });
        return response.data;
    },

    // Remove product from featured
    unsetFeatured: async (id: string): Promise<Product> => {
        const response = await apiRequest<ProductApiResponse>(`/products/${id}/unfeature`, {
            method: 'PATCH',
        });
        return response.data;
    },

    // Update featured order
    updateFeaturedOrder: async (id: string, order: number): Promise<Product> => {
        const response = await apiRequest<ProductApiResponse>(`/products/${id}/feature-order`, {
            method: 'PATCH',
            body: JSON.stringify({ order }),
        });
        return response.data;
    },
};

// Attribute Types
export interface Attribute {
    _id: string;
    name: string;
    type: 'text' | 'number' | 'select';
    options?: string[];
    isRequired?: boolean;
    isActive?: boolean;
    description?: string;
    order?: number;
    validation?: {
        minLength?: number;
        maxLength?: number;
        minValue?: number;
        maxValue?: number;
        pattern?: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

// Customer Types
export interface Customer {
    id: string;
    _id?: string; // MongoDB ObjectId
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
    updatedAt?: string;
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

export interface CustomerStats {
    totalCustomers: number;
    activeCustomers: number;
    totalOrders: number;
    totalRevenue: number;
    newCustomersThisMonth: number;
    averageOrderValue: number;
}

export interface AttributeOrderUpdate {
    attributes: Array<{
        id: string;
        order: number;
    }>;
}

export interface AttributeStats {
    total: number;
    active: number;
    inactive: number;
    byType: {
        text: number;
        number: number;
        select: number;
    };
}

// Attribute API Functions
export const attributeApi = {
    // Get all attributes
    getAll: async (params?: {
        isActive?: boolean;
        type?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<Attribute[]> => {
        const queryParams = new URLSearchParams();
        if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
        if (params?.type) queryParams.append('type', params.type);
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        
        const endpoint = queryParams.toString() ? `/attributes?${queryParams.toString()}` : '/attributes';
        const response = await apiRequest<{ success: boolean; data: Attribute[]; count: number }>(endpoint);
        return response.data || [];
    },

    // Get attribute by ID
    getById: async (id: string): Promise<Attribute> => {
        const response = await apiRequest<{ success: boolean; data: Attribute }>(`/attributes/${id}`);
        return response.data;
    },

    // Create new attribute
    create: async (attribute: Omit<Attribute, '_id' | 'createdAt' | 'updatedAt'>): Promise<Attribute> => {
        const response = await apiRequest<{ success: boolean; data: Attribute }>('/attributes', {
            method: 'POST',
            body: JSON.stringify(attribute),
        });
        return response.data;
    },

    // Update attribute
    update: async (id: string, attribute: Partial<Attribute>): Promise<Attribute> => {
        const response = await apiRequest<{ success: boolean; data: Attribute }>(`/attributes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(attribute),
        });
        return response.data;
    },

    // Delete attribute
    delete: async (id: string): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>(`/attributes/${id}`, {
            method: 'DELETE',
        });
    },

    // Toggle attribute status
    toggleStatus: async (id: string): Promise<Attribute> => {
        const response = await apiRequest<{ success: boolean; data: Attribute }>(`/attributes/${id}/status`, {
            method: 'PATCH',
        });
        return response.data;
    },

    // Update attribute order
    updateOrder: async (orderData: AttributeOrderUpdate): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>('/attributes/order/update', {
            method: 'PUT',
            body: JSON.stringify(orderData),
        });
    },

    // Bulk update attributes
    bulkUpdate: async (attributes: Attribute[]): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>('/attributes/bulk/update', {
            method: 'PUT',
            body: JSON.stringify({ attributes }),
        });
    },

    // Get attribute statistics
    getStats: async (): Promise<AttributeStats> => {
        try {
            // Use a query parameter instead of path parameter
            const response = await apiRequest<{ success: boolean; data: AttributeStats }>('/attributes?action=stats');
            
            if (!response || !response.success) {
                throw new Error('Failed to fetch attribute stats: Invalid response format');
            }
            
            return response.data;
        } catch (error) {
            // Return default stats on error
            return {
                total: 0,
                active: 0,
                inactive: 0,
                byType: {
                    text: 0,
                    number: 0,
                    select: 0
                }
            };
        }
    },
};

// Upload API Functions
export const uploadApi = {
    // Upload single image
    uploadImage: async (file: File): Promise<{ url: string; filename: string; originalName: string; size: number }> => {
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('authToken');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(`${API_BASE_URL}/upload/image`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Upload failed: ${response.status}`);
        }

        const result = await response.json();
        return result.data;
    },

    // Upload multiple images
    uploadImages: async (files: File[]): Promise<Array<{ url: string; filename: string; originalName: string; size: number }>> => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file);
        });

        const token = localStorage.getItem('authToken');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(`${API_BASE_URL}/upload/images`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Upload failed: ${response.status}`);
        }

        const result = await response.json();
        return result.data;
    },
};

// Quote Request Types
export interface QuoteCustomer {
    id: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
    avatar?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}

export interface QuoteItem {
    id: string;
    productId: string;
    productName: string;
    sku: string;
    description?: string;
    image: string;
    quantity: number;
    requestedPrice?: number;
    suggestedPrice?: number;
    unitPrice?: number;
    totalPrice?: number;
    category?: string;
    specifications?: Record<string, any>;
}

export interface QuoteRequest {
    id: string;
    _id?: string; // MongoDB ObjectId
    quoteNumber: string;
    customer: QuoteCustomer;
    items: QuoteItem[];
    totalItems: number;
    estimatedValue?: number;
    finalQuoteValue?: number;
    status: "Pending" | "Under Review" | "Quoted" | "Accepted" | "Rejected" | "Expired" | "Draft";
    priority: "Low" | "Medium" | "High" | "Urgent";
    requestDate: string;
    expiryDate?: string;
    notes?: string;
    message?: string;
    attachments?: QuoteAttachment[];
    assignedTo?: string;
    lastUpdated?: string;
    createdAt: string;
    updatedAt?: string;
    terms?: string;
    deliveryTerms?: string;
    paymentTerms?: string;
    validUntil?: string;
    discount?: {
        type: 'percentage' | 'fixed';
        value: number;
    };
    tax?: {
        rate: number;
        amount: number;
    };
    shipping?: {
        method: string;
        cost: number;
    };
    currency: string;
}

export interface QuoteAttachment {
    id: string;
    filename: string;
    originalName: string;
    url: string;
    size: number;
    type: string;
    uploadedAt: string;
}

export interface QuoteUpdateData {
    status?: QuoteRequest['status'];
    priority?: QuoteRequest['priority'];
    finalQuoteValue?: number;
    notes?: string;
    expiryDate?: string;
    items?: Partial<QuoteItem>[];
    terms?: string;
    deliveryTerms?: string;
    paymentTerms?: string;
    discount?: QuoteRequest['discount'];
    tax?: QuoteRequest['tax'];
    shipping?: QuoteRequest['shipping'];
}

export interface QuoteCreateData {
    customerId: string;
    items: Omit<QuoteItem, 'id'>[];
    message?: string;
    priority?: QuoteRequest['priority'];
    expiryDate?: string;
    currency?: string;
}

export interface QuoteSendUpdateData {
    quoteId: string;
    recipient: string;
    subject: string;
    message: string;
    includeQuoteDetails: boolean;
    sendSMS: boolean;
    attachments?: string[];
    templateType?: 'status_update' | 'quote_ready' | 'custom';
}

export interface QuoteStats {
    total: number;
    pending: number;
    underReview: number;
    quoted: number;
    accepted: number;
    rejected: number;
    expired: number;
    totalValue: number;
    averageValue: number;
    conversionRate: number;
}

export interface QuoteFilters {
    status?: string;
    priority?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    minValue?: number;
    maxValue?: number;
    assignedTo?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface QuoteListResponse {
    quotes: QuoteRequest[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats: QuoteStats;
}

// Quote API Functions
export const quoteApi = {
    // Get all quote requests with filters
    getAll: async (filters?: QuoteFilters): Promise<QuoteListResponse> => {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });
        }
        
        const endpoint = queryParams.toString() ? `/quotes?${queryParams.toString()}` : '/quotes';
        const response = await apiRequest<{ success: boolean; data: QuoteListResponse }>(endpoint);
        return response.data;
    },

    // Get quote request by ID
    getById: async (id: string): Promise<QuoteRequest> => {
        const response = await apiRequest<{ success: boolean; data: QuoteRequest }>(`/quotes/${id}`);
        return response.data;
    },

    // Create new quote request
    create: async (quoteData: QuoteCreateData): Promise<QuoteRequest> => {
        const response = await apiRequest<{ success: boolean; data: QuoteRequest }>('/quotes', {
            method: 'POST',
            body: JSON.stringify(quoteData),
        });
        return response.data;
    },

    // Update quote request
    update: async (id: string, updateData: QuoteUpdateData): Promise<QuoteRequest> => {
        const response = await apiRequest<{ success: boolean; data: QuoteRequest }>(`/quotes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
        return response.data;
    },

    // Update quote status
    updateStatus: async (id: string, status: QuoteRequest['status'], notes?: string): Promise<QuoteRequest> => {
        const response = await apiRequest<{ success: boolean; data: QuoteRequest }>(`/quotes/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status, notes }),
        });
        return response.data;
    },

    // Update quote priority
    updatePriority: async (id: string, priority: QuoteRequest['priority']): Promise<QuoteRequest> => {
        const response = await apiRequest<{ success: boolean; data: QuoteRequest }>(`/quotes/${id}/priority`, {
            method: 'PATCH',
            body: JSON.stringify({ priority }),
        });
        return response.data;
    },

    // Delete quote request
    delete: async (id: string): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>(`/quotes/${id}`, {
            method: 'DELETE',
        });
    },

    // Send quote update notification
    sendUpdate: async (updateData: QuoteSendUpdateData): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>('/quotes/send-update', {
            method: 'POST',
            body: JSON.stringify(updateData),
        });
    },

    // Generate quote PDF
    generatePDF: async (id: string): Promise<{ url: string; filename: string }> => {
        const response = await apiRequest<{ success: boolean; data: { url: string; filename: string } }>(`/quotes/${id}/pdf`, {
            method: 'POST',
        });
        return response.data;
    },

    // Export quotes to Excel/CSV
    export: async (filters?: QuoteFilters, format: 'excel' | 'csv' = 'excel'): Promise<{ url: string; filename: string }> => {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });
        }
        queryParams.append('format', format);
        
        const response = await apiRequest<{ success: boolean; data: { url: string; filename: string } }>(`/quotes/export?${queryParams.toString()}`);
        return response.data;
    },

    // Get quote statistics
    getStats: async (filters?: { dateFrom?: string; dateTo?: string }): Promise<QuoteStats> => {
        const queryParams = new URLSearchParams();
        if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
        if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
        
        const endpoint = queryParams.toString() ? `/quotes/stats?${queryParams.toString()}` : '/quotes/stats';
        const response = await apiRequest<{ success: boolean; data: QuoteStats }>(endpoint);
        return response.data;
    },

    // Duplicate quote request
    duplicate: async (id: string, customerId?: string): Promise<QuoteRequest> => {
        const response = await apiRequest<{ success: boolean; data: QuoteRequest }>(`/quotes/${id}/duplicate`, {
            method: 'POST',
            body: JSON.stringify({ customerId }),
        });
        return response.data;
    },

    // Convert quote to order
    convertToOrder: async (id: string, orderData?: any): Promise<{ orderId: string; orderNumber: string }> => {
        const response = await apiRequest<{ success: boolean; data: { orderId: string; orderNumber: string } }>(`/quotes/${id}/convert-to-order`, {
            method: 'POST',
            body: JSON.stringify(orderData || {}),
        });
        return response.data;
    },

    // Add item to quote
    addItem: async (quoteId: string, item: Omit<QuoteItem, 'id'>): Promise<QuoteRequest> => {
        const response = await apiRequest<{ success: boolean; data: QuoteRequest }>(`/quotes/${quoteId}/items`, {
            method: 'POST',
            body: JSON.stringify(item),
        });
        return response.data;
    },

    // Update item in quote
    updateItem: async (quoteId: string, itemId: string, itemData: Partial<QuoteItem>): Promise<QuoteRequest> => {
        const response = await apiRequest<{ success: boolean; data: QuoteRequest }>(`/quotes/${quoteId}/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify(itemData),
        });
        return response.data;
    },

    // Remove item from quote
    removeItem: async (quoteId: string, itemId: string): Promise<QuoteRequest> => {
        const response = await apiRequest<{ success: boolean; data: QuoteRequest }>(`/quotes/${quoteId}/items/${itemId}`, {
            method: 'DELETE',
        });
        return response.data;
    },

    // Upload quote attachment
    uploadAttachment: async (quoteId: string, file: File): Promise<QuoteAttachment> => {
        const formData = new FormData();
        formData.append('attachment', file);

        const token = localStorage.getItem('authToken');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(`${API_BASE_URL}/quotes/${quoteId}/attachments`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Upload failed: ${response.status}`);
        }

        const result = await response.json();
        return result.data;
    },

    // Delete quote attachment
    deleteAttachment: async (quoteId: string, attachmentId: string): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>(`/quotes/${quoteId}/attachments/${attachmentId}`, {
            method: 'DELETE',
        });
    },

    // Get quote history/audit log
    getHistory: async (id: string): Promise<Array<{
        id: string;
        action: string;
        changes: Record<string, any>;
        user: { id: string; name: string };
        timestamp: string;
        notes?: string;
    }>> => {
        const response = await apiRequest<{ success: boolean; data: any[] }>(`/quotes/${id}/history`);
        return response.data;
    },

    // Bulk update quotes
    bulkUpdate: async (quoteIds: string[], updateData: Partial<QuoteUpdateData>): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>('/quotes/bulk-update', {
            method: 'PUT',
            body: JSON.stringify({ quoteIds, updateData }),
        });
    },

    // Bulk delete quotes
    bulkDelete: async (quoteIds: string[]): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>('/quotes/bulk-delete', {
            method: 'DELETE',
            body: JSON.stringify({ quoteIds }),
        });
    },

    // Get quote templates
    getTemplates: async (): Promise<Array<{
        id: string;
        name: string;
        description: string;
        template: string;
        type: 'email' | 'sms' | 'pdf';
        isActive: boolean;
    }>> => {
        const response = await apiRequest<{ success: boolean; data: any[] }>('/quotes/templates');
        return response.data;
    },

    // Send quote reminder
    sendReminder: async (quoteId: string, reminderType: 'expiry' | 'follow_up' | 'custom', customMessage?: string): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>(`/quotes/${quoteId}/reminder`, {
            method: 'POST',
            body: JSON.stringify({ reminderType, customMessage }),
        });
    },

    // Get customer quote history
    getCustomerQuotes: async (customerId: string, filters?: { status?: string; dateFrom?: string; dateTo?: string }): Promise<QuoteRequest[]> => {
        const queryParams = new URLSearchParams();
        if (filters?.status) queryParams.append('status', filters.status);
        if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
        if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
        
        const endpoint = queryParams.toString() 
            ? `/customers/${customerId}/quotes?${queryParams.toString()}` 
            : `/customers/${customerId}/quotes`;
            
        const response = await apiRequest<{ success: boolean; data: QuoteRequest[] }>(endpoint);
        return response.data;
    },

    // Calculate quote totals
    calculateTotals: async (items: QuoteItem[], options?: {
        discount?: QuoteRequest['discount'];
        tax?: { rate: number };
        shipping?: { cost: number };
    }): Promise<{
        subtotal: number;
        discount: number;
        tax: number;
        shipping: number;
        total: number;
    }> => {
        const response = await apiRequest<{ success: boolean; data: any }>('/quotes/calculate-totals', {
            method: 'POST',
            body: JSON.stringify({ items, options }),
        });
        return response.data;
    },
};

// Brand Types
export interface Brand {
    _id?: string;
    name: string;
    logo?: string;
    status?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export const brandApi = {
    // Get all brands
    getAll: async (): Promise<Brand[]> => {
        const response = await apiRequest<{ data?: Brand[]; success?: boolean } | Brand[]>("/brands");
        // Handle both array response and object with data property
        if (Array.isArray(response)) {
            return response;
        }
        return (response as { data?: Brand[] }).data || [];
    },

    // Get brand by ID
    getById: async (id: string): Promise<Brand> => {
        const response = await apiRequest<Brand>(`/brands/${id}`);
        return response;
    },

    // Create new brand (with FormData for file upload)
    create: async (data: { name: string; logo?: File | string }): Promise<Brand> => {
        const formData = new FormData();
        formData.append("name", data.name);
        if (data.logo && data.logo instanceof File) {
            formData.append("logo", data.logo);
        }
        
        // For FormData requests, we need to manually handle headers to avoid Content-Type conflicts
        const token = localStorage.getItem('authToken');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await fetch(`${API_BASE_URL}/brands`, {
            method: 'POST',
            headers,
            body: formData,
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    },

    // Update brand (with FormData for file upload or JSON for other updates)
    update: async (id: string, data: { name?: string; logo?: File | string; status?: string }): Promise<Brand> => {
        // If only updating status (no file), use JSON with apiRequest for consistent auth handling
        if (data.status && !data.logo && !data.name) {
            const response = await apiRequest<Brand>(`/brands/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: data.status }),
            });
            return response;
        }
        
        // Use FormData for file uploads or mixed updates
        const formData = new FormData();
        if (data.name) formData.append("name", data.name);
        if (data.status) formData.append("status", data.status);
        if (data.logo && data.logo instanceof File) {
            formData.append("logo", data.logo);
        }
        
        // For FormData requests, we need to manually handle headers to avoid Content-Type conflicts
        const token = localStorage.getItem('authToken');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
            method: 'PUT',
            headers,
            body: formData,
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    },

    // Delete brand
    delete: async (id: string): Promise<{ message: string }> => {
        const response = await apiRequest<{ message: string }>(`/brands/${id}`, {
            method: 'DELETE',
        });
        return response;
    },

    // Toggle brand status using dedicated status endpoint
    toggleStatus: async (id: string, isActive?: boolean): Promise<Brand> => {
        // Use apiRequest for consistent authentication handling
        const requestBody = isActive !== undefined ? { isActive } : {};
        const response = await apiRequest<Brand>(`/brands/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify(requestBody),
        });
        return response;
    },
};

// Error handling utility
export class ApiError extends Error {
    constructor(
        message: string,
        public status?: number,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Retry mechanism for failed requests
export const withRetry = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> => {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            
            if (i === maxRetries - 1) {
                throw lastError;
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }

    throw lastError!;
};

export default apiRequest; 

export interface Country {
    _id?: string;
    name: string;
    code?: string;
}

export interface State {
    _id?: string;
    name: string;
    code?: string;
    country: string | Country;
}

export interface City {
    _id?: string;
    name: string;
    code?: string;
    state: string | State;
}

export const countryApi = {
    getAll: async (): Promise<Country[]> => {
        const response = await apiRequest<{ data: Country[] }>("/countries");
        return response.data || [];
    },
    getById: async (id: string): Promise<Country> => {
        const response = await apiRequest<{ data: Country }>(`/countries/${id}`);
        return response.data;
    },
    create: async (country: Omit<Country, '_id'>): Promise<Country> => {
        const response = await apiRequest<{ data: Country }>("/countries", {
            method: 'POST',
            body: JSON.stringify(country),
        });
        return response.data;
    },
    update: async (id: string, country: Partial<Country>): Promise<Country> => {
        const response = await apiRequest<{ data: Country }>(`/countries/${id}`, {
            method: 'PUT',
            body: JSON.stringify(country),
        });
        return response.data;
    },
    delete: async (id: string): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>(`/countries/${id}`, {
            method: 'DELETE',
        });
    },
};

export const stateApi = {
    getAll: async (): Promise<State[]> => {
        const response = await apiRequest<{ data: State[] }>("/states");
        return response.data || [];
    },
    getById: async (id: string): Promise<State> => {
        const response = await apiRequest<{ data: State }>(`/states/${id}`);
        return response.data;
    },
    create: async (state: Omit<State, '_id'>): Promise<State> => {
        const response = await apiRequest<{ data: State }>("/states", {
            method: 'POST',
            body: JSON.stringify(state),
        });
        return response.data;
    },
    update: async (id: string, state: Partial<State>): Promise<State> => {
        const response = await apiRequest<{ data: State }>(`/states/${id}`, {
            method: 'PUT',
            body: JSON.stringify(state),
        });
        return response.data;
    },
    delete: async (id: string): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>(`/states/${id}`, {
            method: 'DELETE',
        });
    },
};

export const cityApi = {
    getAll: async (): Promise<City[]> => {
        const response = await apiRequest<{ data: City[] }>("/cities");
        return response.data || [];
    },
    getById: async (id: string): Promise<City> => {
        const response = await apiRequest<{ data: City }>(`/cities/${id}`);
        return response.data;
    },
    create: async (city: Omit<City, '_id'>): Promise<City> => {
        const response = await apiRequest<{ data: City }>("/cities", {
            method: 'POST',
            body: JSON.stringify(city),
        });
        return response.data;
    },
    update: async (id: string, city: Partial<City>): Promise<City> => {
        const response = await apiRequest<{ data: City }>(`/cities/${id}`, {
            method: 'PUT',
            body: JSON.stringify(city),
        });
        return response.data;
    },
    delete: async (id: string): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>(`/cities/${id}`, {
            method: 'DELETE',
        });
    },
}; 

export interface Slider {
    _id?: string;
    id?: string;
    title: string;
    description?: string;
    imageUrl: string;
    link?: string;
    order?: number;
    isActive?: boolean;
    createdAt?: string;
}

export const sliderApi = {
    getAll: async (): Promise<Slider[]> => {
        return apiRequest<Slider[]>("/sliders");
    },
    getById: async (id: string): Promise<Slider> => {
        return apiRequest<Slider>(`/sliders/${id}`);
    },
    create: async (slider: Omit<Slider, '_id' | 'id' | 'createdAt'>): Promise<Slider> => {
        return apiRequest<Slider>("/sliders", {
            method: 'POST',
            body: JSON.stringify(slider),
        });
    },
    update: async (id: string, slider: Partial<Slider>): Promise<Slider> => {
        return apiRequest<Slider>(`/sliders/${id}` , {
            method: 'PUT',
            body: JSON.stringify(slider),
        });
    },
    delete: async (id: string): Promise<{ message: string }> => {
        return apiRequest<{ message: string }>(`/sliders/${id}`, {
            method: 'DELETE',
        });
    },
    // Optionally, add status toggle and order update if backend supports it
}; 

// Customer API Functions
// Order Types
export interface OrderCustomer {
    id: string;
    _id?: string; // MongoDB ObjectId
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
}

export interface OrderItem {
    id: string;
    _id?: string; // MongoDB ObjectId
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    image?: string;
    category?: string;
}

export interface OrderAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface Order {
    id: string;
    _id?: string; // MongoDB ObjectId
    orderNumber: string;
    customer: OrderCustomer;
    items: OrderItem[];
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
    shippingAddress: OrderAddress;
    billingAddress: OrderAddress;
    notes?: string;
    trackingNumber?: string;
    createdAt: string;
    updatedAt?: string;
}

// API Response Structure (actual API format)
export interface ApiOrderResponse {
    _id: string;
    orderNumber: string;
    customer: {
        _id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    customerEmail: string;
    customerPhone: string;
    items: Array<{
        product: any;
        productName: string;
        sku: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        discount: number;
        taxRate: number;
        taxAmount: number;
    }>;
    subtotal: number;
    totalDiscount: number;
    totalTax: number;
    shippingCost: number;
    totalAmount: number;
    currency: string;
    status: string;
    priority: string;
    shippingAddress: {
        firstName: string;
        lastName: string;
        company: string;
        addressLine1: string;
        addressLine2: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
        phone: string;
    };
    billingAddress: {
        firstName: string;
        lastName: string;
        company: string;
        addressLine1: string;
        addressLine2: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
    paymentInfo: {
        paymentMethod: string;
        paymentStatus: string;
        paymentDueDate: string;
    };
    shippingMethod: string;
    trackingHistory: Array<{
        status: string;
        timestamp: string;
        notes: string;
        updatedBy: string;
    }>;
    notes: string;
    tags: string[];
    isActive: boolean;
    refundAmount: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface OrderFormData {
    customerId: string;
    items: Omit<OrderItem, 'id' | '_id'>[];
    shippingAddress: OrderAddress;
    billingAddress: OrderAddress;
    paymentMethod: string;
    notes?: string;
}

export interface OrderUpdateData {
    status?: Order['status'];
    paymentStatus?: Order['paymentStatus'];
    trackingNumber?: string;
    notes?: string;
    shippedDate?: string;
    deliveredDate?: string;
}

export interface OrderFilters {
    search?: string;
    status?: string;
    paymentStatus?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    minTotal?: number;
    maxTotal?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface OrderListResponse {
    success: boolean;
    data: ApiOrderResponse[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface OrderStats {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    returned: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalItems: number;
}

// Order API Functions
export const orderApi = {
    // Get all orders with filters
    getAll: async (filters?: OrderFilters): Promise<OrderListResponse> => {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });
        }
        
        const endpoint = queryParams.toString() ? `/orders?${queryParams.toString()}` : '/orders';
        const response = await apiRequest<OrderListResponse>(endpoint);
        return response;
    },

    // Get order by ID
    getById: async (id: string): Promise<Order> => {
        const response = await apiRequest<{ success: boolean; data: Order }>(`/orders/${id}`);
        return response.data;
    },

    // Create new order
    create: async (orderData: OrderFormData): Promise<Order> => {
        const response = await apiRequest<{ success: boolean; data: Order }>('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
        return response.data;
    },

    // Update order
    update: async (id: string, updateData: OrderUpdateData): Promise<Order> => {
        const response = await apiRequest<{ success: boolean; data: Order }>(`/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
        return response.data;
    },

    // Update order status
    updateStatus: async (id: string, status: Order['status']): Promise<Order> => {
        const response = await apiRequest<{ success: boolean; data: Order }>(`/orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
        return response.data;
    },

    // Update payment status
    updatePaymentStatus: async (id: string, paymentStatus: Order['paymentStatus']): Promise<Order> => {
        const response = await apiRequest<{ success: boolean; data: Order }>(`/orders/${id}/payment-status`, {
            method: 'PATCH',
            body: JSON.stringify({ paymentStatus }),
        });
        return response.data;
    },

    // Cancel order
    cancel: async (id: string, reason?: string): Promise<Order> => {
        const response = await apiRequest<{ success: boolean; data: Order }>(`/orders/${id}/cancel`, {
            method: 'PATCH',
            body: JSON.stringify({ reason }),
        });
        return response.data;
    },

    // Delete order
    delete: async (id: string): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>(`/orders/${id}`, {
            method: 'DELETE',
        });
    },

    // Get order statistics
    getStats: async (filters?: { dateFrom?: string; dateTo?: string }): Promise<OrderStats> => {
        const queryParams = new URLSearchParams();
        if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
        if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
        
        const endpoint = queryParams.toString() ? `/orders/stats?${queryParams.toString()}` : '/orders/stats';
        const response = await apiRequest<{ success: boolean; data: OrderStats }>(endpoint);
        return response.data;
    },

    // Search orders
    search: async (query: string, filters?: OrderFilters): Promise<OrderListResponse> => {
        const queryParams = new URLSearchParams();
        queryParams.append('search', query);
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });
        }
        
        const response = await apiRequest<OrderListResponse>(`/orders/search?${queryParams.toString()}`);
        return response;
    },

    // Bulk update orders
    bulkUpdate: async (updates: Array<{ id: string; data: Partial<OrderUpdateData> }>): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>('/orders/bulk', {
            method: 'PUT',
            body: JSON.stringify({ updates }),
        });
    },

    // Export orders
    export: async (filters?: OrderFilters, format: 'excel' | 'csv' = 'excel'): Promise<{ url: string; filename: string }> => {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });
        }
        queryParams.append('format', format);
        
        const response = await apiRequest<{ success: boolean; data: { url: string; filename: string } }>(`/orders/export?${queryParams.toString()}`);
        return response.data;
    },

    // Get customer orders
    getCustomerOrders: async (customerId: string, filters?: { status?: string; dateFrom?: string; dateTo?: string }): Promise<Order[]> => {
        const queryParams = new URLSearchParams();
        if (filters?.status) queryParams.append('status', filters.status);
        if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
        if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
        
        const endpoint = queryParams.toString() 
            ? `/customers/${customerId}/orders?${queryParams.toString()}` 
            : `/customers/${customerId}/orders`;
            
        const response = await apiRequest<{ success: boolean; data: Order[] }>(endpoint);
        return response.data;
    },

    // Add tracking number
    addTracking: async (id: string, trackingNumber: string, carrier?: string): Promise<Order> => {
        const response = await apiRequest<{ success: boolean; data: Order }>(`/orders/${id}/tracking`, {
            method: 'PATCH',
            body: JSON.stringify({ trackingNumber, carrier }),
        });
        return response.data;
    },

    // Send order update notification
    sendUpdate: async (id: string, updateData: {
        type: 'status_update' | 'shipping_update' | 'delivery_update' | 'custom';
        message?: string;
        method: 'email' | 'sms' | 'both';
    }): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>(`/orders/${id}/notify`, {
            method: 'POST',
            body: JSON.stringify(updateData),
        });
    },
};

export const customerApi = {
    // Get all customers
    getAll: async (): Promise<Customer[]> => {
        const response = await apiRequest<{ success: boolean; data: Customer[]; count: number }>('/customers');
        return response.data || [];
    },

    // Get customer by ID
    getById: async (id: string): Promise<Customer> => {
        const response = await apiRequest<{ success: boolean; data: Customer }>(`/customers/${id}`);
        return response.data;
    },

    // Create new customer
    create: async (customer: CustomerFormData): Promise<Customer> => {
        const response = await apiRequest<{ success: boolean; data: Customer }>('/customers', {
            method: 'POST',
            body: JSON.stringify(customer),
        });
        return response.data;
    },

    // Update customer
    update: async (id: string, customer: Partial<CustomerFormData>): Promise<Customer> => {
        const response = await apiRequest<{ success: boolean; data: Customer }>(`/customers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(customer),
        });
        return response.data;
    },

    // Delete customer
    delete: async (id: string): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>(`/customers/${id}`, {
            method: 'DELETE',
        });
    },

    // Toggle customer status
    toggleStatus: async (id: string, status: 'active' | 'inactive'): Promise<Customer> => {
        const response = await apiRequest<{ success: boolean; data: Customer }>(`/customers/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
        return response.data;
    },

    // Get customer statistics
    getStats: async (): Promise<CustomerStats> => {
        const response = await apiRequest<{ success: boolean; data: CustomerStats }>('/customers/stats');
        return response.data;
    },

    // Search customers
    search: async (params: {
        search?: string;
        status?: 'all' | 'active' | 'inactive';
        limit?: number;
        offset?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{ customers: Customer[]; total: number; }> => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value.toString());
            }
        });
        
        const response = await apiRequest<{ 
            success: boolean; 
            data: { customers: Customer[]; total: number; } 
        }>(`/customers/search?${queryParams.toString()}`);
        return response.data;
    },

    // Bulk operations
    bulkUpdate: async (updates: Array<{ id: string; data: Partial<CustomerFormData> }>): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>('/customers/bulk', {
            method: 'PUT',
            body: JSON.stringify({ updates }),
        });
    },

    // Export customers
    export: async (params?: {
        format?: 'csv' | 'xlsx';
        status?: 'all' | 'active' | 'inactive';
        dateRange?: { start: string; end: string; };
    }): Promise<Blob> => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (typeof value === 'object') {
                        queryParams.append(key, JSON.stringify(value));
                    } else {
                        queryParams.append(key, value.toString());
                    }
                }
            });
        }

        const response = await fetch(`${API_BASE_URL}/customers/export?${queryParams.toString()}`, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Export failed: ${response.status}`);
        }

        return response.blob();
    },
};

// Transaction Types
export interface TransactionCustomer {
    id: string;
    _id?: string; // MongoDB ObjectId
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
}

export interface TransactionInvoice {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    status: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled";
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    notes?: string;
    downloadUrl?: string;
}

export interface TransactionBillingAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface TransactionMetadata {
    source: string;
    campaign?: string;
    deviceType: string;
}

export interface Transaction {
    id: string;
    _id?: string; // MongoDB ObjectId
    transactionId: string;
    orderId: string;
    customer: TransactionCustomer;
    amount: number;
    paymentMethod: "Credit Card" | "PayPal" | "Bank Transfer" | "Digital Wallet" | "Cash";
    status: "Completed" | "Pending" | "Failed" | "Refunded" | "Processing";
    transactionDate: string;
    description: string;
    currency: string;
    fees: number;
    netAmount: number;
    reference?: string;
    paymentProcessor: string;
    merchantId: string;
    authorizationCode?: string;
    settlementDate?: string;
    failureReason?: string;
    refundReason?: string;
    ipAddress: string;
    userAgent: string;
    billingAddress: TransactionBillingAddress;
    metadata: TransactionMetadata;
    invoice: TransactionInvoice;
    createdAt?: string;
    updatedAt?: string;
}

export interface TransactionFilters {
    search?: string;
    status?: string;
    paymentMethod?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number;
    maxAmount?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface TransactionListResponse {
    success: boolean;
    data: Transaction[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface TransactionStats {
    totalTransactions: number;
    totalAmount: number;
    totalFees: number;
    netAmount: number;
    avgTransaction: number;
    paidInvoices: number;
    completedTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
    refundedTransactions: number;
    processingTransactions: number;
}

export interface TransactionUpdateData {
    status?: Transaction['status'];
    notes?: string;
    refundReason?: string;
}

// Transaction API Functions
export const transactionApi = {
    // Get all transactions with filters
    getAll: async (filters?: TransactionFilters): Promise<TransactionListResponse> => {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });
        }
        
        const endpoint = queryParams.toString() ? `/transactions/admin/all?${queryParams.toString()}` : '/transactions/admin/all';
        
        try {
            const response = await apiRequest<TransactionListResponse>(endpoint);
            // Validate response structure
            if (!response || typeof response !== 'object') {
                throw new Error('Invalid response structure');
            }
            return response;
        } catch (error) {
            console.warn('Backend API not available, using mock data:', error);
            // Fallback to mock data when backend is not available
            const { mockTransactions } = await import('../data/mockTransactions');
            
            // Apply basic filtering to mock data
            let filteredTransactions = [...mockTransactions];
            
            if (filters?.search) {
                const searchTerm = filters.search.toLowerCase();
                filteredTransactions = filteredTransactions.filter(t => 
                    t.transactionId.toLowerCase().includes(searchTerm) ||
                    t.customer.name.toLowerCase().includes(searchTerm) ||
                    t.customer.email.toLowerCase().includes(searchTerm) ||
                    t.orderId.toLowerCase().includes(searchTerm)
                );
            }
            
            if (filters?.status) {
                filteredTransactions = filteredTransactions.filter(t => 
                    t.status.toLowerCase() === filters.status?.toLowerCase()
                );
            }
            
            // Apply sorting
            if (filters?.sortBy) {
                filteredTransactions.sort((a, b) => {
                    const aVal = a[filters.sortBy as keyof Transaction];
                    const bVal = b[filters.sortBy as keyof Transaction];
                    
                    if (typeof aVal === 'string' && typeof bVal === 'string') {
                        return filters.sortOrder === 'asc' 
                            ? aVal.localeCompare(bVal)
                            : bVal.localeCompare(aVal);
                    }
                    
                    if (typeof aVal === 'number' && typeof bVal === 'number') {
                        return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
                    }
                    
                    return 0;
                });
            }
            
            // Apply pagination
            const page = filters?.page || 1;
            const limit = filters?.limit || 10;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
            
            return {
                success: true,
                data: paginatedTransactions,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(filteredTransactions.length / limit),
                    totalItems: filteredTransactions.length,
                    itemsPerPage: limit,
                    hasNext: endIndex < filteredTransactions.length,
                    hasPrev: page > 1
                }
            };
        }
    },

    // Get transaction by ID
    getById: async (id: string): Promise<Transaction> => {
        try {
            const response = await apiRequest<{ success: boolean; data: Transaction }>(`/transactions/admin/${id}`);
            return response.data;
        } catch (error) {
            console.warn('Backend API not available, using mock data:', error);
            // Fallback to mock data when backend is not available
            const { mockTransactions } = await import('../data/mockTransactions');
            const transaction = mockTransactions.find(t => t.id === id || t._id === id);
            if (!transaction) {
                throw new Error(`Transaction with ID ${id} not found`);
            }
            return transaction;
        }
    },

    // Update transaction
    update: async (id: string, updateData: TransactionUpdateData): Promise<Transaction> => {
        const response = await apiRequest<{ success: boolean; data: Transaction }>(`/transactions/admin/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
        return response.data;
    },

    // Update transaction status
    updateStatus: async (id: string, status: Transaction['status']): Promise<Transaction> => {
        const response = await apiRequest<{ success: boolean; data: Transaction }>(`/transactions/admin/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
        return response.data;
    },

    // Process refund
    processRefund: async (id: string, refundData: {
        amount?: number;
        reason: string;
        notes?: string;
    }): Promise<Transaction> => {
        const response = await apiRequest<{ success: boolean; data: Transaction }>(`/transactions/admin/${id}/refund`, {
            method: 'POST',
            body: JSON.stringify(refundData),
        });
        return response.data;
    },

    // Delete transaction
    delete: async (id: string): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>(`/transactions/admin/${id}`, {
            method: 'DELETE',
        });
    },

    // Get transaction statistics
    getStats: async (filters?: { dateFrom?: string; dateTo?: string }): Promise<TransactionStats> => {
        const queryParams = new URLSearchParams();
        if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
        if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
        
        const endpoint = queryParams.toString() ? `/transactions/admin/stats?${queryParams.toString()}` : '/transactions/admin/stats';
        
        try {
            const response = await apiRequest<{ success: boolean; data: TransactionStats }>(endpoint);
            // Validate response structure and data
            if (!response || !response.data || typeof response.data !== 'object') {
                throw new Error('Invalid stats response structure');
            }
            return response.data;
        } catch (error) {
            console.warn('Backend stats API not available, using mock data:', error);
            // Fallback to mock stats when backend is not available
            const { mockTransactionStats } = await import('../data/mockTransactions');
            return mockTransactionStats;
        }
    },

    // Search transactions
    search: async (query: string, filters?: TransactionFilters): Promise<TransactionListResponse> => {
        const queryParams = new URLSearchParams();
        queryParams.append('search', query);
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });
        }
        
        const response = await apiRequest<TransactionListResponse>(`/transactions/admin/search?${queryParams.toString()}`);
        return response;
    },

    // Bulk update transactions
    bulkUpdate: async (updates: Array<{ id: string; data: Partial<TransactionUpdateData> }>): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>('/transactions/admin/bulk', {
            method: 'PUT',
            body: JSON.stringify({ updates }),
        });
    },

    // Export transactions
    export: async (filters?: TransactionFilters, format: 'excel' | 'csv' = 'excel'): Promise<{ url: string; filename: string }> => {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });
        }
        queryParams.append('format', format);
        
        const response = await apiRequest<{ success: boolean; data: { url: string; filename: string } }>(`/transactions/admin/export?${queryParams.toString()}`);
        return response.data;
    },

    // Send invoice via email
    sendInvoice: async (id: string, emailData: {
        recipient: string;
        subject?: string;
        message?: string;
        includeInvoiceDetails?: boolean;
    }): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>(`/transactions/admin/${id}/send-invoice`, {
            method: 'POST',
            body: JSON.stringify(emailData),
        });
    },

    // Get customer transactions
    getCustomerTransactions: async (customerId: string, filters?: { 
        status?: string; 
        dateFrom?: string; 
        dateTo?: string;
        limit?: number;
        offset?: number;
    }): Promise<Transaction[]> => {
        const queryParams = new URLSearchParams();
        if (filters?.status) queryParams.append('status', filters.status);
        if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
        if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
        if (filters?.limit) queryParams.append('limit', filters.limit.toString());
        if (filters?.offset) queryParams.append('offset', filters.offset.toString());
        
        const endpoint = queryParams.toString() 
            ? `/customers/admin/${customerId}/transactions?${queryParams.toString()}` 
            : `/customers/admin/${customerId}/transactions`;
            
        const response = await apiRequest<{ success: boolean; data: Transaction[] }>(endpoint);
        return response.data;
    },

    // Get transaction history/audit log
    getHistory: async (id: string): Promise<Array<{
        id: string;
        action: string;
        changes: Record<string, any>;
        user: { id: string; name: string };
        timestamp: string;
        notes?: string;
    }>> => {
        const response = await apiRequest<{ success: boolean; data: any[] }>(`/transactions/admin/${id}/history`);
        return response.data;
    },

    // Generate transaction report
    generateReport: async (filters?: TransactionFilters & {
        reportType: 'summary' | 'detailed' | 'financial';
        groupBy?: 'day' | 'week' | 'month' | 'customer' | 'paymentMethod';
    }): Promise<{ url: string; filename: string }> => {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });
        }
        
        const response = await apiRequest<{ success: boolean; data: { url: string; filename: string } }>(`/transactions/admin/report?${queryParams.toString()}`);
        return response.data;
    },
};

