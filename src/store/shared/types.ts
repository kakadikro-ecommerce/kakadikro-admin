export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface PaginationState {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MutationState {
  status: AsyncStatus;
  error: string | null;
}

export const initialPaginationState: PaginationState = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};

export const createInitialMutationState = (): MutationState => ({
  status: 'idle',
  error: null,
});
