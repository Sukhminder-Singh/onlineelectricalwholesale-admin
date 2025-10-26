import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAuthDebugInfo, logAuthDebugInfo, fixCommonAuthIssues } from '../../utils/authDebug';

interface AuthDebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthDebugPanel: React.FC<AuthDebugPanelProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState(getAuthDebugInfo());
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDebugInfo(getAuthDebugInfo());
    }
  }, [isOpen, user, isAuthenticated, isLoading]);

  useEffect(() => {
    if (autoRefresh && isOpen) {
      const interval = setInterval(() => {
        setDebugInfo(getAuthDebugInfo());
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, isOpen]);

  const handleFixIssues = () => {
    const result = fixCommonAuthIssues();
    alert(result.message);
    setDebugInfo(getAuthDebugInfo());
  };

  const handleLogToConsole = () => {
    logAuthDebugInfo();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            🔐 Authentication Debug Panel
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Status Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg ${debugInfo.hasToken ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <div className="font-semibold">Token Status</div>
              <div className="text-sm">{debugInfo.hasToken ? '✅ Present' : '❌ Missing'}</div>
            </div>
            <div className={`p-3 rounded-lg ${debugInfo.hasUser ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <div className="font-semibold">User Data</div>
              <div className="text-sm">{debugInfo.hasUser ? '✅ Present' : '❌ Missing'}</div>
            </div>
            <div className={`p-3 rounded-lg ${debugInfo.tokenValid ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <div className="font-semibold">Token Valid</div>
              <div className="text-sm">{debugInfo.tokenValid ? '✅ Valid' : '❌ Invalid'}</div>
            </div>
            <div className={`p-3 rounded-lg ${debugInfo.localStorageWorking ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <div className="font-semibold">localStorage</div>
              <div className="text-sm">{debugInfo.localStorageWorking ? '✅ Working' : '❌ Not Working'}</div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Detailed Information</h3>
            <div className="space-y-2 text-sm">
              <div><strong>User Role:</strong> {debugInfo.userRole || 'N/A'}</div>
              <div><strong>Token Expiry:</strong> {debugInfo.tokenExpiryTime || 'N/A'}</div>
              <div><strong>Time Until Expiry:</strong> {debugInfo.timeUntilExpiry || 'N/A'}</div>
              <div><strong>Token Expired:</strong> {debugInfo.tokenExpired ? 'Yes' : 'No'}</div>
              <div><strong>Token Format Valid:</strong> {debugInfo.tokenFormat ? 'Yes' : 'No'}</div>
            </div>
          </div>

          {/* Issues */}
          {debugInfo.issues.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Issues Found</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                {debugInfo.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDebugInfo(getAuthDebugInfo())}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Info
            </button>
            <button
              onClick={handleLogToConsole}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Log to Console
            </button>
            <button
              onClick={handleFixIssues}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Fix Issues
            </button>
            <label className="flex items-center px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              Auto Refresh
            </label>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">Instructions</h3>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <div>• Use this panel to debug authentication issues</div>
              <div>• Check the console for detailed logs</div>
              <div>• Enable auto-refresh to monitor changes</div>
              <div>• Use "Fix Issues" to attempt automatic fixes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook to easily add debug panel to any component
export const useAuthDebug = () => {
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  const openDebug = () => setIsDebugOpen(true);
  const closeDebug = () => setIsDebugOpen(false);

  const DebugPanel = () => (
    <AuthDebugPanel isOpen={isDebugOpen} onClose={closeDebug} />
  );

  return {
    openDebug,
    closeDebug,
    DebugPanel,
    isDebugOpen
  };
};
