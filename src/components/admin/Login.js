import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useUserContext } from '../../context/UserContext';
import AuthService from '../../services/AuthService';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await AuthService.login({ email, password });
      
      const { token, roles } = response.data.result; 
      
      // KIỂM TRA VAI TRÒ ĐỂ CHỈ CHO PHÉP ADMIN TIẾP TỤC
      if (!roles || !roles.includes('ADMIN')) {
          setError('Truy cập bị từ chối: Tài khoản không có quyền Admin.');
          setLoading(false);
          // KHÔNG lưu token nếu không phải admin, hoặc có thể log-out token ngay lập tức
          // (Cần gọi API logout nếu muốn vô hiệu hóa token đã tạo)
          return;
      }
      
      // Nếu là Admin, lưu Token và Vai trò
      localStorage.setItem('accessToken', token);
      localStorage.setItem('userRoles', JSON.stringify(roles));

      alert('Đăng nhập Admin thành công!');
      navigate('/admin/dashboard');

    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
      console.error('Admin Login Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
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
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? 'Logging in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;