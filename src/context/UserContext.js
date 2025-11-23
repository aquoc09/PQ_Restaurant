import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
// import { dummyProducts } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CartService from '../services/CartService'; 
// import UserService from '../services/UserService';
import ProductService from '../services/ProductService';
import useAuth from '../hooks/useAuth';

const UserContext = createContext();
const formatCurrency = (value) => {
    if (typeof value !== "number" || isNaN(value)) return "";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0, // Không hiển thị số lẻ
    }).format(value);
};

export const UserContextProvider = ({ children }) => {
    // --- Lấy Auth State từ Hook ---
    const { 
        isAuthenticated: isAuth, // Đổi tên biến để tránh trùng lặp
        userRoles,
        username,
        logout: authLogout, // Đổi tên hàm để tránh trùng lặp
        ...authData // Các dữ liệu khác từ token
    } = useAuth();

    // --- State Cục bộ / Sản phẩm ---
    const [cart, setCart] = useState(null); // Giỏ hàng: CartResponse object từ BE
    const [products, setProducts] = useState([]);
    const [productLoading, setProductLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [method, setMethod] = useState("COD");
    
    // Giữ nguyên các hằng số
    const delivery_charges = 20000;
    const navigate = useNavigate();
    
    // Hàm này sẽ được gọi khi component mount hoặc khi cần làm mới danh sách sản phẩm.
    const fetchProducts = useCallback(async (keyword = '', categoryId = 0, page = 0, limit = 10) => {
        setProductLoading(true);
        try {
            // Gọi ProductService.getProducts
            const response = await ProductService.getProducts(keyword, categoryId, page, limit);
            
            // Giả định response.data là ApiResponse<ProductListResponse>
            // và danh sách sản phẩm nằm trong response.data.result.content
            const productList = response.result?.content || [];
            
            setProducts(productList);
        } catch (error) {
            console.error("Lỗi khi tải danh sách sản phẩm:", error);
            toast.error("Không thể tải sản phẩm. Vui lòng thử lại.");
            setProducts([]);
        } finally {
            setProductLoading(false);
        }
    }, []);

    
    // --- Lấy Giỏ hàng từ Backend ---
    const fetchCart = useCallback(async () => {
        if (!isAuth) return;
        try {
            const cartResponse = await CartService.getCart(); // Lấy CartResponse
            setCart(cartResponse); 
        } catch (error) {
            console.error("Lỗi khi tải giỏ hàng:", error);
            setCart({ items: [] }); // Đặt giỏ hàng rỗng nếu lỗi
        }
    }, [isAuth]);

    // --- HÀM THAO TÁC GIỎ HÀNG SỬ DỤNG API ---
    
    // 1. Thêm/Cập nhật Sản phẩm vào Giỏ hàng (Sử dụng API)
    const addToCart = async (productId, size, quantity = 1, note = "") => {
        if (!isAuth) {
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
         if (!isAuth) return;
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
        if (!isAuth) return;
        try {
            const request = { itemId: itemId, quantity: quantity };
            await CartService.updateItemQuantity(request);
            await fetchCart(); // Tải lại giỏ hàng
        } catch (error) {
            toast.error("Lỗi khi cập nhật số lượng.");
        }
    };
    
    // Lấy tổng số lượng mục
    const getCartCount = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    };

    // Lấy tổng tiền (Dựa vào trường 'totalAmount' hoặc tính toán thủ công)
    const getCartAmount = () => {
        if (!cart) return 0;
        return cart.items?.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        // Lấy giá dựa trên size đã chọn trong giỏ hàng
        const priceData = product?.prices.find(p => p.size === item.size); 
        const itemPrice = priceData ? priceData.price : 0;
        return total + (itemPrice * item.quantity);
        }, 0) || 0;
    };
    
    // --- Lifecycle Effects ---
    
    useEffect(() => {
        fetchProducts(); // Giữ lại logic tải dummy product của bạn
    }, [fetchProducts]); 
    
    useEffect(() => {
        if (isAuth) {
            fetchCart(); // Tải giỏ hàng khi user đã đăng nhập
        }
    }, [isAuth, fetchCart]);

    const logout = () => {
        authLogout(); // <-- Gọi hàm logout từ useAuth
        setCart(null); // Xóa giỏ hàng cục bộ khi đăng xuất
    };

    const value = {
        // Auth & User (Từ useAuth)
        user: { username, ...authData }, // Cung cấp thông tin user (username, expirationTime,...)
        isAuthenticated: isAuth, // Trạng thái đăng nhập
        userRoles, // Vai trò của user
        logout,
        
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
        productLoading,
        fetchProducts,

        formatCurrency,
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