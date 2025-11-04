import React, {useEffect,useState} from 'react'
import { useUserContext } from '../context/UserContext'
import toast from 'react-hot-toast'

function CartTotal() {

  const {
    navigate,
    currency,
    method,
    setMethod,
    delivery_charges,
    cardItems,
    products,
    getCartCount,
    getCartAmount,
    setCartItems,
    user
  } =useUserContext();

  const[addresses, setAddresses]=useState([]);
  const[showAddress,setShowAddress]=useState(false);
  const[selectedAddress,setSelectedAddress]=useState(null);

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
          <div className='relative flex justify-between items-start mt-2'>
          <p>
          {selectedAddress ? ( `${selectedAddress.address}, ${selectedAddress.city}, 
          ${selectedAddress.state}, ${selectedAddress.zip}` ) : ( "No address found." )}
        </p>
        <button onClick={()=> setShowAddress(!showAddress)}
          className='text-solid tetx-sm font-medium hover:underline cursor-pointer'>Change</button>
          {showAddress && (
            <div className='absolute top-10 py-2 bg-white ring-1 ring-slate-900/10 
            text-sm w-full'>
              {addresses.map((address,i)=>(
                <p key={i} onClick={()=>{
                  setSelectedAddress(address);
                  setShowAddress(false);
                }}
                className='p-2 cursor-pointer hover:bg-gray-100 text-sm font-medium'>
                  {address.address}, {address.city}, {address.state}, {address.zip}
                </p>
              ))}
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
      </div>
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
        <div className='mt-4 space-y-2'>
          <div className='flex justify-between'>
            <h5>Price</h5>
            <p className='font-bold text-black'>{getCartAmount()}{currency}</p>
          </div>
          <div className='flex justify-between'>
            <h5>Shipping Fee</h5>
            <p className='font-bold text-black'>{getCartAmount() === 0 ? "0đ" 
            : `${delivery_charges}đ`}</p>
          </div>
          <div className='flex justify-between'>
            <h5>Tax (8%)</h5>
            <p className='font-bold text-black'>{(getCartAmount() * 8)/100}{currency}</p>
          </div>
          <div className='flex justify-between'>
            <h5>Total Amount</h5>
            <p className='text-lg font-bold text-solid'>{getCartAmount() === 0 ? 
            '0' : getCartAmount() + delivery_charges + (getCartAmount()*8/100)}{currency}</p>
          </div>
        </div>
        <button className='btn-solid w-full mt-8 !rounded-md py-2'>Proceed to Order</button>
    </div>
    
  )
}

export default CartTotal
