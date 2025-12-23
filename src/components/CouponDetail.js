import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import CouponService from '../services/CouponService';

function CouponDetail() {

    const { couponCode } = useParams(); 
const navigate = useNavigate();
    
    const [coupon, setCoupon] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCouponDetail();
    }, [couponCode]);

    const fetchCouponDetail = async () => {
        try {
            setLoading(true);
            const data = await CouponService.getCouponByCode(couponCode);
            setCoupon(data); 
        } catch (error) {
            console.error(error);
            toast.error("Không tìm thấy thông tin mã giảm giá");
            navigate('/admin/coupons'); // Quay lại trang danh sách nếu lỗi
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if(window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này không?")) {
            try {
                await CouponService.deleteCoupon(coupon.id);
                toast.success("Đã xóa mã giảm giá");
                navigate('/admin/coupons');
            } catch (error) {
                toast.error("Xóa thất bại");
            }
        }
    };

    // Helper: Format tiền tệ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Helper: Format ngày
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Helper: Dịch thuật ngữ Attribute sang tiếng Việt
    const translateAttribute = (attr) => {
        const dict = {
            'minimum_amount': 'Giá trị đơn tối thiểu',
            'applicable_date': 'Ngày áp dụng',
            // Thêm các key khác nếu có
        };
        return dict[attr] || attr;
    };

    // Helper: Dịch Operator
    const translateOperator = (op) => {
        const dict = {
            '>': 'Lớn hơn',
            '<': 'Nhỏ hơn',
            '=': 'Bằng',
            '>=': 'Lớn hơn hoặc bằng',
            '<=': 'Nhỏ hơn hoặc bằng',
            'before': 'Trước ngày',
            'after': 'Sau ngày'
        };
        return dict[op] || op;
    };

    if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
    if (!coupon) return null;

    const isExpired = new Date(coupon.expiredAt) < new Date();

    return (
        <div className="bg-slate-50 min-h-screen p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                
                {/* HEADER */}
                <div className="bg-gray-800 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Chi tiết Mã Giảm Giá</h2>
                        <p className="text-gray-400 text-sm">ID: #{coupon.id}</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => navigate('/admin/coupons')}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm transition"
                        >
                            Quay lại
                        </button>
                        <button 
                            onClick={() => navigate(`/admin/coupon-edit/${coupon.id}`)} // Giả sử có trang edit
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm transition"
                        >
                            Chỉnh sửa
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm transition"
                        >
                            Xóa
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    {/* INFO SECTION */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 uppercase">Mã Coupon</label>
                            <p className="text-3xl font-mono font-bold text-red-600 mt-1">{coupon.code}</p>
                        </div>
                        
                        <div className="flex gap-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 uppercase">Trạng thái</label>
                                <div className="mt-2">
                                    {coupon.active && !isExpired ? (
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold border border-green-200">
                                            Đang hoạt động
                                        </span>
                                    ) : (
                                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold border border-red-200">
                                            {isExpired ? 'Đã hết hạn' : 'Ngưng hoạt động'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 uppercase">Ngày hết hạn</label>
                                <p className="text-lg font-medium text-gray-800 mt-1">{formatDate(coupon.expiredAt)}</p>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500 uppercase">Mô tả</label>
                            <p className="text-gray-700 mt-1 bg-gray-50 p-3 rounded border">{coupon.description}</p>
                        </div>
                    </div>

                    {/* CONDITIONS TABLE */}
                    <div className="border-t pt-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-2 h-8 bg-blue-500 rounded-sm"></span>
                            Điều kiện & Mức giảm
                        </h3>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left text-gray-500 border border-gray-200 rounded-lg">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 border-b">ID</th>
                                        <th className="px-6 py-3 border-b">Loại điều kiện (Attribute)</th>
                                        <th className="px-6 py-3 border-b">Phép so sánh (Operator)</th>
                                        <th className="px-6 py-3 border-b">Giá trị điều kiện (Value)</th>
                                        <th className="px-6 py-3 border-b text-right">Mức giảm (Discount)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coupon.conditions && coupon.conditions.length > 0 ? (
                                        coupon.conditions.map((item) => (
                                            <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4">#{item.id}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {translateAttribute(item.attribute)} 
                                                    <span className="text-xs text-gray-400 block font-normal">({item.attribute})</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-mono">
                                                        {translateOperator(item.operator)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold">
                                                    {/* Nếu là tiền thì format tiền, nếu là ngày thì format ngày, còn lại để nguyên */}
                                                    {item.attribute === 'minimum_amount' 
                                                        ? formatCurrency(item.value) 
                                                        : (item.attribute === 'applicable_date' ? formatDate(item.value) : item.value)
                                                    }
                                                </td>
                                                <td className="px-6 py-4 text-right text-green-600 font-bold">
                                                    {item.discountAmount > 100 
                                                        ? formatCurrency(item.discountAmount) 
                                                        : `${item.discountAmount}%`
                                                    }
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-400 italic">
                                                Không có điều kiện nào (Mã áp dụng cho mọi đơn hàng)
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default CouponDetail
