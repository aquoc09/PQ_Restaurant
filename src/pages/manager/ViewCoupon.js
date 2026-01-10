import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CouponService from '../../services/CouponService';
import { myAssets } from '../../assets/assets'; 
function ViewCouponManager() {

    const navigate = useNavigate();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            
            const data = await CouponService.findAllCoupons();
            setCoupons(data.result);
            // toast.success("Tải coupon success!");
        } catch (error) {
            console.error("Lỗi khi tải coupon:", error);
            // toast.error("Không thể tải danh sách coupon.");
        } finally {
            setLoading(false);
        }
    };

    useEffect (() =>{
        fetchCoupons();
    },[]);

    // --- Logic Phân trang ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCoupon = coupons.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(coupons.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Update
    const handleToggleStatus = async (item) => {
        const newStatus = !item.active; // Đảo ngược trạng thái

        const previousCoupons = [...coupons];
        const updatedCoupons = coupons.map(c => 
            c.id === item.id ? { ...c, active: newStatus } : c
        );
        setCoupons(updatedCoupons);

        try {

            const detailResponse = await CouponService.getCouponByCode(item.code); 
            const fullData = detailResponse;

            const couponRequest = {
                code: fullData.code,
                description: fullData.description,
                expiredAt: fullData.expiredAt,
                active: newStatus 
            };
            await CouponService.updateCoupon(couponRequest, item.id);
            
            toast.success(`Cập nhật trạng thái: ${fullData.code}`);

        } catch (error) {
            setCoupons(previousCoupons);
            console.error("Lỗi update status:", error);
            toast.error("Không thể cập nhật trạng thái. Vui lòng thử lại.");
        }
    };

    const handleDelete = async (couponId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa coupon ID: ${couponId} không?`)) {
            return;
        }
        try {
            await CouponService.deleteCoupon(couponId);
            toast.success(`Xóa coupon ${couponId} success.`);
            // Sau khi xóa success, tải lại danh sách
            fetchCoupons(); 
        } catch (err) {
            console.error("Lỗi xóa coupon:", err);
            toast.error('Lỗi xóa coupon. Có thể coupon này đang được sử dụng.');
        }
    };

    
    if (loading) return <div className='p-6'>Đang tải danh sách coupon...</div>;

  return (
    <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-slate-50 shadow rounded-xl no-scrollbar'>
        <div className='flex justify-between items-center mb-6'> 
        <h2 className='text-2xl font-bold'>Coupon Management</h2>
        <button onClick={()=>{
                navigate("/manager/add-coupon")}} 
                className='px-6 py-3 active:scale-95 transition bg-tertiary border-gray-500/20 text-black text-sm font-medium rounded-full cursor-pointer flex justify-center items-center gap-2'>
                Add Coupon
                <img src={myAssets.square_plus} alt="" />
        </button>
        </div>
        <div className='flex flex-col gap-2 lg:w-full'>
        <div className='grid grid-cols-[0.5fr_1.5fr_3fr_1.5fr_1fr_1.5fr] items-center py-4 px-2 bg-solid text-white 
        bold-14 sm:bold-15 mb-1 rounded-xl'>
            <h5>STT</h5>
            <h5>Code</h5>
            <h5>Description</h5>
            <h5>Expired Date</h5>
            <h5>Active</h5>
            <h5>Action</h5>
        </div>

        {/* coupon List */}
        {currentCoupon.length === 0 ? (
            <p className='p-4 text-center'>Không có người coupon nào.</p>
            ) : (
            currentCoupon.map((coupon, index)=>(
                <div key={coupon.id} className='grid grid-cols-[0.5fr_1.5fr_3fr_1.5fr_1fr_1.5fr] items-center gap-2 p-2 bg-white rounded-lg' >
                    <p className='text-sm font-semibold'>{(currentPage - 1) * itemsPerPage + index + 1}</p>
                    <h5 className='text-sm font-semibold line-clamp-2'>{coupon.code}</h5>
                    <h5 className='text-sm font-semibold line-clamp-2'>{coupon.description}</h5>
                    <h5 className='text-sm font-semibold line-clamp-2'>{coupon.expiredAt}</h5>

                    <div>
                        <label className='relative inline-flex items-center cursor-pointer text-gray-900 gap-3 select-none'>
                            <input 
                                type='checkbox' 
                                className='sr-only peer' 
                                checked={coupon.active} 
                                onChange={() => handleToggleStatus(coupon)}
                            />
                            <div className='w-10 h-6 bg-slate-300 rounded-full peer peer-checked:bg-solid transition-colors duration-200'>
                                <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${coupon.active ? 'translate-x-4' : ''}`}></span>
                            </div>
                        </label>
                    </div>

                    <div className='py-2.5 flex items-center gap-2'>
                        <button onClick={() => navigate(`/manager/coupon-detail/${coupon.code}`)} 
                        className='inline-flex items-center justify-center rounded-md font-medium transition duration-150 hover:bg-green-200 text-white px-2 py-1 text-sm'
                        >
                            <img src={myAssets.details} alt="" className='max-h-20 max-w-20 object-contain' />
                        </button>


                        {/* <button onClick={() => navigate(`/manager/edit-coupon/${coupon.code}`)} 
                        className='inline-flex items-center justify-center rounded-md font-medium transition duration-150 hover:bg-blue-200 text-white px-2 py-1 text-sm'
                        >
                            <img src={myAssets.edit} alt="" className='max-h-20 max-w-20 object-contain' />
                        </button> */}

                        <button 
                        onClick={() => handleDelete(coupon.id)}
                        className='inline-flex items-center justify-center rounded-md font-medium transition duration-150 hover:bg-red-200 text-white px-2 py-1 text-sm'
                        >
                            <img src={myAssets.trash} alt="" className='max-h-20 max-w-20 object-contain' />
                        </button>
                    </div>
                </div>
            ))
        )}

        {/* Phân Trang */}
        {coupons.length > itemsPerPage && (
            <div className="flex justify-end mt-4 gap-2">
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg border text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                        currentPage === 1 
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                        : "bg-white text-gray-700 hover:bg-blue-100 border-gray-300"
                    }`}
                >
                    &laquo; Trước
                </button>
                
                {/* Chỉ hiện tối đa 5 trang để tránh dài quá nếu data nhiều */}
                {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`px-4 py-2 rounded border text-sm transition-all ${
                            currentPage === i + 1
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 hover:bg-blue-100 border-gray-300"
                        }`}
                    >
                        {i + 1}
                    </button>
                ))}

                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                        currentPage === totalPages 
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                        : "bg-white text-gray-700 hover:bg-blue-100 border-gray-300"
                    }`}
                >
                    Sau &raquo;
                </button>
            </div>
        )}
        </div>
    </div>
  )
}

export default ViewCouponManager
