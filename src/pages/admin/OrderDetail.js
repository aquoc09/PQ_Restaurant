import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import OrderService from '../../services/OrderSevice';
import { myAssets } from '../../assets/assets';

const Icons = {
    User: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Phone: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    Email: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Location: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    CreditCard: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Truck: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>,
    Note: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
};

const getStatusStyle = (status) => {
  switch (status) {
case 'PAID':
            return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20';
        case 'COMPLETED':
            return 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20';
        case 'PENDING':
            return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20';
        case 'NOT_PAY':
            return 'bg-orange-50 text-orange-800 ring-1 ring-orange-600/20';
        case 'DENIED':
            return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20';
        default:
            return 'bg-slate-50 text-slate-700 ring-1 ring-slate-600/20';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

function OrderDetail() {

  const { orderId } = useParams(); 
  const { formatCurrency, navigate } = useUserContext();
  const [order, setOrder] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchOrderData = async () => {
    try {
      const data = await OrderService.getOrder(orderId);
      
      let finalNote = "";
      try {
        if (data.note && data.note.trim().startsWith('{')) {
          const noteObj = JSON.parse(data.note);
          finalNote = noteObj.note || data.note;
        } 
        else {
          finalNote = data.note || "Không có ghi chú";
        }
      } catch (e) {
        finalNote = data.note;
      }

      setOrder({ ...data, parsedNote: finalNote });
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
        toast.error("Không thể tải thông tin đơn hàng");
      } finally {
          setLoading(false);
      }
  };
  if (orderId) {
    fetchOrderData();
  }
}, [orderId]);

    if (loading) return (
        <div className="flex justify-center items-center h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!order) return <div className="p-8 text-center text-gray-500">Không tìm thấy đơn hàng.</div>;

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
              <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      Order #{order.id}
                  </h1>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${getStatusStyle(order.status)}`}>
                      {order.status}
                  </span>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {formatDate(order.orderDate)}
                  </span>
              </div>
          </div>

          <div className="flex gap-3 w-full lg:w-auto">
              <button 
                  onClick={() => navigate('/admin/list-order')} 
                  className="flex-1 lg:flex-none px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl shadow-sm transition-all font-semibold text-sm"
              >
                  Quay lại
              </button>
              <button 
                  onClick={() => navigate(`/admin/edit-order/${order.id}`)} 
                  // Nút chính sử dụng màu indigo nổi bật và shadow đẹp
                  className="flex-1 lg:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-200 transition-all text-sm font-semibold flex items-center justify-center gap-2"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Cập nhật đơn hàng
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- CỘT TRÁI (Chiếm 8/12 phần): DANH SÁCH SẢN PHẨM --- */}
          <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                      <h2 className="font-bold text-slate-800 text-lg">Sản phẩm đã đặt</h2>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                              <tr>
                                  <th className="px-6 py-4 rounded-tl-lg">Sản phẩm</th>
                                  <th className="px-6 py-4 text-center">Size</th>
                                  <th className="px-6 py-4 text-right">Đơn giá</th>
                                  <th className="px-6 py-4 text-center">SL</th>
                                  <th className="px-6 py-4 text-right rounded-tr-lg">Thành tiền</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {order.orderDetails?.map((item) => (
                                  <tr key={item.id} className="hover:bg-indigo-50/30 transition duration-150">
                                      <td className="px-6 py-4">
                                          <div className="flex items-center gap-4">
                                              <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-400 font-bold shrink-0 ring-1 ring-slate-300 overflow-hidden">
                                                  {item.product?.productImage ? (
                                                      <img src={myAssets[item.product.productImage]} alt={item.product.name} className="w-full h-full object-cover" />
                                                  ) : (
                                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                  )}
                                              </div>
                                              <div>
                                                  <p className="font-semibold text-slate-800 text-[15px]">{item.product?.name}</p>
                                                  <p className="text-xs text-slate-500 font-medium mt-0.5">{item.product?.productCode}</p>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                          <span className="bg-white text-slate-700 px-3 py-1 rounded-md text-xs font-bold border border-slate-200 shadow-sm">
                                              {item.size}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 text-right font-medium text-slate-600">
                                          {formatCurrency(item.price)}
                                      </td>
                                      <td className="px-6 py-4 text-center font-semibold text-slate-800">
                                          {item.numProducts}
                                      </td>
                                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                                          {formatCurrency(item.totalMoney)}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
                  
                  {/* Phần tổng tiền làm nổi bật */}
                  <div className="px-8 py-6 bg-indigo-50/50 border-t border-indigo-100/50 flex justify-end items-center gap-4">
                      <span className="text-slate-600 font-semibold text-lg">Tổng thanh toán:</span>
                      <span className="text-3xl font-black text-indigo-700 tracking-tight">{formatCurrency(order.totalMoney)}</span>
                  </div>
              </div>
          </div>

          {/* --- CỘT PHẢI (Chiếm 4/12 phần): THÔNG TIN KHÁC --- */}
          <div className="lg:col-span-4 space-y-6">
              
              {/* CARD 1: Thông tin Thanh toán & Ghi chú */}
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 transition hover:shadow-2xl">
                  <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                      <Icons.CreditCard /> Thanh toán & Ghi chú
                  </h3>
                  
                  <div className="space-y-5">
                      {/* Phương thức thanh toán */}
                      <div className="flex items-start gap-3">
                          <div className="mt-1"><Icons.CreditCard /></div>
                          <div>
                              <p className="text-sm text-slate-500 font-medium mb-1">Phương thức thanh toán</p>
                              <span className="text-sm font-bold text-indigo-700 bg-indigo-50 inline-block px-3 py-1.5 rounded-lg ring-1 ring-indigo-100">
                                  {order.paymentMethod || 'N/A'}
                              </span>
                          </div>
                      </div>

                        {/* Vận chuyển */}
                        <div className="flex items-start gap-3">
                          <div className="mt-1"><Icons.Truck /></div>
                          <div>
                              <p className="text-sm text-slate-500 font-medium mb-1">Đơn vị vận chuyển</p>
                              <p className="text-slate-800 font-semibold">{order.shippingMethod || 'Chưa có thông tin'}</p>
                              {order.trackingNumber && (
                                  <p className="text-xs text-slate-500 mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded">Mã vận đơn: {order.trackingNumber}</p>
                              )}
                          </div>
                      </div>

                      {/* Ghi chú */}
                      {order.parsedNote && (
                          <div className="flex items-start gap-3 pt-2">
                              <div className="mt-1"><Icons.Note /></div>
                              <div className="flex-1">
                                <p className="text-sm text-slate-500 font-medium mb-2">Ghi chú của khách</p>
                                <div className="bg-amber-50 border-l-4 border-amber-400 text-amber-800 text-sm p-5 rounded-r-lg shadow-sm italic leading-relaxed relative">
                                
                                  <span className="absolute top-2 left-2 text-amber-200 text-5xl leading-none z-0 select-none font-serif">“</span>
                                  <span className="relative z-10 block px-2">
                                      {order.parsedNote}
                                  </span>
                                  <span className="absolute bottom-0 right-2 text-amber-200 text-5xl leading-none z-0 select-none font-serif">”</span>
                                  
                                </div>
                              </div>
                          </div>
                      )}
                  </div>
              </div>

              {/* CARD 2: Thông tin Khách hàng */}
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 transition hover:shadow-2xl">
                  <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                      <Icons.User /> Khách hàng
                  </h3>
                  
                  <div className="space-y-4">
                      {/* Tên */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100/80 transition">
                          <Icons.User />
                          <div>
                              <p className="text-xs text-slate-500 font-medium">Họ và tên</p>
                              <p className="font-bold text-slate-800 text-[15px]">{order.address?.user?.fullName || 'Khách vãng lai'}</p>
                          </div>
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100/80 transition">
                          <Icons.Email />
                          <div className="overflow-hidden">
                                <p className="text-xs text-slate-500 font-medium">Email</p>
                              <p className="font-semibold text-slate-800 truncate" title={order.address?.user?.email}>
                                  {order.address?.user?.email || 'N/A'}
                              </p>
                          </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100/80 transition">
                          <Icons.Phone />
                          <div>
                                <p className="text-xs text-slate-500 font-medium">Số điện thoại</p>
                              <p className="font-semibold text-slate-800 font-mono">{order.address?.phoneNumber || 'N/A'}</p>
                          </div>
                      </div>

                      {/* Địa chỉ */}
                      <div className="flex items-start gap-3 mt-4 pt-4 border-t border-slate-100">
                          <div className="mt-1"><Icons.Location /></div>
                          <div>
                              <p className="text-sm text-slate-500 font-medium mb-1">Địa chỉ giao hàng</p>
                              <p className="text-slate-800 leading-relaxed font-medium bg-slate-50 p-3 rounded-lg border border-slate-200">
                                  {order.address?.fullAddress || "Chưa có địa chỉ"}
                              </p>
                              {order.address?.addressNote && (
                                  <div className="mt-2 flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-2 rounded-md border border-rose-100 font-medium">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                      Lưu ý địa chỉ: {order.address.addressNote}
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
  )
}

export default OrderDetail
