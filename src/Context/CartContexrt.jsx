/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import axios from "axios";
import React, { useContext, useState } from "react";
import { use } from "react";
import { createContext, useEffect } from "react";
import toast from "react-hot-toast";
import { UserContext } from "./UserContext";

export let CartContext = createContext();
export default function CartContextProvider(props) {
  const [CartProductsIds, setCartProductsIds] = useState([]);
  const [numItems, setnumItems] = useState(0);  // Initialize with 0
  const [cartCount, setCartCount] = useState(0);  // Initialize with 0
  const [wishlistCount, setWishlistCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { isArabic } = useContext(UserContext);
  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  // Initialize cart in localStorage and fetch counts on mount
  useEffect(() => {
    const storedArrayString = localStorage.getItem("cartItems");
    if (!storedArrayString) {
      localStorage.setItem("cartItems", JSON.stringify([]));
    } else {
      const items = JSON.parse(storedArrayString);
      setCartProductsIds(items);
      setnumItems(items.length);
      setCartCount(items.length); // Make sure cartCount is initialized
    }
    
    // Fetch counts when component mounts
    fetchCartCount();
    fetchWishlistCount();
  }, []);

  // Add to wishlist function
  const addToWishlist = async (skuId) => {
    try {
      const userToken = localStorage.getItem("userToken");
      
      if (!userToken) {
        toast.error("Please login to add to wishlist");
        return;
      }
      
      const config = {
        headers: {
          "Access-Token": userToken,
          "Content-Type": "application/json",
        },
      };
      
      const requestBody = {
        productId: skuId.toString()
      };
      
      await axios.post(
        "https://reedyph.com/api/v1/wishlists/wishlist",
        requestBody,
        config
      );
      
      toast.success(isArabic ? "تمت الإضافة إلى قائمة الرغبات بنجاح!" : "Added to wishlist successfully!", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
      fetchWishlistCount(); // Fetch updated wishlist count
    } catch (error) {
      console.error("Wishlist error:", error);
      fetchWishlistCount();
      toast.error(
        error.response?.data?.message || "Failed to add to wishlist"
      );
    }
  };


    // Add to cart function
    const fetchCartCount = async () => {
      try {
        const userToken = localStorage.getItem("userToken");
        
        if (!userToken) {
          // إذا لم يكن هناك token، استخدم عدد العناصر المخزنة محليًا
          const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
          setCartCount(cartItems.length);
          return;
        }

        const config = {
          headers: {
            "Access-Token": userToken,
          },
        };

        const response = await axios.get(
          "https://reedyph.com/api/v1/carts/cart/",
          config
        );

        if (response.data && Array.isArray(response.data)) {
          // تعيين عدد المنتجات في السلة
          setCartCount(response.data.length);
          
          // تحديث numItems أيضًا إذا كان متاحًا
          if (typeof setNumItems === 'function') {
            setNumItems(response.data.length);
          }
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
        return 0;
      }
    };
    
    // تعديل دالة addToCart لتحديث العداد بشكل صحيح
    const addToCart = async (skuId, quantity = 1) => {
      try {
        const userToken = localStorage.getItem("userToken");
    
        if (!userToken) {
          let cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
          const productExists = cartItems.some(item => Object.keys(item)[0] === skuId.toString());
          if (!productExists) {
            cartItems = [...cartItems, { [skuId]: 1 }];
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
            setCartProductsIds(cartItems.map(item => Object.keys(item)[0]));
            setnumItems(cartItems.length);
            setCartCount(cartItems.length); // تحديث العداد مباشرة
            toast.success(isArabic ? "تمت الإضافة إلى السلة بنجاح!" : "Added to cart successfully!", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
          } else {
            toast.error(isArabic ? "المنتج موجود بالفعل في السلة" : "Product already in cart!", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
          }
        } else {
          const config = {
            headers: {
              "Access-Token": userToken,
              "Content-Type": "application/json",
            },
          };
          const requestBody = {
            productId: [{ [skuId]: quantity }]
          };
    
          await axios.post(
            "https://reedyph.com/api/v1/carts/cart",
            requestBody,
            config
          );
    
          fetchCartCount(); // استدعاء fetchCartCount للحصول على القيمة الجديدة
          toast.success(isArabic ? "تمت الإضافة إلى السلة بنجاح!" : "Added to cart successfully!", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
        }
      } catch (error) {
        console.error("Cart error:", error);
        toast.error(
          error.response?.status === 401
            ? isArabic ? "يرجى تسجيل الدخول لإضافة المنتج إلى السلة" : "Please login to add to cart"
            : error.response?.data?.message || isArabic ? "فشل إضافة المنتج إلى السلة" : "Failed to add to cart"
        );
      }
    };
  // Fetch wishlist count
  const fetchWishlistCount = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (token) {
        const response = await axios.get("https://reedyph.com/api/v1/wishlists/wishlist", {
          headers: { "Access-Token": token }
        });
        // استخراج عدد المنتجات بشكل صحيح من الرد
        const count = response.data?.length || 0;
        setWishlistCount(count);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };





  return (
    <CartContext.Provider
      value={{
        CartProductsIds,
        setCartProductsIds,
        numItems,
        setnumItems,
        addToCart,
        addToWishlist,
        fetchCartCount,
        fetchWishlistCount,
        cartCount,
        setCartCount,
        wishlistCount,
        setWishlistCount,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {props.children}
    </CartContext.Provider>
  );
}
