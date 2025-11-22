// src/components/EditCategory.jsx
import React, { useState, useEffect } from 'react';
import CategoryService from '../../services/CategoryService';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

const initialFormState = {
    id: null,
    name: '',
    categoryCode: '',
    status: 'ACTIVE',
    parentCategory: '',
};

function EditCategory() {
    const { categoryId } = useParams(); // Lấy ID từ URL: /admin/edit-category/:categoryId
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormState);
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tải dữ liệu cần thiết (Danh mục hiện tại và Danh mục cha)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Lấy dữ liệu danh mục hiện tại
                const currentCatResponse = await CategoryService.getCategoryById(categoryId);
                // Giả định response.data trả về { result: CategoryResponse }
                const currentCategory = currentCatResponse.result || currentCatResponse; 
                
                setFormData({
                    id: currentCategory.id,
                    name: currentCategory.name,
                    categoryCode: currentCategory.categoryCode,
                    status: currentCategory.status,
                    parentCategory: currentCategory.parentCategory || '',
                });

                // 2. Tải tất cả danh mục để chọn Danh mục cha
                const allCats = await CategoryService.getAllCategories();
                setAllCategories(allCats);
            } catch (error) {
                console.error("Lỗi tải dữ liệu sửa:", error);
                toast.error("Không thể tải dữ liệu danh mục để sửa.");
                navigate('/admin/list-category');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [categoryId, navigate]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const requestData = {
                name: formData.name,
                categoryCode: formData.categoryCode,
                status: formData.status,
                parentCategory: formData.parentCategory || null
            };
            
            await CategoryService.updateCategory(categoryId, requestData);
            toast.success(`Cập nhật danh mục ID: ${categoryId} thành công!`);
            navigate('/admin/list-category'); // Điều hướng về trang danh sách
        } catch (error) {
            console.error("Lỗi cập nhật danh mục:", error);
            toast.error("Cập nhật danh mục thất bại. Vui lòng kiểm tra dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className='p-6'>Đang tải dữ liệu danh mục...</div>;
    
    return (
        <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-primary shadow rounded-xl'>
            <h2 className='text-2xl font-bold text-gray-800 mb-6'>Edit Category {formData.name}</h2>
            
            <form onSubmit={handleSubmit} className='flex flex-col gap-y-3.5 px-2 text-sm w-full lg:w-full'>
                <div className="w-full">
                    <h5>Category Name</h5>
                    <input type="text" name="name" value={formData.name} placeholder='Type here...' className='px-3 py-1.5 
          ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full' onChange={handleInputChange} required />
                </div>
                
                <div className="w-full">
                    <h5>Category Code</h5>
                    <input type="text" name="categoryCode" placeholder='Type here...' className='px-3 py-1.5 
          ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full'
           value={formData.categoryCode} onChange={handleInputChange} required/>
                </div>
                
                <div className="w-full">
                    <h5>Status</h5>
                    <select name="status" value={formData.status} onChange={handleInputChange} required className="px-3 py-1.5 
          ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full">
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                    </select>
                </div>

                <div className="w-full">
                    <h5>Parent Category</h5>
                    <select name="parentCategory" value={formData.parentCategory} onChange={handleInputChange} className="px-3 py-1.5 
          ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full">
                        <option value="">-- Chose parent category --</option>
                        {allCategories.map(cat => (
                            <option key={cat.id} value={cat.categoryCode}>
                                {cat.name} ({cat.categoryCode})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => navigate('/admin/list-category')} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
                    <button type="submit" disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditCategory;