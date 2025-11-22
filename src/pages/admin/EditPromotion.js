// src/components/AddPromotion.jsx (Chỉnh sửa để dùng key/string cho img)
import React, { useState, useEffect } from 'react';
import PromotionService from '../../services/PromotionService';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
// Giả định: Import thư viện assets của bạn để xem trước
import { myAssets } from '../../assets/assets'; 

const initialFormState = {
    id: null,
    title: '',
    img: '',
    inStock: true,
};

function EditPromotion() {
    const navigate = useNavigate();
    const { promotionId } = useParams();
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);

    // State để lưu trữ File Object (để lấy tên file)
    const [imageFile, setImageFile] = useState(null); 
    // State để hiển thị bản xem trước ảnh mới (dùng FileReader )
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentPromo = await PromotionService.getPromotionById(promotionId);
                
                setFormData({
                    id: promotionId,
                    title: currentPromo.title,
                    img: currentPromo.img, // Tên file hiện tại được lưu
                    inStock: currentPromo.inStock,
                });
                // Thiết lập ảnh hiện tại (từ assets) làm preview ban đầu
                setImagePreview(myAssets[currentPromo.img]);
            } catch (error) {
                toast.error("Không thể tải dữ liệu khuyến mãi để sửa.");
                navigate('/admin/list-promotion');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [promotionId, navigate]);

    // Xử lý chung cho title, img, inStock
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    // --- Xử lý Chọn File Hình ảnh ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file); // Lưu File Object
            
            // Tạo  tạm thời để xem trước
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const imageFileName = imageFile ? imageFile.name : formData.img;
        if (!imageFileName) {
            setLoading(false);
            toast.error('Vui lòng chọn ảnh khuyến mãi.');
            return;
        }
        
        // Chuẩn bị PromotionRequest
        const promotionRequest = {
            title: formData.title,
            img: imageFileName, // Sử dụng chuỗi khóa đã nhập
            inStock: formData.inStock,
        };

        // Gọi API Thêm Khuyến mãi
        try {
            await PromotionService.createPromotion(promotionRequest);
            toast.success('Thêm khuyến mãi thành công!');
            navigate('/admin/list-promotion');
        } catch (error) {
            console.error("Lỗi khi thêm khuyến mãi:", error);
            toast.error("Thêm khuyến mãi thất bại. Vui lòng kiểm tra lại dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-primary shadow rounded-xl'>
            <h2 className='text-2xl font-bold mb-6'>Add New Promotion</h2>
            
            <form onSubmit={handleSubmit}>
                {/* Tiêu đề */}
                <div className="mb-4">
                    <h5>Promotion Title</h5>
                    <input type="text" name="title" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    required 
                    placeholder='Type here...' 
                    className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"/>
                </div>
                
                {/* Input Ảnh (img) */}
                <div className="mb-4">
                    <h5>Image</h5>
                    <input 
                        type="file" 
                        name="img" 
                        value={formData.img} 
                        onChange={handleImageChange} 
                        required 
                        className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"
                    />
                    {/* Xem trước ảnh */}
                    {imagePreview && (
                        <div className="mt-3">
                            <h5>Preview Image:</h5>
                            <img src={imagePreview} alt="Xem trước sản phẩm" className="w-40 h-50 object-cover rounded-md border" />
                        </div>
                    )}
                </div>
                
                {/* Checkbox Trạng thái */}
                <div className='mb-6'>
                    <h5>
                        <input type="checkbox" name="inStock" checked={formData.inStock} onChange={handleInputChange} className="mr-2 leading-tight"/>
                        <span>InStock</span>
                    </h5>
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end gap-3">
                    <button type="button" 
                    onClick={() => navigate('/admin/list-promotion')} 
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
                    
                    <button type="submit" 
                    disabled={loading} 
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditPromotion;