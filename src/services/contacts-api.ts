import api from './axiosInstance';
import { Contact } from '../types/contacts';
 
export interface PaginatedContactsResponse {
  total: number;
  contacts: Contact[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
 
export const contactService = {
  adminGetAll: async (page = 1, limit = 10): Promise<PaginatedContactsResponse> => {
    try {
      const response = await api.get(`/v1/admin/contacts?page=${page}&limit=${limit}`);
      const data = response.data;
 
      let contacts = [];
      let pagination = { total: 0, page: 1, limit: 10, totalPages: 1 };
     
      if (Array.isArray(data)) {
        contacts = data;
        pagination = {
          total: data.length,
          page: page,
          limit: limit,
          totalPages: Math.ceil(data.length / limit)
        };
      } else if (data.contacts) {
        contacts = data.contacts;
        pagination = data.pagination || pagination;
      } else if (data.data) {
        contacts = data.data;
        pagination = data.pagination || pagination;
      } else {
        contacts = data;
      }
 
      return {
        total: pagination.total,
        contacts: contacts || [],
        pagination: pagination
      };
    } catch (error) {
      console.error("API Fetch Error:", error);
      return {
        total: 0,
        contacts: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 }
      };
    }
  },
 
  getById: async (id: string): Promise<Contact> => {
    const response = await api.get(`/v1/admin/contacts/${id}`);
    return response.data;
  },
 
  delete: (id: string) => api.delete(`/v1/admin/contacts/${id}`),
};  
 