import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
// import DEFAULT_AVATAR_MAP from '../constants/avatarMapping';
import { myAssets } from "../assets/assets";

const UserButton = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const menuRef = useRef(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    
    // 💡 Lấy thông tin từ useAuth
    const { username, isAuthenticated, logout } = useAuth();
    
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
        navigate('/user/profile');
        setIsOpen(false); 
    };

    const handleLogoutClick = () => {
        setIsOpen(false); // Đóng dropdown
        setShowLogoutConfirm(true); // Hiển thị dialog
    };

    const confirmLogout = async () => {
        setShowLogoutConfirm(false); // Đóng dialog
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

    const cancelLogout = () => {
      setShowLogoutConfirm(false); // Hủy, đóng dialog
    };

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
                        <img src={myAssets.user} alt="User Avatar" className="w-8 h-8 rounded-full object-cover"/>
                        <span className="text-sm font-medium">{username || 'User'}</span>
                    </div>
                    
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                            <button onClick={handleEditProfile} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <span>⚙️</span> Edit Profile
                            </button>
                            <button onClick={handleLogoutClick} disabled={loading} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                {'Logout'}
                            </button>
                        </div>
                    </div>
                )}
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
                          Bạn có chắc chắn muốn "Đăng Xuất" không?
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

export default UserButton;