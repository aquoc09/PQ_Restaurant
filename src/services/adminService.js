import api from '../api/api';

const USER_API_URL = '/users';
const ROLE_API_URL = '/roles';

const AdminService = {
    // Quản lý người dùng: Lấy tất cả người dùng
    getAllUsers: () => {
        // Chỉ Admin mới được gọi endpoint này
        return api.get(USER_API_URL);
    },

    // Quản lý người dùng: Cập nhật người dùng theo ID
    updateUserById: (userId, updateData) => {
        return api.put(`${USER_API_URL}/${userId}`, updateData);
    },

    // Quản lý người dùng: Xóa người dùng
    deleteUserById: (userId) => {
        return api.delete(`${USER_API_URL}/${userId}`);
    },

    // Quản lý vai trò: Lấy tất cả vai trò
    getAllRoles: () => {
        return api.get(ROLE_API_URL);
    },
    
    // Quản lý vai trò: Tạo vai trò mới
    createRole: (roleData) => {
        return api.post(ROLE_API_URL, roleData);
    }
    // ... (Thêm các API Admin khác tại đây)
};

export default AdminService;