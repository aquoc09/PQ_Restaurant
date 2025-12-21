import React, { useState, useMemo, useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { useUserContext } from '../context/UserContext'
import CartItem from '../components/CartItem'
import { toast } from 'react-toastify'
import useAuth from '../hooks/useAuth';

const Cart = () => {
  const { navigate, cart, deleteMultipleItems } = useUserContext();
  const { isAuthenticated } = useAuth();

  const cartItems = cart?.cartItems || [];
  const [selectedItems, setSelectedItems] = useState({});

  // --- 1. LỌC DANH SÁCH SẢN PHẨM ĐƯỢC CHỌN ---
  const selectedItemsList = useMemo(() => {
    return cartItems.filter(item => selectedItems[item.id]);
  }, [cartItems, selectedItems]);

  // --- 2. TÍNH TOÁN TỔNG TIỀN & SỐ LƯỢNG ---
  const { selectedCartAmount, selectedCartCount } = useMemo(() => {
    let amount = 0;
    let count = 0;
    selectedItemsList.forEach(item => {
        amount += item.totalMoney;
        count += item.quantity;
    });
    return { selectedCartAmount: amount, selectedCartCount: count };
  }, [selectedItemsList]);

  // --- 3. XỬ LÝ TRẠNG THÁI CHỌN ---
  const handleItemSelectChange = (cartId, isChecked) => {
    setSelectedItems(prev => ({ ...prev, [cartId]: isChecked }));
  };

  const totalItems = cartItems.length;
  const selectedCount = selectedItemsList.length;
  const isAllSelected = totalItems > 0 && selectedCount === totalItems;
  const isAnyItemSelected = selectedCount > 0;

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    const newSelectedItems = {};
    cartItems.forEach(item => { newSelectedItems[item.id] = checked; });
    setSelectedItems(newSelectedItems);
  };

  // --- 4. XỬ LÝ XÓA ---
  const handleDeleteSelected = async () => {
    const itemIdsToDelete = Object.keys(selectedItems).filter(id => selectedItems[id]);
    if (itemIdsToDelete.length === 0) {
      toast.warn("Vui lòng chọn ít nhất một sản phẩm để xóa.");
      return;
    }
    if (window.confirm(`Bạn có chắc muốn xóa ${itemIdsToDelete.length} sản phẩm?`)) {
      try {
        await deleteMultipleItems(itemIdsToDelete);
        toast.success(`Đã xóa thành công.`);
        setSelectedItems({});
      } catch (error) {
        toast.error("Có lỗi xảy ra khi xóa.");
      }
    }
  };

  // --- 5. KIỂM TRA ĐĂNG NHẬP ---
  useEffect(() => {
    if (isAuthenticated() === false) {
      toast.error("Vui lòng đăng nhập để xem giỏ hàng của bạn.");
      const timer = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className='max-padd-container py-16 xl:py-24 bg-primary'>
      <div className='flex flex-col xl:flex-row gap-10 xl:gap-16'>
        
        {/* Left Side: Cart Items */}
        <div className='flex flex-[2] flex-col gap-4'>
          <Title title1={"Cart"} title2={"Overview"} titleStyles={"pb-5 items-start"} paraStyles={"hidden"} />
          
          {totalItems > 0 && (
            <div className='grid grid-cols-[6fr_1fr] gap-3 font-medium bg-gray-100 px-4 py-3 rounded-xl shadow-sm'>
              <label className='flex items-center font-semibold text-gray-700 cursor-pointer'>
                  <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className='h-4 w-4 text-primary mr-2' />
                  <h5>Choose All ({selectedCount})</h5>
              </label>
              <button onClick={handleDeleteSelected} disabled={!isAnyItemSelected}
                  className={`text-sm font-semibold ${isAnyItemSelected ? 'text-red-500 hover:underline' : 'text-gray-400'}`}>
                  <h5>Delete</h5>
              </button>
            </div>
          )}

          {/* Header row */}
          <div className='grid grid-cols-[1fr_6fr_2fr_1fr] gap-3 font-medium bg-white px-4 py-3 rounded-xl shadow-sm mt-2'>
            <h5 className='text-center text-gray-900'>Choose</h5>
            <h5 className='text-left text-gray-900'>Product Details</h5>         
            <h5 className='text-center text-gray-900'>Total</h5>         
            <h5 className='text-center text-gray-900'>Action</h5>         
          </div>

          <div className='mt-3 space-y-3'>
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <CartItem 
                  key={item.id} 
                  cart={item} 
                  isSelected={!!selectedItems[item.id]} 
                  onSelectChange={handleItemSelectChange} 
                />
              ))
            ) : (
              <div className='w-full text-center bg-white rounded-xl shadow-sm py-16'>
                <h2 className='text-2xl font-bold text-gray-900'>Giỏ hàng của bạn đang trống!</h2>
                <button onClick={() => navigate('/')} className='mt-4 bg-green-500 text-white px-8 py-2 rounded-lg hover:bg-green-600 font-bold'>
                  Tiếp tục mua sắm
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Cart Summary */}
        <div className='flex flex-1 flex-col'>
          <div className='max-w-[379px] w-full bg-white p-6 py-10 rounded-xl shadow-sm sticky top-28'>
            <CartTotal 
              selectedAmount={selectedCartAmount}
              selectedCount={selectedCartCount}
              selectedItemsList={selectedItemsList} // QUAN TRỌNG: Truyền danh sách đã chọn sang
            />
          </div>
        </div>

      </div>
    </div> 
  )
}

export default Cart