import React, {useState,useEffect} from 'react'
import PromotionService from '../../services/PromotionService';
import { toast } from 'react-toastify';
import { myAssets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const DISPLAY_LIMIT = 5;
const FETCH_LIMIT = 6;

function ViewPromotion() {

  const navigate=useNavigate();
  const [promotion, setPromotion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchPromotion = async (page=1) => {
        setLoading(true);
        try {
            const response = await PromotionService.getAllPromotions(page-1, FETCH_LIMIT);

            if (response.result.length > DISPLAY_LIMIT) {
                // Trường hợp 1: Lấy về được 6 món
                // -> Có trang tiếp theo
                setHasNextPage(true);
                
                // Cắt bỏ phần tử thứ 6, chỉ giữ lại 5 phần tử để hiển thị
                setPromotion(response.result.slice(0, DISPLAY_LIMIT));
            } else {
                // Trường hợp 2: Lấy về <= 5 món
                // -> Hết trang tiếp theo rồi
                setHasNextPage(false);
                setPromotion(response.result);
            }

            setCurrentPage(page);
        } catch (error) {
            // console.error("Lỗi khi tải sản phẩm:", error);
            toast.error("Không thể tải danh sách promotion.");
        } finally {
            setLoading(false);
        }
    };

    // Tải dữ liệu khi component mount lần đầu
    useEffect(() => {
        fetchPromotion(1);
    }, []);
    
    // Tải lại dữ liệu khi chuyển trang
    const handlePageChange = (newPage) => {
      fetchPromotion(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeletePromotion = async (promotionId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa khuyến mãi ID: ${promotionId} không?`)) {
            return;
        }
        try {
            await PromotionService.deletePromotion(promotionId);
            toast.success(`Xóa khuyến mãi ${promotionId} success.`);
            fetchPromotion(); 
        } catch (err) {
            console.error("Lỗi xóa khuyến mãi:", err);
            toast.error('Lỗi xóa khuyến mãi. Vui lòng thử lại.');
        }
    };

    if (loading) return <div className='p-6'>Đang tải danh sách promotion...</div>;

  return (
    <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-primary shadow rounded-xl'>
      <div className='flex justify-between items-center mb-6'> 
        <h2 className='text-2xl font-bold'>Promotion Management</h2>
        <button onClick={()=>{
                      navigate("/admin/add-promotion")}} 
                      className='px-6 py-3 active:scale-95 transition bg-tertiary border-gray-500/20 text-black text-sm font-medium rounded-full cursor-pointer flex justify-center items-center gap-2'>
                Add Promotion
                <img src={myAssets.square_plus} alt="" />
        </button>
      </div>
      <div className='flex flex-col gap-2 lg:w-full'>
        <div className='grid grid-cols-[1fr_1.5fr_1.5fr_1fr_1fr] items-center py-4 px-2 bg-solid text-white 
        bold-14 sm:bold-15 mb-1 rounded-xl'>
          <h5>STT</h5>
          <h5>Image</h5>
          <h5>Title</h5>
          <h5>Status</h5>
          <h5>Action</h5>
        </div>

        {/* Promotion List */}
        {promotion.map((promotion, index)=>(
        <div key={promotion.id} className='grid grid-cols-[1fr_1.5fr_1.5fr_1fr_1fr] items-center gap-2 p-2 bg-white rounded-lg' >
          <p className='text-sm font-semibold'>{(currentPage - 1) * 5 + index + 1}</p>
          <img src={myAssets[promotion.img]} alt="" className='w-12 bg-primary rounded'/>
          <h5 className='text-sm font-semibold line-clamp-2'>{promotion.title}</h5>

          <div>
            <label 
            className='relative inline-flex items-center cursor-pointer text-gray-900 gap-3'>
              <input 
              type='checkbox' 
              className='sr-only peer' 
              defaultChecked={promotion.inStock}
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
            <button onClick={() => navigate(`/admin/edit-promotion/${promotion.id}`)} 
            className='inline-flex items-center justify-center rounded-md font-medium transition duration-150 hover:bg-blue-200 text-white px-2 py-1 text-sm'
            >
              <img src={myAssets.edit} alt="" className='max-h-20 max-w-20 object-contain' />
            </button>

            <button 
            onClick={() => handleDeletePromotion(promotion.id)}
            className='inline-flex items-center justify-center rounded-md font-medium transition duration-150 hover:bg-red-200 text-white px-2 py-1 text-sm'
            >
              <img src={myAssets.trash} alt="" className='max-h-20 max-w-20 object-contain' />
              </button>
          </div>
        </div>
        ))}

        {/* Phân Trang */}
                <div className='flex justify-center items-center flex-wrap mt-14 mb-10 gap-3'>
                    <button 
                        disabled={currentPage === 1} 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        className={`px-3 py-1 border rounded-lg transition-all text-sm font-semibold 
                        ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600"}`}
                    >
                        Previous
                    </button>

                    {/* <span className='text-gray-700 px-3 py-1 border rounded-lg text-sm font-semibold transition-all'>{currentPage}</span> */}
                    
                    <button 
                        disabled={!hasNextPage} 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        className={`px-3 py-1 border rounded-lg transition-all text-sm font-semibold 
                        ${!hasNextPage ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600"}`}
                    >
                        Next
                    </button>
                </div>
      </div>
    </div>
  )
}

export default ViewPromotion
