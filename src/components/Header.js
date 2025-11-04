import React, {useState} from 'react'
import { Link, useLocation } from 'react-router-dom'
import { myAssets } from '../assets/assets'
import Navbar from './Navbar'
// import {useClerk,UserButton}from "@clerk/clerk-react"
import { useUserContext } from '../context/UserContext'

const Header = () => {

  const [menuOpened, setMenuOpened] = useState(false);

  const toggleMenu = ()=>setMenuOpened(prev => !prev);

  // const {openSignIn}=useClerk();
  const {navigate, user, getCartCount}=useUserContext();
  const isHomePage=useLocation().pathname.endsWith('/')

  const OrdersIcon =()=>(
    <svg 
    xmlns={myAssets.order_icon}
    width='24'
    height="24"
    viewBox='0 0 36 36'
    fill='none'
    stroke='currentColor'
    stroke-width='2'
    stroke-linecap='round'
    stroke-linejoin='round'
    class='lucide lucide-scroll-text-icon lucide-scroll-text'
    >
      <path d='M15 12h-5'/>
      <path d='M15 8h-5'/>
      <path d='M19 17V5a2 2 0 0 0-2-2H4'/>
      <path d='M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3'/>
      
    </svg>
  )
  return (
    <header className={`absolute top-0 left-0 right-0 z-50 py-3 ${!isHomePage && 'bg-white'}`}>
      {/* CONTAINER */}
      <div className='mx-auto max-w-[1440px] px-4 lg:px-12 flex justify-between items-center'>
        {/* LOGO */}
  <div className='flex flex-1'>
          <Link to={'/'} className='flex items-end'>
            <img src={myAssets.logo} alt="logoImg" className='h-12'/>
            <div className='h-12'>
              <span className='hidden sm:block font-extrabold text-4xl relative top-1 left-1 text-gray-50'>PQ</span>
              <span className='hidden sm:block font-extrabold text-xs relative left-1.5 tracking-[7px] uppercase'>Restaurant</span>
              </div>
          </Link>
        </div>

      {/* NAVBAR */}
  <div className='flex justify-center items-center flex-1'>
        <Navbar setMenuOpened={setMenuOpened} containerStyles={`
          ${menuOpened 
            ? "flex flex-col gap-y-8 fixed top-16 right-6 p-5 bg-white shadow-md w-52 ring-1 ring-slate-900/5 z-50 items-start" 
          : "hidden lg:flex gap-x-5 xl:gap-x-1 p-1 items-center"}`}/>
      </div>

      {/* BUTTONS & PROFILE */}
  <div className='flex flex-1 items-center sm:justify-end gap-x-4 sm:gap-x-8'>
          {/* MENU TOGGLE */}
  <div className='relative lg:hidden w-7 h-6'>
          <img onClick={toggleMenu} src={myAssets.menu} alt="" 
          className={`absolute inset-0 lg:hidden cursor-pointer transition-opacity duration-700 
          ${menuOpened ? "opacity-0" : "opacity-100"}`}/>
          <img onClick={toggleMenu} src={myAssets.menu_close} alt="" width={29}
          className={`absolute inset-0 lg:hidden cursor-pointer transition-opacity duration-700 
          ${menuOpened ? "opacity-100" : "opacity-0"}`}/>
        </div>

        {/* CART */}
        <div onClick={()=>navigate('/cart')} className='relative cursor-pointer'>
          <img src={myAssets.cart_added} alt="" className='min-w-[44px] bg-white rounded-full p-2'/>
          <label className="absolute bottom-10 right-1 text-xs font-bold 
          bg-solidOne text-white flex justify-center items-center rounded-full w-9">
          {getCartCount()}
            </label>
        </div>

        {/* USER PROFILE */}
        <div>
          <button onClick={()=>{
                navigate("/login-form")}} className='px-6 py-3 active:scale-95 transition bg-solid border-gray-500/20 text-black text-sm font-medium rounded-full cursor-pointer flex justify-center items-center gap-2'>
          Login
          <img src={myAssets.user} alt="" />
        </button>
        </div>
        {/* <div>
          {user ? (
            <UserButton
            appearance={{
              elements:{
                userButtonAvatarBox:{
                  width:"42px",
                  height:"42px",
                },
              },
            }}>
              <UserButton.MenuItems>
              <UserButton.Action 
              label='My Orders'
              labelIcon={<OrdersIcon />}
              onClick={()=>navigate('/my-orders')}
              />
              </UserButton.MenuItems>
            </UserButton>
          ) : (
          <button onClick={openSignIn} className='px-6 py-3 active:scale-95 transition bg-solid border-gray-500/20 text-black text-sm font-medium rounded-full cursor-pointer flex justify-center items-center gap-2'>
          Login
          <img src={myAssets.user} alt="" />
        </button>
          )}
        </div> */}

      </div>
    </div>

    </header>
    
  )
}

export default Header
