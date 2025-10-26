import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Switch from "../../components/form/switch/Switch";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { useCategories } from "../../context/CategoryContext";
import { CategoryNode } from "../../services/api";
import { LoadingSpinner } from "../../components/ui/loading";
import { Search, Eye, EyeOff, AlertTriangle, ChevronDown, ChevronRight, Trash2, Edit } from "lucide-react";
import { Link } from "react-router-dom";

export type CategoryNodeType = CategoryNode;

// ✅ Toggle children recursively
export const toggleActiveStatus = (node: CategoryNodeType, isActive: boolean): CategoryNodeType => ({
    ...node,
    isActive,
    children: node.children?.map(child => toggleActiveStatus(child, isActive)) || [],
});

// ✅ Assign parent references to each node with improved logic
const assignParents = (
    nodes: CategoryNodeType[],
    parent: CategoryNodeType | null = null
): CategoryNodeType[] => {
    return nodes.map(node => {
        const newNode = { ...node, parent };
        if (node.children && node.children.length > 0) {
            newNode.children = assignParents(node.children, newNode);
        } else {
            newNode.children = [];
        }
        return newNode;
    });
};

export default function CategoryList() {
    const { 
        categoryTree, 
        isLoading, 
        error, 
        toggleCategoryStatus,
        refreshCategories,
        deleteCategory
    } = useCategories();
    
    const [nodes, setNodes] = useState<CategoryNodeType[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    // 🆕 Flatten tree structure for table display
    const flattenTree = (nodes: CategoryNodeType[], level: number = 0): (CategoryNodeType & { level: number; hasChildren: boolean })[] => {
        const result: (CategoryNodeType & { level: number; hasChildren: boolean })[] = [];
        
        nodes.forEach(node => {
            const hasChildren = node.children && node.children.length > 0;
            result.push({ ...node, level, hasChildren: hasChildren || false });
            
            if (hasChildren && expandedCategories.has(node.key)) {
                result.push(...flattenTree(node.children!, level + 1));
            }
        });
        
        return result;
    };

    // 🆕 Toggle category expansion
    const toggleExpansion = (categoryKey: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryKey)) {
                newSet.delete(categoryKey);
            } else {
                newSet.add(categoryKey);
            }
            return newSet;
        });
    };

    // 🆕 Filter categories based on search term
    const filteredFlatCategories = () => {
        const flatCategories = flattenTree(nodes);
        if (!searchTerm) return flatCategories;
        
        return flatCategories.filter(category => 
            category.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    // ✅ Improved useEffect to properly handle tree updates
    useEffect(() => {
        if (categoryTree && categoryTree.length >= 0) {
            console.log('CategoryTree updated:', categoryTree);
            const nodesWithParents = assignParents(categoryTree);
            console.log('Nodes with parents:', nodesWithParents);
            setNodes(nodesWithParents);
        }
    }, [categoryTree]);

    // Add this useEffect to fetch categories when the page loads
    useEffect(() => {
        refreshCategories();
    }, []);

    const updateTreeStatus = (
        nodes: CategoryNodeType[],
        targetKey: string,
        isActive: boolean
    ): CategoryNodeType[] =>
        nodes.map(node => {
            if (node.key === targetKey) {
                return toggleActiveStatus(node, isActive);
            } else if (node.children) {
                return {
                    ...node,
                    children: updateTreeStatus(node.children, targetKey, isActive),
                };
            }
            return node;
        });

    const handleToggle = async (key: string, isActive: boolean) => {
        // Update local state immediately for better UX
        setNodes(prev => {
            const updated = updateTreeStatus(prev, key, isActive);
            return assignParents(updated);
        });

        // Call API to persist the change
        const success = await toggleCategoryStatus(key, isActive);
        
        // If the API call failed, revert the local state
        if (!success) {
            setNodes(prev => {
                const updated = updateTreeStatus(prev, key, !isActive);
                return assignParents(updated);
            });
        }
    };

    // ✅ Check if any ancestor is inactive
    const isDisabled = (node: CategoryNodeType): boolean => {
        let current = node.parent;
        while (current) {
            if (!current.isActive) return true;
            current = current.parent;
        }
        return false;
    };

    // 🗑️ Handle category deletion
    const handleDelete = async (categoryKey: string, categoryName: string) => {
        const confirmMessage = `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`;
        
        if (window.confirm(confirmMessage)) {
            try {
                const success = await deleteCategory(categoryKey);
                if (success) {
                    // Refresh the categories to update the UI
                    await refreshCategories();
                } else {
                    alert('Failed to delete category. Please try again.');
                }
            } catch (error) {
                console.error('Error deleting category:', error);
                alert('An error occurred while deleting the category.');
            }
        }
    };

    // 🆕 Table row component for category display
    const CategoryTableRow = ({ category }: { category: CategoryNodeType & { level: number; hasChildren: boolean } }) => {
        const isDisabledByParent = isDisabled(category);
        
        // Use the createImageUrl utility to properly format the image URL
        const imageUrl = category.data?.image;
        return (
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 border-b border-gray-200 dark:border-gray-700">
                {/* Category Name with Hierarchy */}
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${category.level * 24}px` }}>
                        {/* Expand/Collapse Button */}
                        {category.hasChildren && (
                            <button
                                onClick={() => toggleExpansion(category.key)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            >
                                {expandedCategories.has(category.key) ? (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                )}
                            </button>
                        )}
                        {!category.hasChildren && <div className="w-6" />}
                        
                        {/* Category Name */}
                        <span className={`font-medium text-sm ${
                            category.isActive 
                                ? 'text-gray-900 dark:text-white' 
                                : 'text-gray-400 dark:text-gray-500 line-through'
                        }`}>
                            {category.label}
                        </span>
                    </div>
                    
                    {/* Warning for disabled by parent */}
                    {isDisabledByParent && (
                        <div className="flex items-center gap-1 mt-1" style={{ paddingLeft: `${category.level * 24 + 24}px` }}>
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            <span className="text-xs text-amber-600 dark:text-amber-400">
                                Disabled by parent category
                            </span>
                        </div>
                    )}
                </td>
                
                {/* Category Image */}
                <td className="px-6 py-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={category.label}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                                    if (fallback) {
                                        fallback.style.display = 'flex';
                                    }
                                }}
                                loading="lazy"
                                className="w-full h-full object-cover transition-opacity duration-300"
                            />
                        ) : null}
                        <div className="fallback-icon w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500" style={{ display: imageUrl ? 'none' : 'flex' }}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </td>
                
                {/* Status Badge */}
                <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        category.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                        {category.isActive ? (
                            <><Eye className="w-3 h-3" /> Active</>
                        ) : (
                            <><EyeOff className="w-3 h-3" /> Inactive</>
                        )}
                    </div>
                </td>
                
                {/* Actions */}
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        {/* Edit Button */}
                        <Link
                            to={`/category/edit/${category.key}`}
                            className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200 group"
                            title={`Edit ${category.label}`}
                        >
                            <Edit className="w-4 h-4" />
                        </Link>
                        
                        {/* Toggle Switch */}
                        <Switch
                            label=""
                            defaultChecked={category.isActive}
                            onChange={(checked: boolean) => handleToggle(category.key, checked)}
                            disabled={isDisabledByParent}
                        />
                        
                        {/* Delete Button */}
                        <button
                            onClick={() => handleDelete(category.key, category.label)}
                            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 group"
                            title={`Delete ${category.label}`}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            </tr>
        );
    };



    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Error: {error}</p>
                    <Button onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageBreadcrumb pageTitle="Category Management" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ComponentCard 
                    title="Category List"
                >
                    {/* Info Panel */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                    Category Hierarchy Rules
                                </h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    When a parent category is deactivated, all its child categories will automatically become inactive. 
                                    Child categories cannot be activated while their parent is inactive.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Category Table */}
                    <div className="bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Category Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Image
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900/50 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredFlatCategories().map((category) => (
                                        <CategoryTableRow key={category.key} category={category} />
                                    ))}
                                    {filteredFlatCategories().length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                {searchTerm ? 'No categories found matching your search.' : 'No categories available.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ComponentCard>
            </div>
        </>
    );
}
