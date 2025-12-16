import React, {useState, useEffect} from 'react'
import { myAssets } from '../assets/assets'
import ProductService from '../services/ProductService'; 
import { useUserContext } from '../context/UserContext'
import { toast } from 'react-toastify';

const CartItem = ({cart, onSelectChange, isSelected}) => {

    const{formatCurrency, updateQuantity, removeFromCart, navigate}=useUserContext();
    const [product, setProduct]=useState([]);
    let subtotal = cart.totalMoney ;
    
    useEffect(() => {
        const fetchProducts = async () => {

            try {
                // Gọi API chỉ với Category và Keyword
                const response = await ProductService.getProductById(cart.productId);
                const productListResponse = response.result;
                setProduct(productListResponse);
            } catch (err) {
                toast.error("Không thể tải sản phẩm trong giỏ hàng. Vui lòng thử lại.");
                setProduct([]);
            }

        };
        fetchProducts();
    },[cart.productId]);

    // Hàm xử lý khi checkbox của sản phẩm này thay đổi
    const handleCheckboxChange = (e) => {
        onSelectChange(cart.id, e.target.checked);
    };

      // Tăng số lượng
    const increment = () => {
        // Gọi hàm updateQuantity trong Context (sẽ gọi CartService.updateItemQuantity)
        updateQuantity(cart.id, cart.quantity + 1);
    };

    // Giảm số lượng
    const decrement = () => {
        if (cart.quantity > 1) {
            // Gọi hàm updateQuantity trong Context
            updateQuantity(cart.id, cart.quantity - 1);
        } else {
          handleRemove(cart.id);
        }
    };

    // Xóa một mục khỏi giỏ hàng (Gọi API)
    const handleRemove = () => {
        // Gọi hàm removeFromCart trong Context (sẽ gọi CartService.deleteItemFromCart)
      if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?")) {
          removeFromCart(cart.id);
      }
    };

    return(
    <div className='grid grid-cols-[1fr_6fr_2fr_1fr] md:grid-cols-[1fr_6fr_2fr_1fr] items-center bg-white px-3 py-3 rounded-xl shadow-sm gap-3'>
        <div className='flex justify-center'>
            <input 
            type="checkbox" 
            checked={isSelected}
            onChange={handleCheckboxChange}
            className='h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary'
            />
        </div>
        <div className='flex items-center md:gap-6 gap-3'>
        <div className='flex bg-primary rounded-xl overflow-hidden'>
            <img 
            src={myAssets[product.productImage]} 
            alt="productImg" 
            onClick={()=>{navigate(`/product-details/${product.id}`)}}
            className='w-20 h-20 object-cover cursor-pointer' />
        </div>
        <div>
            <h5 className='line-clamp-1 text-gray-900 font-semibold text-sm md:text-base'>{product.name}</h5>
            <div className='bold-14 flexStart gap-2 mb-1 text-gray-700 text-xs md:text-sm'>Size: <p>{cart.size}</p></div>
            <div className='flexBetween'>
            <div className='flex items-center right-1 ring-slate-900/15 
            rounded-full overflow-hidden bg-primary'>
                <button onClick={()=>decrement(cart.id, cart.quantity)} 
                className='p-1.5 bg-solid text-white rounded-full shadow-md m-0.5 cursor-pointer'>
                <img src={myAssets.minus} alt="" width={11}
                className='invert' />
                </button>
                <p className='px-2'>{cart.quantity}</p>
                <button onClick={()=>increment()} 
                className='p-1.5 bg-solid text-white rounded-full shadow-md m-0.5 cursor-pointer'>
                <img src={myAssets.plus} alt="" width={11}
                className='invert' />
                </button>
            </div>
            </div>
        </div>
        </div>
        <div className='text-center text-[17px] font-semibold text-black'>
        {formatCurrency(subtotal)}
        </div>
        <button onClick={()=>handleRemove()}
        className='cursor-pointer mx-auto'>
            <img src={myAssets.cart_remove} alt="" width={22} />
        </button>
    </div>
    );

}

export default CartItem
