import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthService from '../services/AuthService';
const ForgotPassword = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Logic Gửi Yêu cầu Đặt lại Mật khẩu (Bạn cần thay thế bằng API call thực tế)
        try {
            const response = await AuthService.forgotPassword({
                username: formData.username,
                email: formData.email
            });
            
            const { data } = response;
            if (data.code === 1000) {
                if (data.result === true) {
                    // THÀNH CÔNG: result: true
                    toast.success("Đặt lại mật khẩu thành công. Vui lòng kiểm tra email của bạn!");
                    // Chuyển hướng về trang login sau 3 giây
                    setTimeout(() => navigate('/login'), 3000); 
                } else {
                    // THẤT BẠI LOGIC: code 1000 nhưng result: false
                    toast.error("Vui lòng kiểm tra lại username hoặc email.");
                }
            } else {
                // Lỗi API (Không phải code 1000)
                toast.error("Hệ thống gặp lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.");
            }

        } catch (error) {
            console.error("Lỗi yêu cầu đặt lại mật khẩu:", error.response || error);
            
            // Xử lý lỗi HTTP (4xx, 5xx) hoặc lỗi mạng
            const errorMessage = error.response?.data?.message || 'Kết nối thất bại hoặc lỗi server.';
            toast.error(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Quên Mật Khẩu</h2>
                <p className="text-gray-600 mb-6 text-center">
                    Nhập Username và Email của bạn để nhận Email đặt lại mật khẩu.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="username"
                            type="text"
                            name="username"
                            placeholder="Tên đăng nhập"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Địa chỉ Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 w-full"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Đang gửi...' : 'Đặt lại Mật khẩu'}
                        </button>
                    </div>
                    
                    <div className="text-center mt-4">
                        <Link to="/login" className="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800">
                            Quay lại Đăng nhập
                        </Link>
                    </div>
                </form>
            </div>
            {/* ToastContainer phải có để hiển thị toast */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </div>
    );
};

export default ForgotPassword;