import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import CouponService from '../../services/CouponService';
import CouponConditionService from '../../services/CouponConditionService';

const ATTRIBUTES = [
    { value: 'minimum_amount', label: 'Tổng tiền tối thiểu' },
    { value: 'applicable_date', label: 'Ngày áp dụng' },
    { value: 'quantity', label: 'Số lượng sản phẩm' },
];

const OPERATORS = [
    { value: '>', label: 'Lớn hơn (>)' },
    { value: '>=', label: 'Lớn hơn hoặc bằng (>=)' },
    { value: '<', label: 'Nhỏ hơn (<)' },
    { value: '<=', label: 'Nhỏ hơn hoặc bằng (<=)' },
    { value: '=', label: 'Bằng (=)' },
];

function AddCoupon() {

    const navigate = useNavigate(); 
    const [saving, setSaving] = useState(false);

    const [couponData, setCouponData] = useState({
        code: '',
        description: '',
        expiredAt: '',
        active: 'true'
    });

    const [conditions, setConditions] = useState([]);
    // --- HANDLERS ---
    const handleCouponChange = (e) => {
        const { name, value } = e.target;
        setCouponData(prev => ({ ...prev, [name]: value }));
    };

    const handleConditionChange = (index, field, value) => {
        const updatedConditions = [...conditions];
        updatedConditions[index][field] = value;
        setConditions(updatedConditions);
    };

    const handleAddCondition = () => {
        const newCondition = {
            id: null,
            attribute: 'minimum_amount',
            operator: '>',
            value: '',
            discountAmount: 0,
        };
        setConditions([...conditions, newCondition]);
    };

    // CHỨC NĂNG XÓA ĐIỀU KIỆN
    const handleRemoveCondition = async (index) => {
        // Cập nhật lại UI (Xóa khỏi mảng state)
        const updated = conditions.filter((_, i) => i !== index);
        setConditions(updated);
    };

    // --- SUBMIT ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!couponData.code || !couponData.expiredAt) {
            toast.warning("Vui lòng nhập Mã code và Ngày hết hạn");
            return;
        }

        setSaving(true);

        try {
            // BƯỚC 1: TẠO COUPON TRƯỚC
            const couponRequest = {
                code: couponData.code.trim().toUpperCase(),
                description: couponData.description,
                expiredAt: couponData.expiredAt,
                active: couponData.active === 'true'
            };
            
            console.log("dd:", couponRequest);
            await CouponService.createCoupon(couponRequest);
    
            toast.success("Thêm mã giảm giá thành công!");
            navigate(`/manager/list-coupon`);

        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            toast.error("Thêm thất bại. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

  return (
        <div className="bg-slate-50 min-h-screen w-full p-4 md:p-8">
            <div className="w-full mx-auto">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Thêm Mã Giảm Giá Mới</h1>
                        <p className="text-slate-500 text-sm mt-1">Tạo chương trình khuyến mãi và thiết lập điều kiện</p>
                    </div>
                    <button 
                        onClick={() => navigate(`/admin/list-coupon`)}
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm shadow-sm transition"
                    >
                        Quay lại
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* CARD 1: THÔNG TIN CƠ BẢN (COUPON INFO) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-50 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                            Thông tin chung
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Code */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Mã Code</label>
                                <input 
                                    type="text" 
                                    name="code"
                                    value={couponData.code}
                                    onChange={handleCouponChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold text-indigo-700 uppercase tracking-wide transition"
                                />
                            </div>

                            {/* Expired At */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Ngày hết hạn</label>
                                <input 
                                    type="date" 
                                    name="expiredAt"
                                    value={couponData.expiredAt}
                                    onChange={handleCouponChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition text-slate-700"
                                />
                            </div>

                            {/* Active */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Trạng thái</label>
                                <select 
                                    name="active"
                                    value={couponData.active}
                                    onChange={handleCouponChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition text-slate-700"
                                >
                                    <option value="true">Kích hoạt ngay</option>
                                    <option value="false">Tạo nháp (Ẩn)</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Mô tả</label>
                                <textarea 
                                    name="description"
                                    rows="2"
                                    value={couponData.description}
                                    onChange={handleCouponChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition text-slate-700 resize-none"
                                    placeholder="Nhập mô tả cho mã giảm giá..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* --- FOOTER ACTION --- */}
                    <div className="w-full flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => navigate(`/manager/list-coupon`)}
                            className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Đang lưu...</span>
                                </>
                            ) : (
                                <span>Lưu thay đổi</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddCoupon
