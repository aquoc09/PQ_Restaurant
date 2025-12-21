import api from "../api/api";

const OrderService = {

    //Thực hiện thanh toán và tạo đơn hàng 
    checkout: async (method, addressId, note = '', requestBody = {}) => {
        try {
            const data = note ? "" : requestBody;
            const response = await api.post(`/orders/check-out?method=${method}&addressId=${addressId}`, data);
            return response.data;
        } catch (error) {
            console.error("Error during checkout:", error);
            throw error;
        }
    },

    //Tạo một đơn hàng mới
    createOrder: async (request) => {
        try {
            const response = await api.post('/orders', request);
            return response.data;
        } catch (error) {
            console.error("Error creating order:", error);
            throw error;
        }
    },

    // Lấy thông tin đơn hàng theo ID
    getOrder: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching order by ID ${orderId}:`, error);
            throw error;
        }
    },

    // Cập nhật thông tin đơn hàng
    updateOrder: async (orderId, request) => {
        debugger;
        try {
            const response = await api.put(`/orders/${orderId}`, request);
            return response.data;
        } catch (error) {
            console.error(`Error updating order ID ${orderId}:`, error);
            throw error;
        }
    },

    // Xóa một đơn hàng
    deleteOrder: async (orderId) => {
        try {
            const response = await api.delete(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting order ID ${orderId}:`, error);
            throw error;
        }
    },

    // Lấy tất cả đơn hàng (Thường chỉ dành cho Admin)
    findAllOrders: async () => {
        try {
            const response = await api.get('/orders');
            return response.data;
        } catch (error) {
            console.error("Error fetching all orders:", error);
            throw error;
        }
    },

    // Lấy tất cả đơn hàng của người dùng hiện tại
    getOrdersByCurrentUser: async () => {
        try {
            const response = await api.get('/orders/my-orders');
            return response.data;
        } catch (error) {
            console.error("Error fetching current user's orders:", error);
            throw error;
        }
    },

    // Lấy tất cả đơn hàng theo User ID
    getOrdersByUserId: async (userId) => {
        try {
            const response = await api.get(`/orders/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching orders by user ID ${userId}:`, error);
            throw error;
        }
    },

    // Xử lý callback từ VNPay (Thường được backend gọi)
    vnPayCallback: async (trackingNumber, isSuccess) => {
        try {
            // Thêm '/orders' vào trước endpoint
            const response = await api.get('/orders/vnpay/callback', {
                params: {
                    trackingNumber: trackingNumber,
                    success: isSuccess
                }
            });
            return response.data; 
        } catch (error) {
            console.error("Lỗi xác nhận VNPAY:", error);
            throw error;
        }
    }
};

export default OrderService;