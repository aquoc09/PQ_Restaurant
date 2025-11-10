import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService'; // Giả định đường dẫn tới AuthService

// Constants for Role Names (nên định nghĩa cố định để tránh lỗi chính tả)
const ROLE_ADMIN = 'ADMIN';
const ROLE_USER = 'USER';

export const useAuth = () => {
    const navigate = useNavigate();

    // Hàm tiện ích để lấy vai trò từ Local Storage
    const getUserRoles = () => {
        const rolesJson = localStorage.getItem('userRoles');
        try {
            // Trả về mảng các vai trò (ví dụ: ["USER", "ADMIN"])
            return rolesJson ? JSON.parse(rolesJson) : [];
        } catch (e) {
            console.error("Lỗi khi phân tích JSON Roles:", e);
            return [];
        }
    };
    
    const userRoles = getUserRoles();
    
    // 1. Kiểm tra trạng thái đăng nhập (token có tồn tại không)
    const isAuthenticated = () => {
        return !!localStorage.getItem('accessToken');
    };

    // 2. Kiểm tra quyền Admin
    const isAdmin = () => {
        // Kiểm tra xem đã đăng nhập và có vai trò ADMIN không
        return isAuthenticated() && userRoles.includes(ROLE_ADMIN);
    };

    // 3. Kiểm tra quyền User thông thường
    const isUser = () => {
        // Trả về true nếu có vai trò USER
        return isAuthenticated() && userRoles.includes(ROLE_USER);
    };

    // 4. Hàm Đăng xuất
    const logout = async () => {
        // Lấy token hiện tại để gửi yêu cầu vô hiệu hóa (log-out) lên Back-end
        const token = localStorage.getItem('accessToken');
        
        // 1. Gửi yêu cầu vô hiệu hóa token lên Back-end
        if (token) {
            try {
                // Controller của bạn có endpoint POST /auth/log-out nhận vào TokenRequest
                await AuthService.logout({ token: token });
            } catch (error) {
                // Lỗi ở đây thường là do token đã hết hạn hoặc không hợp lệ. 
                // Ta vẫn tiếp tục xóa dữ liệu cục bộ.
                console.error("Lỗi khi gọi API Logout:", error);
            }
        }
        
        // 2. Xóa dữ liệu cục bộ
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRoles');

        // 3. Chuyển hướng về trang đăng nhập
        navigate('/login'); 
    };

    return { 
        isAuthenticated, 
        isAdmin, 
        isUser, 
        userRoles,
        logout 
    };
};

export default useAuth;