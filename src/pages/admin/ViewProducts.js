import React, {useState,useEffect} from 'react'
import ProductService from '../../services/ProductService';
import { toast } from 'react-toastify';
import { myAssets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

function ViewProducts() {

  const navigate=useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const formatCurrency = (value) => {
    if (typeof value !== "number" || isNaN(value)) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0, // Không hiển thị số lẻ
    }).format(value);
  };

  const fetchProducts = async (page = 1) => {
        setLoading(true);
        try {
            const response = await ProductService.getProducts(
                '', 
                0, 
                page - 1, 
                10
            );
            const productListResponse = response.result;
            setProducts(productListResponse.products);
            setTotalPages(productListResponse.totalPages);
            setCurrentPage(page);

        } catch (error) {
            // console.error("Lỗi khi tải sản phẩm:", error);
            toast.error("Không thể tải danh sách sản phẩm.");
        } finally {
            setLoading(false);
        }
    };

    // Tải dữ liệu khi component mount lần đầu
    useEffect(() => {
        fetchProducts(1);
    }, []);
    
    // Tải lại dữ liệu khi chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchProducts(newPage);
        }
    };

    if (loading) return <div className='p-6'>Đang tải danh sách sản phẩm...</div>;

  return (
    <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-primary shadow rounded-xl'>
      <div className='flex justify-between items-center mb-6'> 
        <h2 className='text-2xl font-bold mb-4'>Quản lý Sản phẩm ({products.length})</h2>
        <button onClick={()=>{
                      navigate("/admin/add-product")}} className='px-6 py-3 active:scale-95 transition bg-tertiary border-gray-500/20 text-black text-sm font-medium rounded-full cursor-pointer flex justify-center items-center gap-2'>
                Add Product
                <img src={myAssets.square_plus} alt="" />
        </button>
      </div>
      <div className='flex flex-col gap-2 lg:w-11/12'>
        <div className='grid grid-cols-[1fr_1.5fr_2fr_2fr_1.5fr_1.5fr_1fr] items-center py-4 px-2 bg-solid text-white 
        bold-14 sm:bold-15 mb-1 rounded-xl'>
          <h5>STT</h5>
          <h5>Image</h5>
          <h5>Title</h5>
          <h5>Category</h5>
          <h5>Size/Price</h5>
          <h5>Instock</h5>
          <h5>Action</h5>
        </div>

        {/* Product List */}
        {products.map((product, index)=>(
        <div key={product.id} className='grid grid-cols-[1fr_1.5fr_2fr_2fr_1.5fr_1.5fr_1fr] items-center gap-2 p-2 bg-white rounded-lg' >
          <p className='text-sm font-semibold'>{(currentPage - 1) * 10 + index + 1}</p>
          <img src={myAssets[product.productImage]} alt="" className='w-12 bg-primary rounded'/>
          <h5 className='text-sm font-semibold line-clamp-2'>{product.name}</h5>
          <p className='text-sm font-semibold'>{product.categoryCode}</p>
          <div className='text-sm font-semibold'>{product.prices.map((p, index) => (
                                                  <div key={index}>
                                                    {p.size}: {formatCurrency(p.price)}
                                                  </div>
                                                ))}
          </div>
          <div>
            <label className='relative inline-flex items-center cursor-pointer text-gray-900 gap-3'>
              <input type='checkbox' className='sr-only peer' defaultChecked={product.inStock}></input>
              <div className='w-10 h-6 bg-slate-300 rounded-full peer peer-checked:bg-solid transition-colors duration-200'>
                <span className='absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4'></span>
              </div>
            </label>
          </div>
          <div>
            <button className='text-indigo-600 hover:text-indigo-900 mr-3'>Sửa</button>
            <button className='text-red-600 hover:text-red-900'>Xóa</button>
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

export default ViewProducts
