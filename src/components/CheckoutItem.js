import React, { useState, useEffect } from 'react';
import ProductService from '../services/ProductService';
import { myAssets } from '../assets/assets';

const CheckoutItem = ({ item, formatCurrency }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Gọi API để lấy tên và hình ảnh dựa trên productId
                const response = await ProductService.getProductById(item.productId);
                setProduct(response.result);
            } catch (error) {
                console.error("Error fetching product details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (item.productId) {
            fetchProduct();
        }
    }, [item.productId]);

    if (loading) {
        return (
            <div className='flex justify-between items-center py-2 animate-pulse'>
                <div className='flex items-center gap-4'>
                    <div className='w-16 h-16 bg-gray-200 rounded-lg'></div>
                    <div className='h-4 w-32 bg-gray-200 rounded'></div>
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className='flex justify-between items-center py-2 border-b border-gray-50 last:border-0'>
            <div className='flex items-center gap-4'>
                {/* Hiển thị hình ảnh từ assets dựa trên tên file trả về từ API */}
                <img 
                    src={myAssets[product.productImage] || product.productImage} 
                    alt={product.name} 
                    className='w-16 h-16 object-cover rounded-lg' 
                />
                <div>
                    <h5 className='font-semibold text-gray-900'>{product.name}</h5>
                    <div className='flex flex-col text-xs text-gray-500'>
                        <span>Quantity: {item.quantity}</span>
                        <span>Size: {item.size}</span>
                    </div>
                </div>
            </div>
            {/* Giá tiền này lấy từ object item trong Cart (giá tại thời điểm thêm vào giỏ) */}
            <p className='font-bold text-gray-700'>{formatCurrency(item.totalMoney)}</p>
        </div>
    );
};

export default CheckoutItem;