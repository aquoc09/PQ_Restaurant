import React, {useState, useEffect} from 'react'
import CategoryService from '../../services/CategoryService';
import ProductService from '../../services/ProductService';
import { myAssets } from '../../assets/assets';

function AddProducts() {

  const [images, setImages]=useState({
    1:null,
  });

  const[inputs, setInputs]=useState({
    name:"",
    productCode:"",
    productImage:"",
    description:"",
    category:"",
    type:"",
    productImage:"",
    popular:false
  })

  const[sizePrices, setSizePrices]=useState([])
  const[newSize, setNewSize]=useState("")
  const[newPrice, setNewPrice]=useState("")
  const[loading, setLoading]=useState(false)


  return (
    <div className='md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll w-full lg:w-11/12 bg-primary shadow rounded-xl'>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Thêm Sản phẩm</h2>
      <form className='flex flex-col gap-y-3.5 px-2 text-sm w-full lg:w-11/12'>
        <div className='w-full'>
          <h5>Product Name</h5>
          <input onChange={(e)=> setInputs({...inputs, name: e.target.value})} 
          value={inputs.name} type='text' placeholder='Type here...' className='px-3 py-1.5 
          ring-1 ring-sky-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-full'></input>
        </div>
        <div className='w-full'>
          <h5>Product Description</h5>
          <textarea onChange={(e)=> setInputs({...inputs, description: e.target.value})} 
          value={inputs.description} type='text' rows={5} placeholder='Type here...' 
          className='px-3 py-1.5 ring-1 ring-slate-900/10 rounded-lg bg-white
           text-gray-600 text-sm font-medium mt-1 w-full'></textarea>
        </div>

        {/* Category and Types */}
        <div className='flex gap-4 flex-wrap'>
          <div>
            <h5>Category</h5>
            <select onChange={(e)=> setInputs({...inputs, category: e.target.value})} value={inputs.category} 
              className='px-3 py-1.5 ring-1 ring-slate-900/10 rounded-lg bg-white
           text-gray-600 text-sm font-medium mt-1 w-full' >
              <option value=''>Select Category</option>
              {/* {CategoryService.getAllCategories().map((category)=>(
                <option key={category.id} value={category.name}>{category.name}</option>
              ))} */}
            </select>
          </div>
          <div>
            <h5>Types</h5>
            <select onChange={(e)=> setInputs({...inputs, type: e.target.value})} value={inputs.type} 
              className='px-3 py-1.5 ring-1 ring-slate-900/10 rounded-lg bg-white
           text-gray-600 text-sm font-medium mt-1 w-30'>
              <option value=''>Select Type</option>
              {/* {CategoryService.getAllCategories().map((category)=>(
                <option key={category.id} value={category.parentCategory}>{category.parentCategory}</option>
              ))} */}
            </select>
          </div>
        </div>

        {/* Size and Prices */}
        <div className='w-full mt-4'>
          <h5>Size and Prices</h5>
          <div className='flex gap-4 mt-2'>
            <input value={newSize} type='text' placeholder='Size (e.g. M,L)' className='px-3 py-1.5 ring-1
           ring-slate-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-32'></input>
            <input value={newPrice} type='number' placeholder='Price' className='px-3 py-1.5 ring-1
           ring-slate-900/10 rounded-lg bg-white text-gray-600 text-sm font-medium mt-1 w-32'></input>
            <button type='button' className='btn-solid font-semibold p-1.5 rounded-lg'>Add</button>
          </div>
          <div className='mt-2'>
            {sizePrices.map((sizePrice, idx)=>(
              <div key={idx} className=''>
                <span>{sizePrice.size} : {sizePrice.price}</span>
                <button type='button' className='text-red-600'>Remove</button>
              </div>
            ))}
          </div>
        </div>
        {/* Images */}
        <div className='flex gap-2 mt-2'>
            {Object.keys(images).map((key)=>(
              <label key={key} htmlFor={`productImage${key}`} className='ring-1
           ring-slate-900/10 rounded-lg overflow-hidden'>
                <input type='file' onChange={(e)=> setImages({...inputs, [key]: e.target.files[0]})} accept='image/*' 
                id={`productImage${key}`} hidden className=''></input>
                <div className='bg-white flexCenter'>
                  <img src={images[key] ? URL.createObjectURL(images[key]) : myAssets.upload_icon} alt='' className='w-17 overflow-hidden 
                  object-contain' />
                </div>
              </label>
            ))}
        </div>
        <div className='flex gap-2 mt-3'>
            <h5>Add to Popular</h5>
            <input type='checkbox' checked={inputs.popular} onChange={(e)=> 
              setInputs({...inputs, popular: e.target.checked})}></input>
        </div>
        <button type='submit' disabled={loading} className='btn-solid font-semibold p-2 rounded-xl 
        mt-3 sm:w-full'>
          {loading ? "Adding" : "Add Product"}</button>
      </form>
    </div>
  )
}

export default AddProducts
