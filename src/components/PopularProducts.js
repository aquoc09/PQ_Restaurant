import React, {useEffect, useState} from 'react'
import Title from './Title'
import Item from './Item';
// import { useUserContext } from '../context/UserContext';
import { environment } from '../environment/environment';
import axios from 'axios';
//import to get data from api
import ProductService from '../services/ProductService';

const PopularProducts = () => {

  // const [popularProducts,setPopularProducts]=useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const[items,setItems]=useState([]);
  // const {products}=useUserContext();

  const fetchPopularItems = async () => {
    try {
        setLoading(true);
        setError(null);
        const response = await ProductService.getPopulars(); //Này để chuyển đường dẫn
        if (response.result) // Điều kiện response
        {
            // Lọc các item có popular và inStock đều là true
            const filteredData = response.result.filter((item) => item.inPopular && item.inStock);
            setItems(filteredData); 
        }
    } catch (err) {
      setError('Failed to fetch PopularItems');
      console.error('Error fetching PopularItems:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(()=>{
    fetchPopularItems();
  },[]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    
  return (
    <section className='max-padd-container py-22 xl:py-28 bg-white'>
      <Title title1={"Popular"} title2={"Foods"} titleStyles={"pb-10"}/>
      {/* CONTAINER */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
      lg:grid-cols-4 xl:grid-cols-5 gap-8'>
        {items.map((product)=>(
          <div key={product.id}>
            <Item product={product} /> 
          </div>
        ))}
      </div>
    </section>
    )
};

export default PopularProducts
