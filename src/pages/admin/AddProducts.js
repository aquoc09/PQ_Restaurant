// src/components/AddProduct.jsx (Chỉnh sửa)
import React, { useState, useEffect } from 'react';
import ProductService from '../../services/ProductService';
import CategoryService from '../../services/CategoryService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const initialFormState = {
    name: '',
    productCode: '',
    productImage: '', 
    description: '',
    categoryId: '', 
    inStock: true,
    inPopular: false,
    prices: [{ size: "", price: "" }], 
};

function AddProduct() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormState);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    // lưu File Object ảnh
    const [imageFile, setImageFile] = useState(null); 
    // hiển thị bản xem trước ảnh
    const [imagePreview, setImagePreview] = useState(null); 

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await CategoryService.getAllCategories();
                setCategories(data);
            } catch (error) {
                toast.error("Không thể tải danh mục. Vui lòng thử lại.");
            }
        };
        fetchCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    const handlePriceChange = (index, e) => {
        const { name, value } = e.target;
        const newPrices = [...formData.prices];
        newPrices[index][name] = name === 'price' ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, prices: newPrices }));
    };

    const addPriceField = () => {
        setFormData(prev => ({ 
            ...prev, 
            prices: [...prev.prices, { size: '', price: '' }] 
        }));
    };

    const removePriceField = (index) => {
        const newPrices = formData.prices.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, prices: newPrices }));
    };

    // --- Xử lý Chọn File Hình ảnh ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            
            // Tạo URL xem trước
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Kiểm tra và Upload hình ảnh
        let imageFileName = '';
        if (imageFile) {
            const myArray = imageFile.name.split('.');
            imageFileName = myArray[0]; 
        } else {
            setLoading(false);
            toast.error('Vui lòng chọn ảnh.');
            return;
        }

        // Chuyển đổi prices sang Map
        const pricesMap = formData.prices.reduce((map, item) => {
            if (item.size && item.price > 0) {
                map[item.size] = item.price;
            }
            return map;
        }, {});
        
        // Chuẩn bị ProductRequest cuối cùng
        const productRequest = {
            ...formData,
            productImage: imageFileName,
            prices: pricesMap,
            categoryId: parseInt(formData.categoryId,10),
        };

        // Gọi API Thêm Sản phẩm
        try {
            await ProductService.createProduct(productRequest);
            toast.success('Add product success!');
            navigate('/admin/list-product');
        } catch (error) {
            console.error("Lỗi khi thêm sản phẩm:", error);
            toast.error("Thêm sản phẩm thất bại. Vui lòng kiểm tra lại dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-slate-50 shadow rounded-xl'>
            <h2 className='text-2xl font-bold mb-6'>Add New Product</h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className='col-span-1'>
                    {/* Name, Code */}
                    <div className="mb-4">
                        <h5>Product Name</h5>
                        <input type="text" name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        required 
                        placeholder='Type here...' 
                        className='px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full'/>
                    </div>
                    <div className="mb-4">
                        <h5>Product Code</h5>
                        <input type="text" name="productCode" 
                        value={formData.productCode} 
                        onChange={handleInputChange} 
                        required 
                        placeholder='Type here...' 
                        className='px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full'/>
                    </div>

                    {/* Danh mục */}
                    <div className="mb-4">
                        <h5>Category</h5>
                        <select 
                        name="categoryId" 
                        value={formData.categoryId} 
                        onChange={handleInputChange} 
                        required 
                        className="py-2 px-3 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full">
                            <option value="">-- Chose Category --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Image */}
                    <div className="mb-4">
                        <h5>Product Image</h5>
                        <input 
                            type="file" 
                            name="imageUpload" 
                            accept="image/*"
                            onChange={handleImageChange} 
                            required 
                            className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"
                        />
                        {/* Xem trước ảnh */}
                        {imagePreview && (
                            <div className="mt-3">
                                <h5>Preview Image:</h5>
                                <img src={imagePreview} alt="Xem trước sản phẩm" className="w-40 h-40 object-cover rounded-md border" />
                            </div>
                        )}
                    </div>
                    
                </div>

                {/* Mô Tả, Checkbox, Prices */}
                <div className='col-span-1'>
                    <div className="mb-4">
                        <h5>Description</h5>
                        <textarea name="description" 
                        value={formData.description} 
                        onChange={handleInputChange} 
                        placeholder='Type here...' 
                        className="py-2 px-3 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full h-24"/>
                    </div>
                    <div className='mb-4 flex gap-6'>
                        <label className="flex items-center">
                            <input type="checkbox" name="inStock" checked={formData.inStock} onChange={handleInputChange} className="mr-2 leading-tight"/>
                            <h5>InStock</h5>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" name="inPopular" checked={formData.inPopular} onChange={handleInputChange} className="mr-2 leading-tight"/>
                            <h5>InPopular</h5>
                        </label>
                    </div>
                    <div className="mb-4 border p-3 rounded-lg">
                        <h5>Price & Size</h5>
                        {formData.prices.map((item, index) => (
                            <div key={index} className="flex gap-2 mb-2 items-center">
                                <input type="text" name="size" 
                                placeholder="Size (S/M/L)" 
                                value={item.size} 
                                onChange={(e) => handlePriceChange(index, e)} 
                                required 
                                className="py-2 px-3 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-1/3"/>

                                <input type="number" name="price" 
                                placeholder="Price (VND)" 
                                value={item.price} 
                                onChange={(e) => handlePriceChange(index, e)} 
                                required 
                                className="py-2 px-3 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-2/3"/>
                                {formData.prices.length > 1 && (
                                    <button type="button" onClick={() => removePriceField(index)} className="text-red-500 hover:text-red-700">Xóa</button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addPriceField} className="mt-2 text-blue-500 text-sm hover:text-blue-700 border-b border-blue-500">
                            + Price & Size
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="col-span-2 flex justify-end gap-3 mt-4">
                    <button type="button" 
                    onClick={() => navigate('/admin/list-product')} 
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
                    
                    <button type="submit" 
                    disabled={loading} 
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50">
                        {loading ? 'Adding...' : 'Add Product'}
                    </button>
                </div>
            </form>

        </div>
    );
}

export default AddProduct;