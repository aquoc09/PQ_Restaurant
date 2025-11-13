import api from "../api/api";


const ProductService = {

  getProducts: async (keyword = '', categoryId = 0, page = 0, limit = 10) => {
    try {
        const response = await api.get("/products", {
            params: {
                keyword: keyword,
                category_id: categoryId, 
                page: page,
                limit: limit,
            }
        });
        return response.data; // Trả về ApiResponse<ProductListResponse>
    } catch (error) {
        console.error("Error fetching paginated products:", error);
        throw error;
      }
  },
  getProductsByCategoryCode: async (categoryCode, limit = 5) => {
    try {
        const response = await api.get(`/products/category-code/${categoryCode}`, {
            params: {
                limit: limit,
            }
        });
        return response.data; // Trả về ApiResponse<List<ProductResponse>>
    } catch (error) {
        console.error("Error fetching products by category code:", error);
        throw error;
      }
  },

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
  getProductById: async (productId) => {
    try {
        const response = await api.get(`/products/${productId}`);
        return response.data; // Trả về ApiResponse<ProductResponse>
    } catch (error) {
        console.error(`Error fetching product with ID ${productId}:`, error);
        throw error;
      }
  },
  createProduct: async (productRequest) => {
    try {
        const response = await api.post("/products", productRequest);
        return response.data; // Trả về ApiResponse<ProductResponse> của sản phẩm đã tạo
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
      }
  },
  updateProduct: async (productId, productRequest) => {
    try {
        const response = await api.put(`/products/${productId}`, productRequest);
        return response.data; // Trả về ApiResponse<ProductResponse> đã cập nhật
    } catch (error) {
        console.error(`Error updating product with ID ${productId}:`, error);
        throw error;
      }
  },
  deleteProduct: async (productId) => {
    try {
        const response = await api.delete(`/products/${productId}`);
        return response.data; // Trả về ApiResponse<String> (message: "Product has been deleted")
    } catch (error) {
        console.error(`Error deleting product with ID ${productId}:`, error);
        throw error;
      }
  }

};

export default ProductService;
