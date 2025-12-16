import api from "../api/api";

const CouponService = {
    
    // Tạo mã giảm giá mới
    createCoupon: async (request) => {
        try {
            const response = await api.post('/coupons', request);
            return response.data;
        } catch (error) {
            console.error("Error creating coupon:", error);
            throw error;
        }
    },

    // Lấy thông tin mã giảm giá theo Code
    getCouponByCode: async (code) => {
        try {
            const response = await api.get(`/coupons/${code}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching coupon by code ${code}:`, error);
            throw error;
        }
    },

    // Lấy tất cả mã giảm giá
    findAllCoupons: async () => {
        try {
            const response = await api.get('/coupons');
            return response.data;
        } catch (error) {
            console.error("Error fetching all coupons:", error);
            throw error;
        }
    },

    // Xóa một mã giảm giá
    deleteCoupon: async (couponId) => {
        try {
            const response = await api.delete(`/coupons/${couponId}`);
            return response.data; 
        } catch (error) {
            console.error(`Error deleting coupon ID ${couponId}:`, error);
            throw error;
        }
    },

    // Cập nhật mã giảm giá
    updateCoupon: async (request, couponId) => {
        try {
            const response = await api.put(`/coupons/${couponId}`, request);
            return response.data;
        } catch (error) {
            console.error(`Error updating coupon ID ${couponId}:`, error);
            throw error;
        }
    },

    // Tính toán giá trị giảm sau khi áp dụng mã giảm giá
    calculateCoupon: async (couponCode, totalAmount) => {
        try {
            const url = `/coupons/calculate?couponCode=${couponCode}&totalAmount=${totalAmount}`;
            const response = await api.post(url);
            return response.data;
        } catch (error) {
            console.error(`Error calculating coupon value for code ${couponCode}:`, error);
            throw error;
        }
    }
};

export default CouponService;