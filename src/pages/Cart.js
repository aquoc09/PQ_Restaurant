import React, { useState, useMemo} from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { useUserContext } from '../context/UserContext'
import CartItem from '../components/CartItem'
import { toast } from 'react-toastify'

import useAuth from '../hooks/useAuth';

const Cart = () => {

  const{
    navigate,
    cart,
    deleteMultipleItems,
  }=useUserContext();

  const { 
      isAuthenticated, 
  } = useAuth();

  const cartItems = cart?.cartItems || [];

  const [selectedItems, setSelectedItems] = useState({});

  // --- HÀM XỬ LÝ TRẠNG THÁI CHỌN ---

  // Cập nhật trạng thái chọn của MỘT mục
  const handleItemSelectChange = (cartId, isChecked) => {
    setSelectedItems(prev => ({
      ...prev,
      [cartId]: isChecked
    }));
  };

  // Tính toán số lượng mục đã chọn
  const selectedCount = useMemo(() => 
    Object.values(selectedItems).filter(v => v).length, 
    [selectedItems]
  );
  const totalItems = cartItems.length;
  const isAllSelected = totalItems > 0 && selectedCount === totalItems;
  const isAnyItemSelected = selectedCount > 0;

  // Xử lý khi click "Chọn Tất Cả"
  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    const newSelectedItems = {};
    // Thiết lập trạng thái chọn cho TẤT CẢ sản phẩm
    cartItems.forEach(cartItem => {
    newSelectedItems[cartItem.id] = checked;
  });

  setSelectedItems(newSelectedItems);
  };

  // Xử lý chức năng "XÓA" các mục đã chọn
  const handleDeleteSelected = async () => {
    const itemIdsToDelete = Object.keys(selectedItems).filter(id => selectedItems[id]);

    if (itemIdsToDelete.length === 0) {
    toast.warn("Vui lòng chọn ít nhất một sản phẩm để xóa.");
    return;
  }

  if (window.confirm(`Bạn có chắc chắn muốn xóa ${itemIdsToDelete.length} sản phẩm đã chọn không?`)) {
    try {
      // SỬ DỤNG HÀM TẠO MỚI TRONG CONTEXT
      await deleteMultipleItems(itemIdsToDelete); 
      toast.success(`Đã xóa thành công ${itemIdsToDelete.length} sản phẩm.`);
      setSelectedItems({});
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa sản phẩm.");
    }
  }
};

// --- TÍNH TOÁN TỔNG TIỀN CỦA CÁC MỤC ĐÃ CHỌN ---
const { selectedCartAmount, selectedCartCount } = useMemo(() => {
  let amount = 0;
  let count = 0;
  
  // Lặp qua danh sách cartItems và kiểm tra trạng thái chọn từ selectedItems
  cartItems.forEach(item => {
      if (selectedItems[item.id]) {
          // Nếu mục này được chọn, cộng dồn tổng tiền và số lượng
          amount += item.totalMoney;
          count += item.quantity;
      }
  });

  return { selectedCartAmount: amount, selectedCartCount: count };
}, [cartItems, selectedItems]);

  if (isAuthenticated() === false) {
      toast.error("Vui lòng đăng nhập để xem giỏ hàng của bạn.");
      setTimeout(() => navigate('/login'), 3000)
  }

  return (
  <div className='max-padd-container py-16 xl:py-24 bg-primary'>
      {/* CONTAINER */}
      <div className='flex flex-col xl:flex-row gap-10 xl:gap-16'>
        {/* Left Side */}
        <div className='flex flex-[2] flex-col gap-4 text-[95%]'>
          <Title title1={"Cart"} title2={"Overview"} titleStyles={"pb-5 items-start"} paraStyles={"hidden"} />
          {totalItems > 0 && (
            <div className='grid grid-cols-[6fr_0.6fr] md:grid-cols-[6fr_0.6fr] gap-3 font-medium bg-gray-100 px-4 py-3 rounded-xl shadow-sm'>
              {/* CHECKBOX + TEXT */}
              <label className='flex items-center font-semibold text-gray-700 cursor-pointer col-span-1'>
                  <input 
                      type="checkbox" 
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className='h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mr-2' // Giảm kích thước checkbox, thêm margin phải
                  />
                  <h5>Choose All ({selectedCount})</h5>
              </label>
              {/* NÚT XÓA */}
              <div className="flex items-center space-x-4 col-span-1">
                {/* Nội dung Chọn Tất Cả */}
                <button
                    onClick={handleDeleteSelected}
                    disabled={!isAnyItemSelected}
                    className={`text-sm font-semibold ml-4 ${ 
                        isAnyItemSelected 
                          ? 'text-red-500 hover:text-red-700 hover:underline'
                          : 'text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <h5>Delete</h5>
                </button>
              </div>
            </div>
          )}
          {/* Header row */}
          <div className='grid grid-cols-[1fr_6fr_2fr_1fr] md:grid-cols-[1fr_6fr_2fr_1fr] gap-3 font-medium bg-white px-4 py-3 rounded-xl shadow-sm'>
            <h5 className='text-center text-gray-900'>Choose</h5>
            <h5 className='text-left text-gray-900'>Product Detials</h5>         
            <h5 className='text-center text-gray-900'>Total</h5>         
            <h5 className='text-center text-gray-900'>Action</h5>         
            </div>
            <div className='mt-3 space-y-3'>
              {cartItems.length > 0 ? (
                cartItems.map((cart)=>(
                  <CartItem 
                    key={cart.id} 
                    cart={cart}
                    isSelected={!!selectedItems[cart.id]}
                    onSelectChange={handleItemSelectChange} />
                ))
              ) : (
                <div className='w-full text-center bg-white rounded-xl shadow-sm py-10 px-4'>
                  <h2 className='text-2xl font-bold text-gray-900'>Giỏ hàng của bạn đang trống!</h2>
                  <p className='mt-2 text-gray-600'>Hãy quay lại trang thực đơn để thêm sản phẩm.</p>
                  <button 
                      onClick={() => navigate('/')} 
                      className='mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600'>
                      Tiếp tục mua sắm
                  </button>
                </div>
              )}
            </div>
        </div>
        {/* Right Side */}
        <div className='flex flex-1 flex-col'>
          <div className='max-w-[379px] w-full bg-white p-5 py-10 max-md:mt-10 rounded-xl shadow-sm'>
            <CartTotal 
            selectedAmount={selectedCartAmount}
            selectedCount={selectedCartCount}
            />
          </div>
            </div>
        </div>
    </div> 
  )
}

export default Cart
