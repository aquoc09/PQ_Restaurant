// src/components/ViewUser.jsx
import React, { useState, useEffect } from 'react';
import UserService from '../../services/UserService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { myAssets } from '../../assets/assets';

function ViewUser() {
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
    const mapGenderToDescription = (genderCode) => {
        switch (genderCode) {
            case 'M':
                return 'Nam (Male)';
            case 'F':
                return 'Nữ (Female)';
            case 'O':
                return 'Khác (Other)';
            default:
                // Nếu BE trả về null, undefined, hoặc một đối tượng có thuộc tính name
                return (genderCode && genderCode.name) || 'N/A';
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
            if(message.code === 1000)
                toast.success(`Xóa người dùng ID: ${userId} success.`);
            else
                toast.error(`Xóa người dùng ID: ${userId} failed vì người dùng có giỏ hàng`);
            // Tải lại danh sách sau khi xóa
            fetchUsers(); 
        } catch (err) {
            console.error("Lỗi xóa người dùng:", err);
            toast.error(`Xóa người dùng failed vì người dùng đang có món ăn trong giỏ hàng`);
        }
    };
    
    // --- Xử lý Chuyển đổi Ngày sinh ---
    const formatDate = (dateString) => {
        if (!dateString) return '';
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
                    className='px-6 py-3 active:scale-95 transition bg-tertiary border-gray-500/20 text-black  font-medium rounded-full cursor-pointer flex justify-center items-center gap-2'>
                    Add User
                    <img src={myAssets.square_plus} alt="" />
                </button>
            </div>

            {/* Bảng Người Dùng */}
            <div className='flex flex-col gap-2 lg:w-full'>
                <div className='grid grid-cols-[0.5fr_1.5fr_1fr_2fr_1.5fr_1fr_1fr_1.5fr] items-center py-4 px-2 bg-solid text-white bold-14 sm:bold-15 mb-1 rounded-xl'>
                    <h5>STT</h5>
                    <h5>Fullname</h5>
                    <h5>Username</h5>
                    <h5>Email</h5>
                    <h5>Date of birth</h5>
                    <h5>Gender</h5>
                    <h5>Role</h5>
                    <h5>Action</h5>
                </div>

                {users.length === 0 ? (
                    <p className='p-4 text-center'>Không có người dùng nào.</p>
                ) : (
                    users.map((user, index) => (
                        <div key={user.id} className='grid grid-cols-[0.5fr_1.5fr_1fr_2fr_1.5fr_1fr_1fr_1.5fr] items-center gap-2 p-2 bg-white rounded-lg' >
                            <h5 className='font-semibold'>{index + 1}</h5>

                            <h5 className=' font-semibold line-clamp-2'>{user.fullName}</h5>
                            
                            {/* Username */}
                            <h5 className='font-bold'>{user.username}</h5>

                            {/* Email */}
                            <h5 className='font-bold'>{user.email}</h5>

                            {/* Date of birth */}
                            <h5 className='font-semibold'>{formatDate(user.dob)}</h5>
                            
                            {/* Giới tính */}
                            <h5 className='font-bold'>{mapGenderToDescription(user.gender)}</h5>

                            {/* Vai trò */}
                            <h5 className={` font-bold ${user.role.name === 'ADMIN' ? 'text-red-600' : 'text-yellow-600'}`}>{user.role.name}</h5>
                            
                            {/* Hành động */}
                            <div>
                                <button 
                                    onClick={() => navigate(`/admin/edit-user/${user.id}`)} 
                                    className='inline-flex items-center justify-center rounded-md font-medium transition duration-150 hover:bg-blue-200 text-white px-2 py-1 text-sm'
                                >
                                    <img src={myAssets.edit} alt="" className='max-h-20 max-w-20 object-contain' />
                                </button>
                                <button 
                                    onClick={() => handleDeleteUser(user.id)} 
                                    className='inline-flex items-center justify-center rounded-md font-medium transition duration-150 hover:bg-red-200 text-white px-2 py-1 text-sm ml-2'
                                >
                                    <img src={myAssets.trash} alt="" className='max-h-20 max-w-20 object-contain' />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
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

export default ViewUser;