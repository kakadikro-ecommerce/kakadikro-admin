import { useEffect, useState } from 'react';
import AdminFormModal from './form/AdminForm';
import AdminViewModal from './details/Admindetails';
import {
  clearAdminError,
  fetchAdminProfile,
} from '../../../store/modules/admin/admin.slice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((state) => state.admin);
  const authUser = useAppSelector((state) => state.auth.user);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const canOpenProfile =
    !authUser?.role || authUser.role === 'admin' || authUser.role === 'super_admin';

  useEffect(() => {
    if (isOpen && canOpenProfile) {
      dispatch(fetchAdminProfile());
    }
  }, [canOpenProfile, dispatch, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditOpen(false);
      dispatch(clearAdminError());
    }
  }, [dispatch, isOpen]);

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
  };

  const handleRefresh = async () => {
    await dispatch(fetchAdminProfile());
    setIsEditOpen(false);
  };

  if (!canOpenProfile) {
    return null;
  }

  return (
    <>
      <AdminViewModal
        admin={profile}
        isOpen={isOpen && !isEditOpen}
        onClose={onClose}
        onEdit={handleEdit}
      />
      <AdminFormModal
        admin={profile}
        isOpen={isOpen && isEditOpen}
        onClose={handleCloseEdit}
        onRefresh={handleRefresh}
        mode="profile"
      />
    </>
  );
};

export default ProfileModal;
