import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { myAssets } from '../assets/assets';
import BlogService from '../services/BlogService';

const Blog = () => {

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await BlogService.getPublishedBlogs();
        const sortedData = Array.isArray(data) ? [...data].sort((a, b) => b.id - a.id) : [];
        setBlogs(sortedData);
      } catch (error) {
        console.error("Lỗi tải bài viết:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Logic Panigation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(blogs.length / itemsPerPage);
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hàm format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "MỚI";
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) return <div className="text-center py-28">Đang tải tin tức...</div>;

  return (
    <div className='py-28'>
      <div className='max-padd-container'>
        {/* CONTAINER */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 gap-y-12'>
          {currentBlogs.map((blog,index)=>(
              <article className="flex bg-white transition hover:shadow-xl">
            <div className="rotate-180 p-2 [writing-mode:vertical-lr]">
              <time 
                dateTime={blog.publishedAt} 
                className="flex items-center justify-between gap-4 text-xs font-bold text-gray-900 uppercase"
                >
                <span>{blog.category}</span>
                <span className="w-px flex-1 bg-gray-900/10"></span>
                <span>{formatDate(blog.publishedAt)}</span>
              </time>
            </div>

            <div className="hidden sm:block sm:basis-56">
              <img alt="" 
              src={myAssets[blog.image]}
              className="aspect-square h-72 w-full object-cover" />
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div className="border-s border-gray-900/10 p-4 sm:border-l-transparent sm:p-6">
                <Link to={`/blogs/${blog.slug}`}>
                  <h5 className="font-bold text-gray-900 uppercase">
                    {blog.title}
                  </h5>
                </Link>

                <p className="mt-2 line-clamp-3 text-sm/relaxed text-gray-700">
                  {blog.shortDescription}
                </p>
              </div>

              <div className="sm:flex sm:items-end sm:justify-end">
                <Link 
                  to={`/blogs/${blog.slug}`} 
                  className="btn-solid rounded-none w-full sm:w-auto text-center block px-6 py-3">
                  Read Blog
                </Link>
              </div>
            </div>
          </article>
          ))}
        </div>
        {blogs.length === 0 && (
            <div className="text-center col-span-full text-gray-500">Chưa có bài viết nào được xuất bản.</div>
        )}

        {/* PHÂN TRANG */}
        {blogs.length > itemsPerPage && (
          <div className="mt-12 flex justify-center items-center flex-wrap gap-3">
            <div className="flex gap-2">
              {/* Nút Trước */}
              <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 border rounded-lg transition-all text-sm font-semibold 
                        ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600"}`}
              >
                  Trước
              </button>

              {/* Danh sách số trang */}
              {[...Array(totalPages)].map((_, i) => (
                  <button
                      key={i}
                      onClick={() => paginate(i + 1)}
                      className={`w-9 h-9 rounded-lg border text-sm font-bold transition shadow-sm ${
                          currentPage === i + 1
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                      }`}
                  >
                      {i + 1}
                  </button>
              ))}

              {/* Nút Sau */}
              <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 border rounded-lg transition-all text-sm font-semibold 
                  ${currentPage === totalPages 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-red-500 text-white hover:bg-red-600"}`}
              >
                  Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Blog
