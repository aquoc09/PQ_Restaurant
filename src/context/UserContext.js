import React , {createContext, useContext, useEffect, useState}from 'react'
import { dummyProducts } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
// import { useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';

const UserContext=createContext()
export const UserContextProvider = ({children}) => {

    const[products, setProducts]=useState([]);
    const [searchQuery, setSearchQuery]=useState("");
    const currency = process.env.REACT_APP_CURRENCY || "đ";
    const delivery_charges=20000;
    const navigate=useNavigate();
    const [cardItems, setCartItems]=useState([]);
    const[method,setMethod]=useState("COD");
    const [isAdmin, setIsAdmin]=useState(() => {
      const adminToken = localStorage.getItem('adminToken');
      return !!adminToken; // Convert to boolean
    });
    //Clerk
    // const {user}=useUser();

    const fetchProducts=()=>{
        setProducts(dummyProducts);
    };

    //Add Products to Cart
    const addToCart = (itemId, size)=>{
        if(!size) return toast.error("Please select a size before adding to cart.");
        let cardData=structuredClone(cardItems);
        cardData[itemId]=cardData[itemId] || {}
        cardData[itemId][size]=(cardData[itemId][size] || 0) + 1;
        setCartItems(cardData);
        toast.success("Item added to cart");

    }

    //Get Cart Count
    const getCartCount=()=>{
        let count=0;
        for(const itemId in cardItems){
            for(const size in cardItems[itemId]){
                count+=cardItems[itemId][size];
            }
        }
        return count;
    }

    //Update Cart Quantity
    const updateQuantity=(itemId, size, quantity)=>{
        let cardData=structuredClone(cardItems);
        cardData[itemId][size]=quantity;
        setCartItems(cardData);
    }

    //Get Cart Amount
    const getCartAmount=()=>{
        let amount=0;
        for (const itemId in cardItems) {
            const product = products.find((prod) => prod.id === itemId);
            if(!product) continue;
            for (const size in cardItems[itemId]) {
                amount += product.price[size] * cardItems[itemId][size];
            }
        }
        return amount;
    }

    useEffect(()=>{
        fetchProducts()
    },[]);

    const value={
        // user,
        products,
        fetchProducts,
        currency,
        delivery_charges,
        navigate,
        searchQuery,
        setSearchQuery,
        cardItems,
        addToCart,
        getCartCount,
        updateQuantity,
        getCartAmount,
        method,
        setMethod,
        isAdmin,
        setIsAdmin,
    };
    
  return <UserContext.Provider value={value}>
        {children}
    </UserContext.Provider>;
};

export const useUserContext = ()=>useContext(UserContext)