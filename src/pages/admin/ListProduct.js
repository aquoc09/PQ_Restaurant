import React, { useState, useEffect } from 'react';
import ProductService from '../../services/ProductService';
import { toast } from 'react-toastify';

//ADMIN MUỐN XEM NHIỀU: Tăng giới hạn lên 20 hoặc 50
const ADMIN_ITEMS_PER_PAGE = 20; 

function AdminProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Hàm gọi API Lấy danh sách sản phẩm
    const fetchProducts = async (page = 1) => {
        setLoading(true);
        try {
            // Backend dùng page index 0
            const pageIndex = page - 1; 
            
            // Gọi ProductService.getProducts:
            // keyword="", categoryId=0 (Tất cả), pageIndex, limit
            const response = await ProductService.getProducts(
                '', 
                0, 
                pageIndex, 
                ADMIN_ITEMS_PER_PAGE
            );
            
            // Dữ liệu sản phẩm nằm trong response.data.result (là ProductListResponse)
            const productListResponse = response.result; 

            setProducts(productListResponse.products);
            setTotalPages(productListResponse.totalPages);
            setCurrentPage(page);

        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
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
        <div className='p-6 bg-white rounded-lg shadow'>
            <h2 className='text-2xl font-bold mb-4'>Quản lý Sản phẩm ({products.length})</h2>

            {/* Bảng Hiển thị Dữ liệu */}
            <table className='min-w-full divide-y divide-gray-200 border'>
                <thead className='bg-gray-50'>
                    <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>ID</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Ảnh</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Tên Sản phẩm</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Mã SP</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Giá (Thấp nhất)</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Tình trạng</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Hành động</th>
                    </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{product.id}</td>
                            <td className='px-6 py-4 whitespace-nowrap'><img src={product.productImage} alt={product.name} className='w-12 h-12 object-cover rounded'/></td>
                            <td className='px-6 py-4 whitespace-nowrap font-medium text-gray-900'>{product.name}</td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{product.productCode}</td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600'>
                                {product.prices[0]?.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {product.inStock ? 'Còn hàng' : 'Hết hàng'}
                                </span>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                {/* Thêm các nút Sửa/Xóa */}
                                <button className='text-indigo-600 hover:text-indigo-900 mr-3'>Sửa</button>
                                <button className='text-red-600 hover:text-red-900'>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Phân trang (Pagination) */}
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
    );
}

export default AdminProductList;