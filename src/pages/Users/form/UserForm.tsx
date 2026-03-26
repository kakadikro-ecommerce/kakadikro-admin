// // pages/Users/form/UserForm.tsx
// import React, { useState, useEffect } from 'react';
// import { UserService } from '../../../services';
// import { User, CreateUserData, UpdateUserData } from '../../../services/users-api';

// interface UserFormProps {
//   user?: User | null;
//   onSuccess: () => void;
//   onCancel: () => void;
// }

// // Define a proper type for the form data
// interface FormData {
//   name: string;
//   email: string;
//   password: string;
//   role: string;
//   phone: string;
//   address: string;
// }

// const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel }) => {
//   const [formData, setFormData] = useState<FormData>({
//     name: '',
//     email: '',
//     password: '',
//     role: 'user',
//     phone: '',
//     address: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         name: user.name,
//         email: user.email,
//         password: '', // Password field is empty for edit
//         role: user.role,
//         phone: user.phone || '',
//         address: user.address || '',
//       });
//     }
//   }, [user]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       if (user) {
//         // Update existing user - only include fields that have values
//         const updateData: UpdateUserData = {
//           name: formData.name,
//           email: formData.email,
//           role: formData.role,
//         };
        
//         // Only add phone if it has a value
//         if (formData.phone && formData.phone.trim() !== '') {
//           updateData.phone = formData.phone;
//         }
        
//         // Only add address if it has a value
//         if (formData.address && formData.address.trim() !== '') {
//           updateData.address = formData.address;
//         }
        
//         await UserService.updateUser(user._id, updateData);
//       } else {
//         // Create new user
//         const createData: CreateUserData = {
//           name: formData.name,
//           email: formData.email,
//           password: formData.password,
//           role: formData.role,
//         };
        
//         // Only add optional fields if they have values
//         if (formData.phone && formData.phone.trim() !== '') {
//           createData.phone = formData.phone;
//         }
        
//         if (formData.address && formData.address.trim() !== '') {
//           createData.address = formData.address;
//         }
        
//         await UserService.createUser(createData);
//       }
//       onSuccess();
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <h2 className="text-2xl font-bold text-gray-900 mb-6">
//           {user ? 'Edit User' : 'Create New User'}
//         </h2>

//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
//             {error}
//           </div>
//         )}

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Name *
//           </label>
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             required
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Email *
//           </label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//             disabled={!!user}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
//           />
//           {user && (
//             <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
//           )}
//         </div>

//         {!user && (
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Password *
//             </label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               minLength={6}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             />
//             <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
//           </div>
//         )}

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Role
//           </label>
//           <select
//             name="role"
//             value={formData.role}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//           >
//             <option value="user">User</option>
//             <option value="manager">Manager</option>
//             <option value="admin">Admin</option>
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Phone
//           </label>
//           <input
//             type="tel"
//             name="phone"
//             value={formData.phone}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Address
//           </label>
//           <textarea
//             name="address"
//             value={formData.address}
//             onChange={handleChange}
//             rows={3}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//           />
//         </div>

//         <div className="flex justify-end space-x-3">
//           <button
//             type="button"
//             onClick={onCancel}
//             disabled={loading}
//             className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//           >
//             {loading ? 'Saving...' : user ? 'Update' : 'Create'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default UserForm;

// pages/Users/form/UserForm.tsx
import React, { useState, useEffect } from 'react';
import UserService from '../../../services/users-api';
import { User, CreateUserData, UpdateUserData } from '../../../services/users-api';

interface UserFormProps {
  user?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  address: string;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (user) {
        // Update existing user
        const updateData: UpdateUserData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        
        if (formData.phone && formData.phone.trim() !== '') {
          updateData.phone = formData.phone;
        }
        if (formData.address && formData.address.trim() !== '') {
          updateData.address = formData.address;
        }
        
        await UserService.updateUser(user._id, updateData);
        alert('✅ User updated successfully!');
      } else {
        // Create new user
        const createData: CreateUserData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };
        
        if (formData.phone && formData.phone.trim() !== '') {
          createData.phone = formData.phone;
        }
        if (formData.address && formData.address.trim() !== '') {
          createData.address = formData.address;
        }
        
        await UserService.createUser(createData);
        alert('✅ User created successfully!');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">
          {user ? '✏️ Edit User' : '➕ Create New User'}
        </h2>
        <p className="text-indigo-100 text-sm mt-1">
          {user ? 'Update user information' : 'Add a new user to the system'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Enter full name"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={!!user}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter email address"
            />
            {user && (
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed after creation</p>
            )}
          </div>

          {!user && (
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter password (min. 6 characters)"
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter phone number"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Enter full address"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              user ? 'Update User' : 'Create User'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;