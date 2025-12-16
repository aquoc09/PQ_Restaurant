import React, {useEffect,useState, useCallback} from 'react'
import { useUserContext } from '../context/UserContext'
import { useOrderContext } from '../context/OrderContext'
import AddressService from '../services/AddressService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CartTotal() {

  const {
    navigate,
    formatCurrency,
    delivery_charges,
    getCartCount,
    getCartAmount,
    isAuthenticated
  } =useUserContext();

  const {    
    method,
    setMethod, 
    processOrder,
    selectedAddress, 
    setSelectedAddress,
    orderNote,
    setOrderNote
  }=useOrderContext();

  const [addresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);

  const [addressLoading, setAddressLoading] = useState(true);

  const fetchAddresses = useCallback(async () => {
        setAddressLoading(true);
        try {
            
            const response = await AddressService.findAllByUser();
            const list = response && response.result ? response.result : (response || []);
            setAddresses(list);
            console.log("Địa chỉ người dùng:", list);

            // Chọn địa chỉ mặc định (use fetched list, not stale state)
            const defaultAddress = (list.find ? list.find(addr => addr.isDefault) : null) || (list[0] || null);
            setSelectedAddress(defaultAddress);

        } catch (error) {
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
    const cartAmount = getCartAmount; // Tổng tiền sản phẩm
    const taxRate = 0.08;
    const taxAmount = cartAmount * taxRate;
    const shippingFee = cartAmount === 0 ? 0 : delivery_charges;

    const totalAmount = cartAmount + shippingFee + taxAmount;
    
    // --- Xử lý Đặt hàng ---
    const handleCheckout = async () => {
        await processOrder(totalAmount);
    };

    if (!isAuthenticated) {
        return null; 
    }

  return (
    <div>
      <h3 className='text-gray-900'>
        Order Detials 
        <span className='text-action font-bold text-lg'>({getCartCount}) Items</span>
      </h3>
      <hr className='border-gray-300 my-5' />
      <div className='mb-5'>
        <div className='my-5'>
          <h4 className='text-gray-900'>Where to ship your order?</h4>
          {addressLoading ? 
          (
              <p className='text-sm text-gray-500'>Đang tải địa chỉ...</p>
          ) : (
          <div className='relative flex justify-between items-start mt-2'>
          <p className='text-gray-400'>
          {selectedAddress ? 
          ( 
              `${selectedAddress.fullAddress} `
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
                  {address.fullAddress}
                </p>
              ))
              ) : (
                  <p className='p-2 text-center text-red-500'>Không tìm thấy địa chỉ nào.</p>
              )}
                <p onClick={()=>{
                navigate("/address")
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
            <h4 className='text-gray-900'>Payment Method</h4>
            <div className='flex gap-3'>
              <div onClick={()=>setMethod("COD")}
              className={`${method === "COD" ? 'btn-solid text-white' : 'btn-light'} 
              !py-1 text-xs cursor-pointer`}
              >
                Cash On Delivery
              </div>
              <div onClick={()=>setMethod("VNPAY")}
              className={`${method === "VNPAY" ? 'btn-solid text-white' : 'btn-light'} 
              !py-1 text-xs cursor-pointer `}
              >
                VNPAY
              </div>
            </div>
          </div>
          <hr className='border-gray-300 mt-5' />
        </div>

        {/* Note */}
        <div>
          <div>
            <h4 className='text-gray-900'>Note</h4>
            <textarea
                name="orderNote"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                className='mt-1 p-2 w-full border border-gray-300 rounded text-gray-700 h-24'
                placeholder='Ghi chú (ví dụ: cạnh cửa hàng, tầng, căn hộ...)'
            />
          </div>
          <hr className='border-gray-300 mt-5' />
        </div>

        {/* TÓM TẮT TIỀN HÀNG */}
        <div className='mt-4 space-y-2'>

          {/* Giá sản phẩm */}
          <div className='flex justify-between'>
            <h5 className='text-gray-900'>Price ({getCartCount} items)</h5>
            <p className='font-bold text-gray-900'>{formatCurrency(cartAmount)}</p>
          </div>

          {/* Phí vận chuyển */}
          <div className='flex justify-between'>
            <h5 className='text-gray-900'>Shipping Fee</h5>
            <p className='font-bold text-gray-900'>
              {cartAmount === 0 ? formatCurrency(0) : formatCurrency(shippingFee)}
            </p>
          </div>

          {/* Thuế (8%) */}
          <div className='flex justify-between'>
            <h5 className='text-gray-900'>Tax (8%)</h5>
            <p className='font-bold text-gray-900'>{formatCurrency(taxAmount)}</p>
          </div>

          {/* Tổng cộng */}
          <div className='flex justify-between'>
            <h5 className='text-gray-900'>Total Amount</h5>
            <p className='text-lg font-bold text-solid'>
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>

        {/* Nút Đặt hàng */}
        <button 
        onClick={handleCheckout} 
        disabled={cartAmount === 0 || !selectedAddress} 
        className='text-white btn-solid w-full mt-8 !rounded-md py-2 disabled:opacity-50 disabled:cursor-not-allowed'
        >
        Proceed to Order
        </button>
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
        />
    </div>
    
  )
}

export default CartTotal
