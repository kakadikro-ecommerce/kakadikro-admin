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
  createAdminUser,
  updateAdminUser,
  updateAdminPassword,
  updateAdminProfile,
} from '../../../../store/modules/admin/admin.slice';
import { setAuthUser } from '../../../../store/modules/auth/auth.slice';
import { useAppDispatch } from '../../../../store/hooks';
import { adminCreateSchema, adminUpdateSchema } from '../../../../validations/adminValidation';

interface AdminFormModalProps {
  admin: Admin | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  mode?: 'profile' | 'admin';
}

const AdminFormModal: React.FC<AdminFormModalProps> = ({
  admin,
  isOpen,
  onClose,
  onRefresh,
  mode = 'profile',
}) => {
  const dispatch = useAppDispatch();
  const isProfileMode = mode === 'profile';
  const isCreateMode = mode === 'admin' && !admin;

  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ type: 'success' | 'error' | 'info' | 'warning', message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin' as 'admin' | 'super_admin',
    isActive: true,
  });
  const [profilePassword, setProfilePassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  useEffect(() => {
    if (isOpen && admin) {
      setFormData({
        name: admin.name || '',
        email: admin.email || '',
        role: admin.role || 'admin',
        isActive: admin.isActive ?? true,
      });
    } else if (isOpen && isCreateMode) {
      setFormData({
        name: '',
        email: '',
        role: 'admin',
        isActive: true,
      });
    }

    if (isOpen) {
      setProfilePassword('');
      setCurrentPassword('');
      setNewPassword('');
    }
  }, [admin, isCreateMode, isOpen]);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertConfig({ type, message });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const schema = isCreateMode ? adminCreateSchema : adminUpdateSchema;
    const result = schema.safeParse({
      name: trimmedName,
      email: trimmedEmail,
      password: isCreateMode ? newPassword : newPassword || undefined,
    });

    if (!result.success) {
      const fieldErrors: any = {};

      result.error.issues.forEach((err) => {
        const field = err.path[0];
        fieldErrors[field] = err.message;
      });

      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    setLoading(true);
    try {
      if (isProfileMode) {
        const updatedProfile = await dispatch(updateAdminProfile({ name: trimmedName })).unwrap();
        dispatch(setAuthUser( updatedProfile as any));
      } else if (isCreateMode) {
        await dispatch(createAdminUser({
          name: trimmedName,
          email: trimmedEmail,
          password: newPassword,
          role: 'admin',
          isActive: true,
        } as any)).unwrap();
      } else if (admin?._id) {
        const payload: Record<string, unknown> = {
          name: trimmedName,
          email: trimmedEmail,
          role: formData.role,
          isActive: formData.isActive,
        };

        if (newPassword) {
          payload.password = newPassword;
        }

        await dispatch(updateAdminUser({ id: admin._id, data: payload as any })).unwrap();
      } else {
        throw new Error('Admin ID is not available');
      }

      onRefresh();
      showAlert(
        'success',
        isProfileMode
          ? "Profile updated successfully!"
          : isCreateMode
            ? "Admin created successfully!"
            : "Admin updated successfully!",
      );

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
    if (!isProfileMode) {
      return;
    }
    if (!currentPassword) {
      showAlert('error', "Please enter your current password");
      return;
    }
    if (newPassword.length < 10) {
      showAlert('error', "New password must be at least 10 characters");
      return;
    }
    setPassLoading(true);
    try {
      await dispatch(updateAdminPassword({
        currentPassword,
        newPassword,
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
                <h2 className="text-base sm:text-lg font-bold tracking-tight ">Admin Settings</h2>
                <p className="text-sm md:text-base text-orange-200/60  tracking-widest font-bold">Security & Profile</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 bg-white/5 hover:bg-white/20 rounded-full transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="p-5 sm:p-8 space-y-8 bg-white overflow-y-auto">

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <h3 className="text-sm md:text-base font-bold text-[#3E2723]  tracking-widest flex items-center gap-2">
                <UserIcon size={12} /> Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm md:text-base font-bold text-gray-900 ml-2 ">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[12px] font-bold text-[#3E2723] outline-none focus:ring-2 focus:ring-[#3E2723]/5 transition-all"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-[10px] ml-2">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-sm md:text-base font-bold text-gray-900 ml-2 ">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled={!isCreateMode}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full rounded-xl border px-4 py-3 text-[12px] font-bold outline-none transition-all ${isCreateMode
                      ? 'bg-gray-50 text-[#3E2723] border-gray-100 focus:ring-2 focus:ring-[#3E2723]/5'
                      : 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed'
                      }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-[10px] ml-2">{errors.email}</p>
                  )}
                </div>
              </div>

              {!isProfileMode && !isCreateMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 ml-2 ">Role</label>
                    <input
                      type="text"
                      value={formData.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      disabled
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-100 rounded-xl text-[12px] font-bold text-gray-400 cursor-not-allowed outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 ml-2 ">Account Status</label>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                      className={`w-full rounded-xl border px-4 py-3 text-[12px] font-bold uppercase tracking-widest transition-all ${formData.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}
                    >
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
              )}

              {!isProfileMode && (
                <div className="space-y-1">
                  <label className="text-sm md:text-base font-bold text-gray-900 ml-2 ">
                    {isCreateMode ? 'Password' : 'New Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={isCreateMode ? 'Minimum 6 characters' : 'Leave blank to keep current password'}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-[#3E2723]/5 transition-all"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-[10px] ml-2">{errors.password}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3E2723]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-[#3E2723] text-white rounded-xl text-sm md:text-base font-bold  tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-sm font-bold"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {isProfileMode ? 'Update Profile' : isCreateMode ? 'Create Admin' : 'Update Admin'}
              </button>
            </form>

            {isProfileMode && (
              <>
                <div className="h-px bg-gray-100 w-full" />

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <h3 className="text-sm font-bold text-[#3E2723]  tracking-widest flex items-center gap-2">
                    <KeyRound size={12} /> Change Credentials
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-400 ml-2 ">Current Password</label>
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
                      <label className="text-[11px] font-bold text-gray-400 ml-2 ">New Password</label>
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
                    className="w-full sm:w-auto px-6 py-3 bg-[#3E2723] text-white rounded-xl text-[11px] font-bold  tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-sm"
                  >
                    {passLoading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                    Confirm New Password
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AdminFormModal;
