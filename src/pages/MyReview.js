import React, { useEffect, useState, useCallback } from 'react';
import Title from '../components/Title';
// Giả sử bạn import ReviewService từ đường dẫn tương ứng
import ReviewService from '../services/ReviewService'; 
import { myAssets } from '../assets/assets';
import { toast } from 'react-toastify';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // ID của review đang sửa
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });

  const fetchMyReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ReviewService.getMyReviews();
      setReviews(data); 
      // data ở đây chính là List<ReviewResponse>
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
        // Cập nhật lại list reviews mà không cần gọi lại API fetch
        setReviews(prev => prev.filter(item => item.id !== reviewId));
      } catch (error) {
        toast.error("Lỗi khi xóa đánh giá.");
        console.error(error);
      }
    }
  };

  // --- 3. Xử lý Bắt đầu Sửa ---
  const handleStartEdit = (review) => {
    setEditingId(review.id);
    setEditForm({
      rating: review.rating,
      comment: review.comment
    });
  };

  // --- 4. Xử lý Hủy Sửa ---
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ rating: 5, comment: '' });
  };

  // --- 5. Xử lý Lưu Sửa (Update) ---
  const handleUpdate = async (review) => {
    try {
        // Chuẩn bị data theo đúng class ReviewRequest
        const reviewData = {
            rating: editForm.rating,
            comment: editForm.comment,
            reviewStatus: "PENDING", // Mặc định như yêu cầu
            userId: review.user?.id, // Lấy ID user từ context hoặc object review cũ
            productId: review.product.id
        };

        await ReviewService.updateReview(review.id, reviewData);
        
        toast.success("Cập nhật đánh giá thành công! Đang chờ duyệt.");
        
        // Cập nhật lại UI Local
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

  // Helper render sao (có thể click để chọn khi đang edit)
  const renderStars = (currentRating, isEditing = false) => {
    return (
      <div className="flex text-yellow-500 text-lg cursor-pointer">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star}
            onClick={() => isEditing && setEditForm({...editForm, rating: star})}
            className={isEditing ? 'hover:scale-110 transition-transform px-0.5' : 'px-0.5'}
          >
            {star <= currentRating ? '★' : <span className="text-gray-300">★</span>}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="pt-28 text-center">Loading reviews...</div>;
  }

  return (
    <div className='max-padd-container py-16 pt-28 bg-primary min-h-screen'>
      <Title 
        title1={"My"} 
        title2={"Reviews"} 
        title1Styles={"items-start pb-5"} 
        paraStyles={"hidden"} 
      />

      {!reviews? (
        <div className='text-center py-10'>
          <p className='text-xl font-semibold text-gray-600'>Bạn chưa có đánh giá nào.</p>
          <p className='text-gray-500 mt-2'>Hãy mua hàng và trải nghiệm để chia sẻ đánh giá nhé!</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {reviews.map((review, index) => (
                <div key={index} className='bg-white p-4 rounded-2xl shadow-sm flex gap-4 items-start'>
                {/* Ảnh sản phẩm */}
                <div className='w-24 h-24 flex-shrink-0 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100'>
                    <img 
                    src={myAssets[review.product.productImage]} 
                    alt={review.product.name} 
                    className='max-h-20 max-w-20 object-contain'
                    />
                </div>

                {/* Nội dung đánh giá */}
                <div className='flex-1'>
                    {/* Tên sản phẩm */}
                    <h4 className='font-bold text-gray-800 line-clamp-1 mb-1'>
                    {review.product.name}
                    </h4>

                    {editingId !== review.id ? (
                    <>
                        <div className='mb-2'>{renderStars(review.rating)}</div>
                        <div className='bg-gray-50 p-3 rounded-lg mb-3'>
                        <p className='text-gray-600 text-sm italic break-words'>"{review.comment}"</p>
                        </div>
                        
                        {/* Nút Action: Sửa / Xóa */}
                        <div className='flex gap-2 justify-end mt-2'>
                            <button 
                                onClick={() => handleStartEdit(review)}
                                className='text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium'
                            >
                                Sửa
                            </button>
                            <button 
                                onClick={() => handleDelete(review.id)}
                                className='text-xs px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 font-medium'
                            >
                                Xóa
                            </button>
                        </div>
                    </>
                    ) : (
                    /* --- CHẾ ĐỘ EDIT (Form chỉnh sửa) --- */
                    <div className="animate-fade-in">
                        <div className='mb-2'>
                            <span className='text-xs text-gray-500'>Chọn số sao:</span>
                            {renderStars(editForm.rating, true)}
                        </div>
                        
                        <textarea
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500 mb-2"
                            rows="3"
                            value={editForm.comment}
                            onChange={(e) => setEditForm({...editForm, comment: e.target.value})}
                            placeholder="Nhập nội dung đánh giá..."
                        />

                        <div className='flex gap-2 justify-end'>
                            <button 
                                onClick={handleCancelEdit}
                                className='text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300'
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={() => handleUpdate(review)}
                                className='text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700'
                            >
                                Lưu
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