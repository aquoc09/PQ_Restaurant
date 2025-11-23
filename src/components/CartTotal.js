import React, {useEffect,useState, useCallback} from 'react'
import { useUserContext } from '../context/UserContext'
import { toast } from 'react-toastify';

function CartTotal() {

  const {
    navigate,
    formatCurrency,
    method,
    setMethod,
    delivery_charges,
    getCartCount,
    getCartAmount,
    isAuthenticated,
    user,
    userLoading,
  } =useUserContext();

  const [addresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);

  const fetchAddresses = useCallback(async () => {
        setAddressLoading(true);
        try {
            
            // TẠM THỜI: Dùng dữ liệu dummy hoặc giá trị rỗng nếu API chưa có
            const dummyAddresses = [
                 { id: 1, address: '456 Lê Lai', city: 'Quận 1', state: 'TP Hồ Chí Minh', zip: '70000', isDefault: true },
                 { id: 2, address: '123 Nguyễn Văn Cừ', city: 'Quận 5', state: 'TP Hồ Chí Minh', zip: '70000' }
            ];
            
            setAddresses(dummyAddresses);
            
            // Chọn địa chỉ mặc định
            const defaultAddress = dummyAddresses.find(addr => addr.isDefault) || dummyAddresses[0];
            setSelectedAddress(defaultAddress);

        } catch (error) {
            console.error("Lỗi khi tải địa chỉ:", error);
            toast.error("Không thể tải danh sách địa chỉ.");
            setAddresses([]);
        } finally {
            setAddressLoading(false);
        }
    }, []);

    useEffect(() => {
        // Chỉ fetch nếu đã đăng nhập và user chi tiết đã có (nếu dùng fetchUserDetails)
        if(isAuthenticated) {
            fetchAddresses();
        } else {
            setAddressLoading(false);
            setAddresses([]);
            setSelectedAddress(null);
        }
    }, [isAuthenticated, fetchAddresses]);

    // --- Logic Tính Toán ---
    const cartAmount = getCartAmount(); // Tổng tiền sản phẩm
    const taxRate = 0.08;
    const taxAmount = cartAmount * taxRate;
    const shippingFee = cartAmount === 0 ? 0 : delivery_charges;

    const totalAmount = cartAmount + shippingFee + taxAmount;
    
    // --- Xử lý Đặt hàng (Checkout) ---
    const handleCheckout = () => {
      if (!isAuthenticated) {
            toast.error("Vui lòng đăng nhập để tiến hành đặt hàng.");
            navigate('/login');
            return;
        }
        if (cartAmount === 0) {
            toast.error("Giỏ hàng của bạn đang trống.");
            return;
        }
        if (!selectedAddress) {
            toast.error("Vui lòng chọn địa chỉ giao hàng.");
            return;
        }
        toast.success(`Đã chuẩn bị đặt hàng. Thanh toán bằng: ${method}.`);
        // navigate('/checkout-page');
    };

    if (userLoading || !isAuthenticated) {
        // Có thể hiển thị component trống nếu Cart.js đã xử lý trạng thái chưa đăng nhập
        return null; 
    }

  return (
    <div>
      <h3>
        Order Detials 
        <span className='text-black font-bold text-lg'>({getCartCount()}) </span>Items
      </h3>
      <hr className='border-gray-300 my-5' />
      Payment & AddressForm
      <div className='mb-5'>
        <div className='my-5'>
          <h4 className='mb-5'>Where to ship your order?</h4>
          {addressLoading ? 
          (
              <p className='text-sm text-gray-500'>Đang tải địa chỉ...</p>
          ) : (
          <div className='relative flex justify-between items-start mt-2'>
          <p>
          {selectedAddress ? 
          ( 
              `${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.state}` 
          ) : ( 
              "Chưa có địa chỉ được chọn." 
          )}
        </p>
        <button onClick={()=> setShowAddress(!showAddress)}
          className='text-solid tetx-sm font-medium hover:underline cursor-pointer'>Change</button>

          {/* Dropdown Địa chỉ */}
          {showAddress && (
            <div className='absolute top-10 py-2 bg-white ring-1 ring-slate-900/10 text-sm w-full'>
              {addresses.length > 0 ? (
                addresses.map((address,i)=>(
                <p key={i} onClick={()=>{
                  setSelectedAddress(address);
                  setShowAddress(false);
                }}
                className='p-2 cursor-pointer hover:bg-gray-100 text-sm font-medium'>
                  {address.address}, {address.city}, {address.state}
                </p>
              ))
              ) : (
                  <p className='p-2 text-center text-red-500'>Không tìm thấy địa chỉ nào.</p>
              )}
                <p onClick={()=>{
                navigate("/address-form")
                // ensure the page is scrolled to top after navigation
                setTimeout(()=> window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }), 50)
              }}
              className='p-2 text-center cursor-pointer hover:bg-tertiary hover:text-white'
              >
                Add Address
              </p>
            </div>
          )}
          </div>
        )}            
        </div>
      </div>
      {/* PHƯƠNG THỨC THANH TOÁN */}
        <div>
          <hr className='border-gray-300 mt-5' />
          <div>
            <h4>Payment Method</h4>
            <div className='flex gap-3'>
              <div onClick={()=>setMethod("COD")}
              className={`${method === "COD" ? 'btn-solid' : 'btn-light'} 
              !py-1 text-xs cursor-pointer`}
              >
                Cash On Delivery
              </div>
              <div onClick={()=>setMethod("stripe")}
              className={`${method === "stripe" ? 'btn-solid' : 'btn-light'} 
              !py-1 text-xs cursor-pointer`}
              >
                Stripe
              </div>
            </div>
          </div>
          <hr className='border-gray-300 mt-5' />
        </div>

        {/* TÓM TẮT TIỀN HÀNG */}
        <div className='mt-4 space-y-2'>

          {/* Giá sản phẩm */}
          <div className='flex justify-between'>
            <h5>Price ({getCartCount()} items)</h5>
            <p className='font-bold text-black'>{formatCurrency(cartAmount)}</p>
          </div>

          {/* Phí vận chuyển */}
          <div className='flex justify-between'>
            <h5>Shipping Fee</h5>
            <p className='font-bold text-black'>
              {cartAmount === 0 ? formatCurrency(0) : formatCurrency(shippingFee)}
            </p>
          </div>

          {/* Thuế (8%) */}
          <div className='flex justify-between'>
            <h5>Tax (8%)</h5>
            <p className='font-bold text-black'>{formatCurrency(taxAmount)}</p>
          </div>

          {/* Tổng cộng */}
          <div className='flex justify-between'>
            <h5>Total Amount</h5>
            <p className='text-lg font-bold text-solid'>
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>

        {/* Nút Đặt hàng */}
        <button 
        onClick={handleCheckout} 
        disabled={cartAmount === 0 || !selectedAddress} 
        className='btn-solid w-full mt-8 !rounded-md py-2 disabled:opacity-50 disabled:cursor-not-allowed'
        >
        Proceed to Order
        </button>
    </div>
    
  )
}

export default CartTotal
