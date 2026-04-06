import api from './axiosInstance';
import { Product } from '../types/product';

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
export const productService = {
  adminGetAll: async (
    page = 1,
    limit = 10,
    isActive?: boolean,
  ): Promise<PaginatedResponse> => {
    try {
      let query = `/v1/admin/products?page=${page}&limit=${limit}`;

      if (isActive !== undefined) {
        query += `&isActive=${isActive}`;
      }

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
        let fallbackQuery = `/v1/admin/products?page=${page}&limit=${limit}`;

        if (isActive !== undefined) {
          fallbackQuery += `&isActive=${isActive}`;
        }

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

  create: (data: any) => {
    const isFormData = data instanceof FormData;
    if (isFormData) {
      return api.post<Product>('/v1/admin/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    const payload = formatPayload(data);
    return api.post<Product>('/v1/admin/products', payload);
  },

  update: (id: string, data: any) => {
    const isFormData = data instanceof FormData;
    if (isFormData) {
      return api.put<Product>(`/v1/admin/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    const payload = formatPayload(data);
    return api.put<Product>(`/v1/admin/products/${id}`, payload);
  },

  toggleStatus: (id: string, isActive: boolean) => {
  return api.put(`/v1/admin/products/status/${id}`, { isActive });
},

};

export const getAllProducts = (
  page = 1,
  limit = 10,
  isActive?: boolean,
): Promise<PaginatedResponse> => productService.adminGetAll(page, limit, isActive);

const formatPayload = (data: any) => {
  const { _id, __v, ...cleanData } = data;

  return {
    ...cleanData,
    variants: Array.isArray(data.variants)
      ? data.variants.map((v: any) => ({
          weight: v.weight || '100g',
          price: Number(v.price || 0),
          mrp: Number(v.mrp || 0),
          stock: Number(v.stock || 0),
        }))
      : [],
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    features: Array.isArray(data.features) ? data.features : [],
    benefits: Array.isArray(data.benefits) ? data.benefits : [],
    images: Array.isArray(data.images)
      ? data.images
      : [data.images].filter(Boolean),
  };
};

export default getAllProducts;
