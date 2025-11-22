// src/components/ListUser.jsx
import React, { useState, useEffect } from 'react';
import UserService from '../../services/UserService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { myAssets } from '../../assets/assets';

function ListUser() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Gọi hàm getAllUsers từ UserService
            const data = await UserService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách người dùng:", error);
            toast.error("Không thể tải danh sách người dùng.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // --- Xử lý Xóa User ---
    const handleDeleteUser = async (userId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng ID: ${userId} không?`)) {
            return;
        }
        try {
            // Gọi hàm deleteUser từ UserService
            const message = await UserService.deleteUser(userId);
            toast.success(message || `Xóa người dùng ID: ${userId} thành công.`);
            // Tải lại danh sách sau khi xóa
            fetchUsers(); 
        } catch (err) {
            console.error("Lỗi xóa người dùng:", err);
            toast.error('Lỗi xóa người dùng. Vui lòng thử lại.');
        }
    };
    
    // --- Xử lý Chuyển đổi Ngày sinh ---
    // Giả định dob là chuỗi ISO 8601 (ví dụ: "2000-01-01")
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
             // Tách thành yyyy/mm/dd
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        } catch (error) {
            return dateString; // Trả về nguyên gốc nếu parsing lỗi
        }
    };


    if (loading) return <div className='p-6'>Đang tải danh sách người dùng...</div>;

    return (
        <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-primary shadow rounded-xl'>
            <div className='flex justify-between items-center mb-6'> 
                <h2 className='text-2xl font-bold'>User Management</h2>
                
                {/* Nút thêm mới (Giả sử Admin có thể thêm User) */}
                <button 
                    onClick={() => navigate("/admin/add-user")} 
                    className='px-6 py-3 active:scale-95 transition bg-tertiary border-gray-500/20 text-black text-sm font-medium rounded-full cursor-pointer flex justify-center items-center gap-2'>
                    Add New User
                    <img src={myAssets.square_plus} alt="" />
                </button>
            </div>

            {/* Bảng Người Dùng */}
            <div className='flex flex-col gap-2 lg:w-full'>
                <div className='grid grid-cols-[0.5fr_1.5fr_1.5fr_1fr_1fr_1.5fr_1fr_1fr] items-center py-4 px-2 bg-solid text-white bold-14 sm:bold-15 mb-1 rounded-xl'>
                    <h5>STT</h5>
                    <h5>Fullname</h5>
                    <h5>Username</h5>
                    <h5>Email</h5>
                    <h5>Phone</h5>
                    <h5>Date of birth</h5>
                    <h5>Gender</h5>
                    <h5>Action</h5>
                </div>

                {users.length === 0 ? (
                    <p className='p-4 text-center'>Không có người dùng nào.</p>
                ) : (
                    users.map((user) => (
                        <div key={user.id} className='grid grid-cols-[0.5fr_1.5fr_1.5fr_1fr_1fr_1.5fr_1fr_1fr] items-center gap-2 p-2 bg-gray-50 rounded-lg' >
                            <p className='text-sm font-semibold'>{user.id}</p>
                            <h5 className='text-sm font-semibold line-clamp-2'>{user.fullName}</h5>
                            
                            {/* Username */}
                            <p className='text-xs font-bold'>{user.username}</p>

                            {/* Email */}
                            <p className='text-xs font-bold'>{user.email}</p>

                            {/* Phone */}
                            <p className='text-xs font-semibold'>{user.phone}</p>

                            {/* Date of birth */}
                            <p className='text-xs font-semibold'>{formatDate(user.dob)}</p>
                            
                            {/* Giới tính */}
                            <p className='text-sm'>{user.gender}</p>

                            {/* Vai trò */}
                            <p className={`text-sm font-bold ${user.role === 'ADMIN' ? 'text-red-600' : 'text-green-600'}`}>{user.role}</p>
                            
                            {/* Hành động */}
                            <div>
                                <button 
                                    onClick={() => navigate(`/admin/edit-user/${user.id}`)} 
                                    className='text-indigo-600 hover:text-indigo-900 mr-3'
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDeleteUser(user.id)} 
                                    className='text-red-600 hover:text-red-900'
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ListUser;