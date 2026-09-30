import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AdminLayout } from './components/AdminLayout';

import AdminLoginPage from './pages/AdminLoginPage';
import AdminOverviewPage from './pages/AdminOverviewPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminInventoryPage from './pages/AdminInventoryPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, token } = useAdmin();
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminOverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <AdminOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <AdminInventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <AdminProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  );
}
