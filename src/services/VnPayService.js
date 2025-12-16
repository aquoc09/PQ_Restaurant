import api from "../api/api";

const VnPayService = {

    // Xử lý IPN (Instant Payment Notification) từ VNPay.
    handleIpn: async () => {
        try {
            const response = await api.get('/vnpay/ipn');
            return response.data; 
        } catch (error) {
            console.error("Error handling VNPay IPN:", error);
            throw error;
        }
    },

    // Tạo URL thanh toán VNPay
    createPayment: async (req) => {
        try {
            const response = await api.post('/vnpay/payment', req);
            return response.data; 
        } catch (error) {
            console.error("Error creating VNPay payment URL:", error);
            throw error;
        }
    },

    // Truy vấn trạng thái giao dịch
    queryTransaction: async (req) => {
        try {
            const response = await api.post('/vnpay/query', req);
            return response.data;
        } catch (error) {
            console.error("Error querying VNPay transaction:", error);
            throw error;
        }
    },

    // Thực hiện hoàn tiền (Refund)
    refund: async (req) => {
        try {
            const response = await api.post('/vnpay/refund', req);
            return response.data;
        } catch (error) {
            console.error("Error processing VNPay refund:", error);
            throw error;
        }
    }
};

export default VnPayService;