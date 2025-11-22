import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { dummyProducts } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Dùng toastify thay vì react-hot-toast
import CartService from '../services/CartService'; 
import UserService from '../services/UserService'; 

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
    // --- State Backend / User ---
    const [user, setUser] = useState(null); // Thông tin người dùng đăng nhập (UserResponse object)
    const [cart, setCart] = useState(null); // Giỏ hàng: CartResponse object từ BE
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Trạng thái đăng nhập
    const [userLoading, setUserLoading] = useState(true); // Trạng thái tải thông tin user

    // --- State Cục bộ / Giao diện ---
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [method, setMethod] = useState("COD");
    
    // Giữ nguyên các hằng số
    const currency = process.env.REACT_APP_CURRENCY || "đ";
    const delivery_charges = 20000;
    const navigate = useNavigate();

    // --- Lấy thông tin User khi khởi động ---
    // Giả định hàm này kiểm tra token và tải thông tin user
    const fetchMyInfo = useCallback(async () => {
        const token = localStorage.getItem('authToken'); // Giả định dùng authToken
        if (!token) {
            setIsAuthenticated(false);
            setUser(null);
            setUserLoading(false);
            return;
        }

        try {
            // Lấy thông tin user hiện tại
            const response = await UserService.getMyInfo();
            const userData = response.result; // Lấy result từ ApiResponse
            
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Lỗi khi tải thông tin người dùng:", error);
            // Xóa token nếu không hợp lệ
            localStorage.removeItem('authToken'); 
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setUserLoading(false);
        }
    }, []);

    // --- Lấy Giỏ hàng từ Backend ---
    const fetchCart = useCallback(async () => {
        if (!isAuthenticated || !user) return;
        try {
            const cartResponse = await CartService.getCart(); // Lấy CartResponse
            setCart(cartResponse); 
        } catch (error) {
            console.error("Lỗi khi tải giỏ hàng:", error);
            setCart({ items: [] }); // Đặt giỏ hàng rỗng nếu lỗi
        }
    }, [isAuthenticated, user]);

    // --- HÀM THAO TÁC GIỎ HÀNG SỬ DỤNG API ---
    
    // 1. Thêm/Cập nhật Sản phẩm vào Giỏ hàng (Sử dụng API)
    const addToCart = async (productId, size, quantity = 1, note = "") => {
        if (!isAuthenticated) {
            toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
            navigate('/login');
            return;
        }
        if (!size) return toast.error("Vui lòng chọn kích cỡ.");

        const cartItemRequest = { productId, size, quantity, note };

        try {
            await CartService.addItemToCart(cartItemRequest); // BE tự động thêm/cập nhật
            await fetchCart(); // Tải lại toàn bộ giỏ hàng để cập nhật UI
            toast.success("Đã thêm sản phẩm vào giỏ hàng!");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Thêm vào giỏ hàng thất bại.";
            toast.error(errorMessage);
        }
    };
    
    // 2. Xóa 1 mục khỏi Giỏ hàng (API)
    const removeFromCart = async (itemId) => {
         if (!isAuthenticated) return;
        try {
            await CartService.deleteItemFromCart(itemId);
            await fetchCart(); // Tải lại giỏ hàng
            toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
        } catch (error) {
            toast.error("Lỗi khi xóa sản phẩm.");
        }
    };

    // 3. Cập nhật Số lượng (API)
    const updateQuantity = async (itemId, quantity) => {
        if (!isAuthenticated) return;
        try {
            const request = { itemId: itemId, quantity: quantity };
            await CartService.updateItemQuantity(request);
            await fetchCart(); // Tải lại giỏ hàng
        } catch (error) {
            toast.error("Lỗi khi cập nhật số lượng.");
        }
    };

    // --- Logic Tính Toán (Dựa trên dữ liệu `cart` từ BE) ---
    
    // Lấy tổng số lượng mục
    const getCartCount = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    };

    // Lấy tổng tiền (Dựa vào trường 'totalAmount' hoặc tính toán thủ công)
    const getCartAmount = () => {
        if (!cart) return 0;
        // Lý tưởng nhất là Backend tính toán và gửi trường 'totalPrice' hoặc 'totalAmount'
        // Nếu không có, ta phải tính thủ công (Dựa trên dữ liệu BE)
        
        return cart.items?.reduce((total, item) => {
            // Giả định item có trường 'price' và 'quantity'
            return total + (item.price * item.quantity); 
        }, 0) || 0;
    };
    
    // --- Lifecycle Effects ---
    
    useEffect(() => {
        fetchMyInfo(); // Tải thông tin user khi khởi động
        fetchProducts(); // Giữ lại logic tải dummy product của bạn
    }, [fetchMyInfo]); 
    
    useEffect(() => {
        if (isAuthenticated) {
            fetchCart(); // Tải giỏ hàng khi user đã đăng nhập
        }
    }, [isAuthenticated, fetchCart]);
    
    // Giữ lại logic tải dummy product của bạn
    const fetchProducts = () => {
        setProducts(dummyProducts);
    };


    const value = {
        // User & Auth
        user,
        isAuthenticated,
        userLoading,
        setUser, // Cung cấp cho hàm login/logout
        setIsAuthenticated,
        fetchMyInfo,
        
        // Cart
        cart, // Cung cấp object CartResponse
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart: CartService.clearCart, // Sử dụng trực tiếp hàm clearCart API nếu cần
        getCartCount,
        getCartAmount,
        fetchCart, // Có thể cần khi user thanh toán xong
        
        // General & Products
        products,
        fetchProducts,
        currency,
        delivery_charges,
        navigate,
        searchQuery,
        setSearchQuery,
        method,
        setMethod,
    };

    return <UserContext.Provider value={value}>
        {children}
    </UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);