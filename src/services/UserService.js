import api from '../api/api';

const USER_API_URL = '/users';

const UserService = {
    // Lấy thông tin cá nhân (Cả User và Admin đều dùng)

    getAllUsers: async () => {
        try {
            const response = await api.get("/users");

            const userResponses = response.data.map(apiResponse => apiResponse.result);
            return userResponses;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách người dùng:", error);
            throw error;
        }
    },

    getUserById: async (userId) => {
        try {
            const response = await api.get(`${USER_API_URL}/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy người dùng ID ${userId}:`, error);
            throw error;
        }
    },

    getMyInfo: async() => {
        try {
            const response = await api.get(`${USER_API_URL}/myInfo`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng hiện tại:", error);
            throw error;
        }
    },
    
    // Cập nhật thông tin cá nhân
    updateUser: async (userId, userUpdateRequest) => {
        try {
            const response = await api.put(`${USER_API_URL}/${userId}`, userUpdateRequest);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật người dùng ID ${userId}:`, error);
            throw error;
        }
    },
    
    createUser: async (userCreationRequest) => {
        try {
            const response = await api.post(USER_API_URL, userCreationRequest);
            return response.data; 
        } catch (error) {
            console.error("Lỗi khi tạo người dùng:", error);
            throw error;
        }
    },
    deleteUser: async (userId) => {
        try {
            const response = await api.delete(`${USER_API_URL}/${userId}`);
            // BE trả về ApiResponse<String>, chúng ta chỉ trả về tin nhắn
            return response.data.message;
        } catch (error) {
            console.error(`Lỗi khi xóa người dùng ID ${userId}:`, error);
            throw error;
        }
    },
};

export default UserService;