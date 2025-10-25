import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { Tree, TreeCheckboxSelectionKeys, TreeMultipleSelectionKeys } from 'primereact/tree';
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import TextArea from "../../components/form/input/TextArea";
import FileInput from "../../components/form/input/FileInput";
import Switch from "../../components/form/switch/Switch";
import { useAttributes } from "../../context/AttributeContext";
import { productApi, brandApi, type Brand, type ProductCreatePayload, type ProductAttribute, type QuantityLevel, type AdditionalField, type ProductMeta, type ProductParcel } from '../../services/api';
import { AttributeProvider } from '../../context/AttributeContext';
import { showSuccessToast, showErrorToast } from "../../components/ui/toast";

interface GenericField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'textarea';
    value: string;
    options?: { value: string; label: string }[];
}

interface ProductFormData {
    productName: string;
    seller: string;
    sku: string;
    categories: string[];
    brandId: string;
    price: string;
    comparePrice: string;
    costPrice: string;
    stock: string;
    lowStockThreshold: string;
    trackQuantity: boolean;
    taxRate: string;
    guaranteePeriod: string;
    isReturnable: boolean;
    isCancelable: boolean;
    shortDescription: string;
    longDescription: string;
    status: 'active' | 'inactive' | 'draft';
    isPublished: boolean;
    weight: string;
    dimensions: {
        length: string;
        width: string;
        height: string;
    };
    image360Url: string;
    mainImage: File | null;
    otherImages: File[];
    specificationsFile: File | null;
}

interface TreeNode {
  key: string;
  label: string;
  children?: TreeNode[];
}


