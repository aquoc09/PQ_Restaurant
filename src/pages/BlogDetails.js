import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import BlogService from '../services/BlogService';
import { myAssets } from '../assets/assets';

const BlogDetails = () => {
    const { slug } = useParams(); // Lấy slug từ URL
    const [blog, setBlog] = useState(null);
    const [relatedBlogs, setRelatedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    //  Fetch dữ liệu bài viết chính
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Lấy bài viết hiện tại
                const blogData = await BlogService.getBlogBySlug(slug);
                setBlog(blogData);


                const allBlogs = await BlogService.getPublishedBlogs();
                const otherBlogs = allBlogs
                    .filter(b => b.slug !== slug) // Loại bỏ bài đang đọc
                    .slice(0, 3); // Lấy 3 bài
                setRelatedBlogs(otherBlogs);

            } catch (error) {
                console.error("Lỗi tải bài viết:", error);
            } finally {
                setLoading(false);
                // Cuộn lên đầu trang khi chuyển bài
                window.scrollTo(0, 0);
            }
        };

        if (slug) fetchData();
    }, [slug]);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('vi-VN', { 
            year: 'numeric', month: 'long', day: 'numeric' 
        });
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center pt-28">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
    );

    if (!blog) return (
        <div className="min-h-screen flex flex-col items-center justify-center pt-28">
            <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy bài viết</h2>
            <Link to="/blogs" className="mt-4 text-blue-600 hover:underline">Quay lại danh sách</Link>
        </div>
    );

    return (
        <div className='pt-32 pb-16 bg-white'>
            {/* --- CONTAINER CHÍNH --- */}
            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
                
                {/* BREADCRUMB */}
                <nav className="flex text-sm text-gray-500 mb-6">
                    <Link to="/" className="hover:text-gray-900 transition-colors">Trang chủ</Link>
                    <span className="mx-2">/</span>
                    <Link to="/blogs" className="hover:text-gray-900 transition-colors">Blog</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium truncate max-w-[200px]">{blog.title}</span>
                </nav>

                {/*  HEADER BÀI VIẾT */}
                <div className="text-center mb-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wider mb-4 uppercase">
                        Tin tức
                    </span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                        {blog.title}
                    </h1>
                    
                    <div className="flex items-center justify-center gap-6 text-gray-500 text-sm">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0h18M9.75 9.15l1.5 1.5 3-3" />
                            </svg>
                            {formatDate(blog.publishedAt)}
                        </div>
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {blog.viewCount || 0} lượt xem
                        </div>
                    </div>
                </div>

                {/* FEATURED IMAGE */}
                <div className="rounded-2xl overflow-hidden shadow-lg mb-12">
                    <img 
                        src={myAssets[blog.image]} 
                        alt={blog.title} 
                        className="w-full h-auto max-h-[500px] object-cover"
                    />
                </div>

                <div 
                    className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                    style={{
                        textAlign: 'justify',
                    }}
                />

                {/* TAGS & SHARE (Placeholder) */}
                <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex gap-2">
                        <span className="text-gray-500 font-medium">Tags:</span>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:bg-gray-200">#Foods</span>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:bg-gray-200">#Trends2025</span>
                    </div>
                    <div className="flex gap-3">
                        <button className="text-gray-400 hover:text-blue-600 transition">
                             {/* Facebook Icon */}
                             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </button>
                        {/* Copy Link Icon */}
                         <button className="text-gray-400 hover:text-gray-800 transition" onClick={() => {
                             navigator.clipboard.writeText(window.location.href);
                             alert("Đã copy link bài viết!");
                         }}>
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* BÀI VIẾT LIÊN QUAN */}
            {relatedBlogs.length > 0 && (
                <div className="bg-slate-50 mt-20 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8">Bài viết liên quan</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedBlogs.map(item => (
                                <Link to={`/blogs/${item.slug}`} key={item.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                                    <div className="aspect-video overflow-hidden">
                                        <img 
                                            src={myAssets[item.image]} 
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        />
                                    </div>
                                    <div className="p-5">
                                        <h4 className="font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition">
                                            {item.title}
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-2">{formatDate(item.publishedAt)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogDetails;