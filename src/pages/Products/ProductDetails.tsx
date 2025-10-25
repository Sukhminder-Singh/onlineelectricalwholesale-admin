import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { productApi, type Product } from "../../services/api";
import { useAttributes, AttributeProvider } from "../../context/AttributeContext";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { availableAttributes } = useAttributes();
  const safeAttributes = Array.isArray(availableAttributes) ? availableAttributes : [];

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const p = await productApi.getById(id);
        setProduct(p);
      } catch (e: any) {
        setError(e?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700 p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product Details</h1>
                  <p className="text-blue-700 dark:text-blue-300">View comprehensive product information and analytics</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H4"/>
                  </svg>
                  Back
                </Button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20 p-4">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading product details...</p>
            </div>
          </div>
        )}

        {product && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Product Information */}
            <div className="xl:col-span-2 space-y-6">
              {/* Product Overview Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Product Image */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        {product.mainImage ? (
                          <img 
                            src={product.mainImage} 
                            alt={product.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <div className={`text-center ${product.mainImage ? 'hidden' : ''}`}>
                          <div className="text-6xl mb-2">📦</div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Product Image</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 break-words">
                          {product.productName}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                          {product.shortDescription}
                        </p>
                      </div>
                      
                      {/* Product Badges */}
                      <div className="flex flex-wrap items-center gap-3 mb-6">
                        <Badge color="primary" size="md">
                          {typeof product.brandId === 'object' ? (product as any).brandId?.name || '-' : product.brandId || '-'}
                        </Badge>
                        <Badge color="info" size="md">SKU: {product.sku}</Badge>
                        <Badge 
                          color={product.status === 'active' ? 'success' : product.status === 'inactive' ? 'warning' : 'light'} 
                          size="md"
                        >
                          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        </Badge>
                      </div>
                      
                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-green-700 dark:text-green-300 font-medium">Price</p>
                              <p className="text-xl font-bold text-green-900 dark:text-green-100">
                                ${Number(product.price || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Stock</p>
                              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                                {product.stock} units
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                              <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Tax Rate</p>
                              <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                                {product.taxRate}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center">
                      <svg className="h-4 w-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(product.categories) ? product.categories : []).map((cat: any, idx: number) => (
                      <Badge key={idx} color="light" size="md">
                        {typeof cat === 'object' ? cat?.name || '-' : String(cat)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center">
                      <svg className="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Information</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Seller</label>
                        <p className="text-gray-900 dark:text-white font-medium">{product.seller || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">SKU</label>
                        <p className="text-gray-900 dark:text-white font-medium">{product.sku || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Compare Price</label>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {product.comparePrice ? `$${Number(product.comparePrice).toFixed(2)}` : '-'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Cost Price</label>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {product.costPrice ? `$${Number(product.costPrice).toFixed(2)}` : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock Threshold</label>
                        <p className="text-gray-900 dark:text-white font-medium">{product.lowStockThreshold || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Guarantee Period</label>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {product.guaranteePeriod ? `${product.guaranteePeriod} days` : '-'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight</label>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {product.weight ? `${product.weight} kg` : '-'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Dimensions</label>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {product.dimensions ? 
                            `${product.dimensions.length || 0} × ${product.dimensions.width || 0} × ${product.dimensions.height || 0} cm` 
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Options */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                      <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Options</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Track Quantity</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.trackQuantity 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {product.trackQuantity ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Is Published</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.isPublished 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {product.isPublished ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Is Returnable</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.isReturnable 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {product.isReturnable ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Is Cancelable</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.isCancelable 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {product.isCancelable ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Attributes */}
              {product.attributes && product.attributes.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                        <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Attributes</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.attributes.map((attr: any, idx: number) => {
                        // Find the corresponding attribute definition from available attributes
                        const attributeDef = safeAttributes.find(availableAttr => availableAttr._id === attr.id);
                        
                        // Get the proper attribute name
                        const getAttributeName = () => {
                          if (attributeDef) {
                            return attributeDef.name;
                          }
                          
                          // Fallback if attribute definition not found
                          if (typeof attr === 'string') {
                            return `Attribute ${idx + 1}`;
                          }
                          
                          if (typeof attr === 'object' && attr !== null) {
                            return attr.name || 
                                   attr.attributeName || 
                                   attr.label || 
                                   attr.title || 
                                   attr.displayName ||
                                   (attr.id && `Attribute ${attr.id.slice(-4)}`) ||
                                   `Attribute ${idx + 1}`;
                          }
                          
                          return `Attribute ${idx + 1}`;
                        };
                        
                        // Get the attribute value
                        const getAttributeValue = () => {
                          if (typeof attr === 'string') {
                            return attr;
                          }
                          
                          if (typeof attr === 'object' && attr !== null) {
                            return attr.value || 
                                   attr.attributeValue || 
                                   attr.data || 
                                   attr.content ||
                                   '-';
                          }
                          
                          return '-';
                        };
                        
                        return (
                          <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {getAttributeName()}
                              </span>
                              {attributeDef && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {attributeDef.type}
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white font-medium">
                              {getAttributeValue()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity Levels */}
              {product.quantityLevels && product.quantityLevels.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
                        <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quantity Levels & Pricing</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {product.quantityLevels.map((level: any, idx: number) => (
                        <div key={idx} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{level.level}</span>
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Level {level.level}</h4>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Min Qty:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{level.minQuantity || '-'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Max Qty:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{level.maxQuantity || '-'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Price:</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {level.price ? `$${Number(level.price).toFixed(2)}` : '-'}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Discount:</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {level.discount ? `${level.discount}%` : '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Fields */}
              {product.additionalFields && product.additionalFields.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-rose-100 dark:bg-rose-900/40 rounded-lg flex items-center justify-center">
                        <svg className="h-4 w-4 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Fields</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {product.additionalFields.map((field: any, idx: number) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</span>
                            <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded">
                              {field.type}
                            </span>
                          </div>
                          <p className="text-gray-900 dark:text-white">{field.value || '-'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SEO Meta Information */}
              {product.meta && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/40 rounded-lg flex items-center justify-center">
                        <svg className="h-4 w-4 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SEO Meta Information</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Meta Title</label>
                      <p className="text-gray-900 dark:text-white mt-1">{product.meta.title || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Meta Description</label>
                      <p className="text-gray-900 dark:text-white mt-1">{product.meta.description || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Meta Keywords</label>
                      <p className="text-gray-900 dark:text-white mt-1">{product.meta.keywords || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {product.longDescription && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/40 rounded-lg flex items-center justify-center">
                        <svg className="h-4 w-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {product.longDescription}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                </div>
                <div className="p-6 space-y-3">
                  <Button variant="primary" className="w-full justify-center" onClick={() => product?._id && navigate(`/product/edit/${product._id}`)}>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Product
                  </Button>
                  <Button variant="outline" className="w-full justify-center" onClick={() => navigate('/product/manage')}>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Back to Manage
                  </Button>
                </div>
              </div>

              {/* Parcel Information */}
              {product.parcel && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Parcel Information</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Width</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{product.parcel.width} cm</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Height</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{product.parcel.height} cm</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Length</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{product.parcel.length} cm</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Weight</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{product.parcel.weight} kg</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Statistics</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Views</span>
                    <span className="font-semibold text-gray-900 dark:text-white">-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Orders</span>
                    <span className="font-semibold text-gray-900 dark:text-white">-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                    <span className="font-semibold text-gray-900 dark:text-white">-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Updated</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductDetailsWrapper() {
  return (
    <AttributeProvider>
      <ProductDetails />
    </AttributeProvider>
  );
}
