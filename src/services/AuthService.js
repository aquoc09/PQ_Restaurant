import api from '../api/api';   

const AUTH_API_URL = '/auth';

const AuthService = {
    // Endpoint Đăng nhập
    login: (credentials) => {
        return api.post(`${AUTH_API_URL}/log-in`, credentials); 
    },
    
    // Endpoint Đăng ký
    signup: (userData) => {
        return api.post(`${AUTH_API_URL}/signup`, userData); 
    },

    // Endpoint Đăng xuất
    logout: (tokenRequest) => {
        
        return api.post(`${AUTH_API_URL}/log-out`, tokenRequest);
    },

    // Endpoint Làm mới Token (Refresh Token)
    refreshToken: (refreshRequest) => {
        // refreshRequest sẽ chứa Refresh Token cũ
        return api.post(`http://localhost:8084/web_order/auth/refresh`, refreshRequest);
    },
    
    // Endpoint Quên mật khẩu (Forgot Password)
    forgotPassword: (forgotPasswordRequest) => {
        // forgotPasswordRequest thường chứa email hoặc username
        return api.post(`${AUTH_API_URL}/forgot-passwd`, forgotPasswordRequest);
    },
    getGoogleLoginUrl: async () => {
        try {
            // Vì bên Java dùng @PostMapping nên ở đây dùng api.post
            // Nếu bạn không gửi body, có thể để object rỗng {}
            const response = await api.post(`${AUTH_API_URL}/log-in/google`);
            return response.data;
        } catch (error) {
            console.error("Error fetching Google login URL:", error);
            throw error;
        }
    },
};

export default AuthService;