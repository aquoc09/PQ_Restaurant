// src/components/auth/SignUp.jsx
import React, { useState } from 'react';
import UserService from '../services/UserService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const initialFormState = {
    fullName: '',
    username: '',
    password: '',
    email: '',
    dob: '', // Định dạng dự kiến là YYYY-MM-DD
    phone: '',
    gender: 'MALE', // Giá trị mặc định
};

function SignUp() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Hàm chuyển đổi dob từ YYYY-MM-DD sang dd/MM/yyyy
    // Đây là BẮT BUỘC vì BE yêu cầu định dạng "dd/MM/yyyy" trong @JsonFormat
    const formatDobToBackend = (dob_yyyy_mm_dd) => {
        if (!dob_yyyy_mm_dd) return null;
        const [year, month, day] = dob_yyyy_mm_dd.split('-');
        return `${day}/${month}/${year}`;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const dobBackendFormat = formatDobToBackend(formData.dob);
        
        // Chuẩn bị UserCreationRequest
        const userCreationRequest = {
            fullName: formData.fullName,
            username: formData.username,
            password: formData.password,
            email: formData.email,
            dob: dobBackendFormat, // ĐÃ FORMAT LẠI CHO BE
            phone: formData.phone,
            gender: formData.gender,
            // role sẽ được BE mặc định là USER, không cần gửi
        };

        try {
            // Gọi API tạo User
            const response = await UserService.createUser(userCreationRequest);
            const newUser = response.result; 

            toast.success(`Đăng ký tài khoản '${newUser.username}' thành công! Vui lòng đăng nhập.`);
            
            // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
            navigate('/login'); 
            
        } catch (error) {
            console.error("Lỗi khi đăng ký:", error);
            
            // Xử lý thông báo lỗi chi tiết từ BE (nếu có)
            const beError = error.response?.data?.message || error.response?.data?.result?.message;
            let errorMessage = "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
            
            if (beError) {
                // Hiển thị thông báo lỗi cụ thể từ BE (ví dụ: INVALID_USERNAME, INVALID_PASSWORD)
                errorMessage = beError.includes("BLANK_DATA") ? "Vui lòng điền đủ các trường bắt buộc." : beError;
            }
            
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='p-8 bg-white shadow rounded-xl max-w-md mx-auto my-10'>
            <h2 className='text-3xl font-bold mb-6 text-center text-blue-600'>Đăng Ký Tài Khoản</h2>
            
            <form onSubmit={handleSubmit}>
                {/* Tên Đầy Đủ */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Tên Đầy Đủ *</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="shadow border rounded w-full py-2 px-3"/>
                </div>
                
                {/* Username */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Tên Đăng Nhập (Username) *</label>
                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} required minLength={5} className="shadow border rounded w-full py-2 px-3"/>
                    <p className='text-xs text-gray-500 mt-1'>Tối thiểu 5 ký tự.</p>
                </div>

                {/* Password */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Mật Khẩu *</label>
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} required minLength={8} className="shadow border rounded w-full py-2 px-3"/>
                    <p className='text-xs text-gray-500 mt-1'>Tối thiểu 8 ký tự.</p>
                </div>
                
                {/* Email */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="shadow border rounded w-full py-2 px-3"/>
                </div>

                <h4 className='font-bold mt-6 mb-3 border-t pt-3'>Thông tin Thêm (Không bắt buộc)</h4>

                {/* Ngày sinh */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Ngày sinh (DOB)</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="shadow border rounded w-full py-2 px-3"/>
                    <p className='text-xs text-red-500 mt-1'>*Cần trên 18 tuổi.</p>
                </div>
                
                {/* Số điện thoại */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Số điện thoại</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="shadow border rounded w-full py-2 px-3"/>
                </div>
                
                {/* Giới tính */}
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Giới tính</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="shadow border rounded w-full py-2 px-3">
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                    </select>
                </div>

                {/* Nút Đăng ký */}
                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50">
                    {loading ? 'Đang xử lý...' : 'Đăng Ký'}
                </button>
                
                <div className='text-center mt-4 text-sm'>
                    Đã có tài khoản? <span onClick={() => navigate('/login')} className='text-blue-600 font-bold cursor-pointer hover:underline'>Đăng nhập ngay</span>
                </div>
            </form>
        </div>
    );
}

export default SignUp;