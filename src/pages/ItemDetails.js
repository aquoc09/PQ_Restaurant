import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductService from '../services/ProductService'; 
import { useUserContext } from '../context/UserContext'; 
import { myAssets } from '../assets/assets'; 
import Title from '../components/Title'
import RelatedProducts from '../components/RelatedProducts';
import useAuth from '../hooks/useAuth';

function ItemDetails() {
    const { productId } = useParams(); 
    const { addToCart, formatCurrency, navigate } = useUserContext(); 
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState(""); 
    const [quantity, setQuantity] = useState(1);
    const [currentPrice, setCurrentPrice] = useState(0);
    const { 
        isAuthenticated, 
    } = useAuth();

    const fetchProductDetail = useCallback(async () => {
        if (!productId) {
            setLoading(false);
            setError("Product ID is missing.");
            return;
        }
        if(isAuthenticated() === false)
        {
            toast.error("Please login to see");
            setTimeout(() => navigate('/login'), 3000);
        }

        setLoading(true);
        setError(null);
        try {
            const response = await ProductService.getProductById(productId);
            const data = response.result;
            setProduct(data);
            console.log("Fetched product detail:", response.result);

            if (data?.prices && data.prices.length > 0) {
                const defaultSize = data.prices[0];
                setSelectedSize(defaultSize.size);
                setCurrentPrice(defaultSize.price);
            } else {
                setSelectedSize("");
                setCurrentPrice(0);
            }
        } catch (err) {
            console.error("Error fetching product detail:", err);
            setError("Failed to load product details.");
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchProductDetail();
    }, [fetchProductDetail]);

    // THÊM VÀO GIỎ HÀNG 
    const handleAddToCart = () => {

        if (!isAuthenticated) {
            toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
            setTimeout(() => navigate('/login'), 3000);
            return;
        }
        
        if (!product || !selectedSize || quantity < 1 || currentPrice === 0) {
            toast.error("Vui lòng chọn kích cỡ hợp lệ và số lượng.");
            return;
        }

        // Kiểm tra xem addToCart có tồn tại không
        if (addToCart) {
            addToCart(quantity, selectedSize, "", product.id);
        } else {
            toast.error("Chức năng thêm giỏ hàng chưa được thiết lập trong UserContext.");
        }
    };

    if (loading) {
        return (
            <div className='max-padd-container py-16 pt-28 bg-primary text-center'>
                <p className='text-lg font-medium text-gray-700'>Loading product details...</p>
            </div>
        );
    }
    if (error || !product) {
         return (
            <div className='max-padd-container py-16 pt-28 bg-primary text-center'>
                <Title title1={"Product"} title2={"Not Found"} titleStyles={"items-start pb-5"} paraStyles={"hidden"} />
                <p className='text-lg font-medium text-red-500'>{error || "The product you are looking for does not exist."}</p>
            </div>
        );
    }

    const productPrices = product.prices || [];

    return (
        <div className='bg-primary min-h-screen'>
        <div className='max-padd-container py-16 pt-28'>
            <div className='flex flex-col lg:flex-row gap-10 bg-white p-6 rounded-xl shadow-lg'>
                {/* PRODUCT IMAGE */}
                <div className='lg:w-1/2 w-full relative'>
                    {/* {isOutOfStock && (
                         <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl z-10">
                            <span className="text-white text-3xl font-bold p-3 bg-red-600 rounded-lg transform rotate-[-5deg]">Hết hàng</span>
                        </div>
                    )} */}
                    <img 
                        src={myAssets[product.productImage]}
                        alt={product.name}
                        className={`w-full h-auto object-cover rounded-xl shadow-md max-h-[600px] transition-opacity`}
                    />
                </div>

                {/* PRODUCT DETAILS AND ACTIONS */}
                <div className='lg:w-1/2 w-full flex flex-col gap-5'>
                    <nav className='text-sm text-gray-500 mb-2' aria-label="Breadcrumb">
                        <Link to='/' className='text-gray-500 hover:underline'>Home</Link>
                        <span className='mx-2 text-gray-400'>/</span>
                        <Link to='/menu' className='text-gray-500 hover:underline'>Menu</Link>
                        <span className='mx-2 text-gray-400'>/</span>
                        <span className='text-gray-500'>{product.name}</span>
                    </nav>
                    <h1 className='text-4xl font-extrabold text-gray-900'>{product.name}</h1>
                    
                    <div className='border-t border-b py-4 border-gray-200'>
                        {currentPrice > 0 ? (
                            <p className='text-3xl font-bold text-red-600'>
                                {/* Định dạng giá */}
                                {formatCurrency(currentPrice)}
                            </p>
                        ) : (
                            <p className='text-2xl font-bold text-gray-500'>Chọn kích cỡ để xem giá</p>
                        )}
                        
                        <p className='text-sm text-gray-500 mt-1'>
                            Price is not include VAT
                        </p>
                    </div>

                    {/* DETAILS/DESCRIPTION */}
                    <div className='text-gray-700'>
                         <h3 className='font-semibold mb-2'>Details:</h3>
                         <p className='text-sm leading-relaxed'>Mã sản phẩm: {product.productCode}</p>
                         <p className='text-sm leading-relaxed'>Tình trạng: {product.inStock ? 'Còn hàng' : 'Hết hàng'}</p>
                    </div>

                    {/* (SIZE & QUANTITY) */}
                    <div className='flex flex-col gap-4 border-t pt-4'>
                        
                        {/* SIZE SELECTION */}
                        <div className='flex items-center gap-4'>
                            <h4 className='font-medium text-gray-700'>Size:</h4>
                            <div className='flex gap-3'>
                                {productPrices.map(item => (
                                    <button
                                        key={item.size}
                                        onClick={() => {
                                            setSelectedSize(item.size);
                                            setCurrentPrice(item.price);}}
                                        className={`px-5 py-2 text-base font-semibold rounded-lg border transition-colors 
                                            ${selectedSize === item.size 
                                                ? 'bg-red-600 text-white border-red-600 shadow-md' 
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-red-400'
                                            }
                                            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400
                                        `}
                                        title={formatCurrency(item.price)}
                                    >
                                        {item.size.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* QUANTITY SELECTION */}
                        <div className='flex items-center gap-4'>
                            <h4 className='font-medium text-gray-700'>Quantity:</h4>
                            <div className='flex items-center border border-gray-300 rounded-full overflow-hidden'>
                                {/* Nút Giảm */}
                                <button
                                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                    disabled={quantity <= 1}
                                    className='px-4 py-2 hover:bg-gray-100 disabled:opacity-50 transition'
                                >
                                    <img src={myAssets.minus} alt="Decrease" className='w-4 h-4'/>
                                </button>
                                
                                {/* Input hiển thị số lượng */}
                                <input
                                    type="text"
                                    value={quantity}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        if (isNaN(value) || value < 1) { setQuantity(1); } 
                                        else { setQuantity(value); }
                                    }}
                                    disabled={true}
                                    className='w-10 text-center border-x border-gray-300 text-gray-800 focus:outline-none'
                                />

                                {/* Nút Tăng */}
                                <button
                                    onClick={() => {
                                        setQuantity(prev => {
                                            const newQty = prev + 1;
                                            return newQty;
                                        });
                                    }}
                                    
                                    className='px-4 py-2 hover:bg-gray-100 disabled:opacity-50 transition'
                                >
                                    <img src={myAssets.plus} alt="Increase" className='w-4 h-4'/>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className='flex gap-4 mt-5'>
                        <button 
                            onClick={handleAddToCart}
                           
                            className='text-white btn-solid flex items-center justify-center gap-2 flex-1 !py-3 !text-lg disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            <img src={myAssets.cart_add} alt="Thêm vào giỏ hàng" className='w-4 h-4'/>
                            <span>Thêm vào Giỏ hàng</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        {product.categoryId && (
            <div className='bg-white'>
                <RelatedProducts 
                    categoryId={product.categoryId} 
                    currentProductId={product.id} // Truyền ID để lọc
                />
            </div>
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
    
    );
}

export default ItemDetails;