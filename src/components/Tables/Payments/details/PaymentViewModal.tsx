import React from 'react';
import { CreditCard, X } from 'lucide-react';
import { Modal } from '../../../../pages/UiElements/Modal';
import {
  getPaymentOrderLabel,
  getPaymentUserEmail,
  getPaymentUserLabel,
  type PaymentRecord,
} from '../../../../services/payments-api';

interface PaymentViewModalProps {
  payment: PaymentRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

const getOrder = (payment: PaymentRecord) =>
  payment.orderId && typeof payment.orderId === 'object' ? payment.orderId : null;

const getUser = (payment: PaymentRecord) =>
  payment.userId && typeof payment.userId === 'object' ? payment.userId : null;

export const formatPaymentType = (method?: string) => {
  const value = String(method || '').toLowerCase();
  if (!value) return 'Online';
  if (value === 'cod') return 'COD';
  if (value === 'upi') return 'UPI';
  if (value === 'card') return 'Card';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const getPaymentStatusLabel = (payment: PaymentRecord) => {
  const orderStatus = getOrder(payment)?.paymentStatus;
  const raw = String(orderStatus || payment.status || 'pending').toLowerCase();
  if (raw === 'success' || raw === 'paid') return 'Paid';
  if (raw === 'failed') return 'Failed';
  if (raw === 'refunded') return 'Refunded';
  if (raw === 'cancelled') return 'Cancelled';
  return 'Pending';
};

export const getPaymentStatusStyle = (label: string) => {
  switch (label.toLowerCase()) {
    case 'paid':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'failed':
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 border-rose-100';
    case 'refunded':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-amber-50 text-amber-700 border-amber-100';
  }
};

const currency = (value?: number) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1.5">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A69080]">
      {label}
    </p>
    <p className="break-all text-sm font-semibold text-[#3E2723]">{value || '—'}</p>
  </div>
);

const PaymentViewModal: React.FC<PaymentViewModalProps> = ({
  payment,
  isOpen,
  onClose,
}) => {
  if (!payment) return null;

  const order = getOrder(payment);
  const user = getUser(payment);
  const statusLabel = getPaymentStatusLabel(payment);
  const paymentType = formatPaymentType(order?.paymentMethod);
  const refund = payment.refund;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="mx-auto flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-[#4E342E] px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-white/10 p-2">
              <CreditCard className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Payment Details</h2>
              <p className="text-xs text-white/70">{currency(payment.amount)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-white/10"
            aria-label="Close payment details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
              {paymentType}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${getPaymentStatusStyle(
                statusLabel,
              )}`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="rounded-xl bg-[#FAF8F6] p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoItem label="Amount" value={currency(payment.amount)} />
              <InfoItem label="Payment type" value={paymentType} />
              <InfoItem label="Payment status" value={statusLabel} />
              <InfoItem
                label="Gateway status"
                value={String(payment.status || 'pending')}
              />
              <InfoItem label="Order" value={getPaymentOrderLabel(payment)} />
              <InfoItem
                label="Order status"
                value={order?.orderStatus || '—'}
              />
              <InfoItem
                label="Order total"
                value={order?.totalAmount != null ? currency(order.totalAmount) : '—'}
              />
              <InfoItem label="Customer" value={getPaymentUserLabel(payment)} />
              <InfoItem label="Email" value={getPaymentUserEmail(payment) || '—'} />
              <InfoItem label="Phone" value={user?.phone || '—'} />
              <InfoItem
                label="Razorpay order"
                value={
                  paymentType === 'COD' && !payment.razorpayOrderId
                    ? 'Cash on delivery'
                    : payment.razorpayOrderId || '—'
                }
              />
              <InfoItem
                label="Razorpay payment"
                value={
                  paymentType === 'COD' && !payment.razorpayPaymentId
                    ? 'Cash on delivery'
                    : payment.razorpayPaymentId || '—'
                }
              />
              <InfoItem label="Created" value={formatDate(payment.createdAt)} />
              <InfoItem label="Updated" value={formatDate(payment.updatedAt)} />
            </div>
          </div>

          {refund && (refund.razorpayRefundId || refund.status || refund.amount) ? (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-[#6D4C41]">Refund</h3>
              <div className="rounded-xl bg-[#FAF8F6] p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoItem label="Refund id" value={refund.razorpayRefundId || '—'} />
                  <InfoItem label="Refund status" value={refund.status || '—'} />
                  <InfoItem label="Refund amount" value={currency(refund.amount)} />
                  <InfoItem label="Refunded at" value={formatDate(refund.refundedAt)} />
                  {refund.notes ? (
                    <div className="sm:col-span-2">
                      <InfoItem label="Notes" value={refund.notes} />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};

export default PaymentViewModal;
