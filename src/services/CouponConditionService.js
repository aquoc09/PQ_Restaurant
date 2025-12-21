import api from "../api/api";

const CouponConditionService = {
    
    // Tạo một điều kiện mã giảm giá mới
    createCondition: async (request) => {
        try {
            const response = await api.post('/conditions', request);
            return response.data;
        } catch (error) {
            console.error("Error creating coupon condition:", error);
            throw error;
        }
    },

    // Lấy thông tin điều kiện mã giảm giá theo ID
    getCondition: async (conditionId) => {
        try {
            const response = await api.get(`/conditions/${conditionId}`);
            return response.data.result;
        } catch (error) {
            console.error(`Error fetching coupon condition by ID ${conditionId}:`, error);
            throw error;
        }
    },

    // Lấy tất cả điều kiện mã giảm giá
    findAllConditions: async () => {
        try {
            const response = await api.get('/conditions');
            return response.data;
        } catch (error) {
            console.error("Error fetching all coupon conditions:", error);
            throw error;
        }
    },

    // Xóa một điều kiện mã giảm giá
    deleteCoupon: async (conditionId) => {
        try {
            const response = await api.delete(`/conditions/${conditionId}`);
            return response.data; 
        } catch (error) {
            console.error(`Error deleting coupon condition ID ${conditionId}:`, error);
            throw error;
        }
    },

    // Cập nhật điều kiện mã giảm giá
    updateCondition: async (conditionId, request) => {
        try {
            const response = await api.put(`/conditions/${conditionId}`, request);
            return response.data;
        } catch (error) {
            console.error(`Error updating coupon condition ID ${conditionId}:`, error);
            throw error;
        }
    }
};

export default CouponConditionService;