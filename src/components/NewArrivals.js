import React, {useEffect, useState} from 'react'
import Title from './Title'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';

// import required modules
import { Autoplay } from 'swiper/modules';
import Items from './Items';
import { environment } from '../environment/environment';
import axios from 'axios';

const NewArrivals = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNewArrivals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${environment.apiBaseUrl}/products/latest-products`); //Này để chuyển đường dẫn
      if (response.data.result) {
        
        setNewArrivals(response.data.result.slice(0, 10)); // Giới hạn 10 món
      }
    } catch (err) {
      setError('Failed to fetch new arrivals');
      console.error('Error fetching new arrivals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewArrivals();
  }, []);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <section className='max-padd-container py-22 xl:py-28 bg-white'>
      <Title title1={"New"} title2={"Arrivals"} titleStyles={"pb-10"}/>
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
        {newArrivals.map((product)=>(
          <SwiperSlide key={product.id}>
            <Items product={product} /> 
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}

export default NewArrivals
