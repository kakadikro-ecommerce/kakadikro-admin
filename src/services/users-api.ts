import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.4:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  createdAt?: string;
  updatedAt?: string;
  phone?: string;
  address?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
  address?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  address?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: User;
}

class UserService {
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get('/users/profile');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updateProfile(data: UpdateUserData): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.put('/users/profile', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async changePassword(userId: string, data: ChangePasswordData): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.put(`/users/change-password/${userId}`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async createUser(data: CreateUserData): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<ApiResponse<{ users: User[]; total?: number }>> {
    try {
      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updateUser(userId: string, data: UpdateUserData): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.put(`/users/${userId}`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async deleteUser(userId: string): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      return new Error(message);
    }
    if (error.request) {
      return new Error('No response from server');
    }
    return new Error(error.message || 'Request failed');
  }
}

export default new UserService();