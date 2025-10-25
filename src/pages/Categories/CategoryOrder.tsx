import OrderManager from '../../components/common/OrderSorter';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useCategories } from "../../context/CategoryContext";
import { LoadingSpinner } from "../../components/ui/loading";
import ComponentCard from "../../components/common/ComponentCard";
import { GripVertical, Search, ArrowUp, ArrowDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function CategoryOrder() {
    const { 
        categories, 
        isLoading, 
        error, 
        updateCategoryOrder, 
        refreshCategories,
        deleteCategory,
    } = useCategories();

    const [searchTerm, setSearchTerm] = useState('');
    const [currentCategories, setCurrentCategories] = useState<any[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    useEffect(() => {
        refreshCategories();
    }, []);

    // Update local state when categories change
    useEffect(() => {
        if (Array.isArray(categories)) {
            const parentCategories = categories.filter(cat => !cat.parent);
            setCurrentCategories(parentCategories);
        }
    }, [categories]);

    // Filter categories based on search term
    const filteredCategories = currentCategories.filter(cat => 
        cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Quick order change functions
    const moveUp = async (index: number) => {
        if (index === 0) return;
        const newCategories = [...filteredCategories];
        [newCategories[index], newCategories[index - 1]] = [newCategories[index - 1], newCategories[index]];
        await handleOrderChange(newCategories);
    };

    const moveDown = async (index: number) => {
        if (index === filteredCategories.length - 1) return;
        const newCategories = [...filteredCategories];
        [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
        await handleOrderChange(newCategories);
    };

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.5';
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedIndex(null);
        setDragOverIndex(null);
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const newCategories = [...filteredCategories];
        const draggedItem = newCategories[draggedIndex];
        
        // Remove dragged item
        newCategories.splice(draggedIndex, 1);
        
        // Insert at new position
        newCategories.splice(dropIndex, 0, draggedItem);
        
        setDraggedIndex(null);
        setDragOverIndex(null);
        
        await handleOrderChange(newCategories);
    };

    const handleOrderChange = async (orderedCategories: any[]) => {
        // Ensure each category gets a unique, incrementing order value
        const orderData = {
            categories: orderedCategories.map((cat, index) => ({
                id: cat.id || cat._id, // Always use the real MongoDB id
                order: index + 1 // Start from 1, incrementing
            }))
        };

        // Filter out any without a valid id (shouldn't happen, but defensive)
        orderData.categories = orderData.categories.filter(cat => !!cat.id);

        // Debug: Log the payload to verify
        console.log('Sending categories for order update:', orderData);

        await updateCategoryOrder(orderData);
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
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageBreadcrumb pageTitle="Category Order" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ComponentCard title="Category Order Management">
                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {filteredCategories.length} of {currentCategories.length} categories
                        </p>
                    </div>

                    {/* Minimal Category Table */}
                    <div className="bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr>
                                        <th className="w-12 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                            #
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                            Name
                                        </th>
                                        <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                            Status
                                        </th>
                                        <th className="w-24 px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900/50 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredCategories.map((category, index) => (
                                        <tr 
                                            key={category.id || category._id} 
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-move ${
                                                draggedIndex === index ? 'opacity-50' : ''
                                            } ${
                                                dragOverIndex === index ? 'border-t-2 border-brand-500' : ''
                                            }`}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, index)}
                                        >
                                            {/* Order Number */}
                                            <td className="px-3 py-3 text-sm font-mono text-gray-500 dark:text-gray-400">
                                                {index + 1}
                                            </td>
                                            
                                            {/* Category Name */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <GripVertical className="w-4 h-4 text-gray-400 hover:text-brand-500 cursor-grab active:cursor-grabbing transition-colors" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            {category.name}
                                                        </p>
                                                        {category.description && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                {category.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            {/* Status */}
                                            <td className="px-3 py-3 text-center">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    category.isActive
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                    {category.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            
                                            {/* Quick Actions */}
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => moveUp(index)}
                                                        disabled={index === 0}
                                                        className="p-1 text-gray-400 hover:text-brand-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                        title="Move up"
                                                    >
                                                        <ArrowUp className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => moveDown(index)}
                                                        disabled={index === filteredCategories.length - 1}
                                                        className="p-1 text-gray-400 hover:text-brand-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                        title="Move down"
                                                    >
                                                        <ArrowDown className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredCategories.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                                {searchTerm ? 'No categories found matching your search.' : 'No categories available.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {/* Bulk Actions */}
                    {filteredCategories.length > 0 && (
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <p>Drag rows to reorder or use arrow buttons for precise movement</p>
                            <button
                                onClick={() => refreshCategories()}
                                className="px-3 py-1 text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                            >
                                Refresh
                            </button>
                        </div>
                    )}
                </ComponentCard>
            </div>
        </>
    );
}
