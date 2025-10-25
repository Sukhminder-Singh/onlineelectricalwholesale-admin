import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { User, authApi, authUtils } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  updateUserProfile: (userData: Partial<User>) => Promise<boolean>;
  clearProfileData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        // Get stored user and token
        const storedUser = authUtils.getCurrentUser();
        const token = authUtils.getToken();
        
        if (!token || !storedUser) {
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        // Check if token is expired before proceeding
        if (authUtils.isTokenExpired()) {
          authUtils.safeClearAuth('Token expired during auth check');
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        // Validate token format
        if (!authUtils.isValidTokenFormat()) {
          authUtils.safeClearAuth('Invalid token format during auth check');
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        // Set user temporarily while validating with server
        if (isMounted) {
          setUser(storedUser);
        }
        
        // Validate with server (this is now blocking to ensure proper validation)
        try {
          const response = await authApi.getCurrentUser();
          if (response.success && response.data?.user) {
            if (isMounted) {
              setUser(response.data.user);
              setIsLoading(false);
            }
            // Update localStorage with fresh user data
            localStorage.setItem('user', JSON.stringify(response.data.user));
          } else {
            authUtils.safeClearAuth('Server validation failed during auth check');
            if (isMounted) {
              setUser(null);
              setIsLoading(false);
            }
          }
        } catch (error) {
          // Clear auth data if server validation fails
          authUtils.safeClearAuth('Server validation error during auth check');
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
          }
        }
        
      } catch (error) {
        authUtils.safeClearAuth('Error during auth check');
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    checkAuth();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Periodic token validation check
  useEffect(() => {
    if (!user || isLoading) return;

    const interval = setInterval(() => {
      // Check if token is still valid
      if (authUtils.isTokenExpired()) {
        authUtils.safeClearAuth('Token expired during session');
        setUser(null);
      } else if (!authUtils.isValidTokenFormat()) {
        authUtils.safeClearAuth('Token format became invalid during session');
        setUser(null);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, isLoading]);

  const login = useCallback(async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (isLoggingIn) {
      return { success: false, error: 'Login already in progress' };
    }

    try {
      setIsLoggingIn(true);
      
      const response = await authApi.login({ identifier, password });
      
      if (response.success && response.data?.user && response.data?.accessToken) {
        // Set user immediately
        setUser(response.data.user);
        
        // Verify storage was successful
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          return { success: true };
        } else {
          return { success: false, error: 'Failed to store authentication data' };
        }
      }
      
      // Handle unsuccessful response
      return { success: false, error: response.message || 'Login failed. Please check your credentials.' };
    } catch (error) {
      // Extract error message from the caught error
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoggingIn(false);
    }
  }, [isLoggingIn]);

  const register = useCallback(async (userData: any): Promise<boolean> => {
    try {
      const response = await authApi.register(userData);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with logout
    } finally {
      setUser(null);
      authUtils.clearAuth();
      // Clear profile data on logout
      clearProfileData();
    }
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, [user]);

  const updateUserProfile = useCallback(async (userData: Partial<User>): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      // Call the existing authApi.updateProfile function
      const response = await authApi.updateProfile(userData);
      
      if (response.success && response.data?.user) {
        // Update local state with the server response
        setUser(response.data.user);
        // The authApi.updateProfile already updates localStorage
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Failed to update user profile:', error);
      return false;
    }
  }, [user]);

  const clearProfileData = useCallback(() => {
    // Clear all profile data from localStorage
    if (user) {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('userProfileData_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }, [user]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    register,
    logout,
    updateUser,
    updateUserProfile,
    clearProfileData,
  }), [user, isLoading, login, register, logout, updateUser, updateUserProfile, clearProfileData]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 