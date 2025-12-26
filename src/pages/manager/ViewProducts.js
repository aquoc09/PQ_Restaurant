import React, {useState} from 'react'
import { myAssets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import ProductList from './ProductList';


function ViewProducts() {

  const navigate=useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleKeywordChange = (keyword) => {
    setSearchKeyword(keyword.toLowerCase());
  };

  return (
    <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-slate-50 shadow rounded-xl'>
      <div className='flex justify-between items-center mb-6'> 
        <h2 className='text-2xl font-bold'>Product Management</h2>
        {/* Thanh tìm kiếm */}
        <input 
            type="text"
            placeholder="Find food by name..."
            value={searchKeyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            className="w-80 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-150"
        />
        <button onClick={()=>{
          navigate("/manager/add-product")}} className='px-6 py-3 active:scale-95 transition bg-tertiary border-gray-500/20 text-black text-sm font-medium rounded-full cursor-pointer flex justify-center items-center gap-2'>
          Add Product
          <img src={myAssets.square_plus} alt="" />
        </button>
      </div>
      {/* Product List Section */}
      <div>
        <ProductList 
            searchKeyword={searchKeyword}     
        />
        </div>
        
      </div>
  )
}

export default ViewProducts
