import React from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { useUserContext } from '../context/UserContext'
import CartItem from '../components/CartItem'
import {ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import useAuth from '../hooks/useAuth';

const Cart = () => {

  const{
    navigate,
    cart,
  }=useUserContext();

  const { 
      isAuthenticated, 
  } = useAuth();

  const cartItems = cart?.cartItems || [];

  if (isAuthenticated() === false) {
      toast.error("Vui lòng đăng nhập để xem giỏ hàng của bạn.");
      setTimeout(() => navigate('/login'), 3000)
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
            <h5 className='text-left text-gray-900'>Product Detials</h5>         
            <h5 className='text-center text-gray-900'>Total</h5>         
            <h5 className='text-center text-gray-900'>Action</h5>         
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

export default Cart
