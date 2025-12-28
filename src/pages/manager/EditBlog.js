import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import BlogService from '../../services/BlogService';
import { myAssets } from '../../assets/assets';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

const EditBlogManager = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // State ảnh
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        content: '',
        image: ''
    });

    // Load dữ liệu
    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const data = await BlogService.getBlogById(id); 
                
                setFormData({
                    title: data.title || '',
                    shortDescription: data.shortDescription || '',
                    content: data.content || '',
                    image: data.image || ''
                });

                if (data.image) {
                    setImagePreview(myAssets[data.image] || data.image);
                }
            } catch (error) {
                toast.error("Không tìm thấy bài viết!");
                navigate('/manager/list-blog');
            }
        };
        if (id) fetchBlog();
    }, [id, navigate]);

    // Xử lý chung cho inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Logic xử lý ảnh
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Logic giữ tên cũ hay lấy tên mới
        let finalImageName = formData.image; 
        if (imageFile) {
            const myArray = imageFile.name.split('.');
            finalImageName = myArray[0];
        }

        const payload = {
            ...formData,
            image: finalImageName
        };

        try {
            await BlogService.updateBlog(id, payload);
            toast.success("Cập nhật thành công!");
            navigate('/manager/list-blog');
        } catch (error) {
            console.error(error);
            toast.error("Cập nhật thất bại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-20">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <Link to="/manager/list-blog" className="p-2 rounded-full bg-white border hover:bg-gray-50 text-gray-500 transition">
                            <FaArrowLeft />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa bài viết</h2>
                            <p className="text-xs text-gray-500">ID: #{id}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* CỘT TRÁI */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tiêu đề bài viết</label>
                                <input 
                                    type="text" name="title" value={formData.title} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 outline-none font-medium text-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nội dung chi tiết</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    rows="15"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-base leading-relaxed"
                                ></textarea>
                            </div>

                        </div>
                    </div>

                    {/* CỘT PHẢI */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Cập nhật</h3>
                            
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mô tả ngắn</label>
                                <textarea 
                                    name="shortDescription" rows="5" value={formData.shortDescription} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 outline-none text-sm"
                                ></textarea>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Hình ảnh đại diện</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleImageChange} 
                                    className="px-3 py-2 ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full"
                                />
                                {imagePreview && (
                                    <div className="mt-3">
                                        <h5 className="text-xs text-gray-400 mb-1">
                                            {imageFile ? "New Preview:" : "Current Image:"}
                                        </h5>
                                        <img src={imagePreview} alt="Xem trước" className="w-full h-48 object-cover rounded-lg border shadow-sm" />
                                    </div>
                                )}
                            </div>

                            <button 
                                type="submit" disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30"
                            >
                                <FaSave /> {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBlogManager;