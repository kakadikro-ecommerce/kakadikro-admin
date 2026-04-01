export interface User {
  [key: string]: any;
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateUserInput = Omit<User, '_id' | 'createdAt' | 'updatedAt'>;

export type UpdateUserInput = Partial<CreateUserInput>;

export interface UsersListResponse {
  users: User[];
  pagination: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export interface UserResponse {
  user: User;
}

export interface UserFormData {
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  password?: string;
}

export interface UserFilters {
  searchTerm: string;
  role: 'All' | 'user' | 'admin' | 'moderator';
  status: 'Active' | 'Inactive';
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  moderators: number;
  users: number;
}

export type UserRole = 'user' | 'admin' | 'moderator';

export type UserStatus = 'active' | 'inactive';

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
}