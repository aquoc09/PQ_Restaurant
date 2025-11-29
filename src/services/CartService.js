import api from "../api/api";
const CART_API_URL = '/carts';

const CartService = {

    getCart: async () => {
        try {
            const response = await api.get("/carts");
            // Trả về dữ liệu giỏ hàng (CartResponse)
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy giỏ hàng:", error);
            throw error;
        }
    },
    clearCart: async () => {
        try {
            const response = await api.put(CART_API_URL);
            // Trả về kết quả boolean
            return response.data; 
        } catch (error) {
            console.error("Lỗi khi xóa trống giỏ hàng:", error);
            throw error;
        }
    },
    addItemToCart: async (request) => {
        try {
            // const url = `${CART_API_URL}/items`;
            const response = await api.post("/carts/items", request);
            // Trả về CartItemResponse
            return response.data; 
        } catch (error) {
            console.error("Lỗi khi thêm mặt hàng:", error);
            throw error;
        }
    },
    updateItemSize: async (request) => {
        try {
            const url = `${CART_API_URL}/items/sizes`;
            await api.put(url, request);
        } catch (error) {
            console.error("Lỗi khi cập nhật kích cỡ:", error);
            throw error;
        }
    },
    updateItemQuantity: async (request) => {
        try {
            const url = `${CART_API_URL}/items/quantities`;
            await api.put(url, request);
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng:", error);
            throw error;
        }
    },
    updateItemNote: async (request) => {
        try {
            const url = `${CART_API_URL}/items/notes`;
            await api.put(url, request);
        } catch (error) {
            console.error("Lỗi khi cập nhật ghi chú:", error);
            throw error;
        }
    },
    deleteCartItem: async (itemId) => {
        try {
            const url = `${CART_API_URL}/items/${itemId}`;
            await api.delete(url);
        } catch (error) {
            console.error("Lỗi khi xóa mặt hàng:", error);
            throw error;
        }
    },
  
};

export default CartService;