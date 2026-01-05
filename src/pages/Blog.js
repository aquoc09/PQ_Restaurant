import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { myAssets } from '../assets/assets';
import BlogService from '../services/BlogService';

const Blog = () => {

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await BlogService.getPublishedBlogs();
        setBlogs(data);
      } catch (error) {
        console.error("Lỗi tải bài viết:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

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
          {blogs.map((blog,index)=>(
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
      </div>
    </div>
  )
}

export default Blog
