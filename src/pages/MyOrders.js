import React, {useEffect, useState, useCallback} from 'react'
import Title from '../components/Title'
import { useUserContext } from '../context/UserContext'
import { myAssets } from '../assets/assets'
import OrderService from '../services/OrderSevice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyOrders = () => {

  const {formatCurrency, isUser}=useUserContext();
  const [orders, setOrders]=useState([]);

  const fetchMyOrders = useCallback(async () => {

    try {
      const data = await OrderService.getOrdersByCurrentUser();
      
      setOrders(data.result); 
      console.log("Orders loaded for current user:", data);
    } catch (err) {
      toast.error("Error fetching current user's orders:", err);
      setOrders([]);
    } finally {
      
    }
  }, []);

  const loadOrderData = useCallback(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  useEffect(()=>{
      fetchMyOrders();
  },[fetchMyOrders]);
  
  return (
    <div className='max-padd-container py-16 pt-28 bg-primary'>
      <Title 
      title1={"My"}
      title2={"Orders List"}
      title1Styles={"items-start pb-5"}
      paraStyles={"hidden"}
      />
      {orders.length === 0 ? (
        <div className='text-center py-10'>
          <p className='text-xl font-semibold text-gray-600'>You haven't placed any orders yet.</p>
          <p className='text-gray-500 mt-2'>Start shopping to see your orders here!</p>
        </div>
      ) : (
        orders.map((order)=>(
        <div key={order.id} className='bg-white p-2 mt-3 rounded-2xl'>
          <div className='flex flex-wrap gap-8 gap-y-3 mb-3'>
            {/* Order Items */}
            {order.orderDetails.map((item,idx)=>(
              <div key={idx} className='text-gray-700 w-full lg:w-1/3'>
                <div className='flex flex-[2] gap-x-3'>
                  <div className='flexCenter bg-primary rounded-xl'>
                    <img src={myAssets[item.product.productImage]} alt="" className='max-h-20 max-w-20 object-contain' />
                  </div>
                  <div className='block w-full'>
                    <h5 className='uppercase line-clamp-1'>{item.product.name}</h5>
                    <div className='flex flex-wrap gap-3 max-sm:gap-y-1 mt-1'>
                    <div className='flex items-center gap-x-2'>
                      <h5 className='text-sm font-medium'>Price:</h5>
                      <p>
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className='flex items-center gap-x-2'>
                      <h5 className='text-sm font-medium'>Quantity:</h5>
                      <p>
                        {item.numProducts}
                      </p>
                    </div>
                    <div className='flex items-center gap-x-2'>
                      <h5 className='text-sm font-medium'>Size:</h5>
                      <p>
                        {item.size}
                      </p>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
            {/* Order Summary */}
            <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-t border-gray-300 pt-3'>
              <div className='flex flex-col gap-2'>
                <div className='flex gap-4'>
                  <div className='flex items-center gap-x-2'>
                    <h5 className='text-sm font-medium'>Customer Name:</h5>
                    <p className='text-gray-400 text-sm break-all'>
                          {order.address.user.fullName}
                    </p>
                  </div>
                  <div className='flex items-center gap-x-2'>
                    <h5 className='text-sm font-medium'>Phone:</h5>
                    <p className='text-gray-400 text-sm break-all'>
                          {order.address.phoneNumber}
                    </p>
                  </div>
                </div>
                <div className='flex gap-4'>
                  <div className='flex items-center gap-x-2'>
                    <h5 className='text-sm font-medium'>Shipping Method:</h5>
                    <p className='text-gray-400 text-sm break-all'>
                          {order.shippingMethod}
                    </p>
                    <div className='flex items-center gap-x-2'>
                      <h5 className='text-sm font-medium'>Method:</h5>
                      <p className='text-gray-400 text-sm'>
                            {order.paymentMethod}
                      </p>
                    </div>
                </div>
                </div>

                <div className='flex gap-4'>
                  <div className='flex items-center gap-x-2'>
                    <h5 className='text-sm font-medium'>Date:</h5>
                    <p className='text-gray-400 text-sm '>
                          {new Date(order.orderDate).toDateString()}
                    </p>
                  </div>
                    <div className='flex items-center gap-x-2'>
                      <h5 className='text-sm font-medium'>Amout:</h5>
                      <p className='text-gray-400 text-sm'>
                            {formatCurrency(order.totalMoney)}
                      </p>
                    </div>
                </div>
                </div>

                  <div className='flex gap-3'>
                    <div className='flex items-center gap-x-2'>
                      <h5 className='text-sm font-medium'>Status:</h5>
                      <div className='flex items-center gap-1'>
                        <span className='min-w-2 h-2 rounded-full bg-green-500'></span>
                        <p>{order.status}</p>
                      </div>
                    </div>
                    <button onClick={loadOrderData} className='btn-solid !py-1 !text-xs rounded-sm'>Order Detail</button>
                </div>
            </div>
            <div className='border-t border-gray-100 pt-2 mt-2 text-xs text-gray-500'>
                <h6 className='font-medium'>Shipping Address:</h6>
                <p>
                  {order.address.fullAddress}
                </p> 
                <p>Note: {order.note || 'None'}</p>
            </div>
        </div>
      ))
    )}
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

export default MyOrders
