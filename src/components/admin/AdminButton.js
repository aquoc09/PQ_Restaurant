import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
// import DEFAULT_AVATAR_MAP from '../../constants/avatarMapping';
import { myAssets } from "../../assets/assets";

const AdminButton = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { username, logout } = useAuth();

    const handleEditProfile = () => {
        navigate('/admin/my-profile');
    };

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        setShowLogoutConfirm(false);
        setLoading(true);
        try {
          logout();
          setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
          console.error('Logout error:', error);
          setTimeout(() => navigate('/login'), 3000);
        } finally {
          setLoading(false);
        }
    };

    const cancelLogout = () => {
    setShowLogoutConfirm(false); // Hủy, đóng dialog
    };

    return (
        <div className='w-full md:flex items-center gap-3 p-2 pl-5 lg:pl-10'>
            <div className="relative inline-block text-center w-full group z-50"> 
                <button
                    type="button"
                    className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-gray-100 focus:outline-none"
                    disabled={loading}
                >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full text-black flex items-center justify-center font-semibold">
                        <img src={myAssets.admin} alt="Admin Avatar" className="w-8 h-8 rounded-full object-cover"/>
                    </div>
                    <h5 className='text-black'>{username || 'Admin'}</h5>
                </button>

                {/* Dropdown Menu*/}
                <div 
                    className="absolute right-0 w-40 bg-white rounded-md shadow-lg 
                                ring-1 ring-black ring-opacity-5 top-full -mt-1
                                invisible opacity-0 
                                group-hover:visible group-hover:opacity-100
                                pointer-events-none group-hover:pointer-events-auto" 
                >
                    <div className="dropdown-arrow absolute"></div>
                    <ul className="flex flex-col py-1">
                        <li>
                            <button onClick={()=> navigate('/')} className="w-full text-center px-3 py-3 text-sm text-gray-700 hover:bg-gray-200">
                                <h5>Front End</h5>
                            </button>
                        </li>
                        <li>
                            <button onClick={handleEditProfile} className="w-full text-center px-3 py-3 text-sm text-gray-700 hover:bg-gray-200">
                                <h5>My Profile</h5>
                            </button>
                        </li>
                        <li>
                            <button onClick={handleLogoutClick} disabled={loading} className="w-full text-center px-3 py-3 text-sm text-red-600 hover:bg-red-200">
                                <h5>Logout</h5>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Logout Confirmation Dialog */}
            {showLogoutConfirm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[100] 
            flex items-center justify-center" onClick={cancelLogout}>
                <div 
                    className="p-5 border w-96 shadow-lg rounded-md bg-white"
                    onClick={e => e.stopPropagation()} // Ngăn chặn đóng khi click vào dialog
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Xác nhận Đăng Xuất</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Bạn có chắc chắn muốn "Đăng Xuất" khỏi hệ thống không?
                    </p>
                    
                    <div className="flex justify-end space-x-3">
                        {/* Nút KHÔNG */}
                        <button 
                            onClick={cancelLogout}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                        >
                            Không
                        </button>
                        {/* Nút ĐĂNG XUẤT */}
                        <button 
                            onClick={confirmLogout}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng Xuất'}
                        </button>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};

export default AdminButton;