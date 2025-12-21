import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { jwtDecode } from 'jwt-decode';
import {useAuth} from '../hooks/useAuth'
import {useAuthContext} from '../context/AuthContext'
import { toast } from 'react-toastify';


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshAuthStatus } = useAuthContext();
  const { setAccessToken } = useAuth();
  const ROLE_ADMIN_STRING = "ROLE_ADMIN";
  const ROLE_USER_STRING = "ROLE_USER";


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await AuthService.login({ username, password });
      
      const { token, refreshToken } = response.data.result;

      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken); // Lưu Refresh Token
      setAccessToken(token);
      toast.success('Đăng nhập success!');

      const decodedToken = jwtDecode(token);
      const userScope = decodedToken?.scope?.trim() || '';

      
      // KIỂM TRA VAI TRÒ VÀ ĐIỀU HƯỚNG
      if (userScope === ROLE_ADMIN_STRING) {
        navigate('/admin');
      }
      else {
          navigate('/'); 
      }
      window.location.reload();

    } catch (err) {
      // Xử lý lỗi đăng nhập
      const apiError = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.';
      setError(apiError);
      console.error('Login Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Gọi API lấy URL đăng nhập Google từ Backend
      const response = await AuthService.getGoogleLoginUrl();
      
      // Backend trả về: ApiResponse có result là URL
      if (response && response.result) {
         // Chuyển hướng trình duyệt sang trang Google
         console.log("Redirecting to Google:", response.result);
         window.location.href = response.result;
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      toast.error("Không thể kết nối tới Google Login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Đăng nhập
        </h2>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

          <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {/* Google SVG Icon */}
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
            <Link 
                to="/forgot-password" 
                className="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800"
            >
                Bạn quên mật khẩu?
            </Link>
        </div>

        <div className="text-sm text-center mt-4">
          <span className="font-medium text-gray-600">
            Không có tài khoản?{' '}
          </span>
          <Link 
            to="/signup" 
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Đăng ký
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;