// Product Types for Online Wholesale Admin

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface ProductAttribute {
  id: string;
  value: string;
}

export interface QuantityLevel {
  level: number;
  minQuantity: string;
  maxQuantity: string;
  price: string;
  discount: string;
}

export interface ProductParcel {
  width: string;
  height: string;
  length: string;
  weight: string;
}

export interface AdditionalField {
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  value: string;
}

export interface ProductMeta {
  title: string;
  description: string;
  keywords: string;
}

export interface Product {
  _id?: string;
  productName: string;
  seller: string;
  sku: string;
  categories: string[];
  brandId: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  trackQuantity?: boolean;
  taxRate: number;
  guaranteePeriod: string;
  isReturnable: boolean;
  isCancelable: boolean;
  shortDescription: string;
  longDescription?: string;
  status: 'active' | 'inactive' | 'draft';
  isPublished: boolean;
  weight?: number;
  dimensions?: ProductDimensions;
  attributes: ProductAttribute[];
  quantityLevels: QuantityLevel[];
  parcel: ProductParcel;
  additionalFields: AdditionalField[];
  meta: ProductMeta;
  
  // Featured product properties
  isFeatured?: boolean;
  featuredOrder?: number;
  featuredAt?: string;
  
  // File fields (handled separately in FormData)
  mainImage?: File | string;
  otherImages?: File[] | string[];
  specificationsFile?: File | string;
  image360Url?: string;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFormData {
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
  attributes: ProductAttribute[];
  quantityLevels: QuantityLevel[];
  parcel: ProductParcel;
  additionalFields: AdditionalField[];
  meta: ProductMeta;
  image360Url: string;
  
  // File fields
  mainImage?: File | null;
  otherImages?: File[];
  specificationsFile?: File | null;
}

export interface ProductCreatePayload {
  productName: string;
  seller: string;
  sku: string;
  categories: string[];
  brandId: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  trackQuantity: boolean;
  taxRate: number;
  guaranteePeriod: string;
  isReturnable: boolean;
  isCancelable: boolean;
  shortDescription: string;
  longDescription?: string;
  status: 'active' | 'inactive' | 'draft';
  isPublished: boolean;
  weight?: number;
  dimensions?: ProductDimensions;
  attributes: ProductAttribute[];
  quantityLevels: QuantityLevel[];
  parcel: ProductParcel;
  additionalFields: AdditionalField[];
  meta: ProductMeta;
  image360Url?: string;
}

export interface ProductApiResponse {
  success: boolean;
  message: string;
  data: Product;
}

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

// Validation schemas
export const productValidationRules = {
  productName: { required: true, minLength: 2, maxLength: 200 },
  seller: { required: true },
  sku: { required: true, minLength: 3, maxLength: 50 },
  price: { required: true, min: 0 },
  stock: { required: true, min: 0 },
  taxRate: { required: true, min: 0, max: 100 },
  shortDescription: { required: true, minLength: 10, maxLength: 500 },
  categories: { required: true, minItems: 1 },
  brandId: { required: true }
};

export const defaultProductFormData: ProductFormData = {
  productName: '',
  seller: '',
  sku: '',
  categories: [],
  brandId: '',
  price: '',
  comparePrice: '',
  costPrice: '',
  stock: '',
  lowStockThreshold: '',
  trackQuantity: true,
  taxRate: '',
  guaranteePeriod: '',
  isReturnable: false,
  isCancelable: false,
  shortDescription: '',
  longDescription: '',
  status: 'active',
  isPublished: true,
  weight: '',
  dimensions: {
    length: '',
    width: '',
    height: ''
  },
  attributes: [],
  quantityLevels: [
    {
      level: 1,
      minQuantity: '1',
      maxQuantity: '5',
      price: '',
      discount: '0'
    }
  ],
  parcel: {
    width: '',
    height: '',
    length: '',
    weight: ''
  },
  additionalFields: [],
  meta: {
    title: '',
    description: '',
    keywords: ''
  },
  image360Url: '',
  mainImage: null,
  otherImages: [],
  specificationsFile: null
};
