import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Star, StarOff, GripVertical, Eye, Edit, Trash2, RefreshCcw } from 'lucide-react';
import { productApi, type Product } from '../../services/api';
import { showSuccessToast, showErrorToast } from '../ui/toast';
import Button from '../ui/button/Button';
import Badge from '../ui/badge/Badge';

interface FeaturedProductsManagerProps {
  onProductSelect?: (product: Product) => void;
  onProductEdit?: (product: Product) => void;
  onProductDelete?: (product: Product) => void;
}

export default function FeaturedProductsManager({
  onProductSelect,
  onProductEdit,
  onProductDelete
}: FeaturedProductsManagerProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try the dedicated featured endpoint first
      let response;
      try {
        response = await productApi.getFeatured();
      } catch (featuredError) {
        // If featured endpoint fails, use regular products API with filter
        console.warn('Featured endpoint failed, using regular products API with filter');
        response = await productApi.getAllAdmin({
          limit: 100
        });
      }
      
      // Debug: Log the response to see what's being returned
      console.log('Featured products API response:', response);
      console.log('Raw products data:', response.data);
      
      // Filter to ensure only truly featured products are shown
      // Only show products where isFeatured is explicitly true
      const trulyFeatured = response.data.filter(product => {
        // Strict check for true boolean value only
        const isFeatured = product.isFeatured === true;
        console.log(`Product ${product.productName} (${product._id}): isFeatured = ${product.isFeatured}, type = ${typeof product.isFeatured}, filtered = ${isFeatured}`);
        
        // Additional logging for debugging
        if (product.isFeatured !== true && product.isFeatured !== false) {
          console.warn(`Product ${product.productName} has unexpected isFeatured value:`, product.isFeatured, typeof product.isFeatured);
        }
        
        return isFeatured;
      });
      
      console.log('Filtered featured products:', trulyFeatured);
      console.log(`Total products received: ${response.data.length}, Featured products: ${trulyFeatured.length}`);
      
      setFeaturedProducts(trulyFeatured);
    } catch (err: any) {
      setError(err?.message || 'Failed to load featured products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);


  const handleUnsetFeatured = async (productId: string) => {
    try {
      setUpdating(productId);
      await productApi.unsetFeatured(productId);
      showSuccessToast('Product Unfeatured', 'Product has been removed from featured');
      fetchFeaturedProducts();
    } catch (err: any) {
      showErrorToast('Error', err?.message || 'Failed to remove product from featured');
    } finally {
      setUpdating(null);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(featuredProducts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFeaturedProducts(items);

    // Update the order in the backend
    try {
      await productApi.updateFeaturedOrder(reorderedItem._id!, result.destination.index + 1);
      showSuccessToast('Order Updated', 'Featured product order has been updated');
    } catch (err: any) {
      showErrorToast('Error', err?.message || 'Failed to update featured order');
      // Revert on error
      fetchFeaturedProducts();
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

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500 dark:text-gray-400">Loading featured products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Featured Products
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage featured products and their display order
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFeaturedProducts}
            className="flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
        </div>
      )}


      {/* Featured Products List */}
      <div className="p-6">
        {featuredProducts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No featured products
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Add products to featured section to highlight them on your storefront.
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="featured-products">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {featuredProducts.map((product, index) => (
                    <Draggable
                      key={product._id}
                      draggableId={product._id!}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 transition-all ${
                            snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="flex-shrink-0 cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="w-5 h-5 text-gray-400" />
                            </div>

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
                                      Order: {product.featuredOrder || index + 1}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 ml-4">
                                  <button
                                    onClick={() => onProductSelect?.(product)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                    title="View product details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => onProductEdit?.(product)}
                                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                    title="Edit product"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleUnsetFeatured(product._id!)}
                                    disabled={updating === product._id}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors disabled:opacity-50"
                                    title="Remove from featured"
                                  >
                                    {updating === product._id ? (
                                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <StarOff className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => onProductDelete?.(product)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                    title="Delete product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
