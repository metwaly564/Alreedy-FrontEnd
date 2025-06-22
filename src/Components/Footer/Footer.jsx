import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import {
  FaShoppingCart,
  FaHeart,
  FaUserAlt,
  FaHome,
  FaClipboardList,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { CartContext } from "../../Context/CartContexrt";
import { UserContext } from "../../Context/UserContext";

export default function Footer() {
  const location = useLocation();
  const isUserLoggedIn = localStorage.getItem("userToken") !== null;
  const { cartCount, wishlistCount } = useContext(CartContext);
const {isArabic} = useContext(UserContext)
 
  const hiddenFooterRoutes = [
    '/login',
    '/signup',
    '/register',
    '/ForgetPassword',
    '/PasswordReset',
    '/StaffLogin',
    '/AdminEditProducts',
    '/AdminDashboard',
    '/AdminAddProducts',
    '/AdminEditUsers',
    '/AdminEditCities',
    '/AdminEditTags',
    '/ProductsAnalysis',
    '/PromoCodesAnalysis',
    '/UsersAnalysis',
    '/AdminEditDeliveryBoys',
    '/AdminEditPromoCode',
    '/AdminEditCateg',
    '/OperationTeamDashboard',
    '/AdminEditStaff',
    '/AdminSalesDashboard',
    '/EditProduct',
    '/AdminAddNewPromoCode'
  ];

  if (hiddenFooterRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-0 font-medium left-0 w-full bg-white border-t border-gray-200 md:hidden" style={{zIndex:"49"}}>
      <div className={`flex justify-around items-center ${isUserLoggedIn ? 'pb-2 pt-3' : 'mb-[10px] mt-[-5px]'}`}>
        <NavLink to="/cart" className={`flex flex-col items-center ${isUserLoggedIn ? 'mt-[-20px]' : ''}`}>
          <span className={`w-4 h-4 rounded-full bg-red-500 flex justify-center items-center text-white font-medium text-[12px] p-[10px] relative right-1 top-2 overflow-y-hidden ${cartCount > 0 ? 'opacity-90' : 'opacity-0'}`}>
            {cartCount}
          </span>
          <FaShoppingCart
            className={`text-lg transition-colors duration-200 ${
              location.pathname === "/cart" ? "text-[rgb(170,15,18)]" : "text-gray-600"
            }`}
          />
          <span
            className={`text-xs transition-colors duration-200  ${
              location.pathname === "/cart" ? "text-[rgb(170,15,18)]" : "text-gray-600"
            }`}
          >
            {isArabic ? "التسوق":"Shop"}
          </span>
        </NavLink>

        <NavLink to="/wishlist" className={`flex flex-col items-center ${isUserLoggedIn ? 'mt-[-19px]' : ''}`}>
          <span className={`w-4 h-4 rounded-full bg-red-500 flex justify-center items-center text-white font-medium text-[12px] p-[9px] relative right-1 top-2 overflow-y-hidden ${wishlistCount > 0 ? 'opacity-90' : 'opacity-0'}`}>
            {wishlistCount}
          </span>
          <FaHeart
            className={`text-lg transition-colors duration-200 ${
              location.pathname === "/wishlist" ? "text-[rgb(170,15,18)]" : "text-gray-600"
            }`}
          />
          <span
            className={`text-xs transition-colors duration-200 ${
              location.pathname === "/wishlist" ? "text-[rgb(170,15,18)]" : "text-gray-600"
            }`}
          >
                     {isArabic ? "الامنيات":"Wishlist"}
                     </span>
        </NavLink>
       
        <NavLink to="/orders" className={`flex flex-col items-center ${isUserLoggedIn ? 'mt-[-1px]' : 'mt-[19px]'}`}>
          <FaClipboardList
            className={`text-lg transition-colors duration-200 ${
              location.pathname === "/orders" ? "text-[rgb(170,15,18)]" : "text-gray-600"
            }`}
          />
          <span
            className={`text-xs transition-colors duration-200 ${
              location.pathname === "/orders" ? "text-[rgb(170,15,18)]" : "text-gray-600"
            }`}
          >
            {isArabic ? "الطلبات" : "Orders"}
          </span>
        </NavLink>
        
        <NavLink to="/Account" className={`flex flex-col items-center ${!isUserLoggedIn ? 'mt-[19px]' : ''}`}>
          <FaUserAlt
            className={`text-lg transition-colors duration-200 ${
              location.pathname === "/Account" ? "text-[rgb(170,15,18)]" : "text-gray-600"
            }`}
          />
          <span
            className={`text-xs transition-colors duration-200 ${
              location.pathname === "/Account" ? "text-[rgb(170,15,18)]" : "text-gray-600"
            }`}
          >
            {isArabic ? "الحساب":"Account"}
          </span>
        </NavLink>
        
        <NavLink to="/" className={`flex flex-col items-center ${!isUserLoggedIn ? 'mt-[19px]' : ''}`}>
          <FaHome
            className={`text-lg transition-colors duration-200 ${
              location.pathname === "/" ? "text-[rgb(170,15,18)]" : "text-gray-600"
            }`}
          />
          <span
            className={`text-xs transition-colors duration-200 ${
              location.pathname === "/" ? "text-[rgb(170,15,18)]" : "text-gray-600"
            }`}
          >
            {isArabic ? "الرئيسية":"HOME"}
          </span>
        </NavLink>
      </div>
    </div>
  );
}