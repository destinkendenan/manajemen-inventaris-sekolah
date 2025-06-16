import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Barang from '../pages/Barang';
import Kategori from '../pages/Kategori';
import Peminjaman from '../pages/Peminjaman';
import Users from '../pages/Users';
import Laporan from '../pages/Laporan';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import useAuth from '../hooks/useAuth';
import { Suspense } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/barang" element={<Barang />} />
          <Route path="/peminjaman" element={<Peminjaman />} />

          {/* Admin Only Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/kategori" element={<Kategori />} />
            <Route path="/users" element={<Users />} />
            <Route path="/laporan" element={<Laporan />} />
          </Route>
        </Route>

        {/* Redirect to Dashboard or Login */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-base-200">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-lg mb-4">Halaman tidak ditemukan</p>
                <a href="/" className="btn btn-primary">
                  Kembali ke Beranda
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;