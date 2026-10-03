export type ProductType = 'CROSSLIFE' | 'CROSSLINE';

const PRODUCT_TYPE_ALIASES: Record<string, ProductType> = {
  CROSSLIFE: 'CROSSLIFE',
  CROSSLINE: 'CROSSLINE',
  GROCERY: 'CROSSLIFE',
  ELECTRONICS: 'CROSSLINE',
  EQUIPMENT: 'CROSSLINE',
};

export const resolveProductType = (value?: string | null): ProductType | null => {
  const normalized = String(value || '').trim().toUpperCase();
  return PRODUCT_TYPE_ALIASES[normalized] || null;
};

export const normalizeProductType = (value?: string | null): ProductType =>
  resolveProductType(value) || 'CROSSLIFE';

export const isCrossLifeType = (value?: string | null) =>
  normalizeProductType(value) === 'CROSSLIFE';

export const isCrossLineType = (value?: string | null) =>
  normalizeProductType(value) === 'CROSSLINE';

export interface ProductTypeConfig {
  code: ProductType;
  label: string;
  fields: string[];
  requiredFields: string[];
  optionalFields: string[];
  notRequiredFields: string[];
}

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
  video?: { url: string; altText?: string } | null;
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

export const PRODUCT_TYPES: ProductType[] = ['CROSSLIFE', 'CROSSLINE'];

export const FALLBACK_PRODUCT_TYPE_CONFIGS: ProductTypeConfig[] = [
  {
    code: 'CROSSLIFE',
    label: 'Cross Life',
    fields: [
      'name',
      'category',
      'usage',
      'shortDescription',
      'description',
      'variants',
      'ingredients',
      'features',
      'benefits',
      'tags',
      'images',
      'video',
    ],
    requiredFields: [
      'name',
      'category',
      'usage',
      'shortDescription',
      'description',
      'variants',
      'ingredients',
      'features',
      'benefits',
      'tags',
    ],
    optionalFields: ['images', 'video'],
    notRequiredFields: ['specifications'],
  },
  {
    code: 'CROSSLINE',
    label: 'Cross Line',
    fields: [
      'name',
      'category',
      'usage',
      'shortDescription',
      'description',
      'variants',
      'specifications',
      'features',
      'benefits',
      'tags',
      'images',
      'video',
    ],
    requiredFields: [
      'name',
      'category',
      'usage',
      'shortDescription',
      'description',
      'variants',
      'specifications',
      'features',
      'benefits',
      'tags',
    ],
    optionalFields: ['images', 'video'],
    notRequiredFields: ['ingredients'],
  },
];

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

export const formatProductTypeLabel = (productType?: string | null): string =>
  isCrossLineType(productType) ? 'Cross Line' : 'Cross Life';
