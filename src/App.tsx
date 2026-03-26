import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Authentication/Login';
import DefaultLayout from './layout/DefaultLayout';
import Dashboard from './pages/Dashboard/ECommerce';
import UsersMain from './pages/Users/UsersMain';  // ← Import UsersMain instead of UserTable
import { authService } from './services/authService';

// --- PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
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

// --- MAIN APP COMPONENT ---
function App() {
  useEffect(() => {
    authService.initAuth();
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Dashboard */}
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

      {/* Protected Users Module - Use UsersMain which handles everything */}
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <UsersMain />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />

      {/* Users Form Routes - Create and Edit */}
      <Route
        path="/users/create"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <UsersMain />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />

      {/* Root Redirection Logic */}
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

      {/* Catch-all - Redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;