import React, { useMemo, useEffect, useState } from 'react'
import Title from '../components/Title'
import { useUserContext } from '../context/UserContext'
import { useOrderContext } from '../context/OrderContext'
import { toast } from 'react-toastify'
import { myAssets } from '../assets/assets'
import CheckoutItem from '../components/CheckoutItem'

const Checkout = () => {
    const { navigate, formatCurrency, delivery_charges, isAuthenticated } = useUserContext();
    const { 
        method, 
        setMethod, 
        selectedAddress, 
        orderNote, 
        setOrderNote,
        selectedItemsForCheckout,
        getValidDiscount,
        processOrder
    } = useOrderContext();

    const [isProcessing, setIsProcessing] = useState(false);

    // Lọc ra danh sách các sản phẩm thực tế người dùng đã chọn từ Cart
    const itemsToDisplay = selectedItemsForCheckout || [];

    // Tính toán tổng tiền ngay tại trang Checkout
    const { subTotal, totalAmount, discountValue } = useMemo(() => {
        const sub = itemsToDisplay.reduce((total, item) => total + item.totalMoney, 0);
        // const tax = sub * 0.08;
        const discount = getValidDiscount(sub); 
        const total = Math.max(0, sub  + (sub > 0 ? delivery_charges : 0) - discount);
        
        return { subTotal: sub, totalAmount: total, discountValue: discount };
    }, [itemsToDisplay, delivery_charges, getValidDiscount]);

    // Bảo vệ trang: Nếu chưa chọn món hoặc chưa login thì đẩy về Cart
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } else if (itemsToDisplay.length === 0) {
            toast.warn("Không có sản phẩm nào được chọn để thanh toán.");
            navigate('/cart');
        }
    }, [itemsToDisplay, isAuthenticated, navigate]);

    // Hàm xử lý khi bấm nút Order
    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error("Vui lòng chọn địa chỉ giao hàng trước khi thanh toán.");
            return;
        }

        try {
            setIsProcessing(true);
            await processOrder(totalAmount);
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra khi xử lý đơn hàng.");
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <div className='max-padd-container py-16 xl:py-24 bg-gradient-to-br from-slate-50 to-primary'>
            <Title title1={"Checkout"} title2={"Order Summary"} titleStyles={"pb-10"} />

            <div className='flex flex-col xl:flex-row gap-12'>
                {/* --- BÊN TRÁI: CHI TIẾT ĐƠN HÀNG --- */}
                <div className='flex-[2] flex flex-col gap-6'>
                    
                    {/* Danh sách sản phẩm */}
                    <div className='bg-white p-6 rounded-2xl shadow-sm'>
                        <h4 className='bold-18 mb-4 border-b pb-2 text-gray-600'>Products selected</h4>
                        <div className='space-y-4'>
                            {itemsToDisplay.map((item) => (
                                <CheckoutItem 
                                    key={item.id} 
                                    item={item} 
                                    formatCurrency={formatCurrency} 
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- BÊN PHẢI: TỔNG KẾT TIỀN --- */}
                <div className='flex-1'>
                    <div className='bg-white p-8 rounded-2xl shadow-sm sticky top-28'>
                        <h3 className='bold-20 mb-6'>Total Billing</h3>

                        <div className='flex flex-col gap-2'>
                            <h4 className='text-gray-900 font-semibold'>Delivery Address</h4>
                            <div className='flex gap-2'>
                                {selectedAddress ? (
                                    <div className='pt-2'>
                                        <p className='font-medium'>{selectedAddress.fullName}</p>
                                        <p className='text-gray-600 text-sm'>{selectedAddress.phone}</p>
                                        <p className='text-gray-500'>{selectedAddress.fullAddress}</p>
                                    </div>
                                ) : (
                                    <p className='text-red-500'>Vui lòng quay lại giỏ hàng để chọn địa chỉ.</p>
                                )}
                            </div>
                        </div>

                        <hr className='border-gray-300 mt-5 pb-3' />

                        <div className='flex flex-col gap-2'>
                            <h4 className='text-gray-900 font-semibold'>Payment Method</h4>
                            <div className='flex gap-3'>
                                <button 
                                    onClick={() => setMethod('COD')}
                                    className={`flex-1 py-3 border rounded-xl transition-all text-semibold cursor-pointer ${method === 'COD' ? 'btn-solid text-white bold-15' : 'btn-light'}`}
                                >
                                    Cash
                                </button>
                                <button 
                                    onClick={() => setMethod('VNPAY')}
                                    className={`flex-1 py-3 border rounded-xl transition-all text-semibold cursor-pointer ${method === 'VNPAY' ? 'btn-solid text-white bold-15' : 'btn-light'}`}
                                >
                                    VNPay
                                </button>
                            </div>
                        </div>

                        <hr className='border-gray-300 mt-5 pb-3' />

                        <div className='flex flex-col gap-2'>
                        <h4 className='text-gray-900 font-semibold'>Order Note</h4>
                            <textarea
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                            placeholder="Thêm lời nhắn cho chúng tôi (ví dụ: không lấy hành, giao giờ hành chính...)"
                            className='w-full mt-2 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-secondary h-28'
                            />
                        </div>

                        <hr className='border-gray-300 mt-5' />
                        
                        <div className='space-y-3 pb-3 gap-3 pt-4 border-b'>
                            <div className='flex justify-between'>
                                <h5 className='text-gray-900'>Subtotal ({itemsToDisplay.length} items)</h5>
                                <p className='font-semibold'>{formatCurrency(subTotal)}</p>
                            </div>
                            <div className='flex justify-between'>
                                <h5 className='text-gray-900'>Shipping Fee</h5>
                                <p className='font-semibold'>{formatCurrency(delivery_charges)}</p>
                            </div>
                            {/* <div className='flex justify-between'>
                                <h5 className='text-gray-900'>Tax (8%)</h5>
                                <p className='font-semibold'>{formatCurrency(taxAmount)}</p>
                            </div> */}
                            {discountValue > 0 && (
                                <div className='flex justify-between text-green-600 font-bold'>
                                    <h5>Discount Applied</h5>
                                    <p>-{formatCurrency(discountValue)}</p>
                                </div>
                            )}
                        </div>

                        <div className='flex justify-between py-6'>
                            <h5 className='text-gray-900 font-bold text-lg'>Total Amount</h5>
                            <p className='text-xl font-bold text-solid'>{formatCurrency(totalAmount)}</p>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={isProcessing || !selectedAddress}
                            className={`text-white btn-solid w-full mt-6 !rounded-xl py-4 disabled:opacity-50 disabled:cursor-not-allowed uppercase font-bold tracking-widest shadow-xl transition-all active:scale-95
                                        ${isProcessing || !selectedAddress ? 'bg-gray-400 cursor-not-allowed opacity-70' : 'btn-solid text-white active:scale-95'}
                            `}
                        >
                            {isProcessing ? 'PROCESSING...' : 'ORDER NOW'}
                        </button>
                        
                        <p className='text-[12px] text-gray-400 mt-4 text-center'>
                            Please check your information carefully before ordering.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout