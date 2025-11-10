import axios from "axios";
import AuthService from "../services/AuthService";

const api = axios.create({
  baseURL: "http://localhost:8084/web_order", // Spring Boot backend
  headers: {
    "Content-Type": "application/json",
  },
});
let isRefreshing = false;
let failedQueue = [];

// Hàm xử lý các yêu cầu bị lỗi trong khi chờ token mới
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ... Interceptor Request (đã có) ...

// 🆕 Interceptor Response để xử lý 401 Unauthorized và Refresh Token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 1. Kiểm tra lỗi 401 và nếu request chưa được thử lại
    if (error.response.status === 401 && !originalRequest._retry) {
      // 2. Nếu đang chờ token mới, thêm request vào hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true; // Đánh dấu đã thử lại
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken'); // 💡 Cần lưu Refresh Token khi Login

      if (!refreshToken) {
        // Không có Refresh Token, đăng xuất
        isRefreshing = false;
        // Chuyển hướng về trang đăng nhập
        window.location.href = '/login'; 
        return Promise.reject(error);
      }

      try {
        // 3. Gọi API Refresh Token
        const rs = await AuthService.refreshToken({ token: refreshToken });
        const { token: newAccessToken, refreshToken: newRefreshToken } = rs.data.result;

        // 4. Lưu Token mới
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken); // Nếu API trả về Refresh Token mới

        // 5. Cập nhật header cho các request đang chờ và request hiện tại
        api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        processQueue(null, newAccessToken);
        
        // 6. Thử lại request ban đầu
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        return api(originalRequest);

      } catch (_error) {
        // 7. Lỗi Refresh Token (ví dụ: Refresh Token hết hạn)
        processQueue(_error, null);
        localStorage.clear(); // Xóa tất cả token
        window.location.href = '/login'; // Chuyển hướng đăng nhập lại
        return Promise.reject(_error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export default api;