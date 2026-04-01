import React, { useEffect, useState } from 'react';
import {
  X,
  Save,
  Loader2,
  User as UserIcon,
  Shield,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
} from 'lucide-react';
import { Modal } from '../../../../pages/UiElements/Modal';
import Alert from '../../../../pages/UiElements/Alerts'; 
import type { Admin } from '../../../../types/Admin';
import {
  updateAdminPassword,
  updateAdminProfile,
} from '../../../../store/modules/admin/admin.slice';
import { useAppDispatch } from '../../../../store/hooks';

interface AdminFormModalProps {
  admin: Admin | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const AdminFormModal: React.FC<AdminFormModalProps> = ({
  admin,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const dispatch = useAppDispatch();
  
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ type: 'success' | 'error' | 'info' | 'warning', message: string } | null>(null);

  const [formData, setFormData] = useState({ name: '', email: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (isOpen && admin) {
      setFormData({
        name: admin.name || '',
        email: admin.email || '',
      });
      setCurrentPassword('');
      setNewPassword('');
    }
  }, [admin, isOpen]);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertConfig({ type, message });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showAlert('error', "Name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      await dispatch(updateAdminProfile({ name: formData.name })).unwrap();
      onRefresh();
      showAlert('success', "Profile updated successfully!");

      setTimeout(() => {
        onClose();
        setAlertConfig(null);
      }, 1500);
    } catch (error: any) {
      showAlert('error', error?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showAlert('error', "Please enter your current password");
      return;
    }
    if (newPassword.length < 6) {
      showAlert('error', "New password must be at least 6 characters");
      return;
    }
    if (!admin?._id) {
      showAlert('error', "Admin ID is not available");
      return;
    }

    setPassLoading(true);
    try {
      await dispatch(updateAdminPassword({
        id: admin._id,
        password: newPassword
      })).unwrap();
      
      setCurrentPassword('');
      setNewPassword('');
      showAlert('success', "Password updated successfully!");
    } catch (error: any) {
      showAlert('error', error?.message || "Failed to change password");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <>
      {alertConfig && (
        <div className="fixed top-4 right-4 z-[10000] w-[calc(100%-2rem)] max-w-sm">
          <Alert 
            type={alertConfig.type} 
            message={alertConfig.message} 
            onClose={() => setAlertConfig(null)} 
          />
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="w-full max-w-2xl mx-auto bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all duration-300">
          
          <div className="bg-[#3E2723] p-4 flex justify-between items-center text-white shrink-0 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-orange-200" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight ">Admin Settings</h2>
                <p className="text-[8px] text-orange-200/60  tracking-widest font-bold">Security & Profile</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 bg-white/5 hover:bg-white/20 rounded-full transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="p-5 sm:p-8 space-y-8 bg-white overflow-y-auto">
            
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <h3 className="text-[10px] font-black text-[#3E2723]  tracking-widest flex items-center gap-2">
                <UserIcon size={12} /> Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 ml-2 ">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[12px] font-bold text-[#3E2723] outline-none focus:ring-2 focus:ring-[#3E2723]/5 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 ml-2 ">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-100 rounded-xl text-[12px] font-bold text-gray-400 cursor-not-allowed outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-[#3E2723] text-white rounded-xl text-[9px] font-black  tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-sm"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Update Profile
              </button>
            </form>

            <div className="h-px bg-gray-100 w-full" />

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <h3 className="text-[10px] font-black text-[#3E2723]  tracking-widest flex items-center gap-2">
                <KeyRound size={12} /> Change Credentials
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 ml-2 ">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current password"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-[#3E2723]/5 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3E2723]"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 ml-2 ">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-[#3E2723]/5 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3E2723]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={passLoading || !currentPassword || newPassword.length < 6}
                className="w-full sm:w-auto px-6 py-3 bg-[#3E2723] text-white rounded-xl text-[9px] font-black  tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-sm"
              >
                {passLoading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                Confirm New Password
              </button>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AdminFormModal;