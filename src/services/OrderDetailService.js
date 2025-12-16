import api from "../api/api";

const OrderDetailService = {
    
    // Tạo chi tiết đơn hàng
    createOrderDetail: async (request) => {
        try {
            const response = await api.post('/details', request);
            return response.data;
        } catch (error) {
            console.error("Error creating order detail:", error);
            throw error;
        }
    },

    // Lấy thông tin chi tiết đơn hàng theo ID
    getOrderDetail: async (detailId) => {
        try {
            const response = await api.get(`/details/${detailId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching order detail by ID ${detailId}:`, error);
            throw error;
        }
    },

    // Cập nhật chi tiết đơn hàng
    updateOrderDetail: async (detailId, request) => {
        try {
            const response = await api.put(`/details/${detailId}`, request);
            return response.data;
        } catch (error) {
            console.error(`Error updating order detail ID ${detailId}:`, error);
            throw error;
        }
    },

    // Xóa một chi tiết đơn hàng
    deleteOrderDetail: async (detailId) => {
        try {
            const response = await api.delete(`/details/${detailId}`);
            return response.data; // Trả về thông báo "Xóa thành công OrderDetail: X"
        } catch (error) {
            console.error(`Error deleting order detail ID ${detailId}:`, error);
            throw error;
        }
    },

    // Lấy tất cả chi tiết đơn hàng theo Order ID
    findByOrderId: async (orderId) => {
        try {
            const response = await api.get(`/details/order/${orderId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching order details for order ID ${orderId}:`, error);
            throw error;
        }
    }
};

export default OrderDetailService;