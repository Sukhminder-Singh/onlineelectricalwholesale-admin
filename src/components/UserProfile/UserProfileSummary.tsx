import { useAuth } from "../../context/AuthContext";

export default function UserProfileSummary() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // Helper function to display data or "-" if empty
  const displayData = (value: string | undefined) => {
    return value && value.trim() !== '' ? value : '-';
  };

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4 mb-4 lg:mb-0">
          <div className="w-16 h-16 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            <img src="/images/user/owner.jpg" alt="user" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              {displayData(user.firstName)} {displayData(user.lastName)}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {displayData(user.role)} • Member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full dark:bg-blue-900 dark:text-blue-300">
            {user.isActive ? 'Active' : 'Inactive'}
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full dark:bg-green-900 dark:text-green-300">
            {displayData(user.role)}
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {displayData(user.username)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Username</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {displayData(user.email)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {formatDate(user.lastLogin)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Last Login</p>
          </div>
        </div>
      </div>
    </div>
  );
}
