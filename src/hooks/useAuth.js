import {useCallback, useMemo, useState, useEffect}from 'react'
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AuthService from '../services/AuthService'; // Giả định đường dẫn tới AuthService
import { toast } from 'react-toastify';

// Constants for Role Names (nên định nghĩa cố định để tránh lỗi chính tả)
const ROLE_ADMIN_STRING = "ROLE_ADMIN";
const ROLE_USER_STRING = "ROLE_USER";
const ROLE_MANAGER_STRING = "ROLE_MANAGER";

// 1. Hàm giải mã token và lấy payload
const getDecodedToken = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        console.log("Token giải mã success:", decoded);
        return decoded;
    } catch (e) {
        // Lỗi giải mã thường xảy ra khi token bị hỏng hoặc không phải JWT
        console.error("Lỗi giải mã token:", e);
        localStorage.removeItem('accessToken');
        return null;
    }
};

export const useAuth = ()=> {
    const navigate = useNavigate();
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
    const decodedToken = useMemo(() => getDecodedToken(accessToken), [accessToken]);


    const userRoles = useMemo(() => {
        const scope = decodedToken?.scope;
        if (!scope) return [];
      
        if (Array.isArray(scope)) {
            return scope.map(r => r.toUpperCase());
        }

        return scope.toUpperCase().split(' ').map(r => r.trim()).filter(r => r.length > 0);
    }, [decodedToken]);
    
    // Kiểm tra trạng thái đăng nhập và hết hạn
    const isAuthenticated = useCallback(() => {
        if (!accessToken ||!decodedToken)
        {
            return false;
        }
        
        // exp là thời gian hết hạn dưới dạng Unix timestamp (giây)
        const currentTime = Date.now() / 1000;
        
        // Nếu token hết hạn, gọi logout cục bộ
        if (decodedToken.exp < currentTime) {
            //Gọi refresh backend
            return false; 
        }

        return true;
    }, [accessToken,decodedToken]);

    // Kiểm tra quyền (Sử dụng hàm includes để hỗ trợ Multi-Role)
    const hasRole = useCallback((role) => {
        return isAuthenticated() && userRoles.includes(role);
    }, [isAuthenticated, userRoles]);

    //Kiểm tra quyền Admin
    const isAdmin = useCallback(() => hasRole(ROLE_ADMIN_STRING), [hasRole]);
    // Kiểm tra quyền User
    const isUser = useCallback(() => hasRole(ROLE_USER_STRING), [hasRole]);
    // Kiểm tra quyền Manager
    const isManager = useCallback(() => hasRole(ROLE_MANAGER_STRING), [hasRole]);

    // Hàm Đăng xuất
    const logout = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        
        if (token) {
            try {
                // Gửi yêu cầu vô hiệu hóa token lên Back-end
                await AuthService.logout({ token: token });
                window.location.reload();
                toast.success("Đăng xuất thành công.");
            } catch (error) {
                // Ignore lỗi nếu token đã hết hạn ở phía server
                console.warn("Logout API failed (token có thể đã hết hạn), proceeding with local clear.", error);
            }
        }
        
        // Xóa tất cả dữ liệu xác thực
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAccessToken(null);
        
        // Chuyển hướng về trang đăng nhập
        setTimeout(() => navigate('/login'), 1000); 
    }, [navigate]);

    //Cơ chế lắng nghe sự kiện localStorage (để đồng bộ hóa giữa các tab)
    useEffect(() => {
        const handleStorageChange = () => {
            const currentToken = localStorage.getItem('accessToken');
            if (accessToken !== currentToken) {
                setAccessToken(currentToken);
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [accessToken]);

    console.log("Is Authenticated Value:", isAuthenticated());
    return { 
        isAuthenticated, 
        isAdmin,
        isUser,
        isManager,
        userRoles,
        hasRole,
        // Cung cấp các thông tin hữu ích từ token
        username: decodedToken?.sub, // Lấy từ trường "sub"
        issuedAt: decodedToken?.iat,
        expirationTime: decodedToken?.exp,
        logout,
        setAccessToken,
        
    };
};

export default useAuth;