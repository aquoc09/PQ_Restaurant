import React, { useState, useEffect, useRef} from 'react'
import useLogout from '../hooks/useLogout';
import { useNavigate } from 'react-router-dom';

function UserNavbar() {
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { performLogout, loading } = useLogout();
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsOpen(false);
            }
        }
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true); // Hiển thị dialog
    };

    const confirmLogout = async () => {
        setShowLogoutConfirm(false); // Đóng dialog
        await performLogout();
      };

    const cancelLogout = () => {
      setShowLogoutConfirm(false); // Hủy, đóng dialog
    };

  return (
    <div>
        <div classNameName="w-44 bg-white rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5">
            <ul className="flex flex-col border border-gray-500 rounded-md">
                <li className="flex items-center gap-2 text-white cursor-pointer px-3 py-1 rounded border-b border-gray-400">
                <button onClick={() => navigate('/user-profile')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">
                    <h5>My Profile</h5>
                </button>
                </li>
                <li className="flex items-center gap-2 text-white cursor-pointer px-3 py-1 rounded border-b border-gray-400" >
                <button onClick={() => navigate('/my-orders')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">
                    <h5>My Orders</h5>
                </button>
                </li>
                <li className="flex items-center gap-2 text-white cursor-pointer px-3 py-1 rounded border-b border-gray-400" >
                <button onClick={() => navigate('/user-address')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">
                    <h5>My Address</h5>
                </button>
                </li>
                <li className="flex items-center gap-2 text-white cursor-pointer px-3 py-1 rounded">
                <button onClick={handleLogoutClick} disabled={loading} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-200">
                    <h5>Logout</h5>
                </button>
                </li>
            </ul>
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
  )
}

export default UserNavbar
