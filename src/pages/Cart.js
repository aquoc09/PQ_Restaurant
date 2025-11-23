import React,{useEffect,useState} from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { useUserContext } from '../context/UserContext'
import { myAssets } from '../assets/assets'
import { toast } from 'react-toastify';

const Cart = () => {

  const{
    navigate, 
    products, 
    formatCurrency, 
    cart,
    updateQuantity,
    removeFromCart, 
    isAuthenticated, 
  }=useUserContext();

  const cartItems = cart?.items || [];


  // Tăng số lượng
    const increment = (itemId, currentQuantity) => {
        // Gọi hàm updateQuantity trong Context (sẽ gọi CartService.updateItemQuantity)
        updateQuantity(itemId, currentQuantity + 1);
    };

    // Giảm số lượng
    const decrement = (itemId, currentQuantity) => {
        if (currentQuantity > 1) {
            // Gọi hàm updateQuantity trong Context
            updateQuantity(itemId, currentQuantity - 1);
        } else {
          handleRemove(itemId);
        }
    };

    // Xóa một mục khỏi giỏ hàng (Gọi API)
    const handleRemove = (itemId) => {
        // Gọi hàm removeFromCart trong Context (sẽ gọi CartService.deleteItemFromCart)
      if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?")) {
          removeFromCart(itemId);
      }
    };
    
    if (!isAuthenticated) {
        return (
            <div className='max-padd-container py-16 xl:py-28 text-center bg-primary'>
                <h2 className='text-2xl font-bold'>Vui lòng đăng nhập để xem giỏ hàng</h2>
                <button 
                    onClick={() => navigate('/login')} 
                    className='mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600'>
                    Đi đến trang Đăng nhập
                </button>
            </div>
        );
    }
    // Kiểm tra nếu giỏ hàng rỗng
    if (cartItems.length === 0) {
        return (
            <div className='max-padd-container py-16 xl:py-28 text-center bg-primary'>
                <h2 className='text-2xl font-bold'>Giỏ hàng của bạn đang trống!</h2>
                <p className='mt-2'>Hãy quay lại trang thực đơn để thêm sản phẩm.</p>
                <button 
                    onClick={() => navigate('/')} 
                    className='mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600'>
                    Tiếp tục mua sắm
                </button>
            </div>
        );
    }

  return (
    <div className='max-padd-container py-16 xl:py-28 bg-primary'>
      {/* CONTAINER */}
      <div className='flex flex-col xl:flex-row gap-20 xl:gap-28'>
        {/* Left Side */}
        <div className='flex flex-[2] flex-col gap-3 text-[95%]'>
          <Title title1={"Cart"} title2={"Overview"} titleStyles={"pb-5 items-start"} paraStyles={"hidden"} />
          <div className='grid grid-cols-[6fr_2fr_1fr] font-medium bg-white p-2
          rounded-xl'>
            <h5 className='text-left'>Product Detials</h5>         
            <h5 className='text-center'>Total</h5>         
            <h5 className='text-center'>Action</h5>         
            </div>
            {cartItems.map((item)=>{
            const productData = products.find((product) => product.id === item.productId);      
            if (!productData) return null; 

            // Lấy các trường dữ liệu từ CartItemResponse
            const itemId = item.id; 
            const quantity = item.quantity;
            
            // Sử dụng totalMoney từ Backend nếu có, hoặc tính thủ công (fallback)
            let subtotal;
            if (item.totalMoney) {
                subtotal = parseFloat(item.totalMoney); 
            } 
            else {
                // Logic fallback: tìm giá từ ProductData
                const itemPrice = productData.prices.find(p => p.size === item.size)?.price || 0;
                subtotal = itemPrice * quantity;
            }
            return(
                <div key={itemId} className='grid grid-cols-[6fr_2fr_1fr] items-center bg-white p-2
          rounded-xl'>
                  <div className='flex items-center md:gap-6 gap-3'>
                    <div className='flex bg-primary rounded-xl'>
                      <img src={myAssets[productData.productImage]} alt="productImg" className='w-20' />
                    </div>
                    <div>
                      <h5 className='hidden sm:block line-clamp-1'>{productData.title}</h5>
                      <div className='bold-14 flexStart gap-2 mb-1'>Size: <p>{item.size}</p></div>
                      <div className='flexBetween'>
                        <div className='flex items-center right-1 ring-slate-900/15 
                        rounded-full overflow-hidden bg-primary'>
                          <button onClick={()=>decrement(itemId, quantity)} 
                          className='p-1.5 bg-solid text-white rounded-full shadow-md m-0.5 cursor-pointer'>
                            <img src={myAssets.minus} alt="" width={11}
                            className='invert' />
                          </button>
                          <p className='px-2'>{quantity}</p>
                          <button onClick={()=>increment(itemId, quantity)} 
                          className='p-1.5 bg-solid text-white rounded-full shadow-md m-0.5 cursor-pointer'>
                            <img src={myAssets.plus} alt="" width={11}
                            className='invert' />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='text-center text-[17px] font-semibold text-black'>
                    {formatCurrency(subtotal)}
                  </div>
                  <button onClick={()=>handleRemove(itemId)}
                    className='cursor-pointer mx-auto'>
                      <img src={myAssets.cart_remove} alt="" width={22} />
                    </button>
                  </div>
              );
            })}
        </div>
        {/* Right Side */}
        <div className='flex flex-1 flex-col'>
          <div className='max-w-[379px] w-full bg-white p-5 py-10 max-md:mt-16 rounded-xl'>
            <CartTotal />
          </div>
            </div>
        </div>
    </div>
  )
}

export default Cart
