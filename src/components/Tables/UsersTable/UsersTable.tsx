import React, { useEffect, useState } from 'react';
import {
  Trash2,
  Plus,
  Loader2,
  Eye,
  Edit3,
  Filter,
  AlertTriangle,
  Users as UsersIcon,
} from 'lucide-react';
import type { User } from '../../../types/users';
import UserFormModal from './form/UserForm';
import UserViewModal from './details/UserDetails';
import Alert from '../../../pages/UiElements/Alerts';
import Pagination from '../../../pages/UiElements/Pagination';
import SearchInput from '../../../pages/UiElements/SearchBar';
import TableLoaderRow from '../../../pages/UiElements/TableLoaderRow';
import {
  clearAdminError,
  deleteAdminUser,
  fetchAllUsers,
  resetAdminNewCount,
} from '../../../store/modules/admin/admin.slice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';

interface UserTableProps {
  onEdit?: (user: User) => void;
  onDelete?: (id: string) => void;
  onView?: (user: User) => void;
  onAdd?: () => void;
}

const UserTable: React.FC<UserTableProps> = ({
  onEdit,
  onDelete,
  onView,
  onAdd,
}) => {
  const dispatch = useAppDispatch();
  const {
    users,
    pagination,
    status,
    error,
    deleteState,
  } = useAppSelector((state) => state.admin);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
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
    setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 4000);
  };

  useEffect(() => {
    dispatch(resetAdminNewCount());
  }, [dispatch]);

  useEffect(() => {
    const isActive = selectedStatus === 'All' ? undefined : selectedStatus === 'Active';
    dispatch(fetchAllUsers({ page: currentPage, limit: 10, isActive }));
  }, [currentPage, dispatch, selectedStatus]);

  useEffect(() => {
    if (error) {
      showNotification('error', error);
      dispatch(clearAdminError());
    }
  }, [error, dispatch]);

  const statuses = ['All', 'Active', 'Inactive'];

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleFormRefresh = () => {
    const isActive = selectedStatus === 'All' ? undefined : selectedStatus === 'Active';
    dispatch(fetchAllUsers({ page: currentPage, limit: 10, isActive }));
    showNotification('success', `User ${selectedUser ? 'updated' : 'added'} successfully!`);
    setIsFormOpen(false);
  };

  const processDelete = async () => {
    if (!userToDelete) return;

    try {
      await dispatch(deleteAdminUser(userToDelete.id)).unwrap();
      const isActive = selectedStatus === 'All' ? undefined : selectedStatus === 'Active';
      dispatch(fetchAllUsers({ page: currentPage, limit: 10, isActive }));
      setUserToDelete(null);
      showNotification('success', 'User deleted successfully!');
      if (onDelete) onDelete(userToDelete.id);
    } catch (err: any) {
      showNotification('error', err || 'Failed to delete');
    }
  };

  const loading = status === 'loading';
  const isDeleting = deleteState.status === 'loading';

  const filteredUsers = (users || []).filter((u: User) => {
    const search = searchTerm.toLowerCase();
    return u.name?.toLowerCase().includes(search) || u.email?.toLowerCase().includes(search);
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'moderator':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
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
        
        {/* --- HEADER & CONTROLS SECTION --- */}
        <div className="mb-8 flex flex-col gap-6 px-1 sm:px-0">
          
          {/* TOP: Heading and Statistics */}
          <div className="w-full min-w-0 border-b border-gray-100 pb-4">
            <h1 className="text-2xl md:text-3xl font-black text-[#3E2723]  tracking-tight">
              User Management
            </h1>
          </div>

          {/* BOTTOM: Search, Filter, and Add Button */}
          <div className="flex w-full flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex w-full min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:w-auto">
              {/* Search Bar */}
              <div className="w-full min-w-0 sm:w-80">
                <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search users..." />
              </div>

              {/* Status Select */}
              <div className="relative w-full min-w-0 sm:w-44">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-gray-50 border-none rounded-2xl text-xs outline-none cursor-pointer text-[#3E2723] appearance-none"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s === 'All' ? 'All Status' : s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => {
                setSelectedUser(null);
                setIsFormOpen(true);
                if (onAdd) onAdd();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3E2723] px-8 py-3.5 text-xs tracking-widest text-white shadow-lg active:scale-95 hover:bg-[#2D1B19] sm:w-auto lg:w-auto"
            >
              <Plus size={18} /> Add
            </button>
          </div>
        </div>

        {/* --- TABLE SECTION --- */}
        <div className="table-scroll-wrapper overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3 min-w-[700px]">
            <thead>
              <tr className="text-[#3E2723] opacity-40 text-[10px] font-black  tracking-[0.2em]">
                <th className="px-6 py-2 w-16 text-center">Id</th>
                <th className="px-6 py-2">Name</th>
                <th className="px-6 py-2">Email</th>
                <th className="px-6 py-2">Role</th>
                <th className="px-6 py-2">Status</th>
                <th className="px-6 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableLoaderRow colSpan={6} />
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <UsersIcon className="mx-auto text-gray-300 mb-2" size={48} />
                    <p className="text-gray-400 text-xs">NO USERS FOUND</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u: User, i: number) => (
                  <tr key={u._id} className="group transition-all">
                    <td className="px-6 py-4 bg-gray-50/50 rounded-l-2xl text-[#3E2723] font-black text-xs text-center">
                      {String((currentPage - 1) * 10 + i + 1).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4 bg-gray-50/50 text-[#3E2723] text-sm">{u.name}</td>
                    <td className="px-6 py-4 bg-gray-50/50 text-[11px] font-medium text-gray-600">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 bg-gray-50/50">
                      <span className={`px-3 py-1 text-[9px] font-black rounded-full border ${getRoleBadgeColor(u.role)}`}>
                        {u.role?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 bg-gray-50/50">
                      <span
                        className={`px-3 py-1 text-[9px] font-black rounded-full border ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}
                      >
                        {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 bg-gray-50/50 rounded-r-2xl text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setIsViewOpen(true);
                            if (onView) onView(u);
                          }}
                          className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setIsFormOpen(true);
                            if (onEdit) onEdit(u);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => setUserToDelete({ id: u._id, name: u.name })}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
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

        {pagination && pagination.total > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={10}
            onPageChange={setCurrentPage}
            loading={loading}
          />
        )}
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {userToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#2D1B19]/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-white">
            <div className="bg-rose-50/50 p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-rose-500 mb-5 border border-rose-100">
                <AlertTriangle size={36} />
              </div>
              <h3 className="text-xl font-black text-[#3E2723]  tracking-tight">Delete User?</h3>
              <p className="text-[11px] text-gray-500 tracking-wider mt-3 opacity-70">
                Delete <span className="text-rose-600 font-black">"{userToDelete.name}"</span>?
              </p>
            </div>
            <div className="p-6 bg-white flex gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-4 rounded-2xl text-[10px] font-black  text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={processDelete}
                disabled={isDeleting}
                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black  shadow-xl flex justify-center items-center gap-2"
              >
                {isDeleting ? <Loader2 className="animate-spin" size={14} /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <UserFormModal
        user={selectedUser}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onRefresh={handleFormRefresh}
      />
      <UserViewModal user={selectedUser} isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} />
    </div>
  );
};

export default UserTable;
