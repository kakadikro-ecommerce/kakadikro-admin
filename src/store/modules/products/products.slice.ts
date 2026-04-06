import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { productService } from '../../../services/products-api';
import type { Product } from '../../../types/product';
import {
  createInitialMutationState,
  initialPaginationState,
  type AsyncStatus,
  type MutationState,
  type PaginationState,
} from '../../shared/types';
import { getErrorMessage } from '../../shared/helpers';

interface ProductsQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  pagination: PaginationState;
  totalCount: number;
  newCount: number;
  status: AsyncStatus;
  error: string | null;
  createState: MutationState;
  updateState: MutationState;
  statusUpdateState: MutationState;
}

const initialState: ProductsState = {
  items: [],
  selectedProduct: null,
  pagination: initialPaginationState,
  totalCount: 0,
  newCount: 0,
  status: 'idle',
  error: null,
  createState: createInitialMutationState(),
  updateState: createInitialMutationState(),
  statusUpdateState: createInitialMutationState(),
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (
    { page = 1, limit = 10, isActive }: ProductsQueryParams = {},
    { rejectWithValue },
  ) => {
    try {
      return await productService.adminGetAll(page, limit, isActive);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load products'));
    }
  },
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (payload: FormData | Partial<Product>, { rejectWithValue }) => {
    try {
      const response = await productService.create(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create product'));
    }
  },
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async (
    { id, data }: { id: string; data: FormData | Partial<Product> },
    { rejectWithValue },
  ) => {
    try {
      const response = await productService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update product'));
    }
  },
);

export const toggleProductStatus = createAsyncThunk(
  'products/toggleProductStatus',
  async (
    { id, isActive }: { id: string; isActive: boolean },
    { rejectWithValue },
  ) => {
    try {
      await productService.toggleStatus(id, isActive);
      return { id, isActive };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to update status'),
      );
    }
  },
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductsError: (state) => {
      state.error = null;
    },
    resetProductsNewCount: (state) => {
      state.newCount = 0;
    },
    clearProductMutations: (state) => {
      state.createState = createInitialMutationState();
      state.updateState = createInitialMutationState();
      state.statusUpdateState = createInitialMutationState();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.products ?? [];
        state.pagination = {
          ...initialPaginationState,
          ...action.payload.pagination,
        };
        state.totalCount =
          action.payload.pagination?.total ?? state.items.length;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to load products';
      })
      .addCase(createProduct.pending, (state) => {
        state.createState.status = 'loading';
        state.createState.error = null;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.createState.status = 'succeeded';
        state.totalCount += 1;
        state.newCount += 1;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.createState.status = 'failed';
        state.createState.error =
          (action.payload as string) ?? 'Failed to create product';
      })
      .addCase(updateProduct.pending, (state) => {
        state.updateState.status = 'loading';
        state.updateState.error = null;
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.updateState.status = 'succeeded';
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.updateState.status = 'failed';
        state.updateState.error =
          (action.payload as string) ?? 'Failed to update product';
      })
      .addCase(toggleProductStatus.pending, (state) => {
        state.statusUpdateState.status = 'loading';
        state.statusUpdateState.error = null;
      })

      .addCase(toggleProductStatus.fulfilled, (state, action) => {
        state.statusUpdateState.status = 'succeeded';

        const product = state.items.find(p => p._id === action.payload.id);
        if (product) {
          product.isActive = action.payload.isActive;
        }
      })
      .addCase(toggleProductStatus.rejected, (state, action) => {
        state.statusUpdateState.status = 'failed';
        state.statusUpdateState.error =
          (action.payload as string) ?? 'Failed to update status';
      })
  },
});

export const {
  clearProductsError,
  resetProductsNewCount,
  clearProductMutations,
} = productsSlice.actions;

export default productsSlice.reducer;
