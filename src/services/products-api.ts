import api from './axiosInstance';
import { Product, ProductType, getVariantDisplayName } from '../types/product';

export interface PaginatedResponse {
  total: number;
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminProductsQuery {
  page?: number;
  limit?: number;
  isActive?: boolean;
  productType?: ProductType;
}

const buildAdminProductsQuery = ({
  page = 1,
  limit = 10,
  isActive,
  productType,
}: AdminProductsQuery = {}) => {
  let query = `/admin/products?page=${page}&limit=${limit}`;

  if (isActive !== undefined) {
    query += `&isActive=${isActive}`;
  }

  if (productType) {
    query += `&productType=${encodeURIComponent(productType)}`;
  }

  return query;
};

const unwrapProduct = (data: any): Product =>
  data?.product ?? data?.data ?? data;

export const productService = {
  adminGetAll: async ({
    page = 1,
    limit = 10,
    isActive,
    productType,
  }: AdminProductsQuery = {}): Promise<PaginatedResponse> => {
    try {
      const query = buildAdminProductsQuery({ page, limit, isActive, productType });
      const response = await api.get(query);
      const data = response.data;

      return {
        total: data.pagination?.total || 0,
        products: data.products || data.data || [],
        pagination: data.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
    } catch (adminError) {
      try {
        const fallbackQuery = buildAdminProductsQuery({
          page,
          limit,
          isActive,
          productType,
        });
        const response = await api.get(fallbackQuery);
        const data = response.data;

        return {
          total: data.pagination?.total || 0,
          products: data.products || data.data || [],
          pagination: data.pagination || {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        };
      } catch (error) {
        console.error('API Fetch Error:', adminError, error);
        return {
          total: 0,
          products: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
        };
      }
    }
  },

  create: async (data: any) => {
    const isFormData = data instanceof FormData;
    const response = isFormData
      ? await api.post('/admin/products', data)
      : await api.post('/admin/products', formatPayload(data));

    return {
      ...response,
      data: unwrapProduct(response.data),
    };
  },

  update: async (id: string, data: any) => {
    const isFormData = data instanceof FormData;
    const response = isFormData
      ? await api.put(`/admin/products/${id}`, data)
      : await api.put(`/admin/products/${id}`, formatPayload(data));

    return {
      ...response,
      data: unwrapProduct(response.data),
    };
  },

  toggleStatus: (id: string, isActive: boolean) => {
    return api.put(`/admin/products/status/${id}`, { isActive });
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/admin/products/${id}`);
    return unwrapProduct(response.data);
  },
};

export const getAllProducts = (
  page = 1,
  limit = 10,
  isActive?: boolean,
  productType?: ProductType,
): Promise<PaginatedResponse> =>
  productService.adminGetAll({ page, limit, isActive, productType });

const formatPayload = (data: any) => {
  const { _id, __v, brand, ...cleanData } = data;
  const productType =
    typeof cleanData.productType === 'string'
      ? cleanData.productType.trim().toUpperCase()
      : 'GROCERY';

  return {
    ...cleanData,
    productType,
    variants: Array.isArray(data.variants)
      ? data.variants.map((v: any) => {
          const name = getVariantDisplayName(v) || 'Default';
          const attributes =
            v.attributes && typeof v.attributes === 'object' && !Array.isArray(v.attributes)
              ? { ...v.attributes }
              : {};

          if (productType === 'GROCERY' && !attributes.weight) {
            attributes.weight = name;
          }

          return {
            name,
            price: Number(v.price || 0),
            mrp: Number(v.mrp || 0),
            stock: Number(v.stock || 0),
            attributes,
          };
        })
      : [],
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    specifications:
      data.specifications && typeof data.specifications === 'object'
        ? data.specifications
        : {},
    features: Array.isArray(data.features) ? data.features : [],
    benefits: Array.isArray(data.benefits) ? data.benefits : [],
    images: Array.isArray(data.images)
      ? data.images
      : [data.images].filter(Boolean),
  };
};

export default getAllProducts;
