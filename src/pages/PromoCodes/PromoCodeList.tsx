import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Switch from "../../components/form/switch/Switch";
import Input from "../../components/form/input/InputField";
import EditPromoCodeModal from "../../components/promocodes/EditPromoCodeModal";
import ViewPromoCodeModal from "../../components/promocodes/ViewPromoCodeModal";
import { showSuccessToast, showErrorToast } from "../../components/ui/toast";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Users, 
  Package, 
  Calendar,
  TrendingUp,
  Filter,
  Tag
} from "lucide-react";

interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderValue?: number;
  usageCount: number;
  usageLimit?: number;
  usagePerCustomer?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableProducts: any[];
  allProducts: boolean;
  createdAt: string;
}

const mockPromoCodes: PromoCode[] = [
  {
    id: '1',
    code: 'WELCOME10',
    description: 'Welcome discount for new customers',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrderValue: 50,
    usageCount: 245,
    usageLimit: 1000,
    usagePerCustomer: 1,
    startDate: '2024-01-01T00:00:00',
    endDate: '2024-12-31T23:59:59',
    isActive: true,
    applicableProducts: [],
    allProducts: true,
    createdAt: '2024-01-01T00:00:00'
  },
  {
    id: '2',
    code: 'ELECTRONICS25',
    description: 'Special discount on electronics',
    discountType: 'percentage',
    discountValue: 25,
    minimumOrderValue: 100,
    usageCount: 89,
    usageLimit: 500,
    usagePerCustomer: 2,
    startDate: '2024-08-01T00:00:00',
    endDate: '2024-08-31T23:59:59',
    isActive: true,
    applicableProducts: [
      { id: '1', name: 'Laptop Pro', sku: 'LP-001', price: 1299.99 },
      { id: '2', name: 'Smartphone X', sku: 'SP-002', price: 899.99 }
    ],
    allProducts: false,
    createdAt: '2024-07-25T00:00:00'
  },
  {
    id: '3',
    code: 'SUMMER50',
    description: 'Summer sale fixed discount',
    discountType: 'fixed',
    discountValue: 50,
    minimumOrderValue: 200,
    usageCount: 156,
    usageLimit: 200,
    usagePerCustomer: 1,
    startDate: '2024-06-01T00:00:00',
    endDate: '2024-07-31T23:59:59',
    isActive: false,
    applicableProducts: [
      { id: '3', name: 'Summer Collection T-Shirt', sku: 'SC-003', price: 29.99 }
    ],
    allProducts: false,
    createdAt: '2024-05-15T00:00:00'
  },
  {
    id: '4',
    code: 'BLACKFRIDAY',
    description: 'Black Friday mega sale',
    discountType: 'percentage',
    discountValue: 30,
    usageCount: 1205,
    usageLimit: 5000,
    usagePerCustomer: 3,
    startDate: '2024-11-25T00:00:00',
    endDate: '2024-11-30T23:59:59',
    isActive: true,
    applicableProducts: [],
    allProducts: true,
    createdAt: '2024-11-01T00:00:00'
  },
  {
    id: '5',
    code: 'LOYALTY15',
    description: 'Loyalty customer reward',
    discountType: 'percentage',
    discountValue: 15,
    minimumOrderValue: 75,
    usageCount: 67,
    usagePerCustomer: 1,
    startDate: '2024-01-01T00:00:00',
    endDate: '2024-12-31T23:59:59',
    isActive: true,
    applicableProducts: [
      { id: '4', name: 'Premium Headphones', sku: 'PH-004', price: 199.99 },
      { id: '5', name: 'Wireless Speaker', sku: 'WS-005', price: 149.99 }
    ],
    allProducts: false,
    createdAt: '2024-01-15T00:00:00'
  }
];

