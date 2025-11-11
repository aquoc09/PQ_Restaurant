import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { jwtDecode } from 'jwt-decode';
import {useAuth} from '../hooks/useAuth'
import {useAuthContext} from '../context/AuthContext'


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshAuthStatus } = useAuthContext();
  const ROLE_ADMIN_STRING = "ROLE_ADMIN";
  const ROLE_USER_STRING = "ROLE_USER";


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await AuthService.login({ username, password });
      
      // Giả định API trả về { token: "...", roles: ["USER", "ADMIN"] }
      const { token, refreshToken } = response.data.result; // Nhớ lấy refreshToken
      
      // 1. Lưu Token và Vai trò vào Local Storage
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken); // Lưu Refresh Token
      refreshAuthStatus();
      alert('Đăng nhập thành công!');

      const decodedToken = jwtDecode(token);
      const userScope = decodedToken?.scope?.trim() || '';

      
      // 2. KIỂM TRA VAI TRÒ VÀ ĐIỀU HƯỚNG
      if (userScope === ROLE_ADMIN_STRING) {
        navigate('/admin');
      }
      else {
          navigate('/'); 
      }

    } catch (err) {
      // Xử lý lỗi đăng nhập
      const apiError = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.';
      setError(apiError);
      console.error('Login Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Đăng nhập
        </h2>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* ... (Các input email/password không đổi) ... */}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Mật khẩu</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          {error && (
            <div className="text-red-600 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </div>
        </form>

        {/* PHẦN ĐƯỜNG DẪN MỚI */}
        <div className="text-sm text-center mt-6">
          <span className="font-medium text-gray-600">
            Không có tài khoản?{' '}
          </span>
          <Link 
            // Giả sử đường dẫn (route) của trang SignUp là "/signup"
            to="/signup" 
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Đăng ký
          </Link>
        </div>
        {/* KẾT THÚC PHẦN ĐƯỜNG DẪN MỚI */}

      </div>
    </div>
  );
};

export default Login;