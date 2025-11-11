import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
// import DEFAULT_AVATAR_MAP from '../../constants/avatarMapping';
import { myAssets } from "../../assets/assets";

const AdminButton = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const menuRef = useRef(null);
    
    // 💡 Lấy thông tin từ useAuth
    const { username, isAdmin, logout } = useAuth();
    
    // Logic đóng menu khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event) {
          if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsOpen(false);
          }
        }
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }, []);


    const handleEditProfile = () => {
        navigate('/admin/profile');
        setIsOpen(false); 
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
          logout();
          navigate('/login');
        } catch (error) {
          console.error('Logout error:', error);
          setTimeout(() => navigate('/login'), 1500);
        } finally {
          setLoading(false);
        }
      };
    

    // 💡 Hàm xác định URL Avatar Mặc định (Chắc chắn là Admin)
    // const getDefaultAvatar = () => {
    //     if (isAdmin()) {
    //         return DEFAULT_AVATAR_MAP['ROLE_ADMIN']; 
    //    }
    // };

    // const avatarUrl = getDefaultAvatar();

    return (
        <div className='w-full md:flex items-center gap-3 p-2 pl-5 lg:pl-10'> {/* Điều chỉnh layout cho phù hợp với Sidebar */}
            <div className="relative inline-block text-left w-full" ref={menuRef}>
                <button
                    type="button"
                    className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-gray-100 focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={loading}
                >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full text-black flex items-center justify-center font-semibold">
                        <img src={myAssets.admin} alt="Admin Avatar" className="w-8 h-8 rounded-full object-cover"/>
                        <span className="text-sm font-medium">{username || 'Admin'}</span>
                    </div>
                    
                    {/* Icon Mũi tên */}
                    {/* <svg className={`w-3 h-3 text-gray-500 transform ${isOpen ? 'rotate-180' : ''}`}
                    viewBox="0 15 25 25"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg> */}
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                            <button onClick={handleEditProfile} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <span>⚙️</span> Edit Profile
                            </button>
                            <button onClick={handleLogout} disabled={loading} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                {loading ? 'Logging out...' : 'Logout'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminButton;