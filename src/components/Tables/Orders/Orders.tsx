import React, { useEffect, useState } from 'react';
import {
  Edit3,
  Eye,
  Filter,
} from 'lucide-react';
import {
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
  fetchOrders,
  resetOrdersNewCount,
  setSelectedOrder,
  toggleOrderActiveStatusThunk,
  updateOrderStatus,
} from '../../../store/modules/orders/orders.slice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';

const OrdersTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: orders,
    selectedOrder,
    status,
    error,
  } = useAppSelector((state) => state.orders);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [selectedActiveStatus, setSelectedActiveStatus] = useState<string>('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

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
  const selectedIsActive =
    selectedActiveStatus === 'inactive'
      ? false
      : selectedActiveStatus === 'active'
        ? true
        : undefined;
  const statusOptions = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'];
  const activeStatusOptions = ['active', 'inactive'];

  useEffect(() => {
    dispatch(resetOrdersNewCount());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchOrders({ page: currentPage, limit: 10, isActive: selectedIsActive }));
  }, [currentPage, dispatch, selectedIsActive]);

  useEffect(() => {
    if (error) {
      showNotification('error', error);
    }
  }, [error]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedActiveStatus]);

  const handleSave = async (updatedData: Partial<Order>) => {
    if (!selectedOrder?._id) return;

    const cleanData = { ...updatedData };

    if (cleanData.orderStatus !== "dispatched") {
      delete cleanData.shipment;
    }

    try {
      await dispatch(
        updateOrderStatus({ orderId: selectedOrder._id, orderData: updatedData }),
      ).unwrap();
      setIsEditOpen(false);
      showNotification('success', `Order ${selectedOrder._id || selectedOrder.orderNumber || 'N/A'} updated successfully!`);
      dispatch(fetchOrders({ page: currentPage, limit: 10, isActive: selectedIsActive }));
    } catch (updateError) {
      showNotification('error', String(updateError) || 'Update failed.');
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

  const handleToggleStatus = async (order: Order) => {
    setUpdatingOrderId(order._id);

    try {
      const newActiveStatus = !order.isActive;
      
      await dispatch(
        toggleOrderActiveStatusThunk({
          orderId: order._id,
          isActive: newActiveStatus,
        }),
      ).unwrap();
      
      showNotification(
        'success',
        `Order ${order.orderNumber || order._id} is now ${newActiveStatus ? 'active' : 'inactive'}.`,
      );
      
      await dispatch(fetchOrders({ page: currentPage, limit: 10, isActive: selectedIsActive }));
    } catch (toggleError: any) {
      console.error('Toggle status error:', toggleError);
      showNotification('error', toggleError?.message || 'Failed to update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const loading = status === 'loading' || modalLoading;
  const filteredOrders = orders.filter((order) => {
    const searchTermLower = searchTerm.toLowerCase();
    const searchTarget = `${order._id} ${order.orderNumber} ${order.user?.name || ''} ${order.user?.email || ''}`.toLowerCase();
    const matchesSearch = searchTermLower === '' || searchTarget.includes(searchTermLower);
    const normalizedStatus = normalizeOrderStatus(order.orderStatus);
    const matchesOrderStatus = normalizedStatus === selectedStatus;
    const matchesActiveStatus = 
      (selectedActiveStatus === 'active' && order.isActive === true) ||
      (selectedActiveStatus === 'inactive' && order.isActive === false);
    return matchesSearch && matchesOrderStatus && matchesActiveStatus;
  });
  const effectiveTotalItems = filteredOrders.length;
  const effectiveTotalPages = Math.max(1, Math.ceil(effectiveTotalItems / 10));
  const startIndex = (currentPage - 1) * 10;
  const visibleOrders = filteredOrders.slice(startIndex, startIndex + 10);

  const getStatusStyle = (statusValue?: string) => {
    switch (normalizeOrderStatus(statusValue)) {
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'dispatched': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'confirmed': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
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

        <div className="mb-8 flex flex-col gap-6 md:mb-10">
          <div className="w-full min-w-0 border-b border-gray-100 pb-4">
            <h1 className="text-2xl md:text-3xl font-black text-[#3E2723] tracking-tight">
              Order Management
            </h1>
          </div>

          <div className="flex w-full flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex w-full min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:w-auto">
              
              {/* Search Input */}
              <div className="w-full min-w-0 sm:w-80">
                <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search orders..." />
              </div>

              {/* Order Status Filter */}
              <div className="relative w-full min-w-0 sm:w-44">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-gray-50 border-none rounded-2xl text-xs outline-none cursor-pointer text-[#3E2723] appearance-none uppercase font-bold"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option} className="uppercase">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Status Filter */}
              <div className="relative w-full min-w-0 sm:w-44">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={selectedActiveStatus}
                  onChange={(e) => setSelectedActiveStatus(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-gray-50 border-none rounded-2xl text-xs outline-none cursor-pointer text-[#3E2723] appearance-none uppercase font-bold"
                >
                  {activeStatusOptions.map((option) => (
                    <option key={option} value={option} className="uppercase">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>
        </div>

        <div className="table-scroll-wrapper overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3 min-w-[1000px]">
            <thead>
              <tr className="text-[#3E2723] text-[10px] font-bold uppercase tracking-[0.2em]">
                <th className="px-6 py-2 w-16 text-center">ID</th>
                <th className="px-6 py-2">Order ID</th>
                <th className="px-6 py-2">Customer Name</th>
                <th className="px-6 py-2">Amount</th>
                <th className="px-6 py-2">Status</th>
                <th className="px-6 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableLoaderRow colSpan={6} />
              ) : visibleOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-gray-300 text-5xl">📦</div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                        NO ORDERS FOUND
                      </p>
                    </div>
                   </td>
                 </tr>
              ) : (
                visibleOrders.map((order, i) => (
                  <tr key={order._id} className="group transition-all">
                    <td className="px-6 py-4 text-center font-bold text-sm text-gray-900 bg-gray-50/50 rounded-l-3xl">
                      {String(startIndex + i + 1).padStart(2, '0')}
                    </td>

                    <td className="px-6 py-4 bg-gray-50/50">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 text-sm font-bold tracking-tight">
                          {order._id}
                        </span>
                        {order.isActive === false && (
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-black tracking-[0.18em] text-rose-600">
                            INACTIVE
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 bg-gray-50/50 text-gray-900 font-bold text-sm">
                      {order.user?.name || 'Guest'}
                    </td>

                    <td className="px-6 py-4 bg-gray-50/50 text-gray-900 font-bold text-sm">
                      Rs {order.totalAmount?.toLocaleString()}
                    </td>

                    <td className="px-6 py-4 bg-gray-50/50">
                      <span className={`px-3 py-1 text-xs font-black rounded-full border bg-white ${getStatusStyle(order.orderStatus)}`}>
                        {normalizeOrderStatus(order.orderStatus).toUpperCase() || 'PENDING'}
                      </span>
                    </td>

                    <td className="px-6 py-4 bg-gray-50/50 rounded-r-3xl text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleOpenOrderView(order._id)}
                          className="flex items-center justify-center rounded-lg p-2 text-gray-500 transition-all hover:bg-teal-50 hover:text-teal-600 active:scale-95"
                          title="View Order"
                        >
                          <Eye size={18} className="sm:size-5" />
                        </button>

                        <button
                          onClick={() => {
                            if (order.isActive === false) return;
                            handleOpenOrderEdit(order._id);
                          }}
                          disabled={order.isActive === false}
                          className={`flex items-center justify-center rounded-lg p-2 text-gray-500 transition-all active:scale-95 ${
                            order.isActive === false
                              ? 'opacity-30 cursor-not-allowed'
                              : 'hover:bg-blue-50 hover:text-blue-600'
                          }`}
                          title={order.isActive === false ? "Cannot edit inactive order" : "Edit Order"}
                        >
                          <Edit3 size={18} className="sm:size-5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(order)}
                          disabled={updatingOrderId === order._id}
                          className={`relative flex h-6 w-11 sm:h-7 sm:w-12 items-center rounded-full transition-all duration-300 ${
                            order.isActive !== false
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          } ${
                            updatingOrderId === order._id
                              ? "cursor-not-allowed opacity-50"
                              : "hover:shadow-md cursor-pointer"
                          }`}
                          aria-label={`Toggle ${order._id} status`}
                          aria-pressed={order.isActive !== false}
                        >
                          <span
                            className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                              order.isActive !== false
                                ? "translate-x-5 sm:translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {effectiveTotalItems > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={effectiveTotalPages}
              totalItems={effectiveTotalItems}
              itemsPerPage={10}
              onPageChange={setCurrentPage}
              loading={loading}
            />
          </div>
        )}
      </div>

      <OrderViewModal isOpen={isViewOpen} order={selectedOrder} onClose={() => setIsViewOpen(false)} />
      {isEditOpen && <OrderEditModal isOpen={isEditOpen} order={selectedOrder} onClose={() => setIsEditOpen(false)} onSave={handleSave} />}
    </div>
  );
};

export default OrdersTable;