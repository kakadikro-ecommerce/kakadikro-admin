import React, { useEffect, useState } from 'react';
import {
  X,
  Package,
  CreditCard,
  FileText,
  Calendar,
  Activity,
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
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Invalid Date';
  }

  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (amount?: number | null) => `Rs ${Number(amount ?? 0).toLocaleString()}`;

const getItemImage = (item: OrderItem) => item.productImage || item.image || '';

const buildAddress = (order: Order) => {
  const address = order.shippingAddress;

  if (!address) {
    return 'N/A';
  }

  return [
    address.addressLine1,
    address.addressLine2,
    [address.city, address.state].filter(Boolean).join(', '),
    address.postalCode,
    address.country,
  ]
    .filter((value) => typeof value === 'string' && value.trim().length > 0)
    .join(', ');
};

const getStatusStyle = (statusValue?: string) => {
  switch (normalizeOrderStatus(statusValue)) {
    case 'delivered':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'cancelled':
      return 'bg-rose-50 text-rose-600 border-rose-100';
    case 'dispatched':
      return 'bg-blue-50 text-blue-600 border-blue-100';
    default:
      return 'bg-amber-50 text-amber-600 border-amber-100';
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

      if (order.isDeleted === true) {
        setOrderDetails(order);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getAdminOrderById(order._id);
        if (isMounted) {
          setOrderDetails(response);
        }
      } catch (fetchError) {
        if (isMounted) {
          setOrderDetails(order);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Failed to load order details.',
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchOrderDetails();

    return () => {
      isMounted = false;
    };
  }, [isOpen, order]);

  const displayOrder = orderDetails ?? order;

  if (!isOpen || !displayOrder) {
    return null;
  }

  const normalizedStatus = normalizeOrderStatus(displayOrder.orderStatus);
  const paymentLabel = displayOrder.paymentMethod
    ? `${displayOrder.paymentMethod.toUpperCase()} (${displayOrder.paymentStatus || 'pending'})`
    : displayOrder.paymentStatus || 'N/A';
  const customerName =
    displayOrder.user?.name || displayOrder.shippingAddress?.fullName || 'Guest';
  const shippingPhone =
    displayOrder.shippingAddress?.phone || displayOrder.user?.phone || 'N/A';
  const shippingAddress = buildAddress(displayOrder);
  const itemsCount = displayOrder.items?.length ?? 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full mx-auto bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto min-h-0">
        <div className="bg-[#3E2723] px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-white/10 p-2 rounded-lg shrink-0">
              <Package className="text-white" size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-bold tracking-tight text-lg leading-tight">
                Order Details
              </h2>
              <p className="text-xs md:text-sm font-medium text-white/70 tracking-wide truncate">
                {displayOrder.orderNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/80 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white custom-scrollbar space-y-6 min-h-0">
          {loading && (
            <div className="flex items-center justify-center gap-3 py-6 text-[#A69080]">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm md:text-base font-semibold tracking-wide uppercase">
                Loading Order
              </span>
            </div>
          )}

          {error && (
            <div className="bg-rose-50/40 border border-rose-100 rounded-[1.5rem] px-4 py-3 flex items-center gap-3 text-rose-700">
              <AlertCircle size={16} className="shrink-0" />
              <p className="text-sm font-semibold tracking-wide">
                {error}
              </p>
            </div>
          )}

          <div className="bg-white rounded-[2rem] p-5 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <InfoItem
                label="Order ID"
                value={displayOrder.orderNumber || 'N/A'}
                icon={<Package size={14} />}
              />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={14} className="text-[#A69080] opacity-60" />
                  <p className="text-sm md:text-base font-bold text-[#A69080] tracking-widest uppercase">
                    Order Status
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-4 py-1.5 rounded-xl text-sm md:text-base font-semibold tracking-widest border uppercase ${getStatusStyle(
                    normalizedStatus,
                  )}`}
                >
                  {normalizedStatus}
                </span>
              </div>
              <InfoItem
                label="Placed At"
                value={formatDate(displayOrder.placedAt || displayOrder.createdAt)}
                icon={<Calendar size={14} />}
              />
              <InfoItem
                label="Payment Method"
                value={paymentLabel}
                icon={<CreditCard size={14} />}
              />
              <InfoItem label="Customer" value={customerName} icon={<User size={14} />} />
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-5 md:p-8">
            <div className="flex items-center gap-2 pb-4 mb-6">
              <ShoppingBag size={16} className="text-[#A69080]" />
              <h3 className="text-sm md:text-base font-semibold text-[#A69080] tracking-[0.2em] uppercase">
                Ordered Items ({itemsCount})
              </h3>
            </div>
            <div className="space-y-4">
              {itemsCount > 0 ? (
                displayOrder.items.map((item, idx) => (
                  <div
                    key={item._id || `${item.productId || item.name || 'item'}-${idx}`}
                    className="flex items-center justify-between gap-4 p-4 bg-[#FDFBF9] rounded-[1.5rem] transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {getItemImage(item) ? (
                        <img
                          src={getItemImage(item)}
                          alt={item.name || 'Order item'}
                          className="w-14 h-14 rounded-2xl object-cover bg-white border border-[#EFE4D5] shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-white border border-[#EFE4D5] shrink-0 flex items-center justify-center text-[#A69080]">
                          <Package size={20} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-base md:text-lg font-bold text-[#3E2723] truncate">
                          {item.name || 'Unnamed Product'}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          {item.weight && (
                            <span className="text-xs md:text-sm font-semibold text-[#A69080] bg-white px-2 py-1 rounded-md">
                              {item.weight}
                            </span>
                          )}
                          <span className="text-xs md:text-sm font-semibold text-[#3E2723]/70">
                            QTY: {item.quantity ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                     <p className="text-sm md:text-base text-[#A69080] font-medium">
                        {formatCurrency(item.unitPrice)} / unit
                      </p>
                      <p className="text-lg md:text-xl font-bold text-[#3E2723]">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 bg-[#FDFBF9] rounded-[1.5rem] text-center">
                  <p className="text-[11px] font-bold text-[#A69080] uppercase tracking-wider">
                    No Items Available
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-5 md:p-8">
            <div className="flex items-center gap-2 border-b border-[#EFE4D5] pb-4 mb-6">
              <MapPin size={16} className="text-[#A69080]" />
              <h3 className="text-sm md:text-base font-semibold text-[#A69080] tracking-[0.2em] uppercase">
                Delivery Address
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-xs md:text-sm font-semibold text-[#A69080] uppercase tracking-wide">
                  Recipient
                </p>
                <p className="text-base md:text-lg font-bold text-[#3E2723]">
                  {displayOrder.shippingAddress?.fullName || customerName}
                </p>
                <p className="text-[13px] font-bold text-[#3E2723]/70 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#A69080]" />
                  {shippingPhone}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs md:text-sm font-semibold text-[#A69080] uppercase tracking-wide">
                  Location
                </p>
                <p className="text-sm md:text-base font-medium text-[#3E2723]/80 leading-relaxed">
                  {shippingAddress}
                </p>
              </div>
            </div>
          </div>

          {(displayOrder.adminNote || displayOrder.notes) && (
            <div className="bg-rose-50/30 border border-rose-100 rounded-[2rem] p-5 md:p-8">
              <div className="flex items-center gap-2 mb-4 text-rose-800">
                <FileText size={16} />
              <h3 className="text-sm md:text-base font-semibold uppercase tracking-wide">
                  Admin Instructions
                </h3>
              </div>
              <p className="text-sm md:text-base font-medium text-[#3E2723] italic leading-relaxed">
                "{displayOrder.adminNote || displayOrder.notes}"
              </p>
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
  <div className="space-y-2 min-w-0">
    <div className="flex items-center gap-2">
      <span className="text-[#A69080] opacity-60 shrink-0">{icon}</span>
      <p className="text-xs md:text-sm font-semibold text-[#A69080] tracking-wide uppercase">
        {label}
      </p>
    </div>
    <p className="text-base md:text-lg font-bold text-[#3E2723] break-words leading-snug">
      {value}
    </p>
  </div>
);

export default OrderViewModal;
