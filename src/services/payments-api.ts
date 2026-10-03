import axiosInstance from './axiosInstance';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded' | string;

export interface PaymentRecord {
  _id: string;
  orderId?:
    | string
    | {
        _id?: string;
        totalAmount?: number;
        paymentMethod?: string;
        paymentStatus?: string;
        orderStatus?: string;
      };
  userId?:
    | string
    | {
        _id?: string;
        name?: string;
        email?: string;
        phone?: string;
      };
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount?: number;
  status?: PaymentStatus;
  refund?: {
    razorpayRefundId?: string;
    amount?: number;
    status?: string;
    refundedAt?: string | null;
    notes?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentSummary {
  totalPayments: number;
  successfulCount: number;
  successfulAmount: number;
}

export interface PaymentsListResponse {
  payments: PaymentRecord[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  summary: PaymentSummary;
}

export interface FetchPaymentsParams {
  page?: number;
  limit?: number;
  status?: string;
}

const unwrapList = (payload: any): PaymentsListResponse => {
  const data = payload?.data ?? payload?.payments ?? [];
  const summary = payload?.summary || {};
  return {
    payments: Array.isArray(data) ? data : [],
    pagination: payload?.pagination || {
      total: Array.isArray(data) ? data.length : 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
    summary: {
      totalPayments: Number(summary.totalPayments || 0),
      successfulCount: Number(summary.successfulCount || 0),
      successfulAmount: Number(summary.successfulAmount || 0),
    },
  };
};

export const fetchAdminPayments = async (
  params: FetchPaymentsParams = {},
): Promise<PaymentsListResponse> => {
  const { page = 1, limit = 10, status } = params;
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (status && status !== 'All') {
    query.set('status', status.toLowerCase());
  }

  const response = await axiosInstance.get(`/admin/payments?${query.toString()}`);
  return unwrapList(response.data);
};

export const getPaymentOrderLabel = (payment: PaymentRecord): string => {
  if (payment.orderId && typeof payment.orderId === 'object') {
    return payment.orderId._id || '—';
  }

  return typeof payment.orderId === 'string' ? payment.orderId : '—';
};

export const getPaymentUserLabel = (payment: PaymentRecord): string => {
  if (payment.userId && typeof payment.userId === 'object') {
    return payment.userId.name || payment.userId.email || '—';
  }

  return '—';
};

export const getPaymentUserEmail = (payment: PaymentRecord): string => {
  if (payment.userId && typeof payment.userId === 'object') {
    return payment.userId.email || '';
  }

  return '';
};
