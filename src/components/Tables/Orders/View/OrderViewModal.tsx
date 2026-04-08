import React, { useEffect, useState } from 'react';
import {
  X,
  Package,
  FileText,
  Calendar,
  User,
  MapPin,
  ShoppingBag,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../../../../pages/UiElements/Modal';
import {
  getAdminOrderById,
  normalizeOrderStatus,
  type Order,
  type OrderItem,
} from '../../../../services/Orders-api';

interface OrderViewModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatDate = (dateValue?: string | null) => {
  if (!dateValue) return 'N/A';
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return 'Invalid Date';

  return parsedDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (amount?: number | null) =>
  `₹${Number(amount ?? 0).toLocaleString()}`;

const getItemImage = (item: OrderItem) =>
  item.productImage || item.image || '';

const buildAddress = (order: Order) => {
  const address = order.shippingAddress;
  if (!address) return 'N/A';

  return [
    address.addressLine1,
    address.addressLine2,
    [address.city, address.state].filter(Boolean).join(', '),
    address.postalCode,
    address.country,
  ]
    .filter((v) => v?.toString().trim())
    .join(', ');
};

const getStatusStyle = (statusValue?: string) => {
  switch (normalizeOrderStatus(statusValue)) {
    case 'delivered':
      return 'bg-green-100 text-green-700';
    case 'cancelled':
      return 'bg-red-100 text-red-600';
    case 'dispatched':
      return 'bg-blue-100 text-blue-600';
    default:
      return 'bg-yellow-100 text-yellow-700';
  }
};

const OrderViewModal: React.FC<OrderViewModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOrderDetails = async () => {
      if (!isOpen || !order?._id) {
        if (!isOpen) {
          setOrderDetails(null);
          setError(null);
          setLoading(false);
        }
        return;
      }

      if (order.isDeleted) {
        setOrderDetails(order);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getAdminOrderById(order._id);
        if (isMounted) setOrderDetails(response);
      } catch (err: any) {
        if (isMounted) {
          setOrderDetails(order);
          setError(err?.message || 'Failed to load order');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrderDetails();
    return () => {
      isMounted = false;
    };
  }, [isOpen, order]);

  const displayOrder = orderDetails ?? order;
  if (!isOpen || !displayOrder) return null;

  const normalizedStatus = normalizeOrderStatus(displayOrder.orderStatus);
  const customerName =
    displayOrder.user?.name ||
    displayOrder.shippingAddress?.fullName ||
    'Guest';
  const shippingPhone =
    displayOrder.shippingAddress?.phone ||
    displayOrder.user?.phone ||
    'N/A';
  const shippingAddress = buildAddress(displayOrder);
  const itemsCount = displayOrder.items?.length ?? 0;
  const heroImage = getItemImage(displayOrder.items?.[0] as OrderItem);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="mx-auto flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-[#4E342E] px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-white/10 p-2">
              <Package className="text-white" size={18} />
            </div>
            <h2 className="text-lg font-semibold">Order Details</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 p-5 pb-10 md:p-6">
          <div className="overflow-hidden rounded-2xl shadow-sm">
            <div className="relative flex min-h-[240px] items-center justify-center p-4 sm:min-h-[320px]">
              <div className="absolute inset-0" />
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={displayOrder.items?.[0]?.name || 'Order item'}
                  className="relative z-10 max-h-[280px] w-full max-w-[420px] object-contain drop-shadow-2xl sm:max-h-[340px]"
                />
              ) : (
                <div className="relative z-10 flex flex-col items-center gap-3 text-[#6D4C41]">
                  <div className="rounded-full bg-white p-4 shadow-sm">
                    <Package size={28} />
                  </div>
                  <p className="text-sm font-medium">No product image available</p>
                </div>
              )}
            </div>

            <div className="space-y-4 px-5 py-5 md:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                    normalizedStatus,
                  )}`}
                >
                  {normalizedStatus}
                </span>
                <span className="rounded-full bg-[#F5F5F5] px-3 py-1 text-xs text-[#6D4C41]">
                  {itemsCount} item{itemsCount === 1 ? '' : 's'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoItem
                  label="Order ID"
                  value={displayOrder._id}
                  icon={<Package size={14} />}
                />
                <InfoItem
                  label="Date"
                  value={formatDate(displayOrder.createdAt)}
                  icon={<Calendar size={14} />}
                />
                <InfoItem
                  label="Customer"
                  value={customerName}
                  icon={<User size={14} />}
                />
                <InfoItem
                  label="Phone"
                  value={shippingPhone}
                  icon={<MapPin size={14} />}
                />
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#6D4C41]">
              <ShoppingBag size={14} /> Items ({itemsCount})
            </h3>

            <div className="space-y-3">
              {displayOrder.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-[#FAF8F6] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#3E2723]">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.weight} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {formatCurrency(item.unitPrice)}
                    </p>
                    <p className="text-sm font-medium text-[#3E2723]">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#6D4C41]">
              <MapPin size={14} /> Delivery Address
            </h3>

            <div className="rounded-xl bg-[#FAF8F6] p-4 text-sm">
              <p className="font-medium text-[#3E2723]">{customerName}</p>
              <p className="text-gray-600">{shippingPhone}</p>
              <p className="mt-1 text-gray-600">{shippingAddress}</p>
            </div>
          </div>

          {(displayOrder.adminNote || displayOrder.notes) && (
            <div className="rounded-xl bg-yellow-50 p-4 text-sm">
              <div className="mb-1 flex items-center gap-2">
                <FileText size={14} />
                <span className="font-medium">Note</span>
              </div>
              {displayOrder.adminNote || displayOrder.notes}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

const InfoItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div className="rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-gray-100">
    <p className="flex items-center gap-1 text-xs text-gray-500">
      {icon} {label}
    </p>
    <p className="mt-1 text-sm font-medium text-[#3E2723]">{value}</p>
  </div>
);

export default OrderViewModal;
