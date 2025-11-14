import React, { useState, useEffect } from 'react';
import ProductService from '../services/ProductService'; 
import Items from './Items'; 
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 8; 

const ProductListSection = ({ selectedCategoryId, searchKeyword }) => { 
    
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Reset trang khi bộ lọc thay đổi
    useEffect(() => {
        // Bắt đầu từ trang 1 khi Category hoặc Keyword thay đổi
        setCurrentPage(1);
    }, [selectedCategoryId, searchKeyword]);

    // Gọi API khi trang HOẶC bộ lọc thay đổi
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            
            const pageIndex = currentPage - 1; 

            try {
                // Gọi API chỉ với Category và Keyword
                const response = await ProductService.getProducts(
                    searchKeyword || '',
                    selectedCategoryId || 0, 
                    pageIndex,
                    ITEMS_PER_PAGE
                ); 
                
                const productListResponse = response.result;

                setProducts(productListResponse.products);
                setTotalPages(productListResponse.totalPages);

                
            } catch (err) {
                // console.error("Lỗi khi tải sản phẩm:", err);
                toast.error("Không thể tải sản phẩm. Vui lòng thử lại.");
                // setError("Không thể tải sản phẩm.");
                setProducts([]);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [currentPage, selectedCategoryId, searchKeyword]);

    
    if (loading) {
        return <div className='h-64 flex justify-center items-center text-lg text-gray-600'>Đang tải sản phẩm...</div>;
    }

    if (error) {
         return <div className='h-64 flex justify-center items-center text-xl text-red-600'>{error}</div>;
    }
    
    return (
        <div>
            {/* DANH SÁCH SẢN PHẨM */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10'>
                {console.log(totalPages)}
                {products.length > 0 ? (
                    products.map((product) => (
                        <Items key={product.id} product={product} />
                    ))
                ) : (
                    <p className='col-span-full text-center py-10 text-xl text-gray-500'>Không tìm thấy sản phẩm nào.</p>
                )}
            </div>

            {/* PHÂN TRANG */}
            {totalPages > 1 && (
                <div className='flex justify-center items-center flex-wrap mt-14 mb-10 gap-3'>
                    <button 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(prev => prev - 1)} 
                        className={`px-3 py-1 border rounded-lg transition-all text-sm font-semibold 
                        ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600"}`}
                    >
                        Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button 
                            key={index + 1} 
                            onClick={() => setCurrentPage(index + 1)}
                            className={`px-3 py-1 border rounded-lg text-sm font-semibold transition-all
                            ${currentPage === index + 1 ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    
                    <button 
                        disabled={currentPage === totalPages} 
                        onClick={() => setCurrentPage(prev => prev + 1)} 
                        className={`px-3 py-1 border rounded-lg transition-all text-sm font-semibold 
                        ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600"}`}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProductListSection;