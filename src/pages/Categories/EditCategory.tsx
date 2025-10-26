import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import ComponentCard from "../../components/common/ComponentCard";
import SearchableSelect from "../../components/form/SearchableSelect";
import DropzoneComponent from "../../components/form/form-elements/DropZone";
import Button from "../../components/ui/button/Button";
import { useCategories } from "../../context/CategoryContext";
import { LoadingSpinner } from "../../components/ui/loading";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Category } from "../../services/api";

export default function EditCategory() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const { 
        categories,
        isLoading, 
        error, 
        updateCategory,
        refreshCategories,
        getCategoryById
    } = useCategories();
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parent: '',
        image: '' // This will store the image URL
    });
    
    // Add state for file handling
    const [imageFile, setImageFile] = useState<File | undefined>();
    const [imageUrl, setImageUrl] = useState<string>('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dropzoneKey, setDropzoneKey] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
    const [isLoadingCategory, setIsLoadingCategory] = useState(true);

    // Load categories and current category data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoadingCategory(true);
                await refreshCategories();
                
                if (id) {
                    const category = getCategoryById(id);
                    if (category) {
                        setFormData({
                            name: category.name || '',
                            description: category.description || '',
                            parent: category.parent ? (typeof category.parent === 'string' ? category.parent : (category.parent as any)._id || (category.parent as any).id || '') : '',
                            image: category.image || ''
                        });
                        setImageUrl(category.image || '');
                    } else {
                        // Category not found, redirect to list
                        navigate('/category/list');
                    }
                }
            } catch (err) {
                console.error('Error loading category data:', err);
            } finally {
                setIsLoadingCategory(false);
            }
        };
        
        loadData();
    }, [id, refreshCategories, getCategoryById, navigate]);

    // Prepare parent category options for the form (exclude current category and its children)
    const parentOptions = [
        { value: "", label: "No Parent (Root Category)" },
        ...categories
            .filter(cat => {
                // Exclude current category and its children
                if (cat.id === id || cat._id === id) return false;
                return cat.isActive;
            })
            .map(cat => ({ value: cat.id || cat._id || '', label: cat.name }))
            .filter(option => option.value) // Filter out categories without valid IDs
    ];

    // Check if selected parent is active
    const selectedParent = categories.find(cat => (cat.id || cat._id) === formData.parent);
    const isParentInactive = selectedParent && !selectedParent.isActive;

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, parent: value }));
    };

    const validateForm = () => {
        const errors: {[key: string]: string} = {};
        
        if (!formData.name.trim()) {
            errors.name = 'Category name is required';
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Category name must be at least 2 characters';
        }
        
        if (!formData.image.trim()) {
            errors.image = 'Category image is required';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear validation error when user starts typing
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        if (!id) {
            console.error('No category ID provided');
            return;
        }

        setIsSubmitting(true);
        try {
            // Create category data object for update
            const categoryData: Partial<Category> = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                parent: formData.parent || undefined,
                isActive: !isParentInactive, // Set to false if parent is inactive
            };
            
            // Add image property based on available data
            if (imageFile) {
                (categoryData as any).image = imageFile;
            } else if (formData.image.trim()) {
                (categoryData as any).image = formData.image.trim();
            }
            
            const updatedCategory = await updateCategory(id, categoryData);

            if (updatedCategory) {
                // Show success message
                setShowSuccess(true);
                
                // Hide success message after 3 seconds and redirect
                setTimeout(() => {
                    setShowSuccess(false);
                    navigate('/category/list');
                }, 2000);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        if (id) {
            const category = getCategoryById(id);
            if (category) {
                setFormData({
                    name: category.name || '',
                    description: category.description || '',
                    parent: category.parent ? (typeof category.parent === 'string' ? category.parent : (category.parent as any)._id || (category.parent as any).id || '') : '',
                    image: category.image || ''
                });
                setImageUrl(category.image || '');
                setImageFile(undefined);
                setValidationErrors({});
                setShowSuccess(false);
                // Force re-render of dropzone to reset it
                setDropzoneKey(prev => prev + 1);
            }
        }
    };

    if (isLoading || isLoadingCategory) {
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
            <PageBreadcrumb pageTitle="Edit Category" />
            
            {/* Success Message */}
            {showSuccess && (
                <div className="mb-6 max-w-4xl mx-auto">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <div>
                                <p className="text-green-800 dark:text-green-200 font-medium">
                                    Category updated successfully!
                                </p>
                                <p className="text-green-600 dark:text-green-300 text-sm mt-1">
                                    Redirecting to category list...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Section */}
                    <div className="lg:col-span-2">
                        <ComponentCard title="Edit Category">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="name">Category Name *</Label>
                                        <Input 
                                            type="text" 
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Enter category name"
                                            error={!!validationErrors.name}
                                            hint={validationErrors.name}
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="parent">Parent Category</Label>
                                        <SearchableSelect
                                            options={parentOptions}
                                            placeholder="Select Parent Category"
                                            onChange={handleSelectChange}
                                            value={formData.parent}
                                            searchPlaceholder="Search categories..."
                                            noResultsText="No categories found"
                                        />
                                        {isParentInactive && (
                                            <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                                    ⚠️ Warning: The selected parent category is inactive. 
                                                    The updated category will be set as inactive.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input 
                                        type="text" 
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Enter category description (optional)"
                                    />
                                </div>
                                
                                <div>
                                    <Label>Category Image *</Label>(Recommended Size : 300 x 300 pixels)
                                    <DropzoneComponent 
                                        key={dropzoneKey}
                                        onImageUpload={(imageUrl, file) => {
                                            // Handle both URL and File
                                            setImageFile(file);
                                            setImageUrl(imageUrl);
                                            handleInputChange('image', imageUrl);
                                        }}
                                        value={imageUrl || formData.image}
                                        multiple={false}
                                    />
                                    {validationErrors.image && (
                                        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                            <p className="text-sm text-red-700 dark:text-red-300">
                                                {validationErrors.image}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-4">
                                        <button 
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg transition px-6 py-3 text-sm font-medium bg-brand-500 text-white shadow-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Updating...
                                                </>
                                            ) : (
                                                'Update Category'
                                            )}
                                        </button>
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={handleReset}
                                            type="button"
                                            disabled={isSubmitting}
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                    
                                    <Link 
                                        to="/category/list"
                                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <ArrowLeft className="inline w-4 h-4 mr-1" />
                                        Back to Category List
                                    </Link>
                                </div>
                            </form>
                        </ComponentCard>
                    </div>
                    
                    {/* Sidebar with Guidelines */}
                    <div className="lg:col-span-1">
                        <div className="space-y-6">
                            {/* Category Management Tips */}
                            <ComponentCard title="Edit Guidelines">
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">📝 Editing Best Practices</h4>
                                        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                                            <li>• Keep names clear and descriptive</li>
                                            <li>• Maintain consistent naming conventions</li>
                                            <li>• Update images to match new content</li>
                                            <li>• Consider impact on child categories</li>
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">⚠️ Important Notes</h4>
                                        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                                            <li>• Changing parent affects hierarchy</li>
                                            <li>• Inactive parents disable children</li>
                                            <li>• Image changes apply immediately</li>
                                            <li>• Changes affect all child categories</li>
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">🔄 Update Process</h4>
                                        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                                            <li>• Changes save to database</li>
                                            <li>• Category tree refreshes</li>
                                            <li>• Child categories update</li>
                                            <li>• Success message confirms</li>
                                        </ul>
                                    </div>
                                </div>
                            </ComponentCard>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
