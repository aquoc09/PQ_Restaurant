import React, {useState} from 'react'
import { myAssets } from '../assets/assets'
import { useUserContext } from '../context/UserContext';


const Items = ({product}) => {

const[size, setSize]=useState(product.prices[0]?.size || "");
const[price, setPrice] = useState(product.prices[0]?.price || 0);
const {currency, addToCart}=useUserContext();
const imageSrc = myAssets[product.productImage];
const formatCurrency = (value) => {
    if (typeof value !== "number" || isNaN(value)) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0, // Không hiển thị số lẻ
    }).format(value);
  };
// const imageSrc = product.productImage;

  return (
        <div className='relative mt-24 group'>
      {/* Photo */}
            <div className='mx-auto rounded-full absolute left-0 right-0 -top-20 h-[177px] w-[177px]'>
        <img 
        src={imageSrc} 
        alt="productImg" 
        height={177} 
        width={177}
        className='absolute inset-0 h-full w-full object-cover opacity-100 group-hover:opacity-0 drop-shadow-md rounded-full'/>
        <img src={imageSrc ? imageSrc:imageSrc} 
        alt="productImg" 
        height={177} 
        width={177}
        className='absolute inset-0 h-full w-full object-cover opacity-100 group-hover:opacity-100 drop-shadow-md'/>
      </div>
      {/* Info */}
      <div className='rounded-3xl bg-primary pt-20 overflow-hidden'>
        {/* Title */}
        <div className='p-3'>
            <h4 className='text-lg line-clamp-1 mb-1 text-gray-950'>{product.name}</h4>
            <div className='flex items-start justify-between pb-1'>
                <h5 className='mb-1'>{product.categoryCode}</h5>
            <div className='flex items-center justify-start gap-x-1'>
                <h5 className='text-red-600'>5</h5>
                <img src={myAssets.star} alt="" width={16} />
            </div>
            </div>
        </div>
        {/* Product Size */}
        <div className='flex justify-between items-center p-3 pt-0'>
            <div className='flex gap-2 items-center'>
                {product.prices.map((item,i)=>(
                    <button 
                        key={i}
                        onClick={()=>{
                            setSize(item.size)
                            setPrice(item.price)
                        }}
                        className={`${item.size === size 
                                ? 'bg-textColor border border-gray-300 text-black' 
                                : 'border border-gray-200 text-black'
                            } rounded-full h-6 w-6 p-0 text-xs flex items-center justify-center`
                        }
                    >
                    {item.size}
                    </button>
                ))}
            </div>
            <h4 className='text-red-700'>{formatCurrency(price)}</h4>
        </div>
        {/* Order Info & Cart Add */}
        <div className='flex justify-between items-center rounded-xl pl-5 text-[13px] font-semibold'>
            <div className='flex items-center gap-5'>
                <div>
                    <h5 className='flex flex-col gap-l relative bottom-1.5 text-black'>Prep</h5>
                    <p className="text-xs">5m</p>
                </div>
                <hr className='h-8 w-[1px] bg-tertiary/10 border-none'/>
                <div>
                    <h5 className='flex flex-col gap-l relative bottom-1.5 text-black'>Cook</h5>
                    <p className="text-xs">20m</p>
                </div>
            </div>
            <div className='flex flex-col gap-1'>
                <button onClick={()=>addToCart(product.id,size)}
                className='px-3 py-3 bg-solid border border-gray-500/20 text-black text-sm font-medium rounded-full cursor-pointer flex items-center justify-center'>
                    <img src={myAssets.cart_add} alt="" width={20} />
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Items
