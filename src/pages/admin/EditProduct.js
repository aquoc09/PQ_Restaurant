// src/components/EditProduct.jsx
import React, { useState, useEffect } from 'react';
import ProductService from '../../services/ProductService';
import CategoryService from '../../services/CategoryService';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

// *GIẢ ĐỊNH: Import thư viện assets để hiển thị ảnh cũ (Tên File -> URL)
// Nếu bạn không dùng thư viện, hãy thay thế bằng logic lấy URL ảnh hợp lệ.
import { myAssets } from '../../assets/assets'; 

const initialFormState = {
    name: '',
    productCode: '',
    productImage: '', 
    description: '',
    categoryId: '', 
    inStock: true,
    inPopular: false,
    prices: [{ size: 'S', price: 0 }], // Dạng mảng để dễ dàng chỉnh sửa
};

// Hàm chuyển đổi Map giá từ BE thành Mảng FE
const mapPricesToArray = (pricesMap) => {
    if (!pricesMap || typeof pricesMap !== 'object') return [{ size: 'S', price: 0 }];
    return Object.entries(pricesMap).map(([size, price]) => ({
        size: size,
        price: price
    }));
};

// Hàm lấy URL từ key (tên file) để xem trước ảnh cũ
const getImageUrl = (key) => {
    return myAssets[key] || '';
};

function EditProduct() {
    const { productId } = useParams(); // Lấy ID sản phẩm từ URL
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormState);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State để lưu File Object mới
    const [imageFile, setImageFile] = useState(null); 
    // State để hiển thị bản xem trước ảnh (ảnh cũ hoặc ảnh mới)
    const [imagePreview, setImagePreview] = useState(null); 

    // --- 1. Tải Dữ liệu (Sản phẩm hiện tại & Danh mục) ---
    useEffect(() => {
        const fetchEditData = async () => {
            try {
                // Tải danh mục
                const categoryData = await CategoryService.getAllCategories();
                setCategories(categoryData);

                // Tải sản phẩm hiện tại
                const productData = await ProductService.getProductById(productId);

                // Chuyển đổi giá từ Map BE sang Array FE
                const pricesArray = mapPricesToArray(productData.prices);

                setFormData({
                    name: productData.name,
                    productCode: productData.productCode,
                    productImage: productData.productImage, // Tên file hiện tại
                    description: productData.description,
                    categoryId: productData.categoryId.toString(), // Chuyển về string cho thẻ <select>
                    inStock: productData.inStock,
                    inPopular: productData.inPopular,
                    prices: pricesArray,
                });
                
                // Thiết lập ảnh hiện tại làm preview ban đầu
                setImagePreview(getImageUrl(productData.productImage));

            } catch (error) {
                toast.error("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại.");
                navigate('/admin/list-product');
            } finally {
                setLoading(false);
            }
        };
        fetchEditData();
    }, [productId, navigate]);
    
    // --- 2. Các hàm xử lý Input (Giữ nguyên từ AddProduct) ---
    
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

    // --- 3. Xử lý Submit (Gọi Update API) ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // 1. Xác định TÊN FILE (Nếu có file mới, lấy tên file mới. Nếu không, giữ lại tên file cũ)
        let imageFileName = imageFile ? imageFile.name : formData.productImage; 
        
        if (!imageFileName) {
            setLoading(false);
            toast.error('Vui lòng chọn hoặc giữ lại ảnh sản phẩm.');
            return;
        }

        // 2. Chuyển đổi prices ngược lại sang Map để gửi lên BE
        const pricesMap = formData.prices.reduce((map, item) => {
            if (item.size && item.price > 0) {
                map[item.size] = item.price;
            }
            return map;
        }, {});
        
        // 3. Chuẩn bị ProductRequest cuối cùng
        const productRequest = {
            ...formData,
            productImage: imageFileName, // Tên file mới hoặc cũ
            prices: pricesMap,
            categoryId: parseInt(formData.categoryId),
        };
        delete productRequest.prices; // Xóa mảng prices phụ

        // 4. Gọi API Cập nhật Sản phẩm
        try {
            await ProductService.updateProduct(productId, productRequest);
            toast.success('Cập nhật sản phẩm thành công!');
            navigate('/admin/list-product');
        } catch (error) {
            console.error("Lỗi khi cập nhật sản phẩm:", error);
            toast.error("Cập nhật sản phẩm thất bại. Vui lòng kiểm tra lại dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className='p-8 bg-primary shadow rounded-xl w-full'>Đang tải dữ liệu sản phẩm...</div>;
    
    return (
        <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-primary shadow rounded-xl'>
            <h2 className='text-2xl font-bold mb-6'>Edit Product ID: {productId}</h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className='col-span-1'>
                    {/* Name, Code (Giữ nguyên) */}
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

                    {/* Danh mục (Hiển thị categoryId hiện tại) */}
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
                                <option key={cat.id} value={cat.id}>
                                    {cat.name} ({cat.id})
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
                        <h5 className="flex items-center">
                            <input type="checkbox" name="inStock" checked={formData.inStock} onChange={handleInputChange} className="mr-2 leading-tight"/>
                            <h5>InStock</h5>
                        </h5>
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
                    <button type="button" onClick={() => navigate('/admin/list-product')} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
                    <button type="submit" disabled={loading} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditProduct;