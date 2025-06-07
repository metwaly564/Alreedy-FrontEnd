import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate, Link, NavLink } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { CartContext } from "../../Context/CartContexrt";
import { FiShoppingCart } from "react-icons/fi";
import { FaHeart, FaEye, FaTimes } from "react-icons/fa";
import "../../styles/style.css";
import cart from "../../assets/cart.png";
import style from "./Cart.module.css";

const Cart = () => {
  const navigate = useNavigate();
  const { userlogin, isArabic } = useContext(UserContext);
  const { fetchCartCount, setCartCount } = useContext(CartContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [promoCodeDetails, setPromoCodeDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add this line for order submission loading state

  // Checkout state
  const [activeStep, setActiveStep] = useState(1);
  const [promoCode, setPromoCode] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [cities, setCities] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedOnlinePayment, setSelectedOnlinePayment] = useState(null);
  const [paymentType, setPaymentType] = useState("");
  const [originalDeliveryFee, setOriginalDeliveryFee] = useState(0);
  const [extraPhones, setExtraPhones] = useState(["", ""]);
  
  const [checkoutForm, setCheckoutForm] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    address: "",
  });

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Helper function to extract user ID from token
  const getUserIdFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || 17; // Default to 17 if not found
    } catch (e) {
      return 17; // Default to 17 if error
    }
  };

  // Add custom arrow components
  const CustomLeftArrow = ({ onClick }) => (
    <button 
      onClick={onClick}
      className="hidden sm:block absolute left-2 sm:left-12 bg-black/80 p-1 sm:p-2 rounded-full text-white z-10 top-[45%]"
    >
      <svg xmlns="https://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );

  const CustomRightArrow = ({ onClick }) => (
    <button 
      onClick={onClick}
      className="hidden sm:block absolute right-2 sm:right-12 bg-black/80 p-1 sm:p-2 rounded-full text-white z-10 top-[45%]"
    >
      <svg xmlns="https://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );

  // Slider settings for related products
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 300,
    slidesToShow: 6,
    slidesToScroll: 1,
    draggable: true,
    swipeToSlide: false,
    touchThreshold: 10,
    autoplay: false,
    arrows: true,
    centerPadding: "0px",
    rtl: isArabic,
    prevArrow: <CustomLeftArrow />,
    nextArrow: <CustomRightArrow />,
    responsive: [
      {
        breakpoint: 1576,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 1,
          swipeToSlide: false,
          touchThreshold: 10,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
          swipeToSlide: false,
          touchThreshold: 10,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          swipeToSlide: false,
          touchThreshold: 10,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          swipeToSlide: false,
          touchThreshold: 10,
          arrows: false,
        },
      },
    ],
  };

  // Fetch cart items and related products
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        if (userlogin) {
          const response = await axios.get("https://reedyph.com/api/v1/carts/cart/", {
            headers: { "Access-Token": userlogin },
          });
          setCartItems(response.data);
          fetchRelatedProducts(response.data);
        } else {
          const guestCartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
          if (guestCartItems.length > 0) {
            const idsArray = guestCartItems.map(item => Object.keys(item)[0]);
            const response = await axios.post("https://reedyph.com/api/v1/products/product-list", {
              Ids: idsArray,
            });
            const quantityMap = {};
            guestCartItems.forEach(item => {
              const id = Object.keys(item)[0];
              quantityMap[id] = item[id];
            });
            const formattedItems = response.data.map((product) => ({
              productId: product.skuId,
              quantity: quantityMap[product.skuId] || 1,
              product: product,
            }));
            setCartItems(formattedItems);
            fetchRelatedProducts(formattedItems);
          }
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
        toast.error(isArabic ? "فشل تحميل السلة" : "Failed to load Cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [userlogin, isArabic]);

  // Revalidate promo code when cart items change and promo is applied
  useEffect(() => {
    if (isPromoApplied && promoCode && selectedZone) {
      handleApplyPromoCode();
    }
  }, [cartItems]);

  // Fetch related products based on cart items categories
  const fetchRelatedProducts = async (items) => {
    try {
      setLoadingRelated(true);
      
      // Get all unique category IDs from cart items
      const categoryIds = new Set();
      items.forEach(item => {
        item.product.productCategories?.forEach(category => {
          categoryIds.add(category.categoryId);
        });
      });

      if (categoryIds.size === 0) {
        setRelatedProducts([]);
        return;
      }

      // Get products from these categories (excluding cart items)
      const cartProductIds = items.map(item => item.productId);
      const responses = await Promise.all(
        Array.from(categoryIds).map(categoryId => 
          axios.get(`https://reedyph.com/api/v1/categories/category/${categoryId}`)
        )
      );

      // Combine all products from these categories
      let allProducts = [];
      responses.forEach(response => {
        if (response.data && response.data.products) {
          allProducts = [...allProducts, ...response.data.products];
        }
      });

      // Filter out products already in cart and duplicates
      const uniqueProducts = allProducts.filter(
        (product, index, self) =>
          !cartProductIds.includes(product.skuId) &&
          product.availableStock > 0 && // Only include available products
          index === self.findIndex(p => p.skuId === product.skuId)
      );

      // Limit to 10 products
      setRelatedProducts(uniqueProducts.slice(0, 10));
    } catch (error) {
      console.error("Error fetching related products:", error);
    } finally {
      setLoadingRelated(false);
    }
  };

  // Fetch cities and payment methods
  useEffect(() => {
    if (userlogin) {
      const fetchData = async () => {
        try {
          const [paymentResponse, citiesResponse] = await Promise.all([
            axios.get("https://reedyph.com/api/v1/orders/payment-methods"),
            axios.get("https://reedyph.com/api/v1/places/city"),
          ]);
          setPaymentMethods(paymentResponse.data);
          setCities(citiesResponse.data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    }
  }, [userlogin]);

  // Update zones when city changes
  useEffect(() => {
    if (selectedCity) {
      const city = cities.find(c => c.id.toString() === selectedCity);
      if (city) {
        setZones(city.zones);
        setSelectedZone("");
        setDeliveryFee(0);
        setOriginalDeliveryFee(0);
        
        // Reset promo code when city changes
        setPromoCode("");
        setIsPromoApplied(false);
        setPromoError("");
        setPromoCodeDetails(null);
        setDiscountAmount(0);
      }
    }
  }, [selectedCity, cities]);

  // Update delivery fee when zone changes
  useEffect(() => {
    if (selectedZone) {
      const zone = zones.find(z => z.id.toString() === selectedZone);
      if (zone) {
        setDeliveryFee(zone.deliveryFee);
        setOriginalDeliveryFee(zone.deliveryFee);
        
        // Reset promo code when zone changes
        setPromoCode("");
        setIsPromoApplied(false);
        setPromoError("");
        setPromoCodeDetails(null);
        setDiscountAmount(0);
      }
    }
  }, [selectedZone, zones]);

  // Helper functions
  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return isArabic ? "0 جنية" : "0 EGP";
    }
    if (isArabic) {
      return price.toLocaleString("ar-EG") + " جنية";
    } else {
      return price.toLocaleString("en-US") + " EGP";
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.priceAfter || 0) * item.quantity, 0);
  const totalAfterDiscount = subtotal - discountAmount;
  const grandTotal = isPromoApplied && promoCodeDetails 
    ? Number(promoCodeDetails.discountedCartTotal || 0) + Number(deliveryFee)
    : subtotal + deliveryFee - (promoCodeDetails?.target === "cart" ? discountAmount : 0);

  // Cart actions
  const updateQuantity = async (productId, change) => {
    const currentItem = cartItems.find((item) => item.productId === productId);
    if (!currentItem) return;
    
    const newQuantity = currentItem.quantity + change;
  
    if (newQuantity < 1 || newQuantity > (currentItem.product.maxOrderQuantity || 99)) return;
  
    try {
      if (userlogin) {
        await axios.post(
          "https://reedyph.com/api/v1/carts/cart",
          { productId: [{ [productId.toString()]: change }] },
          { headers: { "Access-Token": userlogin } }
        );
        
        // Refresh cart items
        const response = await axios.get("https://reedyph.com/api/v1/carts/cart/", {
          headers: { "Access-Token": userlogin },
        });
        setCartItems(response.data);
        
        // Reapply promo code if one was applied
        if (isPromoApplied && promoCode && selectedZone) {
          await handleApplyPromoCode();
        }
        toast.success(isArabic ? "تم تحديث الكمية" : "Quantity updated", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
      } else {
        // Guest user logic
        const guestCartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
        const productIdStr = productId.toString();
        const productIndex = guestCartItems.findIndex(item => Object.keys(item)[0] === productIdStr);
       
        if (change > 0) {
          if (productIndex !== -1) {
            guestCartItems[productIndex][productIdStr] = newQuantity;
          } else {
            guestCartItems.push({ [productIdStr]: 1 });
          }
        } else {
          if (productIndex !== -1) {
            if (newQuantity <= 0) {
              guestCartItems.splice(productIndex, 1);
            } else {
              guestCartItems[productIndex][productIdStr] = newQuantity;
            }
          }
        }
        localStorage.setItem("cartItems", JSON.stringify(guestCartItems));
        setCartCount(guestCartItems.length);
        
        // Refresh guest cart items
        const idsArray = guestCartItems.map(item => Object.keys(item)[0]);
        const response = await axios.post("https://reedyph.com/api/v1/products/product-list", {
          Ids: idsArray,
        });
        const quantityMap = {};
        guestCartItems.forEach(item => {
          const id = Object.keys(item)[0];
          quantityMap[id] = item[id];
        });
        const formattedItems = response.data.map((product) => ({
          productId: product.skuId,
          quantity: quantityMap[product.skuId] || 1,
          product: product,
        }));
        setCartItems(formattedItems);
        toast.success(isArabic ? "تم تحديث الكمية" : "Quantity updated", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error(isArabic ? "فشل تحديث الكمية" : "Failed to update quantity");
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      if (userlogin) {
        await axios.delete(`https://reedyph.com/api/v1/carts/cart/${productId}`, {
          headers: { "Access-Token": userlogin },
        });
        
        // Refresh cart items
        const response = await axios.get("https://reedyph.com/api/v1/carts/cart/", {
          headers: { "Access-Token": userlogin },
        });
        setCartItems(response.data);
        
        fetchCartCount();
        
        // Reapply promo code if one was applied
        if (isPromoApplied && promoCode && selectedZone) {
          await handleApplyPromoCode();
        }
      } else {
        const guestCartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
        const updatedItems = guestCartItems.filter(item => Object.keys(item)[0] !== productId.toString());
        localStorage.setItem("cartItems", JSON.stringify(updatedItems));
        setCartCount(updatedItems.length);
        
        // Refresh guest cart items
        const idsArray = updatedItems.map(item => Object.keys(item)[0]);
        const response = await axios.post("https://reedyph.com/api/v1/products/product-list", {
          Ids: idsArray,
        });
        const quantityMap = {};
        updatedItems.forEach(item => {
          const id = Object.keys(item)[0];
          quantityMap[id] = item[id];
        });
        const formattedItems = response.data.map((product) => ({
          productId: product.skuId,
          quantity: quantityMap[product.skuId] || 1,
          product: product,
        }));
        setCartItems(formattedItems);
      }
      
      toast.success(isArabic ? "تم حذف المنتج" : "Product Deleted Successfully");
    } catch (error) {
      toast.error(isArabic ? "فشل الحذف" : "Failed to remove product");
    }
  };

  // Promo code actions
  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError(isArabic ? "أدخل كود الخصم" : "Enter Promo Code");
      return;
    }
    if (!userlogin) {
      setPromoError(isArabic ? "يجب تسجيل الدخول" : "Login Required");
      return;
    }
    if (!selectedZone) {
      setPromoError(isArabic ? "اختر المنطقة أولاً" : "Select Zone First");
      return;
    }
  
    try {
      const response = await axios.post(
        "https://reedyph.com/api/v1/promocodes/validate-promocode",
        {
          code: promoCode,
          zoneId: parseInt(selectedZone)
        },
        { headers: { "Access-Token": userlogin } }
      );
  
      const { valid } = response.data;
  
      if (!valid) {
        setPromoError(isArabic ? "كود غير صالح" : "Invalid Code");
        return;
      }
  
      const {
        promoCode: promoData,
        cartDiscount,
        deliveryDiscount,
        totalDiscount,
      } = response.data;
  
      setPromoCodeDetails(response.data);
      setDiscountAmount(promoData.target === "cart" ? cartDiscount : deliveryDiscount);
      setIsPromoApplied(true);
      setPromoError("");
  
      toast.success(
        isArabic
          ? `تم تطبيق الكود بنجاح - خصم ${totalDiscount} جنية`
          : `Promo code applied successfully - ${totalDiscount} EGP discount`
      );
  
    } catch (error) {
      console.error("Promo code validation error:", error);
      setPromoError(isArabic ? "كود غير صالح" : "Invalid Code");
    }
  };

  const handleCancelPromoCode = () => {
    setPromoCode("");
    setIsPromoApplied(false);
    setPromoError("");
    setDiscountAmount(0);
    setPromoCodeDetails(null);
    toast.success(isArabic ? "تم إلغاء الكود" : "Promo Removed");
  };

  // Checkout actions
  const handleExtraPhoneChange = (index, value) => {
    // Allow typing any number, but limit to 11 digits
    if (value === '' || /^[0-9]{0,11}$/.test(value)) {
      const newExtraPhones = [...extraPhones];
      newExtraPhones[index] = value;
      setExtraPhones(newExtraPhones);
    }
  };

  const handleMainPhoneChange = (value) => {
    // Allow typing any number, but limit to 11 digits
    if (value === '' || /^[0-9]{0,11}$/.test(value)) {
      setCheckoutForm({...checkoutForm, phone: value});
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    // Set submitting state to true
    setIsSubmitting(true);
    
    // Validate main phone number
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(checkoutForm.phone)) {
      toast.error(isArabic ? "يرجى إدخال رقم هاتف مصري صحيح" : "Please enter a valid Egyptian phone number");
      setIsSubmitting(false);
      return;
    }

    // Validate extra phones if any
    const invalidExtraPhone = extraPhones.find(phone => phone && !phoneRegex.test(phone));
    if (invalidExtraPhone) {
      toast.error(isArabic ? "يرجى إدخال رقم هاتف مصري صحيح للأرقام الإضافية" : "Please enter valid Egyptian phone numbers for extra phones");
      setIsSubmitting(false);
      return;
    }

    // Prepare order data
    const orderData = {
      cityId: parseInt(selectedCity),
      zoneId: parseInt(selectedZone),
      address: checkoutForm.address,
      phone: checkoutForm.phone,
      promocode: isPromoApplied ? promoCode : null,
      paymentMethod: paymentType === "online" ? "online" : "cod",
      firstname: checkoutForm.firstname,
      lastname: checkoutForm.lastname,
      extraPhones: extraPhones.filter(phone => phone.trim() !== "")
    };
  
    console.log("Order Request Body that will be sent:", JSON.stringify(orderData, null, 2));
  
    try {
      console.log("Submitting order to backend...");
  
      const response = await axios.post(
        "https://reedyph.com/api/v1/orders/order",
        orderData,
        { headers: { "Access-Token": userlogin } }
      );
  
      console.log("Order submission response:", {
        status: response.status,
        data: response.data
      });
  
      if (response.data.data?.url) {
        console.log("REDIRECTING TO PAYMENT - FINAL REQUEST BODY WAS:", JSON.stringify(orderData, null, 2));
        console.log("Redirecting to:", response.data.data.url);
        
        window.location.href = response.data.data.url;
      } else {
        console.log("Order placed successfully (Cash on Delivery)");
        toast.success(isArabic ? "تم تقديم الطلب بنجاح" : "Order Placed Successfully");
        navigate("/");
      }
    } catch (error) {
      console.error("Order submission failed. Details:", {
        errorMessage: error.message,
        requestBody: JSON.stringify(orderData, null, 2),
        responseError: error.response?.data
      });
      
      toast.error(isArabic ? "فشل الطلب" : "Order Failed");
    } finally {
      // Set submitting state back to false
      setIsSubmitting(false);
    }
  };

  // Quick view handlers
  const handleQuickViewClick = (product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setSelectedProduct(null);
  };

  // Add to wishlist function
  const addToWishlist = async (skuId) => {
    try {
      const userToken = localStorage.getItem("userToken");

      if (!userToken) {
        toast.error(isArabic ? "الرجاء تسجيل الدخول لإضافة إلى المفضلة" : "Please login to add to wishlist", {
          style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 }
        });
        return;
      }

      const config = {
        headers: {
          "Access-Token": userToken,
          "Content-Type": "application/json",
        },
      };

      const requestBody = {
        productId: skuId.toString(),
      };

      await axios.post(
        "https://reedyph.com/api/v1/wishlists/wishlist",
        requestBody,
        config
      );

      toast.success(isArabic ? "تمت الإضافة إلى المفضلة بنجاح!" : "Added to wishlist successfully!", {
        style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 }
      });
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.success(isArabic ? "موجود بالفعل في المفضلة" : "Already in Your Wishlist", {
        style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 }
      });
    }
  };

  // Add to Cart function
  const addToCart = async (skuId, quantity = 1) => {
    const userToken = localStorage.getItem("userToken");
  
    try {
      if (userToken) {
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
        
        // Refresh cart items
        const cartResponse = await axios.get("https://reedyph.com/api/v1/carts/cart/", {
          headers: { "Access-Token": userToken },
        });
        setCartItems(cartResponse.data);
        
        toast.success(isArabic ? "تمت الإضافة إلى السلة!" : "Added to cart!", {
          style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 }
        });
        
        if (fetchCartCount) {
          fetchCartCount();
        }
        
        // Reapply promo code if one was applied
        if (isPromoApplied && promoCode && selectedZone) {
          await handleApplyPromoCode();
        }
        
      } else {
        // Guest user logic
        let cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
        const productExists = cartItems.some(item => Object.keys(item)[0] === skuId.toString());
  
        if (productExists) {
          toast.error(isArabic ? "المنتج موجود بالفعل في السلة" : "Product already in cart!", {
            style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 }
          });
          return;
        }
  
        cartItems = [...cartItems, { [skuId]: quantity }];
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
        setCartCount(cartItems.length);
        
        // Refresh guest cart items
        const idsArray = cartItems.map(item => Object.keys(item)[0]);
        const response = await axios.post("https://reedyph.com/api/v1/products/product-list", {
          Ids: idsArray,
        });
        const quantityMap = {};
        cartItems.forEach(item => {
          const id = Object.keys(item)[0];
          quantityMap[id] = item[id];
        });
        const formattedItems = response.data.map((product) => ({
          productId: product.skuId,
          quantity: quantityMap[product.skuId] || 1,
          product: product,
        }));
        setCartItems(formattedItems);
        
        toast.success(isArabic ? "تمت الإضافة إلى السلة!" : "Added to cart!", {
          style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 }
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(isArabic ? "فشل إضافة المنتج إلى السلة" : "Failed to Add to Cart", {
        style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 }
      });
    }
  };

  // Render functions
  const renderCartItems = () => (
    <div className="space-y-3">
      {cartItems.map((item) => (
        <div key={item.productId} className="bg-white rounded-lg shadow-sm p-3 border flex gap-3">
          {isArabic && (
            <div className="w-20 h-20 flex-shrink-0">
              <img
                src={item.product.Images?.[0]?.url || "https://via.placeholder.com/150"}
                alt={isArabic ? item.product.nameAr || item.product.nameEn : item.product.nameEn || item.product.nameAr}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          
          <div className="flex-1">
            <h2 className={`text-sm font-semibold ${isArabic ? 'text-right' : 'text-left'}`}>
              {isArabic ? item.product.nameAr || item.product.nameEn : item.product.nameEn || item.product.nameAr}
            </h2>
            <p className={`text-gray-600 text-xs ${isArabic ? 'text-right' : 'text-left'}`}>
              {item.product.company}
            </p>
            <div className={`flex ${isArabic ? 'justify-end' : 'justify-start'} mt-1 font-alexandria font-medium`}>
              <p className="text-gray-800 text-sm">
                {formatPrice(item.product.priceAfter)}
                {item.product.priceBefore > item.product.priceAfter && (
                  <span className={`${isArabic ? 'mr-1' : 'ml-1'} line-through text-gray-400 text-xs`}>
                    {formatPrice(item.product.priceBefore)}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center justify-between mt-2">
              {!isArabic && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-700 text-xs font-alexandria font-medium">Qty:</span>
                  <div className="flex items-center border rounded text-xs font-alexandria font-medium">
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      disabled={item.quantity >= (item.product.maxOrderQuantity || 99) || updatingItems[item.productId]}
                      className="px-1.5 py-0.5 disabled:opacity-50 font-alexandria font-medium"
                    >
                      {updatingItems[item.productId] ? "..." : "+"}
                    </button>
                    <span className="px-1.5">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      disabled={item.quantity <= 1 || updatingItems[item.productId]}
                      className="px-1.5 py-0.5 disabled:opacity-50"
                    >
                      {updatingItems[item.productId] ? "..." : "-"}
                    </button>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => handleRemoveItem(item.productId)}
                className="text-red-600 text-xs flex items-center hover:text-white hover:bg-red-600 rounded p-1.5 transition"
                aria-label={isArabic ? "إزالة" : "Remove"}
              >
                <svg xmlns="https://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
              
              {isArabic && (
                <div className="flex items-center gap-1">
                  <div className="flex items-center border rounded text-xs font-alexandria font-medium">
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      disabled={item.quantity >= (item.product.maxOrderQuantity || 99) || updatingItems[item.productId]}
                      className="px-1.5 py-0.5 disabled:opacity-50 font-alexandria font-medium"
                    >
                      {updatingItems[item.productId] ? "..." : "+"}
                    </button>
                    <span className="px-1.5">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      disabled={item.quantity <= 1 || updatingItems[item.productId]}
                      className="px-1.5 py-0.5 disabled:opacity-50"
                    >
                      {updatingItems[item.productId] ? "..." : "-"}
                    </button>
                  </div>
                  <span className="text-gray-700 text-xs font-alexandria font-medium">: الكمية</span>
                </div>
              )}
            </div>
          </div>
          
          {!isArabic && (
            <div className="w-20 h-20 flex-shrink-0">
              <img
                src={item.product.Images?.[0]?.url || "https://via.placeholder.com/150"}
                alt={isArabic ? item.product.nameAr || item.product.nameEn : item.product.nameEn || item.product.nameAr}
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderOrderSummary = () => {
    // Use original values when no valid promo is applied
    var currentSubtotal = subtotal;
    var currentDiscount = 0;
    var currentDeliveryFee = deliveryFee;
    var currentTotal = subtotal + deliveryFee;
  
    // Only use promo values if a valid promo is applied
    if (isPromoApplied && promoCodeDetails) {
      currentSubtotal = promoCodeDetails.originalCartTotal || subtotal;
      currentDiscount = promoCodeDetails.cartDiscount || 0;
      
      // Special condition: If discount equals subtotal, make total free
      if (currentDiscount === currentSubtotal) {
        currentTotal = 0;
      } else {
        currentTotal = promoCodeDetails.totalWithDeliveryAfterDiscount || (subtotal + deliveryFee);
      }
    }
  
    return (
      <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg mb-4">
        <h3 className={`text-[20px] font-extrabold mb-3 py-1 ${isArabic ? "text-right" : "text-left"}`}>
          {isArabic ? "ملخص الطلب" : "Order Summary"}
        </h3>
  
        <div className={`flex font-medium justify-between ${isArabic ? "" : "flex-row-reverse"}`}>
          <span className="text-left">{formatPrice(currentSubtotal)}</span>
          <span className="text-right">{isArabic ? ": المجموع" : "Subtotal :"}</span>
        </div>
  
        {isPromoApplied && promoCodeDetails?.cartDiscount > 0 && (
          <div className={`flex justify-between ${isArabic ? "" : "flex-row-reverse"}`}>
            <span className="text-left text-red-600 flex font-medium">{isArabic ? "" : "- "}{formatPrice(currentDiscount)}{isArabic ? " -" : " "}</span>
            <span className="text-right text-red-600 flex font-medium">{isArabic ? ": الخصم" : "Discount :"}</span>
          </div>
        )}
  
        {(selectedCity && selectedZone) && (
          <div className={`flex justify-between font-medium ${isArabic ? "" : "flex-row-reverse"}`}>
            <span className="text-left">
              {currentDeliveryFee === 0 ? (
                <span className="text-green-600">{isArabic ? "مجاني" : "Free"}</span>
              ) : (
                formatPrice(currentDeliveryFee)
              )}
            </span>
            <span className="text-right">{isArabic ? ": " : ""} {isArabic ? "التوصيل" : "Delivery"}{isArabic ? "" : " :"} </span>
          </div>
        )}
  
        {isPromoApplied && promoCodeDetails?.deliveryDiscount > 0 && (
          <div className={`flex justify-between ${isArabic ? "" : "flex-row-reverse"}`}>
            <span className="text-left text-red-600 flex font-medium">{isArabic ? "" : "- "}{formatPrice(promoCodeDetails.deliveryDiscount)}{isArabic ? " -" : " "}</span>
            <span className="text-right text-red-600 flex font-medium">{isArabic ? ": خصم التوصيل" : "Delivery Discount :"}</span>
          </div>
        )}
  
        <div className={`flex justify-between border-t pt-2 font-medium ${isArabic ? "" : "flex-row-reverse"}`}>
          <span className="text-left">
            {currentTotal === 0 ? (
              <span className="text-green-600">{isArabic ? "مجاني" : "Free"}</span>
            ) : (
              formatPrice(currentTotal)
            )}
          </span>
          <span className="text-right">{isArabic ? ": الإجمالي" : "Total :"}</span>
        </div>
      </div>
    );
  };
  
  const renderStepIndicator = () => (
    <div className={`flex justify-between items-center mb-6${isArabic ? ' flex-row-reverse' : ''}`}>
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
              ${activeStep > step ? 'bg-red-400' : 'border-red-400'} 
              ${activeStep >= step ? 'bg-red-600' : 'bg-white'}`}
          >
            {activeStep > step ? (
              <div className="bg-red-400 rounded-full p-1">
                <svg xmlns="https://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <span className={`font-semibold ${activeStep >= step ? 'text-white' : 'text-gray-400'}`}>
                {isArabic ? step.toLocaleString('ar-EG') : step}
              </span>
            )}
          </div>
          {step < 3 && (
            <div
              className={`flex-1 h-1 mx-2 ${activeStep > step ? 'bg-red-400' : 'bg-gray-200'}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Add this function near the other validation functions
  const isPhoneValid = (phone) => {
    const phoneRegex = /^01[0125][0-9]{8}$/;
    return phone && phone.length === 11 && phoneRegex.test(phone);
  };

  const isAllPhonesValid = () => {
    // Check main phone
    if (!checkoutForm.phone || checkoutForm.phone.length < 11) {
      return false;
    }
    if (!isPhoneValid(checkoutForm.phone)) {
      return false;
    }
    // Check extra phones if they have any value
    return extraPhones.every(phone => !phone || (phone.length === 11 && isPhoneValid(phone)));
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className={`text-[20px] font-extrabold mb-3 ${isArabic ? "text-right" : "text-left"}`}>
              {isArabic ? "مكان التوصيل" : "Delivery Location "}
            </h2>
            
            <div>
              <label className={`block font-semibold  text-xs text-gray-600 mb-1 ${isArabic ? "text-right" : "text-left"}`}>
                {isArabic ? "المدينة" : "City"}
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full font-semibold border border-gray-300 rounded px-3 py-2 text-right text-[13px]"
                required
              >
                <option className={`font-semibold ${isArabic ? "text-right" : "text-left"}`} value="">{isArabic ? "اختر المدينة" : "Select City"}</option>
                {cities.map((city) => (
                  <option className={`font-semibold ${isArabic ? "text-right" : "text-left"}`} key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>

            {selectedCity && (
              <div>
                <label className={`block font-semibold  text-xs text-gray-600 mb-1 ${isArabic ? "text-right" : "text-left"}`}>
                  {isArabic ? "المنطقة" : "Zone"}
                </label>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full font-semibold border border-gray-300 rounded px-3 py-2 text-right text-[13px]"
                  required
                >
                  <option className={`font-semibold ${isArabic ? "text-right" : "text-left"}`} value="">{isArabic ? "اختر المنطقة" : "Select Zone"}</option>
                  {zones.filter(zone => !zone.isDeleted).map((zone) => (
                    <option className={`font-semibold ${isArabic ? "text-right" : "text-left"}`} key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="mt-4">
              <h3 className={`text-[10px] font-medium ${isArabic ? "text-right" : "text-left"} mb-2`}>
                {isArabic ? "هل لديك كود خصم؟" : "Have a promo code?"}
              </h3>
              <div className="flex flex-col gap-2">
                <div className={`flex flex-row items-center gap-2 ${isArabic ? "" : "flex-row-reverse"}`}>
                  {isPromoApplied ? (
                    <button
                      onClick={handleCancelPromoCode}
                      className="w-2/5 font-medium bg-white text-red-600 border border-red-600 px-3 py-2.5 rounded text-[11px]"
                    >
                      {isArabic ? "إلغاء" : "Cancel"}
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyPromoCode}
                      className="w-2/5 bg-white text-green-600 border border-green-600 hover:bg-green-600 hover:text-white transition px-3 py-2.5 rounded text-[11px] font-medium"
                    >
                      {isArabic ? "تطبيق" : "Apply"}
                    </button>
                  )}
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder={isArabic ? "أدخل كود الخصم" : "Enter Promo Code"}
                    className={`w-3/5 border font-medium border-gray-300 rounded px-3 py-2.5  text-[11px] ${isArabic ? "text-right" : "text-left"}`}
                    disabled={isPromoApplied}
                  />
                </div>
                {promoError && (
                  <p className="text-red-500 font-medium text-[11px] text-right">{promoError}</p>
                )}
                {isPromoApplied && (
                  <p className={`text-green-600 font-medium text-[11px] ${isArabic ? "text-right" : "text-left" }`}>
                    {isArabic ? "تم تطبيق كود الخصم بنجاح": "Promo code applied successfully!"}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                if (!selectedCity || !selectedZone) {
                  toast.error(isArabic ? "يرجى اختيار المدينة والمنطقة" : "Please select city and zone");
                  return;
                }
                setActiveStep(2);
              }}
              className="w-full bg-red-600 text-white py-2 rounded text-sm font-light hover:bg-red-700 disabled:bg-gray-400"
            >
              {isArabic ? "استمرار" : "Continue"}
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className={`text-[20px] font-extrabold mb-3 ${isArabic ? "text-right" : "text-left"}`}>
              {isArabic ? "معلومات التوصيل" : "Delivery Information"}
            </h2>
            <div>
              <label className={`block font-semibold text-xs text-gray-600 mb-1 ${isArabic ? "text-right" : "text-left"}`}>
                {isArabic ? "الاسم الأول" : "First Name"}
              </label>
              <input
                type="text"
                name="firstname"
                value={checkoutForm.firstname}
                onChange={(e) => setCheckoutForm({...checkoutForm, firstname: e.target.value})}
                className={`w-full border border-gray-300 rounded px-3 py-2 text-sm font-alexandria ${isArabic ? "text-right" : "text-left"}`}
                required
              />
            </div>
            <div>
              <label className={`block font-semibold text-xs text-gray-600 mb-1 ${isArabic ? "text-right" : "text-left"}`}>
                {isArabic ? "الاسم الأخير" : "Last Name"}
              </label>
              <input
                type="text"
                name="lastname"
                value={checkoutForm.lastname}
                onChange={(e) => setCheckoutForm({...checkoutForm, lastname: e.target.value})}
                className={`w-full border border-gray-300 rounded px-3 py-2 text-sm font-alexandria ${isArabic ? "text-right" : "text-left"}`}
                required
              />
            </div>

            <div>
              <label className={`block font-semibold text-xs text-gray-600 mb-1 ${isArabic ? "text-right" : "text-left"}`}>
                {isArabic ? "الهاتف" : "Phone"}
              </label>
              <input
                type="tel"
                name="phone"
                value={checkoutForm.phone}
                onChange={(e) => handleMainPhoneChange(e.target.value)}
                className={`w-full border ${checkoutForm.phone && checkoutForm.phone.length === 11 && !/^01[0125][0-9]{8}$/.test(checkoutForm.phone) ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm font-alexandria ${isArabic ? "text-right" : "text-left"}`}
                required
              />
              {checkoutForm.phone && checkoutForm.phone.length === 11 && !/^01[0125][0-9]{8}$/.test(checkoutForm.phone) && (
                <p className={`text-red-500 text-xs mt-1 ${isArabic ? "text-right" : "text-left"}`}>
                  {isArabic ? "يرجى إدخال رقم هاتف مصري صحيح" : "Please enter a valid Egyptian phone number"}
                </p>
              )}
            </div>
           
            {extraPhones.map((phone, index) => (
              <div key={index}>
                <label className={`block font-semibold text-xs text-gray-600 mb-1 ${isArabic ? "text-right" : "text-left"}`}>
                  {isArabic ? `هاتف إضافي ${index + 1}` : `Extra Phone ${index + 1}`}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handleExtraPhoneChange(index, e.target.value)}
                  className={`w-full border ${phone && phone.length === 11 && !/^01[0125][0-9]{8}$/.test(phone) ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm font-alexandria font-light ${isArabic ? "text-right" : "text-left"}`}
                />
                {phone && phone.length === 11 && !/^01[0125][0-9]{8}$/.test(phone) && (
                  <p className={`text-red-500 text-xs mt-1 ${isArabic ? "text-right" : "text-left"}`}>
                    {isArabic ? "يرجى إدخال رقم هاتف مصري صحيح" : "Please enter a valid Egyptian phone number"}
                  </p>
                )}
              </div>
            ))}

            <div>
              <label className={`block font-semibold text-xs text-gray-600 mb-1 ${isArabic ? "text-right" : "text-left"}`}>
                {isArabic ? "العنوان" : "Address"}
              </label>
              <input
                type="text"
                name="address"
                value={checkoutForm.address}
                onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})}
                className={`w-full border border-gray-300 rounded px-3 py-2 text-sm font-alexandria ${isArabic ? "text-right" : "text-left"}`}
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="w-1/2 bg-gray-200 text-gray-800 py-2 rounded text-sm font-bold hover:bg-gray-300"
              >
                {isArabic ? "رجوع" : "Back"}
              </button>
              <button
                onClick={() => {
                  const nameRegex = /^[a-zA-Z\u0600-\u06FF\s]+$/;
                  
                  if (!checkoutForm.firstname || !nameRegex.test(checkoutForm.firstname)) {
                    toast.error(isArabic ? "يرجى إدخال الاسم الأول بشكل صحيح (أحرف فقط)" : "Please enter a valid first name (letters only)");
                    return;
                  }
                  
                  if (!checkoutForm.lastname || !nameRegex.test(checkoutForm.lastname)) {
                    toast.error(isArabic ? "يرجى إدخال الاسم الأخير بشكل صحيح (أحرف فقط)" : "Please enter a valid last name (letters only)");
                    return;
                  }

                  if (!checkoutForm.phone || checkoutForm.phone.length < 11) {
                    toast.error(isArabic ? "يرجى إدخال رقم هاتف مكون من 11 رقم" : "Please enter an 11-digit phone number");
                    return;
                  }
                  if (!isAllPhonesValid()) {
                    toast.error(isArabic ? "يرجى إدخال رقم هاتف صحيح" : "Please enter a valid phone number");
                    return;
                  }
                  if (!checkoutForm.address || checkoutForm.address.length < 8) {
                    toast.error(isArabic ? "يرجى إدخال عنوان صحيح (8 أحرف على الأقل)" : "Please enter a valid address (minimum 8 characters)");
                    return;
                  }
                  setActiveStep(3);
                }}
                className="w-1/2 bg-red-600 text-white py-2 rounded text-sm font-bold hover:bg-red-700 disabled:bg-gray-400"
              >
                {isArabic ? "استمرار" : "Continue"}
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className={`text-[20px] font-extrabold mb-3 ${isArabic ? "text-right" : "text-left"}`}>
              {isArabic ? "طريقة الدفع" : "Payment Method"}
            </h2>
           
            <div className="flex flex-col gap-4 mb-4">
              <label className={`flex items-center text-[14px] font-medium gap-2 justify-end ${isArabic ? "" : "flex-row-reverse"} `}>
               <span>
                 {isArabic ? "الدفع عند الاستلام" : "Cash on Delivery"}
                </span>
                <input
                  type="radio"
                  name="paymentType"
                  checked={paymentType === "cod"}
                  onChange={() => setPaymentType("cod")}
                  className="h-4 w-4 text-red-600"
                  disabled={isSubmitting}
                />
              </label>
              <label className={`flex items-center text-[14px] font-medium gap-2 justify-end ${isArabic ? "" : "flex-row-reverse"} `}>
                <span>
                {isArabic ? "الدفع الالكتروني" : "Online Payment "}
                </span>
                <input
                  type="radio"
                  name="paymentType"
                  checked={paymentType === "online"}
                  onChange={() => setPaymentType("online")}
                  className="h-4 w-4 font-semibold text-red-600"
                  disabled={isSubmitting}
                />
              </label>
            </div>
           
            {paymentType === "online" && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.paymentId}
                    className={`p-3 border rounded cursor-pointer flex flex-col items-center ${
                      selectedOnlinePayment === method.paymentId.toString() ? "border-red-600 bg-red-50" : "border-gray-200"
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !isSubmitting && setSelectedOnlinePayment(method.paymentId.toString())}
                  >
                    <img src={method.logo} alt={method.name_en} className="h-10 object-contain mb-2" />
                    <span className="text-xs text-center">{isArabic ? method.name_ar : method.name_en}</span>
                  </div>
                ))}
              </div>
            )}
           
            <button
              onClick={handleSubmitOrder}
              disabled={!paymentType || (paymentType === "online" && !selectedOnlinePayment) || isSubmitting}
              className="w-full bg-red-600 text-white py-2 rounded text-sm font-bold hover:bg-red-700 disabled:bg-gray-400 relative"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  {isArabic ? "جاري تقديم الطلب..." : "Submitting Order..."}
                </div>
              ) : (
                isArabic ? "تأكيد الطلب" : "Place Order"
              )}
            </button>
           
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded text-sm font-bold hover:bg-gray-300"
              disabled={isSubmitting}
            >
              {isArabic ? "رجوع" : "Back"}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  // Render related products slider
  const renderRelatedProducts = () => {
    if (loadingRelated) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      );
    }

    // Filter out any null or undefined products
    const availableProducts = relatedProducts.filter(product => product && product.skuId);
    
    if (availableProducts.length === 0) {
      return null;
    }

    // If we have less than 4 products, don't use the slider
    if (availableProducts.length <= 4) {
      return (
        <div className={`-mt-8`}>
          
          <h2 className={`text-[20px] font-extrabold mb-3 ${isArabic ? "text-right mr-[8%]" : "text-left ml-[10%]"}`}>
            {isArabic ? "منتجات قد تعجبك" : "You May also Like"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availableProducts.map((product) => (
              <div key={product.skuId} className={`${style.slideItem} px-1`}>
                <div className="relative bg-white rounded-lg shadow-md overflow-hidden group mx-auto">
                  <div className="relative overflow-hidden">
                    {product.priceBefore && product.priceAfter && product.priceBefore > product.priceAfter && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] px-1 py-[2px] rounded-md z-10 font-alexandria font-medium">
                        {Math.round(
                          ((product.priceBefore - product.priceAfter) /
                            product.priceBefore) *
                          100
                        )}
                        % {isArabic ? "خصم" : "Off"}
                      </div>
                    )}

                    <Link to={`/Productdetails/${product.skuId}`}>
                      <img
                        src={product.Images?.[0]?.url || "https://via.placeholder.com/150"}
                        className="w-full h-40 sm:h-28 object-contain p-2 transition-transform duration-300 ease-in-out hover:scale-110"
                        alt={isArabic ? product.nameAr : product.nameEn}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                      />
                    </Link>
                    <div className="absolute top-2 right-3 flex flex-col space-y-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToWishlist(product.skuId);
                        }}
                        className="p-1.5 bg-gray-100 rounded-full transition-colors hover:bg-gray-200"
                        title={isArabic ? "Add to Wishlist" : "أضف للمفضلة"}
                      >
                        <FaHeart className="h-[13px] w-[13px] sm:h-4 sm:w-4 text-red-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleQuickViewClick(product);
                        }}
                        className="p-1.5 bg-gray-100 rounded-full transition-colors hover:bg-gray-200"
                        title={isArabic ? "نظره سريعه" : "Quick View"}
                      >
                        <FaEye className="h-[13px] w-[13px] sm:h-4 sm:w-4 text-gray-700" />
                      </button>
                    </div>
                  </div>
                  <div className="p-1 pb-6 sm:p-2 sm:pb-8 relative overflow-y-hidden">
                    <h3 className={`alexandria-500 text-[13px] sm:text-[16px] mb-0.5 sm:mb-1 line-clamp-1 ${isArabic ? "text-right" : "text-left"}`}>
                      {isArabic ? product.nameAr : product.nameEn}
                    </h3>
                    <p className={`text-gray-500 font-sans text-[11px] sm:text-[13px] mb-0.5 sm:mb-1 ${isArabic ? "text-right" : "text-left"}`}>
                      {product.company || "Company Name"}
                    </p>

                    <p
                      className={`flex items-center text-gray-600 mb-0.5 sm:mb-1 text-[15px] font-medium ${isArabic ? "justify-start text-right" : "justify-start text-left"}`}
                      dir={isArabic ? "rtl" : "ltr"}
                    >
                      <span className={`text-gray-500 text-[15px] ${isArabic ? "mr-1" : "ml-1"}`}>
                        {isArabic ? `${product.priceAfter} جنية` : `${product.priceAfter} EGP`}
                      </span>
                      {product.priceBefore && product.priceBefore > product.priceAfter && (
                        <span className={`text-red-400 line-through text-[11px] ${isArabic ? "mr-1" : "ml-1"}`}>
                          {isArabic ? `${product.priceBefore} جنية` : `${product.priceBefore} EGP`}
                        </span>
                      )}
                    </p>
                    <p className={`text-gray-500 font-medium sm:mb-1 text-[10px] sm:text-[10px] line-clamp-2 mb-8 ${isArabic ? "text-right" : "text-left"}`} style={{ minHeight: '31px' }}>
                      {isArabic ? product.cardDescriptionAr : product.cardDescriptionEn}
                    </p>
                    <button
                      className={`${style.addToCartButton} text-[12px] font-semibold sm:text-[12px] flex flex-row-reverse ${isArabic ? "flex-row" : ""} gap-2 items-center justify-center`}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product.skuId);
                      }}
                    >
                      {isArabic ? "أضف إلى السلة" : "Add to Cart"}
                      <img
                        src={cart}
                        alt="Cart"
                        className="inline-block w-5 h-5 sm:w-5 sm:h-5 mr-1 mb-[3px]"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Otherwise, use the slider
    return (
      <div className="mt-8">
        <h2 className={`text-[20px] font-extrabold mb-3 ${isArabic ? "text-right mr-8" : "text-left ml-8"}`}>
          {isArabic ? "منتجات قد تعجبك" : "You May also Like"}
        </h2>
        
        <Slider {...sliderSettings}>
          {availableProducts.map((product) => (
            <div key={product.skuId} className={`${style.slideItem} px-1`}>
              <div className="relative bg-white rounded-lg shadow-md overflow-hidden group mx-auto">
                <div className="relative overflow-hidden">
                  {product.priceBefore && product.priceAfter && product.priceBefore > product.priceAfter && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] px-1 py-[2px] rounded-md z-10 font-alexandria font-medium">
                      {Math.round(
                        ((product.priceBefore - product.priceAfter) /
                          product.priceBefore) *
                        100
                      )}
                      % {isArabic ? "خصم" : "Off"}
                    </div>
                  )}

                  <Link to={`/Productdetails/${product.skuId}`}>
                    <img
                      src={product.Images?.[0]?.url || "https://via.placeholder.com/150"}
                      className="w-full h-40 sm:h-28 object-contain p-2 transition-transform duration-300 ease-in-out hover:scale-110"
                      alt={isArabic ? product.nameAr : product.nameEn}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                    />
                  </Link>
                  <div className="absolute top-2 right-3 flex flex-col space-y-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToWishlist(product.skuId);
                      }}
                      className="p-1.5 bg-gray-100 rounded-full transition-colors hover:bg-gray-200"
                      title={isArabic ? "Add to Wishlist" : "أضف للمفضلة"}
                    >
                      <FaHeart className="h-[13px] w-[13px] sm:h-4 sm:w-4 text-red-500" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleQuickViewClick(product);
                      }}
                      className="p-1.5 bg-gray-100 rounded-full transition-colors hover:bg-gray-200"
                      title={isArabic ? "نظره سريعه" : "Quick View"}
                    >
                      <FaEye className="h-[13px] w-[13px] sm:h-4 sm:w-4 text-gray-700" />
                    </button>
                  </div>
                </div>
                <div className="p-1 pb-6 sm:p-2 sm:pb-8 relative overflow-y-hidden">
                  <h3 className={`alexandria-500 text-[13px] sm:text-[16px] mb-0.5 sm:mb-1 line-clamp-1 ${isArabic ? "text-right" : "text-left"} ${isArabic ? "direction: rtl" : ""}`} style={{ direction: isArabic ? "rtl" : "ltr" }}>
                    {isArabic ? product.nameAr : product.nameEn}
                  </h3>
                  <p className={`text-gray-500 font-sans text-[11px] sm:text-[13px] mb-0.5 sm:mb-1 ${isArabic ? "text-right" : "text-left"}`}>
                    {product.company || "Company Name"}
                  </p>

                  <p
                    className={`flex items-center text-gray-600 mb-0.5 sm:mb-1 text-[15px] font-medium ${isArabic ? "justify-start text-right" : "justify-start text-left"}`}
                    dir={isArabic ? "rtl" : "ltr"}
                  >
                    <span className={`text-gray-500 text-[15px] ${isArabic ? "mr-1" : "ml-1"}`}>
                      {isArabic ? `${product.priceAfter} جنية` : `${product.priceAfter} EGP`}
                    </span>
                    {product.priceBefore && product.priceBefore > product.priceAfter && (
                      <span className={`text-red-400 line-through text-[11px] ${isArabic ? "mr-1" : "ml-1"}`}>
                        {isArabic ? `${product.priceBefore} جنية` : `${product.priceBefore} EGP`}
                      </span>
                    )}
                  </p>
                  <p className={`text-gray-500 font-medium sm:mb-1 text-[10px] sm:text-[10px] line-clamp-2 mb-8 ${isArabic ? "text-right" : "text-left"}`} style={{ minHeight: '31px' }}>
                    {isArabic ? product.cardDescriptionAr : product.cardDescriptionEn}
                  </p>
                  <button
                    className={`${style.addToCartButton} text-[12px] font-semibold sm:text-[12px] flex flex-row-reverse ${isArabic ? "flex-row" : ""} gap-2 items-center justify-center`}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product.skuId);
                    }}
                  >
                    {isArabic ? "أضف إلى السلة" : "Add to Cart"}
                    <img
                      src={cart}
                      alt="Cart"
                      className="inline-block w-5 h-5 sm:w-5 sm:h-5 mr-1 mb-[3px]"
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mt-[8em] md:mt-[7vw] mx-auto p-4">
      {cartItems.length > 0 && (
        <h1 className={`text-xl font-bold ${isArabic ? "text-right" : "text-left ml-2"} mb-4`}>
          {isArabic ? "سلة التسوق" : "Shopping Cart "}
        </h1>
      )}
     
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : cartItems.length > 0 ? (
        <>
          {/* Mobile Layout - Stacked */}
          <div className="block lg:hidden">
            <div className="space-y-4">
              {/* Cart Items */}
              {renderCartItems()}
              
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm p-4 border">
                {userlogin ? (
                  <>
                    {renderOrderSummary()}
                    {renderStepIndicator()}
                    {renderStepContent()}
                  </>
                ) : (
                  <div className={`p-4 bg-gray-50 rounded-lg ${isArabic ? "text-right" : "text-left"}`}>
                    <h3 className={`text-sm font-medium mb-2 ${isArabic ? "text-right" : "text-left"}`}>
                      {isArabic ? "سجل الدخول لإتمام الطلب" : "Login to complete the order"}
                    </h3>
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full bg-red-600 text-white py-2 rounded text-sm font-bold hover:bg-red-700"
                    >
                      {isArabic ? "تسجيل الدخول" : "Login "}
                    </button>
                  </div>
                )}
              </div>
              
              {/* Related Products */}
              {renderRelatedProducts()}
            </div>
          </div>
          
          {/* Desktop Layout - Side by Side */}
          <div className="hidden lg:flex flex-col">
            {/* Main content row with order summary and cart items */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              {/* Order Summary Column */}
              <div className="lg:w-1/3">
                <div className="bg-white rounded-lg shadow-sm p-4 border">
                  {userlogin ? (
                    <>
                      {renderOrderSummary()}
                      {renderStepIndicator()}
                      {renderStepContent()}
                    </>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className={`text-sm font-medium mb-2 ${isArabic ? "text-right" : "text-left"}`}>
                        {isArabic ? "سجل الدخول لإتمام الطلب" : "Login to complete the order"}
                      </h3>
                      <button
                        onClick={() => navigate("/login")}
                        className="w-full bg-red-600 text-white py-2 rounded text-sm font-bold hover:bg-red-700"
                      >
                        {isArabic ? "تسجيل الدخول" : "Login "}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Cart Items Column */}
              <div className="lg:w-2/3">
                {renderCartItems()}
              </div>
            </div>

            {/* Related Products Slider - Full Width */}
            <div className="w-full -mt-9">
              {renderRelatedProducts()}
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-md mx-auto mt-[18vh] p-6 bg-white rounded-lg shadow-md text-center" style={{ fontFamily: "'Alexandria', sans-serif" }}>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{isArabic ? "سلة التسوق فارغة" : "Your Cart is Empty"}</h2>
          <p className="text-gray-700 mb-4 font-medium">{isArabic ? "لم تقم بإضافة أي منتجات إلى سلة التسوق بعد" : "You haven't added any products to your cart yet"}</p>
          <Link to="/" className="inline-block px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium">
            {isArabic ? "تصفح المنتجات" : "Browse Products"}
          </Link>
        </div>
      )}

      {/* Quick View Modal */}
      {isQuickViewOpen && selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[95] p-2 sm:p-4"
          onClick={handleCloseQuickView}
        >
          <div
            className="bg-white rounded-lg relative w-full max-w-xs sm:max-w-md md:max-w-lg p-3 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-1 right-1 sm:top-2 sm:right-2 text-gray-600 hover:text-gray-800 z-10 w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm"
              onClick={handleCloseQuickView}
            >
              <FaTimes className="w-6 h-6 sm:w-4 sm:h-4" />
            </button>

            {selectedProduct.priceBefore &&
              selectedProduct.priceAfter &&
              selectedProduct.priceBefore > selectedProduct.priceAfter && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-[16px] font-normal px-1 py-0 rounded-md z-10 font-alexandria font-medium">
                  {Math.round(
                    ((selectedProduct.priceBefore - selectedProduct.priceAfter) /
                      selectedProduct.priceBefore) *
                    100
                  )}
                  % {isArabic ? "خصم" : "Off"}
                </div>
              )}

            {selectedProduct.availableStock <= 0 && (
              <div className="absolute top-2 left-2 bg-gray-600 text-white text-[16px] font-bold px-2 py-0 rounded-md z-10 font-alexandria font-medium">
                {isArabic ? "غير متوفر" : "Out of Stock"}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="w-full sm:w-1/2 flex justify-center">
                <img
                  src={selectedProduct.Images?.[0]?.url || "https://via.placeholder.com/150"}
                  alt={selectedProduct.nameAr}
                  className="w-32 h-32 sm:w-40 sm:h-40 object-contain rounded-lg"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                />
              </div>
              <div className="w-full sm:w-1/2 text-right">
                <h3 className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 ${isArabic ? "text-right" : "text-left"}`}>
                  {isArabic ? selectedProduct.nameAr : selectedProduct.nameEn}
                </h3>

                <p
                  className={`flex items-center text-gray-600 mb-0.5 sm:mb-1 text-[15px] font-medium ${isArabic ? "justify-start text-right" : "justify-start text-left"}`}
                  dir={isArabic ? "rtl" : "ltr"}
                >
                  <span className={`text-gray-500 text-[15px] ${isArabic ? "mr-1" : "ml-1"}`}>
                    {isArabic ? `${selectedProduct.priceAfter} جنية` : `${selectedProduct.priceAfter} EGP`}
                  </span>
                  {selectedProduct.priceBefore && selectedProduct.priceBefore > selectedProduct.priceAfter && (
                    <span className={`text-red-400 line-through text-[11px] ${isArabic ? "mr-1" : "ml-1"}`}>
                      {isArabic ? `${selectedProduct.priceBefore} جنية` : `${selectedProduct.priceBefore} EGP`}
                    </span>
                  )}
                </p>
                <p className={`text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4 line-clamp-3 ${isArabic ? "text-right" : "text-left"}`} style={{ minHeight: '31px' }}>
                  {isArabic ? selectedProduct.cardDescriptionAr : selectedProduct.cardDescriptionEn}
                </p>
                <div className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 ${isArabic ? "justify-end" : "justify-start"}`}>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs sm:text-sm w-full sm:w-auto font-alexandria font-light whitespace-nowrap"
                    onClick={() => {
                      if (selectedProduct.availableStock > 0) {
                        addToCart(selectedProduct.skuId);
                      } else {
                        toast.error(isArabic ? "المنتج غير متوفر" : "Product Out of Stock", {
                          style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 }
                        });
                      }
                    }}
                    disabled={selectedProduct.availableStock <= 0}
                  >
                    {selectedProduct.availableStock <= 0
                      ? (isArabic ? "غير متوفر" : "Out of Stock")
                      : (isArabic ? "أضف إلى السلة" : "Add to Cart")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;