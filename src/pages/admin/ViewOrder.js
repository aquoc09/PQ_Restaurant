import React, { useEffect, useState } from 'react';
import OrderService from '../../services/OrderSevice';
import { useUserContext } from '../../context/UserContext';
import { myAssets } from '../../assets/assets';
import { toast } from 'react-toastify';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

function ViewOrder() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { formatCurrency, navigate } = useUserContext();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await OrderService.findAllOrders();
                const sortedData = (data.result || []).reverse(); 
                setOrders(sortedData);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    // Chỉ lấy các đơn hàng thuộc trang hiện tại để hiển thị
    const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
    
    // Tính tổng số trang
    const totalPages = Math.ceil(orders.length / itemsPerPage);

    // Hàm chuyển trang
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleStatusChange = async (order, newStatus) => {
        try {
            const request = {
                note: order.note,
                orderDate: order.orderDate,
                status: newStatus, // Giá trị mới từ <select>
                totalMoney: order.totalMoney,
                shippingMethod: order.shippingMethod,
                trackingNumber: order.trackingNumber,
                paymentMethod: order.paymentMethod,
                active: order.active,
                userId: order.userId,
                address: {
                    phoneNumber: order.address.phoneNumber,
                    email: order.address.email,
                    city: order.address.city,
                    district: order.address.district,
                    ward: order.address.ward,
                    street: order.address.street,
                    streetNumber: order.address.streetNumber,
                    addressNote: order.address.addressNote
                },
                orderDetails: order.orderDetails.map(detail => ({
                    price: detail.price,
                    numProducts: detail.numProducts,
                    totalMoney: detail.totalMoney,
                    size: detail.size,
                    productId: detail.product.id
                }))
            };

            console.log(request);
            // Gọi service cập nhật
            await OrderService.updateOrder(order.id, request);
            
            // Cập nhật lại state local để UI hiển thị giá trị mới ngay lập tức
            setOrders(prevOrders => 
                prevOrders.map(o => o.id === order.id ? { ...o, status: newStatus } : o)
            );

            toast.success("Cập nhật trạng thái thành công!");
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.");
            console.error(error);
        }
    };
    const handleDeleteOrder = async (orderId) => {
        const isConfirm = window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${orderId} không? Hành động này không thể hoàn tác.`);
        
        if (isConfirm) {
            try {
                await OrderService.deleteOrder(orderId);
                setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
                toast.success("Xóa đơn hàng thành công");
            } catch (error) {
                console.error("Lỗi khi xóa đơn hàng:", error);
                toast.error("Không thể xóa đơn hàng. Vui lòng thử lại sau.");
            }
        }
    };

    if (loading) return <div className="p-10 text-center text-xl">Đang tải dữ liệu...</div>;

    return (
        <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-slate-50 shadow rounded-xl'>
            <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-2xl font-bold text-slate-800">Quản lý đơn hàng</h2>
                <span className="text-sm font-medium bg-white px-3 py-1 rounded border border-gray-200 text-gray-600">
                    Tổng: {orders.length} đơn
                </span>
            </div>
            {/* All Orders */}
            <div className='bg-primary pb-20'> 
                {currentOrders.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">Chưa có đơn hàng nào.</div>
                ) : (
                    currentOrders.map((order) => (
                        <div key={order.id} className='bg-white p-4 mt-3 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow'>
                            
                            {/* Phần hiển thị sản phẩm */}
                            <div className='flex flex-row justify-between items-center gap-4 mb-3 p-2'>
                                <div className='flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                                    {order.orderDetails.slice(0, 6).map((item, idx) => (
                                        <div key={idx} className='text-gray-700 border-gray-100 pr-2'>
                                            <div className='flex gap-x-3'>
                                                <div className='flexCenter bg-slate-50 rounded-xl border border-slate-100 p-1'>
                                                    {/* Kiểm tra ảnh an toàn */}
                                                    <img 
                                                        src={myAssets[item.product.productImage]} 
                                                        alt={item.product?.name} 
                                                        className='max-h-16 max-w-16 object-contain rounded' 
                                                    />
                                                </div>
                                                <div className='block w-full'>
                                                    <h5 className='uppercase line-clamp-1 text-xs font-bold text-slate-800'>{item.product?.name}</h5>
                                                    <div className='flex flex-wrap gap-2 text-[11px] mt-1 text-gray-500'>
                                                        <span className='bg-gray-100 px-1.5 rounded'>Sz: {item.size}</span>
                                                        <span className='bg-gray-100 px-1.5 rounded'>x{item.numProducts}</span>
                                                        <span className='font-bold text-slate-700'>{formatCurrency(item.price)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Nút thao tác nhanh */}
                                <div className='flex flex-col gap-2 flex-shrink-0 min-w-[100px]'>
                                    <button 
                                        onClick={() => navigate(`/admin/order-detail/${order.id}`)}
                                        className='px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded hover:bg-slate-700 transition-all'
                                    >
                                        Chi tiết
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteOrder(order.id)}
                                        className='px-3 py-1.5 bg-white text-red-600 border border-red-200 text-xs font-bold uppercase rounded hover:bg-red-50 transition-all'
                                    >
                                        Xóa
                                    </button>
                                    {order.orderDetails.length > 6 && (
                                        <p className="text-[10px] text-center text-gray-400 italic">+{order.orderDetails.length - 6} món khác</p>
                                    )}
                                </div>
                            </div>

                            {/* Thông tin tóm tắt & Select Status */}
                            <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-t border-gray-100 pt-3 mt-2 text-sm'>
                                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-xs'>
                                    <div>
                                        <span className='text-gray-400 block mb-0.5'>Mã đơn</span>
                                        <span className='font-mono font-bold text-slate-700'>#{order.id}</span>
                                    </div>
                                    <div>
                                        <span className='text-gray-400 block mb-0.5'>Khách hàng</span>
                                        <span className='font-medium text-slate-700 truncate block' title={order.address?.user?.fullName}>
                                            {order.address?.user?.fullName}
                                        </span>
                                    </div>
                                    <div>
                                        <span className='text-gray-400 block mb-0.5'>Ngày đặt</span>
                                        <span className='font-medium text-slate-700'>{formatDate(order.orderDate)}</span>
                                    </div>
                                    <div>
                                        <span className='text-gray-400 block mb-0.5'>Tổng tiền</span>
                                        <span className='font-bold text-indigo-600 text-sm'>{formatCurrency(order.totalMoney)}</span>
                                    </div>
                                </div>
                                
                                <div className='flex items-center gap-2 min-w-[160px]'>
                                    <span className='text-xs font-bold text-slate-500 uppercase'>Trạng thái:</span>
                                    <select 
                                        value={order.status} 
                                        onChange={(e) => handleStatusChange(order, e.target.value)}
                                        className={`text-xs font-bold py-1.5 px-3 rounded border-none cursor-pointer outline-none transition-colors
                                            ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                            order.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
                                            order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                            order.status === 'DENIED' ? 'bg-red-100 text-red-800' :
                                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'}`}
                                    >
                                        <option value="PENDING">PENDING</option>
                                        <option value="ACCEPTED">ACCEPTED</option>
                                        <option value="SHIPPING">SHIPPING</option>
                                        <option value="COMPLETED">COMPLETED</option>
                                        <option value="DENIED">DENIED</option>
                                        <option value="NOT_PAY">NOT_PAY</option>
                                        <option value="PAID">PAID</option>
                                        <option value="CANCELLED">CANCELLED</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                
                {/* --- 4. THANH PHÂN TRANG (PAGINATION BAR) --- */}
                {orders.length > itemsPerPage && (
                    <div className="mt-6 flex justify-center items-center gap-2 pb-6 pt-4 border-t border-slate-200">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-slate-600 transition"
                        >
                            Trước
                        </button>
                        
                        <div className="flex gap-1 overflow-x-auto max-w-[200px] md:max-w-none custom-scrollbar pb-1 md:pb-0">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                <button
                                    key={number}
                                    onClick={() => paginate(number)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all shadow-sm
                                        ${currentPage === number 
                                            ? 'bg-slate-800 text-white scale-110' 
                                            : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    {number}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-slate-600 transition"
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>           
        </div>
    );
}

export default ViewOrder;