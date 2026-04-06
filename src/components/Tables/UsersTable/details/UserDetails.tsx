import React from 'react';
import {
  X,
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  Activity,
} from 'lucide-react';
import { User as UserType } from '../../../../types/users';
import { Modal } from '../../../../pages/UiElements/Modal';

interface UserViewModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserViewModal: React.FC<UserViewModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  if (!user) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto ">

        <div className="bg-[#3E2723] px-6 py-3 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <User className="text-white" size={18} />
            </div>
            <h2 className="text-white font-bold tracking-tight text-xl md:text-2xl">
              User Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/80"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">

          <div className="bg-white rounded-[2rem] p-8 space-y-12">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">

              <InfoItem label="Full Name" value={user.name} icon={<User size={14} />} />
              <InfoItem label="Email Address" value={user.email} icon={<Mail size={14} />} />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={14} className="text-[#A69080] opacity-60" />
                  <p className="text-xs md:text-sm font-semibold text-[#A69080] tracking-wide">Assigned Role</p>
                </div>
                <p className="text-lg md:text-xl font-semibold">
                  {user.role}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={14} className="text-[#A69080] opacity-60" />
                  <p className="text-xs md:text-sm font-semibold text-[#A69080] tracking-wide">Account Status</p>
                </div>
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold text-xs md:text-sm tracking-wide border ${user.isActive
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                  {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <InfoItem label="Created At" value={formatDate(user.createdAt)} icon={<Calendar size={14} />} />
              <InfoItem label="Last Updated" value={formatDate(user.updatedAt)} icon={<Clock size={14} />} />

            </div>
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

export default UserViewModal;