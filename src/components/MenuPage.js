import React, { useState, useEffect } from 'react';
import ProductListSection from '../components/ProductListSection'; 
import CategoryService from '../services/CategoryService'; 
import CategoryFilter from '../components/filters/CategoryFilter';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
 

const MenuPage = () => {
    
    // STATE CHỈ CÒN CATEGORY VÀ KEYWORD
    const [selectedCategoryId, setSelectedCategoryId] = useState(0); 
    const [searchKeyword, setSearchKeyword] = useState('');
    
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Lấy danh sách Categories khi component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await CategoryService.getAllCategories(); 
                setCategories(data);
            } catch (error) {
                console.error("Lỗi khi tải danh mục:", error);
                toast.error("Không thể tải danh mục sản phẩm.");
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // 💡 HANDLERS
    const handleCategoryChange = (categoryId) => {
        setSelectedCategoryId(categoryId);
    };

    const handleKeywordChange = (keyword) => {
        setSearchKeyword(keyword);
    };


    return (
        <div className='max-padd-container !px-0 mt-[72px] mx-auto flex flex-col md:flex-row bg-primary min-h-screen pt-4 pb-12'>
            
            {/* LEFT SIDE: SIDEBAR LỌC */}
            <div className='md:w-1/4 bg-white md:m-3 p-5 rounded-xl shadow-lg'>
                <h3 className='text-2xl font-bold mb-6 text-gray-800 border-b pb-3'>
                Product Filter
                </h3>
                
                {/* Lọc theo Category */}
                <CategoryFilter 
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onCategoryChange={handleCategoryChange}
                    loading={loadingCategories}
                />

                
            </div>

            {/* RIGHT SIDE: KHU VỰC SẢN PHẨM & PHÂN TRANG */}
            <div className='md:w-3/4 max-sm:px-0 md:m-3 bg-white p-5 rounded-xl shadow-lg'>
                
                <h2 className='text-3xl font-extrabold mb-8 text-gray-800'>
                    <span className='text-red-600'>Menu</span>
                </h2>
                
                {/* Thanh tìm kiếm */}
                <input 
                    type="text"
                    placeholder="Find food by name..."
                    value={searchKeyword}
                    onChange={(e) => handleKeywordChange(e.target.value)}
                    className="w-full p-3 mb-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-150"
                />

                {/* Component Hiển thị Sản phẩm & Phân trang */}
                <ProductListSection
                    selectedCategoryId={selectedCategoryId}
                    searchKeyword={searchKeyword}
                />

            </div>
        </div>
    );
};

export default MenuPage;