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

function EditCouponManager() {

    const { couponCode } = useParams(); 
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [couponData, setCouponData] = useState({
        code: '',
        description: '',
        expiredAt: '',
        active: 'true'
    });

    const [conditions, setConditions] = useState([]);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchCouponDetail = async () => {
            try {
                setLoading(true);
                const data = await CouponService.getCouponByCode(couponCode);

                setCouponData({
                    id: data.id,
                    code: data.code,
                    description: data.description || '',
                    expiredAt: data.expiredAt,
                    active: data.active ? 'true' : 'false'
                });

                // Mapping danh sách điều kiện
                setConditions(data.conditions || []);

            } catch (error) {
                console.error(error);
                toast.error("Không tìm thấy thông tin mã giảm giá");
                navigate('/manager/list-coupon');
            } finally {
                setLoading(false);
            }
        };

        if (couponCode) {
            fetchCouponDetail();
        }
    }, [couponCode, navigate]);

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
            id: null, // Đánh dấu là mới (chưa có ID từ DB)
            attribute: 'minimum_amount', // Giá trị mặc định
            operator: '>',
            value: '',
            discountAmount: 0,
            couponId: Number(couponData.id)
        };
        setConditions([...conditions, newCondition]);
    };

    // 2. CHỨC NĂNG XÓA ĐIỀU KIỆN
    const handleRemoveCondition = async (index) => {
        const conditionToRemove = conditions[index];

        // Nếu là điều kiện CŨ (đã có ID trong DB) -> Cần gọi API xóa thật
        if (conditionToRemove.id) {
            const confirm = window.confirm("Bạn có chắc muốn xóa điều kiện này không?");
            if (!confirm) return;

            try {
                await CouponConditionService.deleteCondition(conditionToRemove.id); 
                toast.success("Đã xóa điều kiện");
            } catch (error) {
                toast.error("Lỗi khi xóa điều kiện");
                return;
            }
        }

        // Cập nhật lại UI (Xóa khỏi mảng state)
        const updated = conditions.filter((_, i) => i !== index);
        setConditions(updated);
    };

    // --- SUBMIT ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Cập nhật Coupon (Parent)
            const couponRequest = {
                code: couponData.code,
                description: couponData.description,
                expiredAt: couponData.expiredAt,
                active: couponData.active === 'true'
            };
            
            await CouponService.updateCoupon(couponRequest, couponData.id);

            //Cập nhật Conditions (Children) - Chạy song song
            if (conditions.length > 0) {
                const conditionPromises = conditions.map(cond => {
                    // Mapping sang CouponConditionRequest
                    const req = {
                        attribute: cond.attribute,
                        operator: cond.operator,
                        value: cond.value.toString(),
                        discountAmount: Number(cond.discountAmount),
                        couponId: Number(couponData.id)
                    };
                    if (cond.id) {
                        // Nếu có ID -> Gọi UPDATE
                        return CouponConditionService.updateCondition(cond.id, req);
                    } else {
                        // Nếu ID là null -> Gọi CREATE (Thêm mới)
                        return CouponConditionService.createCondition(req);
                    }
                });

                await Promise.all(conditionPromises);
            }

            toast.success("Cập nhật thành công!");
            navigate(`/manager/coupon-detail/${couponData.code}`);

        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            toast.error("Cập nhật thất bại. Vui lòng thử lại.");
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
        <div className="bg-slate-50 min-h-screen w-full p-4 md:p-8">
            <div className="w-full mx-auto">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Chỉnh sửa Mã Giảm Giá</h1>
                        <p className="text-slate-500 text-sm mt-1">Cập nhật thông tin và điều kiện áp dụng</p>
                    </div>
                    <button 
                        onClick={() => navigate(`/manager/coupon-detail/${couponData.code}`)}
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
                                    <option value="true">Đang hoạt động</option>
                                    <option value="false">Ngưng hoạt động</option>
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

                    {/* CARD 2: DANH SÁCH ĐIỀU KIỆN (CONDITIONS) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-5 pb-2 border-b border-slate-50 w-full">
                            <h2 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-50 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                                Điều kiện áp dụng
                            </h2>
                            <button
                                type="button"
                                onClick={handleAddCondition}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                Thêm điều kiện
                            </button>
                        </div>
                        <div className="w-full flex-1">
                            {conditions.length === 0 ? (
                                <div className="w-full block text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                    <p className="text-slate-500 text-sm">Mã này áp dụng cho mọi đơn hàng (Không có điều kiện).</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {conditions.map((cond, index) => (
                                        <div key={cond.id || index} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm relative hover:border-indigo-300 transition-colors">
                                            <div className="absolute top-0 left-0 px-2 py-0.5 rounded-br-lg border-b border-r border-slate-200 text-[10px] font-mono font-bold">
                                            {cond.id ? `ID: ${cond.id}` : <span className="text-emerald-600">NEW</span>}
                                        </div>

                                        {/* Nút Xóa (Góc trên phải) */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCondition(index)}
                                            className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition p-1"
                                            title="Xóa điều kiện này"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
                                            {/* Attribute */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Thuộc tính</label>
                                                <select
                                                    value={cond.attribute}
                                                    onChange={(e) => handleConditionChange(index, 'attribute', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-slate-50/50"
                                                >
                                                    {ATTRIBUTES.map(attr => (
                                                        <option key={attr.value} value={attr.value}>{attr.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {/* Operator */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">So sánh</label>
                                                <select
                                                    value={cond.operator}
                                                    onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-slate-50/50 font-mono"
                                                >
                                                    {OPERATORS.map(op => (
                                                        <option key={op.value} value={op.value}>{op.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {/* Value */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Giá trị</label>
                                                <input
                                                    type="text"
                                                    value={cond.value}
                                                    onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-slate-50/50 font-medium"
                                                    placeholder="VD: 500000"
                                                />
                                            </div>
                                            {/* Discount */}
                                            <div>
                                                <label className="block text-xs font-bold text-emerald-600 uppercase mb-1.5">Tiền giảm</label>
                                                <input
                                                    type="number"
                                                    value={cond.discountAmount}
                                                    onChange={(e) => handleConditionChange(index, 'discountAmount', e.target.value)}
                                                    className="w-full pl-3 pr-2 py-2 text-sm border border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-emerald-50/30 font-bold text-emerald-700"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                    {conditions.length === 0 && (
                                        <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-lg">
                                            Chưa có điều kiện nào. Nhấn "Thêm điều kiện" để bắt đầu.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* --- FOOTER ACTION --- */}
                    <div className="w-full flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => navigate(`/manager/coupon-detail/${couponData.code}`)}
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

export default EditCouponManager
