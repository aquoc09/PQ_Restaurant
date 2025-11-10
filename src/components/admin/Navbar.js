import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/AdminService';

function AdminNavbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);
  const username = localStorage.getItem('username');

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await adminService.logout();
      localStorage.removeItem('adminToken');
      localStorage.removeItem('username');
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      setTimeout(() => navigate('/admin/login'), 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate('/admin/profile');
    setIsOpen(false);
  };

  return (
    <div className='w-full md:flex items-center gap-3 p-2 pl-5 lg:pl-10'>
      <div className="relative inline-block text-left w-full" ref={menuRef}>
        <button
          type="button"
          className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-gray-100 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
            {username ? username.charAt(0).toUpperCase() : 'A'}
          </div>
          <span className="text-sm text-gray-700">{username || 'Admin'}</span>
          <svg
            className={`w-3 h-3 text-gray-500 transform ${isOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <button
                onClick={handleEditProfile}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                {loading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminNavbar;
