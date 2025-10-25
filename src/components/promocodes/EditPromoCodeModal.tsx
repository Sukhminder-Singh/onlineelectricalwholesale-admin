import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Switch from "../form/switch/Switch";
import { showSuccessToast, showErrorToast } from "../ui/toast";
import { Search, X, Package, Tag, Edit3 } from "lucide-react";

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

interface EditPromoCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoCode: PromoCode | null;
  onSave: (updatedPromoCode: PromoCode) => void;
}

const mockProducts: Product[] = [
  { id: '1', name: 'Wireless Bluetooth Headphones', sku: 'WBH-001', price: 99.99, category: 'Electronics' },
  { id: '2', name: 'Smart Phone Case', sku: 'SPC-002', price: 29.99, category: 'Accessories' },
  { id: '3', name: 'USB-C Cable 2m', sku: 'USB-003', price: 19.99, category: 'Cables' },
  { id: '4', name: 'Portable Power Bank', sku: 'PPB-004', price: 49.99, category: 'Electronics' },
  { id: '5', name: 'Laptop Stand Adjustable', sku: 'LSA-005', price: 39.99, category: 'Accessories' },
];

export default function EditPromoCodeModal({ isOpen, onClose, promoCode, onSave }: EditPromoCodeModalProps) {
  const [formData, setFormData] = useState<PromoCode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (promoCode) {
      setFormData({
        ...promoCode,
        startDate: new Date(promoCode.startDate).toISOString().slice(0, 16),
        endDate: new Date(promoCode.endDate).toISOString().slice(0, 16),
      });
    }
  }, [promoCode]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = mockProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm]);

  if (!formData) return null;

  const handleInputChange = (field: keyof PromoCode, value: string | boolean | number) => {
    setFormData(prev => prev ? ({
      ...prev,
      [field]: value
    }) : null);
  };

  const handleSelectChange = (field: keyof PromoCode, value: string) => {
    setFormData(prev => prev ? ({
      ...prev,
      [field]: value
    }) : null);
  };

  const addProduct = (product: Product) => {
    if (formData && !formData.applicableProducts.find(p => p.id === product.id)) {
      setFormData(prev => prev ? ({
        ...prev,
        applicableProducts: [...prev.applicableProducts, product]
      }) : null);
    }
    setSearchTerm('');
    setFilteredProducts([]);
  };

  const removeProduct = (productId: string) => {
    setFormData(prev => prev ? ({
      ...prev,
      applicableProducts: prev.applicableProducts.filter(p => p.id !== productId)
    }) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.code || !formData.discountValue || !formData.startDate || !formData.endDate) {
        showErrorToast('Validation Error', 'Please fill in all required fields');
        return;
      }

      if (!formData.allProducts && formData.applicableProducts.length === 0) {
        showErrorToast('Validation Error', 'Please select applicable products or choose "All Products"');
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedPromoCode = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      onSave(updatedPromoCode);
      showSuccessToast('Success', 'Promo code updated successfully!');
      onClose();
    } catch (error) {
      showErrorToast('Error', 'Failed to update promo code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const discountTypeOptions = [
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'fixed', label: 'Fixed Amount ($)' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-4xl mx-auto">
      <div className="p-4 sm:p-6 lg:p-8 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
            <Edit3 className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Promo Code
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {formData.code} • Update promo code settings and configuration
            </p>
          </div>
        </div>

        {/* Promo Code Info Card */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {formData.code}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formData.description || 'No description'}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-semibold text-gray-900 dark:text-white">
                {formData.discountType === 'percentage' ? `${formData.discountValue}%` : `$${formData.discountValue}`}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Used {formData.usageCount} times
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Promo Code *
              </label>
              <Input
                id="promoCode"
                type="text"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                placeholder="Enter promo code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Discount Type *
              </label>
              <Select
                options={discountTypeOptions}
                value={formData.discountType}
                onChange={(value) => handleSelectChange('discountType', value)}
                placeholder="Select discount type"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Discount Value * {formData.discountType === 'percentage' ? '(%)' : '($)'}
              </label>
              <Input
                id="discountValue"
                type="number"
                value={formData.discountValue.toString()}
                onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                placeholder={formData.discountType === 'percentage' ? 'e.g., 10' : 'e.g., 50.00'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Order Value ($)
              </label>
              <Input
                id="minimumOrderValue"
                type="number"
                value={formData.minimumOrderValue?.toString() || ''}
                onChange={(e) => handleInputChange('minimumOrderValue', e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="e.g., 100.00"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the promo code"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Usage Limit
              </label>
              <Input
                id="usageLimit"
                type="number"
                value={formData.usageLimit?.toString() || ''}
                onChange={(e) => handleInputChange('usageLimit', e.target.value ? parseInt(e.target.value) : '')}
                placeholder="Leave empty for unlimited"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Usage Per Customer
              </label>
              <Input
                id="usagePerCustomer"
                type="number"
                value={formData.usagePerCustomer?.toString() || ''}
                onChange={(e) => handleInputChange('usagePerCustomer', e.target.value ? parseInt(e.target.value) : '')}
                placeholder="e.g., 1"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </div>
          </div>

          {/* Product Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Applicable Products
            </label>
            
            {/* All Products Toggle */}
            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <Package className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-blue-800 dark:text-blue-300 font-medium mb-1">
                      Apply to All Products
                    </p>
                    <p className="text-blue-700 dark:text-blue-400">
                      Toggle this to apply the promo code to all products in your store
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.allProducts}
                  onChange={(checked) => {
                    handleInputChange('allProducts', checked);
                    if (checked) {
                      setFormData(prev => prev ? ({ ...prev, applicableProducts: [] }) : null);
                    }
                  }}
                  label="Apply to all products"
                />
              </div>
            </div>

            {!formData.allProducts && (
              <div className="space-y-4">
                {/* Product Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Products
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Search Results */}
                  {filteredProducts.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredProducts.map(product => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => addProduct(product)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                        >
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.sku} • ${product.price}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Products */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selected Products ({formData.applicableProducts.length})
                  </label>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {formData.applicableProducts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No products selected</p>
                        <p>Search and add products above</p>
                      </div>
                    ) : (
                      formData.applicableProducts.map(product => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.sku} • ${product.price}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProduct(product.id)}
                            className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {formData.allProducts && (
              <div className="text-center py-8 text-green-600 text-sm border border-dashed border-green-300 dark:border-green-600 rounded-lg bg-green-50 dark:bg-green-500/10">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">All Products Selected</p>
                <p>This promo code will apply to all products in your store</p>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <Switch
              checked={formData.isActive}
              onChange={(checked) => handleInputChange('isActive', checked)}
              label="Active Status"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formData.isActive ? 'Promo code is active' : 'Promo code is inactive'}
            </span>
          </div>
        </form>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit({} as React.FormEvent)}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-auto"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isSubmitting ? 'Updating...' : 'Update Promo Code'}
          </button>
        </div>
      </div>
    </Modal>
  );
}