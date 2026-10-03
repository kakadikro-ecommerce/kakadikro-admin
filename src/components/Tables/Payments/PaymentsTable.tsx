import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Filter } from 'lucide-react';
import Alert from '../../../pages/UiElements/Alerts';
import Pagination from '../../../pages/UiElements/Pagination';
import SearchInput from '../../../pages/UiElements/SearchBar';
import TableLoaderRow from '../../../pages/UiElements/TableLoaderRow';
import { parseApiError } from '../../../services/axiosError';
import {
  fetchAdminPayments,
  getPaymentOrderLabel,
  getPaymentUserEmail,
  getPaymentUserLabel,
  type PaymentRecord,
} from '../../../services/payments-api';
import { useAppDispatch } from '../../../store/hooks';
import { markSidebarSectionSeen } from '../../../store/modules/sidebarBadges/sidebarBadges.slice';
import PaymentViewModal, {
  formatPaymentType,
  getPaymentStatusLabel,
  getPaymentStatusStyle,
} from './details/PaymentViewModal';

const PAGE_SIZE = 10;
const STATUS_OPTIONS = ['All', 'pending', 'success', 'failed', 'refunded'];

const currency = (value?: number) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const PaymentsTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const showNotification = (
    type: 'success' | 'error' | 'info' | 'warning',
    message: string,
  ) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 4000);
  };

  useEffect(() => {
    dispatch(markSidebarSectionSeen('payments'));
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchAdminPayments({
          page: currentPage,
          limit: PAGE_SIZE,
          status: selectedStatus,
        });
        if (cancelled) return;
        setPayments(result.payments);
        setTotalPages(result.pagination?.totalPages || 1);
        setTotalItems(result.pagination?.total || result.payments.length);
      } catch (error) {
        if (cancelled) return;
        const parsed = parseApiError(error, 'Failed to load payments');
        showNotification('error', parsed.message);
        setPayments([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [currentPage, selectedStatus]);

  const filteredPayments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return payments;

    return payments.filter((payment) => {
      const orderLabel = getPaymentOrderLabel(payment).toLowerCase();
      const userLabel = getPaymentUserLabel(payment).toLowerCase();
      const email = getPaymentUserEmail(payment).toLowerCase();
      const razorpayOrder = String(payment.razorpayOrderId || '').toLowerCase();
      const razorpayPayment = String(payment.razorpayPaymentId || '').toLowerCase();
      return (
        orderLabel.includes(term) ||
        userLabel.includes(term) ||
        email.includes(term) ||
        razorpayOrder.includes(term) ||
        razorpayPayment.includes(term)
      );
    });
  }, [payments, searchTerm]);

  return (
    <div className="space-y-6">
      {notification.show ? (
        <Alert
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
        />
      ) : null}

      <div className="rounded-[28px] border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
              Payments
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-[#3E2723]">
              Payment records
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {totalItems} payment{totalItems === 1 ? '' : 's'} found
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_180px] lg:w-[520px]">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search order, user, payment id..."
            />
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSelectedStatus(e.target.value);
                }}
                className="h-[48px] w-full appearance-none rounded-2xl border-none bg-gray-50/60 pl-10 pr-4 text-[12px] text-[#3E2723] shadow-sm outline-none focus:ring-2 focus:ring-[#3E2723]/5"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status === 'All' ? 'All Payment Statuses' : status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-orange-50 text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.16em] text-[#3E2723]">
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Payment refs</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50">
              {loading ? (
                <TableLoaderRow colSpan={9} />
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment, index) => {
                  const sequence = (currentPage - 1) * PAGE_SIZE + index + 1;

                  return (
                  <tr key={payment._id} className="hover:bg-orange-50/40">
                    <td className="px-4 py-4 font-semibold text-[#3E2723]">
                      {sequence}
                    </td>
                    <td className="px-4 py-4">
                      <p className="break-all font-semibold text-[#3E2723]">
                        {getPaymentOrderLabel(payment)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-800">
                        {getPaymentUserLabel(payment)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {getPaymentUserEmail(payment)}
                      </p>
                    </td>
                    <td className="px-4 py-4 align-middle font-semibold text-slate-900">
                      {currency(payment.amount)}
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <span className="inline-flex items-center whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
                        {formatPaymentType(
                          payment.orderId && typeof payment.orderId === 'object'
                            ? payment.orderId.paymentMethod
                            : undefined,
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <span
                        className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${getPaymentStatusStyle(
                          getPaymentStatusLabel(payment),
                        )}`}
                      >
                        {getPaymentStatusLabel(payment)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600">
                      {String(
                        payment.orderId && typeof payment.orderId === 'object'
                          ? payment.orderId.paymentMethod
                          : '',
                      ).toLowerCase() === 'cod' && !payment.razorpayOrderId ? (
                        <p>Cash on delivery</p>
                      ) : (
                        <>
                          <p className="break-all">{payment.razorpayOrderId || '—'}</p>
                          <p className="mt-1 break-all text-slate-400">
                            {payment.razorpayPaymentId || 'No payment id yet'}
                          </p>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-4 align-middle text-slate-600">
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleString()
                        : '—'}
                    </td>
                    <td className="px-4 py-4 align-middle text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setIsViewOpen(true);
                        }}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 transition-all hover:bg-teal-50 hover:text-teal-600 active:scale-95"
                        title="View payment"
                        aria-label="View payment"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <PaymentViewModal
        payment={selectedPayment}
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedPayment(null);
        }}
      />
    </div>
  );
};

export default PaymentsTable;
