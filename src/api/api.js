import axios from "axios";
import AuthService from "../services/AuthService";

const api = axios.create({
  baseURL: "http://localhost:8084/web_order",
  headers: {
    "Content-Type": "application/json",
    
  },
});
let isRefreshing = false;
let failedQueue = [];

// Hàm xử lý các yêu cầu bị lỗi trong khi chờ token mới
const processQueue = (token) => {
  failedQueue.forEach(prom => {
    prom.originalRequest.headers['Authorization'] = 'Bearer ' + token;
    prom.resolve(api(prom.originalRequest));
  });
  failedQueue = [];
};

// Hàm này dùng để hủy các request nếu quá trình refresh thất bại
const failQueue = (error) => {
    failedQueue.forEach(prom => {
        prom.reject(error);
    });
    failedQueue = [];
};

// ... Interceptor Request (đã có) ...
api.interceptors.request.use((config) => {

        const token = localStorage.getItem('accessToken');

        if (token) {
            // Gắn token vào Header theo chuẩn Bearer
            config.headers.Authorization = `Bearer ${token}`; 
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor Response để xử lý 401 Unauthorized và Refresh Token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Kiểm tra lỗi 401 và nếu request chưa được thử lại
    if (error.response?.status === 401 && !originalRequest._retry) {

        if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, originalRequest });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Lấy Refresh Token ngay lập tức
      const refreshToken = localStorage.getItem('refreshToken');

      // Không có Refresh Token: Đăng xuất cứng
      if (!refreshToken) {
          isRefreshing = false;
          failQueue(error);
          localStorage.clear();
          console.warn("Không có Refresh Token. Đăng xuất.");
          return Promise.reject(error);
      }

      try {
        // Gọi API Refresh Token
        const refreshResponse = await AuthService.refreshToken({ token: refreshToken });
        const { token: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data.result;

        // Lưu Token mới
        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken); 
        }
        // Xử lý và gọi lại tất cả request trong queue
        api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        processQueue(newAccessToken);

        // Thử lại request ban đầu
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        return api(originalRequest);

      } catch (refreshError) {
          console.error("Refresh Token thất bại. Đăng xuất người dùng.", refreshError);
          failQueue(refreshError); // Hủy tất cả các promise đang chờ
          localStorage.clear(); 
          return Promise.reject(refreshError);
      } finally {
          isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export default api;