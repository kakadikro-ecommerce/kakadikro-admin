import React, { useEffect, useState } from 'react';
import {
  Edit3,
  Eye,
  Filter,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import {
  ORDER_STATUS_FILTER_OPTIONS,
  Order,
  normalizeOrderStatus,
  orderService,
} from '../../../services/Orders-api';
import OrderEditModal from './Edit/OrderForm';
import OrderViewModal from './View/OrderViewModal';
import Alert from '../../../pages/UiElements/Alerts';
import Pagination from '../../../pages/UiElements/Pagination';
import SearchInput from '../../../pages/UiElements/SearchBar';
import TableLoaderRow from '../../../pages/UiElements/TableLoaderRow';
import {
  deleteOrder,
  fetchOrders,
  resetOrdersNewCount,
  setSelectedOrder,
  updateOrder,
} from '../../../store/modules/orders/orders.slice';
import { updateAdminUser } from '../../../store/modules/admin/admin.slice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';

const OrdersTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: orders,
    pagination,
    selectedOrder,
    status,
    error,
  } = useAppSelector((state) => state.orders);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] =
    useState<(typeof ORDER_STATUS_FILTER_OPTIONS)[number]>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<{
    id: string;
    orderNumber: string;
  } | null>(null);

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

  const selectedIsDeleted =
    selectedStatus === 'Deleted'
      ? true
      : selectedStatus === 'Active'
        ? false
        : undefined;

  useEffect(() => {
    dispatch(resetOrdersNewCount());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchOrders({ page: currentPage, limit: 10, isDeleted: selectedIsDeleted }));
  }, [currentPage, dispatch, selectedIsDeleted]);

  useEffect(() => {
    if (error) {
      showNotification('error', error);
    }
  }, [error]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const handleSave = async (updatedData: Partial<Order>) => {
    if (!selectedOrder?._id) return;
    try {
      await dispatch(
        updateOrder({ orderId: selectedOrder._id, orderData: updatedData }),
      ).unwrap();
      setIsEditOpen(false);
      showNotification('success', `Order ${selectedOrder.orderNumber} updated successfully!`);
      dispatch(fetchOrders({ page: currentPage, limit: 10, isDeleted: selectedIsDeleted }));
    } catch (updateError) {
      showNotification('error', String(updateError) || 'Update failed.');
    }
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateUserStatus = async (userId: string) => {
    if (!userId) {
      showNotification('error', 'User ID not available.');
      return;
    }
    try {
      await dispatch(updateAdminUser({ id: userId, data: { isActive: false } })).unwrap();
      showNotification('success', 'User status updated to inactive successfully!');
    } catch (error) {
      showNotification('error', String(error) || 'Failed to update user status.');
    }
  };

  const processDelete = async () => {
    if (!orderToDelete) return;
    try {
      await dispatch(deleteOrder({ orderId: orderToDelete.id })).unwrap();
      showNotification('success', `Order ${orderToDelete.orderNumber} deleted successfully!`);
      setOrderToDelete(null);
      dispatch(fetchOrders({ page: currentPage, limit: 10, isDeleted: selectedIsDeleted }));
    } catch (deleteError) {
      showNotification('error', String(deleteError) || 'Delete failed.');
    }
  };

  const handleOpenOrderView = async (orderId: string) => {
    const order = orders.find((item: { _id: string; }) => item._id === orderId) ?? null;
    dispatch(setSelectedOrder(order));
    setIsViewOpen(true);
  };

  const handleOpenOrderEdit = async (orderId: string) => {
    try {
      setModalLoading(true);
      const order = await orderService.getById(orderId);
      dispatch(setSelectedOrder(order));
      setIsEditOpen(true);
    } catch (fetchError) {
      showNotification('error', 'Failed to load order details.');
    } finally {
      setModalLoading(false);
    }
  };

  const loading = status === 'loading' || modalLoading;
  const hasLocalFilters = searchTerm.trim().length > 0 || selectedStatus !== 'All';
  const filteredOrders = orders.filter((order) => {
    const normalizedStatus = normalizeOrderStatus(order.orderStatus);
    const searchTarget = `${order.orderNumber} ${order.user?.name || ''}`.toLowerCase();
    const matchesSearch = searchTarget.includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || selectedStatus === 'Active' || selectedStatus === 'Deleted' || normalizedStatus === normalizeOrderStatus(selectedStatus);
    return matchesSearch && matchesStatus;
  });

  const effectiveTotalItems = hasLocalFilters ? filteredOrders.length : (pagination.total || 0);
  const effectiveTotalPages = hasLocalFilters ? Math.max(1, Math.ceil(effectiveTotalItems / 10)) : (pagination.totalPages || 1);
  const visibleOrders = hasLocalFilters ? filteredOrders.slice((currentPage - 1) * 10, currentPage * 10) : filteredOrders;

  const getStatusStyle = (statusValue?: string) => {
    switch (normalizeOrderStatus(statusValue)) {
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'dispatched': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };


  return (
    <div className="relative min-h-screen font-sans">
      {notification.show && (
        <div className="fixed top-6 right-6 z-[10000] w-full max-w-md animate-in slide-in-from-right duration-300">
          <Alert
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification({ ...notification, show: false })}
          />
        </div>
      )}

      <div className="mx-auto w-full max-w-8xl overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-3 shadow-sm sm:p-4 md:p-8">
        
        {/* --- HEADER --- */}
        <div className="mb-8 flex flex-col gap-6 md:mb-10">
          <div className="w-full min-w-0 border-b border-gray-100 pb-4">
            <h1 className="text-2xl md:text-3xl font-black text-[#3E2723] tracking-tight">
              Order Management
            </h1>
          </div>

          <div className="flex w-full flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex w-full min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:w-auto">
              <div className="w-full min-w-0 sm:w-80 md:w-[400px]">
                <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search Order ID or Name..." className="!h-[48px] !rounded-2xl shadow-sm w-full" />
              </div>

              <div className="relative w-full min-w-0 sm:w-60">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="h-[48px] w-full pl-11 pr-10 bg-gray-50/80 border-none rounded-2xl text-[11px] outline-none appearance-none cursor-pointer shadow-sm text-[#3E2723]"
                >
                  {ORDER_STATUS_FILTER_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option === 'All' ? 'ALL ORDER STATUS' : option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* --- TABLE (HOVER REMOVED) --- */}
        <div className="table-scroll-wrapper overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3 min-w-[1000px]">
            <thead>
              <tr className="text-[#3E2723] opacity-40 text-[10px] font-black tracking-[0.2em] uppercase">
                <th className="px-6 py-2 w-16 text-center">Id</th>
                <th className="px-6 py-2">Order ID</th>
                <th className="px-6 py-2">Customer Name</th>
                <th className="px-6 py-2">Amount</th>
                <th className="px-6 py-2">Status</th>
                <th className="px-6 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableLoaderRow colSpan={6} message="LOADING..." />
              ) : visibleOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-gray-400 text-xs">NO ORDERS FOUND</td>
                </tr>
              ) : (
                visibleOrders.map((order, i) => (
                  <tr key={order._id}>
                    {/* SEQUENCE ID */}
                    <td className="px-6 py-4 bg-gray-50/50 rounded-l-3xl text-[#3E2723] font-black text-xs text-center">
                      {String((currentPage - 1) * 10 + i + 1).padStart(2, '0')}
                    </td>

                    {/* FORMATTED ORDER ID (Matches Image) */}
                    <td className="px-6 py-4 bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <span className="text-[#A3948F] text-sm tracking-tight">
                          {order.orderNumber}
                        </span>
                        <button
                          onClick={() => handleCopy(order.orderNumber)}
                          className="text-[#D1D5DB] hover:text-[#3E2723] transition-colors"
                        >
                          {copiedId === order.orderNumber ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4 bg-gray-50/50 text-[#3E2723] text-sm">
                      {order.user?.name || 'Guest'}
                    </td>

                    <td className="px-6 py-4 bg-gray-50/50 text-[#3E2723] text-sm">
                      Rs {order.totalAmount?.toLocaleString()}
                    </td>

                    <td className="px-6 py-4 bg-gray-50/50">
                      <span className={`px-3 py-1 text-[9px] font-black rounded-full border bg-white ${getStatusStyle(order.orderStatus)}`}>
                        {normalizeOrderStatus(order.orderStatus).toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-4 bg-gray-50/50 rounded-r-3xl text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleOpenOrderView(order._id)} className="p-2 text-gray-400 hover:text-teal-600 transition-all"><Eye size={17} /></button>
                        <button onClick={() => handleOpenOrderEdit(order._id)} className="p-2 text-gray-400 hover:text-blue-600 transition-all"><Edit3 size={17} /></button>
                        <button onClick={() => handleUpdateUserStatus(order.user?._id || '')} className="p-2 text-gray-400 hover:text-green-600 transition-all" title="Update User Status"><Check size={17} /></button>
                        <button onClick={() => handleDelete(order._id, order.orderNumber)} className="p-2 text-gray-400 hover:text-rose-600 transition-all"><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <Pagination currentPage={currentPage} totalPages={effectiveTotalPages} totalItems={effectiveTotalItems} itemsPerPage={10} onPageChange={setCurrentPage} loading={loading} />
        </div>
      </div>

      {/* MODALS */}
      <OrderViewModal isOpen={isViewOpen} order={selectedOrder} onClose={() => setIsViewOpen(false)} />
      {isEditOpen && <OrderEditModal isOpen={isEditOpen} order={selectedOrder} onClose={() => setIsEditOpen(false)} onSave={handleSave} />}

      {orderToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#2D1B19]/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-white">
            <div className="bg-rose-50/50 p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-rose-500 mb-5 border border-rose-100">
                <AlertTriangle size={36} />
              </div>
              <h3 className="text-xl font-black text-[#3E2723]">Delete Order?</h3>
              <p className="text-[11px] text-gray-500 mt-3">Delete <span className="text-rose-600">"{orderToDelete.orderNumber}"</span>?</p>
            </div>
            <div className="p-6 bg-white flex gap-3">
              <button onClick={() => setOrderToDelete(null)} className="flex-1 py-4 rounded-2xl text-[10px] font-black text-gray-400">Cancel</button>
              <button onClick={processDelete} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black">Delete Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;
