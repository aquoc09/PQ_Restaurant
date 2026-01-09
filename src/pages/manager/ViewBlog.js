import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BlogService from '../../services/BlogService'; 
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaEye, FaCheckCircle, FaTimesCircle, FaPlus } from 'react-icons/fa';

const ViewBlogManager = () => {
    // --- State ---
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    // --- Fetch Data ---
    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {

            const data = await BlogService.getAllBlogs();

            const sortedData = Array.isArray(data) ? [...data].sort((a, b) => b.id - a.id) : [];
            setBlogs(sortedData);
        } catch (error) {
            console.error("Lỗi tải danh sách blog:", error);
            toast.error("Không thể tải danh sách bài viết.");
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.")) {
            try {
                await BlogService.deleteBlog(id);
                toast.success("Xóa bài viết thành công!");
                setBlogs(prev => prev.filter(blog => blog.id !== id));
            } catch (error) {
                console.error("Lỗi xóa blog:", error);
                toast.error("Xóa thất bại.");
            }
        }
    };

    const handlePublishToggle = async (id, currentStatus) => {

        try {
            await BlogService.publishBlog(id);
            toast.success("Đã xuất bản bài viết!");
            fetchBlogs();
        } catch (error) {
            console.error("Lỗi xuất bản:", error);
            toast.error("Không thể thay đổi trạng thái.");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return <span className="text-gray-400 italic">Chưa xuất bản</span>;
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PUBLISHED':
                return <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">Đã duyệt</span>;
            case 'DRAFT':
                return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">Bản nháp</span>;
            case 'HIDDEN':
                return <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">Đã ẩn</span>;
            default:
                return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">{status}</span>;
        }
    };

    // --- Pagination Logic ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBlogs = blogs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(blogs.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

    return (
        <div className="md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-slate-50 shadow rounded-xl no-scrollbar">
            <div className="max-w-7xl mx-auto">
                
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Quản Lý Blog</h2>
                    </div>

                    {/* NÚT THÊM MỚI:*/}
                    <Link 
                        to="/manager/add-blog" 
                        className="flex items-center gap-2 bg-primary text-black px-6 py-3 rounded-xl transition-all shadow-lg font-semibold transform hover:-translate-y-0.5"
                    >
                        <FaPlus className="text-sm"/> <span>Viết bài mới</span>
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-white uppercase bg-solid border-b border-blue-100">
                                <tr>
                                    <th className="px-6 py-5 font-bold text-[14px] md:text-[16px] w-16 text-center">ID</th>
                                    <th className="px-6 py-5 font-bold text-[14px] md:text-[16px]">Nội dung chính</th>
                                    <th className="px-6 py-5 font-bold text-[14px] md:text-[16px] text-center">Trạng thái</th>
                                    <th className="px-6 py-5 font-bold text-[14px] md:text-[16px] text-center">Lượt xem</th>
                                    <th className="px-6 py-5 font-bold text-[14px] md:text-[16px]">Tác giả</th>
                                    <th className="px-6 py-5 font-bold text-[14px] md:text-[16px] text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentBlogs.length > 0 ? (
                                    currentBlogs.map((blog) => (
                                        <tr key={blog.id} className="hover:bg-blue-50/30 transition duration-200 group">
                                            <td className="px-6 py-4 text-center font-medium text-gray-400 group-hover:text-blue-600">
                                                #{blog.id}
                                            </td>
                                            <td className="px-6 py-4 max-w-md">
                                                <div className="font-bold text-gray-800 text-base mb-1 line-clamp-1 group-hover:text-blue-700 transition-colors">
                                                    {blog.title}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono border">
                                                        /{blog.slug}
                                                    </span>
                                                    <span className="text-xs text-gray-400">• {formatDate(blog.publishedAt)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {getStatusBadge(blog.status)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-gray-600 font-medium border border-gray-100">
                                                    <FaEye className="text-blue-500" />
                                                    {blog.viewCount?.toLocaleString() || 0}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-blue-600 flex items-center justify-center font-bold text-sm">
                                                        {blog.authorName}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    {/* Nút Toggle Status */}
                                                    <button 
                                                        onClick={() => handlePublishToggle(blog.id, blog.status)}
                                                        title={blog.status === 'PUBLISHED' ? "Ẩn bài" : "Xuất bản"}
                                                        className={`p-2 rounded-lg transition shadow-sm ${
                                                            blog.status === 'PUBLISHED' 
                                                            ? 'bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200' 
                                                            : 'bg-green-50 text-green-600 border border-green-100 hover:bg-green-100'
                                                        }`}
                                                    >
                                                        {blog.status === 'PUBLISHED' ? <FaTimesCircle /> : <FaCheckCircle />}
                                                    </button>

                                                    {/* Nút Edit */}
                                                    <Link 
                                                        to={`/manager/edit-blog/${blog.id}`} 
                                                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 border border-indigo-100 transition shadow-sm"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <FaEdit />
                                                    </Link>

                                                    {/* Nút Xóa */}
                                                    <button 
                                                        onClick={() => handleDelete(blog.id)}
                                                        className="p-2 bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-lg transition shadow-sm"
                                                        title="Xóa"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center text-gray-400 bg-gray-50/50">
                                            <div className="flex flex-col items-center">
                                                <span className="text-4xl mb-2">📝</span>
                                                <p>Chưa có bài viết nào.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* PAGINATION */}
                    {blogs.length > itemsPerPage && (
                         <div className="bg-white border-t border-gray-100 p-4 flex justify-end">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition shadow-sm"
                                >
                                    Trước
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => paginate(i + 1)}
                                        className={`w-9 h-9 rounded-lg border text-sm font-bold transition shadow-sm ${
                                            currentPage === i + 1
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition shadow-sm"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewBlogManager;