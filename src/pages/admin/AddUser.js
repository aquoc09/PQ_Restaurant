// src/components/AddUser.jsx
import React, { useState } from 'react';
import UserService from '../../services/UserService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const initialFormState = {
    username: '',
    password: '',
    email: '',
    fullName: '',
    phone: '',
    dob: '', // Ngày sinh, định dạng YYYY-MM-DD
    gender: 'MALE', // Giá trị mặc định
    role: 'USER', // Giá trị mặc định (ADMIN/USER)
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

function AddUser() {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const dobBackendFormat = formatDobToBackend(formData.dob);
        
        // Tạo UserCreationRequest
        const userCreationRequest = {
            email: formData.email,
            password: formData.password,
            username: formData.username,
            fullName: formData.fullName,
            phone: formData.phone,
            dob: dobBackendFormat, 
            gender: formData.gender,
            role: formData.role,
            dob: dobBackendFormat,
        };

        try {
            // Gọi API tạo User. Giả định BE trả về UserResponse trong .data.result
            const response = await UserService.createUser(userCreationRequest);
            // Lấy dữ liệu user mới tạo
            const newUser = response.result; 

            toast.success(`Thêm người dùng '${newUser.username}' thành công!`);
            navigate('/admin/list-user');
        } catch (error) {
            console.error("Lỗi khi thêm người dùng:", error);
            const errorMessage = error.response?.data?.message || "Thêm người dùng thất bại. Vui lòng kiểm tra lại dữ liệu.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-primary shadow rounded-xl'>
            <h2 className='text-2xl font-bold mb-6'>Add New User</h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

                <div className='col-span-1'>
                    <div className="mb-4">
                        <h5>Username</h5>
                        <input type="text" name="username" value={formData.username} onChange={handleInputChange} required className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"/>
                    </div>
                    <div className="mb-4">
                        <h5>Password</h5>
                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} required className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"/>
                    </div>
                    <div className="mb-4">
                        <h5>Email</h5>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"/>
                    </div>
                    <div className="mb-4">
                        <h5>Gender</h5>
                        <select name="gender" value={formData.gender} onChange={handleInputChange} className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full">
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                        </select>
                    </div>
                </div>

                <div className='col-span-1'>
                    <div className="mb-4">
                        <h5>Fullname</h5>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"/>
                    </div>
                    <div className="mb-4">
                        <h5>Phone</h5>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"/>
                    </div>
                    <div className="mb-4">
                        <h5>Date of birth</h5>
                        {/* Input type="date" sẽ tự động format YYYY-MM-DD */}
                        <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"/>
                    </div>

                    <div className="mb-4">
                        <h5>Role</h5>
                        <select name="role" value={formData.role} onChange={handleInputChange} className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full">
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </div>
                </div>
                
                {/* Nút Submit */}
                <div className="col-span-2 flex justify-end gap-3 mt-4">
                    <button type="button" onClick={() => navigate('/admin/list-user')} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
                    <button type="submit" disabled={loading} className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50">
                        {loading ? 'Adding...' : 'Add User'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddUser;