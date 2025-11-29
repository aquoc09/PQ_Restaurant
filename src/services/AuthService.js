import axios from 'axios';
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
    }
};

export default AuthService;