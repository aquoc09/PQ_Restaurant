import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ReviewService from '../services/ReviewService';
import useAuth from '../hooks/useAuth';
import UserService from '../services/UserService'; // Giả sử lấy user info từ đây

const ProductReviews = ({ productId }) => {
    const { isAuthenticated } = useAuth();
    const [user, setUser] = useState(""); 
    const [loading, setLoading] = useState(false);

    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchUserData = async () => {
        try {
            const currentUser = await UserService.getMyInfo();           
            setUser(currentUser);
        } catch (error) {
            toast.error("Không thể tải dữ liệu người dùng để sửa.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchUserData();
        if(productId) {
            loadReviews();
        }
    }, [productId]);

    const loadReviews = async () => {
        try {
            // const data = await ReviewService.getReviewsByProductId(productId);
            // setReviews(data.map(item => item.result));
            // Tạm thời comment vì backend bạn chưa có API getByProductId
            setReviews([]); 
        } catch (error) {
            console.error(error);
        }
    }

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        if (!isAuthenticated()) {
            toast.error("Vui lòng đăng nhập để đánh giá!");
            return;
        }

        if (!comment.trim()) {
            toast.warning("Vui lòng nhập nội dung đánh giá");
            return;
        }

        setSubmitting(true);
        try {
            const reviewRequest = {
                rating: rating,
                comment: comment,
                productId: productId,
                userId: user?.id,
                reviewStatus: "PENDING"
            };

            await ReviewService.createReview(reviewRequest);
            toast.success("Gửi đánh giá thành công!");
            setComment("");
            setRating(rating);
            loadReviews();
        } catch (error) {
            toast.error("Gửi đánh giá thất bại. Có thể bạn chưa mua hàng?");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    // Render ngôi sao
    const renderStars = (currentRating, interactive = false) => {
        return [...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
                <span 
                    key={index} 
                    className={`text-2xl cursor-pointer transition-colors ${starValue <= currentRating ? 'text-yellow-400' : 'text-gray-300'}`}
                    onClick={() => interactive && setRating(starValue)}
                >
                    ★
                </span>
            );
        });
    };

    return (
        <div className="flex flex-col gap-8">
            <h3 className='text-gray-50 font-bold'>Đánh giá sản phẩm</h3>

            {/* FORM VIẾT REVIEW */}
            <div className="bg-white-50 p-6 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-lg mb-4 text-gray-50">Viết đánh giá của bạn</h4>
                {isAuthenticated() ? (
                    <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                        {/* Chọn sao */}
                        <div className="flex items-center gap-2">
                            <span className="text-solid font-semibold">Chất lượng:</span>
                            <div className="flex pb-1">
                                {renderStars(rating, true)}
                            </div>
                            <span className="text-sm text-gray-500 ml-2">({rating}/5)</span>
                        </div>

                        {/* Nhập comment */}
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 min-h-[100px] text-gray-700"
                            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />

                        {/* Nút gửi */}
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="btn-secondary rounded-full px-6 py-2 disabled:opacity-50 text-action font-bold"
                            >
                                {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="text-gray-500 italic">Vui lòng đăng nhập để viết đánh giá.</p>
                )}
            </div>

            {/* DANH SÁCH REVIEW (Hiện tại backend chưa có endpoint này nên để chờ) */}
            <div className="flex flex-col gap-4">
                {reviews.length > 0 ? reviews.map((rev, index) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800">{rev.username || "User"}</span>
                            <span className="text-xs text-gray-400">| {new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex text-sm mb-2">{renderStars(rev.rating)}</div>
                        <p className="text-gray-600">{rev.comment}</p>
                    </div>
                )) : (
                    <p className="text-center text-gray-500 py-4">Chưa có đánh giá nào.</p>
                )}
            </div>
        </div>
    );
};

export default ProductReviews;