import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify';
import ReviewService from '../services/ReviewService';
import useAuth from '../hooks/useAuth';
import UserService from '../services/UserService';

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
            const response = await ReviewService.getReviewsByProductId(productId);

            const acceptedReviews = response.filter(review => review.reviewStatus === "ACCEPTED");
            setReviews(acceptedReviews); 
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
                            <span className="text-action font-semibold">Chất lượng:</span>
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
                                className="btn-secondary rounded-full px-6 py-2 disabled:opacity-50 text-solid font-bold"
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
                {reviews.length > 0 ? (
                    <>
                        {/* 2. Chỉ hiển thị 2 review đầu tiên dùng slice(0, 2) */}
                        {reviews.slice(0, 2).map((rev, index) => (
                            <div key={index} className="border-b pb-4 last:border-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-xs">
                                        {rev.user.username ? rev.user.username.charAt(0).toUpperCase() : "U"}
                                    </div>
                                    <span className="font-bold text-gray-800">{rev.user.username || "User"}</span>
                                </div>
                                <div className="flex text-sm mb-2">{renderStars(rev.rating)}</div>
                                <p className="text-gray-600">{rev.comment}</p>
                            </div>
                        ))}

                        {/* Hiển thị nút xem tất cả nếu có nhiều hơn 2 review */}
                        {reviews.length > 2 && (
                            <div className="mt-2 text-center">
                                {/* Bạn cần định nghĩa Route này trong App.js */}
                                <Link 
                                    to={`/product-details/${productId}/reviews`} 
                                    className="text-blue-600 font-semibold hover:underline hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                                >
                                    Xem tất cả {reviews.length} đánh giá
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </Link>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
                        <p className="text-sm text-gray-400 mt-1">Hãy là người đầu tiên đánh giá!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductReviews;