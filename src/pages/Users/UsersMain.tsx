import UserTable from '../../components/Tables/UsersTable/UsersTable';
import { User as UserType } from '../../types/users'; // Rename import to avoid conflict

const UsersMain = () => {
  const handleEdit = (user: UserType) => {
    console.log("Edit user:", user);
  };

  const handleDelete = (id: string) => {
    console.log("Deleted user id:", id);
  };

  const handleView = (user: UserType) => {
    console.log("View user:", user);
  };

  const handleAdd = () => {
    console.log("Add new user");
  };

  return (
    <div>
      <UserTable
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onAdd={handleAdd}
      />
    </div>
  );
};

export default UsersMain;
