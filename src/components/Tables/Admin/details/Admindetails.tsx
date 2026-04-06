import React from 'react';
import {
  X,
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  Activity,
  BadgeCheck,
  Edit3,
} from 'lucide-react';
import { Admin } from '../../../../types/Admin';
import { Modal } from '../../../../pages/UiElements/Modal';

interface AdminViewModalProps {
  admin: Admin | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (admin: Admin) => void;
}

const AdminViewModal: React.FC<AdminViewModalProps> = ({
  admin,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!admin) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto">
        <div className="bg-[#3E2723] px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <Shield className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-white font-bold tracking-tight text-xl">
                Admin Details
              </h2>
              <p className="text-sm md:text-base text-orange-200/70 uppercase tracking-wide">
                System Administrator Profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/80"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
          <div className="bg-white p-8 space-y-8">

            <div className="flex items-center gap-6 pb-4 border-b border-[#EFE4D5]/50">

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-2xl md:text-3xl font-bold text-[#3E2723]">{admin.name}</h4>
                  <BadgeCheck size={18} className="text-emerald-500" />
                </div>
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold text-xs md:text-sm tracking-wide border ${admin.role === 'super_admin'
                  ? 'bg-purple-50 text-purple-700 border-purple-100'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                  }`}>
                  <Shield size={12} />
                  {admin.role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <InfoItem label="Full Name" value={admin.name} icon={<User size={14} />} />
              <InfoItem label="Email Address" value={admin.email} icon={<Mail size={14} />} />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={14} className="text-[#A69080] opacity-60" />
                  <p className="text-[9px] font-bold text-[#A69080] tracking-widest">Account Status</p>
                </div>
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold text-xs md:text-sm tracking-wide border ${admin.isActive
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                  {admin.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <InfoItem label="Created At" value={formatDate(admin.createdAt)} icon={<Calendar size={14} />} />
              <InfoItem label="Last Updated" value={`${formatDate(admin.updatedAt)} at ${formatTime(admin.updatedAt)}`} icon={<Clock size={14} />} />
            </div>

            {onEdit && (
              <div className="flex justify-end border-t border-[#EFE4D5]/60 pt-6">
                <button
                  onClick={() => onEdit(admin)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#3E2723] px-5 py-3 text-sm md:text-base tracking-wide font-bold uppercase text-white transition-all hover:bg-[#2D1B19]"
                >
                  <Edit3 size={14} />
                  Edit
                </button>
              </div>
            )}
          </div>
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
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <span className="text-[#A69080] opacity-60">{icon}</span>
      <p className="text-xs md:text-sm font-medium text-[#A69080]">
        {label}
      </p>
    </div>
    <p className="text-base md:text-lg font-semibold text-[#3E2723] leading-snug break-words">
      {value}
    </p>
  </div>
);

export default AdminViewModal;
