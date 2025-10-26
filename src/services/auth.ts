// Authentication Types
export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  identifier: string; // username or email
  password: string;
  role?: string; // role for access control
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// API Base Configuration
const API_BASE_URL = '/api'; // Use the proxy configuration from vite.config.ts

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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Handle responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    }
    
    // For non-JSON responses, return empty object
    return {} as T;
  } catch (error) {
    throw error;
  }
};

// Authentication API Functions
export const authApi = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Always include role: 'admin' for admin dashboard access
    const loginData = {
      ...credentials,
      role: 'admin'
    };
    
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
    console.log(response.data, 'response');
    // Store token in localStorage only if response is successful and has required data
    if (response.success && response.data?.accessToken && response.data?.user) {
      localStorage.setItem('authToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  },

  // Register user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store token in localStorage
    if (response.success && response.data?.accessToken) {
      localStorage.setItem('authToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Validate token before making API call
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      if (!authUtils.isValidTokenFormat()) {
        throw new Error('Invalid token format');
      }
      
      if (authUtils.isTokenExpired()) {
        throw new Error('Token has expired');
      }
      
      const response = await apiRequest<ApiResponse<{ user: User }>>('/auth/me');
      
      // Validate response
      if (!response.success) {
        throw new Error(response.message || 'Failed to get current user');
      }
      
      if (!response.data?.user) {
        throw new Error('Response missing user data');
      }
      
      return response;
    } catch (error) {
      // Clear invalid auth data
      if (error instanceof Error && (
        error.message.includes('No authentication token') ||
        error.message.includes('Invalid token format') ||
        error.message.includes('Token has expired')
      )) {
        authUtils.safeClearAuth(`getCurrentUser validation failed: ${error.message}`);
      }
      
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiRequest<ApiResponse<{ user: User }>>('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });

    // Update stored user data
    if (response.success && response.data?.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    // Update token if successful
    if (response.success && response.data?.accessToken) {
      localStorage.setItem('authToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  },

  // Logout user
  logout: async (): Promise<ApiResponse> => {
    try {
      // Try to call logout API if we have a valid token
      const token = localStorage.getItem('authToken');
      if (token && authUtils.isValidTokenFormat() && !authUtils.isTokenExpired()) {
        try {
          await apiRequest<ApiResponse>('/auth/logout', {
            method: 'POST',
          });
        } catch (error) {
          // Continue with logout even if API call fails
        }
      }
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      // Always clear local storage
      authUtils.safeClearAuth('User logout');
    }

    return {
      success: true,
      message: 'Logged out successfully'
    };
  },

  // Create admin user (for initial setup)
  createAdmin: async (adminData: RegisterData): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/create-admin', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });

    // Store token in localStorage
    if (response.success && response.data?.accessToken) {
      localStorage.setItem('authToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }
};

// Authentication utility functions
export const authUtils = {
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Check if user is admin
  isAdmin: (): boolean => {
    const user = authUtils.getCurrentUser();
    return user?.role === 'admin';
  },

  // Get auth token
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  // Clear auth data
  clearAuth: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Safely clear auth data with logging
  safeClearAuth: (_reason: string = 'Unknown reason'): void => {
    // Clear the data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Check and restore authentication state from localStorage
  checkAuthState: (): { hasToken: boolean; hasUser: boolean; user: User | null } => {
    const token = localStorage.getItem('authToken');
    const user = authUtils.getCurrentUser();
    
    return {
      hasToken: !!token,
      hasUser: !!user,
      user
    };
  },

  // Check if token is expired (basic check)
  isTokenExpired: (): boolean => {
    const token = localStorage.getItem('authToken');
    if (!token) return true;

    try {
      // First check if token has basic JWT format
      if (!authUtils.isValidTokenFormat()) {
        return true;
      }

      // Split the token and get the payload
      const parts = token.split('.');
      if (parts.length !== 3) {
        return true;
      }

      // Check if payload part exists and is not empty
      if (!parts[1] || parts[1].trim() === '') {
        return true;
      }

      // Decode the payload with better error handling
      let payload;
      try {
        // Use a more robust base64 decode
        const decoded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = decoded + '='.repeat((4 - decoded.length % 4) % 4);
        payload = JSON.parse(atob(padded));
      } catch (decodeError) {
        // Try alternative decoding method
        try {
          payload = JSON.parse(atob(parts[1]));
        } catch (altError) {
          return true;
        }
      }
      
      // Check if token has expiration
      if (!payload || !payload.exp) {
        return true;
      }

      // Check if token is expired (with 5 minute buffer for better UX)
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = payload.exp;
      const bufferTime = 5 * 60; // 5 minutes in seconds for better user experience
      
      const isExpired = currentTime >= (expirationTime - bufferTime);
      
      return isExpired;
    } catch (error) {
      return true;
    }
  },

  // Validate token format
  isValidTokenFormat: (): boolean => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
      // Check if token is a string
      if (typeof token !== 'string') {
        return false;
      }

      // Check if token is not empty
      if (token.trim() === '') {
        return false;
      }

      // Check if token has at least some reasonable length
      if (token.length < 10) {
        return false;
      }

      // Split the token and check parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      // Check if each part exists and is not empty
      for (let i = 0; i < parts.length; i++) {
        if (!parts[i] || parts[i].trim() === '') {
          return false;
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  },

  // Debug token information
  debugToken: (): { token: string | null; isValid: boolean; parts: string[]; error?: string } => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { token: null, isValid: false, parts: [] };
    }

    try {
      const parts = token.split('.');
      const isValid = parts.length === 3 && parts.every(part => part && part.trim() !== '');
      
      return {
        token: token.substring(0, 20) + '...', // Only show first 20 chars for security
        isValid,
        parts: parts.map((part, index) => `${index}: ${part.substring(0, 10)}...`)
      };
    } catch (error) {
      return {
        token: token.substring(0, 20) + '...',
        isValid: false,
        parts: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Test localStorage functionality
  testLocalStorage: (): { working: boolean; message: string } => {
    try {
      const testKey = '__test_storage__';
      const testValue = 'test_value_' + Date.now();
      
      // Test write
      localStorage.setItem(testKey, testValue);
      
      // Test read
      const retrieved = localStorage.getItem(testKey);
      
      // Test delete
      localStorage.removeItem(testKey);
      
      if (retrieved === testValue) {
        return { working: true, message: 'localStorage is working correctly' };
      } else {
        return { working: false, message: `localStorage read/write mismatch: wrote "${testValue}", read "${retrieved}"` };
      }
    } catch (error) {
      return { 
        working: false, 
        message: `localStorage test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  },

  // Test token storage specifically
  testTokenStorage: (): { working: boolean; message: string } => {
    try {
      const testToken = 'test_token_' + Date.now();
      const testUser = { id: 'test', username: 'testuser', role: 'user' };
      
      // Test storing auth data
      localStorage.setItem('authToken', testToken);
      localStorage.setItem('user', JSON.stringify(testUser));
      
      // Test retrieving auth data
      const retrievedToken = localStorage.getItem('authToken');
      const retrievedUser = localStorage.getItem('user');
      
      // Clean up
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      if (retrievedToken === testToken && retrievedUser === JSON.stringify(testUser)) {
        return { working: true, message: 'Token storage is working correctly' };
      } else {
        return { 
          working: false, 
          message: `Token storage mismatch: token=${retrievedToken === testToken}, user=${retrievedUser === JSON.stringify(testUser)}` 
        };
      }
    } catch (error) {
      return { 
        working: false, 
        message: `Token storage test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  },

  // Manually set test authentication data
  setTestAuthData: (): { success: boolean; message: string } => {
    try {
      const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const testUser = {
        _id: 'test123',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin' as const,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('authToken', testToken);
      localStorage.setItem('user', JSON.stringify(testUser));
      
      // Verify storage
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken === testToken && storedUser === JSON.stringify(testUser)) {
        return { success: true, message: 'Test auth data set successfully' };
      } else {
        return { success: false, message: 'Failed to verify test auth data storage' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Failed to set test auth data: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  },

  // Test login API manually
  testLoginAPI: async (): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      console.log('Testing login API manually...');
      
      const testCredentials = {
        identifier: 'test@example.com',
        password: 'testpassword'
      };
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCredentials),
      });
      
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        return { success: false, message: `Response is not valid JSON: ${responseText}` };
      }
      
      return { 
        success: true, 
        message: `API Response: ${JSON.stringify(data, null, 2)}`,
        data 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `API test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  },

  // Check localStorage integrity and fix common issues
  checkAndFixStorage: (): { fixed: boolean; issues: string[] } => {
    const issues: string[] = [];
    let fixed = false;

    try {
      // Check if localStorage is working
      const testKey = '__auth_test__';
      const testValue = 'test';
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (retrieved !== testValue) {
        issues.push('localStorage basic functionality test failed');
        return { fixed: false, issues };
      }

      // Check token format
      const token = localStorage.getItem('authToken');
      if (token) {
        // Check if token is a valid string
        if (typeof token !== 'string') {
          issues.push('Token is not a string');
          localStorage.removeItem('authToken');
          fixed = true;
        } else if (token.trim() === '') {
          issues.push('Token is empty string');
          localStorage.removeItem('authToken');
          fixed = true;
        } else if (token.length < 10) {
          issues.push('Token too short');
          localStorage.removeItem('authToken');
          fixed = true;
        } else {
          // Check JWT format
          const parts = token.split('.');
          if (parts.length !== 3) {
            issues.push('Token has wrong JWT format');
            localStorage.removeItem('authToken');
            fixed = true;
          } else {
            // Check if any part is empty
            for (let i = 0; i < parts.length; i++) {
              if (!parts[i] || parts[i].trim() === '') {
                issues.push(`Token part ${i} is empty`);
                localStorage.removeItem('authToken');
                fixed = true;
                break;
              }
            }
          }
        }
      }

      // Check user data
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (!user || typeof user !== 'object') {
            issues.push('User data is not a valid object');
            localStorage.removeItem('user');
            fixed = true;
          }
        } catch (error) {
          issues.push('User data is not valid JSON');
          localStorage.removeItem('user');
          fixed = true;
        }
      }

      // If we removed the token, also remove the user
      if (!localStorage.getItem('authToken') && localStorage.getItem('user')) {
        localStorage.removeItem('user');
        issues.push('Removed orphaned user data');
        fixed = true;
      }

    } catch (error) {
      issues.push(`Storage check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { fixed, issues };
  }
};

// Error handling utility
export class AuthError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export default authApi; 