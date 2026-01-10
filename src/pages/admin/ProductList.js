import React, {useState,useEffect,useCallback} from 'react'
import ProductService from '../../services/ProductService';
import CategoryService from '../../services/CategoryService';
import { toast } from 'react-toastify';
import { myAssets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 8; 

const ProductList = ({searchKeyword}) => {

    const navigate=useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState({});
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState(null);

    // Reset trang khi Keyword thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [searchKeyword]);

    const fetchProducts = useCallback(async (pageNum = 1) => {
        setLoading(true);
        setError(null);
        const pageIndex = pageNum - 1;
        try {
                const response = await ProductService.getProducts(
                searchKeyword || '', 
                0, 
                pageIndex, 
                ITEMS_PER_PAGE
            );
            const productListResponse = response.result;
            setProducts(productListResponse.products);
            setTotalPages(productListResponse.totalPages);

        } catch (error) {
            // console.error("Lỗi khi tải sản phẩm:", error);
            toast.error("Không thể tải danh sách sản phẩm.");
        } finally {
            setLoading(false);
        }
    }, [searchKeyword]);

    // Tải dữ liệu khi trang hoặc searchKeyword thay đổi
    useEffect(() => {
        fetchCategoriesMap();
        fetchProducts(currentPage);
    }, [currentPage, searchKeyword, fetchProducts]);

    const formatCurrency = (value) => {
        if (typeof value !== "number" || isNaN(value)) return "";
        return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0, // Không hiển thị số lẻ
        }).format(value);
    };

    const fetchCategoriesMap = async () => {
        try {
        const response = await CategoryService.getAllCategories();

        // Chuyển mảng Categories thành Object/Map để tra cứu nhanh theo ID
        const categoryMap = response.reduce((map, cat) => {
        map[cat.id] = cat.name; 
        return map;
        }, {});
        setCategories(categoryMap);
        } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
        }
    };

    const getCategoryName = (categoryId) => {
        return categories[categoryId];
    };

    // Update Logic
    const handleToggleInStock = async (product) => {
        const newStatus = !product.inStock;
        
        const previousProducts = [...products];
        const updatedProducts = products.map(p => 
            p.id === product.id ? { ...p, inStock: newStatus } : p
        );
        setProducts(updatedProducts);

        try {

            const detailResponse = await ProductService.getProductById(product.id);
            const fullProduct = detailResponse.result;
            let pricesMap = {};
            if (Array.isArray(fullProduct.prices)) {
                fullProduct.prices.forEach(item => {
                    if (item.size) pricesMap[item.size] = item.price;
                });
            } else if (typeof fullProduct.prices === 'object') {
                pricesMap = fullProduct.prices;
            }
            const productRequest = {
                name: fullProduct.name,
                productCode: fullProduct.productCode,
                productImage: fullProduct.productImage,
                description: fullProduct.description || "",
                categoryId: fullProduct.categoryId,
                inPopular: fullProduct.inPopular,
                inStock: newStatus,
                prices: pricesMap
            };
            await ProductService.updateProduct(product.id, productRequest);
            
            toast.success(`Cập nhật trạng thái sản phẩm ${product.name} thành công!`);
        } catch (error) {
            setProducts(previousProducts);
            toast.error("Lỗi khi cập nhật trạng thái inStock.");
            console.error(error);
        }
    };

    // Delete Logic
    const handleDeleteProduct = async (productId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm ID: ${productId}?`)) {
            return;
        }
        try {
            await ProductService.deleteProduct(productId);
            toast.success(`Delete product ID: ${productId} success!`);
            // Tải lại dữ liệu trang hiện tại sau khi xóa
            fetchProducts(currentPage); 
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            toast.error("Xóa sản phẩm thất bại. Vui lòng thử lại.");
        }
    };
    
    if (loading) {
        return <div className='h-64 flex justify-center items-center text-lg text-gray-600'>Đang tải sản phẩm...</div>;
    }

    if (error) {
         return <div className='h-64 flex justify-center items-center text-xl text-red-600'>{error}</div>;
    }

    return (
        <div>
            {products.length > 0 ? 
            (
                <div className='flex flex-col gap-2 lg:w-full'>
                <div className='grid grid-cols-[1fr_1fr_2fr_1.75fr_1.5fr_1.5fr_2.5fr] items-center py-4 px-2 bg-solid text-white 
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
                <div key={product.id} className='grid grid-cols-[1fr_1fr_2fr_1.75fr_1.5fr_1.5fr_2.5fr] items-center gap-2 p-2 bg-white rounded-lg' >
                    <p className='text-sm font-semibold'>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</p>
                    <img src={myAssets[product.productImage]} alt="" className='w-12 bg-primary rounded'/>
                    <h5 className='text-sm font-semibold line-clamp-2'>{product.name}</h5>
                    <p className='text-sm font-semibold'>{getCategoryName(product.categoryId)}</p>
                    <div className='text-sm font-semibold'>
                        {product.prices.map((p, index) => (
                        <div key={index}>
                        {p.size}: {formatCurrency(p.price)}
                        </div>
                        ))}
                    </div>
                    <div>
                        <label className='relative inline-flex items-center cursor-pointer text-gray-900 gap-3'>
                            <input 
                            type='checkbox' 
                            className='sr-only peer' 
                            checked={product.inStock} 
                            onChange={() => handleToggleInStock(product)} />
                            <div className='w-10 h-6 bg-slate-300 rounded-full peer peer-checked:bg-solid transition-colors duration-200'>
                                <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${product.inStock ? 'translate-x-4' : ''}`}></span>
                            </div>
                        </label>
                    </div>
                    <div className='py-2.5 flex items-center gap-2'>
                        <button 
                        onClick={()=>{navigate(`/admin/edit-product/${product.id}`)}} 
                        className='inline-flex items-center justify-center rounded-md font-medium transition duration-150 hover:bg-blue-200 text-white px-2 py-1 text-sm'>
                        <img src={myAssets.edit} alt="" className='max-h-20 max-w-20 object-contain' />
                        </button>

                        <button 
                        onClick={() => handleDeleteProduct(product.id)} 
                        className='inline-flex items-center justify-center rounded-md 
                        font-medium transition duration-150 hover:bg-red-200 text-white 
                        px-2 py-1 text-sm'>
                        <img src={myAssets.trash} alt="" className='max-h-20 max-w-20 object-contain' />
                        </button>
                        
                    </div>
                    </div>
                    ))}

                    {/* Phân Trang */}
                    {totalPages > 1 && (
                        <div className='flex justify-end mt-4 gap-2'>
                            <button 
                                disabled={currentPage === 1} 
                                onClick={() => setCurrentPage(prev => prev - 1)} 
                                className={`px-4 py-2 rounded-lg border text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all 
                                    ${currentPage === 1 
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                    : "bg-white text-gray-700 hover:bg-blue-100 border-gray-300"
                                }`}
                            >
                                &laquo; Trước
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button 
                                    key={index + 1} 
                                    onClick={() => setCurrentPage(index + 1)}
                                    className={`px-4 py-2 border rounded text-sm font-semibold transition-all
                                        ${currentPage === index + 1
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-gray-700 hover:bg-blue-100 border-gray-300"
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            
                            <button 
                                disabled={currentPage === totalPages} 
                                onClick={() => setCurrentPage(prev => prev + 1)} 
                                className={`px-4 py-2 rounded-lg border text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all
                                    ${currentPage === totalPages 
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                    : "bg-white text-gray-700 hover:bg-blue-100 border-gray-300"
                                }`}
                            >
                                Sau &raquo;
                            </button>
                        </div>
                    )}
                </div>
            )  :
            (
                <p className='col-span-full text-center py-10 text-xl text-gray-500'>Không tìm thấy sản phẩm nào.</p>
            )}
        </div>
    );
}

export default ProductList
