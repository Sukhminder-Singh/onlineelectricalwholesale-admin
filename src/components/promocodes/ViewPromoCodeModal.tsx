import { Modal } from "../ui/modal";
import Badge from "../ui/badge/Badge";
import { 
  X, 
  Eye, 
  Calendar, 
  Tag, 
  Users, 
  Package, 
  Percent, 
  DollarSign,
  TrendingUp,
  Clock
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  image?: string;
  sku: string;
  price: number;
  category?: string;
}

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
  applicableProducts: Product[];
  allProducts: boolean;
  createdAt: string;
}

interface ViewPromoCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoCode: PromoCode | null;
}

export default function ViewPromoCodeModal({ isOpen, onClose, promoCode }: ViewPromoCodeModalProps) {
  if (!promoCode) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = () => {
    const now = new Date();
    const startDate = new Date(promoCode.startDate);
    const endDate = new Date(promoCode.endDate);

    if (!promoCode.isActive) {
      return <Badge color="light">Inactive</Badge>;
    }

    if (now < startDate) {
      return <Badge color="info">Scheduled</Badge>;
    }

    if (now > endDate) {
      return <Badge color="error">Expired</Badge>;
    }

    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      return <Badge color="warning">Limit Reached</Badge>;
    }

    return <Badge color="success">Active</Badge>;
  };

  const getUsagePercentage = () => {
    if (!promoCode.usageLimit) return null;
    return Math.round((promoCode.usageCount / promoCode.usageLimit) * 100);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-4xl mx-auto">
      <div className="p-4 sm:p-6 lg:p-8 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
            <Eye className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Promo Code Details
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {promoCode.code} • View promo code information and statistics
            </p>
          </div>
        </div>

        {/* Promo Code Info Card */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <Tag className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {promoCode.code}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {promoCode.description || 'No description'}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-semibold text-gray-900 dark:text-white">
                {promoCode.discountType === 'percentage' ? `${promoCode.discountValue}%` : `$${promoCode.discountValue}`} OFF
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Used {promoCode.usageCount} times
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Tag className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>
              <div className="ml-auto">
                {getStatusBadge()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Promo Code
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-blue-600 dark:text-blue-400">
                    {promoCode.code}
                  </code>
                  <button
                    onClick={() => copyToClipboard(promoCode.code)}
                    className="px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Discount
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                  {promoCode.discountType === 'percentage' ? (
                    <Percent className="w-4 h-4 text-green-500" />
                  ) : (
                    <DollarSign className="w-4 h-4 text-green-500" />
                  )}
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {promoCode.discountType === 'percentage' ? `${promoCode.discountValue}%` : `$${promoCode.discountValue}`}
                  </span>
                  <span className="text-sm text-gray-500">
                    {promoCode.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                  </span>
                </div>
              </div>

              {promoCode.minimumOrderValue && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Order Value
                  </label>
                  <div className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <span className="font-medium">${promoCode.minimumOrderValue}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Created Date
                </label>
                <div className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <span>{formatDate(promoCode.createdAt)}</span>
                </div>
              </div>
            </div>

            {promoCode.description && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <div className="px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <span>{promoCode.description}</span>
                </div>
              </div>
            )}
          </div>

          {/* Usage Statistics */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Usage Statistics</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Times Used</span>
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {promoCode.usageCount.toLocaleString()}
                </div>
                {promoCode.usageLimit && (
                  <div className="text-sm text-gray-500">
                    of {promoCode.usageLimit.toLocaleString()} limit
                  </div>
                )}
              </div>

              {promoCode.usageLimit && (
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-2 mb-3">
                    <Percent className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Usage Rate</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-3">
                    {getUsagePercentage()}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${getUsagePercentage()}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {promoCode.usagePerCustomer && (
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Per Customer</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {promoCode.usagePerCustomer}
                  </div>
                  <div className="text-sm text-gray-500">
                    usage limit
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Date Range</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span>{formatDate(promoCode.startDate)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span>{formatDate(promoCode.endDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Applicable Products */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Applicable Products</h3>
            </div>

            {promoCode.allProducts ? (
              <div className="text-center py-12 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                <Package className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
                <p className="text-green-600 font-semibold text-lg mb-2">All Products</p>
                <p className="text-gray-600 dark:text-gray-400">This promo code applies to all products in your store</p>
              </div>
            ) : (
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Selected Products ({promoCode.applicableProducts.length})
                </div>
                {promoCode.applicableProducts.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {promoCode.applicableProducts.map(product => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.sku} • ${product.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-gray-700 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
                    <p className="text-gray-500">No specific products selected</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}