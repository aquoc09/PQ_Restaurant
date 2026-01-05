import React, {useEffect, useState, useCallback} from 'react'
import Title from '../components/Title'
import { useUserContext } from '../context/UserContext'
import { myAssets } from '../assets/assets'
import OrderService from '../services/OrderSevice';
import ReviewService from '../services/ReviewService';
import { toast } from 'react-toastify';

const formatDate = (dob_yyyy_mm_dd) => {
    if (!dob_yyyy_mm_dd) return null;
    try {
        const [year, month, day] = dob_yyyy_mm_dd.split('-');
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dob_yyyy_mm_dd;
    }
};

const MyOrders = () => {

  const {formatCurrency, navigate, addToCart}=useUserContext();
  const [orders, setOrders]=useState([]);
  const [reviewedProductIds, setReviewedProductIds] = useState(new Set());

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {

    try {
      const [ordersData, reviewsData] = await Promise.all([
                OrderService.getOrdersByCurrentUser(),
                ReviewService.getMyReviews() 
            ]);
      const response = ordersData.result.reverse(); 
      setOrders(response); 
      console.log("Orders loaded for current user:", ordersData);
      const ids = new Set();
      if (Array.isArray(reviewsData)) {
        reviewsData.forEach(r => {
          const pId = r.product?.id;
          if (pId) {
              ids.add(pId);
          }
        });
      }
      setReviewedProductIds(ids);
    } catch (err) {
      toast.error("Error fetching current user's orders:", err);
      setOrders([]);
    } finally {
      
    }
  }, []);

  useEffect(()=>{
      fetchData();
  },[fetchData]);

  const openReviewModal = (item, orderId) => {
      setSelectedItem(item);
      setSelectedOrderId(orderId);
      setRating(5);
      setComment("");
      setShowModal(true);
  };

  // Gửi Review
  const handleSubmitReview = async () => {
      if (!selectedItem) return;
      
      setIsSubmitting(true);
      try {
        const reviewRequest = {
          rating: rating,
          comment: comment,
          reviewStatus: "PENDING",
          userId: orders[0].userId,
          productId: selectedItem.product.id,
          orderId: selectedOrderId
        };
        console.log("Request", reviewRequest);

        await ReviewService.createReview(reviewRequest);
        
        toast.success("Gửi đánh giá thành công!");
        
        setReviewedProductIds(prev => new Set(prev).add(selectedItem.product.id));
        
        setShowModal(false);
      } catch (error) {
          console.error(error);
          toast.error("Gửi đánh giá thất bại.");
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleBuyAgain = async (order) => {
    try {

      toast.info("Đang thêm sản phẩm vào giỏ hàng...");
      for (const item of order.orderDetails) {

        await addToCart(
            1, 
            item.size, 
            "",
            item.product.id
        );
      }

      navigate('/cart');
      
    } catch (error) {
      console.error("Lỗi khi mua lại:", error);
      toast.error("Có lỗi xảy ra khi thực hiện mua lại.");
    }
  };

  const renderStarInput = () => {
    return [...Array(5)].map((_, i) => (
        <span 
            key={i} 
            className={`text-3xl cursor-pointer transition-colors ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            onClick={() => setRating(i + 1)}
        >
            ★
        </span>
    ));
  };
  
  return (
    <div className='max-padd-container py-16 pt-28 bg-gradient-to-br from-slate-50 to-primary min-h-screen relative'>
      <Title title1={"My"} title2={"Orders List"} title1Styles={"items-start pb-5"} paraStyles={"hidden"} />
      
      {orders.length === 0 ? (
        <div className='text-center py-10'>
            <p className='text-xl font-semibold text-gray-600'>Bạn chưa có đơn hàng nào.</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className='bg-white p-4 mt-4 rounded-2xl shadow-sm border border-slate-100'>
                
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <span className="text-sm text-gray-500">Ngày: {formatDate(order.orderDate)}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {order.status}
              </span>
            </div>

            <div className='flex flex-col gap-4'>
              {order.orderDetails.map((item, idx) => {
                  
                const isReviewed = reviewedProductIds.has(item.product.id);
                
                const canReview = order.status === 'COMPLETED' && !isReviewed;

                return (
                  <div key={idx} className='flex gap-4 items-start border-b border-gray-50 last:border-0 pb-4 last:pb-0'>
                    <div className='w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center p-1'>
                        <img src={myAssets[item.product.productImage]} alt="" className='w-full h-full object-contain' />
                    </div>
                    
                    <div className='flex-1'>
                      <div className="flex justify-between items-start">
                          <div>
                              <h5 className='font-bold text-gray-800 line-clamp-1'>{item.product.name}</h5>
                              <p className='text-xs text-gray-500'>Size: {item.size} x {item.numProducts}</p>
                          </div>
                          <p className="font-semibold text-gray-800">{formatCurrency(item.price)}</p>
                      </div>
                        
                      <div className="mt-2 flex items-center gap-3">
                        {canReview && (
                            <button 
                                onClick={() => openReviewModal(item, order.id)}
                                className='text-xs font-semibold text-blue-600 border border-blue-600 px-3 py-1 rounded hover:bg-blue-50 transition-colors flex items-center gap-1'
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                    <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
                                </svg>
                                Viết đánh giá
                            </button>
                        )}
                        
                        {/* Nếu đã review (ở bất kỳ đơn nào), hiện status này */}
                        {isReviewed && (
                            <span className='text-xs font-medium text-green-600 flex items-center gap-1 cursor-default bg-green-50 px-2 py-1 rounded'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                </svg>
                                Đã đánh giá
                            </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className='flex justify-between items-center mt-4 pt-3 border-t border-gray-100'>
                <div className='text-sm'>
                    <span className='text-gray-500'>Tổng tiền: </span>
                    <span className='font-bold text-lg text-red-600'>{formatCurrency(order.totalMoney)}</span>
                </div>
                <button 
                    onClick={() => handleBuyAgain(order)} 
                    className='bg-solid text-white text-xs font-bold px-4 py-2 rounded hover:bg-gray-700 transition shadow-sm'
                >
                    Mua Lại Đơn Này
                </button>
            </div>
          </div>
        ))
      )}

      {/* MODAL REVIEW */}
      {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
              <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-down">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Đánh giá sản phẩm</h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                
                {selectedItem && (
                    <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-lg border border-gray-100">
                        <img src={myAssets[selectedItem.product.productImage]} alt="" className="w-12 h-12 object-contain" />
                        <div>
                            <p className="font-semibold text-sm line-clamp-1">{selectedItem.product.name}</p>
                            <p className="text-xs text-gray-500">Đơn hàng #{selectedOrderId}</p>
                        </div>
                    </div>
                )}
                
                <div className="mb-6 text-center">
                    <p className="text-sm font-medium text-gray-600 mb-2">Bạn cảm thấy sản phẩm thế nào?</p>
                    <div className="flex justify-center gap-2">
                        {renderStarInput()}
                    </div>
                    <p className='text-xs text-gray-400 mt-2 h-4'>
                        {rating === 5 ? "Tuyệt vời!" : rating === 1 ? "Rất tệ" : ""}
                    </p>
                </div>

                <div className="mb-4">
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Nhận xét của bạn</label>
                    <textarea 
                        className="w-full border text-gray-50 border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none transition-all"
                        rows="4"
                        placeholder="Hãy chia sẻ cảm nhận chi tiết..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                </div>

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setShowModal(false)}
                        className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        disabled={isSubmitting}
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={handleSubmitReview}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                </div>
              </div>
          </div>
      )}
    </div>
  )
}

export default MyOrders
