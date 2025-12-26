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
    const [itemsPerPage] = useState(5);
    
    const fetchCategories = async () => {
        setLoading(true);
        try {
            
            const data = await CategoryService.getAllCategories();
            setCategories(data);
            // toast.success("Tải danh mục success!");
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
            // toast.error("Không thể tải danh sách danh mục.");
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
            toast.success(`Xóa danh mục ${categoryId} success.`);
            // Sau khi xóa success, tải lại danh sách
            fetchCategories(); 
        } catch (err) {
            console.error("Lỗi xóa danh mục:", err);
            toast.error('Lỗi xóa danh mục. Có thể danh mục này đang được sử dụng.');
        }
    };
        
    // --- Logic Phân trang ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(categories.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);


    if (loading) return <div className='p-6'>Đang tải danh sách danh mục...</div>;

    return (
        <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-slate-50 shadow rounded-xl'>
            <div className='flex justify-between items-center mb-6'> 
                <h2 className='text-2xl font-bold'>Category Management</h2>
                
                {/* Nút điều hướng đến trang Thêm */}
                <button onClick={()=>{
                navigate("/manager/add-category")}} className='px-6 py-3 active:scale-95 transition bg-tertiary 
                border-gray-500/20 text-black text-sm font-medium rounded-full cursor-pointer flex justify-center items-center gap-2'>
                Add Category
                <img src={myAssets.square_plus} alt="" />
                </button>
            </div>

            {/* Bảng Danh Mục */}
            <div className='flex flex-col gap-2 lg:w-full'>
                <div className='grid grid-cols-[1fr_1.5fr_1.5fr_1.5fr_1fr_1.5fr] items-center py-4 px-2 bg-solid text-white bold-14 sm:bold-15 mb-1 rounded-xl'>
                    <h5>STT</h5>
                    <h5>Name</h5>
                    <h5>Category Code</h5>
                    <h5>Parent Category</h5>
                    <h5>Status</h5>
                    <h5>Action</h5>
                </div>

                {currentCategories.length === 0 ? (
                    <p className='p-4 text-center'>Không có danh mục nào được tìm thấy.</p>
                ) : (
                    currentCategories.map((cat, index) => (
                        <div key={cat.id} className='grid grid-cols-[1fr_1.5fr_1.5fr_1.5fr_1fr_1.5fr] items-center gap-2 p-2 bg-white rounded-lg' >
                            <h5 className='font-semibold'>{(currentPage - 1) * itemsPerPage + index + 1}</h5>
                            <h5 className='font-semibold line-clamp-2'>{cat.name}</h5>
                            <p className='font-semibold'>{cat.categoryCode}</p>
                            <p className='font-semibold'>{cat.parentCategory || 'Không'}</p>
                            <div>
                                <h5 className='relative inline-flex items-center cursor-pointer text-gray-900 gap-3'>
                                <input type='checkbox' className='sr-only peer' defaultChecked={cat.active}></input>
                                <div className='w-10 h-6 bg-slate-300 rounded-full peer peer-checked:bg-solid transition-colors duration-200'>
                                    <span className='absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4'></span>
                                </div>
                                </h5>
                            </div>
                            <div className='flex items-center gap-2 py-2.5'>
                                {/* Nút điều hướng đến trang Sửa */}
                                <button 
                                    onClick={() => navigate(`/manager/edit-category/${cat.id}`)} 
                                    className='inline-flex items-center justify-center rounded-md font-medium transition duration-150
                                    hover:bg-blue-200 text-white px-2 py-1 text-sm'
                                >
                                    <img src={myAssets.edit} alt="" className='max-h-20 max-w-20 object-contain' />
                                </button>
                                {/* Nút Xóa */}
                                <button 
                                    onClick={() => handleDelete(cat.id)} 
                                    className='inline-flex items-center justify-center rounded-md 
                                    font-medium transition duration-150 hover:bg-red-200 text-white 
                                    px-2 py-1 text-sm'
                                >
                                    <img src={myAssets.trash} alt="" className='max-h-20 max-w-20 object-contain' />
                                </button>
                            </div>
                        </div>
                    ))
                )}

                
            </div>
            {categories.length > itemsPerPage && (
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
    );
}

export default ViewCategory;