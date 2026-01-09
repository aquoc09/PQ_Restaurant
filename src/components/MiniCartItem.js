import React, { useState, useEffect } from 'react';
import ProductService from '../services/ProductService';
import { myAssets } from '../assets/assets';
import { useUserContext } from '../context/UserContext'

const MiniCartItem = ({ cart, formatCurrency }) => {
  const [product, setProduct] = useState(null);
  const { navigate }=useUserContext();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await ProductService.getProductById(cart.productId);
        setProduct(response.result);
      } catch (error) {
        console.error("Lỗi tải sản phẩm mini cart", error);
      }
    };
    if (cart.productId) fetchProduct();
  }, [cart.productId]);

  if (!product) return <div className="p-2 text-xs text-gray-400">Loading...</div>;

  return (
    <div className="flex gap-3 items-center border-b border-gray-100 py-2 last:border-0">
      <img
        src={myAssets[product.productImage]}
        alt={product.name}
        onClick={()=>{navigate(`/product-details/${product.id}`)}}
        className="w-12 h-12 rounded object-cover border border-gray-200 hover:cursor-pointer"
      />
      <div className="flex-1 overflow-hidden">
        <h4 
        onClick={()=>{navigate(`/product-details/${product.id}`)}}
        className="text-sm font-semibold text-gray-800 truncate hover:text-blue-600">{product.name}</h4>
        <div className="flex justify-between items-center mt-1">
          <h5 className="text-xs text-gray-500">Size: {cart.size}</h5>
          <h5 className="text-xs font-bold text-gray-50">
            {cart.quantity} x {formatCurrency ? formatCurrency(cart.totalMoney/cart.quantity) : cart.totalMoney}
          </h5>
        </div>
      </div>
      
    </div>
  );
};

export default MiniCartItem;