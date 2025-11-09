import api from "../api/api";

const ProductService = {
  getNewArrivals: async () => {
    try {
      const response = await api.get("/products/latest-products");
      return response.data;
    } catch (error) {
      console.error("Error fetching in stock products:", error);
      throw error;
    }
  },
  getPopulars: async () => {
    try {
      const response = await api.get("/products/popular-products");
      return response.data;
    } catch (error) {
      console.error("Error fetching in stock products:", error);
      throw error;
    }
  },

};

export default ProductService;
