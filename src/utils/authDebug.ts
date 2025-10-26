// Authentication debugging utilities
import { authUtils } from '../services/auth';

export interface AuthDebugInfo {
  hasToken: boolean;
  hasUser: boolean;
  tokenValid: boolean;
  tokenExpired: boolean;
  tokenFormat: boolean;
  userRole: string | null;
  tokenExpiryTime: string | null;
  timeUntilExpiry: string | null;
  localStorageWorking: boolean;
  issues: string[];
}

export function getAuthDebugInfo(): AuthDebugInfo {
  const issues: string[] = [];
  
  // Check localStorage functionality
  let localStorageWorking = true;
  try {
    const testKey = '__auth_debug_test__';
    const testValue = 'test';
    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    localStorageWorking = retrieved === testValue;
  } catch (error) {
    localStorageWorking = false;
    issues.push('localStorage not working');
  }

  // Check token
  const token = authUtils.getToken();
  const hasToken = !!token;
  
  if (!hasToken) {
    issues.push('No authentication token found');
  }

  // Check user
  const user = authUtils.getCurrentUser();
  const hasUser = !!user;
  
  if (!hasUser) {
    issues.push('No user data found');
  }

  // Check token validity
  const tokenExpired = authUtils.isTokenExpired();
  const tokenFormat = authUtils.isValidTokenFormat();
  const tokenValid = !tokenExpired && tokenFormat;

  if (tokenExpired) {
    issues.push('Token has expired');
  }

  if (!tokenFormat) {
    issues.push('Token format is invalid');
  }

  // Get token expiry info
  let tokenExpiryTime: string | null = null;
  let timeUntilExpiry: string | null = null;
  
  if (token && tokenFormat) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp) {
          const expiryDate = new Date(payload.exp * 1000);
          tokenExpiryTime = expiryDate.toLocaleString();
          
          const now = Date.now();
          const expiryMs = payload.exp * 1000;
          const diffMs = expiryMs - now;
          
          if (diffMs > 0) {
            const minutes = Math.floor(diffMs / (1000 * 60));
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            
            if (days > 0) {
              timeUntilExpiry = `${days} day(s), ${hours % 24} hour(s)`;
            } else if (hours > 0) {
              timeUntilExpiry = `${hours} hour(s), ${minutes % 60} minute(s)`;
            } else {
              timeUntilExpiry = `${minutes} minute(s)`;
            }
          } else {
            timeUntilExpiry = 'Expired';
          }
        }
      }
    } catch (error) {
      issues.push('Could not parse token expiry');
    }
  }

  return {
    hasToken,
    hasUser,
    tokenValid,
    tokenExpired,
    tokenFormat,
    userRole: user?.role || null,
    tokenExpiryTime,
    timeUntilExpiry,
    localStorageWorking,
    issues
  };
}

export function logAuthDebugInfo(): void {
  const debugInfo = getAuthDebugInfo();
  
  console.group('🔐 Authentication Debug Info');
  console.log('Has Token:', debugInfo.hasToken);
  console.log('Has User:', debugInfo.hasUser);
  console.log('Token Valid:', debugInfo.tokenValid);
  console.log('Token Expired:', debugInfo.tokenExpired);
  console.log('Token Format Valid:', debugInfo.tokenFormat);
  console.log('User Role:', debugInfo.userRole);
  console.log('Token Expiry Time:', debugInfo.tokenExpiryTime);
  console.log('Time Until Expiry:', debugInfo.timeUntilExpiry);
  console.log('localStorage Working:', debugInfo.localStorageWorking);
  
  if (debugInfo.issues.length > 0) {
    console.warn('Issues found:', debugInfo.issues);
  } else {
    console.log('✅ No authentication issues detected');
  }
  
  console.groupEnd();
}

export function fixCommonAuthIssues(): { fixed: boolean; message: string } {
  const debugInfo = getAuthDebugInfo();
  
  if (!debugInfo.localStorageWorking) {
    return {
      fixed: false,
      message: 'localStorage is not working. Please check your browser settings.'
    };
  }

  if (!debugInfo.hasToken && !debugInfo.hasUser) {
    return {
      fixed: false,
      message: 'No authentication data found. Please log in again.'
    };
  }

  if (debugInfo.hasToken && !debugInfo.hasUser) {
    // Clear orphaned token
    localStorage.removeItem('authToken');
    return {
      fixed: true,
      message: 'Cleared orphaned authentication token. Please log in again.'
    };
  }

  if (!debugInfo.hasToken && debugInfo.hasUser) {
    // Clear orphaned user data
    localStorage.removeItem('user');
    return {
      fixed: true,
      message: 'Cleared orphaned user data. Please log in again.'
    };
  }

  if (debugInfo.tokenExpired) {
    // Clear expired auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return {
      fixed: true,
      message: 'Cleared expired authentication data. Please log in again.'
    };
  }

  return {
    fixed: false,
    message: 'No fixable issues found. Authentication appears to be working correctly.'
  };
}

// Make debugging functions available globally in development
if (import.meta.env.DEV) {
  (window as any).authDebug = {
    getInfo: getAuthDebugInfo,
    logInfo: logAuthDebugInfo,
    fixIssues: fixCommonAuthIssues
  };
}
