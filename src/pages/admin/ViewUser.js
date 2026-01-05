// src/components/ViewUser.jsx
import React, { useState, useEffect } from 'react';
import UserService from '../../services/UserService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { myAssets } from '../../assets/assets';

function ViewUser() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const fetchUsers = async () => {
        setLoading(true);
        try {
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
                return (genderCode && genderCode.name) || 'N/A';
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // --- Logic Phân trang ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUser = users.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(users.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // --- Xử lý Xóa User ---
    const handleDeleteUser = async (userId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng ID: ${userId} không?`)) {
            return;
        }
        try {
            const message = await UserService.deleteUser(userId);
            if(message.code === 1000)
                toast.success(`Xóa người dùng ID: ${userId} success.`);
            else
                toast.error(`Xóa người dùng ID: ${userId} failed vì người dùng có giỏ hàng`);
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
        <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-slate-50 shadow rounded-xl'>
            <div className='flex justify-between items-center mb-6'> 
                <h2 className='text-2xl font-bold'>User Management</h2>
                
                {/* Nút thêm mới */}
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

                {currentUser.length === 0 ? (
                    <p className='p-4 text-center'>Không có người dùng nào.</p>
                ) : (
                    currentUser.map((user, index) => (
                        <div key={user.id} className='grid grid-cols-[0.5fr_1.5fr_1fr_2fr_1.5fr_1fr_1fr_1.5fr] items-center gap-2 p-2 bg-white rounded-lg' >
                            <h5 className='font-semibold'>{(currentPage - 1) * itemsPerPage + index + 1}</h5>

                            <h5 className=' font-semibold line-clamp-2'>{user.fullName}</h5>
                            
                            {/* Username */}
                            <h5 className='font-bold'>{user.username}</h5>

                            {/* Email */}
                            <p className='font-bold'>{user.email}</p>

                            {/* Date of birth */}
                            <p className='font-semibold'>{formatDate(user.dob)}</p>
                            
                            {/* Giới tính */}
                            <p className='font-bold'>{mapGenderToDescription(user.gender)}</p>

                            {/* Vai trò */}
                            <h5 className={` font-bold ${user.role.name === 'ADMIN' ? 'text-red-600' : 'text-yellow-600'}`}>{user.role.name}</h5>
                            
                            {/* Hành động */}
                            <div className='py-2.5 flex items-center gap-2'>
                                <button 
                                    onClick={() => navigate(`/admin/edit-user/${user.id}`)} 
                                    className='inline-flex items-center justify-center rounded-md font-medium transition duration-150 hover:bg-blue-200 text-white px-2 py-1 text-sm'
                                >
                                    <img src={myAssets.edit} alt="" className='max-h-20 max-w-20 object-contain' />
                                </button>
                                <button 
                                    onClick={() => handleDeleteUser(user.id)} 
                                    className='inline-flex items-center justify-center rounded-md font-medium transition duration-150 hover:bg-red-200 text-white px-2 py-1 text-sm'
                                >
                                    <img src={myAssets.trash} alt="" className='max-h-20 max-w-20 object-contain' />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {users.length > itemsPerPage && (
                <div className="flex justify-end mt-4 gap-2">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg border text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                            currentPage === 1 
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                            : "bg-white text-gray-700 hover:bg-blue-100 border-gray-300"
                        }`}
                    >
                        &laquo; Trước
                    </button>
                    
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => paginate(i + 1)}
                            className={`px-4 py-2 rounded border text-sm transition-all ${
                                currentPage === i + 1
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 hover:bg-blue-100 border-gray-300"
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                            currentPage === totalPages 
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                            : "bg-white text-gray-700 hover:bg-blue-100 border-gray-300"
                        }`}
                    >
                        Sau &raquo;
                    </button>
                </div>
            )}
        </div>
    );
}

export default ViewUser;