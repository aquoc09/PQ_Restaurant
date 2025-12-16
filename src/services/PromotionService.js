import api from "../api/api";

const PromotionService = {

    getAllPromotions: async (page = 0, limit = 5) => {
        try {
            const response = await api.get(`/promotions?page=${page}&limit=${limit}`);
            return response.data; 
        } catch (error) {
            console.error("Error fetching paginated promotions:", error);
            throw error;
        }
    },

  // Lấy tất cả khuyến mãi có inStock = true
    getAll: async () => {
        try {
        const response = await api.get("/promotions/in-stock");
        return response.data;
        } catch (error) {
        console.error("Error fetching promotions:", error);
        throw error;
        }
    },

    getPromotionById: async (promotionId) => {
        try {
            const response = await api.get(`/promotions/${promotionId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching promotion with ID ${promotionId}:`, error);
            throw error;
        }
    },

    createPromotion: async (promotionRequest) => {
        try {
            const response = await api.post("/promotions", promotionRequest);
            return response.data;
        } catch (error) {
            console.error("Error creating promotion:", error);
            throw error;
        }
    },

    updatePromotion: async (promotionId, promotionRequest) => {
        try {
            const response = await api.put(`/promotions/${promotionId}`, promotionRequest);
            return response.data;
        } catch (error) {
            console.error(`Error updating promotion with ID ${promotionId}:`, error);
            throw error;
        }
    },

    deletePromotion: async (promotionId) => {
        try {
            const response = await api.delete(`/promotions/${promotionId}`);
            return response.data.message; // Controller trả về message, không phải result
        } catch (error) {
            console.error(`Error deleting promotion with ID ${promotionId}:`, error);
            throw error;
        }
    },
};

export default PromotionService;
