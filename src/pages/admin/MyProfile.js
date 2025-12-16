// src/components/MyProfile.jsx
import React, { useState, useEffect } from 'react';
import UserService from '../../services/UserService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const initialFormState = {
    id: null,
    username: '', // Hiển thị nhưng không cho sửa
    email: '',
    fullName: '',
    phone: '',
    dob: '', 
    gender: '', 
    role: '', 
    password: '', 
};

// Hàm chuyển đổi dob từ YYYY-MM-DD sang dd/MM/yyyy
const formatDobToBackend = (dob_yyyy_mm_dd) => {
    if (!dob_yyyy_mm_dd) return null;
    try {
        const [year, month, day] = dob_yyyy_mm_dd.split('-');
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dob_yyyy_mm_dd; // Trả về nguyên gốc nếu không đúng format YYYY-MM-DD
    }
};

function MyProfile() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(true);

    // --- Tải dữ liệu User hiện tại ---
    const fetchUserData = async () => {
        try {
            const currentUser = await UserService.getMyInfo();
            // Format DOB từ LocalDate (YYYY-MM-DD) sang chuỗi cho input type="date"
            const formattedDob = currentUser.dob || '';

            setFormData({
                id: currentUser.id,
                username: currentUser.username,
                email: currentUser.email,
                fullName: currentUser.fullName,
                phone: currentUser.phone,
                dob: formattedDob,
                gender: currentUser.gender,
                role: currentUser.role.name,
            });
        } catch (error) {
            toast.error("Không thể tải dữ liệu người dùng để sửa.");
            navigate('/admin');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchUserData();
    }, []);

    // --- Xử lý thay đổi Input ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // --- Xử lý Submit (Cập nhật) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // 1. Kiểm tra Mật khẩu
        const newPassword = formData.password;
        if (newPassword) {
            if (newPassword.length > 0 && newPassword.length < 8) {
                toast.error("Mật khẩu mới phải có tối thiểu 8 ký tự.");
                setLoading(false);
                return;
            }
        }
        
        // 2. Chuẩn bị UserUpdateRequest
        const dobBackendFormat = formatDobToBackend(formData.dob);

        // Tạo UserUpdateRequest (chỉ cần các trường cập nhật)
        // Chúng ta không gửi username và password qua đây.
        const userUpdateRequest = {
            email: formData.email,
            fullName: formData.fullName,
            phone: formData.phone,
            dob: dobBackendFormat, 
            gender: formData.gender,
            role: formData.role,
            password: newPassword
        };


        try {
            // Gọi API cập nhật User. Giả định BE trả về UserResponse trong .data.result
            const response = await UserService.updateUser(formData.id, userUpdateRequest);

            toast.success(`Cập nhật admin: ${response.name} success!`);
            navigate('/admin');
        } catch (error) {
            console.error("Lỗi khi Update User:", error);
            const errorMessage = error.response?.data?.message || "Cập nhật thất bại. Vui lòng kiểm tra lại dữ liệu.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className='p-6'>Đang tải dữ liệu người dùng...</div>;

    return (
        <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-primary shadow rounded-xl'>
            <h2 className='text-2xl font-bold mb-6'>Edit User: {formData.username}</h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

                <div className='col-span-1'>
                    <div className="mb-4">
                        <h5>Username</h5>
                        {/* Username chỉ được hiển thị, không cho sửa */}
                        <input type="text" 
                        value={formData.username} 
                        readOnly disabled 
                        className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg text-sm font-medium mt-1 w-full bg-gray-100 text-gray-500"/>
                    </div>
                    <div className="mb-4">
                        <h5>Email</h5>
                        <input type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} required 
                        className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
                        <input type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        placeholder='Để trống nếu không đổi' 
                        minLength={8} className="shadow border rounded w-full py-2 px-3"/>
                        <p className='text-xs text-gray-500 mt-1'>Tối thiểu 8 ký tự.</p>
                    </div>
                    
                    <div className="mb-4">
                        <h5>Gender</h5>
                        <select name="gender" 
                        value={formData.gender} 
                        onChange={handleInputChange} 
                        className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full">
                            <option value="M">Nam</option>
                            <option value="F">Nữ</option>
                            <option value="O">Khác</option>
                        </select>
                    </div>
                </div>

                <div className='col-span-1'>
                    <div className="mb-4">
                        <h5>FullName</h5>
                        <input type="text"
                         name="fullName" 
                         value={formData.fullName} 
                         onChange={handleInputChange} required 
                         className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"/>
                    </div>
                    <div className="mb-4">
                        <h5>Phone</h5>
                        <input type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"/>
                    </div>
                    <div className="mb-4">
                        <h5>Date of birth</h5>
                        <input type="date" 
                        name="dob" 
                        value={formData.dob} 
                        onChange={handleInputChange} 
                        required
                        className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"/>
                    </div>

                    <div className="mb-4">
                        <h5>Role</h5>
                        <select name="role" 
                        value={formData.role} 
                        onChange={handleInputChange} 
                        className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full">
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="MANAGER">MANAGER</option>
                        </select>
                    </div>
                </div>
                
                {/* Nút Submit */}
                <div className="col-span-2 flex justify-end gap-3 mt-4">
                    <button type="button" onClick={() => navigate('/admin/list-user')} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
                    <button type="submit" disabled={loading} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
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
}

export default MyProfile;