// src/components/EditProduct.jsx
import React, { useState, useEffect } from 'react';
import ProductService from '../../services/ProductService';
import CategoryService from '../../services/CategoryService';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { myAssets } from '../../assets/assets'; 

const initialFormState = {
    name: '',
    productCode: '',
    productImage: '', 
    categoryId: '', 
    description: '',
    inStock: true,
    inPopular: false,
    prices: [{ size: '', price: '' }], // Dạng mảng để dễ dàng chỉnh sửa
};

// Hàm lấy URL từ key (tên file) để xem trước ảnh cũ
const getImageUrl = (key) => {
    return myAssets[key] || '';
};

function EditProduct() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormState);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State để lưu File Object mới
    const [imageFile, setImageFile] = useState(null); 
    // State để hiển thị bản xem trước ảnh (ảnh cũ hoặc ảnh mới)
    const [imagePreview, setImagePreview] = useState(null); 
    // --- 1. Tải Dữ liệu (Sản phẩm hiện tại & Danh mục) ---
    const fetchEditData = async () => {
        
            try {
                // Tải danh mục
                const categoryData = await CategoryService.getAllCategories();
                setCategories(categoryData);

                // Tải sản phẩm hiện tại
                const response = await ProductService.getProductById(id);
                const productData = response.result;

                // Chuyển đổi giá từ Map BE sang Array FE
                const pricesArray = productData.prices || [{ size: '', price: '' }];

                const categoryIdToSet = productData.categoryId ? String(productData.categoryId) : '';
                
                setFormData({
                    name: productData.name,
                    productCode: productData.productCode,
                    productImage: productData.productImage, 
                    description: productData.description,
                    categoryId: categoryIdToSet,
                    inStock: productData.inStock,
                    inPopular: productData.inPopular,
                    prices: pricesArray,
                });
                
                // Thiết lập ảnh hiện tại làm preview ban đầu
                setImagePreview(getImageUrl(productData.productImage));
                

            } catch (error) {
                toast.error("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại.");
                navigate('/manager/list-product');
            } finally {
                setLoading(false);
            }
        };
    //  Các hàm xử lý Input  ---
    
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
        // Đảm bảo giá trị là số
        newPrices[index][name] = name === 'price' ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, prices: newPrices }));
    };

    const addPriceField = () => {
        setFormData(prev => ({ 
            ...prev, 
            prices: [...prev.prices, { size: '', price: 0 }] 
        }));
    };

    const removePriceField = (index) => {
        const newPrices = formData.prices.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, prices: newPrices }));
    };

    // --- Xử lý Chọn File Hình ảnh (Điều chỉnh cho Edit) ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            
            // Tạo URL xem trước cho ảnh mới
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            // Nếu xóa file, quay lại hiển thị ảnh cũ (từ tên file đã lưu)
            setImagePreview(getImageUrl(formData.productImage));
        }
    };

    // Xử lý Submit (Gọi Update API) ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Xác định TÊN FILE (Nếu có file mới, lấy tên file mới. Nếu không, giữ lại tên file cũ)
        let imageFileName = imageFile ? imageFile.name.split('.')[0] : formData.productImage; 
        
        if (!imageFileName) {
            setLoading(false);
            toast.error('Vui lòng chọn hoặc giữ lại ảnh sản phẩm.');
            return;
        }

        //Chuyển đổi prices ngược lại sang Map để gửi lên BE
        const pricesMap = formData.prices.reduce((map, item) => {
            if (item.size && item.price > 0) {
                map[item.size] = item.price;
            }
            return map;
        }, {});

        let haveDescription = formData.description ? formData.description : "";

        // Chuẩn bị ProductRequest cuối cùng
        const productRequest = {
            ...formData,
            productImage: imageFileName, 
            description: haveDescription,
            prices: pricesMap,
            categoryId: parseInt(formData.categoryId,10)
        };
        console.log("Product Request chuẩn bị gửi:", productRequest);

        // 4. Gọi API Update Product
        try {
            await ProductService.updateProduct(id, productRequest);
            toast.success('Update Product success!');
            navigate('/manager/list-product');
        } catch (error) {
            console.error("Lỗi khi Update Product:", error);
            toast.error("Update Product thất bại. Vui lòng kiểm tra lại dữ liệu.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if(id)
            fetchEditData();
    }, [id]);

    if (loading) return <div className='p-8 bg-primary shadow rounded-xl w-full'>Đang tải dữ liệu sản phẩm...</div>;
    
    return (
        <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-slate-50 shadow rounded-xl'>
            <h2 className='text-2xl font-bold mb-6'>Edit Product ID: {id}</h2>
            
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
                        className=" py-2 px-3 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full">
                            <option value="">-- Chose Category --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={String(cat.id)}>
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
                            className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"
                        />
                        {/* Xem trước ảnh (mới hoặc cũ) */}
                        {imagePreview && (
                        <div className="mt-3">
                            <h5>Preview Image:</h5>
                            <img src={imagePreview} alt="Xem trước sản phẩm" className="w-40 h-50 object-cover rounded-md border" />
                        </div>
                    )}
                    </div>
                </div>

                {/* Mô Tả, Checkbox, Prices (Giữ nguyên logic) */}
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
                    <button type="button" onClick={() => navigate('/manager/list-product')} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
                    <button type="submit" disabled={loading} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

        </div>
    );
}

export default EditProduct;