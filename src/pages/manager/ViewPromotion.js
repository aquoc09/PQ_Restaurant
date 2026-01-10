import React, {useState,useEffect} from 'react'
import PromotionService from '../../services/PromotionService';
import { toast } from 'react-toastify';
import { myAssets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

function ViewPromotionManager() {

  const navigate=useNavigate();
  const [promotion, setPromotion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const fetchPromotion = async () => {
    setLoading(true);
    try {
          const response = await PromotionService.getAllPromotions();

          setPromotion(response.result);
    } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        // toast.error("Không thể tải danh sách promotion.");
    } finally {
        setLoading(false);
    }
  };

    // Tải dữ liệu khi component mount lần đầu
    useEffect(() => {
        fetchPromotion();
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPromotions = promotion.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(promotion.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Update Status
    const handleToggleStatus = async (item) => {
        const newStatus = !item.inStock;

        const previousPromotions = [...promotion];
        const updatedPromotions = promotion.map(p => 
            p.id === item.id ? { ...p, inStock: newStatus } : p
        );
        setPromotion(updatedPromotions);
        try {

            const detailResponse = await PromotionService.getPromotionById(item.id);
            const fullData = detailResponse.result;

            const promotionRequest = {
                title: fullData.title,
                img: fullData.img,
                inStock: newStatus, 
            };

            await PromotionService.updatePromotion(item.id, promotionRequest);
            toast.success(`Cập nhật trạng thái: ${fullData.title}`);

        } catch (error) {
            setPromotion(previousPromotions);
            console.error("Lỗi update status:", error);
            toast.error("Không thể cập nhật trạng thái. Vui lòng thử lại.");
        }
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
    <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-slate-50 shadow rounded-xl no-scrollbar'>
      <div className='flex justify-between items-center mb-6'> 
        <h2 className='text-2xl font-bold'>Promotion Management</h2>
        <button onClick={()=>{
                      navigate("/manager/add-promotion")}} 
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
        {currentPromotions.length === 0 ? (
          <p className='p-4 text-center'>Không có khuyến mãi nào.</p>
        ) : (
          
          currentPromotions.map((promotion, index)=>(
            <div key={promotion.id} className='grid grid-cols-[1fr_1.5fr_1.5fr_1fr_1fr] items-center gap-2 p-2 bg-white rounded-lg' >
            <p className='text-sm font-semibold'>{(currentPage - 1) * 5 + index + 1}</p>
            <img src={myAssets[promotion.img]} alt="" className='w-12 bg-primary rounded'/>
            <h5 className='text-sm font-semibold line-clamp-2'>{promotion.title}</h5>

            <div>
              <label className='relative inline-flex items-center cursor-pointer text-gray-900 gap-3 select-none'>
                <input 
                    type='checkbox' 
                    className='sr-only peer' 
                    checked={promotion.inStock} // Đổi từ defaultChecked sang checked
                    onChange={() => handleToggleStatus(promotion)} // Gắn hàm xử lý
                />
                <div className='w-10 h-6 bg-slate-300 rounded-full peer peer-checked:bg-solid transition-colors duration-200'>
                  <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${promotion.inStock ? 'translate-x-4' : ''}`}></span>
                </div>
              </label>
            </div>

            <div className='py-2.5 flex items-center gap-2'>
              <button onClick={() => navigate(`/manager/edit-promotion/${promotion.id}`)} 
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
          ))
        )}

        {/* Phân Trang */}
        {promotion.length > itemsPerPage && (
          <div className="flex justify-end mt-4 gap-2">
              <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg border text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                      currentPage === 1 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-white text-gray-700 hover:bg-blue-100 border-gray-300"
                  }`}
              >
                  &laquo; Trước
              </button>
              
              {/* Chỉ hiện tối đa 5 trang để tránh dài quá nếu data nhiều */}
              {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                  <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`px-4 py-2 rounded border text-sm transition-all ${
                          currentPage === i + 1
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 hover:bg-blue-100 border-gray-300"
                      }`}
                  >
                      {i + 1}
                  </button>
              ))}

              <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                      currentPage === totalPages 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-white text-gray-700 hover:bg-blue-100 border-gray-300"
                  }`}
              >
                  Sau &raquo;
              </button>
          </div>
      )}
      </div>
    </div>
  )
}

export default ViewPromotionManager
