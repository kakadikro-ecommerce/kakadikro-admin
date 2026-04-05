import React, { useEffect, useState } from 'react';
import {
  Eye,
  Filter,
  Users as UsersIcon,
} from 'lucide-react';
import type { User } from '../../../types/users';
import UserViewModal from './details/UserDetails';
import Alert from '../../../pages/UiElements/Alerts';
import Pagination from '../../../pages/UiElements/Pagination';
import SearchInput from '../../../pages/UiElements/SearchBar';
import TableLoaderRow from '../../../pages/UiElements/TableLoaderRow';
import {
  clearAdminError,
  fetchAllUsers,
  resetAdminNewCount,
  toggleAdminUserStatus,
} from '../../../store/modules/admin/admin.slice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';

interface UserTableProps {
  onEdit?: (user: User) => void;
  onView?: (user: User) => void;
  onAdd?: () => void;
  onDelete?: (id: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  onView,
}) => {
  const dispatch = useAppDispatch();
  const {
    users,
    pagination,
    status,
    error,
  } = useAppSelector((state) => state.admin);
  const authUser = useAppSelector((state) => state.auth.user);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
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
    dispatch(fetchAllUsers({ page: currentPage, limit: 10, isActive, role: 'user' }));
  }, [currentPage, dispatch, selectedStatus]);

  useEffect(() => {
    if (error) {
      showNotification('error', error);
      dispatch(clearAdminError());
    }
  }, [error, dispatch]);

  const statuses = ['Active', 'Inactive'];

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleFormRefresh = async () => {
    const isActive = selectedStatus === 'All' ? undefined : selectedStatus === 'Active';
    await dispatch(fetchAllUsers({ page: currentPage, limit: 10, isActive, role: 'user' })).unwrap();
  };

  const loading = status === 'loading';
  const authRole = authUser?.role;
  const canToggleUserStatus = authRole === 'admin' || authRole === 'super_admin';

  const filteredUsers = (users || []).filter((u: User) => {
    const search = searchTerm.toLowerCase();
    return u.name?.toLowerCase().includes(search) || u.email?.toLowerCase().includes(search);
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (!canToggleUserStatus) {
      return;
    }

    setUpdatingUserId(user._id);

    try {
      await dispatch(
        toggleAdminUserStatus({
          id: user._id,
          isActive: !user.isActive,
        }),
      ).unwrap();
      await handleFormRefresh();
      showNotification(
        'success',
        `${user.name} is now ${user.isActive ? 'inactive' : 'active'}.`,
      );
    } catch (toggleError: any) {
      showNotification('error', toggleError?.message || 'Failed to update user status.');
    } finally {
      setUpdatingUserId(null);
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
        
        <div className="mb-8 flex flex-col gap-6 px-1 sm:px-0">

          <div className="w-full min-w-0 border-b border-gray-100 pb-4">
            <h1 className="text-2xl md:text-3xl font-black text-[#3E2723]  tracking-tight">
              User Management
            </h1>
          </div>

          <div className="flex w-full flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex w-full min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:w-auto">

              <div className="w-full min-w-0 sm:w-80">
                <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search users..." />
              </div>

              <div className="relative w-full min-w-0 sm:w-44">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-gray-50 border-none rounded-2xl text-xs outline-none cursor-pointer text-[#3E2723] appearance-none"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="table-scroll-wrapper overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3 min-w-[700px]">
            <thead>
              <tr className="text-[#3E2723] text-[10px] font-bold uppercase tracking-[0.2em]">
                <th className="px-6 py-2 w-16 text-center">ID</th>
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
                    <td className="px-6 py-4 bg-gray-50/50 text-[#3E2723] text-sm font-bold">
                      {u.name}
                    </td>
                    <td className="px-6 py-4 bg-gray-50/50 text-sm font-bold text-gray-900">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 bg-gray-50/50">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getRoleBadgeColor(u.role)}`}>
                        {u.role?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 bg-gray-50/50">
                      <span
                        className={`px-3 py-1 text-xs font-black rounded-full border ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}
                      >
                        {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 bg-gray-50/50 rounded-r-2xl">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setIsViewOpen(true);
                            if (onView) onView(u);
                          }}
                          className="flex items-center justify-center rounded-lg p-2 text-gray-500 transition-all hover:bg-teal-50 hover:text-teal-600 active:scale-95"
                        >
                          <Eye size={18} className="sm:size-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          disabled={!canToggleUserStatus || updatingUserId === u._id}
                          className={`relative flex h-6 w-11 sm:h-7 sm:w-12 items-center rounded-full transition-all duration-300 ${u.isActive
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                            } ${!canToggleUserStatus || updatingUserId === u._id
                              ? "cursor-not-allowed opacity-50"
                              : "hover:shadow-md"
                            }`}
                          aria-label={`Toggle ${u.name} status`}
                          aria-pressed={u.isActive}
                        >
                          <span
                            className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${u.isActive
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
      <UserViewModal user={selectedUser} isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} />
    </div>
  );
};

export default UserTable;
