import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Loader2,
  Package,
  Truck,
  FileText,
  ChevronDown,
  Activity,
} from 'lucide-react';
import { Modal } from '../../../../pages/UiElements/Modal';
import { Order, normalizeOrderStatus } from '../../../../services/Orders-api';

interface OrderEditModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onSave: (updatedOrder: Partial<Order>) => Promise<void>;
}

const OrderEditModal: React.FC<OrderEditModalProps> = ({
  isOpen,
  order,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);

  const buildChangedPayload = (
    originalOrder: Order | null,
    nextFormData: Partial<Order>,
  ): Partial<Order> => {
    const payload: Partial<Order> = {};

    if (!originalOrder) {
      return nextFormData;
    }

    if (nextFormData.orderStatus !== originalOrder.orderStatus) {
      payload.orderStatus = nextFormData.orderStatus;
    }

    if ((nextFormData.adminNote ?? '') !== (originalOrder.adminNote ?? '')) {
      payload.adminNote = nextFormData.adminNote ?? '';
    }

    const nextStatus = nextFormData.orderStatus;

    if (nextStatus === 'dispatched') {
      const trackingId = nextFormData.shipment?.trackingId?.trim();
      const courierName = nextFormData.shipment?.courierName?.trim();

      if (trackingId || courierName) {
        payload.shipment = {};

        if (trackingId) {
          payload.shipment.trackingId = trackingId;
        }

        if (courierName) {
          payload.shipment.courierName = courierName;
        }
      }
    }

    return payload;
  };

  const [formData, setFormData] = useState<Partial<Order>>({
    orderStatus: '',
    adminNote: '',
    shipment: {
      trackingId: '',
      courierName: '',
      dispatchedAt: null,
      deliveredAt: null,
    },
  });

  useEffect(() => {
    if (order && isOpen) {
      const normalizedStatus = normalizeOrderStatus(order.orderStatus);
      
      setFormData({
        orderStatus: normalizedStatus,
        adminNote: order.adminNote || '',
        shipment: {
          trackingId: order.shipment?.trackingId || '',
          courierName: order.shipment?.courierName || '',
          dispatchedAt: order.shipment?.dispatchedAt || null,
          deliveredAt: order.shipment?.deliveredAt || null,
        },
      });
    }
  }, [order, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === 'trackingId' || name === 'courierName') {
      setFormData((prev) => ({
        ...prev,
        shipment: {
          ...(prev.shipment as any),
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.orderStatus === 'dispatched') {
        const trackingId = formData.shipment?.trackingId?.trim();
        const courierName = formData.shipment?.courierName?.trim();

        if (!trackingId || !courierName) {
          alert('Tracking ID and Courier Name are required for dispatch');
          setLoading(false);
          return;
        }
      }

      const changedPayload = buildChangedPayload(order, formData);

      // Only send if there are changes
      if (Object.keys(changedPayload).length === 0) {
        alert('No changes to save');
        setLoading(false);
        return;
      }

      await onSave(changedPayload);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isDispatched = formData.orderStatus === 'dispatched';

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl mx-auto  shadow-2xl flex flex-col h-auto max-h-[89vh] overflow-hidden  my-auto"
      >
        <div className="bg-[#2D1B19] p-6 md:p-3 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Package size={24} className="text-orange-200" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight">
                Edit Order
              </h2> 
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/20 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6 overflow-y-auto bg-gray-50/50 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Status - Fixed select options */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 ml-2 flex items-center gap-2 tracking-widest">
                <Activity size={12} /> Order Status
              </label>
              <div className="relative">
                <select
                  name="orderStatus"
                  value={formData.orderStatus}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white border border-gray-100 rounded-[1.25rem] text-[12px] font-bold outline-none appearance-none cursor-pointer shadow-sm focus:ring-2 focus:ring-[#3E2723]/20 focus:border-[#3E2723]/30"
                >
                  <option value="pending">PENDING</option>
                  <option value="confirmed">CONFIRMED</option>
                  <option value="dispatched">DISPATCHED</option>
                  <option value="delivered">DELIVERED</option>
                  <option value="cancelled">CANCELLED</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              <p className="text-[8px] text-gray-400 ml-2">
                Current status: {formData.orderStatus?.toUpperCase() || 'N/A'}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 ml-2 flex items-center gap-2 tracking-widest">
                <Truck size={12} /> Courier Name
              </label>
              <input
                type="text"
                name="courierName"
                value={formData.shipment?.courierName || ''}
                onChange={handleChange}
                disabled={!isDispatched}
                placeholder={isDispatched ? "BlueDart, FedEx, etc." : "Enable 'DISPATCHED' status first"}
                className={`w-full px-5 py-4 bg-white border border-gray-100 rounded-[1.25rem] text-[12px] font-bold outline-none shadow-sm ${
                  !isDispatched ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tracking ID */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 ml-2 flex items-center gap-2 tracking-widest">
                <Truck size={12} /> Tracking ID
              </label>
              <input
                type="text"
                name="trackingId"
                value={formData.shipment?.trackingId || ''}
                onChange={handleChange}
                disabled={!isDispatched}
                placeholder={isDispatched ? "TRK123456789" : "Enable 'DISPATCHED' status first"}
                className={`w-full px-5 py-4 bg-white border border-gray-100 rounded-[1.25rem] text-[12px] font-bold outline-none shadow-sm ${
                  !isDispatched ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
              {isDispatched && (
                <p className="text-[8px] text-amber-600 ml-2">
                  Tracking details are required for dispatched orders
                </p>
              )}
            </div>

            {/* Admin Note */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 ml-2 flex items-center gap-2 tracking-widest">
                <FileText size={10} /> Admin Note
              </label>
              <textarea
                name="adminNote"
                value={formData.adminNote || ''}
                onChange={handleChange}
                rows={2}
                placeholder="Internal order notes..."
                className="w-full px-5 py-4 bg-white border border-gray-100 rounded-[1.25rem] text-[12px] font-bold outline-none shadow-sm resize-none focus:ring-2 focus:ring-[#3E2723]/20"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-white border-t flex justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
          >
            <span className="font-black text-[10px]">Cancel</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 max-w-[200px] py-3.5 bg-[#3E2723] text-white rounded-full flex items-center justify-center gap-4 hover:bg-[#2D1B19] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span className="font-black text-[10px] tracking-wider">
              {loading ? 'Processing...' : 'Save Changes'}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default OrderEditModal;