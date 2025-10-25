import { useState, useEffect } from 'react';
import { Search, Star, X, Loader2 } from 'lucide-react';
import { productApi, type Product } from '../../services/api';
import { showSuccessToast, showErrorToast } from '../ui/toast';
import Button from '../ui/button/Button';
import Badge from '../ui/badge/Badge';

interface AddToFeaturedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
  excludeIds?: string[];
}

export default function AddToFeaturedModal({
  isOpen,
  onClose,
  onProductAdded,
  excludeIds = []
}: AddToFeaturedModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // Try with search first, fallback to no search if it fails
      let response;
      try {
        response = await productApi.getAllAdmin({
          search: searchQuery || undefined,
          status: 'active',
          limit: 50
        });
      } catch (searchError) {
        console.warn('Search failed, trying without search:', searchError);
        try {
          response = await productApi.getAllAdmin({
            status: 'active',
            limit: 50
          });
        } catch (statusError) {
          console.warn('Status filter failed, trying without filters:', statusError);
          response = await productApi.getAllAdmin({
            limit: 50
          });
        }
      }
      
      console.log('AddToFeaturedModal - API Response:', response);
      console.log('AddToFeaturedModal - Exclude IDs:', excludeIds);
      console.log('AddToFeaturedModal - Search Query:', searchQuery);
      
      // Filter out already featured products and excluded IDs
      let filteredProducts = response.data.filter(product => {
        const isNotFeatured = product.isFeatured !== true;
        const isNotExcluded = !excludeIds.includes(product._id!);
        console.log(`Product ${product.productName} (${product._id}): isFeatured=${product.isFeatured}, isNotFeatured=${isNotFeatured}, isNotExcluded=${isNotExcluded}, included=${isNotFeatured && isNotExcluded}`);
        return isNotFeatured && isNotExcluded;
      });

      // If we have a search query and backend search didn't work, do client-side filtering
      if (searchQuery && filteredProducts.length === 0 && response.data.length > 0) {
        console.log('Backend search may have failed, trying client-side search');
        const allNonFeatured = response.data.filter(product => {
          const isNotFeatured = product.isFeatured !== true;
          const isNotExcluded = !excludeIds.includes(product._id!);
          return isNotFeatured && isNotExcluded;
        });
        
        filteredProducts = allNonFeatured.filter(product => 
          product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof product.brandId === 'object' && (product.brandId as any)?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (typeof product.brandId === 'string' && product.brandId.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      console.log(`AddToFeaturedModal - Total products: ${response.data.length}, Filtered products: ${filteredProducts.length}`);
      
      // If no products after filtering, show all products for debugging
      if (filteredProducts.length === 0 && response.data.length > 0) {
        console.warn('No products after filtering, showing all products for debugging');
        setProducts(response.data.slice(0, 10)); // Show first 10 for debugging
      } else {
        setProducts(filteredProducts);
      }
    } catch (err: any) {
      console.error('AddToFeaturedModal - Error:', err);
      setError(err?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (isOpen) {
      // Clear existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      // Set new timeout for search
      const timeout = setTimeout(() => {
        fetchProducts();
      }, 300); // 300ms delay
      
      setSearchTimeout(timeout);
      
      // Cleanup function
      return () => {
        if (timeout) {
          clearTimeout(timeout);
        }
      };
    }
  }, [isOpen, searchQuery]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleAddToFeatured = async (productId: string) => {
    try {
      setAdding(productId);
      await productApi.setFeatured(productId);
      showSuccessToast('Product Featured', 'Product has been added to featured section');
      onProductAdded();
      onClose();
    } catch (err: any) {
      showErrorToast('Error', err?.message || 'Failed to add product to featured');
    } finally {
      setAdding(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      case "draft":
        return "light";
      default:
        return "light";
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const color = getStatusColor(status);
    const colorClasses = {
      success: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
      warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
      light: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
    };
    const displayStatus = status.replace(/-/g, "\u2011").replace(/_/g, " ").toUpperCase();
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
        {displayStatus}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add Product to Featured
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select a product to add to the featured section
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {searchQuery ? 'Searching products...' : 'Loading products...'}
              </span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Try adjusting your search terms.' : 'No available products to feature.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0">
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
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-gray-400 ${product.mainImage ? 'hidden' : ''}`}>
                        📦
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-base leading-tight">
                            {product.productName}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              SKU: {product.sku}
                            </span>
                                    <Badge color="primary" size="sm">
                                      {typeof product.brandId === 'object' && (product.brandId as any)?.name 
                                        ? (product.brandId as any).name 
                                        : (product.brandId || '-')}
                                    </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              ${Number(product.price || 0).toFixed(2)}
                            </span>
                            <StatusBadge status={product.status} />
                            <Badge color="info" size="sm">
                              Stock: {product.stock}
                            </Badge>
                          </div>
                        </div>

                        {/* Add Button */}
                        <Button
                          onClick={() => handleAddToFeatured(product._id!)}
                          disabled={adding === product._id}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          {adding === product._id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Star className="w-4 h-4" />
                              Add to Featured
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
