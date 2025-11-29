import React , {createContext, useContext, useEffect, useState, useCallback, useMemo}from 'react'
// import { dummyProducts } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
// import { useUser } from '@clerk/clerk-react';
import CartService from '../services/CartService'; 
import ProductService from '../services/ProductService';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-hot-toast';


const UserContext=createContext();

const formatCurrency = (value) => {
    if (typeof value !== "number" || isNaN(value)) return "";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0, // Không hiển thị số lẻ
    }).format(value);
};

const initialCartState = {
    cartItems: [],
    totalMoney: 0, // Giá trị tổng tiền do BE trả về
    id: null, // Cart ID
    cartItemCount: 0,
};

export const UserContextProvider = ({children}) => {

    const[products, setProducts]=useState([]);
    const [cart, setCart] = useState(initialCartState);
    const [searchQuery, setSearchQuery]=useState("");
    const delivery_charges=20000;
    const navigate=useNavigate();
    // const [cardItems, setCartItems]=useState([]);
    const[method,setMethod]=useState("COD");
    // const [isAdmin, setIsAdmin]=useState(() => {
    //   const adminToken = localStorage.getItem('adminToken');
    //   return !!adminToken; // Convert to boolean
    // });

    const { 
        isUser, 
        isAuthenticated, // Lấy trạng thái đăng nhập đầy đủ
        user, // Thông tin user cơ bản từ token (hoặc chi tiết nếu có)
        logout // Hàm đăng xuất
    } = useAuth();
    // const [isUser, setIsUser]=useState(true);
    //Clerk
    // const {user}=useUser();

    const fetchProducts = useCallback(async()=>{
        try {
            const response = await ProductService.getProducts('',0,0,10);
            const productListResponse = response.result.products;
            if (Array.isArray(productListResponse)) {
                setProducts(productListResponse);
        } else {
            console.warn("Dữ liệu sản phẩm trả về không phải là mảng hợp lệ.");
            setProducts([]); 
        }
        } catch (error) {
            setProducts([]);
        }

    }, []);

    const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
             setCart([]); // Xóa giỏ hàng nếu chưa đăng nhập
             return;
        }

        try {
            // Lấy CartResponse, giả định nó có cấu trúc { id, cartItems: [] }
            const response = await CartService.getCart();
            const newCartData = response.result; 

        if (newCartData && Array.isArray(newCartData.cartItems)) {
            setCart({
                ...newCartData,
                cartItemCount: newCartData.cartItems.reduce((sum, item) => sum + item.quantity, 0)
            });
            } else {
            setCart(initialCartState); // Giỏ hàng trống hoặc dữ liệu không hợp lệ
        }
        } catch (error) {
            console.error("Lỗi khi tải giỏ hàng:", error);
            // Quan trọng: Đặt giỏ hàng rỗng nếu lỗi để ngăn lỗi runtime trong các component khác
            setCart(initialCartState); 
        }
    }, [isAuthenticated]);

    //Add Products to Cart
    // 1. Thêm/Cập nhật Sản phẩm vào Giỏ hàng (Sử dụng API)
    const addToCart = useCallback(async (quantity, size, note, productId) => {
        if (!isAuthenticated) {
            toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
        }
        if (!size) return toast.error("Vui lòng chọn kích cỡ.");

        const cartItemRequest = {
            "quantity" : parseInt(quantity),
            "size" : size,
            "note" : note,
            "productId" : productId
        };

        try {
            await CartService.addItemToCart(cartItemRequest); // BE tự động thêm/cập nhật
            await fetchCart(); // Tải lại toàn bộ giỏ hàng để cập nhật UI
            toast.success("Đã thêm sản phẩm vào giỏ hàng!");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Thêm vào giỏ hàng thất bại.";
            toast.error(errorMessage);
        }
    }, [isAuthenticated, fetchCart]);

    // 2. Xóa 1 mục khỏi Giỏ hàng (API)
    const removeFromCart = useCallback(async (itemId) => {
        try {
            await CartService.deleteCartItem(itemId);
            await fetchCart(); // Tải lại giỏ hàng
            toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
        } catch (error) {
            toast.error("Lỗi khi xóa sản phẩm.");
        }
    }, [fetchCart]);

    // 3. Cập nhật Số lượng (API)
    const updateQuantity = useCallback(async (itemId, newQuantity) => {

        const currentItem = cart.cartItems.find(item => item.id === itemId);

        if (newQuantity <= 0) {
            return await removeFromCart(itemId);
        }
        try {
            const request = {
                id: itemId, 
                quantity: newQuantity, 
                size: currentItem.size, 
                note: currentItem.note,
                productId: currentItem.productId
            };
            await CartService.updateItemQuantity(request);
            await fetchCart(); // Tải lại giỏ hàng
            toast.success("Đã cập nhật số lượng.");
        } catch (error) {
            toast.error("Lỗi khi cập nhật số lượng.");
        }
    }, [cart, fetchCart, removeFromCart]);


    //Update Size
    const updateSize = useCallback(async (cartItemId, newSize) => {
    
    
        const currentItem = cart.cartItems.find(item => item.id === cartItemId);

        if (!currentItem) {
            return toast.error("Không tìm thấy mục hàng để cập nhật.");
        }

        try {
            // 2. TẠO REQUEST BODY ĐẦY ĐỦ với size mới
            // Hàm updateItemSize của bạn dùng PUT /items/sizes và cần request body:
            await CartService.updateItemSize({ 
                id: cartItemId, // long id
                quantity: currentItem.quantity, // int quantity
                size: newSize, // ProductSize MỚI
                note: currentItem.note, // String
                productId: currentItem.productId // Long productId
            });

            await fetchCart();
            toast.success("Đã cập nhật kích cỡ.");
            
        } catch (error) {
            toast.error("Lỗi khi cập nhật kích cỡ.");
        }
    }, [cart, fetchCart]);
    
    // Lấy tổng số lượng mục
    const getCartCount = useMemo(() => cart.cartItemCount, [cart.cartItemCount]);

    // Lấy tổng tiền (Dựa vào trường 'totalAmount' hoặc tính toán thủ công)
    const getCartAmount = useMemo(() => {
        // Ưu tiên dùng tổng tiền do Server tính toán và gửi về
        // if (cart.totalMoney > 0) {
        //     return cart.totalMoney;
        // }
        // Fallback: Tính lại ở FE nếu cần
        return cart.cartItems.reduce((total, item) => total + item.totalMoney, 0);

    }, [cart.cartItems]);

    useEffect(()=>{
        fetchCart();
        fetchProducts();
        
    },[fetchCart, fetchProducts]);

    const value={
        // user
        isAuthenticated,
        user,
        logout,
        isUser,

        cart,
        products,
        // fetchProducts,
        fetchCart,
        formatCurrency,
        delivery_charges,
        navigate,
        searchQuery,
        setSearchQuery,
        // cardItems,
        addToCart,
        getCartCount,
        updateQuantity,
        getCartAmount,
        removeFromCart,
        method,
        setMethod,
        // isUser,
        // setIsUser,
    };
    
  return <UserContext.Provider value={value}>
        {children}
    </UserContext.Provider>;
};

export const useUserContext = ()=>useContext(UserContext)