import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import TextArea from "../../components/form/input/TextArea";
import Switch from "../../components/form/switch/Switch";
import Button from "../../components/ui/button/Button";
import ComponentCard from "../../components/common/ComponentCard";
import { showSuccessToast, showErrorToast } from "../../components/ui/toast";
import { Search, X, Package, Tag, Calendar, Percent } from "lucide-react";

interface Product {
  id: string;
  name: string;
  image?: string;
  sku: string;
  price: number;
  category?: string;
}

interface PromoCodeFormData {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  minimumOrderValue: string;
  usageLimit: string;
  usagePerCustomer: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableProducts: Product[];
  allProducts: boolean;
}

const mockProducts: Product[] = [
  { id: '1', name: 'Wireless Bluetooth Headphones', sku: 'WBH-001', price: 99.99, category: 'Electronics' },
  { id: '2', name: 'Smart Phone Case', sku: 'SPC-002', price: 29.99, category: 'Accessories' },
  { id: '3', name: 'USB-C Cable 2m', sku: 'USB-003', price: 19.99, category: 'Cables' },
  { id: '4', name: 'Portable Power Bank', sku: 'PPB-004', price: 49.99, category: 'Electronics' },
  { id: '5', name: 'Laptop Stand Adjustable', sku: 'LSA-005', price: 39.99, category: 'Accessories' },
];

export default function AddPromoCode() {
  const [formData, setFormData] = useState<PromoCodeFormData>({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minimumOrderValue: '',
    usageLimit: '',
    usagePerCustomer: '',
    startDate: '',
    endDate: '',
    isActive: true,
    applicableProducts: [],
    allProducts: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleInputChange = (field: keyof PromoCodeFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectChange = (field: keyof PromoCodeFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generatePromoCode = () => {
    const randomCode = 'PROMO' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, code: randomCode }));
  };

  const addProduct = (product: Product) => {
    if (!formData.applicableProducts.find(p => p.id === product.id)) {
      setFormData(prev => ({
        ...prev,
        applicableProducts: [...prev.applicableProducts, product]
      }));
    }
    setSearchTerm('');
    setFilteredProducts([]);
  };

  const removeProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      applicableProducts: prev.applicableProducts.filter(p => p.id !== productId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      
      console.log('Promo Code Data:', formData);
      showSuccessToast('Success', 'Promo code created successfully!');
      
      // Reset form
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minimumOrderValue: '',
        usageLimit: '',
        usagePerCustomer: '',
        startDate: '',
        endDate: '',
        isActive: true,
        applicableProducts: [],
        allProducts: false,
      });
    } catch (error) {
      showErrorToast('Error', 'Failed to create promo code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const discountTypeOptions = [
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'fixed', label: 'Fixed Amount ($)' }
  ];

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Add Promo Code" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <ComponentCard title="Promo Code Details">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="promoCode">Promo Code *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="promoCode"
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generatePromoCode}
                      className="px-4 py-2 text-sm"
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="discountType">Discount Type *</Label>
                  <Select
                    options={discountTypeOptions}
                    value={formData.discountType}
                    onChange={(value) => handleSelectChange('discountType', value)}
                    placeholder="Select discount type"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="discountValue">
                    Discount Value * {formData.discountType === 'percentage' ? '(%)' : '($)'}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => handleInputChange('discountValue', e.target.value)}
                    placeholder={formData.discountType === 'percentage' ? 'e.g., 10' : 'e.g., 50.00'}
                  />
                </div>

                <div>
                  <Label htmlFor="minimumOrderValue">Minimum Order Value ($)</Label>
                  <Input
                    id="minimumOrderValue"
                    type="number"
                    value={formData.minimumOrderValue}
                    onChange={(e) => handleInputChange('minimumOrderValue', e.target.value)}
                    placeholder="e.g., 100.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e)}
                  placeholder="Brief description of the promo code"
                  rows={3}
                />
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="usageLimit">Total Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => handleInputChange('usageLimit', e.target.value)}
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div>
                  <Label htmlFor="usagePerCustomer">Usage Per Customer</Label>
                  <Input
                    id="usagePerCustomer"
                    type="number"
                    value={formData.usagePerCustomer}
                    onChange={(e) => handleInputChange('usagePerCustomer', e.target.value)}
                    placeholder="e.g., 1"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.isActive}
                  onChange={(checked) => handleInputChange('isActive', checked)}
                  label="Active"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="px-8"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Promo Code'}
                </Button>
              </div>
            </form>
          </ComponentCard>
        </div>

        {/* Product Selection Sidebar */}
        <div className="lg:col-span-1">
          <ComponentCard title="Applicable Products">
            <div className="space-y-4">
              {/* All Products Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium">Apply to all products</span>
                <Switch
                  checked={formData.allProducts}
                  onChange={(checked) => {
                    handleInputChange('allProducts', checked);
                    if (checked) {
                      setFormData(prev => ({ ...prev, applicableProducts: [] }));
                    }
                  }}
                  label="Apply to all products"
                />
              </div>

              {!formData.allProducts && (
                <>
                  {/* Product Search */}
                  <div className="relative">
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
                  <div className="space-y-2">
                    <Label>Selected Products ({formData.applicableProducts.length})</Label>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {formData.applicableProducts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                          No products selected. Search and add products above.
                        </div>
                      ) : (
                        formData.applicableProducts.map(product => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{product.name}</div>
                              <div className="text-xs text-gray-500">{product.sku}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeProduct(product.id)}
                              className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}

              {formData.allProducts && (
                <div className="text-center py-8 text-green-600 text-sm">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  This promo code will apply to all products in your store.
                </div>
              )}
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}