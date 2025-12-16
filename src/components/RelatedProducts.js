import React,  { useState, useEffect, useCallback } from 'react'
import Title from './Title'
import ProductService from '../services/ProductService';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
// import required modules
import { Autoplay } from 'swiper/modules';
import Items from './Items';

function RelatedProducts({ categoryId, currentProductId }) {

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const LIMIT = 10;

  const fetchRelatedProducts = useCallback(async () => {
        if (!categoryId) return;
        setLoading(true);
        try {
          
            const response = await ProductService.getProducts(
                '', 
                categoryId, 
                0, 
                LIMIT + 1 
            );
            const data = Array.isArray(response.result?.products) ? response.result.products : [];
            

            const filteredProducts = data
                .filter(p => p.id !== currentProductId) 
                .slice(0, LIMIT); 

            setRelatedProducts(filteredProducts);
        } catch (error) {
            console.error("Failed to load related products:", error);
            setRelatedProducts([]);
        } finally {
            setLoading(false);
        }
    }, [categoryId, currentProductId]);

    useEffect(() => {
        fetchRelatedProducts();
    }, [fetchRelatedProducts]);

    if (loading) {
        return <p className="text-center py-10 text-gray-600">Loading related products...</p>;
    }

    if (relatedProducts.length === 0) {
        return null; // Không hiển thị section nếu không có sản phẩm liên quan
    }

  return (
    <section className='max-padd-container py-20 xl:py-28 bg-white'>
      <Title title1={"Related"} title2={"Products"} titleStyles={"items-center"} paraStyles={"hidden"}/>
      <Swiper
        spaceBetween={30}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
        }}
        breakpoints={{
          500:{
            slidesPerView:2,
          },
          700:{
            slidesPerView:3,
          },
          1022:{
            slidesPerView:4,
          },
          1350:{
            slidesPerView:5,
          },
          
        }}
        modules={[Autoplay]}
        className="min-h-[300px]"
      >
        {relatedProducts.map((product)=>(
          <SwiperSlide key={product.id}>
            <Items product={product} /> 
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}

export default RelatedProducts