type SortField = 'code' | 'discountValue' | 'usageCount' | 'startDate' | 'endDate' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function PromoCodeList() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(mockPromoCodes);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(null);

  const filteredAndSortedPromoCodes = () => {
    let filtered = promoCodes;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(promo =>
        promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(promo => 
        statusFilter === 'active' ? promo.isActive : !promo.isActive
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'startDate' || sortField === 'endDate' || sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleToggleStatus = async (id: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPromoCodes(prev => prev.map(promo => 
        promo.id === id 
          ? { ...promo, isActive: !promo.isActive }
          : promo
      ));
      
      showSuccessToast('Success', 'Promo code status updated successfully!');
    } catch (error) {
      showErrorToast('Error', 'Failed to update promo code status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete promo code "${code}"? This action cannot be undone.`);
    
    if (confirmed) {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setPromoCodes(prev => prev.filter(promo => promo.id !== id));
        showSuccessToast('Success', 'Promo code deleted successfully!');
      } catch (error) {
        showErrorToast('Error', 'Failed to delete promo code');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showSuccessToast('Success', `Promo code "${code}" copied to clipboard!`);
  };

  const handleEdit = (promoCode: PromoCode) => {
    setSelectedPromoCode(promoCode);
    setEditModalOpen(true);
  };

  const handleView = (promoCode: PromoCode) => {
    setSelectedPromoCode(promoCode);
    setViewModalOpen(true);
  };

  const handleSaveEdit = (updatedPromoCode: PromoCode) => {
    setPromoCodes(prev => prev.map(promo => 
      promo.id === updatedPromoCode.id ? updatedPromoCode : promo
    ));
    setEditModalOpen(false);
    setSelectedPromoCode(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (promo: PromoCode) => {
    const now = new Date();
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);

    if (!promo.isActive) {
      return <Badge color="light">Inactive</Badge>;
    }

    if (now < startDate) {
      return <Badge color="info">Scheduled</Badge>;
    }

    if (now > endDate) {
      return <Badge color="error">Expired</Badge>;
    }

    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      return <Badge color="warning">Limit Reached</Badge>;
    }

    return <Badge color="success">Active</Badge>;
  };

  const getUsagePercentage = (promo: PromoCode) => {
    if (!promo.usageLimit) return null;
    return Math.round((promo.usageCount / promo.usageLimit) * 100);
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Promo Codes" />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Codes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{promoCodes.length}</p>
            </div>
            <Tag className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Codes</p>
              <p className="text-2xl font-bold text-green-600">{promoCodes.filter(p => p.isActive).length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Usage</p>
              <p className="text-2xl font-bold text-purple-600">{promoCodes.reduce((sum, p) => sum + p.usageCount, 0)}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-600">
                {promoCodes.filter(p => {
                  const endDate = new Date(p.endDate);
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  return p.isActive && endDate <= nextWeek && endDate > new Date();
                }).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <ComponentCard title="Filters">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search promo codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <Link to="/promo/add">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Promo Code
            </Button>
          </Link>
        </div>
      </ComponentCard>

      {/* Promo Codes Table */}
      <ComponentCard title="Promo Codes List">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th 
                  className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('code')}
                >
                  Code {sortField === 'code' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">Description</th>
                <th 
                  className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('discountValue')}
                >
                  Discount {sortField === 'discountValue' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('usageCount')}
                >
                  Usage {sortField === 'usageCount' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">Products</th>
                <th 
                  className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('endDate')}
                >
                  Expires {sortField === 'endDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">Status</th>
                <th className="text-center py-4 px-6 font-medium text-gray-900 dark:text-white w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPromoCodes().map((promo) => (
                <tr 
                  key={promo.id} 
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-blue-600 dark:text-blue-400">
                        {promo.code}
                      </span>
                      <button
                        onClick={() => copyPromoCode(promo.code)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Copy code"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {promo.description || '-'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                      </span>
                      {promo.minimumOrderValue && (
                        <span className="text-xs text-gray-500">
                          (min: ${promo.minimumOrderValue})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{promo.usageCount}</span>
                      {promo.usageLimit && (
                        <>
                          <span className="text-gray-400">/</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{promo.usageLimit}</span>
                          {getUsagePercentage(promo) && (
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-500 h-1.5 rounded-full" 
                                style={{ width: `${getUsagePercentage(promo)}%` }}
                              ></div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 text-sm">
                      <Package className="w-3 h-3 text-gray-400" />
                      {promo.allProducts ? 'All Products' : `${promo.applicableProducts.length} products`}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(promo.endDate)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(promo)}
                      <Switch
                        checked={promo.isActive}
                        onChange={() => handleToggleStatus(promo.id)}
                        label=""
                      />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEdit(promo)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleView(promo)}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id, promo.code)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAndSortedPromoCodes().length === 0 && (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No promo codes found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first promo code.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link to="/promo/add">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Promo Code
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </ComponentCard>
      
      {/* Modals */}
      <EditPromoCodeModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedPromoCode(null);
        }}
        promoCode={selectedPromoCode}
        onSave={handleSaveEdit}
      />
      
      <ViewPromoCodeModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedPromoCode(null);
        }}
        promoCode={selectedPromoCode}
      />
    </div>
  );
}