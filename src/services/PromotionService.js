import api from "../api/api";

const PromotionService = {
  getAll: async () => {
    try {
      const response = await api.get("/promotions/in-stock");
      return response.data;
    } catch (error) {
      console.error("Error fetching promotions:", error);
      throw error;
    }
  },
};

export default PromotionService;
