import React, { createContext, useContext, useState, ReactNode } from 'react';
import { categoryApi, Category, CategoryNode } from '../services/api';
import { showSuccessToast, showErrorToast } from '../components/ui/toast';

interface CategoryContextType {
  categories: Category[];
  categoryTree: CategoryNode[];
  isLoading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
  createCategory: (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'> & { image?: string | File }) => Promise<Category | null>;
  updateCategory: (id: string, categoryData: Partial<Category> & { image?: string | File }) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<boolean>;
  toggleCategoryStatus: (id: string, isActive: boolean) => Promise<boolean>;
  updateCategoryOrder: (orderData: { categories: Array<{ id: string; order: number }> }) => Promise<boolean>;
  bulkUpdateCategories: (categories: Category[]) => Promise<boolean>;
  getCategoryById: (id: string) => Category | undefined;
  getCategoryTree: () => CategoryNode[];
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

interface CategoryProviderProps {
  children: ReactNode;
}

export const CategoryProvider: React.FC<CategoryProviderProps> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCategories = async (force = false) => {
    if (!force && categories.length > 0) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      
      // Add retry logic for connection issues
      let retries = 3;
      let listResponse;
      
      while (retries > 0) {
        try {
          // Fetch categories
          listResponse = await categoryApi.getAll();
          break; // Success, exit retry loop
        } catch (err) {
          retries--;
          const errorMessage = err instanceof Error ? err.message : '';
          if (errorMessage.includes('buffering timed out') && retries > 0) {
            console.log(`Retrying category fetch... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            continue;
          }
          throw err; // Re-throw if no more retries or different error
        }
      }
      
      if (!listResponse) {
        throw new Error('Failed to fetch categories after all retries');
      }
      
      setCategories(listResponse);
      
      // Convert categories to tree format
      const treeData = convertToTreeFormat(listResponse);
      setCategoryTree(treeData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      showErrorToast('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert flat category list to tree format
  const convertToTreeFormat = (categoryList: Category[]): CategoryNode[] => {
    console.log('Converting categories to tree format:', categoryList);
    
    if (!categoryList || categoryList.length === 0) {
      console.log('No categories to convert');
      return [];
    }
    
    const categoryMap = new Map<string, CategoryNode>();
    const rootCategories: CategoryNode[] = [];

    // First pass: create all nodes
    categoryList.forEach(category => {
      // Handle ID mapping - backend might return _id, frontend expects id
      const categoryId = category.id || category._id || '';
      
      if (!categoryId) {
        console.warn(`Category ${category.name} has no valid ID, skipping`);
        return;
      }
      
      const node: CategoryNode = {
        key: categoryId,
        label: category.name,
        data: {
          image: category.image || '',
          description: category.description || '',
          slug: category.slug || ''
        },
        isActive: category.isActive ?? true,
        children: []
      };
      categoryMap.set(categoryId, node);
    });

    console.log('Category map created:', Array.from(categoryMap.keys()));

    // Second pass: build parent-child relationships
    categoryList.forEach(category => {
      const categoryId = category.id || category._id || '';
      const node = categoryMap.get(categoryId);
      if (node) {
        // Handle parent field - it could be a string ID or an object
        let parentId: string | null = null;
        
        console.log(`Processing category: ${category.name} (${categoryId})`);
        console.log(`Parent field type: ${typeof category.parent}`, category.parent);
        
        if (category.parent) {
          if (typeof category.parent === 'string') {
            parentId = category.parent;
            console.log(`Parent is string: ${parentId}`);
          } else if (typeof category.parent === 'object' && category.parent !== null) {
            // If parent is an object (populated reference), extract the ID
            parentId = (category.parent as any)._id || (category.parent as any).id;
            console.log(`Parent is object, extracted ID: ${parentId}`);
          }
        } else {
          console.log(`No parent for category: ${category.name}`);
        }
        
        // Check if category has a valid parent
        const hasParent = parentId && 
                         typeof parentId === 'string' &&
                         parentId.trim() !== '' && 
                         parentId !== 'null' && 
                         parentId !== 'undefined';
        
        if (hasParent && parentId) {
          const parentNode = categoryMap.get(parentId);
          if (parentNode) {
            parentNode.children = parentNode.children || [];
            parentNode.children.push(node);
            console.log(`Added ${category.name} (${categoryId}) as child of ${parentNode.label} (${parentNode.key})`);
          } else {
            // Parent doesn't exist, treat as root category
            console.warn(`Parent category ${parentId} not found for ${category.name} (${categoryId}), treating as root`);
            rootCategories.push(node);
          }
        } else {
          rootCategories.push(node);
          console.log(`Added ${category.name} (${categoryId}) as root category`);
        }
      }
    });

    console.log('Root categories before sorting:', rootCategories.map(c => `${c.label} (${c.key})`));

    // Sort by order
    const sortByOrder = (nodes: CategoryNode[]): CategoryNode[] => {
      return nodes.sort((a, b) => {
        const aOrder = categoryList.find(c => (c.id || c._id) === a.key)?.order || 0;
        const bOrder = categoryList.find(c => (c.id || c._id) === b.key)?.order || 0;
        return aOrder - bOrder;
      }).map(node => ({
        ...node,
        children: node.children && node.children.length > 0 ? sortByOrder(node.children) : []
      }));
    };

    const sortedRootCategories = sortByOrder(rootCategories);
    console.log('Final tree structure:', sortedRootCategories.map(c => `${c.label} (${c.key}) - Children: ${c.children?.length || 0}`));
    
    return sortedRootCategories;
  };

  const createCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'> & { image?: string | File }): Promise<Category | null> => {
    try {
      // Check if image is a File object (similar to brandApi approach)
      if (categoryData.image && typeof categoryData.image !== 'string') {
        // Handle File upload for categories
        const formData = new FormData();
        formData.append('name', categoryData.name);
        formData.append('description', categoryData.description || '');
        if (categoryData.parent) {
          formData.append('parent', categoryData.parent as string);
        }
        // Check if image is a File object using a more reliable method
        if (categoryData.image && (categoryData.image as any) instanceof File) {
          formData.append('image', categoryData.image as any);
        }
        if (categoryData.isActive !== undefined) {
          formData.append('isActive', categoryData.isActive.toString());
        }
        if (categoryData.order !== undefined) {
          formData.append('order', categoryData.order.toString());
        }
        
        // Use the categoryApi.createWithFormData method that handles FormData
        const newCategory = await categoryApi.createWithFormData(formData);
        await refreshCategories(true);
        showSuccessToast('Success', 'Category created successfully');
        return newCategory;
      } else {
        // Regular create for string URLs
        const newCategory = await categoryApi.create(categoryData);
        await refreshCategories(true);
        showSuccessToast('Success', 'Category created successfully');
        return newCategory;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
      showErrorToast('Error', errorMessage);
      return null;
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Category> & { image?: string | File }): Promise<Category | null> => {
    try {
      // Check if image is a File object (similar to createCategory approach)
      if (categoryData.image && typeof categoryData.image !== 'string') {
        // Handle File upload for categories
        const formData = new FormData();
        formData.append('name', categoryData.name || '');
        formData.append('description', categoryData.description || '');
        if (categoryData.parent) {
          formData.append('parent', categoryData.parent as string);
        }
        // Check if image is a File object using a more reliable method
        if (categoryData.image && (categoryData.image as any) instanceof File) {
          formData.append('image', categoryData.image as any);
        }
        if (categoryData.isActive !== undefined) {
          formData.append('isActive', categoryData.isActive.toString());
        }
        if (categoryData.order !== undefined) {
          formData.append('order', categoryData.order.toString());
        }
        
        // Use the categoryApi.updateWithFormData method that handles FormData
        const updatedCategory = await categoryApi.updateWithFormData(id, formData);
        await refreshCategories(true);
        showSuccessToast('Success', 'Category updated successfully');
        return updatedCategory;
      } else {
        // Regular update for string URLs
        const updatedCategory = await categoryApi.update(id, categoryData);
        await refreshCategories(true);
        showSuccessToast('Success', 'Category updated successfully');
        return updatedCategory;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category';
      showErrorToast('Error', errorMessage);
      return null;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      await categoryApi.delete(id);
      await refreshCategories(true);
      showSuccessToast('Success', 'Category deleted successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
      showErrorToast('Error', errorMessage);
      return false;
    }
  };

  const toggleCategoryStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    try {
      await categoryApi.toggleStatus(id, isActive);
      await refreshCategories(true);
      
      if (isActive) {
        showSuccessToast('Success', 'Category activated successfully');
      } else {
        showSuccessToast('Success', 'Category deactivated successfully. All child categories have also been deactivated.');
      }
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle category status';
      
      // Handle specific error for inactive parent
      if (errorMessage.includes('parent is inactive')) {
        showErrorToast('Error', 'Cannot activate category because its parent is inactive');
      } else {
        showErrorToast('Error', errorMessage);
      }
      return false;
    }
  };

  const updateCategoryOrder = async (orderData: { categories: Array<{ id: string; order: number }> }): Promise<boolean> => {
    try {
      await categoryApi.updateOrder(orderData);
      await refreshCategories(true);
      showSuccessToast('Success', 'Category order updated successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category order';
      showErrorToast('Error', errorMessage);
      return false;
    }
  };

  const bulkUpdateCategories = async (categoriesToUpdate: Category[]): Promise<boolean> => {
    try {
      await categoryApi.bulkUpdate(categoriesToUpdate);
      await refreshCategories(true);
      showSuccessToast('Success', 'Categories updated successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update categories';
      showErrorToast('Error', errorMessage);
      return false;
    }
  };

  const getCategoryById = (id: string): Category | undefined => {
    return categories.find(category => category.id === id);
  };

  const getCategoryTree = (): CategoryNode[] => {
    return categoryTree;
  };

  // Commented out to prevent global fetch of categories
  // useEffect(() => {
  //   refreshCategories();
  // }, []);

  const value: CategoryContextType = {
    categories,
    categoryTree,
    isLoading,
    error,
    refreshCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    updateCategoryOrder,
    bulkUpdateCategories,
    getCategoryById,
    getCategoryTree
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}; 