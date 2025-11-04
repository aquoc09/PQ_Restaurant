import React,{useEffect,useState} from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { useUserContext } from '../context/UserContext'
import { myAssets } from '../assets/assets'

const Cart = () => {

  const{navigate, products, currency, cardItems, updateQuantity}=useUserContext();
  const[cartData,setCartData]=useState([]);


  useEffect(()=>{
    if(products.length>0){
      const tempData=[];
      for(const itemId in cardItems){
        for(const size in cardItems[itemId]){
          if(cardItems[itemId][size]>0){
            tempData.push({
              id:itemId,
              size:size,})
            }
          }
      }
      setCartData(tempData);
    }  
  },[products, cardItems])

  const increment = (id,size) => {
    const currenctQuantity = cardItems[id][size];
    updateQuantity(id,size,currenctQuantity + 1);
  }

  const decrement = (id,size) => {
    const currenctQuantity = cardItems[id][size];
    if(currenctQuantity > 1){
      updateQuantity(id,size,currenctQuantity - 1);
    }
  }


  return products && cardItems ? (
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
            {cartData.map((item,i)=>{
              const productData=products.find((product)=>product.id===item.id);
              const quantity=cardItems[item.id][item.size];
              return(
                <div key={i} className='grid grid-cols-[6fr_2fr_1fr] items-center bg-white p-2
          rounded-xl'>
                  <div className='flex items-center md:gap-6 gap-3'>
                    <div className='flex bg-primary rounded-xl'>
                      <img src={productData.img[0]} alt="productImg" className='w-20' />
                    </div>
                    <div>
                      <h5 className='hidden sm:block line-clamp-1'>{productData.title}</h5>
                      <div className='bold-14 flexStart gap-2 mb-1'>Size: <p>{item.size}</p></div>
                      <div className='flexBetween'>
                        <div className='flex items-center right-1 ring-slate-900/15 
                        rounded-full overflow-hidden bg-primary'>
                          <button onClick={()=>decrement(item.id,item.size)} 
                          className='p-1.5 bg-solid text-white rounded-full shadow-md m-0.5 cursor-pointer'>
                            <img src={myAssets.minus} alt="" width={11}
                            className='invert' />
                          </button>
                          <p className='px-2'>{quantity}</p>
                          <button onClick={()=>increment(item.id,item.size)} 
                          className='p-1.5 bg-solid text-white rounded-full shadow-md m-0.5 cursor-pointer'>
                            <img src={myAssets.plus} alt="" width={11}
                            className='invert' />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='text-center text-[17px] font-semibold text-black'>
                    {productData.price[item.size] * quantity}{currency}
                  </div>
                  <button onClick={()=>updateQuantity(item.id,item.size,0)}
                    className='cursor-pointer mx-auto'>
                      <img src={myAssets.cart_remove} alt="" width={22} />
                    </button>
                  </div>
              );
            })}
        </div>
        {/* Right Side */}
        <div className='flex flex-1 flex-col'>
          <div className='max-w-[379px] w-full bg-white p-5 py-10 max-md:mt-16 rounded-xl'>
            <CartTotal />
          </div>
            </div>
        </div>
    </div>
  ) : null
}

export default Cart
