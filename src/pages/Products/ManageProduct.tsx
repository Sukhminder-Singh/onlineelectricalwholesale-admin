import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import { Eye, Edit, Trash2, RefreshCcw, Star, Plus } from "lucide-react";
import { productApi, type Product } from "../../services/api";
import { showSuccessToast, showErrorToast } from "../../components/ui/toast";
import FeaturedProductsManager from "../../components/products/FeaturedProductsManager";
import AddToFeaturedModal from "../../components/products/AddToFeaturedModal";

// (Removed star rendering; not part of API data)

// Note: Real products will be fetched from API

// Category options for filter
const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: "Electronics", label: "Electronics" },
    { value: "Clothing", label: "Clothing" },
    { value: "Home & Garden", label: "Home & Garden" },
    { value: "Sports", label: "Sports" },
    { value: "Books", label: "Books" },
];

// Brand options for filter
const brandOptions = [
    { value: "", label: "All Brands" },
    { value: "Sony", label: "Sony" },
    { value: "Apple", label: "Apple" },
    { value: "Nike", label: "Nike" },
    { value: "HydroFlask", label: "HydroFlask" },
    { value: "JBL", label: "JBL" },
];

// Status options for filter (align with API: active | inactive | draft)
const statusOptions = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "draft", label: "Draft" },
];

