import React, {useState, useEffect} from 'react'
import { Link, useLocation } from 'react-router-dom'
import { myAssets } from '../assets/assets'
import Navbar from './Navbar'
import { useUserContext } from '../context/UserContext'
import useAuth from '../hooks/useAuth'
import UserButton from './UserButton'
import AdminButton from './AdminButton'
import ManagerButton from './ManagerButton'
import MiniCartItem from './MiniCartItem'
import CartService from '../services/CartService'

const Header = () => {

  const [menuOpened, setMenuOpened] = useState(false);

  const toggleMenu = ()=>setMenuOpened(prev => !prev);
  const {isUser, isAdmin, isManager} = useAuth();

  // const {openSignIn}=useClerk();
  const [isCartHovered, setIsCartHovered] = useState(false);
  const {navigate, getCartCount, formatCurrency, getCartAmount}=useUserContext();
  const isHomePage=useLocation().pathname.endsWith('/');
  const [cartItems, setCartItems] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);

  //Lắng nghe sự kiện cuộn
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  useEffect(() => {
    const fetchCartData = async () => {
        if(isUser()){
            try {
                const response = await CartService.getCart();
                const newCartData = response.result;
                if (newCartData && Array.isArray(newCartData.cartItems)) {
                    setCartItems(newCartData.cartItems);
                }
            } catch (error) {
                console.error("Lỗi fetch cart header:", error);
            }
        }
    };
    
    fetchCartData();
  }, [getCartCount, isUser]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHomePage ? 'bg-white shadow-md py-2' : 'bg-transparent py-3'}`}>
      {/* CONTAINER */}
      <div className='max-padd-container flexBetween'>
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

        <div 
            className='relative cursor-pointer group py-2' // Thêm group và py-2 để vùng hover rộng hơn
            onMouseEnter={() => setIsCartHovered(true)}
            onMouseLeave={() => setIsCartHovered(false)}
        >
          {/* CART */}
          <div onClick={()=>navigate('/cart')} className='relative cursor-pointer'>
            <img src={myAssets.cart_added} alt="" className='min-w-[44px] bg-white rounded-full p-2'/>
            <label className="absolute bottom-10 right-1 text-xs font-bold 
            bg-solid text-white flex justify-center items-center rounded-full w-9">
            {getCartCount}
              </label>
          </div>

            {/* --- DROPDOWN CART PREVIEW --- */}
            {isCartHovered && cartItems.length > 0 && (
                <div className="absolute top-full right-0 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60] animate-fade-in-up origin-top-right">
                    <div className="p-3 bg-slate-50 border-b border-gray-100">
                        <h5 className="font-semibold text-gray-700">Giỏ hàng ({getCartCount})</h5>
                    </div>
                    
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-2">
                        {/* Chỉ lấy 5 item đầu tiên */}
                        {cartItems.slice(0, 5).map((item) => (
                            <MiniCartItem 
                                key={item.id} 
                                cart={item} 
                                formatCurrency={formatCurrency}
                            />
                        ))}
                        {cartItems.length > 5 && (
                            <div className="text-center text-xs text-gray-500 py-2 italic">
                                Và {cartItems.length - 5} món khác...
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-white">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-gray-600 font-medium text-sm">Tổng cộng:</h5>
                        <h5 className="text-lg font-bold text-red-600">
                          {formatCurrency(getCartAmount)}
                        </h5>
                      </div>
                      <button 
                          onClick={()=>navigate('/cart')}
                          className="w-full py-2 bg-solid text-white rounded-lg font-semibold text-sm hover:opacity-90 transition shadow-md"
                      >
                          Xem giỏ hàng
                      </button>
                    </div>
                </div>
            )}
        </div>

        {/* USER PROFILE */}
        
        <div>
          {(isUser() === true)  ? ( <UserButton /> 
          ) : (
            isAdmin() === true
          ) ? (
            <AdminButton />
          ) : (
            isManager() === true
          ) ? (
            <ManagerButton />
          ) : (
              <div>
                <button 
                  onClick={()=>{navigate("/login")}} 
                  className='px-6 py-3 active:scale-95 transition bg-solid border-gray-500/20 text-black text-sm font-medium rounded-full cursor-pointer flex justify-center items-center gap-2'>
                  Login
                  <img src={myAssets.user} alt="" />
                </button>
              </div>
            )
          }
          
        </div>
      </div>
    </div>

    </header>
    
  )
}

export default Header
