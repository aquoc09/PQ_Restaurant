import React, { useState, useEffect } from 'react';
import CategoryService from '../../services/CategoryService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { myAssets } from '../../assets/assets'; 

function ViewCategory() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    
    const fetchCategories = async () => {
        setLoading(true);
        try {
            
            const data = await CategoryService.getAllCategories();
            setCategories(data);
            toast.success("Tải danh mục thành công!");
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
            toast.error("Không thể tải danh sách danh mục.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // --- Xử lý Xóa Danh mục ---
    const handleDelete = async (categoryId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục ID: ${categoryId} không?`)) {
            return;
        }
        try {
            await CategoryService.deleteCategory(categoryId);
            toast.success(`Xóa danh mục ${categoryId} thành công.`);
            // Sau khi xóa thành công, tải lại danh sách
            fetchCategories(); 
        } catch (err) {
            console.error("Lỗi xóa danh mục:", err);
            toast.error('Lỗi xóa danh mục. Có thể danh mục này đang được sử dụng.');
        }
    };


    if (loading) return <div className='p-6'>Đang tải danh sách danh mục...</div>;

    return (
        <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-primary shadow rounded-xl'>
            <div className='flex justify-between items-center mb-6'> 
                <h2 className='text-2xl font-bold'>Category Management</h2>
                
                {/* Nút điều hướng đến trang Thêm */}
                <button onClick={()=>{
                navigate("/admin/add-category")}} className='px-6 py-3 active:scale-95 transition bg-tertiary 
                border-gray-500/20 text-black text-sm font-medium rounded-full cursor-pointer flex justify-center items-center gap-2'>
                Add Category
                <img src={myAssets.square_plus} alt="" />
                </button>
            </div>

            {/* Bảng Danh Mục */}
            <div className='flex flex-col gap-2 lg:w-full'>
                <div className='grid grid-cols-[1fr_2fr_1.5fr_2fr_1fr] items-center py-4 px-2 bg-solid text-white bold-14 sm:bold-15 mb-1 rounded-xl'>
                    <h5>STT</h5>
                    <h5>Name</h5>
                    <h5>Category Code</h5>
                    <h5>Parent Category</h5>
                    <h5>Action</h5>
                </div>

                {categories.length === 0 ? (
                    <p className='p-4 text-center'>Không có danh mục nào được tìm thấy.</p>
                ) : (
                    categories.map((cat, index) => (
                        <div key={cat.id} className='grid grid-cols-[1fr_2fr_1.5fr_2fr_1fr] items-center gap-2 p-2 bg-white rounded-lg' >
                            <p className='text-sm font-semibold'>{(currentPage - 1) * 10 + index + 1}</p>
                            <h5 className='text-sm font-semibold line-clamp-2'>{cat.name}</h5>
                            <p className='text-sm font-semibold'>{cat.categoryCode}</p>
                            <p className='text-sm font-semibold'>{cat.parentCategory || 'Không'}</p>
                            <div>
                                {/* Nút điều hướng đến trang Sửa */}
                                <button 
                                    onClick={() => navigate(`/admin/edit-category/${cat.id}`)} 
                                    className='inline-flex items-center justify-center rounded-md font-medium transition duration-150
                                    bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-sm'
                                >
                                    Edit
                                </button>
                                {/* Nút Xóa */}
                                <button 
                                    onClick={() => handleDelete(cat.id)} 
                                    className='inline-flex items-center justify-center rounded-md 
                                    font-medium transition duration-150 bg-red-600 hover:bg-red-700 text-white 
                                    px-2 py-1 text-sm ml-2'
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ViewCategory;