export default function ManageProduct() {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});
    const [activeTab, setActiveTab] = useState<'all' | 'featured'>('all');
    const [showAddToFeaturedModal, setShowAddToFeaturedModal] = useState(false);
    const [featuredProductIds, setFeaturedProductIds] = useState<string[]>([]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await productApi.getAllAdmin({
                page,
                limit,
                status: selectedStatus || 'all',
                category: selectedCategory || undefined,
                brand: selectedBrand || undefined,
            });
            // res.data contains products per our normalizer
            setProducts(res.data as unknown as Product[]);
            setTotal(res.total);
        } catch (e: any) {
            setError(e?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchFeaturedProductIds = async () => {
        try {
            const response = await productApi.getFeatured();
            const featuredIds = response.data
                .filter(product => product.isFeatured === true)
                .map(product => product._id!);
            setFeaturedProductIds(featuredIds);
        } catch (err) {
            console.warn('Failed to fetch featured product IDs:', err);
        }
    };

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, selectedCategory, selectedBrand, selectedStatus]);

    useEffect(() => {
        if (showAddToFeaturedModal) {
            fetchFeaturedProductIds();
        }
    }, [showAddToFeaturedModal]);

    // Filter products based on selected filters
    const filteredProducts = useMemo(() => products, [products]);

    // Handle stock update
    const handleStockUpdate = (productId: number, newStock: number) => {
        setStockUpdates(prev => ({
            ...prev,
            [productId]: newStock
        }));
    };

    // Get status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "success";
            case "inactive":
                return "warning";
            case "out-of-stock":
                return "error";
            default:
                return "light";
        }
    };

    // Small status badge component
    const StatusBadge = ({ status }: { status: string }) => {
        const color = getStatusColor(status);
        const colorClasses = {
            success: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
            warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
            error: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
            light: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        };
        // Replace hyphens with non-breaking hyphens for better appearance
        const displayStatus = status.replace(/-/g, "\u2011").replace(/_/g, " ").toUpperCase();
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
                {displayStatus}
            </span>
        );
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Product Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage your products, update stock, and view customer reviews
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'all'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            All Products
                        </button>
                        <button
                            onClick={() => setActiveTab('featured')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'featured'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            Featured Products
                        </button>
                    </nav>
                </div>
            </div>

            {/* All Products Tab Content */}
            {activeTab === 'all' && (
                <>
                    {/* Filters */}
                    <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Filter by Category
                        </label>
                        <Select
                            options={categoryOptions}
                            placeholder="Select Category"
                            onChange={setSelectedCategory}
                            defaultValue={selectedCategory}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Filter by Brand
                        </label>
                        <Select
                            options={brandOptions}
                            placeholder="Select Brand"
                            onChange={setSelectedBrand}
                            defaultValue={selectedBrand}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Filter by Status
                        </label>
                        <Select
                            options={statusOptions}
                            placeholder="Select Status"
                            onChange={setSelectedStatus}
                            defaultValue={selectedStatus}
                        />
                    </div>
                    <div className="flex items-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSelectedCategory("");
                                setSelectedBrand("");
                                setSelectedStatus("");
                                setPage(1);
                            }}
                            className="h-11 px-4"
                        >
                            Clear Filters
                        </Button>
                        <Button
                            variant="outline"
                            onClick={fetchProducts}
                            className="h-11 px-3"
                            title="Refresh"
                        >
                            <RefreshCcw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
                        </div>
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">P</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Active Products</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {filteredProducts.filter((p: any) => p.status === "active").length}
                            </p>
                        </div>
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 dark:text-green-400 text-sm font-semibold">✓</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {filteredProducts.filter((p: any) => (p.stock ?? 0) < 20 && (p.stock ?? 0) > 0).length}
                            </p>
                        </div>
                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                            <span className="text-yellow-600 dark:text-yellow-400 text-sm font-semibold">!</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {filteredProducts.filter((p: any) => (p.stock ?? 0) === 0).length}
                            </p>
                        </div>
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                            <span className="text-red-600 dark:text-red-400 text-sm font-semibold">×</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {error && (
                    <div className="p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
                )}
                {loading && (
                    <div className="p-3 text-sm text-gray-600 dark:text-gray-300">Loading...</div>
                )}
                <div className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader className="bg-gray-50 dark:bg-gray-700">
                            <TableRow>
                                <TableCell isHeader className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-base w-1/3">
                                    Product
                                </TableCell>
                                <TableCell isHeader className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-base w-24">
                                    Brand
                                </TableCell>
                                <TableCell isHeader className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-base w-24">
                                    Category
                                </TableCell>
                                <TableCell isHeader className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-base w-20">
                                    Price
                                </TableCell>
                                <TableCell isHeader className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-base w-24">
                                    Stock
                                </TableCell>
                                <TableCell isHeader className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-base w-20">
                                    Status
                                </TableCell>
                                <TableCell isHeader className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-base w-20">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredProducts.map((product: any) => (
                                <TableRow key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <TableCell className="px-4 py-3 w-1/3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-14 h-14 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0">
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
                                                <div className={`w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 ${product.mainImage ? 'hidden' : ''}`}>
                                                    📦
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-medium text-gray-900 dark:text-white text-base leading-tight break-words">
                                                    {product.productName}
                                                </h3>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {/* Rating not available in API */}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                                                        SKU: {product.sku}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 w-24">
                                        <Badge color="primary" size="sm">
                                            {typeof product.brandId === 'object' && product.brandId?.name ? product.brandId.name : (product.brandId || '-')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 w-24">
                                        <Badge color="info" size="sm">
                                            {Array.isArray(product.categories) && product.categories[0]
                                                ? (typeof product.categories[0] === 'object' && product.categories[0]?.name
                                                    ? product.categories[0].name
                                                    : String(product.categories[0]))
                                                : '-'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 w-20">
                                        <span className="font-medium text-gray-900 dark:text-white text-base">
                                            ${Number(product.price || 0).toFixed(2)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 w-24">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                value={stockUpdates[product._id] ?? product.stock}
                                                onChange={(e) => handleStockUpdate(product._id, parseInt(e.target.value) || 0)}
                                                className="w-20 h-8 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={async () => {
                                                    try {
                                                        const qty = stockUpdates[product._id] ?? product.stock;
                                                        await productApi.updateStock(product._id, Number(qty));
                                                        showSuccessToast(
                                                            'Stock Updated',
                                                            `Stock for ${product.productName} has been updated to ${qty} units.`
                                                        );
                                                        fetchProducts();
                                                    } catch (error: any) {
                                                        showErrorToast(
                                                            'Update Failed',
                                                            error?.message || 'Failed to update stock. Please try again.'
                                                        );
                                                    }
                                                }}
                                                className="text-xs px-2 py-1 h-7"
                                            >
                                                Update
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 w-20">
                                        <StatusBadge status={product.status} />
                                    </TableCell>
                                    <TableCell className="px-4 py-3 w-20">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    // View product details
                                                    navigate(`/product/details/${product._id}`);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                title="View product details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // Navigate to edit product page
                                                    navigate(`/product/edit/${product._id}`);
                                                }}
                                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                                title="Edit product"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            {!product.isFeatured && (
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await productApi.setFeatured(product._id!);
                                                            showSuccessToast(
                                                                'Product Featured',
                                                                `${product.productName} has been added to featured products.`
                                                            );
                                                            await fetchProducts();
                                                        } catch (e: any) {
                                                            showErrorToast(
                                                                'Feature Failed',
                                                                e?.message || "Failed to set product as featured. Please try again."
                                                            );
                                                        }
                                                    }}
                                                    className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                                                    title="Set as featured"
                                                >
                                                    <Star className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={async () => {
                                                    // Delete product
                                                    const confirmed = window.confirm("Are you sure you want to delete this product? This action can be undone only by restoring from archive.");
                                                    if (!confirmed) return;
                                                    try {
                                                        await productApi.delete(product._id);
                                                        showSuccessToast(
                                                            'Product Deleted',
                                                            `${product.productName} has been deleted successfully.`
                                                        );
                                                        await fetchProducts();
                                                    } catch (e: any) {
                                                        showErrorToast(
                                                            'Delete Failed',
                                                            e?.message || "Failed to delete product. Please try again."
                                                        );
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                title="Delete product"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

                    {/* Empty state */}
                    {(!loading && filteredProducts.length === 0) && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <span className="text-gray-400 text-2xl">📦</span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No products found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Try adjusting your filters or add new products.
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Featured Products Tab Content */}
            {activeTab === 'featured' && (
                <div className="space-y-6">
                    {/* Featured Products Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Featured Products Management
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage which products are featured on your storefront
                            </p>
                        </div>
                        <Button
                            onClick={() => {
                                setShowAddToFeaturedModal(true);
                            }}
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Product to Featured
                        </Button>
                    </div>

                    {/* Featured Products Manager */}
                    <FeaturedProductsManager
                        onProductSelect={(product) => navigate(`/product/details/${product._id}`)}
                        onProductEdit={(product) => navigate(`/product/edit/${product._id}`)}
                        onProductDelete={async (product) => {
                            const confirmed = window.confirm("Are you sure you want to delete this product? This action cannot be undone.");
                            if (!confirmed) return;
                            try {
                                await productApi.delete(product._id!);
                                showSuccessToast('Product Deleted', `${product.productName} has been deleted successfully.`);
                            } catch (e: any) {
                                showErrorToast('Delete Failed', e?.message || "Failed to delete product. Please try again.");
                            }
                        }}
                    />
                </div>
            )}

            {/* Add to Featured Modal */}
            <AddToFeaturedModal
                isOpen={showAddToFeaturedModal}
                onClose={() => setShowAddToFeaturedModal(false)}
                onProductAdded={() => {
                    // Refresh featured products if we're on that tab
                    if (activeTab === 'featured') {
                        // The FeaturedProductsManager will handle its own refresh
                    }
                }}
                excludeIds={featuredProductIds}
            />
        </div>
    );
}
