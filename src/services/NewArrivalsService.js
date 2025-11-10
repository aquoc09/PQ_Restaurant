import api from "../api/api";

const NewArrivalsService = {
  getAll: async () => {
    try {
      const response = await api.get("/promotions/in-stock");
      return response.data;
    } catch (error) {
      console.error("Error fetching new arrivals:", error);
      throw error;
    }
  },
};

export default NewArrivalsService;
