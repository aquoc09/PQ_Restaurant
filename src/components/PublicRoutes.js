import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; // Hoặc useAuthContext

const PublicRoute = () => {
  const { isAuthenticated } = useAuth(); 
  
  // Nếu người dùng ĐÃ đăng nhập, chuyển hướng họ về Trang chủ
  if (isAuthenticated()) {
    return <Navigate to="/" replace />; 
  }
  
  // Nếu CHƯA đăng nhập, cho phép truy cập trang Public (Login, Signup)
  return <Outlet />; 
};

export default PublicRoute;