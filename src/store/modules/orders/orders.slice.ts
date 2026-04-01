import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  deleteAdminOrder,
  fetchAdminOrders,
  type FetchOrdersParams,
  type Order,
  updateAdminOrder,
} from '../../../services/Orders-api';
import { getErrorMessage } from '../../shared/helpers';
import {
  createInitialMutationState,
  initialPaginationState,
  type AsyncStatus,
  type MutationState,
  type PaginationState,
} from '../../shared/types';

interface OrdersState {
  items: Order[];
  selectedOrder: Order | null;
  pagination: PaginationState;
  totalCount: number;
  newCount: number;
  status: AsyncStatus;
  error: string | null;
  updateState: MutationState;
  deleteState: MutationState;
}

const initialState: OrdersState = {
  items: [],
  selectedOrder: null,
  pagination: initialPaginationState,
  totalCount: 0,
  newCount: 0,
  status: 'idle',
  error: null,
  updateState: createInitialMutationState(),
  deleteState: createInitialMutationState(),
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: FetchOrdersParams = {}, { rejectWithValue }) => {
    try {
      return await fetchAdminOrders(params);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load orders'));
    }
  },
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async (
    { orderId, orderData }: { orderId: string; orderData: Partial<Order> },
    { rejectWithValue },
  ) => {
    try {
      return await updateAdminOrder(orderId, orderData);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update order'));
    }
  },
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async ({ orderId }: { orderId: string }, { rejectWithValue }) => {
    try {
      await deleteAdminOrder(orderId);
      return orderId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to delete order'));
    }
  },
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    resetOrdersNewCount: (state) => {
      state.newCount = 0;
    },
    clearOrdersError: (state) => {
      state.error = null;
    },
    clearOrderMutations: (state) => {
      state.updateState = createInitialMutationState();
      state.deleteState = createInitialMutationState();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.orders ?? [];
        state.pagination = {
          ...initialPaginationState,
          ...action.payload.pagination,
        };
        state.totalCount =
          action.payload.pagination?.total ??
          action.payload.total ??
          action.payload.orders.length;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to load orders';
      })
      .addCase(updateOrder.pending, (state) => {
        state.updateState.status = 'loading';
        state.updateState.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.updateState.status = 'succeeded';
        state.selectedOrder = action.payload;
        state.items = state.items.map((order) =>
          order._id === action.payload._id ? { ...order, ...action.payload } : order,
        );
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.updateState.status = 'failed';
        state.updateState.error =
          (action.payload as string) ?? 'Failed to update order';
      })
      .addCase(deleteOrder.pending, (state) => {
        state.deleteState.status = 'loading';
        state.deleteState.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.deleteState.status = 'succeeded';
        state.items = state.items.filter((order) => order._id !== action.payload);
        state.totalCount = Math.max(0, state.totalCount - 1);
        if (state.selectedOrder?._id === action.payload) {
          state.selectedOrder = null;
        }
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.deleteState.status = 'failed';
        state.deleteState.error =
          (action.payload as string) ?? 'Failed to delete order';
      });
  },
});

export const {
  setSelectedOrder,
  resetOrdersNewCount,
  clearOrdersError,
  clearOrderMutations,
} = ordersSlice.actions;

export default ordersSlice.reducer;
