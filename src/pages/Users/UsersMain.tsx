
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserTable from '../../components/Tables/UsersTable/UsersTable';
import UserForm from './form/UserForm';
import { User } from '../../services/users-api';
import AuthService from '../../services/auth';

const UsersMain: React.FC = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refreshTable, setRefreshTable] = useState(0);

  // Check if user is admin
  if (!AuthService.isAdmin()) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded max-w-md mx-auto">
          <h3 className="font-semibold">Access Denied</h3>
          <p className="text-sm mt-1">Admin privileges required to access this page.</p>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleView = (user: User) => {
    navigate(`/users/details/${user._id}`);
  };

  const handleDelete = (_id: string) => {
    setRefreshTable(prev => prev + 1);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedUser(null);
    setRefreshTable(prev => prev + 1);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  return (
    <div className="users-main">
      {showForm ? (
        <UserForm
          user={selectedUser}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      ) : (
        <UserTable
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onAdd={handleAdd}
          refreshTrigger={refreshTable}
        />
      )}
    </div>
  );
};

export default UsersMain;