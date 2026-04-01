import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Authentication/Login';
import DefaultLayout from './layout/DefaultLayout';
import Dashboard from './pages/Dashboard/ECommerce';
import ProductsTable from './pages/Products/Products';
import UserTable from './components/Tables/UsersTable/UsersTable';
import OrdersTable from './pages/Orders/Orders';
import Admin from './pages/Admin/Admin';
import { clearAuthState, initializeAuth } from './store/modules/auth/auth.slice';
import { useAppDispatch, useAppSelector } from './store/hooks';
import ContactsTable from './pages/Contacts/ContactsTable';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { initialized, isAuthenticated, status } = useAppSelector(
    (state) => state.auth,
  );

  if (!initialized || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8EE]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7A330F]"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    const handleLogout = () => {
      dispatch(clearAuthState());
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <Dashboard />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
            <Route
        path="/Admin"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <Admin />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <UserTable />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <ProductsTable />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <OrdersTable />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <ContactsTable />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
