import React, { useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  Eye,
  X,
  Shield,
  Edit3,
  Trash2,
} from 'lucide-react';
import type { Admin } from '../../../types/Admin';
import AdminFormModal from './form/AdminForm';
import AdminViewModal from './details/Admindetails';
import Alert from '../../../pages/UiElements/Alerts';
import SearchInput from '../../../pages/UiElements/SearchBar';
import TableLoaderRow from '../../../pages/UiElements/TableLoaderRow';
import {
  deleteAdminUser,
  fetchAdminProfile,
  resetAdminNewCount,
} from '../../../store/modules/admin/admin.slice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';

interface AdminTableProps {
  onDelete?: (id: string) => void;
  onView?: (admin: Admin) => void;
}

const AdminTable: React.FC<AdminTableProps> = ({ onDelete, onView }) => {
  const dispatch = useAppDispatch();
  const { profile, status, error, deleteState } = useAppSelector(
    (state) => state.admin,
  );
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>({
    show: false,
    type: 'success',
    message: '',
  });

  const showNotification = (
    type: 'success' | 'error' | 'info' | 'warning',
    message: string,
  ) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  useEffect(() => {
    dispatch(resetAdminNewCount());
    dispatch(fetchAdminProfile());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showNotification('error', error);
    }
  }, [error]);

  const admins = useMemo(() => (profile ? [profile] : []), [profile]);

  const filteredAdmins = admins.filter((admin) => {
    const query = searchTerm.toLowerCase();
    return (
      admin.name?.toLowerCase().includes(query) ||
      admin.email?.toLowerCase().includes(query)
    );
  });

  const handleFormRefresh = async () => {
    await dispatch(fetchAdminProfile());
    showNotification('success', 'Admin profile updated successfully!');
  };

  const processDelete = async () => {
    if (!adminToDelete) return;
    try {
      await dispatch(deleteAdminUser(adminToDelete.id)).unwrap();
      setAdminToDelete(null);
      showNotification('success', 'Admin deleted successfully!');
      if (onDelete) onDelete(adminToDelete.id);
    } catch (deleteError) {
      showNotification(
        'error',
        String(deleteError) || 'Failed to delete admin.',
      );
    }
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'super_admin'
      ? 'bg-purple-50 text-purple-700 border-purple-100'
      : 'bg-indigo-50 text-indigo-700 border-indigo-100';
  };

  const loading = status === 'loading';
  const isDeleting = deleteState.status === 'loading';

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
        
        <div className="mb-6 flex flex-col items-start gap-4 px-1 sm:px-0 md:mb-8">
          <div className="w-full min-w-0">
            <h1 className="text-2xl md:text-3xl font-black text-[#3E2723]  tracking-tight">
              Admin Profile Management
            </h1>
          </div>

          <div className="w-full max-w-md min-w-0">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name or email..."
            />
          </div>
        </div>

        <div className="table-scroll-wrapper overflow-x-auto">
          <table className="w-full min-w-[800px] border-separate border-spacing-y-3 text-left md:min-w-full">
            <thead>
              <tr className="text-[#3E2723] text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-6 py-2 w-16 text-center">ID</th>
                <th className="px-6 py-2">Admin Name</th>
                <th className="px-6 py-2 hidden lg:table-cell">Email</th>
                <th className="px-6 py-2">Role</th>
                <th className="px-6 py-2">Status</th>
                <th className="px-6 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableLoaderRow colSpan={6} message="Loading profile..." />
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <Shield className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-400  text-xs uppercase tracking-wider">No matching profile found</p>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin, i) => (
                  <tr key={admin._id} className="group transition-all">
                    <td className="px-6 py-4 bg-gray-50/50 rounded-l-2xl text-[#3E2723] font-black text-xs text-center">
                      {String(i + 1).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4 bg-gray-50/50 text-[#3E2723] font-bold text-sm">
                      {admin.name}
                    </td>
                    <td className="px-6 py-4 bg-gray-50/50 text-sm font-bold text-gray-600 hidden lg:table-cell">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4 bg-gray-50/50">
                      <span className={`px-3 py-1 text-[9px] font-black rounded-full border flex items-center gap-1 w-fit ${getRoleBadgeColor(admin.role)}`}>
                        <Shield size={10} />
                        {admin.role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 bg-gray-50/50">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${admin.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                        {admin.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 bg-gray-50/50 rounded-r-2xl text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setIsViewOpen(true); if (onView) onView(admin); }} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => setIsFormOpen(true)} className="p-2 text-gray-400 hover:text-[#3E2723] hover:bg-stone-100 rounded-xl transition-all">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => setAdminToDelete({ id: admin._id, name: admin.name })} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {adminToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#2D1B19]/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-white animate-in fade-in zoom-in duration-200">
            <div className="bg-rose-50/50 p-8 flex flex-col items-center text-center relative">
              <button onClick={() => setAdminToDelete(null)} className="absolute top-4 right-4 p-2 text-rose-300 hover:text-rose-500 transition-colors">
                <X size={20} />
              </button>
              <h3 className="text-xl font-black text-[#3E2723]  tracking-tight">Delete Admin?</h3>
              <p className="text-[11px] text-gray-500 font-bold  tracking-wider mt-3 leading-relaxed px-4 opacity-70">
                You are about to delete <br />
                <span className="text-rose-600 font-black">"{adminToDelete.name}"</span>
              </p>
            </div>
            <div className="p-6 bg-white flex gap-3">
              <button onClick={() => setAdminToDelete(null)} className="flex-1 py-4 rounded-2xl text-[10px] font-black  tracking-widest text-gray-400 border border-transparent hover:border-gray-100 transition-all">
                Cancel
              </button>
              <button onClick={processDelete} disabled={isDeleting} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black  tracking-widest shadow-xl flex justify-center items-center gap-2 transition-all active:scale-95">
                {isDeleting ? <Loader2 className="animate-spin" size={14} /> : 'Delete Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminFormModal
        admin={profile}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onRefresh={handleFormRefresh}
      />
      <AdminViewModal
        admin={profile}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />
    </div>
  );
};

export default AdminTable;
