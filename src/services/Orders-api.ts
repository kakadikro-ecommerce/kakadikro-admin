import axiosInstance from './axiosInstance';

export const ORDER_STATUS_FILTER_OPTIONS = [
  'All',
  'Active',
  'Deleted',
  'confirmed',
  'dispatched',
  'delivered',
  'cancelled',
] as const;

export interface OrderUser {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface OrderShippingAddress {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface OrderShipment {
  trackingId?: string;
  courierName?: string;
  dispatchedAt?: string | null;
  deliveredAt?: string | null;
}

export interface OrderPaymentDetails {
  transactionId?: string;
  gateway?: string;
  paidAt?: string | null;
  amount?: number;
}

export interface OrderItem {
  _id?: string;
  productId?: string;
  name?: string;
  productImage?: string;
  image?: string;
  weight?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user?: OrderUser | null;
  items: OrderItem[];
  shippingAddress?: OrderShippingAddress | null;
  totalAmount?: number;
  subtotalAmount?: number;
  shippingAmount?: number;
  taxAmount?: number;
  discountAmount?: number;
  orderStatus?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentDetails?: OrderPaymentDetails | null;
  adminNote?: string;
  notes?: string;
  isDeleted?: boolean;
  shipment?: OrderShipment | null;
  placedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface FetchOrdersParams {
  page?: number;
  limit?: number;
  isDeleted?: boolean;
}

export interface OrdersListResponse {
  orders: Order[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  total?: number;
}

type FetchOrdersInput = FetchOrdersParams | number;

export const normalizeOrderStatus = (status?: string | null): string => {
  const normalizedStatus = status?.trim().toLowerCase();

  if (!normalizedStatus) {
    return 'confirmed';
  }

  if (normalizedStatus === 'shipped') {
    return 'dispatched';
  }

  return normalizedStatus;
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const normalizeOrderItem = (item: unknown): OrderItem => {
  const rawItem = (item ?? {}) as Record<string, unknown>;

  return {
    _id: typeof rawItem._id === 'string' ? rawItem._id : undefined,
    productId:
      typeof rawItem.productId === 'string'
        ? rawItem.productId
        : typeof (rawItem.product as Record<string, unknown> | undefined)?._id === 'string'
          ? ((rawItem.product as Record<string, unknown>)._id as string)
          : undefined,
    name:
      typeof rawItem.name === 'string'
        ? rawItem.name
        : typeof (rawItem.product as Record<string, unknown> | undefined)?.name === 'string'
          ? ((rawItem.product as Record<string, unknown>).name as string)
          : 'Unnamed Product',
    productImage:
      typeof rawItem.productImage === 'string'
        ? rawItem.productImage
        : typeof rawItem.image === 'string'
          ? rawItem.image
          : typeof (rawItem.product as Record<string, unknown> | undefined)?.image === 'string'
            ? ((rawItem.product as Record<string, unknown>).image as string)
            : typeof (rawItem.product as Record<string, unknown> | undefined)?.productImage ===
                'string'
              ? ((rawItem.product as Record<string, unknown>).productImage as string)
              : undefined,
    image: typeof rawItem.image === 'string' ? rawItem.image : undefined,
    weight:
      typeof rawItem.weight === 'string'
        ? rawItem.weight
        : typeof (rawItem.variant as Record<string, unknown> | undefined)?.weight === 'string'
          ? ((rawItem.variant as Record<string, unknown>).weight as string)
          : undefined,
    quantity: toNumber(rawItem.quantity),
    unitPrice: toNumber(rawItem.unitPrice ?? rawItem.price),
    totalPrice: toNumber(rawItem.totalPrice ?? rawItem.lineTotal),
  };
};

const normalizeOrder = (order: unknown): Order => {
  const rawOrder = (order ?? {}) as Record<string, unknown>;
  const rawUser = (rawOrder.user ?? {}) as Record<string, unknown>;
  const rawShipping = (rawOrder.shippingAddress ?? {}) as Record<string, unknown>;
  const rawShipment = (rawOrder.shipment ?? {}) as Record<string, unknown>;
  const rawPaymentDetails = (rawOrder.paymentDetails ?? {}) as Record<string, unknown>;

  return {
    _id: typeof rawOrder._id === 'string' ? rawOrder._id : '',
    orderNumber:
      typeof rawOrder.orderNumber === 'string' && rawOrder.orderNumber.trim().length > 0
        ? rawOrder.orderNumber
        : typeof rawOrder._id === 'string'
          ? `#${rawOrder._id.slice(-6).toUpperCase()}`
          : 'N/A',
    user:
      Object.keys(rawUser).length > 0
        ? {
            _id: typeof rawUser._id === 'string' ? rawUser._id : undefined,
            name: typeof rawUser.name === 'string' ? rawUser.name : undefined,
            email: typeof rawUser.email === 'string' ? rawUser.email : undefined,
            phone: typeof rawUser.phone === 'string' ? rawUser.phone : undefined,
          }
        : null,
    items: Array.isArray(rawOrder.items) ? rawOrder.items.map(normalizeOrderItem) : [],
    shippingAddress:
      Object.keys(rawShipping).length > 0
        ? {
            fullName:
              typeof rawShipping.fullName === 'string' ? rawShipping.fullName : undefined,
            phone: typeof rawShipping.phone === 'string' ? rawShipping.phone : undefined,
            addressLine1:
              typeof rawShipping.addressLine1 === 'string'
                ? rawShipping.addressLine1
                : undefined,
            addressLine2:
              typeof rawShipping.addressLine2 === 'string'
                ? rawShipping.addressLine2
                : undefined,
            city: typeof rawShipping.city === 'string' ? rawShipping.city : undefined,
            state: typeof rawShipping.state === 'string' ? rawShipping.state : undefined,
            postalCode:
              typeof rawShipping.postalCode === 'string' ? rawShipping.postalCode : undefined,
            country: typeof rawShipping.country === 'string' ? rawShipping.country : undefined,
          }
        : null,
    totalAmount: toNumber(rawOrder.totalAmount),
    subtotalAmount: toNumber(rawOrder.subtotalAmount),
    shippingAmount: toNumber(rawOrder.shippingAmount),
    taxAmount: toNumber(rawOrder.taxAmount),
    discountAmount: toNumber(rawOrder.discountAmount),
    orderStatus: normalizeOrderStatus(
      typeof rawOrder.orderStatus === 'string' ? rawOrder.orderStatus : undefined,
    ),
    paymentMethod:
      typeof rawOrder.paymentMethod === 'string' ? rawOrder.paymentMethod : undefined,
    paymentStatus:
      typeof rawOrder.paymentStatus === 'string' ? rawOrder.paymentStatus : undefined,
    paymentDetails:
      Object.keys(rawPaymentDetails).length > 0
        ? {
            transactionId:
              typeof rawPaymentDetails.transactionId === 'string'
                ? rawPaymentDetails.transactionId
                : undefined,
            gateway:
              typeof rawPaymentDetails.gateway === 'string'
                ? rawPaymentDetails.gateway
                : undefined,
            paidAt:
              typeof rawPaymentDetails.paidAt === 'string' ? rawPaymentDetails.paidAt : null,
            amount: toNumber(rawPaymentDetails.amount),
          }
        : null,
    adminNote: typeof rawOrder.adminNote === 'string' ? rawOrder.adminNote : undefined,
    notes: typeof rawOrder.notes === 'string' ? rawOrder.notes : undefined,
    isDeleted: Boolean(rawOrder.isDeleted),
    shipment:
      Object.keys(rawShipment).length > 0
        ? {
            trackingId:
              typeof rawShipment.trackingId === 'string' ? rawShipment.trackingId : undefined,
            courierName:
              typeof rawShipment.courierName === 'string' ? rawShipment.courierName : undefined,
            dispatchedAt:
              typeof rawShipment.dispatchedAt === 'string' ? rawShipment.dispatchedAt : null,
            deliveredAt:
              typeof rawShipment.deliveredAt === 'string' ? rawShipment.deliveredAt : null,
          }
        : null,
    placedAt: typeof rawOrder.placedAt === 'string' ? rawOrder.placedAt : null,
    createdAt: typeof rawOrder.createdAt === 'string' ? rawOrder.createdAt : null,
    updatedAt: typeof rawOrder.updatedAt === 'string' ? rawOrder.updatedAt : null,
  };
};

const normalizeOrdersResponse = (payload: unknown): OrdersListResponse | Order => {
  const rawPayload = (payload ?? {}) as Record<string, unknown>;
  const pagination =
    typeof rawPayload.pagination === 'object' && rawPayload.pagination !== null
      ? (rawPayload.pagination as OrdersListResponse['pagination'])
      : undefined;

  if (Array.isArray(rawPayload.orders)) {
    return {
      orders: rawPayload.orders.map(normalizeOrder),
      pagination,
      total:
        typeof rawPayload.total === 'number'
          ? rawPayload.total
          : rawPayload.orders.length,
    };
  }

  if (Array.isArray(rawPayload.data)) {
    return {
      orders: rawPayload.data.map(normalizeOrder),
      pagination,
      total:
        typeof rawPayload.total === 'number'
          ? rawPayload.total
          : Array.isArray(rawPayload.data)
            ? rawPayload.data.length
            : 0,
    };
  }

  if (rawPayload._id) {
    return normalizeOrder(rawPayload);
  }

  if ((rawPayload.order as Record<string, unknown> | undefined)?._id) {
    return normalizeOrder(rawPayload.order);
  }

  if ((rawPayload.data as Record<string, unknown> | undefined)?._id) {
    return normalizeOrder(rawPayload.data);
  }

  return {
    orders: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
    total: 0,
  };
};

const resolveFetchOrdersParams = (
  pageOrParams: FetchOrdersInput = 1,
  limitArg?: number,
  options: FetchOrdersParams = {},
): Required<Pick<FetchOrdersParams, 'page' | 'limit'>> &
  Pick<FetchOrdersParams, 'isDeleted'> => {
  if (typeof pageOrParams === 'number') {
    return {
      page: pageOrParams,
      limit: limitArg ?? 10,
      isDeleted: options.isDeleted,
    };
  }

  return {
    page: pageOrParams.page ?? 1,
    limit: pageOrParams.limit ?? 10,
    isDeleted: pageOrParams.isDeleted,
  };
};

export const fetchAdminOrders = async (
  pageOrParams: FetchOrdersInput = 1,
  limitArg?: number,
  options: FetchOrdersParams = {},
): Promise<OrdersListResponse> => {
  const { page, limit, isDeleted } = resolveFetchOrdersParams(
    pageOrParams,
    limitArg,
    options,
  );

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (typeof isDeleted === 'boolean') {
    params.set('isDeleted', String(isDeleted));
  }

  const response = await axiosInstance.get(`/v1/admin/orders?${params.toString()}`);
  return normalizeOrdersResponse(response.data) as OrdersListResponse;
};

export const updateAdminOrder = async (
  orderId: string,
  orderData: Partial<Order>,
): Promise<Order> => {
  const cleanPayload: Record<string, unknown> = {};

  if (typeof orderData.orderStatus === 'string') {
    cleanPayload.orderStatus = normalizeOrderStatus(orderData.orderStatus);
  }

  if (typeof orderData.paymentStatus === 'string') {
    cleanPayload.paymentStatus = orderData.paymentStatus;
  }

  if (orderData.adminNote !== undefined) {
    cleanPayload.adminNote = orderData.adminNote;
  }

  if (orderData.shipment) {
    const shipmentPayload: Record<string, unknown> = {};

    if (orderData.shipment.trackingId !== undefined) {
      shipmentPayload.trackingId = orderData.shipment.trackingId;
    }

    if (orderData.shipment.courierName !== undefined) {
      shipmentPayload.courierName = orderData.shipment.courierName;
    }

    if (orderData.shipment.dispatchedAt !== undefined) {
      shipmentPayload.dispatchedAt = orderData.shipment.dispatchedAt;
    }

    if (orderData.shipment.deliveredAt !== undefined) {
      shipmentPayload.deliveredAt = orderData.shipment.deliveredAt;
    }

    if (Object.keys(shipmentPayload).length > 0) {
      cleanPayload.shipment = shipmentPayload;
    }
  }

  const response = await axiosInstance.put(
    `/v1/admin/orders/status/${orderId}`,
    cleanPayload,
  );
  return normalizeOrdersResponse(response.data) as Order;
};

export const deleteAdminOrder = async (orderId: string) => {
  const response = await axiosInstance.delete(`/v1/admin/orders/${orderId}`);
  return normalizeOrdersResponse(response.data);
};

export const getAdminOrderById = async (orderId: string): Promise<Order> => {
  const response = await axiosInstance.get(`/v1/admin/orders/${orderId}`);
  return normalizeOrdersResponse(response.data) as Order;
};

export const orderService = {
  adminGetAll: fetchAdminOrders,
  getById: getAdminOrderById,
  update: updateAdminOrder,
  delete: deleteAdminOrder,
};

const ordersApi = {
  getAllOrders: fetchAdminOrders,
  ...orderService,
};

export default ordersApi;