export default function EditProduct() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    // Form data state
    // SEO Meta fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  
  // Main product form data
  const [productData, setProductData] = useState<ProductFormData>({
    productName: '',
    seller: '',
    sku: '',
    categories: [],
    brandId: '',
    price: '',
    comparePrice: '',
    costPrice: '',
    stock: '',
    lowStockThreshold: '5',
    trackQuantity: true,
    taxRate: '',
    guaranteePeriod: '',
    isReturnable: true,
    isCancelable: true,
    shortDescription: '',
    longDescription: '',
    status: 'draft',
    isPublished: false,
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    image360Url: '',
    mainImage: null,
    otherImages: [],
    specificationsFile: null
  });

    // Category and tree selection
    const [selectedKeys, setSelectedKeys] = useState<TreeMultipleSelectionKeys | TreeCheckboxSelectionKeys | null>(null);
    
    // Generic fields and attributes
    const [genericFields, setGenericFields] = useState<GenericField[]>([]);
    const { availableAttributes } = useAttributes();
    const safeAttributes = Array.isArray(availableAttributes) ? availableAttributes : [];
    const [selectedAttributes, setSelectedAttributes] = useState<Set<string>>(new Set());
    const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
    
    // Brands state
    const [brands, setBrands] = useState<Brand[]>([]);
    const [brandsLoading, setBrandsLoading] = useState(true);
    
    // Quantity levels state
    const [quantityLevels, setQuantityLevels] = useState<Array<{
        id: string;
        level: number;
        minQuantity: string;
        maxQuantity: string;
        price: string;
        discount: string;
    }>>([
        {
            id: '1',
            level: 1,
            minQuantity: '',
            maxQuantity: '',
            price: '',
            discount: ''
        }
    ]);
    
    // Parcel dimensions state
    const [parcelWidth, setParcelWidth] = useState<string>('');
    const [parcelHeight, setParcelHeight] = useState<string>('');
    const [parcelLength, setParcelLength] = useState<string>('');
    const [parcelWeight, setParcelWeight] = useState<string>('');
    
    const sellerOptions = [
        { value: "nes_electrical", label: "NES Electrical" },
        { value: "techcorp_solutions", label: "TechCorp Solutions" },
        { value: "wholesale_direct", label: "Wholesale Direct" }
    ];

    const statusOptions = [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "draft", label: "Draft" }
    ];

    const taxOptions = [
        { value: "0", label: "0%" },
        { value: "5", label: "5%" },
        { value: "10", label: "10%" },
        { value: "15", label: "15%" },
        { value: "20", label: "20%" }
    ];

    const guaranteeOptions = [
        { value: "0", label: "No Guarantee" },
        { value: "30", label: "30 Days" },
        { value: "90", label: "90 Days" },
        { value: "180", label: "6 Months" },
        { value: "365", label: "1 Year" },
        { value: "730", label: "2 Years" }
    ];

    // Form field update handler
    const updateFormField = (field: keyof ProductFormData, value: any) => {
        setProductData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Dimensions update handler
    const updateDimension = (dimension: 'length' | 'width' | 'height', value: string) => {
        setProductData(prev => ({
            ...prev,
            dimensions: {
                ...prev.dimensions,
                [dimension]: value
            }
        }));
    };

    const handleFileChange = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
        if (field === "mainImage") {
            const file = event.target.files?.[0] || null;
            updateFormField('mainImage', file);
        } else if (field === "otherImages") {
            const files = event.target.files ? Array.from(event.target.files) : [];
            updateFormField('otherImages', files);
        } else if (field === "specificationsFile") {
            const file = event.target.files?.[0] || null;
            updateFormField('specificationsFile', file);
        }
    };

    const addGenericField = () => {
        const newField: GenericField = {
            id: Date.now().toString(),
            label: '',
            type: 'text',
            value: ''
        };
        setGenericFields([...genericFields, newField]);
    };

    const removeGenericField = (id: string) => {
        setGenericFields(genericFields.filter(field => field.id !== id));
    };

    const updateGenericField = (id: string, field: Partial<GenericField>) => {
        setGenericFields(genericFields.map(f => f.id === id ? { ...f, ...field } : f));
    };

    const toggleAttribute = (attributeId: string) => {
        setSelectedAttributes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(attributeId)) {
                newSet.delete(attributeId);
                // Remove value when attribute is deselected
                setAttributeValues(prevValues => {
                    const newValues = { ...prevValues };
                    delete newValues[attributeId];
                    return newValues;
                });
            } else {
                newSet.add(attributeId);
            }
            return newSet;
        });
    };

    const updateAttributeValue = (attributeId: string, value: string) => {
        setAttributeValues(prev => ({
            ...prev,
            [attributeId]: value
        }));
    };

    // Quantity level functions
    const addQuantityLevel = () => {
        const newLevel = {
            id: Date.now().toString(),
            level: quantityLevels.length + 1,
            minQuantity: '',
            maxQuantity: '',
            price: '',
            discount: ''
        };
        setQuantityLevels([...quantityLevels, newLevel]);
    };

    const removeQuantityLevel = (id: string) => {
        if (quantityLevels.length > 1) {
            const updatedLevels = quantityLevels.filter(level => level.id !== id);
            // Reorder levels
            const reorderedLevels = updatedLevels.map((level, index) => ({
                ...level,
                level: index + 1
            }));
            setQuantityLevels(reorderedLevels);
        }
    };

    const updateQuantityLevel = (id: string, field: 'minQuantity' | 'maxQuantity' | 'price' | 'discount', value: string) => {
        setQuantityLevels(prev => prev.map(level => 
            level.id === id ? { ...level, [field]: value } : level
        ));
    };




    // Robust recursive mapping for any nesting
    const mapCategoriesToTreeNodes = (categories: any[]): TreeNode[] => {
        return categories.map((cat: any) => ({
            key: cat._id,
            label: cat.name,
            children: Array.isArray(cat.children) && cat.children.length > 0 ? mapCategoriesToTreeNodes(cat.children) : undefined
        }));
    };

    // Helper function to get all nested category IDs (including children)
    const getAllNestedCategoryIds = (categories: any[]): string[] => {
        const ids: string[] = [];
        categories.forEach((cat: any) => {
            ids.push(cat._id);
            if (Array.isArray(cat.children) && cat.children.length > 0) {
                ids.push(...getAllNestedCategoryIds(cat.children));
            }
        });
        return ids;
    };

    // Helper function to find a category by ID in the tree
    const findCategoryById = (categories: any[], id: string): any => {
        for (const cat of categories) {
            if (cat._id === id) return cat;
            if (Array.isArray(cat.children) && cat.children.length > 0) {
                const found = findCategoryById(cat.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    // Helper function to get all children IDs of a category
    const getChildrenIds = (category: any): string[] => {
        if (!category || !Array.isArray(category.children) || category.children.length === 0) {
            return [];
        }
        return getAllNestedCategoryIds(category.children);
    };

    // Helper function to get parent category ID
    const getParentCategoryId = (categories: any[], targetId: string): string | null => {
        for (const cat of categories) {
            if (Array.isArray(cat.children) && cat.children.length > 0) {
                const childIds = cat.children.map((child: any) => child._id);
                if (childIds.includes(targetId)) {
                    return cat._id;
                }
                const found = getParentCategoryId(cat.children, targetId);
                if (found) return found;
            }
        }
        return null;
    };



    const renderGenericField = (field: GenericField) => {
        switch (field.type) {
            case 'text':
                return (
                    <Input 
                        type="text" 
                        value={field.value}
                        onChange={(e) => updateGenericField(field.id, { value: e.target.value })}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                );
            case 'number':
                return (
                    <Input 
                        type="number" 
                        value={field.value}
                        onChange={(e) => updateGenericField(field.id, { value: e.target.value })}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                );
            case 'select':
                return (
                    <Select
                        options={field.options || []}
                        placeholder={`Select ${field.label.toLowerCase()}`}
                        onChange={(value) => updateGenericField(field.id, { value })}
                        className="dark:bg-dark-900"
                    />
                );
            case 'textarea':
                return (
                    <TextArea 
                        value={field.value}
                        onChange={(value) => updateGenericField(field.id, { value })}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                );
            default:
                return null;
        }
    };


    const [categoryNodes, setCategoryNodes] = useState<TreeNode[]>([]);
    const [categoryLoading, setCategoryLoading] = useState<boolean>(true);
    const [categoryError, setCategoryError] = useState<string | null>(null);

    // Load categories
    useEffect(() => {
        async function fetchCategories() {
            setCategoryLoading(true);
            setCategoryError(null);
            try {
                const response = await fetch('/api/categories/frontend-tree');
                if (!response.ok) throw new Error('Failed to fetch categories');
                const data = await response.json();
                setCategoryNodes(data);
            } catch (err: any) {
                setCategoryNodes([]);
                setCategoryError(err.message || 'Failed to load categories');
            } finally {
                setCategoryLoading(false);
            }
        }
        fetchCategories();
    }, []);

    // Fetch product data
    useEffect(() => {
        if (id) {
            const fetchProduct = async () => {
                try {
                    const product = await productApi.getById(id);
                    setProductData({
                        ...product,
                        price: String(product.price),
                        comparePrice: String(product.comparePrice || ''),
                        costPrice: String(product.costPrice || ''),
                        stock: String(product.stock),
                        lowStockThreshold: String(product.lowStockThreshold || '5'),
                        taxRate: String(product.taxRate),
                        weight: String(product.weight || ''),
                        dimensions: {
                            length: String(product.dimensions?.length || ''),
                            width: String(product.dimensions?.width || ''),
                            height: String(product.dimensions?.height || ''),
                        },
                        trackQuantity: product.trackQuantity ?? true,
                        isReturnable: product.isReturnable ?? true,
                        isCancelable: product.isCancelable ?? true,
                        isPublished: product.isPublished ?? false,
                        longDescription: product.longDescription || '',
                        image360Url: product.image360Url || '',
                        mainImage: null, // Files can't be pre-filled
                        otherImages: [],
                        specificationsFile: null,
                    });

                    // Pre-fill other states
                    if (product.meta) {
                        setMetaTitle(product.meta.title);
                        setMetaDesc(product.meta.description);
                        setMetaKeywords(product.meta.keywords);
                    }
                    if (product.attributes) {
                        const attrValues: Record<string, string> = {};
                        const attrIds = new Set<string>();
                        product.attributes.forEach(attr => {
                            attrValues[attr.id] = attr.value;
                            attrIds.add(attr.id);
                        });
                        setAttributeValues(attrValues);
                        setSelectedAttributes(attrIds);
                    }
                    if (product.quantityLevels) {
                        setQuantityLevels(product.quantityLevels.map((ql, i) => ({ ...ql, id: String(i) })));
                    }
                    if (product.additionalFields) {
                        setGenericFields(product.additionalFields.map((af, i) => ({ ...af, id: String(i) })));
                    }

                    // Set selected categories for the tree component
                    if (product.categories && product.categories.length > 0) {
                        console.log('Product categories:', product.categories);
                        const categoryKeys: TreeCheckboxSelectionKeys = {};
                        
                        // Process each selected category and its nested children
                        product.categories.forEach((category: any) => {
                            const categoryId = typeof category === 'string' ? category : category._id || category.id;
                            if (categoryId) {
                                // Mark the category as checked
                                categoryKeys[categoryId] = { checked: true };
                                
                                // Find the category in the tree and get all its children
                                const categoryInTree = findCategoryById(categoryNodes, categoryId);
                                if (categoryInTree) {
                                    const childrenIds = getChildrenIds(categoryInTree);
                                    childrenIds.forEach(childId => {
                                        categoryKeys[childId] = { checked: true };
                                    });
                                }
                            }
                        });
                        
                        console.log('Category keys for tree:', categoryKeys);
                        setSelectedKeys(categoryKeys);
                    }

                } catch (err: any) {
                    showErrorToast("Failed to load product", err.message);
                }
            };
            fetchProduct();
        }
    }, [id]);

    // Load brands
    useEffect(() => {
        async function fetchBrands() {
            setBrandsLoading(true);
            try {
                const brandsData = await brandApi.getAll();
                setBrands(brandsData);
            } catch (err: any) {
                console.error('Failed to load brands:', err);
                setBrands([]);
            } finally {
                setBrandsLoading(false);
            }
        }
        fetchBrands();
    }, []);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        
        console.log('Form submitted with data:', productData);
        console.log('Selected categories:', productData.categories);
        
        try {
            // Build attributes array
            const attributes: ProductAttribute[] = Array.from(selectedAttributes).map(id => ({
                id,
                value: attributeValues[id] || ''
            }));
            
            // Build quantity levels array
            const quantityLevelsPayload: QuantityLevel[] = quantityLevels.map(lvl => ({
                level: lvl.level,
                minQuantity: lvl.minQuantity,
                maxQuantity: lvl.maxQuantity,
                price: lvl.price,
                discount: lvl.discount
            }));
            
            // Build additional fields array
            const additionalFields: AdditionalField[] = genericFields.map(field => ({
                label: field.label,
                type: field.type,
                value: field.value
            }));
            
            // Build parcel object with required dimensions and weight
            const parcel: ProductParcel = {
                width: productData.dimensions.width || "0",
                height: productData.dimensions.height || "0",
                length: productData.dimensions.length || "0",
                weight: productData.weight || "0"
            };
            
            // Build meta data
            const meta: ProductMeta = {
                title: metaTitle || '',
                description: metaDesc || '',
                keywords: metaKeywords ? metaKeywords.split(',').map((k: string) => k.trim()).join(', ') : ''
            };

            // Ensure compare price is only included if it's greater than price
            const price = parseFloat(productData.price) || 0;
            const comparePrice = productData.comparePrice ? parseFloat(productData.comparePrice) : undefined;
            
            const productPayload: ProductCreatePayload = {
                ...productData,
                price: price,
                comparePrice: (comparePrice && comparePrice > price) ? comparePrice : undefined,
                costPrice: productData.costPrice ? parseFloat(productData.costPrice) : undefined,
                stock: parseInt(productData.stock, 10) || 0,
                lowStockThreshold: productData.lowStockThreshold ? parseInt(productData.lowStockThreshold, 10) : undefined,
                taxRate: parseFloat(productData.taxRate) || 0,
                weight: productData.weight ? parseFloat(productData.weight) : undefined,
                dimensions: {
                    length: parseFloat(productData.dimensions.length) || 0,
                    width: parseFloat(productData.dimensions.width) || 0,
                    height: parseFloat(productData.dimensions.height) || 0,
                },
                attributes,
                quantityLevels: quantityLevelsPayload,
                additionalFields,
                parcel,
                meta,
            };
            
            // Log the raw category data before processing
            console.log('Raw categories before processing:', productData.categories);
            
            // Build FormData for file and non-file fields
            const formDataToSend = new FormData();

            // Handle categories as an array of category IDs
            if (productData.categories && productData.categories.length > 0) {
                // Ensure we have an array of strings (category IDs)
                const categoryIds = Array.isArray(productData.categories) 
                    ? productData.categories.map((category: any) => {
                        // Handle both string IDs and category objects
                        if (typeof category === 'string') {
                            return category.trim();
                        } else if (typeof category === 'object' && category !== null) {
                            return category._id || category.id || String(category).trim();
                        }
                        return String(category).trim();
                    })
                    : [];
                
                console.log('Selected category IDs:', categoryIds);
                
                // Add each category ID as a separate field with array notation
                categoryIds.forEach((categoryId, index) => {
                    formDataToSend.append(`categories[${index}]`, categoryId);
                });
            } else {
                console.log('No categories selected');
                // Send empty array as a single field
                formDataToSend.append('categories', '[]');
            }
            
            // Log the form data entries for debugging
            for (let pair of (formDataToSend as any).entries()) {
                console.log('FormData entry:', pair[0], pair[1]);
            }

            // Handle other fields
            for (const [key, value] of Object.entries(productPayload)) {
                // Skip file fields and categories (already handled)
                if (key === 'mainImage' || key === 'otherImages' || key === 'specificationsFile' || key === 'categories') {
                    continue;
                }

                // Special handling for brandId - extract ID from object if needed
                if (key === 'brandId' && value) {
                    if (typeof value === 'object' && value !== null) {
                        const brandId = (value as any)._id || (value as any).id || String(value);
                        formDataToSend.append(key, brandId);
                    } else {
                        formDataToSend.append(key, String(value));
                    }
                } else if ((key === 'createdBy' || key === 'updatedBy') && value) {
                    // Special handling for user fields - extract ID from object if needed
                    if (typeof value === 'object' && value !== null) {
                        const userId = (value as any)._id || (value as any).id || String(value);
                        formDataToSend.append(key, userId);
                    } else {
                        formDataToSend.append(key, String(value));
                    }
                } else if (value instanceof Object && !Array.isArray(value)) {
                    formDataToSend.append(key, JSON.stringify(value));
                } else if (Array.isArray(value)) {
                    // Skip arrays as we're handling them separately if needed
                    if (value.length > 0) {
                        formDataToSend.append(key, JSON.stringify(value));
                    }
                } else if (value !== null && value !== undefined && value !== '') {
                    formDataToSend.append(key, String(value));
                }
            }
            
            // Add file fields
            if (productData.mainImage) {
                formDataToSend.append('mainImage', productData.mainImage);
            }
            if (productData.otherImages && productData.otherImages.length > 0) {
                productData.otherImages.forEach((file) => formDataToSend.append('otherImages', file));
            }
            if (productData.specificationsFile) {
                formDataToSend.append('specificationsFile', productData.specificationsFile);
            }
            
            if (id) {
                await productApi.update(id, formDataToSend);
                showSuccessToast("Product Updated", "Product updated successfully!");
                navigate('/product/manage');
            }
            
        } catch (err: any) {
            console.error('Product creation error:', err);
            showErrorToast("Add Product Failed", err.message || 'Unknown error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <PageBreadcrumb pageTitle="Edit Product" />
            
            {/* Enhanced Header Section */}
            <div className="mb-8">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700 p-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg flex items-center justify-center">
                                    <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Edit Product
                                </h1>
                                <div className="space-y-1">
                                    <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                                        {productData.productName ? productData.productName : 'Loading product details...'}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-yellow-700 dark:text-yellow-300">
                                        {productData.sku && (
                                            <span className="flex items-center gap-1">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                                SKU: {productData.sku}
                                            </span>
                                        )}
                                        {id && (
                                            <span className="flex items-center gap-1">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                </svg>
                                                ID: {id}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-2 rounded-full bg-yellow-200 dark:bg-yellow-800 px-4 py-2 text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                                <div className="w-2 h-2 bg-yellow-600 dark:bg-yellow-400 rounded-full animate-pulse"></div>
                                Edit Mode
                            </span>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={!id}
                                    onClick={() => id && navigate(`/product/details/${id}`)}
                                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                        id 
                                            ? 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600' 
                                            : 'bg-gray-100 text-gray-400 dark:bg-gray-700/40 dark:text-gray-500 cursor-not-allowed'
                                    }`}
                                    title={id ? 'View product details' : 'Product ID not available'}
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                    View Details
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => navigate('/product/manage')}
                                    className="inline-flex items-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-100 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md"
                                    title="Back to manage products"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H4"/>
                                    </svg>
                                    Back to Manage
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Left Panel - All Form Fields */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                                        <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">Essential product details and pricing</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/40 px-3 py-1.5 text-sm font-medium text-blue-800 dark:text-blue-200">
                                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                    Required Fields
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                <div className="space-y-6">
                                    <div>
                                        <Label htmlFor="productName">Product Name *</Label>
                                        <Input 
                                            type="text" 
                                            id="productName" 
                                            placeholder="Enter product name" 
                                            value={productData.productName} 
                                            onChange={e => updateFormField('productName', e.target.value)} 
                                        />
                                    </div>
                                    <div>
                                        <Label>Seller *</Label>
                                        <Select
                                            options={sellerOptions}
                                            placeholder="Select a seller"
                                            value={productData.seller}
                                            onChange={value => updateFormField('seller', value)}
                                            className="dark:bg-dark-900"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="sku">SKU *</Label>
                                        <Input 
                                            type="text" 
                                            id="sku" 
                                            placeholder="Enter SKU" 
                                            value={productData.sku} 
                                            onChange={e => updateFormField('sku', e.target.value)} 
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="price">Price *</Label>
                                        <Input 
                                            type="number" 
                                            id="price" 
                                            placeholder="0.00" 
                                            step={0.01} 
                                            value={productData.price} 
                                            onChange={e => updateFormField('price', e.target.value)} 
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="comparePrice">Compare Price</Label>
                                        <Input 
                                            type="number" 
                                            id="comparePrice" 
                                            placeholder="0.00" 
                                            step={0.01} 
                                            value={productData.comparePrice} 
                                            onChange={e => {
                                                // Only update if the value is empty or greater than price
                                                if (e.target.value === '' || parseFloat(e.target.value) > parseFloat(productData.price || '0')) {
                                                    updateFormField('comparePrice', e.target.value);
                                                } else {
                                                    // Show error or prevent setting invalid value
                                                    showErrorToast("Invalid Compare Price", "Compare price must be greater than the regular price");
                                                }
                                            }}
                                        />
                                        <p className="mt-1 text-sm text-gray-500">Original price for comparison</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="costPrice">Cost Price</Label>
                                        <Input 
                                            type="number" 
                                            id="costPrice" 
                                            placeholder="0.00" 
                                            step={0.01} 
                                            value={productData.costPrice} 
                                            onChange={e => updateFormField('costPrice', e.target.value)} 
                                        />
                                        <p className="mt-1 text-sm text-gray-500">Your cost for this product</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <Label htmlFor="stock">Stock Quantity *</Label>
                                        <Input 
                                            type="number" 
                                            id="stock" 
                                            placeholder="0" 
                                            value={productData.stock} 
                                            onChange={e => updateFormField('stock', e.target.value)} 
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                                        <Input 
                                            type="number" 
                                            id="lowStockThreshold" 
                                            placeholder="5" 
                                            value={productData.lowStockThreshold} 
                                            onChange={e => updateFormField('lowStockThreshold', e.target.value)} 
                                        />
                                        <p className="mt-1 text-sm text-gray-500">Alert when stock falls below this number</p>
                                    </div>
                                    <div>
                                        <Label>Brand *</Label>
                                        {brandsLoading ? (
                                            <div className="text-gray-500">Loading brands...</div>
                                        ) : (
                                            <Select
                                                options={brands.map(brand => ({ 
                                                    value: brand._id || '', 
                                                    label: brand.name 
                                                }))}
                                                placeholder="Select a brand"
                                                value={productData.brandId}
                                                onChange={value => updateFormField('brandId', value)}
                                                className="dark:bg-dark-900"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <Label>Tax Rate *</Label>
                                        <Select
                                            options={taxOptions}
                                            placeholder="Select tax rate"
                                            value={productData.taxRate}
                                            onChange={value => updateFormField('taxRate', value)}
                                            className="dark:bg-dark-900"
                                        />
                                    </div>
                                    <div>
                                        <Label>Guarantee Period</Label>
                                        <Select
                                            options={guaranteeOptions}
                                            placeholder="Select guarantee period"
                                            value={productData.guaranteePeriod}
                                            onChange={value => updateFormField('guaranteePeriod', value)}
                                            className="dark:bg-dark-900"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="weight">Weight (kg)</Label>
                                        <Input 
                                            type="number" 
                                            id="weight" 
                                            placeholder="0.00" 
                                            step={0.01} 
                                            value={productData.weight} 
                                            onChange={e => updateFormField('weight', e.target.value)} 
                                        />
                                    </div>
                                </div>
                            </div>
                        
                        {/* Product Dimensions */}
                        <div className="mt-6">
                            <Label className="mb-4 block">Product Dimensions (cm)</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="length">Length</Label>
                                    <Input 
                                        type="number" 
                                        id="length" 
                                        placeholder="0.00" 
                                        step={0.01} 
                                        value={productData.dimensions.length} 
                                        onChange={e => updateDimension('length', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="width">Width</Label>
                                    <Input 
                                        type="number" 
                                        id="width" 
                                        placeholder="0.00" 
                                        step={0.01} 
                                        value={productData.dimensions.width} 
                                        onChange={e => updateDimension('width', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="height">Height</Label>
                                    <Input 
                                        type="number" 
                                        id="height" 
                                        placeholder="0.00" 
                                        step={0.01} 
                                        value={productData.dimensions.height} 
                                        onChange={e => updateDimension('height', e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product Status and Options */}
                        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                            <div>
                                <Label>Product Status</Label>
                                <Select
                                    options={statusOptions}
                                    placeholder="Select status"
                                    value={productData.status}
                                    onChange={value => updateFormField('status', value as 'active' | 'inactive' | 'draft')}
                                    className="dark:bg-dark-900"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label>Product Options</Label>
                                <div className="space-y-2">
                                    <Switch 
                                        label="Track Quantity" 
                                        checked={productData.trackQuantity}
                                        onChange={value => updateFormField('trackQuantity', value)}
                                    />
                                    <Switch 
                                        label="Is Published" 
                                        checked={productData.isPublished}
                                        onChange={value => updateFormField('isPublished', value)}
                                    />
                                    <Switch 
                                        label="Is Returnable" 
                                        checked={productData.isReturnable}
                                        onChange={value => updateFormField('isReturnable', value)}
                                    />
                                    <Switch 
                                        label="Is Cancelable" 
                                        checked={productData.isCancelable}
                                        onChange={value => updateFormField('isCancelable', value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>

                    {/* Product Descriptions */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                                        <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Descriptions</h3>
                                        <p className="text-sm text-green-700 dark:text-green-300">Detailed product information and content</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/40 px-3 py-1.5 text-sm font-medium text-green-800 dark:text-green-200">
                                    <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                                    SEO Optimized
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <Label>Short Description *</Label>
                                    <TextArea
                                        placeholder="Enter short description"
                                        value={productData.shortDescription}
                                        onChange={value => updateFormField('shortDescription', value)}
                                    />
                                    <p className="mt-1 text-sm text-gray-500">Brief description for product listings</p>
                                </div>
                                <div>
                                    <Label>Long Description</Label>
                                    <TextArea
                                        placeholder="Enter detailed description"
                                        value={productData.longDescription}
                                        onChange={value => updateFormField('longDescription', value)}
                                    />
                                    <p className="mt-1 text-sm text-gray-500">Detailed description for product page</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Images and Files */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                                        <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Images and Files</h3>
                                        <p className="text-sm text-purple-700 dark:text-purple-300">Product media and documentation</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/40 px-3 py-1.5 text-sm font-medium text-purple-800 dark:text-purple-200">
                                    <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                                    Media Upload
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                <div className="space-y-6">
                                    <div>
                                        <Label>Main Image</Label>
                                        <FileInput onChange={e => handleFileChange("mainImage", e)} />
                                        <p className="mt-1 text-sm text-gray-500">Upload the main product image</p>
                                    </div>
                                    <div>
                                        <Label>Other Images</Label>
                                        <FileInput onChange={e => handleFileChange("otherImages", e)} multiple />
                                        <p className="mt-1 text-sm text-gray-500">You can select multiple images</p>
                                    </div>
                                    <div>
                                        <Label>360° Image URL</Label>
                                        <Input 
                                            type="url" 
                                            placeholder="https://example.com/360-image.jpg" 
                                            value={productData.image360Url} 
                                            onChange={e => updateFormField('image360Url', e.target.value)} 
                                        />
                                        <p className="mt-1 text-sm text-gray-500">Optional 360° view URL</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <Label>Specifications File</Label>
                                        <FileInput onChange={e => handleFileChange("specificationsFile", e)} />
                                        <p className="mt-1 text-sm text-gray-500">Upload PDF, DOC, or other specification files</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Attributes */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Attributes</h3>
                            <div className="text-sm text-gray-500">
                                {selectedAttributes.size} of {availableAttributes.length} attributes selected
                            </div>
                        </div>
                        
                        {/* Attribute Selection */}
                        <div className="mb-6">
                            <Label className="mb-4 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Select Attributes for this Product
                            </Label>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {safeAttributes.map((attribute) => {
                                    const isSelected = selectedAttributes.has(attribute._id);
                                    return (
                                        <div 
                                            key={attribute._id} 
                                            className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md ${
                                                isSelected 
                                                    ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/20' 
                                                    : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500'
                                            }`}
                                            onClick={() => toggleAttribute(attribute._id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                                                        isSelected 
                                                            ? 'border-brand-500 bg-brand-500' 
                                                            : 'border-gray-300 dark:border-gray-500'
                                                    }`}>
                                                        {isSelected && (
                                                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-medium transition-colors duration-200 ${
                                                            isSelected 
                                                                ? 'text-brand-700 dark:text-brand-300' 
                                                                : 'text-gray-900 dark:text-gray-100'
                                                        }`}>
                                                            {attribute.name}
                                                        </h4>
                                                        <p className={`text-xs transition-colors duration-200 ${
                                                            isSelected 
                                                                ? 'text-brand-600 dark:text-brand-400' 
                                                                : 'text-gray-500 dark:text-gray-400'
                                                        }`}>
                                                            {attribute.name === 'Dimensions' ? 'dimensions (W×H×L)' : attribute.type} {attribute.type === 'select' && attribute.options && `(${attribute.options.length} options)`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200 ${
                                                    isSelected 
                                                        ? 'bg-brand-100 dark:bg-brand-900/40' 
                                                        : 'bg-gray-100 dark:bg-gray-700'
                                                }`}>
                                                    {attribute.name === 'Dimensions' ? (
                                                        <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                        </svg>
                                                    ) : attribute.type === 'select' ? (
                                                        <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    ) : attribute.type === 'number' ? (
                                                        <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Selected Attribute Fields */}
                        {selectedAttributes.size > 0 && (
                            <div className="space-y-4">
                                <Label className="block">Attribute Values</Label>
                                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                    {safeAttributes
                                        .filter(attribute => selectedAttributes.has(attribute._id))
                                        .map((attribute) => (
                                            <div key={attribute._id}>
                                                <Label>{attribute.name}</Label>
                                                {attribute.name === 'Dimensions' ? (
                                                    <div className="space-y-2">
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div>
                                                                <Input 
                                                                    type="number" 
                                                                    placeholder="W (cm)"
                                                                    onChange={(e) => {
                                                                        const currentValue = attributeValues[attribute._id] || '';
                                                                        const dimensions = currentValue ? JSON.parse(currentValue) : {};
                                                                        dimensions.width = e.target.value;
                                                                        updateAttributeValue(attribute._id, JSON.stringify(dimensions));
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Input 
                                                                    type="number" 
                                                                    placeholder="H (cm)"
                                                                    onChange={(e) => {
                                                                        const currentValue = attributeValues[attribute._id] || '';
                                                                        const dimensions = currentValue ? JSON.parse(currentValue) : {};
                                                                        dimensions.height = e.target.value;
                                                                        updateAttributeValue(attribute._id, JSON.stringify(dimensions));
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Input 
                                                                    type="number" 
                                                                    placeholder="L (cm)"
                                                                    onChange={(e) => {
                                                                        const currentValue = attributeValues[attribute._id] || '';
                                                                        const dimensions = currentValue ? JSON.parse(currentValue) : {};
                                                                        dimensions.length = e.target.value;
                                                                        updateAttributeValue(attribute._id, JSON.stringify(dimensions));
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            Width × Height × Length
                                                        </div>
                                                    </div>
                                                ) : attribute.type === 'select' ? (
                                                    <Select
                                                        options={attribute.options?.map(opt => ({ value: opt, label: opt })) || []}
                                                        placeholder={`Select ${attribute.name.toLowerCase()}`}
                                                        onChange={(value) => updateAttributeValue(attribute._id, value)}
                                                        className="dark:bg-dark-900"
                                                    />
                                                ) : attribute.type === 'number' ? (
                                                    <Input 
                                                        type="number" 
                                                        value={attributeValues[attribute._id] || ''}
                                                        placeholder={`Enter ${attribute.name.toLowerCase()}`}
                                                        onChange={(e) => updateAttributeValue(attribute._id, e.target.value)}
                                                    />
                                                ) : (
                                                    <Input 
                                                        type="text" 
                                                        value={attributeValues[attribute._id] || ''}
                                                        placeholder={`Enter ${attribute.name.toLowerCase()}`}
                                                        onChange={(e) => updateAttributeValue(attribute._id, e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {selectedAttributes.size === 0 && (
                            <div className="text-center py-8">
                                <div className="text-gray-400 mb-2">
                                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500">No attributes selected. Choose attributes above to add them to this product.</p>
                            </div>
                        )}
                    </div>

                    {/* Quantity Levels and Pricing */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quantity Levels and Pricing</h3>
                            <button 
                                onClick={addQuantityLevel} 
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white transition-colors duration-200 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                title="Add Quantity Level"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            {quantityLevels.map((level) => (
                                <div key={level.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                                                {level.level}
                                            </div>
                                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                                Level {level.level}
                                            </h4>
                                        </div>
                                        {quantityLevels.length > 1 && (
                                            <button 
                                                onClick={() => removeQuantityLevel(level.id)}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white transition-colors duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                                title="Remove Level"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Minimum Quantity</Label>
                                                <Input 
                                                    type="number" 
                                                    placeholder="1" 
                                                    min="1"
                                                    value={level.minQuantity}
                                                    onChange={(e) => updateQuantityLevel(level.id, 'minQuantity', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label>Maximum Quantity</Label>
                                                <Input 
                                                    type="number" 
                                                    placeholder="1000" 
                                                    min="1"
                                                    value={level.maxQuantity}
                                                    onChange={(e) => updateQuantityLevel(level.id, 'maxQuantity', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Price</Label>
                                                <Input 
                                                    type="number" 
                                                    placeholder="0.00" 
                                                    step={0.01}
                                                    value={level.price}
                                                    onChange={(e) => updateQuantityLevel(level.id, 'price', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label>Discount (%)</Label>
                                                <Input 
                                                    type="number" 
                                                    placeholder="0" 
                                                    min="0"
                                                    max="100"
                                                    step={0.01}
                                                    value={level.discount}
                                                    onChange={(e) => updateQuantityLevel(level.id, 'discount', e.target.value)}
                                                />
                                                <p className="mt-1 text-sm text-gray-500">Percentage discount for this level</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                            <div className="flex items-start gap-3">
                                <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                    <p className="font-medium mb-1">Quantity Level Pricing Guide:</p>
                                    <ul className="space-y-1 text-xs">
                                        <li>• Level 1: Usually for retail customers (1-10 items)</li>
                                        <li>• Level 2: Small bulk orders (11-50 items)</li>
                                        <li>• Level 3: Medium bulk orders (51-100 items)</li>
                                        <li>• Level 4+: Large bulk orders (100+ items)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Parcel Dimensions */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Product Parcel Dimensions</h3>
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="parcelWidth">Parcel Width (cm)</Label>
                                    <Input 
                                        type="number" 
                                        id="parcelWidth" 
                                        placeholder="0.00" 
                                        step={0.01}
                                        min="0"
                                        value={parcelWidth}
                                        onChange={e => setParcelWidth(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="parcelHeight">Parcel Height (cm)</Label>
                                    <Input 
                                        type="number" 
                                        id="parcelHeight" 
                                        placeholder="0.00" 
                                        step={0.01}
                                        min="0"
                                        value={parcelHeight}
                                        onChange={e => setParcelHeight(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="parcelLength">Parcel Length (cm)</Label>
                                    <Input 
                                        type="number" 
                                        id="parcelLength" 
                                        placeholder="0.00" 
                                        step={0.01}
                                        min="0"
                                        value={parcelLength}
                                        onChange={e => setParcelLength(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="parcelWeight">Parcel Weight (kg)</Label>
                                    <Input 
                                        type="number" 
                                        id="parcelWeight" 
                                        placeholder="0.00" 
                                        step={0.01}
                                        min="0"
                                        value={parcelWeight}
                                        onChange={e => setParcelWeight(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>These dimensions are used for shipping calculations and packaging requirements.</span>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Generic Fields */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Fields</h3>
                            <button 
                                onClick={addGenericField} 
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white transition-colors duration-200 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                title="Add Field"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            {genericFields.map((field) => (
                                <div key={field.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                                        <div>
                                            <Label>Field Label</Label>
                                            <Input 
                                                type="text" 
                                                value={field.label}
                                                onChange={(e) => updateGenericField(field.id, { label: e.target.value })}
                                                placeholder="Enter field label"
                                            />
                                        </div>
                                        <div>
                                            <Label>Field Type</Label>
                                            <Select
                                                options={[
                                                    { value: 'text', label: 'Text' },
                                                    { value: 'number', label: 'Number' },
                                                    { value: 'select', label: 'Select' },
                                                    { value: 'textarea', label: 'Text Area' }
                                                ]}
                                                placeholder="Select type"
                                                onChange={(value) => updateGenericField(field.id, { type: value as any })}
                                                className="dark:bg-dark-900"
                                            />
                                        </div>
                                        <div className="xl:col-span-2">
                                            <Label>Field Value</Label>
                                            {renderGenericField(field)}
                                        </div>
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <button 
                                            onClick={() => removeGenericField(field.id)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white transition-colors duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                            title="Remove Field"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {genericFields.length === 0 && (
                                <p className="text-center text-gray-500">No additional fields added yet. Click "Add Field" to create custom fields.</p>
                            )}
                        </div>
                    </div>

                    {/* Meta Information */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">SEO & Meta Information</h3>
                        <div className="space-y-6">
                            <div>
                                <Label htmlFor="metaTitle">Meta Title</Label>
                                <Input 
                                    type="text" 
                                    id="metaTitle" 
                                    placeholder="Enter meta title for SEO"
                                    value={metaTitle}
                                    onChange={e => setMetaTitle(e.target.value)}
                                />
                                <p className="mt-1 text-sm text-gray-500">Recommended: 50-60 characters</p>
                            </div>
                            <div>
                                <Label htmlFor="metaDescription">Meta Description</Label>
                                <TextArea 
                                    placeholder="Enter meta description for SEO"
                                    value={metaDesc}
                                    onChange={setMetaDesc}
                                />
                                <p className="mt-1 text-sm text-gray-500">Recommended: 150-160 characters</p>
                            </div>
                            <div>
                                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                                <Input 
                                    type="text" 
                                    id="metaKeywords" 
                                    placeholder="keyword1, keyword2, keyword3"
                                    value={metaKeywords}
                                    onChange={e => setMetaKeywords(e.target.value)}
                                />
                                <p className="mt-1 text-sm text-gray-500">Separate keywords with commas</p>
                            </div>
                        </div>
                        <div className="mt-4 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                            <div className="flex items-start gap-3">
                                <svg className="h-5 w-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                    <p className="font-medium mb-1">SEO Best Practices:</p>
                                    <ul className="space-y-1 text-xs">
                                        <li>• Use relevant keywords naturally in title and description</li>
                                        <li>• Keep titles under 60 characters for optimal display</li>
                                        <li>• Write compelling descriptions that encourage clicks</li>
                                        <li>• Include primary keywords in the first 160 characters</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Panel - Category Selection */}
                <div className="space-y-6">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Category Selection</h3>
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-800/40 dark:text-yellow-100">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M4 20h4l9.536-9.536a2 2 0 000-2.828l-1.172-1.172a2 2 0 00-2.828 0L4 16v4z"/></svg>
                            Editing
                          </span>
                        </div>
                        {categoryLoading ? (
                            <div className="text-gray-500">Loading categories...</div>
                        ) : categoryError ? (
                            <div className="text-red-500">{categoryError}</div>
                        ) : categoryNodes.length === 0 ? (
                            <div className="text-gray-500">No categories found.</div>
                        ) : (
                            <Tree 
                                value={categoryNodes} 
                                className="w-full"
                                selectionMode="checkbox" 
                                selectionKeys={selectedKeys}
                                onSelectionChange={(e) => {
                                    const keys = e.value as TreeCheckboxSelectionKeys;
                                    console.log('Tree selection changed:', keys);
                                    
                                    // Process the selection to handle nested categories
                                    const processedKeys = { ...keys };
                                    
                                    if (keys && typeof keys === 'object') {
                                        // Handle parent-child selection logic
                                        Object.keys(keys).forEach(key => {
                                            if (keys[key as keyof typeof keys]) {
                                                // If a category is selected, also select all its children
                                                const category = findCategoryById(categoryNodes, key);
                                                if (category) {
                                                    const childrenIds = getChildrenIds(category);
                                                    childrenIds.forEach(childId => {
                                                        processedKeys[childId] = { checked: true };
                                                    });
                                                }
                                                
                                                // Check if all siblings are selected, then select parent
                                                const parentId = getParentCategoryId(categoryNodes, key);
                                                if (parentId) {
                                                    const parent = findCategoryById(categoryNodes, parentId);
                                                    if (parent && parent.children) {
                                                        const siblingIds = parent.children.map((child: any) => child._id);
                                                        const allSiblingsSelected = siblingIds.every((siblingId: string) => 
                                                            processedKeys[siblingId] && processedKeys[siblingId].checked
                                                        );
                                                        if (allSiblingsSelected) {
                                                            processedKeys[parentId] = { checked: true };
                                                        }
                                                    }
                                                }
                                            } else {
                                                // If a category is deselected, deselect all its children
                                                const category = findCategoryById(categoryNodes, key);
                                                if (category) {
                                                    const childrenIds = getChildrenIds(category);
                                                    childrenIds.forEach(childId => {
                                                        processedKeys[childId] = { checked: false };
                                                    });
                                                }
                                                
                                                // If a category is deselected, deselect its parent
                                                const parentId = getParentCategoryId(categoryNodes, key);
                                                if (parentId) {
                                                    processedKeys[parentId] = { checked: false };
                                                }
                                            }
                                        });
                                    }
                                    
                                    setSelectedKeys(processedKeys);
                                    
                                    // Extract selected category IDs from the processed selection
                                    const selectedCategoryIds = processedKeys && typeof processedKeys === 'object' 
                                        ? Object.keys(processedKeys)
                                              .filter(key => processedKeys[key as keyof typeof processedKeys]?.checked)
                                        : [];
                                    
                                    console.log('Selected category IDs:', selectedCategoryIds);
                                        
                                    // Update the form data with the selected category IDs
                                    updateFormField('categories', selectedCategoryIds);
                                }}
                                filterPlaceholder="Search categories" 
                            />
                        )}
                    </div>
                </div>
            </div>
            
            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
                <button onClick={handleSubmit} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-6 py-3 text-white transition-colors duration-200 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 13v7a1 1 0 001 1h7"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.485 6.121a2 2 0 010 2.828l-9.9 9.9L8 19l.151-2.586 9.9-9.9a2 2 0 012.828 0z"/></svg>
                    <span className="font-semibold">Save Changes</span>
                </button>
            </div>
            
            {/* Floating Save Changes button for visibility in Edit Mode */}
            <div className="fixed bottom-6 right-6 z-40">
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="inline-flex items-center gap-2 rounded-full bg-yellow-500 px-5 py-3 text-white shadow-lg transition-colors hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                title="Save Changes"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 13v7a1 1 0 001 1h7"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.485 6.121a2 2 0 010 2.828l-9.9 9.9L8 19l.151-2.586 9.9-9.9a2 2 0 012.828 0z"/></svg>
                <span className="font-semibold">Save Changes</span>
              </button>
            </div>
        </div>
    );
}

export function EditProductWrapper() {
    return (
        <AttributeProvider>
            <EditProduct />
        </AttributeProvider>
    );
}
