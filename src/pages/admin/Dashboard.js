import React, { useEffect, useState, useMemo } from 'react';
import { useUserContext } from '../../context/UserContext';
import { myAssets } from '../../assets/assets';

// --- IMPORT CÁC SERVICE ---
import OrderService from '../../services/OrderSevice';
import UserService from '../../services/UserService';
import ProductService from '../../services/ProductService';
import CategoryService from '../../services/CategoryService';
import PromotionService from '../../services/PromotionService';
import CouponService from '../../services/CouponService';
import ReviewService from '../../services/ReviewService';
import BlogService from '../../services/BlogService';

// --- IMPORT RECHARTS ---
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import {
  format, subDays, startOfDay, endOfDay, isWithinInterval,
  eachDayOfInterval, eachMonthOfInterval, startOfYear, endOfYear, parseISO, isValid
} from 'date-fns';

function Dashboard() {
  const { formatCurrency } = useUserContext();

  // State dữ liệu Order
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // State bộ lọc thời gian
  const [timeFilter, setTimeFilter] = useState('30days');
  const [customStartDate, setCustomStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const yearsList = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // --- STATE THỐNG KÊ TỔNG HỢP ---
  const [summaryCounts, setSummaryCounts] = useState({
    users: 0,
    products: 0,
    categories: 0,
    promotions: 0,
    coupons: 0,
    reviews: 0,
    blogs: 0
  });

  // --- USE EFFECT FETCH DATA (Giữ nguyên logic) ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const [
          ordersRes,
          usersRes,
          productsRes,
          categoriesRes,
          promotionsRes,
          couponsRes,
          reviewsRes,
          blogsRes
        ] = await Promise.all([
          OrderService.findAllOrders(),
          UserService.getAllUsers(),
          ProductService.getProducts('', 0, 0, 10000),
          CategoryService.getAllCategories(),
          PromotionService.getAllPromotions(0, 10000),
          CouponService.findAllCoupons(),
          ReviewService.getAllReviews(),
          BlogService.getAllBlogs()
        ]);

        // Xử lý dữ liệu Orders
        setOrders(Array.isArray(ordersRes.result) ? ordersRes.result : []);

        // Xử lý dữ liệu thống kê tổng hợp
        const userCount = Array.isArray(usersRes) ? usersRes.filter(u => u.role && u.role.name === 'USER').length : 0;
        const productCount = productsRes.result ? productsRes.result.products?.length : 0;
        const categoryCount = Array.isArray(categoriesRes) ? categoriesRes.length : 0;
        const promotionCount = promotionsRes.result ? promotionsRes.result.length : 0;
        const couponCount = (couponsRes.result ? couponsRes.result.length : (Array.isArray(couponsRes) ? couponsRes.length : 0));
        const reviewCount = Array.isArray(reviewsRes) ? reviewsRes.length : 0;
        const blogCount = Array.isArray(blogsRes) ? blogsRes.length : 0;

        setSummaryCounts({
          users: userCount,
          products: productCount,
          categories: categoryCount,
          promotions: promotionCount,
          coupons: couponCount,
          reviews: reviewCount,
          blogs: blogCount
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // --- LOGIC TÍNH TOÁN ORDER (Giữ nguyên) ---
  const { stats, topProducts } = useMemo(() => {
    let revenue = 0;
    let totalMoney = 0;
    let paidCount = 0;
    let unpaidCount = 0;
    let denied = 0;
    let totalNumberProductSale = 0;
    const productCounts = {};

    orders.forEach(order => {
      const isPaid = order.status === "COMPLETED" || order.status === "PAID";
      if (isPaid) {
        totalMoney += Number(order.totalMoney) || 0;
        paidCount += 1;
      }
      if (order.status === "DENIED") {
        denied += 1;
      } else {
        revenue += Number(order.totalMoney) || 0;
        if (!isPaid) unpaidCount += 1;
      }

      if (order.orderDetails && Array.isArray(order.orderDetails)) {
        order.orderDetails.forEach(detail => {
          totalNumberProductSale += detail.numProducts;
          const pId = detail.product?.id;
          const pName = detail.product?.name || "Món ăn " + pId;
          const qty = Number(detail.numProducts) || 0;
          if (!productCounts[pId]) {
            productCounts[pId] = { name: pName, qty: 0 };
          }
          productCounts[pId].qty += qty;
        });
      }
    });

    const sortedProducts = Object.values(productCounts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      stats: { totalRevenue: revenue, paidCount, unpaidCount, totalMoney, denied, totalNumberProductSale },
      topProducts: sortedProducts
    };
  }, [orders]);

  // --- LOGIC BIỂU ĐỒ (CHUYỂN ĐỔI CHO RECHARTS) ---
  const chartData = useMemo(() => {
    const now = new Date();
    let startDate, endDate, labels, getLabelKey;

    // 1. Xác định khoảng thời gian và danh sách nhãn
    if (timeFilter === 'custom') {
      startDate = startOfDay(parseISO(customStartDate));
      endDate = endOfDay(parseISO(customEndDate));
      const diffDays = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24));
      if (diffDays > 60) {
        labels = eachMonthOfInterval({ start: startDate, end: endDate }).map(m => `Tháng ${format(m, 'MM/yy')}`);
        getLabelKey = (d) => `Tháng ${format(d, 'MM/yy')}`;
      } else {
        try { labels = eachDayOfInterval({ start: startDate, end: endDate }).map(d => format(d, 'dd/MM')); }
        catch (e) { labels = [format(startDate, 'dd/MM')]; }
        getLabelKey = (d) => format(d, 'dd/MM');
      }
    } else if (timeFilter === 'year') {
      const yearDate = new Date(selectedYear, 0, 1);
      startDate = startOfYear(yearDate);
      endDate = endOfYear(yearDate);
      labels = eachMonthOfInterval({ start: startDate, end: endDate }).map(m => `Tháng ${format(m, 'M')}`);
      getLabelKey = (d) => `Tháng ${format(d, 'M')}`;
    } else if (timeFilter === 'today' || timeFilter === 'yesterday') {
      const targetDay = timeFilter === 'today' ? now : subDays(now, 1);
      startDate = startOfDay(targetDay);
      endDate = endOfDay(targetDay);
      labels = [format(targetDay, 'dd/MM')];
      getLabelKey = (d) => format(d, 'dd/MM');
    } else if (timeFilter === '7days') {
      startDate = startOfDay(subDays(now, 6)); endDate = endOfDay(now);
      labels = eachDayOfInterval({ start: startDate, end: endDate }).map(d => format(d, 'dd/MM'));
      getLabelKey = (d) => format(d, 'dd/MM');
    } else {
      startDate = startOfDay(subDays(now, 29)); endDate = endOfDay(now);
      labels = eachDayOfInterval({ start: startDate, end: endDate }).map(d => format(d, 'dd/MM'));
      getLabelKey = (d) => format(d, 'dd/MM');
    }

    // 2. Khởi tạo map data
    const dataMap = {};
    labels.forEach(l => { dataMap[l] = { name: l, revenue: 0, orders: 0 }; });

    // 3. Fill dữ liệu từ orders
    orders.forEach(order => {
      const rawDate = order.orderDate;
      const oDate = typeof rawDate === 'string' ? parseISO(rawDate) : new Date(rawDate);
      if (isValid(oDate) && isWithinInterval(oDate, { start: startDate, end: endDate })) {
        const key = getLabelKey(oDate);
        if (dataMap[key]) {
          dataMap[key].revenue += Number(order.totalMoney || 0);
          dataMap[key].orders += 1;
        }
      }
    });

    // 4. Chuyển đổi thành mảng cho Recharts
    return Object.values(dataMap);
  }, [orders, timeFilter, customStartDate, customEndDate, selectedYear]);

  // --- DỮ LIỆU PIE CHART ---
  const pieData = useMemo(() => [
    { name: 'Đã thanh toán', value: stats.paidCount, color: '#22c55e' },
    { name: 'Chờ xử lý', value: stats.unpaidCount, color: '#eab308' },
    { name: 'Đã hủy', value: stats.denied, color: '#ef4444' }
  ], [stats]);

  // Formatter cho Tooltip Recharts
  const formatTooltipCurrency = (value, name) => {
    if (name === 'revenue' || name === 'Doanh số') return [formatCurrency(value), 'Doanh số'];
    if (name === 'orders' || name === 'Số đơn hàng') return [value, 'Số đơn hàng'];
    return [value, name];
  };

  return (
    <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-slate-50 shadow rounded-xl no-scrollbar'>

      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4'>
        <h2 className='text-xl font-bold text-gray-800'>Tổng quan</h2>

        {/* Bộ lọc thời gian */}
        <div className='flex flex-wrap items-center gap-2'>
          {timeFilter === 'year' && (
            <div className='flex items-center gap-2 border rounded-lg px-2 py-1.5 bg-white text-xs shadow-sm'>
              <span className='text-gray-500'>Năm:</span>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className='bg-transparent font-bold outline-none cursor-pointer text-blue-600'>
                {yearsList.map(year => (<option key={year} value={year}>{year}</option>))}
              </select>
            </div>
          )}
          {timeFilter === 'custom' && (
            <div className='flex gap-2 items-center bg-white border px-2 py-1.5 rounded-lg text-xs shadow-sm'>
              <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className='outline-none text-gray-600' />
              <span>-</span>
              <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className='outline-none text-gray-600' />
            </div>
          )}
          <div className='flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-white text-xs shadow-sm'>
            <span className='text-gray-500'>Lọc theo:</span>
            <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className='bg-transparent font-bold outline-none cursor-pointer text-gray-700'>
              <option value="today">Hôm nay</option>
              <option value="yesterday">Hôm qua</option>
              <option value="7days">Trong 7 ngày qua</option>
              <option value="30days">Trong 30 ngày qua</option>
              <option value="year">Theo năm</option>
              <option value="custom">Tùy chỉnh ngày</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- HÀNG THỐNG KÊ TỔNG HỢP --- */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        {/* Card User */}
        <div className='flexStart gap-5 p-5 bg-[#fff4d2] rounded-xl border-b-4 border-indigo-500'>
          <img src={myAssets.user} alt="" className="hidden sm:flex w-8" />
          <div className='flex flex-col'>
            <h4 className='font-bold text-2xl'>{summaryCounts.users}</h4>
            <h5 className='text-indigo-600 text-sm font-semibold'>Thành viên (User)</h5>
          </div>
        </div>

        {/* Card Product */}
        <div className='flexStart gap-5 p-5 bg-[#fff4d2] rounded-xl border-b-4 border-orange-500'>
          <img src={myAssets.shopeefood} alt="" className="hidden sm:flex w-8" />
          <div className='flex flex-col'>
            <h4 className='font-bold text-2xl'>{summaryCounts.products}</h4>
            <h5 className='text-orange-600 text-sm font-semibold'>Tổng số món ăn</h5>
          </div>
        </div>

        {/* Card Category */}
        <div className='flexStart gap-5 p-5 bg-[#fff4d2] rounded-xl border-b-4 border-teal-500'>
          <img src={myAssets.category} alt="" className="hidden sm:flex w-8" />
          <div className='flex flex-col'>
            <h4 className='font-bold text-2xl'>{summaryCounts.categories}</h4>
            <h5 className='text-teal-600 text-sm font-semibold'>Danh mục</h5>
          </div>
        </div>

        {/* Card Promotion */}
        <div className='flexStart gap-5 p-5 bg-[#fff4d2] rounded-xl border-b-4 border-pink-500'>
          <img src={myAssets.promotionAva} alt="" className="hidden sm:flex w-8" />
          <div className='flex flex-col'>
            <h4 className='font-bold text-2xl'>{summaryCounts.promotions}</h4>
            <h5 className='text-pink-600 text-sm font-semibold'>Chương trình KM</h5>
          </div>
        </div>

        {/* Card Coupon */}
        <div className='flexStart gap-5 p-5 bg-[#fff4d2] rounded-xl border-b-4 border-purple-500'>
          <img src={myAssets.coupon} alt="" className="hidden sm:flex w-8" />
          <div className='flex flex-col'>
            <h4 className='font-bold text-2xl'>{summaryCounts.coupons}</h4>
            <h5 className='text-purple-600 text-sm font-semibold'>Mã giảm giá</h5>
          </div>
        </div>

        {/* Card Review */}
        <div className='flexStart gap-5 p-5 bg-[#fff4d2] rounded-xl border-b-4 border-yellow-500'>
          <img src={myAssets.review} alt="" className="hidden sm:flex w-10" />
          <div className='flex flex-col'>
            <h4 className='font-bold text-2xl'>{summaryCounts.reviews}</h4>
            <h5 className='text-yellow-600 text-sm font-semibold'>Đánh giá (Review)</h5>
          </div>
        </div>

        {/* Card Blog */}
        <div className='flexStart gap-5 p-5 bg-[#fff4d2] rounded-xl border-b-4 border-blue-400'>
          <img src={myAssets.blog} alt="" className="hidden sm:flex w-10" />
          <div className='flex flex-col'>
            <h4 className='font-bold text-2xl'>{summaryCounts.blogs}</h4>
            <h5 className='text-blue-600 text-sm font-semibold'>Bài viết (Blog)</h5>
          </div>
        </div>
      </div>

      <div className='border-t border-gray-200 my-8'></div>

      <h3 className='font-bold text-lg text-gray-700 mb-4'>Thống kê đơn hàng & Doanh thu</h3>

      {/* --- CÁC THẺ THỐNG KÊ DOANH THU --- */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        <div className='flexStart gap-7 p-5 bg-[#fff4d2] lg:min-w-56 rounded-xl border-b-4 border-blue-500'>
          <img src={myAssets.graph} alt="" className="hidden sm:flex w-8" />
          <div>
            <h4 className='font-bold text-lg'>{loading ? "..." : formatCurrency(stats.totalRevenue)}</h4>
            <h5 className='text-blue-500 text-sm'>Doanh số</h5>
          </div>
        </div>
        <div className='flexStart gap-7 p-5 bg-[#fff4d2] lg:min-w-56 rounded-xl border-b-4 border-green-500'>
          <img src={myAssets.order_comfirm} alt="" className="hidden sm:flex w-8" />
          <div>
            <h4 className='font-bold text-lg'>{loading ? "..." : stats.paidCount}</h4>
            <h5 className='text-green-500 text-sm'>Đơn hàng đã thanh toán</h5>
          </div>
        </div>
        <div className='flexStart gap-7 p-5 bg-[#fff4d2] lg:min-w-56 rounded-xl border-b-4 border-yellow-500'>
          <img src={myAssets.wait} alt="" className="hidden sm:flex w-8" />
          <div>
            <h4 className='font-bold text-lg'>{loading ? "..." : stats.unpaidCount}</h4>
            <h5 className='text-yellow-600 text-sm'>Đơn hàng chờ xử lý</h5>
          </div>
        </div>
        <div className='flexStart gap-7 p-5 bg-[#fff4d2] lg:min-w-56 rounded-xl border-b-4 border-blue-500'>
          <img src={myAssets.dollar} alt="" className="hidden sm:flex w-8" />
          <div>
            <h4 className='font-bold text-lg'>{loading ? "..." : formatCurrency(stats.totalMoney)}</h4>
            <h5 className='text-blue-500 text-sm'>Tổng số tiền đã thanh toán</h5>
          </div>
        </div>
        <div className='flexStart gap-7 p-5 bg-[#fff4d2] lg:min-w-56 rounded-xl border-b-4 border-green-500'>
          <img src={myAssets.product} alt="" className="hidden sm:flex w-8" />
          <div>
            <h4 className='font-bold text-lg'>{loading ? "..." : stats.totalNumberProductSale}</h4>
            <h5 className='text-green-500 text-sm'>Tổng số lượng món ăn đã đặt</h5>
          </div>
        </div>
        <div className='flexStart gap-7 p-5 bg-[#fff4d2] lg:min-w-56 rounded-xl border-b-4 border-red-400'>
          <div className='hidden sm:flex w-8 h-8 bg-red-100 rounded-full items-center justify-center font-bold text-red-500'>!</div>
          <div>
            <h4 className='font-bold text-lg text-red-600'>{loading ? "..." : stats.denied}</h4>
            <h5 className='text-solid text-sm'>Đơn hủy</h5>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Biểu đồ đường (ComposedChart cho phép kết hợp Line và Area) */}
        <div className='lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm flex flex-col'>
          <h3 className='font-bold mb-6 text-gray-700 uppercase text-sm tracking-wider'>
            Biểu đồ biến động {timeFilter === 'year' ? `năm ${selectedYear}` : ''}
          </h3>
          <div className='flex-1 min-h-[300px]'>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                
                {/* Trục trái: Doanh thu */}
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Doanh thu (₫)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9ca3af' } }}
                />

                {/* Trục phải: Số đơn */}
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Số lượng đơn', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#9ca3af' } }}
                />

                <Tooltip 
                  formatter={formatTooltipCurrency} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType='circle' />

                {/* Area cho Doanh thu (giống fill: true trong chartjs) */}
                <Area 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Doanh số" 
                  stroke="#3b82f6" 
                  fill="rgba(59, 130, 246, 0.1)" 
                  strokeWidth={2}
                />
                
                {/* Line nét đứt cho Số đơn hàng */}
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="orders" 
                  name="Số đơn hàng" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  dot={{ r: 3, fill: '#10b981' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ tròn + Top món ăn */}
        <div className='flex flex-col gap-6'>
          <div className='bg-white p-6 rounded-xl border shadow-sm'>
            <h3 className='font-bold mb-4 text-gray-700 uppercase text-sm tracking-wider'>Tỷ lệ đơn hàng</h3>
            <div className='h-[250px] flex justify-center w-full'>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType='circle'/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className='bg-white p-6 rounded-xl border shadow-sm flex-1'>
            <h3 className='font-bold mb-6 text-gray-700 uppercase text-sm tracking-wider'>Top món bán chạy</h3>
            <div className='space-y-5'>
              {topProducts.map((item, index) => (
                <div key={index} className='flex justify-between items-center border-b border-gray-50 pb-3 last:border-0'>
                  <div className='flex items-center gap-3'>
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${index === 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500'}`}>
                      #{index + 1}
                    </span>
                    <p className='text-sm font-medium text-gray-700 line-clamp-1' title={item.name}>{item.name}</p>
                  </div>
                  <span className='text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold whitespace-nowrap'>
                    {item.qty} món
                  </span>
                </div>
              ))}
              {topProducts.length === 0 && <p className='text-sm text-gray-400 text-center'>Chưa có dữ liệu</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;