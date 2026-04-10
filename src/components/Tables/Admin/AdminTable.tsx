import React, { useEffect, useState } from 'react';
import { Eye, Filter, Plus} from 'lucide-react';
import type { Admin } from '../../../types/Admin';
import AdminFormModal from './form/AdminForm';
import AdminViewModal from './details/Admindetails';
import Alert from '../../../pages/UiElements/Alerts';
import Pagination from '../../../pages/UiElements/Pagination';
import SearchInput from '../../../pages/UiElements/SearchBar';
import TableLoaderRow from '../../../pages/UiElements/TableLoaderRow';
import {
  clearAdminError,
  fetchAllAdmins,
  resetAdminNewCount,
  toggleAdminUserStatus,
} from '../../../store/modules/admin/admin.slice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';

interface AdminTableProps {
  onView?: (admin: Admin) => void;
}

const AdminTable: React.FC<AdminTableProps> = ({ onView }) => {
  const dispatch = useAppDispatch();
  const { admins, adminPagination, status, error } = useAppSelector((state) => state.admin);
  const authUser = useAppSelector((state) => state.auth.user);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [updatingAdminId, setUpdatingAdminId] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
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
  }, [dispatch]);

  useEffect(() => {
    const isActive = selectedStatus === 'All' ? undefined : selectedStatus === 'Active';
    dispatch(fetchAllAdmins({ page: currentPage, limit: 10, isActive }));
  }, [currentPage, dispatch, selectedStatus]);

  useEffect(() => {
    if (error) {
      showNotification('error', error);
      dispatch(clearAdminError());
    }
  }, [dispatch, error]);

  const filteredAdmins = admins.filter((admin) => {
    const query = searchTerm.toLowerCase();
    return (
      admin.name?.toLowerCase().includes(query) ||
      admin.email?.toLowerCase().includes(query)
    );
  });

  const handleFormRefresh = async (showSuccessNotification = true) => {
    const isActive = selectedStatus === 'All' ? undefined : selectedStatus === 'Active';
    await dispatch(fetchAllAdmins({ page: currentPage, limit: 10, isActive }));
    if (showSuccessNotification) {
      showNotification('success', selectedAdmin ? 'Admin updated successfully!' : 'Admin created successfully!');
    }
    setIsFormOpen(false);
    setSelectedAdmin(null);
  };

  const handleOpenView = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsViewOpen(true);
    onView?.(admin);
  };

  const getRoleBadgeColor = (role: string) =>
    role === 'super_admin'
      ? 'bg-purple-50 text-purple-700 border-purple-100'
      : 'bg-indigo-50 text-indigo-700 border-indigo-100';

  const authRole = authUser?.role;
  const authUserId = String(authUser?.id ?? authUser?._id ?? '');
  const canCreateAdmin = authRole === 'super_admin';
  const canToggleAdminStatus = authRole === 'super_admin';

  const handleToggleStatus = async (admin: Admin) => {
    if (!canToggleAdminStatus || admin._id === authUserId) {
      return;
    }

    setUpdatingAdminId(admin._id);

    try {
      await dispatch(
        toggleAdminUserStatus({
          id: admin._id,
          isActive: !admin.isActive,
        }),
      ).unwrap();
      await handleFormRefresh(false);
      showNotification(
        'success',
        `${admin.name} is now ${admin.isActive ? 'inactive' : 'active'}.`,
      );
    } catch (toggleError: any) {
      showNotification('error', toggleError?.message || 'Failed to update admin status.');
    } finally {
      setUpdatingAdminId(null);
    }
  };

  const loading = status === 'loading';
  const statuses = ['Active', 'Inactive'];

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
            <h1 className="text-2xl font-bold tracking-tight text-[#3E2723] md:text-3xl">
              Admin Management
            </h1>
          </div>

          <div className="flex w-full flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex w-full min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:w-auto">
              <div className="w-full min-w-0 sm:w-80">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search admins..."
                />
              </div>

              <div className="relative w-full min-w-0 sm:w-44">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none rounded-2xl border-none bg-gray-50 py-3 pl-11 pr-10 text-xs text-[#3E2723] outline-none"
                >
                  {statuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {canCreateAdmin && (
              <button
                onClick={() => {
                  setSelectedAdmin(null);
                  setIsFormOpen(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3E2723] px-8 py-3.5 text-xs tracking-widest text-white shadow-lg active:scale-95 hover:bg-[#2D1B19] sm:w-auto lg:w-auto"
              >
                <Plus size={18} /> Add
              </button>
            )}
          </div>
        </div>

        <div className="table-scroll-wrapper overflow-x-auto">
          <table className="w-full min-w-[800px] border-separate border-spacing-y-3 text-left md:min-w-full">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3E2723]">
                <th className="w-16 px-6 py-2 text-center">ID</th>
                <th className="px-6 py-2">Admin Name</th>
                <th className="px-6 py-2">Email</th>
                <th className="px-6 py-2">Role</th>
                <th className="px-6 py-2">Status</th>
                <th className="px-6 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableLoaderRow colSpan={6} message="Loading admins..." />
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <p className="text-xs md:text-sm uppercase tracking-wider text-gray-400 font-semibold">
                      No admins found
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin, index) => (
                  <tr key={admin._id} className="group transition-all">
                    <td className="rounded-l-2xl bg-gray-50/50 px-6 py-4 text-center text-xs font-bold text-[#3E2723]">
                      {String((currentPage - 1) * 10 + index + 1).padStart(2, '0')}
                    </td>
                    <td className="bg-gray-50/50 px-6 py-4 text-sm font-bold text-[#3E2723]">
                      {admin.name}
                    </td>
                    <td className="bg-gray-50/50 px-6 py-4 text-sm font-bold text-gray-600">
                      {admin.email}
                    </td>
                    <td className="bg-gray-50/50 px-6 py-4">
                      <span
                        className={`flex w-fit items-center gap-1 rounded-full border px-3 py-1 text-[9px] font-bold ${getRoleBadgeColor(admin.role)}`}
                      >
                        {admin.role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN'}
                      </span>
                    </td>
                    <td className="bg-gray-50/50 px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest ${
                          admin.isActive
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}
                      >
                        {admin.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="rounded-r-2xl bg-gray-50/50 px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleOpenView(admin)}
                          className="flex items-center justify-center rounded-lg p-2 text-gray-500 transition-all hover:bg-teal-50 hover:text-teal-600 active:scale-95"
                        >
                          <Eye size={18} className="sm:size-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(admin)}
                          disabled={
                            !canToggleAdminStatus ||
                            updatingAdminId === admin._id ||
                            admin._id === authUserId
                          }
                          className={`relative flex h-6 w-11 sm:h-7 sm:w-12 items-center rounded-full transition-all duration-300 ${admin.isActive
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                            } ${!canToggleAdminStatus || admin._id === authUserId
                              ? "cursor-not-allowed opacity-50"
                              : "hover:shadow-md"
                            }`}
                          aria-label={`Toggle ${admin.name} status`}
                          aria-pressed={admin.isActive}
                        >
                          <span
                            className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${admin.isActive
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

        {adminPagination && adminPagination.total > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={adminPagination.totalPages}
            totalItems={adminPagination.total}
            itemsPerPage={10}
            onPageChange={setCurrentPage}
            loading={loading}
          />
        )}
      </div>

      <AdminFormModal
        admin={selectedAdmin}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedAdmin(null);
        }}
        onRefresh={handleFormRefresh}
        mode="admin"
      />
      <AdminViewModal
        admin={selectedAdmin}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />
    </div>
  );
};

export default AdminTable;
