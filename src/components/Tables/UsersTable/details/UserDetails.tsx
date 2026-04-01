import React from 'react';
import {
  X,
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  Fingerprint,
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
      {/* Modal Container with consistent rounding and border */}
      <div className="w-full max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto border border-[#EFE4D5]">
        
        {/* Header - Matching "ADD USER" Image exactly */}
        <div className="bg-[#3E2723] px-6 py-3 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <User className="text-white" size={18} />
            </div>
            <h2 className="text-white font-bold tracking-tight text-lg">
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

        {/* Unified Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
          
          {/* Single Unified Card - Matching "ACCOUNT PROFILE" Style */}
          <div className="bg-white border border-[#EFE4D5] rounded-[2rem] p-8 space-y-10">

            {/* Grid for all data points in one unified container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              
              <InfoItem label="Full Name" value={user.name} icon={<User size={14} />} />
              <InfoItem label="Email Address" value={user.email} icon={<Mail size={14} />} />
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={14} className="text-[#A69080] opacity-60" />
                  <p className="text-[9px] font-black text-[#A69080] tracking-widest">Assigned Role</p>
                </div>
                <p className="text-[17px] font-black text-[#3E2723] tracking-tighter">
                  {user.role}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={14} className="text-[#A69080] opacity-60" />
                  <p className="text-[9px] font-black text-[#A69080] tracking-widest">Account Status</p>
                </div>
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl font-black text-[10px] tracking-widest border ${
                  user.isActive 
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

// Sub-component for individual info items to ensure font/size consistency
const InfoItem = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <span className="text-[#A69080] opacity-60">{icon}</span>
      <p className="text-[9px] font-black text-[#A69080] tracking-widest">{label}</p>
    </div>
    <p className="text-[14px] font-black text-[#3E2723] tracking-tight leading-none">
      {value}
    </p>
  </div>
);

export default UserViewModal;