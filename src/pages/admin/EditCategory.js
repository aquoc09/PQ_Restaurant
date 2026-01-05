// src/components/EditCategory.jsx
import React, { useState, useEffect } from 'react';
import CategoryService from '../../services/CategoryService';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

const initialFormState = {
    name: '',
    categoryCode: '',
    active: true,
    parentCategory: '',
};

function EditCategory() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormState);
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                //  Lấy dữ liệu danh mục hiện tại
                const currentCatResponse = await CategoryService.getCategoryById(categoryId);
                const currentCategory = currentCatResponse.result; 
                
                const parentCategoryObject = currentCategory.parentCategory;
                    
                // Lấy categoryCode từ object cha, nếu không có thì là chuỗi rỗng
                const parentCodeToSet = parentCategoryObject
                                        ? parentCategoryObject.categoryCode 
                                        : '';

                setFormData({
                    id: currentCategory.id,
                    name: currentCategory.name,
                    categoryCode: currentCategory.categoryCode,
                    active: String(currentCategory.active),
                    parentCategory: parentCodeToSet,
                });

                // Tải tất cả danh mục để chọn Danh mục cha
                const allCats = await CategoryService.getAllCategories();
                const filteredCats = allCats.filter(cat => cat.id !== currentCategory.id && !cat.parentCategory);
                setAllCategories(filteredCats);
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

        const isActive = formData.active === 'true';
        let parentCategoryObject = {};

        if (formData.parentCategory && formData.parentCategory !== "") {
            parentCategoryObject = { 
                categoryCode: formData.parentCategory
            };
        }

        try {
            const requestData = {
                name: formData.name,
                categoryCode: formData.categoryCode,
                active: isActive,
                parentCategory: parentCategoryObject,
            };
            
            
            await CategoryService.updateCategory(categoryId, requestData);
            toast.success(`Update category ID: ${categoryId} success!`);
            navigate('/admin/list-category'); 
        } catch (error) {
            console.error("Lỗi Update category:", error);
            toast.error("Update category thất bại. Vui lòng kiểm tra dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className='p-6'>Đang tải dữ liệu danh mục...</div>;
    
    return (
        <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-slate-50 shadow rounded-xl'>
            <h2 className='text-2xl font-bold text-gray-800 mb-6'>Edit Category ID: {formData.id}</h2>
            
            <form onSubmit={handleSubmit} className='flex flex-col gap-y-3.5 px-2 text-sm w-full lg:w-full'>
                <div className="w-full">
                    <h5>Category Name</h5>
                    <input type="text" 
                    name="name" 
                    value={formData.name} 
                    placeholder='Type here...' 
                    className='px-3 py-1.5 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full' onChange={handleInputChange} required />
                </div>
                
                <div className="w-full">
                    <h5>Category Code</h5>
                    <input type="text" 
                    name="categoryCode" 
                    value={formData.categoryCode} 
                    onChange={handleInputChange} required 
                    placeholder='Type here...' 
                    className='px-3 py-1.5 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full'
                    />
                </div>
                
                <div className="w-full">
                    <h5>Status</h5>
                    <select 
                    name="active" 
                    value={formData.active} 
                    onChange={handleInputChange} 
                    required 
                    className="px-3 py-1.5 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full">
                        <option value="true">ACTIVE</option>
                        <option value="false">INACTIVE</option>
                    </select>
                </div>

                <div className="w-full">
                    <h5>Parent Category</h5>
                    <select 
                    name="parentCategory" 
                    value={formData.parentCategory} 
                    onChange={handleInputChange} required
                    className="px-3 py-1.5 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full">
                        <option value="">Không</option>
                        {allCategories.map(cat => (
                            <option key={cat.id} value={cat.categoryCode}>
                                {cat.name}
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