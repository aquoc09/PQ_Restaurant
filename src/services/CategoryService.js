import api from '../api/api'; 


const CategoryService = {
    
    createCategory: async (categoryRequest) => {
        try {
            const response = await api.post("/categories", categoryRequest);

            return response.data; 
        } catch (error) {
            console.error("Error creating category:", error);
            throw error;
        }
    },

    getAllCategories: async () => {
        try {
            const response = await api.get("/categories");
            
            const categories = response.data.map(apiResponse => apiResponse.result);
            
            return categories; 
        } catch (error) {
            console.error("Error fetching all categories:", error);
            throw error;
        }
    },

    getCategoryById: async (categoryId) => {
        try {
            const response = await api.get(`/categories/${categoryId}`);

            return response.data; 
        } catch (error) {
            console.error(`Error fetching category with ID ${categoryId}:`, error);
            throw error;
        }
    },


    updateCategory: async (categoryId, categoryRequest) => {
        try {
            const response = await api.put(`/categories/${categoryId}`, categoryRequest);

            return response.data; 
        } catch (error) {
            console.error(`Error updating category with ID ${categoryId}:`, error);
            throw error;
        }
    },

    deleteCategory: async (categoryId) => {
        try {
            const response = await api.delete(`/categories/${categoryId}`);
            return response.data; 
        } catch (error) {
            console.error(`Error deleting category with ID ${categoryId}:`, error);
            throw error;
        }
    }
};

export default CategoryService;