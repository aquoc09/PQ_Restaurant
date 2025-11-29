import React,{useEffect,useState, useCallback} from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { useUserContext } from '../context/UserContext'
import { myAssets } from '../assets/assets'
import { toast } from 'react-hot-toast';
import CartService from '../services/CartService'; 
import CartItem from '../components/CartItem'

const Cart = () => {

  const{
    navigate,
    cart,
    isAuthenticated,
  }=useUserContext();

//   const[basket,setBasket]=useState([]);

//   const fetchCarts = (async () => {
//       try{
//         const cartResponse = await CartService.getCart();
//         const cartList=cartResponse.result;
//         setBasket(cartList.cartItems);
//       }catch{
//         toast.error("Không thể tải giỏ hàng. Vui lòng thử lại.");
//         setBasket([]);
//       }
//     });
//   useEffect(() => {
//     if (isAuthenticated) {
//         fetchCarts();
//     }
// }, [isAuthenticated]);
  const cartItems = cart?.cartItems || [];

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
            {cartItems.length > 0 ? (
              cartItems.map((cart)=>(
                <CartItem key={cart.id} cart={cart} />
              ))
            ) : (
              <div className='max-padd-container py-16 xl:py-28 text-center bg-primary'>
                <h2 className='text-2xl font-bold'>Giỏ hàng của bạn đang trống!</h2>
                <p className='mt-2'>Hãy quay lại trang thực đơn để thêm sản phẩm.</p>
                <button 
                    onClick={() => navigate('/')} 
                    className='mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600'>
                    Tiếp tục mua sắm
                </button>
              </div>
            )}
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
