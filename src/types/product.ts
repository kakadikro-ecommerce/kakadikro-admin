export type ProductType = 'GROCERY' | 'ELECTRONICS';

export interface ProductVariant {
  name?: string;
  /** Legacy grocery field — still returned by API for compatibility */
  weight?: string | number;
  price: number;
  mrp: number;
  stock: number;
  attributes?: Record<string, string>;
  isAvailable?: boolean;
}

export interface Product {
  [key: string]: any;
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  detailedDescription?: string;
  productType?: ProductType;
  price: number;
  mrp?: number;
  category: string;
  stock: number;
  images?: Array<string | { url: string; altText?: string }>;
  variants?: ProductVariant[];
  specifications?: Record<string, string>;
  tags?: string[];
  benefits?: string[];
  features?: string[];
  ingredients?: string[];
  usage?: string;
  rating?: number;
  isActive?: boolean;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateProductInput = Omit<Product, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateProductInput = Partial<CreateProductInput>;

export const PRODUCT_TYPES: ProductType[] = ['GROCERY', 'ELECTRONICS'];

export const getVariantDisplayName = (variant: ProductVariant | Record<string, any>): string => {
  if (!variant) return '';

  const fromName = typeof variant.name === 'string' ? variant.name.trim() : '';
  if (fromName) return fromName;

  const fromWeight =
    typeof variant.weight === 'string' || typeof variant.weight === 'number'
      ? String(variant.weight).trim()
      : '';
  if (fromWeight) return fromWeight;

  const attributes = variant.attributes;
  if (attributes && typeof attributes === 'object') {
    const weightAttr =
      typeof attributes.weight === 'string' ? attributes.weight.trim() : '';
    if (weightAttr) return weightAttr;
  }

  return '';
};

export const formatProductTypeLabel = (productType?: string | null): string => {
  if (!productType) return 'Grocery';
  const normalized = String(productType).trim().toUpperCase();
  if (normalized === 'ELECTRONICS') return 'Electronics';
  return 'Grocery';
};
