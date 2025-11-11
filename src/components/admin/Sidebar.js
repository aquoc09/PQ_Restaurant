import React, { useEffect } from 'react'
import { useUserContext } from '../../context/UserContext';
import { myAssets } from '../../assets/assets';
import { Link, NavLink, Outlet } from 'react-router-dom';
// import AdminNavbar from './Navbar';
import AdminButton from './AdminButton'
// import {UserButton} from "@clerk"

function Sidebar() {
  const {navigate, isAdmin} = useUserContext();

  const navItems = [
    {
      path:"/admin",
      label:"Dashboard",
      icon: myAssets.dashboard,
    },
    {
      path:"/admin/add-product",
      label:"Add Product",
      icon: myAssets.square_plus,
    },
    {
      path:"/admin/list-product",
      label:"List Product",
      icon: myAssets.list,
    }
  ];

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);


  return (
    <div >
      <div className='mx-auto max-w-[1440px] flex flex-col md:flex-row bg-white'>
        {/* SideBar */}
        <div className='max-md:flexCenter flex flex-col bg-primary sm:m-3 md:min-w-[20%] md:min-h-[97vh] rounded-xl shadow'>
          <div className='flex flex-col gap-y-6 max-md:items-center md:flex-col md:pt-5'>
            <div className='w-full flex justify-between md:flex-col'>
              {/* Logo */}
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
              <div className='md:hidden flex items-center gap-3 md:bg-primary rounded-b-xl p-2 pl-5 lg:pl-10 md:mt-10'>
                {/* <AdminNavbar /> */}
                <AdminButton />
              </div>
            </div>
            <div className='flex md:flex-col md:gap-x-5 gap-y-8 md:mt-4'>
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
          <div className='hidden md:flex items-center gap-3 md:bg-primary rounded-b-xl p-2 pl-5 lg:pl-10 md:mt-10 border-t border-slate-900/15'>
            {/* <AdminNavbar /> */}
            <AdminButton />
          </div>
        </div>
        {/* Right Side */}
        <Outlet />
      </div>
    </div>
    
  )
}

export default Sidebar
