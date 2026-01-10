import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import useAuth from './useAuth';

const useLogout = () => {
    const { logout } = useAuth();
    const [loading, setLoading] = useState(false);

    const performLogout = useCallback(async () => {
        setLoading(true);
        try {
            // Xóa token, user data, v.v.
            await logout();

        } catch (error) {
            console.error('Logout error:', error);
            toast.error("Lỗi khi đăng xuất. Vui lòng thử lại.");
            
            // Vẫn chuyển hướng về login dù có lỗi
            window.location.href = '/login';
        } finally {
            setLoading(false);
        }
    }, [logout]);

    return { performLogout, loading };
};

export default useLogout;
