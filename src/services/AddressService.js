import api from "../api/api";

const AddressService = {

    // lat - Vĩ độ 
    // lng - Kinh độ
    //Lấy thông tin địa chỉ từ tọa độ
    getAddressFromLatLng: async (lat, lng) => {
        try {
            const response = await api.get('/address/geocode', {
                params: { lat, lng }
            });
            // Giả định response.result chứa dữ liệu GeocodeResult
            return response.data; 
        } catch (error) {
            console.error("Error geocoding address:", error);
            throw error;
        }
    },

    //Tạo một địa chỉ mới
    createAddress: async (requestBody) => {
        try {
            const response = await api.post('/address', requestBody);
            return response.data;
        } catch (error) {
            console.error("Error creating address:", error);
            throw error;
        }
    },

    // Lấy thông tin địa chỉ theo ID
    getAddressById: async (addressId) => {
        try {
            const response = await api.get(`/address/${addressId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching address by ID ${addressId}:`, error);
            throw error;
        }
    },

    //Lấy tất cả địa chỉ của người dùng hiện tại
    findAllByUser: async () => {
        try {
            const response = await api.get('/address/by-user');
            return response.data;
        } catch (error) {
            console.error("Error fetching addresses for user:", error);
            throw error;
        }
    },

    //Cập nhật thông tin địa chỉ
    updateAddress: async (requestBody, addressId) => {
        try {
            const response = await api.put(`/address/${addressId}`, requestBody);
            return response.data;
        } catch (error) {
            console.error(`Error updating address ID ${addressId}:`, error);
            throw error;
        }
    },

    // Xóa một địa chỉ
    deleteAddress: async (addressId) => {
        try {
            const response = await api.delete(`/address/${addressId}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting address ID ${addressId}:`, error);
            throw error;
        }
    }
};

export default AddressService;