import React, { useEffect, useState, useMemo } from 'react';
import { useUserContext } from '../../context/UserContext';
import OrderService from '../../services/OrderSevice';
import {myAssets} from '../../assets/assets'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  format, subDays, startOfDay, endOfDay, isWithinInterval, 
  eachDayOfInterval, eachMonthOfInterval, startOfYear, parseISO, isValid
} from 'date-fns';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  Title, Tooltip, Legend, Filler
);

function Dashboard() {
  const { formatCurrency } = useUserContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30days');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await OrderService.findAllOrders();
        setOrders(Array.isArray(data.result) ? data.result : []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 1. Logic tính toán các chỉ số (Stats) ---
  const {stats, topProducts} = useMemo(() => {
    let revenue = 0;
    let totalMoney = 0;
    let paidCount = 0;
    let unpaidCount = 0;
    let denied = 0;
    let totalNumberProductSale = 0;
    const productCounts = {};

    orders.forEach(order => {
      const isPaid = order.status === "ACCEPTED" || order.status === "PAID";
      if (isPaid) {
        totalMoney += Number(order.totalMoney) || 0;
        paidCount += 1;
      }
      if(order.status === "DENIED")
      {
        denied +=1;
      }
      else {
        revenue += Number(order.totalMoney) || 0;
        unpaidCount += 1;
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

    return { stats: {totalRevenue: revenue, paidCount, unpaidCount, totalMoney, 
      denied, totalNumberProductSale}, topProducts: sortedProducts
     };
  }, [orders]);

  // --- 2. Logic xử lý dữ liệu biểu đồ theo thời gian ---
  const chartDataConfig = useMemo(() => {
    const now = new Date();
    let startDate, endDate, labels, getLabelKey;

    if (timeFilter === 'today' || timeFilter === 'yesterday') {
      const targetDay = timeFilter === 'today' ? now : subDays(now, 1);
      startDate = startOfDay(targetDay);
      endDate = endOfDay(targetDay);
      // Vì LocalDate không có giờ, ta chỉ có 1 mốc dữ liệu. 
      // Để biểu đồ đẹp, ta hiển thị 7 ngày gần nhất thay vì 24h nếu dữ liệu không có giờ.
      labels = [format(targetDay, 'dd/MM')];
      getLabelKey = (d) => format(d, 'dd/MM');
    } else if (timeFilter === '7days') {
      startDate = startOfDay(subDays(now, 6)); endDate = endOfDay(now);
      labels = eachDayOfInterval({ start: startDate, end: endDate }).map(d => format(d, 'dd/MM'));
      getLabelKey = (d) => format(d, 'dd/MM');
    } else if (timeFilter === 'year') {
      startDate = startOfYear(now); endDate = endOfDay(now);
      labels = eachMonthOfInterval({ start: startDate, end: endDate }).map(m => `Tháng ${format(m, 'M')}`);
      getLabelKey = (d) => `Tháng ${format(d, 'M')}`;
    } else { // 30days
      startDate = startOfDay(subDays(now, 29)); endDate = endOfDay(now);
      labels = eachDayOfInterval({ start: startDate, end: endDate }).map(d => format(d, 'dd/MM'));
      getLabelKey = (d) => format(d, 'dd/MM');
    }

    const dataMap = {};
    labels.forEach(l => { dataMap[l] = { rev: 0, count: 0 }; });

    // Đổ dữ liệu từ orders vào đúng mốc thời gian
    orders.forEach(order => {
      const rawDate = order.orderDate; 
      const oDate = typeof rawDate === 'string' ? parseISO(rawDate) : new Date(rawDate);
      
      if (isValid(oDate) && isWithinInterval(oDate, { start: startDate, end: endDate })) {
        const key = getLabelKey(oDate);
        if (dataMap[key]) {
          // if (order.status === "ACCEPTED" || order.status === "PAID") {
          //   dataMap[key].rev += Number(order.totalMoney || 0);
          // }
          // dataMap[key].count += 1;
          dataMap[key].rev += Number(order.totalMoney || 0);
          dataMap[key].count += 1;
        }
      }
    });

    return {
      labels,
      datasets: [
        {
          label: 'Doanh số',
          data: labels.map(l => dataMap[l].rev),
          borderColor: '#3b82f6', // Xanh dương
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4, // Độ cong cho biểu đồ biến động mượt
          yAxisID: 'yRevenue',
        },
        {
          label: 'Số đơn hàng',
          data: labels.map(l => dataMap[l].count),
          borderColor: '#10b981', // Xanh lá
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.4,
          yAxisID: 'yOrders',
          borderDash: [5, 5], // Nét đứt
        }
      ]
    };
  }, [orders, timeFilter]);

  const options={ 
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      yRevenue: {
        type: 'linear',
        display: true, // Mở lại để bạn thấy biến động tiền
        position: 'left',
        title: { display: true, text: 'Doanh thu (₫)' },
        grid: { color: '#f3f4f6' }
      },
      yOrders: {
        type: 'linear',
        display: true, // Mở lại để bạn thấy biến động số đơn
        position: 'right',
        title: { display: true, text: 'Số lượng đơn' },
        grid: { drawOnChartArea: false }, // Tránh chồng chéo lưới
        ticks: { stepSize: 1 } // Đơn hàng phải là số nguyên
      },
      x: { grid: { display: false } }
    },
    plugins: {
      // legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    }
  };

  return (
    <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-slate-50 shadow rounded-xl'>
      
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-bold'>Tổng quan</h2>
        <div className='flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-white text-xs shadow-sm'>
          <span className='text-gray-500'>Khung Thời Gian:</span>
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className='bg-transparent font-bold outline-none cursor-pointer'
          >
            <option value="today">Hôm nay</option>
            <option value="yesterday">Hôm qua</option>
            <option value="7days">Trong 7 ngày qua</option>
            <option value="30days">Trong 30 ngày qua</option>
            <option value="year">Theo năm</option>
          </select>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>

        <div className='flexStart gap-7 p-5 bg-[#fff4d2] lg:min-w-56 rounded-xl border-b-4 border-blue-500'>
          <img src={myAssets.dollar} alt="" className="hidden sm:flex w-8" />
          <div>
            <h4 className='font-bold text-lg'>{loading ? "..." : formatCurrency(stats.totalRevenue)}</h4>
            <h5 className='text-blue-500 text-sm'>Doanh số</h5>
          </div>
        </div>

        {/* Đơn hàng thành công */}
        <div className='flexStart gap-7 p-5 bg-[#fff4d2] lg:min-w-56 rounded-xl border-b-4 border-green-500'>
          <img src={myAssets.order_comfirm} alt="" className="hidden sm:flex w-8" />
          <div>
            <h4 className='font-bold text-lg'>{loading ? "..." : stats.paidCount}</h4>
            <h5 className='text-green-500 text-sm'>Đơn hàng đã thanh toán</h5>
          </div>
        </div>

        {/* Đơn chưa thanh toán */}
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

        {/* Đơn hàng thành công */}
        <div className='flexStart gap-7 p-5 bg-[#fff4d2] lg:min-w-56 rounded-xl border-b-4 border-green-500'>
          <img src={myAssets.graph} alt="" className="hidden sm:flex w-8" />
          <div>
            <h4 className='font-bold text-lg'>{loading ? "..." : stats.totalNumberProductSale}</h4>
            <h5 className='text-green-500 text-sm'>Tổng số lượng món ăn đã được đặt</h5>
          </div>
        </div>

        {/* Đơn đã hủy/Chưa thanh toán */}
        <div className='flexStart gap-7 p-5 bg-[#fff4d2] lg:min-w-56 rounded-xl border-b-4 border-red-400'>
          <div className='hidden sm:flex w-8 h-8 bg-red-100 rounded-full items-center justify-center font-bold text-red-500'>!</div>
          <div>
            <h4 className='font-bold text-lg text-red-600'>{loading ? "..." : stats.denied}</h4>
            <h5 className='text-solid text-sm'>Đơn hủy</h5>
          </div>
        </div>
      </div>
      
<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Biểu đồ chính */}
        <div className='lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm'>
          <h3 className='font-bold mb-6 text-gray-700 uppercase text-sm tracking-wider'>Biểu đồ phân tích</h3>
          <div className='h-[350px] w-full'>
            <Line 
              data={chartDataConfig} 
              options={options}
            />
          </div>
        </div>

        {/* Top 5 món ăn bán chạy dựa trên numProducts */}
        <div className='bg-white p-6 rounded-xl border shadow-sm'>
          <h3 className='font-bold mb-6 text-gray-700 uppercase text-sm tracking-wider'>Món ăn bán chạy</h3>
          <div className='space-y-5'>
            {topProducts.map((item, index) => (
              <div key={index} className='flex justify-between items-center border-b border-gray-50 pb-3 last:border-0'>
                <div className='flex items-center gap-3'>
                  <span className='text-xs font-bold text-gray-300'>#{index + 1}</span>
                  <p className='text-sm font-medium text-gray-700 line-clamp-1'>{item.name}</p>
                </div>
                <span className='text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold'>
                  {item.qty} món
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;