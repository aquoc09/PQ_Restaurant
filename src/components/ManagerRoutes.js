import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ManagerRoute = () => {
  const { isAuthenticated, isManager } = useAuth();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isManager()) {
    alert("Truy cập bị từ chối. Bạn không có quyền Manager.");
    return <Navigate to="/" replace />; 
  }

  // Nếu là Admin, cho phép truy cập nội dung
  return <Outlet />; 
};

export default ManagerRoute;