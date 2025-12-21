import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useUserContext } from '../context/UserContext'
import { useOrderContext } from '../context/OrderContext'
import AddressService from '../services/AddressService';
import { toast } from 'react-toastify';

function CartTotal({ selectedAmount, selectedCount, selectedItemsList }) {
  const { navigate, formatCurrency, delivery_charges, isAuthenticated } = useUserContext();
  const { 
    setSelectedAddress, selectedAddress, 
    applyCoupon, appliedCoupon, setAppliedCoupon,
    setSelectedItemsForCheckout, getValidDiscount
  } = useOrderContext();

  const [addresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  const [couponInput, setCouponInput] = useState("");

  // 1. Lấy danh sách địa chỉ người dùng
  const fetchAddresses = useCallback(async () => {
    setAddressLoading(true);
    try {
      const response = await AddressService.findAllByUser();
      const list = response?.result || response || [];
      setAddresses(list);
      // Ưu tiên chọn địa chỉ mặc định
      const defaultAddress = list.find(addr => addr.isDefault) || list[0] || null;
      setSelectedAddress(defaultAddress);
    } catch (error) {
      toast.error("Không thể tải danh sách địa chỉ.");
    } finally {
      setAddressLoading(false);
    }
  }, [setSelectedAddress]);

  useEffect(() => {
    if (isAuthenticated) fetchAddresses();
  }, [isAuthenticated, fetchAddresses]);

  // 2. Ràng buộc Coupon: Tự động kiểm tra lại khi số tiền giỏ hàng thay đổi
  useEffect(() => {
    if (appliedCoupon) {
      // Tìm điều kiện về số tiền tối thiểu trong mảng conditions
      const minAmountCond = appliedCoupon.conditions?.find(c => c.attribute === "minimum_amount");
      if (minAmountCond) {
        const minVal = parseFloat(minAmountCond.value);
        if (selectedAmount < minVal) {
          setAppliedCoupon(null); // Hủy coupon nếu không đủ tiền
          toast.info(`Mã giảm giá đã bị gỡ bỏ vì đơn hàng dưới ${formatCurrency(minVal)}`);
        }
      }
    }
  }, [selectedAmount, appliedCoupon, setAppliedCoupon, formatCurrency]);

  // 3. Logic Tính Toán Chi Phí
  const { taxAmount, shippingFee, discountValue, totalAmount } = useMemo(() => {
    const tax = selectedAmount * 0.08;
    const ship = selectedAmount === 0 ? 0 : delivery_charges;
    
    // Tính toán discount từ các condition hợp lệ của coupon
    const discount = getValidDiscount(selectedAmount);

    const total = Math.max(0, selectedAmount + ship + tax - discount);
    return { taxAmount: tax, shippingFee: ship, discountValue: discount, totalAmount: total };
  }, [selectedAmount, delivery_charges, getValidDiscount]);

  // 4. Xử lý sự kiện
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.warn("Vui lòng nhập mã giảm giá.");
      return;
    }
    // Gọi hàm applyCoupon từ OrderContext (đã viết ở lượt trước)
    await applyCoupon(couponInput, selectedAmount);
  };

  const handleCheckout = () => {
    if (selectedAmount === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm.");
      return;
    }
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }
    setSelectedItemsForCheckout(selectedItemsList);
    console.log(selectedItemsList);
    navigate("/check-out");
  };

  if (!isAuthenticated) return null;

  return (
    <div className='flex flex-col gap-5'>
      {/* Tiêu đề */}
      <h3 className='text-gray-900'>
        Order Detials <span className='text-action font-bold text-lg'>({selectedCount}) Items</span>
      </h3>
      <hr className='border-gray-300' />

      {/* 1. Địa chỉ giao hàng */}
      <div className='flex flex-col gap-2'>
        <h4 className='text-gray-900 font-semibold'>Where to ship your order?</h4>
        {addressLoading ? (
          <p className='text-xs text-gray-500 italic'>Đang tải địa chỉ...</p>
        ) : (
          <div className='relative flex justify-between items-start mt-2'>
            <p className='text-gray-400 text-sm leading-relaxed flex-1'>
              {selectedAddress ? selectedAddress.fullAddress : "Chưa có địa chỉ được chọn."}
            </p>
            <button onClick={() => setShowAddress(!showAddress)}
              className='text-solid text-sm font-medium hover:underline cursor-pointer ml-2 whitespace-nowrap'>
              Change
            </button>

            {/* Dropdown địa chỉ */}
            {showAddress && (
              <div className='absolute z-50 top-10 py-2 bg-white ring-1 ring-slate-900/10 text-sm w-full rounded-xl shadow-lg'>
                {addresses.length > 0 ? (
                  addresses.map((address, i) => (
                    <p key={i} onClick={() => { setSelectedAddress(address); setShowAddress(false); }}
                      className='p-3 cursor-pointer hover:bg-gray-100 text-sm font-medium border-b last:border-0'>
                      {address.fullAddress}
                    </p>
                  ))
                ) : (
                  <p className='p-3 text-red-500 text-center'>Không tìm thấy địa chỉ.</p>
                )}
                <p onClick={() => navigate("/address")}
                  className='p-3 text-center cursor-pointer hover:bg-tertiary hover:text-white font-bold text-secondary'>
                  + Add New Address
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <hr className='border-gray-300' />

      {/* 2. Nhập mã giảm giá */}
      <div className='flex flex-col gap-2'>
        <h4 className='text-gray-900 font-semibold'>Coupon Code</h4>
        <div className='flex gap-2 mt-1'>
          <input 
            type="text" 
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder="Nhập mã (Ví dụ: CHRISTMAS2025)"
            className='flex-1 p-2 border border-gray-300 rounded-md text-sm outline-none focus:border-solid transition-all'
          />
          <button 
            onClick={handleApplyCoupon}
            className='bg-gray-900 text-white px-5 py-2 rounded-md text-xs font-bold hover:bg-black transition-all uppercase'
          >
            Apply
          </button>
        </div>
        {appliedCoupon && (
          <div className='mt-1 p-2 bg-green-50 border border-green-100 rounded-md'>
            <p className='text-green-700 text-xs font-bold'>✓ {appliedCoupon.code} đã áp dụng!</p>
            <p className='text-[10px] text-green-600 italic'>{appliedCoupon.description}</p>
          </div>
        )}
      </div>

      <hr className='border-gray-300' />

      {/* 4. Tóm tắt chi phí */}
      <div className='flex flex-col gap-3 pt-2'>
        <div className='flex justify-between'>
          <h5 className='text-gray-900'>Price ({selectedCount} items)</h5>
          <p className='font-bold text-gray-900'>{formatCurrency(selectedAmount)}</p>
        </div>
        <div className='flex justify-between'>
          <h5 className='text-gray-900'>Shipping Fee</h5>
          <p className='font-bold text-gray-900'>{formatCurrency(shippingFee)}</p>
        </div>
        <div className='flex justify-between'>
          <h5 className='text-gray-900'>Tax (8%)</h5>
          <p className='font-bold text-gray-900'>{formatCurrency(taxAmount)}</p>
        </div>

        {/* Dòng giảm giá khuyến mãi */}
        {discountValue > 0 && (
          <div className='flex justify-between text-green-600 font-bold animate-pulse'>
            <h5>Discount Applied</h5>
            <p>-{formatCurrency(discountValue)}</p>
          </div>
        )}

        <div className='flex justify-between mt-3 pt-5 border-t-2 border-dashed border-gray-100'>
          <h5 className='text-gray-900 font-bold text-lg'>Total Amount</h5>
          <p className='text-xl font-bold text-solid'>{formatCurrency(totalAmount)}</p>
        </div>
      </div>

      {/* 5. Nút điều hướng */}
      <button 
        onClick={handleCheckout} 
        disabled={selectedAmount === 0 || !selectedAddress} 
        className='text-white btn-solid w-full mt-6 !rounded-xl py-4 disabled:opacity-50 disabled:cursor-not-allowed uppercase font-bold tracking-widest shadow-xl transition-all active:scale-95'
      >
        Proceed to Order
      </button>
    </div>
  )
}

export default CartTotal;