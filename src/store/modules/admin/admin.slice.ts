import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import adminService from '../../../services/admin-api';
import type { Admin, AdminFormData } from '../../../types/Admin';
import type { User } from '../../../types/users';

interface PaginationState {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AdminState {
  profile: Admin | null;

  users: User[];
  admins: Admin[];
  selectedUser: User | null;
  pagination: PaginationState;
  adminPagination: PaginationState;

  totalCount: number;
  newCount: number;

  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;

  createState: {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  };
  updateState: {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  };
  passwordState: {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  };
  deleteState: {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  };
}

const initialAsyncState = {
  status: 'idle' as const,
  error: null as string | null,
};

const initialState: AdminState = {
  profile: null,
  users: [],
  admins: [],
  selectedUser: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  adminPagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  totalCount: 0,
  newCount: 0,
  status: 'idle',
  error: null,
  createState: { ...initialAsyncState },
  updateState: { ...initialAsyncState },
  passwordState: { ...initialAsyncState },
  deleteState: { ...initialAsyncState },
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as any).response?.data?.message === 'string'
  ) {
    return (error as any).response.data.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};


export const fetchAdminProfile = createAsyncThunk(
  'admin/fetchAdminProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getProfile();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch profile'));
    }
  },
);

export const updateAdminProfile = createAsyncThunk(
  'admin/updateAdminProfile',
  async (data: Partial<AdminFormData>, { rejectWithValue }) => {
    try {
      return await adminService.updateProfile(data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update profile'));
    }
  },
);

export const updateAdminPassword = createAsyncThunk(
  'admin/updateAdminPassword',
  async (
    { currentPassword, newPassword }: {
      currentPassword: string;
      newPassword: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await adminService.updatePassword(currentPassword, newPassword);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update password'));
    }
  },
);

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (
    {
      page = 1,
      limit = 10,
      isActive,
      role = 'user',
    }: { page?: number; limit?: number; isActive?: boolean; role?: 'user' | 'admin' | 'super_admin' } = {},
    { rejectWithValue }
  ) => {
    try {
      return await adminService.getAllUsers(page, limit, isActive, role);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load users'));
    }
  }
);

export const fetchAllAdmins = createAsyncThunk(
  'admin/fetchAllAdmins',
  async (
    {
      page = 1,
      limit = 10,
      isActive,
    }: { page?: number; limit?: number; isActive?: boolean } = {},
    { rejectWithValue }
  ) => {
    try {
      return await adminService.getAllUsers(page, limit, isActive, 'admin');
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load admins'));
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'admin/fetchUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await adminService.getUserById(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load user'));
    }
  },
);

export const createAdminUser = createAsyncThunk(
  'admin/createAdminUser',
  async (payload: Partial<User>, { rejectWithValue }) => {
    try {
      return await adminService.createUser(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create user'));
    }
  },
);

export const updateAdminUser = createAsyncThunk(
  'admin/updateAdminUser',
  async (
    { id, data }: { id: string; data: Partial<User> | Partial<AdminFormData> },
    { rejectWithValue }
  ) => {
    try {
      return await adminService.updateUser(id, data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update user'));
    }
  },
);

export const toggleAdminUserStatus = createAsyncThunk(
  'admin/toggleAdminUserStatus',
  async (
    { id, isActive }: { id: string; isActive: boolean },
    { rejectWithValue },
  ) => {
    try {
      await adminService.updateUserStatus(id, isActive);
      return { id, isActive };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update status'));
    }
  },
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
      state.createState.error = null;
      state.updateState.error = null;
      state.passwordState.error = null;
      state.deleteState.error = null;
    },
    resetAdminNewCount: (state) => {
      state.newCount = 0;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAdminProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchAdminProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string);
      })

      .addCase(fetchAllUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
        state.totalCount = action.payload.pagination.total;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string);
      })

      .addCase(fetchAllAdmins.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllAdmins.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.admins = action.payload.users as unknown as Admin[];
        state.adminPagination = action.payload.pagination;
      })
      .addCase(fetchAllAdmins.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string);
      })

      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })

      .addCase(createAdminUser.pending, (state) => {
        state.createState.status = 'loading';
      })
      .addCase(createAdminUser.fulfilled, (state) => {
        state.createState.status = 'succeeded';
        state.totalCount += 1;
        state.newCount += 1;
      })
      .addCase(createAdminUser.rejected, (state, action) => {
        state.createState.status = 'failed';
        state.createState.error = (action.payload as string);
      })

      .addCase(updateAdminUser.pending, (state) => {
        state.updateState.status = 'loading';
      })
      .addCase(updateAdminUser.fulfilled, (state) => {
        state.updateState.status = 'succeeded';
      })
      .addCase(updateAdminUser.rejected, (state, action) => {
        state.updateState.status = 'failed';
        state.updateState.error = (action.payload as string);
      })

      .addCase(toggleAdminUserStatus.pending, (state) => {
        state.updateState.status = 'loading';
        state.updateState.error = null;
      })
      .addCase(toggleAdminUserStatus.fulfilled, (state, action) => {
        state.updateState.status = 'succeeded';
        if (state.selectedUser?._id === action.payload.id) {
          state.selectedUser = {
            ...state.selectedUser,
            isActive: action.payload.isActive,
          };
        }

        if (state.profile?._id === action.payload.id) {
          state.profile = {
            ...state.profile,
            isActive: action.payload.isActive,
          };
        }
      })
      .addCase(toggleAdminUserStatus.rejected, (state, action) => {
        state.updateState.status = 'failed';
        state.updateState.error = (action.payload as string);
      })

      .addCase(updateAdminPassword.pending, (state) => {
        state.passwordState.status = 'loading';
      })
      .addCase(updateAdminPassword.fulfilled, (state) => {
        state.passwordState.status = 'succeeded';
      })
      .addCase(updateAdminPassword.rejected, (state, action) => {
        state.passwordState.status = 'failed';
        state.passwordState.error = (action.payload as string);
      });
  },
});

export const { clearAdminError, resetAdminNewCount, clearSelectedUser } = adminSlice.actions;

export default adminSlice.reducer;
