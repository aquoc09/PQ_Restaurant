import React, { useState } from 'react';
import UserService from '../services/UserService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const initialFormState = {
    fullName: '',
    username: '',
    password: '',
    email: '',
    dob: '', 
    phone: '',
    gender: 'M',
    role: 'USER', 
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

function SignUp() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

// --- HÀM VALIDATION KIỂM TRA ĐẦU VÀO ---
    const validateForm = () => {
        let newErrors = {};
        let isValid = true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Ngày hiện tại
        const today = new Date();
        // Giới hạn ngày sinh tối thiểu 18 tuổi
        const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

        // username (Yêu cầu @Size min=5)
        if (!formData.username.trim()) {
            newErrors.username = "Username không được để trống.";
            isValid = false;
        } else if (formData.username.length < 5) {
            newErrors.username = "Username phải có ít nhất 5 ký tự.";
            isValid = false;
        }

        // password (Yêu cầu@Size min=8)
        if (!formData.password) {
            newErrors.password = "Mật khẩu không được để trống.";
            isValid = false;
        } else if (formData.password.length < 8) {
            newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
            isValid = false;
        }

        // email
        if (!formData.email) {
            newErrors.email = "Email không được để trống.";
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Email không hợp lệ.";
            isValid = false;
        }

        // dob (Yêu cầu min=18)
        if (!formData.dob) {
            newErrors.dob = "Ngày sinh không được để trống.";
            isValid = false;
        } else {
            const userDob = new Date(formData.dob);
            if (userDob > minDate) {
                newErrors.dob = "Người dùng phải đủ 18 tuổi trở lên.";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Vui lòng kiểm tra lại các trường bị lỗi.");
            return;
        }

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
            role: "USER",
        };

        try {
            const response = await UserService.createUser(userCreationRequest);
            if(response.code === 1000 ){
                toast.success(`Sign Up ${userCreationRequest.username} success!`);
                setTimeout(() => navigate('/login'), 3000); 
            }
            else {
                toast.error(`User ${userCreationRequest.username} has existed. Please use another username.`);
            }
        } catch (error) {
            console.error("Lỗi khi thêm người dùng:", error);
            const errorMessage = error.response?.data?.message || "Thêm người dùng thất bại. Vui lòng kiểm tra lại dữ liệu.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className=" min-h-[90vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="md:px-8 pt-20 pb-10 xl:py-15 m-1 sm:m-3 w-full lg:w-1/2 bg-primary shadow rounded-xl">    
            <h2 className='text-3xl mb-6 text-center font-extrabold text-gray-900'>Đăng Ký Tài Khoản</h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

                <div className='col-span-1'>
                    {/* Tên Đầy Đủ */}
                    <div className="mb-4">
                        <h5>FullName *</h5>
                        <input 
                        type="text" 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleInputChange} required 
                        className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"/>
                    </div>
                    
                    {/* Username */}
                    <div className="mb-4">
                        <h5>Username *</h5>
                        <input 
                        type="text" 
                        name="username"
                        value={formData.username} 
                        onChange={handleInputChange} required minLength={5} 
                        className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"/>
                        <p className='text-xs text-gray-500 mt-1'>Tối thiểu 5 ký tự.</p>
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <h5>Password *</h5>
                        <input type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleInputChange} required minLength={8} 
                        className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"/>
                        <p className='text-xs text-gray-500 mt-1'>Tối thiểu 8 ký tự.</p>
                    </div>
                    
                    {/* Email */}
                    <div className="mb-4">
                        <h5>Email *</h5>
                        <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} required 
                        className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"/>
                        {errors.email && <p className="text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    </div>
                <div className='col-span-1'>
                    {/* Ngày sinh */}
                    <div className="mb-4">
                        <h5>Ngày sinh (DOB)</h5>
                        <input 
                        type="date" 
                        name="dob" 
                        value={formData.dob} 
                        onChange={handleInputChange} 
                        className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"/>
                        <p className='text-xs text-red-500 mt-1'>*Cần trên 18 tuổi.</p>
                    </div>
                    
                    {/* Số điện thoại */}
                    <div className="mb-4">
                        <h5>Số điện thoại</h5>
                        <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"/>
                    </div>
                    
                    {/* Giới tính */}
                    <div className="mb-6">
                        <h5>Giới tính</h5>
                        <select 
                        name="gender" 
                        value={formData.gender} 
                        onChange={handleInputChange} 
                        className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full">
                            <option value="M">Nam</option>
                            <option value="F">Nữ</option>
                            <option value="O">Khác</option>
                        </select>
                    </div>
                </div>

                {/* Nút Đăng ký - nằm ở giữa (col-span-2) */}
                <button type="submit" disabled={loading} className="col-span-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50">
                    {loading ? 'Đang xử lý...' : 'Đăng Ký'}
                </button>
                
                {/* Dòng chữ "Đã có tài khoản" - nằm ở giữa (col-span-2) */}
                <div className='col-span-2 text-center mt-2 text-sm'>
                    Đã có tài khoản? <span onClick={() => setTimeout(() => navigate('/login'), 3000)} className='text-blue-600 font-bold cursor-pointer hover:underline'>Đăng nhập ngay</span>
                </div>
            </form>
        </div>
    </div>
    );
}

export default SignUp;