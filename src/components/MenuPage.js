import React, { useState, useEffect } from 'react';
import ProductListSection from '../components/ProductListSection'; 
import CategoryService from '../services/CategoryService'; 
import CategoryFilter from '../components/filters/CategoryFilter';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { myAssets } from '../assets/assets';
 

const MenuPage = () => {

    const [selectedCategoryId, setSelectedCategoryId] = useState(0); 
    const [searchKeyword, setSearchKeyword] = useState('');
    const [sortType, setSortType] = useState('relative');
    
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

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
                <h3 className='text-2xl font-bold mb-6 text-gray-800 pb-1'>
                Product Filter
                </h3>
                <div className='py-4'>
                    <div className='text-center'>
                        <div className='inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-primary ring-1
                            ring-slate-900/20 w-full'>
                            <input type="text" 
                            value={searchKeyword} 
                            onChange={(e)=>handleKeywordChange(e.target.value)}
                            placeholder='Tìm kiếm....' className='border-none outline-none w-full text-sm bg-primary' />
                            <div>
                                <img src={myAssets.search} alt="" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-4 py-3 mt-2 bg-primary rounded-xl">
                    <h5 className="mb-4 text-gray-700">Sort By Price</h5>
                    <select 
                        value={sortType}
                        onChange={(e) => setSortType(e.target.value)}
                        className="border border-slate-900/10 outline-none bg-white text-gray-30 text-sm font-medium h-8 w-full px-2 rounded-md text-gray-600"
                    >
                        <option value="relative">Liên quan nhất</option>
                        <option value="low">Giá: Thấp đến Cao</option>
                        <option value="high">Giá: Cao đến Thấp</option>
                    </select>
                </div>
                
                <div className='pl-5 py-3 mt-4 bg-primary rounded-xl'>
                    {/* Lọc theo Category */}
                    <CategoryFilter 
                        allCategories={categories}
                        selectedCategoryId={selectedCategoryId}
                        onCategoryChange={handleCategoryChange}
                        loading={loadingCategories}
                    />
                </div>

                
            </div>

            {/* RIGHT SIDE: KHU VỰC SẢN PHẨM & PHÂN TRANG */}
            <div className='md:w-3/4 max-sm:px-0 md:m-3 bg-white p-5 rounded-xl shadow-lg'>
                
                <h2 className='text-3xl font-extrabold mb-8 text-gray-800'>
                    <span className='text-red-600'>Menu</span>
                </h2>

                {/* Component Hiển thị Sản phẩm & Phân trang */}
                <ProductListSection
                    selectedCategoryId={selectedCategoryId}
                    searchKeyword={searchKeyword}
                    sortType={sortType}
                />

            </div>
        </div>
    );
};

export default MenuPage;