export interface ProductVariant {
  weight: string | number;
  price: number;
  mrp: number;
  stock: number;
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
  price: number;
  mrp?: number;
  category: string;
  brand?: string;
  stock: number;
  images?: string[] | { url: string }[];
  variants?: ProductVariant[];
  tags?: string[];
  benefits?: string[];
  features?: string[];
  rating?: number;
  isActive?: boolean;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateProductInput = Omit<Product, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateProductInput = Partial<CreateProductInput>;