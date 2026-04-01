import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Loader2,
  User as UserIcon,
  Mail,
  Shield,
  Activity,
  Eye,
  EyeOff,
  ChevronDown,
} from 'lucide-react';
import { Modal } from '../../../../pages/UiElements/Modal';
import type { User } from '../../../../types/users';
// Updated to use Admin slice actions
import {
  createAdminUser,
  updateAdminUser,
} from '../../../../store/modules/admin/admin.slice';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';

interface UserFormModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  user,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const dispatch = useAppDispatch();
  // Get loading states from admin slice
  const { createState, updateState } = useAppSelector((state) => state.admin);
  
  const isEdit = !!user;
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'user',
    isActive: true,
    password: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          password: '', 
        });
      } else {
        setFormData({
          name: '',
          email: '',
          role: 'user',
          isActive: true,
          password: '',
        });
      }
      setErrors({});
      setShowPassword(false);
    }
  }, [user, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name?.trim()) newErrors.name = 'Full name is required';
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email!)) {
      newErrors.email = 'Invalid email format';
    }
    if (!isEdit) {
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'New password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const submitData = { ...formData };
      if (isEdit && user?._id) {
        if (!submitData.password) delete submitData.password;
        // Use updateAdminUser
        await dispatch(updateAdminUser({ id: user._id, data: submitData })).unwrap();
      } else {
        // Use createAdminUser
        await dispatch(createAdminUser(submitData as any)).unwrap();
      }
      onRefresh();
      onClose();
    } catch (error: any) {
      console.error("Submission Error:", error);
    }
  };

  const loading = isEdit ? updateState.status === 'loading' : createState.status === 'loading';

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={handleFormSubmit}
        className="w-full max-w-2xl mx-auto bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col h-full sm:h-auto max-h-[95vh] sm:max-h-[89vh] overflow-hidden border border-white"
      >
        <div className="bg-[#2D1B19] p-5 sm:p-6 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <UserIcon size={20} className="sm:text-[24px] text-orange-200" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight">
                {isEdit ? 'Update' : 'Add New'} User
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/20 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 overflow-y-auto custom-scrollbar bg-gray-50/50 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 ml-2 flex items-center gap-2">
                <UserIcon size={12} /> Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className={`w-full px-5 py-4 bg-white border rounded-[1.25rem] text-[12px] font-bold outline-none shadow-sm transition-all ${
                  errors.name ? 'border-red-400 ring-4 ring-red-50' : 'border-gray-100 focus:border-[#3E2723]/30 focus:ring-4 focus:ring-[#3E2723]/5'
                }`}
              />
              {errors.name && <p className="text-[10px] text-red-500 ml-2 font-bold">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 ml-2 flex items-center gap-2">
                <Mail size={12} /> Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className={`w-full px-5 py-4 bg-white border rounded-[1.25rem] text-[12px] font-bold outline-none shadow-sm transition-all ${
                  errors.email ? 'border-red-400 ring-4 ring-red-50' : 'border-gray-100 focus:border-[#3E2723]/30 focus:ring-4 focus:ring-[#3E2723]/5'
                }`}
              />
              {errors.email && <p className="text-[10px] text-red-500 ml-2 font-bold">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 ml-2 flex items-center gap-2">
                <Shield size={12} /> {isEdit ? 'Change Password' : 'Password'} {!isEdit && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={isEdit ? 'Leave blank to keep current' : 'Min. 6 characters'}
                  className={`w-full px-5 py-4 bg-white border rounded-[1.25rem] text-[12px] font-bold outline-none shadow-sm pr-12 transition-all ${
                    errors.password ? 'border-red-400 ring-4 ring-red-50' : 'border-gray-100 focus:border-[#3E2723]/30 focus:ring-4 focus:ring-[#3E2723]/5'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3E2723]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-500 ml-2 font-bold">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 ml-2 flex items-center gap-2">
                <Shield size={12} /> User Role
              </label>
              <div className="relative">
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-5 py-4 bg-white border border-gray-100 rounded-[1.25rem] text-[12px] font-bold outline-none appearance-none cursor-pointer shadow-sm focus:ring-4 focus:ring-[#3E2723]/5 transition-all"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
                <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {isEdit && (
            <div className="pt-1">
              <label className="text-[10px] font-black text-[#A69080] uppercase tracking-widest ml-2 mb-3 flex items-center gap-2">
                <Activity size={12} /> Account Status
              </label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-[1.25rem] text-[11px] font-black border transition-all flex items-center justify-center gap-3 shadow-sm ${
                  formData.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className="uppercase tracking-widest">{formData.isActive ? 'Active' : 'Inactive'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="px-8 py-10 sm:py-3 bg-white border-t border-[#EFE4D5]/30 flex justify-center shrink-0">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:max-w-[260px] py-4 bg-[#3E2723] text-white rounded-full flex items-center justify-center gap-4 hover:bg-[#2D1B19] active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-[#3E2723]/20"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span className="font-black tracking-[0.2em] text-[11px]">
              {isEdit ? 'Update Profile' : 'Create Account'}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;