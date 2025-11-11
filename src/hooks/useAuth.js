import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AuthService from '../services/AuthService'; // Giả định đường dẫn tới AuthService

// Constants for Role Names (nên định nghĩa cố định để tránh lỗi chính tả)
const ROLE_ADMIN_STRING = "ROLE_ADMIN";
const ROLE_USER_STRING = "ROLE_USER";
const ROLE_MANAGER_STRING = "ROLE_MANAGER";

export const useAuth = ()=> {
    const navigate = useNavigate();

    // 1. Hàm giải mã token và lấy payload
    const getDecodedToken = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return null;
        try {
            const decoded = jwtDecode(token);
            return decoded;
        } catch (e) {
            // Lỗi giải mã thường xảy ra khi token bị hỏng hoặc không phải JWT
            console.error("Lỗi giải mã token:", e);
            return null;
        }
    };
    
    const decodedToken = getDecodedToken();

    // Lấy Role từ trường "scope" (Giả định là chuỗi "ROLE_USER" hoặc "ROLE_ADMIN")
    const userScope = decodedToken?.scope?.trim() || '';
    
    // Chuyển đổi Scope thành mảng để tương thích với hàm includes()
    const userRoles = Array.isArray(userScope) ? userScope : [userScope];
    
    // 2. Kiểm tra trạng thái đăng nhập và hết hạn
    const isAuthenticated = () => {
        if (!decodedToken) return false;
        
        // exp là thời gian hết hạn dưới dạng Unix timestamp (giây)
        const currentTime = Date.now() / 1000;
        
        // Nếu token hết hạn, gọi logout cục bộ
        if (decodedToken.exp < currentTime) {
            // console.warn("Access Token đã hết hạn.");
            // Lưu ý: Logic Refresh Token được xử lý trong api.js Interceptor
            // Nếu Interceptor không xử lý được, người dùng sẽ bị đăng xuất.
            return false; 
        }

        return true;
    };

    // 3. Kiểm tra quyền Admin
    const isAdmin = () => {
        return isAuthenticated() && userScope === ROLE_ADMIN_STRING;
    };
    // Kiểm tra quyền User
    const isUser = () => {
        // Trả về true nếu đã đăng nhập và có vai trò ROLE_USER
        return isAuthenticated() && userScope === ROLE_USER_STRING;
    };
    // Kiểm tra quyền Manager
    const isManager = () => {
        return isAuthenticated() && userScope === ROLE_MANAGER_STRING;
    };

    // 4. Hàm Đăng xuất
    const logout = async () => {
        const token = localStorage.getItem('accessToken');
        
        if (token) {
            try {
                // Gửi yêu cầu vô hiệu hóa token lên Back-end
                await AuthService.logout({ token: token });
            } catch (error) {
                // Ignore lỗi nếu token đã hết hạn ở phía server
                console.warn("Logout API failed (token có thể đã hết hạn), proceeding with local clear.", error);
            }
        }
        
        // Xóa tất cả dữ liệu xác thực
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Chuyển hướng về trang đăng nhập
        navigate('/login'); 
    };

    return { 
        isAuthenticated, 
        isAdmin,
        isUser,
        isManager,
        userRoles,
        // Cung cấp các thông tin hữu ích từ token
        username: decodedToken?.sub, // Lấy từ trường "sub"
        issuedAt: decodedToken?.iat,
        expirationTime: decodedToken?.exp,
        logout 
    };
};

export default useAuth;