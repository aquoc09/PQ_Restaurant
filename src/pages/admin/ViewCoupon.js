import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CouponService from '../../services/CouponService';
import { myAssets } from '../../assets/assets'; 
function ViewCoupon() {

    const navigate = useNavigate();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    // const [totalPages, setTotalPages] = useState(2);

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

    //     const handlePageChange = (newPage) => {
    //     if (newPage >= 1 && newPage <= totalPages) {
    //         fetchCoupons(newPage);
    //     }
    // };

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
    <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-primary shadow rounded-xl'>
        <div className='flex justify-between items-center mb-6'> 
        <h2 className='text-2xl font-bold'>Coupon Management</h2>
        <button onClick={()=>{
                navigate("/admin/add-coupon")}} 
                className='px-6 py-3 active:scale-95 transition bg-tertiary border-gray-500/20 text-black text-sm font-medium rounded-full cursor-pointer flex justify-center items-center gap-2'>
                Add Coupon
                <img src={myAssets.square_plus} alt="" />
        </button>
        </div>
        <div className='flex flex-col gap-2 lg:w-full'>
        <div className='grid grid-cols-[0.5fr_1.5fr_2fr_1.5fr_1fr_1.5fr] items-center py-4 px-2 bg-solid text-white 
        bold-14 sm:bold-15 mb-1 rounded-xl'>
            <h5>STT</h5>
            <h5>Code</h5>
            <h5>Description</h5>
            <h5>Expired Date</h5>
            <h5>Active</h5>
            <h5>Action</h5>
        </div>

        {/* coupon List */}
        {coupons.map((coupon, index)=>(
        <div key={coupon.id} className='grid grid-cols-[0.5fr_1.5fr_2fr_1.5fr_1fr_1.5fr] items-center gap-2 p-2 bg-white rounded-lg' >
            <p className='text-sm font-semibold'>{(currentPage - 1) * 5 + index + 1}</p>
            <h5 className='text-sm font-semibold line-clamp-2'>{coupon.code}</h5>
            <h5 className='text-sm font-semibold line-clamp-2'>{coupon.description}</h5>
            <h5 className='text-sm font-semibold line-clamp-2'>{coupon.expiredAt}</h5>

            <div>
                <label 
                className='relative inline-flex items-center cursor-pointer text-gray-900 gap-3'>
                    <input 
                    type='checkbox' 
                    className='sr-only peer' 
                    defaultChecked={coupon.active}
                    >

                    </input>
                    <div 
                    className='w-10 h-6 bg-slate-300 rounded-full peer peer-checked:bg-solid transition-colors duration-200'>
                    <span 
                    className='absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4'></span>
                    </div>
                </label>
            </div>

            <div className='py-2.5 flex items-center gap-2'>
                <button onClick={() => navigate(`/admin/coupon-detail/${coupon.id}`)} 
                className='inline-flex items-center justify-center rounded-md font-medium transition duration-150 hover:bg-green-200 text-white px-2 py-1 text-sm'
                >
                    <img src={myAssets.details} alt="" className='max-h-20 max-w-20 object-contain' />
                </button>


                <button onClick={() => navigate(`/admin/edit-coupon/${coupon.id}`)} 
                className='inline-flex items-center justify-center rounded-md font-medium transition duration-150 hover:bg-blue-200 text-white px-2 py-1 text-sm'
                >
                    <img src={myAssets.edit} alt="" className='max-h-20 max-w-20 object-contain' />
                </button>

                <button 
                onClick={() => handleDelete(coupon.id)}
                className='inline-flex items-center justify-center rounded-md font-medium transition duration-150 hover:bg-red-200 text-white px-2 py-1 text-sm'
                >
                    <img src={myAssets.trash} alt="" className='max-h-20 max-w-20 object-contain' />
                </button>
            </div>
        </div>
        ))}

        {/* Phân Trang
        {totalPages > 1 && (
                <div className='flex justify-center items-center flex-wrap mt-14 mb-10 gap-3'>
                    <button 
                        disabled={currentPage === 1} 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        className={`px-3 py-1 border rounded-lg transition-all text-sm font-semibold 
                        ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600"}`}
                    >
                        Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button 
                            key={index + 1} 
                            onClick={() => handlePageChange(index + 1)}
                            className={`px-3 py-1 border rounded-lg text-sm font-semibold transition-all
                            ${currentPage === index + 1 ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    
                    <button 
                        disabled={currentPage === totalPages} 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        className={`px-3 py-1 border rounded-lg transition-all text-sm font-semibold 
                        ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600"}`}
                    >
                        Next
                    </button>
                </div>
            )} */}
        </div>
    </div>
  )
}

export default ViewCoupon
