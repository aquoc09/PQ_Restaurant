// FILE: src/pages/PaymentStatus.js (Component mới)
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OrderService from '../services/OrderSevice'; // Service chứa vnPayCallback

const PaymentStatus = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const [status, setStatus] = useState("Đang xử lý...");
    
    // Lấy các tham số từ URL VNPAY trả về
    const trackingNumber = queryParams.get('vnp_TxnRef'); // ID đơn hàng
    const responseCode = queryParams.get('vnp_ResponseCode'); // Mã phản hồi VNPAY
    
    // Giả định: 00 là thành công
    const isSuccess = responseCode === '00' ? true : false;
    
    useEffect(() => {
        if (trackingNumber) {
            // Gọi hàm Service để xác nhận trạng thái
            const confirmPayment = async () => {
                try {
                    // Gọi API BE để xác nhận kết quả
                    const result = await OrderService.vnPayCallback(trackingNumber, isSuccess);
                    
                    if (result && result.status === 'SUCCESS') {
                        setStatus("Thanh toán thành công!");
                        toast.success("Thanh toán đơn hàng đã được xác nhận.");
                    } else {
                        setStatus("Thanh toán thất bại hoặc đang chờ xử lý.");
                        toast.error("Giao dịch VNPAY không thành công hoặc bị từ chối.");
                    }
                } catch (error) {
                    setStatus("Lỗi kết nối khi xác nhận giao dịch.");
                    toast.error("Lỗi khi xác nhận giao dịch VNPAY.");
                }
            };
            confirmPayment();
        } else {
            setStatus("Không tìm thấy thông tin giao dịch VNPAY.");
        }
    }, [trackingNumber, isSuccess]);

    return (
        <div className='container mx-auto p-8 text-center'>
            <h2 className='text-2xl font-bold'>Kết Quả Thanh Toán</h2>
            <p className={`text-lg mt-4 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                Trạng thái: {status}
            </p>
            {trackingNumber && <p className='text-gray-500'>Mã Đơn hàng: {trackingNumber}</p>}
            <button 
                onClick={() => window.location.href = '/my-orders'} 
                className='mt-6 btn-solid'
            >
                Xem đơn hàng của tôi
            </button>
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
        </div>
    );
};

export default PaymentStatus;