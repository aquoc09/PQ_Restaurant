import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; // Sử dụng hook đã viết
import { OrderProvider } from '../context/OrderContext';
import { toast } from 'react-toastify'

const UserRoute = () => {
  const { isAuthenticated } = useAuth();
  
  // Nếu người dùng CHƯA đăng nhập, chuyển hướng họ đến trang /login
  if (!isAuthenticated()) {
    toast.error("Vui lòng đăng nhập để để sử dụng tính năng.");
    return <Navigate to="/login" replace />;
  }
  
  // Nếu người dùng ĐÃ đăng nhập, cho phép truy cập nội dung
  return (
      <OrderProvider>
        <Outlet /> 
      </OrderProvider>
  ); 
};

export default UserRoute;