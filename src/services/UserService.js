import api from '../api/api';

const USER_API_URL = '/users';

const UserService = {
    // Lấy thông tin cá nhân (Cả User và Admin đều dùng)
    getMyInfo: () => {
        return api.get(`${USER_API_URL}/myInfo`);
    },
    
    // Cập nhật thông tin cá nhân
    updateMyInfo: (updateData) => {
        // Cần có endpoint update tương tự trong UserController
        return api.put(`${USER_API_URL}/myInfo`, updateData);
    },
    
    // ... (Thêm các API dành riêng cho User tại đây, ví dụ: Xem đơn hàng)
};

export default UserService;