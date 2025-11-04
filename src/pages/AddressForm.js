import React, {useEffect,useState} from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { useUserContext } from '../context/UserContext'
import toast from 'react-hot-toast'

const AddressForm = () => {

  const {navigate, user}= useUserContext();
  const [address, setAddress]=useState({
    firstName:"",
    lastName:"",
    email:"",
    street:"",
    city:"",
    zipCode:"",
    phone:"",
})

const onChangeHadler=(e)=>{
  const name=e.target.name;
  const value=e.target.value;
  setAddress((data)=>({...data, [name]:value}));
}

useEffect(()=>{
  if(!user){
    navigate('/cart')
  }
},[])


  return (
    <div className='max-padd-container py-16 pt-28 bg-primary'>
      {/* CONTAINER */}
      <div className='flex flex-col xl:flex-row gap-20 xl:gap-28'>
        {/* Left Side */}
        <form className='flex flex-[2] flex-col gap-3 text-[95%]'>
          <Title title1={"Delivery"} title2={"Information"} titleStyles={"pb-5"} />
          <div className='flex gap-3'>
            <input onChange={onChangeHadler} value={address.firstName}
            name='firstName' type='text' placeholder='First Name' 
            className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-white outline-none w-1/2' />

            <input onChange={onChangeHadler} value={address.lastName}
            name='lastName' type='text' placeholder='Last Name' 
            className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-white outline-none w-1/2' />
            </div>

            <input onChange={onChangeHadler} value={address.email}
            name='email' type='email' placeholder='Email' 
            className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-white outline-none' />
            <input onChange={onChangeHadler} value={address.phone}
            name='phone' type='text' placeholder='Phone' 
            className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-white outline-none' />
            <input onChange={onChangeHadler} value={address.street}
            name='street' type='text' placeholder='Street' 
            className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-white outline-none' />

            <div className='flex gap-3'>
            <input onChange={onChangeHadler} value={address.city}
            name='city' type='text' placeholder='City' 
            className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-white outline-none w-1/2' />

            <input onChange={onChangeHadler} value={address.zipCode}
            name='zipCode' type='text' placeholder='Zip Code' 
            className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-white outline-none w-1/2' />
            </div>

            <button type='submit' className='btn-solid rounded-md w-1/2 mt-2'>Add Address</button>
        </form>
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

export default AddressForm
