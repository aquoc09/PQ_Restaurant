import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin()) {
    alert("Truy cập bị từ chối. Bạn không có quyền Admin.");
    return <Navigate to="/" replace />; 
  }

  // Nếu là Admin, cho phép truy cập nội dung
  return <Outlet />; 
};

export default AdminRoute;