import React ,{useState,useMemo, useEffect} from 'react'
import Item from './Item'
import { useUserContext } from '../context/UserContext'
import ExploreMenu from './ExploreMenu'
import SearchInput from './SearchInput'

const FoodItems = () => {

  const[categories,setCategories]=useState("All");
  const {products, searchQuery}=useUserContext();
  const[category,setCategory]=useState([]);
  const[type,setType]=useState([]);
  const[selectedSort,setSelectedSort]=useState("relevant");
  const[filteredProducts,setFilteredProducts]=useState([]);
  const[currentPage,setCurrentPage]=useState(1);
  const[availableTypes,setAvailableTypes]=useState([]);
  const itemsPerPage=8;

  //Predefined Categories list
  const allCategories = useMemo(()=>["Udon Curry","Rice","Udon","Salad","Drink","Bento"],[])

  //Reusable Runction to togle filter values
  const toggleFilter = (value,setState)=>{
    setState((prev)=>prev.includes(value)?prev.filter((item)=>item !==value) :[...prev,value])
  }

  //Dynamically update types based on selected categories
  useEffect(()=>{
    const selectedCat=category.length > 0 ? category :allCategories
    const filteredProds=products.filter((p)=>selectedCat.includes(p.category))
    const typeSet=new Set(filteredProds.map(p=>p.type))
    const newAvailableTypes =[...typeSet].sort()
    setAvailableTypes(newAvailableTypes)

    //Remove unavailable types from selection
    setType(prev=>prev.filter(t=>typeSet.has(t)))
  },[category,products,allCategories])

  const totalPages=7


  return (
      <div className='max-padd-container !px-0 mt-[72px]'>
        <ExploreMenu category={categories} setCategory={setCategories}/>
        {/* CONTAINER */}
        <div className='flex flex-row sm:flex-row flex-wrap'>
          {/* Filter - Left Side */}
          <div className='min-w-72 bg-white p-4 pl-6 lg:pl-8 rounded-r-xl sm:w-[28.5714%]'>
            <SearchInput />
            <div className='px-4 py-3 mt-2 bg-primary rounded-xl'>
              <h5 className='mb-4'>Sort By Price</h5>
              <select onChange={(e)=> setSelectedSort(e.target.value)} className='border border-slate-900/10 outline-none bg-white
               text-gray-30 text-sm font-medium h-8 w-full px-2 rounded-md'>
                <option value="relevant">Relevant</option>
                <option value="low">Low</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className='px-5 py-3 mt-4 bg-primary rounded-xl'>
              <h5 className='mb-4'>Categories</h5>
              <div className='flex flex-col gap-2 text-sm font-light'>
                {allCategories.map((cat)=>(
                  <label key={cat} className='flex gap-2 text-sm font-medium text-gray-30'>
                    <input onChange={(e)=>toggleFilter(e.target.value,setCategory)} type="checkbox" value={cat} checked={category.includes(cat)} 
                    className='w-3'/>
                    {cat}
                  </label>
                ))}
              </div>
            </div>
            {/* <div className='px-5 py-3 mt-4 bg-primary rounded-xl'>
              <h5 className='mb-4'>Types</h5>
              <div className='flex flex-col gap-2 text-sm font-light'>
                {availableTypes.map((typ)=>(
                  <label key={type} className='flex gap-2 text-sm font-medium text-gray-30'>
                    <input onChange={(e)=>toggleFilter(e.target.value,setType)} type="checkbox" value={typ} checked={type.includes(typ)} className='w-3'/>
                    {typ}
                  </label>
                ))}
              </div>
            </div> */}
          </div>
          {/* Filter Products - Right Side */}
          <div className='max-sm:px-9 sm:pr-9 bg-white px-6 rounded-l-xl sm:w-[71.4286%]'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
                xl:grid-cols-4 gap-x-10'>
                  {products.length >0 ?(
                    products.map((product)=>(
                      <Item key={product.id} product={product}/>
                  ))
                  ) : (
                    <p className='captilize'>Không tìm thấy sản phẩm</p>
                    )}
                </div>
                {/* Pagination */}
                <div className='flexCenter fle flex-wrap mt-14 mb-10 gap-4'>
                  <button disabled={currentPage===1} onClick={()=>setCurrentPage(prev=>prev-1)} 
                  className={`btn-light !py-1 !px-3 
                  ${currentPage === 1 && "opacity-50 cursor-not-allowed"}`}>
                    Previous
                  </button>
                  {Array.from({length:totalPages},(_,index)=>(
                    <button key={index + 1} onClick={()=> setCurrentPage(index+1)}
                    className={`btn-solid !py-1 !px-3 
                    ${currentPage === index + 1 && "bg-solidTwo text-primary"}`}>
                      {index + 1}
                    </button>
                  ))}
                  <button disabled={currentPage===totalPages} onClick={()=>setCurrentPage(prev=>prev+1)} 
                  className={`btn-solid !py-1 !px-3 
                  ${currentPage === totalPages && "opacity-50 cursor-not-allowed"}`}>
                    Next
                  </button>
                </div>
          </div>
        </div>
      </div>
  )
}

export default FoodItems
