import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BlogService from '../../services/BlogService';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

const AddBlogManager = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // State cho ảnh
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        content: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // --- LOGIC XỬ LÝ ẢNH CỦA BẠN ---
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

        // 1. Validate Text
        if (!formData.title || !formData.content) {
            toast.warning("Tiêu đề và nội dung không được để trống!");
            setLoading(false);
            return;
        }

        // 2. Validate & Xử lý Ảnh (Theo logic bạn cung cấp)
        let imageFileName = '';
        if (imageFile) {
            const myArray = imageFile.name.split('.');
            imageFileName = myArray[0]; // Lấy tên file bỏ đuôi
        } else {
            setLoading(false);
            toast.error('Vui lòng chọn ảnh.'); // Bắt buộc chọn ảnh khi thêm mới
            return;
        }

        // 3. Chuẩn bị dữ liệu gửi đi
        const payload = {
            ...formData,
            image: imageFileName // Gán tên file vào trường image
        };

        try {
            await BlogService.createBlog(payload);
            toast.success("Tạo bài viết thành công!");
            navigate('/manager/list-blog');
        } catch (error) {
            console.error("Lỗi:", error);
            toast.error("Có lỗi xảy ra khi tạo bài viết.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 pb-20">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <Link to="/manager/list-blog" className="p-2 rounded-full bg-white border hover:bg-gray-50 text-gray-500 transition">
                            <FaArrowLeft />
                        </Link>
                        <h2 className="text-2xl font-bold text-gray-800">Viết bài mới</h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* CỘT TRÁI: EDITOR */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tiêu đề bài viết</label>
                                <input 
                                    type="text" name="title" value={formData.title} onChange={handleChange}
                                    placeholder="Nhập tiêu đề hấp dẫn..."
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none font-medium text-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nội dung chi tiết</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    rows="15"
                                    placeholder="Nhập nội dung bài viết tại đây..."
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-base leading-relaxed"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: ẢNH & INFO */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Đăng bài</h3>
                            
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mô tả ngắn</label>
                                <textarea 
                                    name="shortDescription" rows="4" value={formData.shortDescription} onChange={handleChange}
                                    placeholder="Đoạn giới thiệu ngắn gọn..."
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none text-sm"
                                ></textarea>
                            </div>

                            {/* --- INPUT FILE ẢNH --- */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Hình ảnh đại diện</label>
                                <input 
                                    type="file" 
                                    name="imageUpload" 
                                    accept="image/*"
                                    onChange={handleImageChange} 
                                    // required // Có thể bỏ required HTML nếu muốn validate bằng JS như trên
                                    className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"
                                />
                                {/* Xem trước ảnh */}
                                {imagePreview ? (
                                    <div className="mt-3">
                                        <h5 className="text-xs text-gray-400 mb-1">Preview Image:</h5>
                                        <img src={imagePreview} alt="Xem trước" className="w-full h-48 object-cover rounded-lg border shadow-sm" />
                                    </div>
                                ) : (
                                    <div className="mt-3 h-48 bg-slate-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                                        Chưa chọn ảnh
                                    </div>
                                )}
                            </div>

                            <button 
                                type="submit" disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                            >
                                <FaSave /> {loading ? "Đang lưu..." : "Lưu bài viết"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBlogManager;