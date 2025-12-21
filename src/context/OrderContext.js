import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import OrderService from '../services/OrderSevice';
import CouponService from '../services/CouponService'
import { useUserContext } from './UserContext'

// ... (Các import khác) ...

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const { navigate, fetchUserCart } = useUserContext();

    // --- STATES ---
    const [method, setMethod] = useState("COD");
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [orderNote, setOrderNote] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [selectedItemsForCheckout, setSelectedItemsForCheckout] = useState([]);

    const getValidDiscount = useCallback((currentAmount) => {
        if (!appliedCoupon || !appliedCoupon.active) return 0;

        const now = new Date();
        const expiryDate = new Date(appliedCoupon.expiredAt);

        // 1. Kiểm tra hạn dùng tổng quát
        if (now > expiryDate) return 0;

        let totalDiscount = 0;
        let isMinimumSatisfied = true;

        // 2. Duyệt qua các điều kiện trong coupon
        appliedCoupon.conditions.forEach(cond => {
            // Kiểm tra số tiền tối thiểu
            if (cond.attribute === "minimum_amount") {
                const minVal = parseFloat(cond.value);
                // Nếu operator là ">" thì phải lớn hơn, ở đây check nếu nhỏ hơn hoặc bằng thì tạch
                if (cond.operator === ">" && currentAmount <= minVal) {
                    isMinimumSatisfied = false;
                } else {
                    totalDiscount += cond.discountAmount;
                }
            }

            // Kiểm tra ngày áp dụng
            if (cond.attribute === "applicable_date") {
                const targetDate = new Date(cond.value);
                if (cond.operator === "before" && now < targetDate) {
                    // Nếu discountAmount <= 100 coi là %, ngược lại là tiền mặt
                    if (cond.discountAmount <= 100) {
                        totalDiscount += (currentAmount * cond.discountAmount) / 100;
                    } else {
                        totalDiscount += cond.discountAmount;
                    }
                }
            }
        });

        // Nếu không thỏa mãn số tiền tối thiểu thì coupon không có giá trị
        return isMinimumSatisfied ? totalDiscount : 0;
    }, [appliedCoupon]);

    // --- 1. XỬ LÝ ÁP DỤNG MÃ (APPLY COUPON) ---
    const applyCoupon = async (code, currentAmount) => {
        try {
            const coupon = await CouponService.getCouponByCode(code);
            
            // Validate sơ bộ trước khi lưu vào State
            if (!coupon.active) {
                toast.error("Mã giảm giá đã bị vô hiệu hóa.");
                return null;
            }

            if (new Date() > new Date(coupon.expiredAt)) {
                toast.error("Mã giảm giá đã hết hạn.");
                return null;
            }

            setAppliedCoupon(coupon);
            const tempDiscount = calculateTempDiscount(coupon, currentAmount);
            if (tempDiscount > 0) {
                toast.success("Áp dụng mã thành công!");
            } else {
                toast.info("Mã đã lưu, nhưng đơn hàng chưa đủ điều kiện để giảm giá.");
            }

            return coupon;
        } catch (error) {
            toast.error("Mã giảm giá không tồn tại.");
            setAppliedCoupon(null);
            return null;
        }
    };

    // Hàm hỗ trợ check nhanh cho applyCoupon
    const calculateTempDiscount = (coupon, amount) => {
        let discount = 0;
        const minCond = coupon.conditions?.find(c => c.attribute === "minimum_amount");
        if (minCond && amount > parseFloat(minCond.value)) {
            discount += minCond.discountAmount;
        }
        return discount;
    };

    // --- 2. XỬ LÝ ĐẶT HÀNG (PROCESS ORDER) ---
    const processOrder = useCallback(async () => {
        // Kiểm tra điều kiện bắt buộc
        if (!selectedAddress || !selectedAddress.id) {
            toast.error("Vui lòng chọn địa chỉ giao hàng.");
            return false;
        }

        if (selectedItemsForCheckout.length === 0) {
            toast.error("Không có sản phẩm nào để thanh toán.");
            return false;
        }

        const paymentMethodBE = method.toUpperCase();

        try {
            toast.info("Đang xử lý đơn hàng...");
            
            const response = await OrderService.checkout(
                paymentMethodBE,
                selectedAddress.id,
                orderNote
            );

            // XỬ LÝ SAU KHI GỌI API THÀNH CÔNG
            if (paymentMethodBE === "COD") {
                toast.success("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
                if (fetchUserCart) await fetchUserCart();
                clearOrderData(); // Xóa dữ liệu tạm thời
                navigate('/my-orders'); 
            } 
            else {
                // Xử lý thanh toán Online (VNPAY, Stripe, v.v.)
                const paymentUrl = response?.result?.paymentUrl || response?.paymentUrl;
                if (paymentUrl) {
                    toast.success("Đang chuyển đến trang thanh toán...");
                    window.location.href = paymentUrl;
                    if (fetchUserCart) await fetchUserCart();
                    clearOrderData();
                } else {
                    toast.warn("Đơn hàng đã tạo nhưng không tìm thấy link thanh toán.");
                    navigate('/my-orders');
                }
            }
            return true;
        } catch (error) {
            console.error("Order Error:", error);
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi đặt hàng.";
            toast.error(errorMessage);
            return false;
        }
    }, [method, selectedAddress, orderNote, selectedItemsForCheckout, appliedCoupon, navigate]);

    // --- 3. DỌN DẸP DỮ LIỆU ---
    const clearOrderData = () => {
        setOrderNote('');
        setAppliedCoupon(null);
        setSelectedItemsForCheckout([]);
    };

    // --- EXPOSE VALUES ---
    const value = {
        // States
        method, setMethod,
        selectedAddress, setSelectedAddress,
        orderNote, setOrderNote,
        appliedCoupon, setAppliedCoupon,
        selectedItemsForCheckout, setSelectedItemsForCheckout,
        getValidDiscount,
        applyCoupon,
        processOrder,
        clearOrderData
    };
    
    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrderContext = () => useContext(OrderContext);
