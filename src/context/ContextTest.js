import React , {createContext, useContext, useEffect, useState, useCallback}from 'react'
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

export const UserContextProvider = ({children}) => {

    const[products, setProducts]=useState([]);
    const [cart, setCart] = useState();
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

    const fetchProducts = async()=>{
        try {
            const response = await ProductService.getProducts('',0,0,10);
            setProducts(response.data.result.products);
            
        } catch (error) {
            setProducts([]);
        }

    };

    const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
             setCart([]); // Xóa giỏ hàng nếu chưa đăng nhập
             return;
        }

        try {
            // Lấy CartResponse, giả định nó có cấu trúc { id, cartItems: [] }
            const response = await CartService.getCart();
            setCart(response.result);
        } catch (error) {
            console.error("Lỗi khi tải giỏ hàng:", error);
            // Quan trọng: Đặt giỏ hàng rỗng nếu lỗi để ngăn lỗi runtime trong các component khác
            setCart([]); 
        }
    }, [isAuthenticated, setCart]);

    //Add Products to Cart
    // 1. Thêm/Cập nhật Sản phẩm vào Giỏ hàng (Sử dụng API)
    const addToCart = async (quantity, size, note, productId) => {
        // if (!isAuthenticated) {
        //     toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
        //     navigate('/login');
        //     return;
        // }
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
    
    // Lấy tổng số lượng mục
    const getCartCount = () => {
        if (!cart || !cart.cartItems) return 0;
        return cart.cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    // Lấy tổng tiền (Dựa vào trường 'totalAmount' hoặc tính toán thủ công)
    const getCartAmount = () => {
        if (!cart) return 0;
        return cart.cartItems?.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        // Lấy giá dựa trên size đã chọn trong giỏ hàng
        const priceData = product?.prices.find(p => p.size === item.size); 
        const itemPrice = priceData ? priceData.price : 0;
        return total + (itemPrice * item.quantity);
        }, 0) || 0;
    };

    useEffect(()=>{
        
        fetchProducts();
        
    },[]);

    
    useEffect(() => {
        // Chỉ gọi fetchCart nếu isAuthenticated() trả về TRUE VÀ ĐÃ ỔN ĐỊNH
        if (isAuthenticated) {
            fetchCart(); 
        }
    // Dependency: Chỉ phụ thuộc vào fetchCart (sử dụng useCallback an toàn)
    }, [isAuthenticated, fetchCart]);

    const value={
        // user
        isAuthenticated,
        user,
        logout,
        isUser,

        products,
        fetchProducts,
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