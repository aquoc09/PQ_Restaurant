import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuth from './useAuth';

const useLogout = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [loading, setLoading] = useState(false);

    const performLogout = async () => {
        setLoading(true);
        try {
            // Xóa token, user data, v.v.
            logout();
            
            // Hiển thị thông báo thành công
            toast.success("Đăng xuất thành công!");
            
            // Chuyển hướng về login sau 500ms
            setTimeout(() => {
                setTimeout(() => navigate('/login'), 3000);
            }, 500);
        } catch (error) {
            console.error('Logout error:', error);
            toast.error("Lỗi khi đăng xuất. Vui lòng thử lại.");
            
            // Vẫn chuyển hướng về login dù có lỗi
            setTimeout(() => {
                setTimeout(() => navigate('/login'), 3000);
            }, 1500);
        } finally {
            setLoading(false);
        }
    };

    return { performLogout, loading };
};

export default useLogout;
