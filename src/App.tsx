import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Authentication/Login';
import DefaultLayout from './layout/DefaultLayout';
import Dashboard from './pages/Dashboard/ECommerce';
// import ProductsTable from './pages/tables/products/ProductsTable';
// Assume you create this next:
// import ProductDetails from './pages/tables/products/ProductDetails';
import { authService } from './services/authService';
// import ProductDetails from './pages/Products/view/ProductsView';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsChecking(false);
    };
    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8EE]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7A330F]"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  useEffect(() => {
    authService.initAuth();
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* Dashboard */}
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
      {/* Products Table */}
      {/* <Route
        path="/products"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <ProductsTable />
            </DefaultLayout>
          </ProtectedRoute>
        }
      /> */}
      {/* NEW: Individual Product View Page */}
      import ProductDetails from './pages/tables/products/ProductDetails'; //
      Inside your Routes:
      {/* <Route
        path="/product/:slug"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <ProductDetails />
            </DefaultLayout>
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/"
        element={
          authService.isAuthenticated() ? (
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
