import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated()) {
    // Nếu chưa đăng nhập, chuyển hướng về trang login
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin()) {
    // Nếu đã đăng nhập nhưng KHÔNG phải Admin, chuyển hướng về trang chủ
    // (hoặc trang 403 Forbidden)
    alert("Truy cập bị từ chối. Bạn không có quyền Admin.");
    return <Navigate to="/" replace />; 
  }

  // Nếu là Admin, cho phép truy cập nội dung
  return <Outlet />; 
};

export default AdminRoute;