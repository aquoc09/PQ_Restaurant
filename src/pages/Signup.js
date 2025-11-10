import React, { useState } from 'react';
import UserService from '../services/UserService';

const SignUp = () => {
  // ... (Phần state và hàm handle không đổi) ...
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    dob: '', 
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setLoading(true);

    try {
      await UserService.signup(formData); 
      
      setSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
      setFormData({ username: '', email: '', password: '', dob: '' }); 

    } catch (err) {
      const apiError = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(apiError);
      console.error('Sign Up Error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. Container ngoài cùng: Đảm bảo chiếm toàn bộ chiều cao màn hình và căn giữa nội dung
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* 2. Form Box: Căn giữa, thêm khoảng đệm lớn, và thêm lề trên/dưới nếu cần */}
      {/* Lớp 'my-auto' và 'py-12' (padding-y) đã giúp căn giữa và tạo khoảng cách */}
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        
        {/* Header Title */}
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Đăng ký tài khoản
        </h2>
        
        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* ... (Các input không đổi) ... */}
          <input
            name="username"
            type="text"
            required
            placeholder="Tên người dùng"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.username}
            onChange={handleChange}
          />
          
          <input
            name="email"
            type="email"
            required
            placeholder="Địa chỉ Email"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            required
            placeholder="Mật khẩu"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.password}
            onChange={handleChange}
          />

          <input
            name="dob"
            type="date"
            required
            placeholder="Ngày sinh"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.dob}
            onChange={handleChange}
          />

          {/* ... (Phần thông báo lỗi/thành công) ... */}
          {success && (
            <div className="text-green-600 text-sm text-center font-medium p-3 bg-green-50 rounded">
              {success}
            </div>
          )}
          {error && (
            <div className="text-red-600 text-sm text-center font-medium p-3 bg-red-50 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;