// services/admin-api.ts
import api from './axiosInstance';
import { Admin, AdminFormData } from '../types/Admin';
import { User } from '../types/users';

export interface PaginatedUsersResponse {
  total: number;
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const adminService = {
  getProfile: async (): Promise<Admin> => {
    try {
      const response = await api.get('/v1/admin/users/profile');
      return response.data.data || response.data;
    } catch (error) {
      console.error("Fetch Profile Error:", error);
      throw error;
    }
  },

  updateProfile: async (data: Partial<AdminFormData>): Promise<Admin> => {
    try {
      const response = await api.put('/v1/admin/users/profile', data);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Update Profile Error:", error);
      throw error;
    }
  },

  updatePassword: async (id: string, password: string): Promise<any> => {
    try {
      const response = await api.put(`/v1/admin/users/profile/password/${id}`, { password });
      return response.data;
    } catch (error) {
      console.error("Update Password Error:", error);
      throw error;
    }
  },

  getAllUsers: async (
    page = 1,
    limit = 10,
    isActive?: boolean,
  ): Promise<PaginatedUsersResponse> => {
    try {
      let query = `/v1/admin/users?page=${page}&limit=${limit}`;
      if (isActive !== undefined) {
        query += `&isActive=${isActive}`;
      }

      const response = await api.get(query);
      const data = response.data;

      return {
        total: data.pagination?.total || data.total || 0,
        users: data.users || data.data || [],
        pagination: data.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
    } catch (error) {
      console.error('API Fetch Error:', error);
      return {
        total: 0,
        users: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
      };
    }
  },

  getUserById: async (id: string): Promise<any> => {
    try {
      const response = await api.get(`/v1/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get User Error:', error);
      throw error;
    }
  },

  createUser: async (data: any): Promise<any> => {
    try {
      const { _id, ...createData } = data;
      const formattedData = {
        name: createData.name,
        email: createData.email,
        password: createData.password,
        role: createData.role || 'user',
        isActive: createData.isActive !== undefined ? createData.isActive : true,
      };

      let response;
      try {
        response = await api.post('/v1/admin/users', formattedData);
      } catch (err) {
        response = await api.post('/v1/auth/register', formattedData);
      }
      return response.data;
    } catch (error) {
      console.error('Create User Error:', error);
      throw error;
    }
  },

  updateUser: async (id: string, data: any): Promise<any> => {
    try {
      const { password, _id, ...updateData } = data;
      const formattedData = {
        name: updateData.name,
        email: updateData.email,
        role: updateData.role,
        isActive: updateData.isActive,
      };

      const response = await api.put(`/v1/admin/users/${id}`, formattedData);
      return response.data;
    } catch (error) {
      console.error('Update User Error:', error);
      throw error;
    }
  },

  deleteUser: async (id: string): Promise<any> => {
    try {
      const response = await api.delete(`/v1/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete Admin/User Error:", error);
      throw error;
    }
  },
};

export default adminService;