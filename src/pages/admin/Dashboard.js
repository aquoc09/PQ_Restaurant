import React, { useEffect, useState } from 'react'
import { useUserContext } from '../../context/UserContext';
import { myAssets, dashboardData, dummyOrdersData } from '../../assets/assets';
function Dashboard() {

  const {isAdmin, currency}=useUserContext();
  const [dashBoardData, setDashboardData]=useState({
    orders:[],
    totalOrders:0,
    totalRevenue:0,
  })

  const getDashboardData=()=>{
    setDashboardData(dashboardData);
  }

  useEffect(()=>{
    if(isAdmin){
      getDashboardData();
    }
}, [isAdmin])

  return (
    <div>
      <div>
        <div>
          <img src={myAssets.graph} alt="" className="hidden sm:flex w-8" />
          <div>
            <h4>{dashBoardData?.totalOrders?.toString().padStart(2,"0")}</h4>
            <h5 className='text-solid'>Total Sales</h5>
          </div>
        </div>
        <div>
          <img src={myAssets.dollar} alt="" className="hidden sm:flex w-8" />
          <div>
            <h4>{dashBoardData?.totalRevenue?.toFixed(2 || 0)}</h4>
            <h5 className='text-solid'>Total Earning</h5>
          </div>
        </div>
      </div>
      {/* All Orders */}
      <div>
        {dummyOrdersData.map((order)=>(
        <div key={order._id} className='bg-white p-2 mt-3 rounded-2xl'>
          <div className='flex flex-wrap gap-8 gap-y-3 mb-3'>
            {/* Order Items */}
             {order.items.map((item,idx)=>(
              <div key={idx} className='text-gray-700 w-full lg:w-1/3'>
                <div className='flex flex-[2] gap-x-3'>
                  <div className='flexCenter bg-primary rounded-xl'>
                    <img src={item.product.img[0]} alt="" className='max-h-20 max-w-20 object-contain' />
                  </div>
                  <div className='block w-full'>
                    <h5 className='uppercase line-clamp-1'>{item.product.title}</h5>
                    <div className='flex flex-wrap gap-3 max-sm:gap-y-1 mt-1'>
                    <div className='flex items-center gap-x-2'>
                      <h5 className='text-sm font-medium'>Price:</h5>
                      <p>
                        {item.product.price[item.size]}
                        {currency}
                      </p>
                    </div>
                    <div className='flex items-center gap-x-2'>
                      <h5 className='text-sm font-medium'>Quantity:</h5>
                      <p>
                        {item.quantity}
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
                <div className='flex items-center gap-x-2'>
                  <h5 className='text-sm font-medium'>OrderId:</h5>
                  <p className='text-gray-400 text-sm break-all'>
                        {order._id}
                  </p>
                </div>
                <div className='flex gap-4'>
                  <div className='flex items-center gap-x-2'>
                    <h5 className='text-sm font-medium'>Customer:</h5>
                    <p className='text-gray-400 text-sm break-all'>
                          {order.address.firstName} {order.address.lastName}
                    </p>
                    <div className='flex items-center gap-x-2'>
                      <h5 className='text-sm font-medium'>Phone:</h5>
                      <p className='text-gray-400 text-sm'>
                            {order.address.phone}
                      </p>
                    </div>
                </div>
                </div>
                <div className='flex gap-4'>
                  <div className='flex items-center gap-x-2'>
                    <h5 className='text-sm font-medium'>Address:</h5>
                    <p className='text-gray-400 text-sm break-all'>
                          {order.address.street}, {order.address.city}
                    </p>
                </div>
                </div>
                <div className='flex gap-4'>
                  <div className='flex items-center gap-x-2'>
                    <h5 className='text-sm font-medium'>Payment Status:</h5>
                    <p className='text-gray-400 text-sm break-all'>
                          {order.isPaid ? "Done" : "Pending"}
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
                          {new Date(order.createdAt).toDateString()}
                    </p>
                  </div>
                    <div className='flex items-center gap-x-2'>
                      <h5 className='text-sm font-medium'>Amount:</h5>
                      <p className='text-gray-400 text-sm'>
                            {order.amount}{currency}
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
                    <button className='btn-solid !py-1 !text-xs rounded-sm'>Track Order</button>
                </div>
            </div>
        </div>
       ))}
      </div>
    </div>
  )
}

export default Dashboard
