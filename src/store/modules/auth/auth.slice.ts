import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService } from '../../../services/authService';
import type { AsyncStatus } from '../../shared/types';
import { getErrorMessage } from '../../shared/helpers';

export interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  status: AsyncStatus;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
  initialized: false,
};

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      let isAuthenticated = authService.initAuth();
      let accessToken = localStorage.getItem('accessToken');
      const user = authService.getCurrentUser();

      return {
        accessToken,
        user,
        isAuthenticated,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to initialize authentication state'),
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { auth } = getState() as { auth: AuthState };

      return auth.status !== 'loading' && !auth.initialized;
    },
  },
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);

      return {
        accessToken: response.accessToken ?? response.data?.accessToken ?? localStorage.getItem('accessToken'),
        user: response.user ?? response.data?.user ?? authService.getCurrentUser(),
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Login failed'));
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  authService.logout();
});

const authSlice = createSlice({     
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser(state, action: { payload: AuthUser | null }) {
      state.user = action.payload;

      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('user');
      }
    },
    clearAuthState(state) {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.initialized = true;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.initialized = true;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.status = 'failed';
        state.initialized = true;
        state.error = (action.payload as string) ?? 'Authentication init failed';
        state.accessToken = null;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.initialized = true;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Login failed';
        state.isAuthenticated = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = 'idle';
        state.error = null;
        state.accessToken = null;
        state.user = null;
        state.isAuthenticated = false;
        state.initialized = true;
      });
  },
});

export const { clearAuthState, setAuthUser } = authSlice.actions;

export default authSlice.reducer;
