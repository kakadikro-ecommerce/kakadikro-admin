// types/admin.ts
export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  permissions?: string[];
  lastLogin?: string;
}

export interface AdminFormData {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
}

export interface PaginatedAdminResponse {
  admins: Admin[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}