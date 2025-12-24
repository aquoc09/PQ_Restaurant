import React, { useEffect, useState } from 'react';
import ReviewService from '../../services/ReviewService';

const ViewReview = () => {
    // --- State dữ liệu & Pagination ---
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    // --- State Modal ---
    const [selectedReview, setSelectedReview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const data = await ReviewService.getAllReviews();
            // Sort: Mới nhất lên đầu
            const sortedData = data.sort((a, b) => b.id - a.id);
            setReviews(sortedData);
        } catch (error) {
            console.error("Lỗi tải review:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Logic Phân trang ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReviews = reviews.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(reviews.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // --- Logic Modal ---
    const handleViewDetail = (review) => {
        setSelectedReview(review);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedReview(null);
    };

    // --- Helper: Render Sao ---
    const renderStars = (rating) => {
        return (
            <div className="flex text-yellow-400">
                {[...Array(5)].map((_, index) => (
                    <span key={index} className={index < rating ? "text-yellow-400" : "text-gray-300"}>
                        ★
                    </span>
                ))}
            </div>
        );
    };

    // --- Helper: Màu sắc trạng thái (Tailwind classes) ---
    const getStatusBadge = (status) => {
        const styles = {
            ACCEPTED: "bg-green-100 text-green-800 border-green-200",
            DENIED: "bg-red-100 text-red-800 border-red-200",
            PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
            HIDE: "bg-gray-800 text-white border-gray-700",
            SHOW: "bg-cyan-100 text-cyan-800 border-cyan-200",
            DEFAULT: "bg-gray-100 text-gray-800 border-gray-200"
        };

        const className = styles[status] || styles.DEFAULT;

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${className}`}>
                {status}
            </span>
        );
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;

    return (
        <div className="md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-slate-50 shadow rounded-xl">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Đánh Giá</h2>
                
                {/* --- BẢNG DỮ LIỆU --- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-bold">ID</th>
                                    <th className="px-6 py-4 font-bold">Sản phẩm</th>
                                    <th className="px-6 py-4 font-bold">Người dùng</th>
                                    <th className="px-6 py-4 font-bold">Đánh giá</th>
                                    <th className="px-6 py-4 font-bold">Trạng thái</th>
                                    <th className="px-6 py-4 font-bold text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentReviews.length > 0 ? (
                                    currentReviews.map((review) => (
                                        <tr key={review.id} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                #{review.id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        {review.product?.productImage ? (
                                                            <img 
                                                                className="h-10 w-10 rounded object-cover border border-gray-200" 
                                                                src={review.product.productImage} 
                                                                alt={review.product.name} 
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-xs">No img</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{review.product?.name}</div>
                                                        <div className="text-xs text-gray-500">{review.product?.productCode}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{review.user?.fullName}</div>
                                                <div className="text-xs text-blue-500">@{review.user?.username}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {renderStars(review.rating)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(review.reviewStatus)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => handleViewDetail(review)}
                                                    className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs px-4 py-2 transition-all"
                                                >
                                                    Chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                            Chưa có đánh giá nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- PHÂN TRANG --- */}
                {reviews.length > 0 && (
                    <div className="flex justify-end mt-4 gap-2">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded border text-sm ${
                                currentPage === 1 
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                            }`}
                        >
                            &laquo; Trước
                        </button>
                        
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => paginate(i + 1)}
                                className={`px-3 py-1 rounded border text-sm ${
                                    currentPage === i + 1
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded border text-sm ${
                                currentPage === totalPages 
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                            }`}
                        >
                            Sau &raquo;
                        </button>
                    </div>
                )}
            </div>

            {/* --- MODAL DETAIL --- */}
            {isModalOpen && selectedReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in-down">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">
                                Chi tiết Đánh giá <span className="text-blue-600">#{selectedReview.id}</span>
                            </h3>
                            <button 
                                onClick={closeModal} 
                                className="text-gray-400 hover:text-red-500 transition-colors text-2xl leading-none"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Cột trái: Thông tin */}
                            <div className="space-y-6">
                                {/* Product Info Box */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sản phẩm</h4>
                                    <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        {selectedReview.product?.productImage && (
                                            <img 
                                                src={selectedReview.product.productImage} 
                                                alt="" 
                                                className="w-16 h-16 rounded-md object-cover border border-blue-200"
                                            />
                                        )}
                                        <div>
                                            <div className="font-bold text-gray-800">{selectedReview.product?.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">Code: {selectedReview.product?.productCode}</div>
                                            <div className="text-xs text-blue-600 font-medium mt-1">Danh mục ID: {selectedReview.product?.categoryId}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* User Info Box */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Người đánh giá</h4>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Họ tên:</span>
                                            <span className="font-medium text-gray-900">{selectedReview.user?.fullName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Username:</span>
                                            <span className="font-medium text-gray-900">{selectedReview.user?.username}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Giới tính:</span>
                                            <span className="font-medium text-gray-900">{selectedReview.user?.gender}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cột phải: Nội dung Review */}
                            <div className="flex flex-col h-full">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Nội dung đánh giá</h4>
                                
                                <div className="flex items-center justify-between mb-4">
                                    <div className="scale-110 origin-left">{renderStars(selectedReview.rating)}</div>
                                    <div>{getStatusBadge(selectedReview.reviewStatus)}</div>
                                </div>

                                <div className="flex-grow bg-gray-50 p-5 rounded-xl border border-gray-200 relative">
                                    <span className="absolute top-2 left-3 text-4xl text-gray-200 font-serif">“</span>
                                    <p className="text-gray-700 italic relative z-10 pt-2 leading-relaxed">
                                        {selectedReview.comment}
                                    </p>
                                    <span className="absolute bottom-[-10px] right-4 text-4xl text-gray-200 font-serif">”</span>
                                </div>

                                {/* Actions (Ví dụ) */}
                                {/* <div className="mt-6 grid grid-cols-2 gap-3">
                                    <button 
                                        className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                                        // onClick={() => handleApprove(selectedReview.id)}
                                    >
                                        Duyệt bài
                                    </button>
                                    <button 
                                        className="py-2 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                                        // onClick={() => handleDeny(selectedReview.id)}
                                    >
                                        Từ chối
                                    </button>
                                </div> */}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-right">
                            <button 
                                onClick={closeModal} 
                                className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm transition-all"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewReview;