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
    
    // 1. Kiểm tra lỗi 401 và nếu request chưa được thử lại
    if (error.response?.status === 401 && !originalRequest._retry) {
      // originalRequest._retry = true;

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

      // 2. Không có Refresh Token: Đăng xuất cứng
      if (!refreshToken) {
          isRefreshing = false;
          failQueue(error);
          localStorage.clear();
          console.warn("Không có Refresh Token. Đăng xuất.");
          // window.location.href = '/login';
          return Promise.reject(error);
      }
      
      // 3. Nếu đang chờ token mới, thêm request vào hàng đợi
      // if (isRefreshing) {
      //     return new Promise((resolve, reject) => {
      //         // LƯU TRỮ CẢ originalRequest VÀ resolve/reject
      //         failedQueue.push({ resolve, reject }); 
      //     });
      // }


      try {
        // 4. Gọi API Refresh Token
        // const refreshResponse = await AuthService.refreshToken({ refreshToken });
        // const newAccessToken = refreshResponse.data.token;
        const refreshResponse = await AuthService.refreshToken({ token: refreshToken });
        const { token: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data.result;

        // 5. Lưu Token mới
        localStorage.setItem('accessToken', newAccessToken);
        // localStorage.setItem('refreshToken', newRefreshToken); // Nếu API trả về Refresh Token mới
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken); 
        }
        // 6. Xử lý và gọi lại tất cả request trong queue
        api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        // processQueue(null, newAccessToken);
        processQueue(newAccessToken);

        // 7. Thử lại request ban đầu
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        return api(originalRequest);

      } catch (refreshError) {
          // LỖI XẢY RA Ở ĐÂY (VÍ DỤ: LỖI 500 BE)
          console.error("Refresh Token thất bại. Đăng xuất người dùng.", refreshError);
          failQueue(refreshError); // Hủy tất cả các promise đang chờ
          // processQueue(refreshError, null);
          localStorage.clear(); 
          // window.location.href = '/login';
          return Promise.reject(refreshError);
      } finally {
          isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export default api;