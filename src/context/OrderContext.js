import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OrderService from '../services/OrderSevice';
import { useUserContext } from './UserContext'

// ... (Các import khác) ...

const OrderContext = createContext();

export const CartProvider = ({ children }) => {
    const [method,setMethod]=useState("COD");
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [orderNote, setOrderNote] = useState('');
    const { navigate } = useUserContext();

    // Hàm Xử lý Order chính
    const processOrder = async (totalAmount) => {
        
        // 1. Kiểm tra điều kiện bắt buộc
        if (!selectedAddress || !selectedAddress.id) {
            toast.error("Vui lòng chọn địa chỉ giao hàng.");
            return false;
        }

        // Đảm bảo method (COD/VNPAY) được lấy từ state/prop
        // Giả định 'method' là state trong Context này hoặc lấy từ useUserContext
        const userPaymentChoice = method; 
        
        // Cần đảm bảo method gửi lên là chữ HOA để khớp với enum BE
        const paymentMethodBE = userPaymentChoice.toUpperCase();
        
        // Chuẩn bị tham số
        const addressId = selectedAddress.id;
        
        const requestBody = {

        };

        try {
            // 3. Gọi CartService.checkout()
            const response = await OrderService.checkout(
                paymentMethodBE, 
                addressId, 
                orderNote, 
                requestBody
            );
            console.log("Checkout response:", response);
            // const createdOrderId = response.id;

            // Xử lý điều hướng dựa trên Response
            if (paymentMethodBE === "COD") {
                toast.success(`Đặt hàng thành công! Thanh toán bằng COD.`);
                // navigate('/'); 
                navigate('/my-orders'); 
                window.location.reload();
            } else if (paymentMethodBE === "VNPAY") {
                const paymentUrl = response.result.paymentUrl;
                if (paymentUrl) {
                    toast.success("Đang chuyển đến cổng thanh toán...");
                    window.location.href = paymentUrl; 
                } else {
                    // Xử lý lỗi nếu BE không trả về URL
                    toast.error("Đặt hàng thành công, nhưng không nhận được URL thanh toán VNPAY.");
                    navigate('/my-orders'); 
                }
            }
            return true; 
        } catch (error) {
            console.error("Lỗi khi xử lý Order:", error);
            // Xử lý lỗi trả về từ BE (ví dụ: 400 Bad Request)
            const errorMessage = error.response?.data?.message || error.message || "Vui lòng thử lại.";
            toast.error(`Đặt hàng thất bại: ${errorMessage}`);
            return false;
        }
    };

    const value = {
        method,
        setMethod,
        selectedAddress, 
        setSelectedAddress,
        orderNote,
        setOrderNote,
        processOrder,
    };
    
    return (
        <OrderContext.Provider value={value}>
            {children}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </OrderContext.Provider>
        
    );
};

export const useOrderContext = () => useContext(OrderContext);
