import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import CouponService from '../../services/CouponService';

function CouponDetail() {

    const { couponCode } = useParams(); 
    const navigate = useNavigate();
    
    const [coupon, setCoupon] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCouponDetail();
    }, []);

    const fetchCouponDetail = async () => {
        try {
            setLoading(true);
            const data = await CouponService.getCouponByCode(couponCode);
            setCoupon(data); 
        } catch (error) {
            console.error(error);
            toast.error("Không tìm thấy thông tin mã giảm giá");
            navigate('/admin/list-coupon'); // Quay lại trang danh sách nếu lỗi
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if(window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này không?")) {
            try {
                await CouponService.deleteCoupon(coupon.id);
                toast.success("Đã xóa mã giảm giá");
                navigate('/admin/list-coupon');
            } catch (error) {
                toast.error("Xóa thất bại");
            }
        }
    };

    //Format tiền tệ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Format ngày
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Dịch thuật ngữ Attribute sang tiếng Việt
    const translateAttribute = (attr) => {
        const dict = {
            'minimum_amount': 'Giá trị đơn tối thiểu',
            'applicable_date': 'Ngày áp dụng',
        };
        return dict[attr] || attr;
    };

    // Dịch Operator
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
        <div className="bg-slate-50 min-h-screen p-4 md:p-8 font-sans w-full">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">

                {/* --- HEADER: GRADIENT & MODERN --- */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold tracking-tight">Chi tiết Mã Giảm Giá</h2>
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-mono text-indigo-50 border border-white/20">
                                #{coupon.id}
                            </span>
                        </div>
                        <p className="text-indigo-100 text-sm mt-1 opacity-90">Quản lý thông tin và điều kiện áp dụng</p>
                    </div>

                    <div className="flex gap-3 relative z-10">
                        <button
                            onClick={() => navigate('/admin/list-coupon')}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition backdrop-blur-sm border border-white/10"
                        >
                            Quay lại
                        </button>
                        <button
                            onClick={() => navigate(`/admin/edit-coupon/${coupon.code}`)}
                            className="px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-bold shadow-sm transition flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Chỉnh sửa
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium shadow-sm transition border border-rose-600"
                        >
                            Xóa
                        </button>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    {/* --- INFO SECTION: CARD STYLE --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                        {/* Mã Code - Highlight */}
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mã Coupon</label>
                            <div className="flex items-center justify-center p-6 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-xl relative group hover:border-indigo-400 transition-colors">
                                <p className="text-3xl font-mono font-black text-indigo-700 tracking-wide select-all">
                                    {coupon.code}
                                </p>
                                {/* Decorative circles to look like a ticket */}
                                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r border-slate-100"></div>
                                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l border-slate-100"></div>
                            </div>
                        </div>

                        {/* Thông tin chi tiết */}
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Trạng thái */}
                            <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Trạng thái</label>
                                <div className="mt-1 flex items-center gap-2">
                                    {coupon.active && !isExpired ? (
                                        <>
                                            <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                            </span>
                                            <span className="text-emerald-700 font-bold text-base">Đang hoạt động</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="h-3 w-3 rounded-full bg-rose-500"></span>
                                            <span className="text-rose-700 font-bold text-base">
                                                {isExpired ? 'Đã hết hạn' : 'Ngưng hoạt động'}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Ngày hết hạn */}
                            <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Hết hạn vào</label>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p className="text-lg font-semibold">{formatDate(coupon.expiredAt)}</p>
                                </div>
                            </div>

                            {/* Mô tả */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mô tả</label>
                                <p className="text-gray-600 bg-white p-3 rounded-lg border border-gray-100 text-sm leading-relaxed shadow-sm">
                                    {coupon.description || "Không có mô tả cho mã giảm giá này."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* --- CONDITIONS TABLE: CLEAN & SPACIOUS --- */}
                    <div className="border-t border-gray-100 pt-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Điều kiện & Mức giảm</h3>
                        </div>
                        
                        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-solid border-b border-indigo-100/50">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-white uppercase text-xs tracking-wider">ID</th>
                                        <th className="px-6 py-4 font-semibold text-white uppercase text-xs tracking-wider">Loại điều kiện</th>
                                        <th className="px-6 py-4 font-semibold text-white uppercase text-xs tracking-wider">Phép toán</th>
                                        <th className="px-6 py-4 font-semibold text-white uppercase text-xs tracking-wider">Giá trị kích hoạt</th>
                                        <th className="px-6 py-4 font-semibold text-white uppercase text-xs tracking-wider text-right">Mức giảm</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {coupon.conditions && coupon.conditions.length > 0 ? (
                                        coupon.conditions.map((item) => (
                                            <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                                                <td className="px-6 py-4 text-gray-400 font-mono">#{item.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-800">{translateAttribute(item.attribute)}</div>
                                                    <span className="text-xs text-gray-400 font-mono">{item.attribute}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 font-mono">
                                                        {translateOperator(item.operator)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700 font-medium">
                                                    {item.attribute === 'minimum_amount' 
                                                        ? formatCurrency(item.value) 
                                                        : (item.attribute === 'applicable_date' ? formatDate(item.value) : item.value)
                                                    }
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold">
                                                        {item.discountAmount > 100 
                                                            ? formatCurrency(item.discountAmount) 
                                                            : `-${item.discountAmount}%`
                                                        }
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic bg-gray-50/50">
                                                <div className="flex flex-col items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                                                    <span>Mã này không có điều kiện ràng buộc (Áp dụng cho mọi đơn hàng)</span>
                                                </div>
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
