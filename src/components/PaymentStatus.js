import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import OrderService from '../services/OrderSevice';
import { useUserContext } from '../context/UserContext'; 
import { FaCircleCheck, FaCircleXmark, FaSpinner } from "react-icons/fa6";

const PaymentStatus = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { fetchUserCart } = useUserContext(); // Lấy hàm reset giỏ hàng

    // State giao diện
    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [message, setMessage] = useState("Đang xác thực thanh toán...");

    // Lấy tham số từ URL VNPAY trả về
    const queryParams = new URLSearchParams(location.search);
    const trackingNumber = queryParams.get('vnp_TxnRef');
    const responseCode = queryParams.get('vnp_ResponseCode');
    const amount = queryParams.get('vnp_Amount'); // Số tiền (nếu có)

    useEffect(() => {
        const verifyPayment = async () => {
            // 1. Kiểm tra tham số cơ bản
            if (!trackingNumber || !responseCode) {
                setIsLoading(false);
                setIsSuccess(false);
                setMessage("Không tìm thấy thông tin giao dịch hợp lệ.");
                return;
            }

            try {
                // 2. Xác định trạng thái từ VNPAY (00 là thành công)
                const vnpaySuccess = responseCode === '00';

                // 3. Gọi Backend để cập nhật trạng thái đơn hàng (Endpoint: /orders/vnpay/callback)
                // Lưu ý: Đảm bảo OrderService đã sửa đường dẫn thành '/orders/vnpay/callback'
                const apiResponse = await OrderService.vnPayCallback(trackingNumber, vnpaySuccess);

                // 4. Xử lý kết quả dựa trên phản hồi của VNPAY và Backend
                if (vnpaySuccess) {
                    setIsSuccess(true);
                    
                    // Lấy message từ Backend trả về (apiResponse.result = "Thanh toán thành công")
                    setMessage(apiResponse?.result || "Thanh toán thành công!"); 
                    toast.success("Giao dịch đã được xác nhận.");

                    // --- QUAN TRỌNG: RESET GIỎ HÀNG ---
                    if (fetchUserCart) {
                        await fetchUserCart(); 
                    }
                } else {
                    setIsSuccess(false);
                    setMessage("Giao dịch bị hủy hoặc thất bại tại cổng thanh toán.");
                    toast.error("Thanh toán thất bại.");
                }
            } catch (error) {
                console.error("Payment Verify Error:", error);
                // Nếu VNPAY trả về thành công nhưng gọi API Backend bị lỗi -> Vẫn coi là cần kiểm tra lại
                setIsSuccess(false);
                setMessage("Lỗi kết nối đến hệ thống. Vui lòng liên hệ CSKH.");
            } finally {
                setIsLoading(false);
            }
        };

        // Delay 1.5s để hiện hiệu ứng loading cho mượt
        const timer = setTimeout(() => {
            verifyPayment();
        }, 1500);

        return () => clearTimeout(timer);
    }, [trackingNumber, responseCode, fetchUserCart]);

    // --- GIAO DIỆN HIỂN THỊ ---
    return (
        <div className='max-padd-container py-18 bg-primary min-h-[110vh] flex items-center justify-center'>
            <div className='max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center ring-1 ring-slate-900/5'>
                
                {/* 1. TRẠNG THÁI LOADING */}
                {isLoading ? (
                    <div className='flex flex-col items-center justify-center gap-4'>
                        <FaSpinner className='text-6xl text-secondary animate-spin' />
                        <h2 className='text-2xl font-bold text-gray-800'>Đang xử lý kết quả...</h2>
                        <p className='text-gray-500'>Vui lòng đợi trong giây lát.</p>
                    </div>
                ) : (
                    
                /* 2. HIỂN THỊ KẾT QUẢ */
                <div className='flex flex-col items-center gap-6'>
                    {/* Icon trạng thái */}
                    <div className={`text-8xl ${isSuccess ? 'text-green-500' : 'text-red-500'} animate-bounce`}>
                        {isSuccess ? <FaCircleCheck /> : <FaCircleXmark />}
                    </div>

                    {/* Tiêu đề & Thông báo */}
                    <div>
                        <h2 className={`text-3xl font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                            {isSuccess ? "Thanh Toán Thành Công!" : "Thanh Toán Thất Bại"}
                        </h2>
                        <p className='text-gray-600 mt-2 text-lg font-medium'>{message}</p>
                    </div>

                    {/* Hộp thông tin chi tiết */}
                    <div className='w-full bg-white rounded-xl p-5 border border-gray-100 flex flex-col gap-2 mt-2'>
                        <div className='flex justify-between text-sm border-b border-dashed border-gray-300 pb-2 mb-2'>
                            <span className='text-gray-500'>Mã giao dịch</span>
                            <span className='font-bold text-gray-800'>{trackingNumber}</span>
                        </div>
                        {amount && (
                            <div className='flex justify-between text-sm'>
                                <span className='text-gray-500'>Tổng tiền</span>
                                <span className='font-bold text-gray-800 text-lg'>
                                    {(parseInt(amount) / 100).toLocaleString('vi-VN')} đ
                                </span>
                            </div>
                        )}
                        <div className='flex justify-between text-sm mt-2'>
                            <span className='text-gray-500'>Thời gian</span>
                            <span className='font-bold text-gray-800'>{new Date().toLocaleString('vi-VN')}</span>
                        </div>
                    </div>

                    {/* Nút điều hướng */}
                    <div className='flex flex-col sm:flex-row gap-4 w-full mt-4'>
                        <button 
                            onClick={() => navigate('/')} 
                            className='flex-1 px-6 py-3 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-100 transition-all'
                        >
                            Về trang chủ
                        </button>
                        <button 
                            onClick={() => navigate(isSuccess ? '/my-orders' : '/cart')} 
                            className={`flex-1 btn-solid !rounded-xl py-3 font-bold shadow-lg uppercase tracking-wide text-white ${isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                            {isSuccess ? "Xem đơn hàng" : "Quay lại giỏ hàng"}
                        </button>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default PaymentStatus;