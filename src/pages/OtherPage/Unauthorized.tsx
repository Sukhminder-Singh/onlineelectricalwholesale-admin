import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Unauthorized</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">You don't have permission to access this page.</p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/signin"
            className="inline-block px-4 py-2 rounded bg-brand-600 text-white hover:bg-brand-700"
          >
            Sign in as Admin
          </Link>
          <Link
            to="/"
            className="inline-block px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
