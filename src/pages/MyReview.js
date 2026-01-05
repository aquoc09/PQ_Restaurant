import React, { useEffect, useState, useCallback } from 'react';
import Title from '../components/Title';
// Giả sử bạn import ReviewService từ đường dẫn tương ứng
import ReviewService from '../services/ReviewService'; 
import { myAssets } from '../assets/assets';
import { toast } from 'react-toastify';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); 
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });

  const fetchMyReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ReviewService.getMyReviews();
      setReviews(data); 
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách đánh giá.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyReviews();
  }, [fetchMyReviews]);

  const handleDelete = async (reviewId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) {
      try {
        await ReviewService.deleteReview(reviewId);
        toast.success("Đã xóa đánh giá thành công!");
        setReviews(prev => prev.filter(item => item.id !== reviewId));
      } catch (error) {
        toast.error("Lỗi khi xóa đánh giá.");
        console.error(error);
      }
    }
  };

  // --- Xử lý Bắt đầu Sửa ---
  const handleStartEdit = (review) => {
    setEditingId(review.id);
    setEditForm({
      rating: review.rating,
      comment: review.comment
    });
  };

  // --- Xử lý Hủy Sửa ---
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ rating: 5, comment: '' });
  };

  // --- Xử lý Lưu Sửa ---
  const handleUpdate = async (review) => {
    try {
        const reviewData = {
            rating: editForm.rating,
            comment: editForm.comment,
            reviewStatus: "PENDING", 
            userId: review.user?.id, 
            productId: review.product.id
        };

        await ReviewService.updateReview(review.id, reviewData);
        
        toast.success("Cập nhật đánh giá thành công! Đang chờ duyệt.");
        
        setReviews(prev => prev.map(item => 
            item.id === review.id 
            ? { ...item, rating: editForm.rating, comment: editForm.comment } 
            : item
        ));
        
        handleCancelEdit(); // Thoát chế độ sửa

    } catch (error) {
        toast.error("Lỗi khi cập nhật đánh giá.");
        console.error(error);
    }
  };

  const renderStars = (currentRating, isEditing = false) => {
    return (
      <div className="flex text-yellow-500 text-lg cursor-pointer">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star}
            onClick={() => isEditing && setEditForm({...editForm, rating: star})}
            className={isEditing ? 'hover:scale-110 transition-transform px-0.5' : 'px-0.5'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${star <= currentRating ? 'text-yellow-400' : 'text-gray-200'}`}>
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
            </svg>
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="pt-28 text-center">Loading reviews...</div>;
  }

  return (
    <div className='max-padd-container py-16 pt-28 bg-gradient-to-br from-slate-50 to-primary min-h-screen'>
      <Title 
        title1={"My"} 
        title2={"Reviews"} 
        title1Styles={"items-start pb-5"} 
        paraStyles={"hidden"} 
      />

      {!reviews || reviews.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white'>
          <div className="bg-blue-50 p-6 rounded-full mb-4 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-blue-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <p className='text-xl font-bold text-gray-800'>Chưa có đánh giá nào</p>
          <p className='text-gray-500 mt-2 text-sm'>Hãy mua hàng và trải nghiệm để chia sẻ đánh giá nhé!</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {reviews.map((review, index) => (
                <div key={index} className='group bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/60 transition-all duration-300 flex gap-5 items-start transform hover:-translate-y-1'>
                
                {/* Ảnh sản phẩm */}
                <div className='w-24 h-24 flex-shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden p-2'>
                    <img 
                    src={myAssets[review.product.productImage]} 
                    alt={review.product.name} 
                    className='w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-in-out'
                    />
                </div>

                {/* Nội dung đánh giá */}
                <div className='flex-1 min-w-0'> 
                    <div className='flex justify-between items-start'>
                        <h4 className='font-bold text-gray-800 line-clamp-1 text-lg mb-1 group-hover:text-blue-600 transition-colors cursor-pointer'>
                            {review.product.name}
                        </h4>
                    </div>

                    {editingId !== review.id ? (
                    // --- CHẾ ĐỘ XEM ---
                    <>
                        <div className='mb-3'>{renderStars(review.rating)}</div>
                        
                        <div className='bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 relative'>
                            <span className="absolute top-2 left-2 text-slate-200 text-4xl leading-3 font-serif select-none">“</span>
                            <p className='text-slate-600 text-sm italic break-words relative z-10 pl-3'>
                                {review.comment}
                            </p>
                            <span className="absolute bottom-[-10px] right-2 text-slate-200 text-4xl leading-3 font-serif select-none">”</span>
                        </div>
                        
                        <div className='flex gap-2 justify-end mt-2'>
                            <button 
                                onClick={() => handleStartEdit(review)}
                                className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm'
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                                </svg>
                                Sửa
                            </button>
                            <button 
                                onClick={() => handleDelete(review.id)}
                                className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 transition-all shadow-sm'
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                </svg>
                                Xóa
                            </button>
                        </div>
                    </>
                    ) : (
                    /* --- CHẾ ĐỘ EDIT --- */
                    <div className="animate-fade-in mt-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                        <div className='mb-3 flex items-center justify-between'>
                            <span className='text-xs font-bold text-slate-500 uppercase tracking-wide'>Chỉnh sửa đánh giá</span>
                            {renderStars(editForm.rating, true)}
                        </div>
                        
                        <textarea
                            className="w-full bg-white border border-blue-100 rounded-xl p-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-sm"
                            rows="3"
                            value={editForm.comment}
                            onChange={(e) => setEditForm({...editForm, comment: e.target.value})}
                            placeholder="Nhập nội dung đánh giá..."
                        />

                        <div className='flex gap-2 justify-end mt-3'>
                            <button 
                                onClick={handleCancelEdit}
                                className='px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm'
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                onClick={() => handleUpdate(review)}
                                className='px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/30 transition-all active:scale-95'
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                    )}
                </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default MyReviews;