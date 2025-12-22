import api from '../api/api';
const ReviewService = {

    createReview: async (reviewData) => {
        try {
            const response = await api.post('/reviews', reviewData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getAllReviews: async () => {
        try {
            const response = await api.get('/reviews');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getMyReviews: async () => {
        try {
            const response = await api.get('/reviews/by-current-user');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getReviewsByUserId: async (userId) => {
        try {
            const response = await api.get(`/reviews/by-user/${userId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getReviewById: async (reviewId) => {
        try {
            const response = await api.get(`/reviews/${reviewId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteReview: async (reviewId) => {
        try {
            const response = await api.delete(`/reviews/${reviewId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateReview: async (reviewId, reviewData) => {
        try {
            const response = await api.put(`/reviews/${reviewId}`, reviewData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default ReviewService;