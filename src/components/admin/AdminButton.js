import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import DEFAULT_AVATAR_MAP from '../../constants/avatarMapping';

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
          logout;
          navigate('/login');
        } catch (error) {
          console.error('Logout error:', error);
          setTimeout(() => navigate('/login'), 1500);
        } finally {
          setLoading(false);
        }
      };
    

    // 💡 Hàm xác định URL Avatar Mặc định (Chắc chắn là Admin)
    const getDefaultAvatar = () => {
        if (isAdmin()) {
            return DEFAULT_AVATAR_MAP['ROLE_ADMIN']; 
       }
    };

    const avatarUrl = getDefaultAvatar();

    return (
        <div className='w-full md:flex items-center gap-3 p-2 pl-5 lg:pl-10'> {/* Điều chỉnh layout cho phù hợp với Sidebar */}
            <div className="relative inline-block text-left w-full" ref={menuRef}>
                <button
                    type="button"
                    className="flex items-center justify-between gap-3 w-full px-3 py-1.5 rounded-lg hover:bg-gray-700 focus:outline-none transition-colors duration-150 text-white"
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={loading}
                >
                    {/* Avatar */}
                    <div className="flex items-center gap-3">
                        <img src={avatarUrl} alt="Admin Avatar" className="w-8 h-8 rounded-full object-cover"/>
                        <span className="text-sm font-medium">{username || 'Admin'}</span>
                    </div>
                    
                    {/* Icon Mũi tên */}
                    <svg /* ... (Icon) ... */ /> 
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute left-0 bottom-full mb-2 w-full bg-white rounded-lg shadow-xl z-50 ring-1 ring-black ring-opacity-5 origin-bottom-left">
                        <div className="py-1">
                            <button onClick={handleEditProfile} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <span>⚙️</span> Edit Profile
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button onClick={handleLogout} disabled={loading} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
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