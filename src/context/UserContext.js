import React , {createContext, useContext, useEffect, useState, useCallback, useMemo}from 'react'
// import { dummyProducts } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
// import { useUser } from '@clerk/clerk-react';
import CartService from '../services/CartService'; 
import ProductService from '../services/ProductService';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-toastify';


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
    totalMoney: 0, 
    id: null, 
    cartItemCount: 0,
};

export const UserContextProvider = ({children}) => {

    const [products, setProducts]=useState([]);
    const [cart, setCart] = useState(initialCartState);
    const [searchQuery, setSearchQuery]=useState("");
    const delivery_charges=20000;
    const navigate=useNavigate();

    const { 
        isUser, 
        isAuthenticated,
        user, 
        logout 
    } = useAuth();


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
    if (isAuthenticated() === false) {
            setCart([]); 
            toast.error("Log in to view cart");
            return;
        }

        try {
            const response = await CartService.getCart();
            const newCartData = response.result; 

        if (newCartData && Array.isArray(newCartData.cartItems)) {
            setCart({
                ...newCartData,
                cartItemCount: newCartData.cartItems.reduce((sum, item) => sum + item.quantity, 0)
            });
            } else {
            setCart(initialCartState); 
        }
        } catch (error) {
            console.error("Lỗi khi tải giỏ hàng:", error);

            setCart(initialCartState); 
        }
    }, [isAuthenticated]);

    // Thêm Product vào Giỏ hàng 
    const addToCart = useCallback(async (quantity, size, note, productId) => {
        if (isAuthenticated() === false) {
            toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
        }
        if (!size) return toast.error("Vui lòng chọn kích cỡ.");

        const cartItemRequest = {
            "quantity" : quantity,
            "size" : size,
            "note" : note,
            "productId" : productId
        };

        console.log("Item", cartItemRequest);

        try {
            await CartService.addItemToCart(cartItemRequest); 
            toast.success("Add to cart success!");
            await fetchCart(); 
        } catch (error) {
            toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
        }
    }, [isAuthenticated, fetchCart]);

    // Xóa 1 Product mục khỏi Giỏ hàng 
    const removeFromCart = useCallback(async (itemId) => {
        try {
            await CartService.deleteCartItem(itemId);
            toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
            await fetchCart();
        } catch (error) {
            toast.error("Lỗi khi xóa sản phẩm.");
        }
    }, [fetchCart]);

    // Xóa nhiều Product mục khỏi Giỏ hàng 
    const deleteMultipleItems = useCallback(async (itemIds) => {
        try {
            const deletePromises = itemIds.map(itemId => 
                CartService.deleteCartItem(itemId)
            );
            await Promise.all(deletePromises);
            toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
            await fetchCart(); 
        } catch (error) {
            console.error("Lỗi khi xóa nhiều mặt hàng:", error);
            toast.error("Lỗi khi xóa sản phẩm.");
            throw error;
        }
    }, [fetchCart]);

    // Cập nhật Số lượng Product
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
            toast.success("Đã cập nhật số lượng.");
            await fetchCart();

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
            await CartService.updateItemSize({ 
                id: cartItemId, // long id
                quantity: currentItem.quantity, // int quantity
                size: newSize, // ProductSize MỚI
                note: currentItem.note, // String
                productId: currentItem.productId // Long productId
            });
            toast.success("Đã cập nhật kích cỡ.");
            await fetchCart();
        } catch (error) {
            toast.error("Lỗi khi cập nhật kích cỡ.");
        }
    }, [cart, fetchCart]);
    
    // Lấy tổng số lượng mục
    const getCartCount = useMemo(() => cart.cartItemCount, [cart.cartItemCount]);

    // Lấy tổng tiền
    const getCartAmount = useMemo(() => {
        return cart.cartItems.reduce((total, item) => total + item.totalMoney, 0);

    }, [cart.cartItems]);

    useEffect(()=>{
        fetchCart();
        fetchProducts();
        
    },[fetchCart, fetchProducts]);

    const value={
        isAuthenticated,
        user,
        logout,
        isUser,
        cart,
        products,
        fetchCart,
        formatCurrency,
        delivery_charges,
        navigate,
        searchQuery,
        setSearchQuery,
        addToCart,
        getCartCount,
        updateQuantity,
        updateSize,
        getCartAmount,
        removeFromCart,
        deleteMultipleItems,
    };
    
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  ); 
};

export const useUserContext = ()=>useContext(UserContext)