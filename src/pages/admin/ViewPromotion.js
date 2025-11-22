import React, {useState,useEffect} from 'react'
import PromotionService from '../../services/PromotionService';
import { toast } from 'react-toastify';
import { myAssets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

function ViewPromotion() {

  const navigate=useNavigate();
  const [promotion, setPromotion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPromotion = async () => {
        setLoading(true);
        try {
            const response = await PromotionService.getAllPromotions();
            const promotionListResponse = response.result;
            setPromotion(promotionListResponse.promotion);
            setTotalPages(promotionListResponse.totalPages);
            setCurrentPage(promotionListResponse.currentPage);

        } catch (error) {
            // console.error("Lỗi khi tải sản phẩm:", error);
            toast.error("Không thể tải danh sách promotion.");
        } finally {
            setLoading(false);
        }
    };

    // Tải dữ liệu khi component mount lần đầu
    useEffect(() => {
        fetchPromotion();
    }, []);
    
    // Tải lại dữ liệu khi chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchPromotion(newPage);
        }
    };

    const handleDeletePromotion = async (promotionId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa khuyến mãi ID: ${promotionId} không?`)) {
            return;
        }
        try {
            await PromotionService.deletePromotion(promotionId);
            toast.success(`Xóa khuyến mãi ${promotionId} thành công.`);
            fetchPromotion(); 
        } catch (err) {
            console.error("Lỗi xóa khuyến mãi:", err);
            toast.error('Lỗi xóa khuyến mãi. Vui lòng thử lại.');
        }
    };

    // --- HÀM XỬ LÝ TOGGLE IN-STOCK ---
    const handleToggleInStock = async (promo) => {
        const newInStockStatus = !promo.inStock;
        
        // 1. Cập nhật trạng thái trong UI ngay lập tức (Optimistic Update)
        setPromotion(prevPromotions => 
            prevPromotions.map(p => 
                p.id === promo.id ? { ...p, inStock: newInStockStatus } : p
            )
        );

        // 2. Chuẩn bị Request: Chỉ cần gửi dữ liệu cần thiết (title, img, inStock)
        const updateRequest = {
            title: promo.title, // Cần thiết để đảm bảo API PUT hoạt động
            img: promo.img,     // Cần thiết để đảm bảo API PUT hoạt động
            inStock: newInStockStatus, // Trạng thái mới
        };
        
        // 3. Gọi API cập nhật
        try {
            await PromotionService.updatePromotion(promo.id, updateRequest);
            toast.success(`Cập nhật trạng thái khuyến mãi ${promo.id} thành công!`);
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
            toast.error('Lỗi: Không thể cập nhật trạng thái. Đang khôi phục...');
            
            // Nếu API thất bại, đảo ngược trạng thái trong UI về trạng thái cũ
            setPromotion(prevPromotions => 
                prevPromotions.map(p => 
                    p.id === promo.id ? { ...p, inStock: promo.inStock } : p
                )
            );
        }
    };

    if (loading) return <div className='p-6'>Đang tải danh sách promotion...</div>;

  return (
    <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-primary shadow rounded-xl'>
      <div className='flex justify-between items-center mb-6'> 
        <h2 className='text-2xl font-bold mb-4'>Promotion Management</h2>
        <button onClick={()=>{
                      navigate("/admin/add-promotion")}} className='px-6 py-3 active:scale-95 transition bg-tertiary border-gray-500/20 text-black text-sm font-medium rounded-full cursor-pointer flex justify-center items-center gap-2'>
                Add Promotion
                <img src={myAssets.square_plus} alt="" />
        </button>
      </div>
      <div className='flex flex-col gap-2 lg:w-full'>
        <div className='grid grid-cols-[1fr_2fr_2fr_2fr_1fr] items-center py-4 px-2 bg-solid text-white 
        bold-14 sm:bold-15 mb-1 rounded-xl'>
          <h5>STT</h5>
          <h5>Image</h5>
          <h5>Title</h5>
          <h5>Instock</h5>
          <h5>Action</h5>
        </div>

        {/* Promotion List */}
        {promotion.map((promotion, index)=>(
        <div key={promotion.id} className='grid grid-cols-[1fr_1.5fr_2fr_2fr_1.5fr_1.5fr_1fr] items-center gap-2 p-2 bg-white rounded-lg' >
          <p className='text-sm font-semibold'>{(currentPage - 1) * 10 + index + 1}</p>
          <img src={myAssets[promotion.img]} alt="" className='w-12 bg-primary rounded'/>
          <h5 className='text-sm font-semibold line-clamp-2'>{promotion.title}</h5>

          <div>
            <label 
            className='relative inline-flex items-center cursor-pointer text-gray-900 gap-3'>
              <input 
              type='checkbox' 
              className='sr-only peer' 
              defaultChecked={promotion.inStock}
              onChange={() => handleToggleInStock(promotion)}
              >

              </input>
              <div 
              className='w-10 h-6 bg-slate-300 rounded-full peer peer-checked:bg-solid transition-colors duration-200'>
                <span 
                className='absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4'></span>
              </div>
            </label>
          </div>

          <div className='py-2.5'>
            <button onClick={() => navigate(`/admin/edit-promotion/${promotion.id}`)} 
            className='inline-flex items-center justify-center rounded-md font-medium transition duration-150 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-sm'
            >
              Edit
            </button>

            <button 
            onClick={() => handleDeletePromotion(promotion.id)}
            className='inline-flex items-center justify-center rounded-md font-medium transition duration-150 bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-sm ml-2'
            >
              Delete
              </button>
          </div>
        </div>
        ))}

        {/* Phân Trang */}
        {totalPages > 1 && (
                <div className='flex justify-center items-center mt-6 gap-3'>
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className='px-3 py-1 border rounded-lg bg-gray-100 disabled:opacity-50'
                    >
                        Trước
                    </button>
                    <span className='text-sm'>
                        Trang {currentPage} trên {totalPages}
                    </span>
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className='px-3 py-1 border rounded-lg bg-gray-100 disabled:opacity-50'
                    >
                        Sau
                    </button>
                </div>
            )}
      </div>
    </div>
  )
}

export default ViewPromotion
