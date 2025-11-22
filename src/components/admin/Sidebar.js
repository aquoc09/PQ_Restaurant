import React, { useEffect } from 'react'
// import { useUserContext } from '../../context/UserContext';

import { myAssets } from '../../assets/assets';
import { useNavigate, Link, NavLink, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
// import AdminNavbar from './Navbar';
import AdminButton from './AdminButton'
// import {UserButton} from "@clerk"

function Sidebar() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const navItems = [
    {
      path:"/admin",
      label:"Dashboard",
      icon: myAssets.dashboard,
    },
    {
      path:"/admin/list-user",
      label:"List User",
      icon: myAssets.list,
    },
    {
      path:"/admin/list-product",
      label:"List Product",
      icon: myAssets.list,
    },
    {
      path:"/admin/list-category",
      label:"List Category",
      icon: myAssets.list,
    },
    {
      path:"/admin/list-promotion",
      label:"List Promotion",
      icon: myAssets.list,
    },
    {
      path:"/admin/list-banner",
      label:"List Banner",
      icon: myAssets.list,
    },
    {
      path:"/admin/list-about",
      label:"List About",
      icon: myAssets.list,
    },
    {
      path:"/admin/list-comment",
      label:"List Comment",
      icon: myAssets.list,
    },
    {
      path:"/admin/list-blog",
      label:"List Blog",
      icon: myAssets.list,
    },
    
  ];

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, navigate]);


  return (
    <div >
      <div className='mx-auto max-w-[1440px] flex flex-col md:flex-row bg-white'>

        {/* Mobile Navbar */}
        <div className='md:hidden w-full bg-primary shadow-xl rounded-b-xl'>
          
          {/* A. Logo và User Info (Hàng trên cùng) */}

          <div className='flex justify-between items-center p-3'>
            {/* Logo */}
            <Link to={'/'} className='flex items-end'>
              <img src={myAssets.logo} alt="logoImg" className='h-12' />
              <div className='h-12'>
                <span className='font-extrabold text-2xl relative top-1 left-1 text-gray-50'>PQ</span>
                <span className='font-extrabold text-xs relative left-1 tracking-[5px] uppercase'>Restaurant</span>
              </div>
            </Link>
            {/* User Info (Admin Avatar) */}
            <div className='flex items-center gap-2 text-white'>
              {/* Giả định AdminButton chứa Avatar/Admin Name */}
              <AdminButton /> 
            </div>
          </div>

          {/* B. Menu Ngang (Hàng thứ hai) */}
          <div className='flex overflow-x-auto gap-x-1 p-2'>
            {navItems.map((link) => (
              <NavLink
                key={link.label}
                to={link.path}
                end={link.path === "/admin"}
                className={({ isActive }) =>
                  isActive
                    ? "flex-shrink-0 text-center p-3 text-[13px] font-bold cursor-pointer h-10 bg-solid/10 max-md:border-b-4 md:border-r-4 border-solid" // Màu đỏ tương ứng hình bên phải
                    : "flex-shrink-0 text-center p-3 text-[13px] font-bold cursor-pointer h-10 rounded-md"
                }
              >
                <div>{link.label}</div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Full Screen */}
        <div className='hidden md:flex flex-col bg-primary sm:m-3 md:min-w-[20%] md:min-h-[97vh] rounded-xl shadow'>
          {/* A. Logo */}
          <div className='flex flex-col'>
              <div className='flex flex-1 p-3 lg:pl-12'>
                <Link to={'/'} className='flex items-end'>
                  <img src={myAssets.logo} alt="logoImg" className='h-12'/>
                  <div className='h-12'>
                    <span className='hidden sm:block font-extrabold text-4xl relative top-1 left-1 text-gray-50'>PQ</span>
                    <span className='hidden sm:block font-extrabold text-xs relative left-1.5 tracking-[7px] uppercase'>Restaurant</span>
                  </div>
                </Link>
              </div>

              {/* User */}
              <div className='flex items-center gap-3 p-3 pl-6 mt-4'>
                {/* <AdminNavbar /> */}
                <AdminButton />
              </div>
              <div className='mt-2 border-t border-gray-200'></div>
            </div>

            <div className='flex md:flex-col md:gap-x-5 gap-y-8 md:mt-4 '>
              {navItems.map((link) => 
              (
                 <NavLink
                   key={link.label}
                   to={link.path}
                   end={link.path === "/admin"}
                   className={({isActive}) =>
                     isActive
                       ? "flexStart gap-x-2 p-5 lg:pl-12 text-[13px] font-bold sm:!text-sm cursor-pointer h-10 bg-solid/10 max-md:border-b-4 md:border-r-4 border-solid"
                       : "flexStart gap-x-2 p-5 lg:pl-12 text-[13px] font-bold sm:!text-sm cursor-pointer h-10 rounded-xl"
                   }
                 >
                   <img src={link.icon} alt={link.label} className='hidden md:block' width={18} />
                   <div>{link.label}</div>
                 </NavLink>
              ))}
            </div>
          </div>


        {/* Right Side */}
        <Outlet />
      </div>
    </div>
    
  )
}

export default Sidebar
