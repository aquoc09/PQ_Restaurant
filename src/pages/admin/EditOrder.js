import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useUserContext } from '../../context/UserContext';
import OrderService from '../../services/OrderSevice';
import { myAssets } from '../../assets/assets';

function EditOrder() {
    const { orderId } = useParams();
    const { navigate, formatCurrency } = useUserContext();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Lưu trữ toàn bộ object order gốc để gửi kèm lại các field không sửa (address, details...)
    const [originalOrder, setOriginalOrder] = useState(null);

    // State cho các trường cho phép chỉnh sửa
    const [formData, setFormData] = useState({
        status: '',
        note: '',
        shippingMethod: '',
        trackingNumber: '',
        active: 'true', // Dùng string cho select, khi gửi sẽ convert sang boolean
    });

    // Load dữ liệu ban đầu
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await OrderService.getOrder(orderId);
                setOriginalOrder(data);

                // Xử lý parse Note (JSON -> Text) để hiển thị vào ô input
                let noteText = "";
                try {
                    if (data.note && data.note.trim().startsWith('{')) {
                        const noteObj = JSON.parse(data.note);
                        noteText = noteObj.note || data.note;
                    } else {
                        noteText = data.note || "";
                    }
                } catch (e) { noteText = data.note; }

                // Fill dữ liệu vào Form
                setFormData({
                    status: data.status || 'PENDING',
                    note: noteText,
                    shippingMethod: data.shippingMethod || '',
                    trackingNumber: data.trackingNumber || '',
                    active: data.active ? 'true' : 'false',
                });
            } catch (error) {
                console.error(error);
                toast.error("Không thể tải thông tin đơn hàng!");
                navigate('/admin/list-order');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) fetchOrder();
    }, [orderId, navigate]);

    // Xử lý thay đổi input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Submit Form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const requestPayload = {
                ...originalOrder, 
                
                // Ghi đè các trường đã sửa
                status: formData.status,
                active: formData.active === 'true', // Convert string -> boolean
                shippingMethod: formData.shippingMethod || null,
                trackingNumber: formData.trackingNumber || null,
                
                note: JSON.stringify({ note: formData.note }) 
            };

            // Log kiểm tra payload trước khi gửi
            console.log("Sending Update Payload:", requestPayload);

            await OrderService.updateOrder(orderId, requestPayload);
            
            toast.success("Cập nhật đơn hàng thành công!");
            navigate(`/admin/order-detail/${orderId}`); // Quay về trang xem chi tiết

        } catch (error) {
            console.error("Update failed:", error);
            toast.error("Cập nhật thất bại! Vui lòng kiểm tra lại.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-20 w-full">
            <div className="">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">Edit Order #{orderId}</h1>
                        <p className="text-slate-500 text-sm mt-1">Cập nhật trạng thái và thông tin vận chuyển</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* FORM CHÍNH */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/*  Trạng thái & Active */}
                        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                                Trạng thái đơn hàng
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Status Select */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Order Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-700"
                                    >
                                        <option value="PENDING">PENDING (Chờ xử lý)</option>
                                        <option value="COMPLETED">COMPLETED (Đã nhận)</option>
                                        <option value="PAID">PAID (Đã thanh toán)</option>
                                        <option value="NOT_PAY">NOT_PAY (Chưa thanh toán)</option>
                                        <option value="DENIED">DENIED (Từ chối)</option>
                                    </select>
                                </div>

                                {/* Active Select */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Active (Hiển thị)</label>
                                    <select
                                        name="active"
                                        value={formData.active}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-700"
                                    >
                                        <option value="true">Active (Hiện)</option>
                                        <option value="false">Inactive (Ẩn)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Vận chuyển */}
                        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6">
                             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                                Vận chuyển (Shipping)
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Shipping Method */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Shipping Method</label>
                                    <input 
                                        type="text"
                                        name="shippingMethod"
                                        value={formData.shippingMethod}
                                        onChange={handleInputChange}
                                        placeholder="Ví dụ: GHN, ViettelPost..."
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                                    />
                                </div>

                                {/* Tracking Number */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tracking Number</label>
                                    <input 
                                        type="text"
                                        name="trackingNumber"
                                        value={formData.trackingNumber}
                                        onChange={handleInputChange}
                                        placeholder="Mã vận đơn..."
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Ghi chú */}
                        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                                Ghi chú (Note)
                            </h3>
                            <textarea
                                rows="4"
                                name="note"
                                value={formData.note}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-amber-50/30 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition text-slate-700 leading-relaxed resize-none"
                                placeholder="Nhập ghi chú cho đơn hàng..."
                            ></textarea>
                            <p className="text-xs text-slate-400 mt-2 text-right">Ghi chú này sẽ được lưu đè lên ghi chú cũ.</p>
                        </div>

                         {/* ACTION BUTTONS (Mobile & Desktop) */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(`/admin/order-detail/${orderId}`)}
                                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition shadow-sm"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center gap-2"
                            >
                                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="bg-slate-100 rounded-xl p-6 border border-slate-200">
                            <h4 className="font-bold text-slate-700 mb-5 uppercase text-sm tracking-wider border-b border-slate-200 pb-2">
                                Thông tin tóm tắt
                            </h4>
                            
                            <div className="space-y-4 text-base">
                                <div className="flex justify-between items-start">
                                    <span className="text-slate-500 font-medium whitespace-nowrap">Khách hàng:</span>
                                    <span className="font-bold text-slate-800 text-right ml-4">
                                        {originalOrder?.address?.user?.fullName}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-medium">SĐT:</span>
                                    <span className="font-bold text-slate-800 font-mono text-lg">
                                        {originalOrder?.address?.phoneNumber}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center border-t border-slate-300 pt-4 mt-2">
                                    <span className="text-slate-600 font-bold text-lg">Tổng tiền:</span>
                                    {/* Giá tiền to và nổi bật hơn hẳn */}
                                    <span className="font-black text-indigo-700 text-2xl">
                                        {formatCurrency(originalOrder?.totalMoney)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Product List Mini */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <h4 className="font-bold text-slate-700 mb-5 uppercase text-sm tracking-wider border-b border-slate-100 pb-2">
                                Sản phẩm ({originalOrder?.orderDetails?.length})
                            </h4>
                            
                            <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {originalOrder?.orderDetails?.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-start group">
                                        <div className="w-16 h-16 bg-slate-100 rounded-lg border border-slate-200 shrink-0 overflow-hidden shadow-sm group-hover:shadow-md transition">
                                                {item.product?.productImage ? (
                                                    <img src={myAssets[item.product.productImage]} alt="" className="w-full h-full object-cover"/>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200 text-xs">NO IMG</div>
                                                )}
                                        </div>
                                        
                                        <div className="flex-1">
                                            <p className="text-[15px] font-bold text-slate-800 line-clamp-2 leading-snug">
                                                {item.product?.name}
                                            </p>
                                            
                                            <div className="flex justify-between items-center mt-2">
                                                {/* Size và số lượng */}
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                    {item.size} <span className="text-slate-400 mx-1.5">x</span> {item.numProducts}
                                                </span>
                                                
                                                {/* Giá tiền của từng món */}
                                                <span className="text-sm font-bold text-indigo-600">
                                                    {formatCurrency(item.price)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditOrder;