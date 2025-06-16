import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const AdminRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // ProtectedRoute sudah menangani loading
  }

  // Jika bukan admin, redirect ke dashboard
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;