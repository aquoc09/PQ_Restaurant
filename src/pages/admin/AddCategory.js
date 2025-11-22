// src/components/AddCategory.jsx
import React, { useState, useEffect } from 'react';
import CategoryService from '../../services/CategoryService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const initialFormState = {
    name: '',
    categoryCode: '',
    status: 'ACTIVE',
    parentCategory: '',
};

function AddCategory() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormState);
    const [allCategories, setAllCategories] = useState([]); // Để chọn danh mục cha
    const [loading, setLoading] = useState(false);

    // Tải tất cả danh mục để hiển thị Parent Category Select
    useEffect(() => {
        const fetchAllCategories = async () => {
            try {
                const data = await CategoryService.getAllCategories();
                setAllCategories(data);
            } catch (error) {
                console.error("Lỗi tải danh mục cha:", error);
                toast.error("Không thể tải danh sách danh mục cha.");
            }
        };
        fetchAllCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const requestData = {
                ...formData,
                parentCategory: formData.parentCategory || null // Gửi null nếu không chọn
            };
            await CategoryService.createCategory(requestData);
            toast.success('Thêm danh mục thành công!');
            navigate('/admin/list-category'); // Điều hướng về trang danh sách
        } catch (error) {
            console.error("Lỗi thêm danh mục:", error);
            toast.error("Thêm danh mục thất bại. Vui lòng kiểm tra dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-primary shadow rounded-xl'>
            <h2 className='text-2xl font-bold text-gray-800 mb-6'>Add New Category</h2>
            
            <form onSubmit={handleSubmit} className='flex flex-col gap-y-3.5 px-2 text-sm w-full lg:w-full'>
                <div className="mb-4">
                    <h5>Category Name</h5>
                    <input type="text" name="name" value={formData.name} placeholder='Type here...' className='px-3 py-1.5 
          ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full' onChange={handleInputChange} required />
                </div>
                
                <div className="mb-4">
                    <h5>Category Code</h5>
                    <input type="text" name="categoryCode" placeholder='Type here...' className='px-3 py-1.5 
          ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full'
           value={formData.categoryCode} onChange={handleInputChange} required/>
                </div>
                
                <div className="mb-4">
                    <h5>Status</h5>
                    <select name="status" value={formData.status} onChange={handleInputChange} required className="px-3 py-1.5 
          ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full">
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                    </select>
                </div>

                <div className="mb-4">
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
                    <button type="submit" disabled={loading} onClick={() => navigate('/admin/list-category')} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50">
                        {loading ? 'Adding...' : 'Add Category'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddCategory;