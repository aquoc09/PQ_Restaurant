import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReviewService from '../services/ReviewService';
import ProductService from '../services/ProductService';
import { myAssets } from '../assets/assets';
import Title from '../components/Title';

const Reviews = () => {
  const { productId } = useParams();
  
  // --- STATE ---
  const [reviews, setReviews] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Số review mỗi trang
  
  // State bộ lọc (0 là hiện tất cả)
  const [filterRating, setFilterRating] = useState(0); 

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Lấy thông tin sản phẩm (để hiện tên và ảnh trên đầu)
        const productRes = await ProductService.getProductById(productId);
        setProduct(productRes.result);

        // 2. Lấy danh sách Review
        const reviewRes = await ReviewService.getReviewsByProductId(productId);
        
        // Chỉ lấy review đã ACCEPTED và sắp xếp mới nhất
        const acceptedReviews = reviewRes
            .filter(r => r.reviewStatus === 'ACCEPTED')
            .sort((a, b) => b.id - a.id);
            
        setReviews(acceptedReviews);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchData();
  }, [productId]);

  // --- TÍNH TOÁN THỐNG KÊ (Memoized để tối ưu hiệu năng) ---
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { average: 0, breakdown: [0,0,0,0,0] };

    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const average = sum / total;

    // Đếm số lượng từng loại sao (index 0 là 1 sao, index 4 là 5 sao)
    const breakdown = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
            breakdown[r.rating - 1]++;
        }
    });

    return { average, breakdown, total };
  }, [reviews]);

  // --- LOGIC LỌC & PHÂN TRANG ---
  
  // 1. Lọc theo sao (nếu người dùng click vào thanh filter)
  const filteredReviews = filterRating === 0 
    ? reviews 
    : reviews.filter(r => r.rating === filterRating);

  // 2. Cắt trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  // --- HELPER RENDER ---
  const renderStars = (rating) => (
    <div className="flex text-yellow-400 text-sm">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < Math.round(rating) ? "" : "text-gray-300"}>★</span>
      ))}
    </div>
  );

  if (loading) return <div className="pt-32 text-center">Đang tải đánh giá...</div>;

  return (
    <div className='max-padd-container py-10 pt-28 bg-gradient-to-br from-slate-50 to-primary min-h-screen'>
      
      {/* BREADCRUMB & HEADER */}
      <div className="mb-8">
        <div className="text-sm text-gray-500 mb-4">
             <Link to="/" className="hover:text-blue-600 font-medium">Home</Link> / 
             <Link to="/menu" className="hover:text-blue-600 font-medium"> Menu</Link> / 
             {product && 
             <Link to={`/product-details/${product.id}`} 
             className="hover:text-blue-600 font-medium"> {product.name}</Link>}
        </div>
        <Title title1={"Customer"} title2={"Reviews"} title1Styles={"items-start"} paraStyles={"hidden"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- CỘT TRÁI: THỐNG KÊ (Chiếm 4 phần) --- */}
        <div className="lg:col-span-4 h-fit">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-28">
              {/* Product Info Mini */}
              {product && (
                  <div className="flex items-center gap-4 mb-6 border-b pb-4">
                      <img src={myAssets[product.productImage]} alt="" className="w-16 h-16 object-cover rounded-lg bg-gray-50"/>
                      <div>
                          <h3 className="font-bold text-gray-800 line-clamp-1">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.productCode}</p>
                      </div>
                  </div>
              )}

              {/* Điểm trung bình to đùng */}
              <div className="text-center mb-6">
                  <div className="text-5xl font-extrabold text-gray-800">{stats.average.toFixed(1)}</div>
                  <div className="flex justify-center my-2 scale-125">{renderStars(stats.average)}</div>
                  <p className="text-gray-500">Dựa trên {stats.total} đánh giá</p>
              </div>

              {/* Thanh tỉ lệ phần trăm (Rating Breakdown) */}
              <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                      const count = stats.breakdown[star - 1];
                      const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                      return (
                          <div 
                            key={star} 
                            className="flex items-center gap-2 cursor-pointer group"
                            onClick={() => {
                                setFilterRating(filterRating === star ? 0 : star);
                                setCurrentPage(1);
                            }}
                          >
                              <span className={`text-sm w-8 font-medium ${filterRating === star ? 'text-blue-600' : 'text-gray-600'}`}>{star} ★</span>
                              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${filterRating === star ? 'bg-blue-600' : 'bg-yellow-400'}`}
                                    style={{ width: `${percent}%` }}
                                  ></div>
                              </div>
                              <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
                          </div>
                      )
                  })}
              </div>
              
              {filterRating !== 0 && (
                  <button 
                    onClick={() => setFilterRating(0)}
                    className="mt-4 w-full py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                  >
                      Xem tất cả đánh giá
                  </button>
              )}
           </div>
        </div>

        {/* --- CỘT PHẢI: DANH SÁCH REVIEW (Chiếm 8 phần) --- */}
        <div className="lg:col-span-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
                {filterRating === 0 ? "Tất cả đánh giá" : `Đánh giá ${filterRating} sao`}
            </h3>

            {currentReviews.length > 0 ? (
                <div className="space-y-4">
                    {currentReviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    {/* Avatar giả lập từ chữ cái đầu */}
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                        {review.user?.username ? review.user.username.charAt(0).toUpperCase() : "U"}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{review.user?.fullName || review.user?.username}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>Đã mua hàng</span>
                                            {/* Giả sử có ngày tháng, nếu không có thì bỏ qua */}
                                            {/* <span>• {new Date(review.createdAt).toLocaleDateString()}</span> */}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    {renderStars(review.rating)}
                                </div>
                            </div>

                            <div className="mt-4 pl-14">
                                <p className="text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500">Chưa có đánh giá nào {filterRating !== 0 && `cho mức ${filterRating} sao`}.</p>
                </div>
            )}

            {/* --- PHÂN TRANG --- */}
            {filteredReviews.length > itemsPerPage && (
                <div className="flex justify-center mt-8 gap-2">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                        Trước
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => paginate(i + 1)}
                            className={`w-10 h-10 rounded-lg border font-medium transition ${
                                currentPage === i + 1 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default Reviews