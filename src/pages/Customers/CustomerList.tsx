import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Search, Plus, Users, ShoppingBag, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/ui/button/Button';
import { showSuccessToast, showErrorToast } from '../../components/ui/toast';
import { useCustomer } from '../../context/CustomerContext';

export default function CustomerList() {
  const {
    filteredCustomers,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    isLoading,
    deleteCustomer,
    getTotalCustomers,
    getActiveCustomers,
    getTotalOrders,
    getTotalRevenue,
  } = useCustomer();

  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(customerId);
        showSuccessToast('Success', 'Customer deleted successfully');
      } catch (error) {
        showErrorToast('Error', 'Failed to delete customer');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <PageMeta
        title="Customer List | TailAdmin"
        description="Manage your customers"
      />
      <PageBreadcrumb pageTitle="Customer List" />

      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your customer database and view customer insights
            </p>
          </div>
          <Link to="/customer/add">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Customer
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getTotalCustomers()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getActiveCustomers()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getTotalOrders()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(getTotalRevenue())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <ComponentCard title="Customer Management">
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search customers by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="lg:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Customer Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Orders</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Spent</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                            {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {customer.firstName} {customer.lastName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Member since {formatDate(customer.createdAt)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="w-4 h-4" />
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="w-4 h-4" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {customer.city && customer.country ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            {customer.city}, {customer.country}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900 dark:text-white font-medium">
                          {customer.totalOrders}
                        </span>
                        {customer.lastOrderDate && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Last: {formatDate(customer.lastOrderDate)}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formatCurrency(customer.totalSpent)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            customer.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/customer/${customer.id}`}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/customer/edit/${customer.id}`}
                            className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                            title="Edit Customer"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete Customer"
                            disabled={isLoading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCustomers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No customers found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Get started by adding your first customer'}
                  </p>
                  {!searchTerm && statusFilter === 'all' && (
                    <Link to="/customer/add">
                      <Button>Add Customer</Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}