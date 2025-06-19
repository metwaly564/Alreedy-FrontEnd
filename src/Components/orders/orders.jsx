/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../Context/UserContext';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import style from './Orders.module.css';
import { FaCheckCircle, FaBox, FaTruck, FaHome } from 'react-icons/fa';

export default function Orders() {
  const { isArabic } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [apiToken, setApiToken] = useState(null);
  const { setIsOrdersLoading } = useContext(UserContext);
  useEffect(() => {
    const initialize = async () => {
      await getApiToken();
    };
    initialize();
  }, []);

  useEffect(() => {
    if (apiToken) {
      fetchUserData();
    }
  }, [apiToken]);

  const getApiToken = async () => {
    try {
      //to Get Api Token
      const response = await axios.post('https://admin.reedyph.com/api/token', {
        username: "api",
        password: "1213646522"
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      setApiToken(response.data.token);
    } catch (error) {
      console.error('Error getting API token:', error);
      toast.error(isArabic ? 'حدث خطأ في الاتصال بالخادم' : 'Error connecting to server');
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    setIsOrdersLoading(true);
    try {
      const userToken = localStorage.getItem('userToken');
      if (!userToken) {
        toast.error(isArabic ? 'الرجاء تسجيل الدخول لعرض الطلبات' : 'Please login to view orders');
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          'Access-Token': userToken,
        },
      };
      // to get User phone number
      const response = await axios.get('https://reedyph.com/api/v1/users/user', config);
      setPhoneNumber(response.data.phone);
      fetchOrders(response.data.phone);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const fetchOrders = async (phone) => {
    try {
      if (!apiToken) {
        console.error('No API token available');
        return;
      }

      const response = await axios.get(`https://admin.reedyph.com/api/orders/by_phone?phone=${phone}`, {
        headers: {
          'Authorization': `Bearer ${apiToken}`
        }
      });
      setOrders(response.data);

    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(isArabic ? 'حدث خطأ في جلب بيانات الطلبات' : 'Error fetching orders data');

    } finally {
      setLoading(false);
    }
  };

  const isActiveStatus = (currentOrderStatus, targetStatus) => {
    const statusOrder = ['pending', 'received', 'prepared', 'dispatched', 'collected', 'delivered'];
    let effectiveStatus = currentOrderStatus === 'dispatched' ? 'collected' : currentOrderStatus;
    const currentIndex = statusOrder.indexOf(effectiveStatus);
    const targetIndex = statusOrder.indexOf(targetStatus);
    return currentIndex >= targetIndex;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', options);
  };

  return (
    <div className={`min-h-screen mt-[7em] sm:mt-[4em] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-alexandria ${style.ordersContainer}`} style={{ fontFamily: "'Alexandria', sans-serif" }}>
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center pb-4 mb-4" style={{ fontFamily: "'Alexandria', sans-serif" }}>
          {isArabic ? 'طلباتي' : 'My Orders'}
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 font-alexandria font-light">
            <p className="text-gray-600 text-lg font-alexandria font-light">
              {isArabic ? 'لا توجد طلبات لعرضها' : 'No orders to display'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const progressScale =
                order.status === 'pending' ? 0 :
                  order.status === 'received' ? 0.25 :
                    order.status === 'prepared' ? 0.5 :
                      order.status === 'dispatched' || order.status === 'collected' ? 0.75 :
                        1;

              return (
                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <div className={`flex justify-between items-center ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {isArabic ? 'طلب #' : 'Order #'}{order.id}
                      </h2>
                      <span className="text-sm text-gray-500">{formatDate(order.created_at)}</span>
                    </div>
                    <div className={`flex justify-between items-center mt-2 ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-sm font-medium">
                        {isArabic ? 'المجموع:' : 'Total:'} {order.total_amount} {isArabic ? 'جنية' : 'EGP'}
                      </span>
                      <span className="text-sm font-medium">
                        {isArabic ? 'طريقة الدفع:' : 'Payment:'}
                        {order.payment_method === 'card' ? (isArabic ? 'بطاقة' : 'Card') :
                          order.payment_method === 'online' ? (isArabic ? 'اونلاين' : 'Online') :
                            order.payment_method === 'wallet' ? (isArabic ? 'محفظة' : 'Wallet') :
                              (isArabic ? 'نقدي' : 'Cash')}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className={`text-md font-medium text-gray-700 mb-2 ${isArabic ? 'text-right' : 'text-left'}`}>
                      {isArabic ? ': المنتجات' : 'Products:'}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className={`flex ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
                            <th className={`text-xs font-medium text-gray-500 ${isArabic ? 'text-right' : 'text-left'} pb-2 flex-1`}>
                              {isArabic ? 'المنتج' : 'Product'}
                            </th>
                            <th className={`text-xs font-medium text-gray-500 ${isArabic ? 'text-right' : 'text-left'} pb-2 flex-[0.5] `}>
                              {isArabic ? 'الكمية' : 'Quantity'}
                            </th>
                            <th className={`text-xs font-medium text-gray-500 ${isArabic ? 'text-right' : 'text-left'} pb-2 flex-3`}>
                              {isArabic ? 'السعر' : 'Price'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, index) => (
                            <tr key={index} className={`flex ${isArabic ? 'flex-row-reverse' : 'flex-row'} border-t border-gray-100`}>
                              <td className={`py-2 ${isArabic ? 'text-right' : 'text-left'} flex-1`}>
                                {item.product_name}
                              </td>
                              <td className={`py-2 ${isArabic ? 'text-right' : 'text-left'} flex-1 flex-[0.48]`}>
                                {item.quantity}
                              </td>
                              <td className={`py-2 ${isArabic ? 'text-right' : 'text-left'} flex-3 flex-row-reverse`}>
                                <span className="text-sm font-medium">
                                  <span className='text-[1px]'>ـ</span>
                                  {isArabic ? ` ${item.total_price} جنية` : `${item.total_price} EGP`}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50">
                    <div className="relative">
                      <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200" style={{ zIndex: 0 }}>
                        <div
                          className="h-full bg-green-500 transition-all duration-500"
                          style={{
                            transform: `scaleX(${progressScale})`,
                            transformOrigin: isArabic ? 'right' : 'left',
                          }}
                        ></div>
                      </div>

                      <div className={`flex ${isArabic ? 'flex-row-reverse' : 'flex-row'} justify-between items-center relative`} style={{ zIndex: 1 }}>
                        <div className={`flex flex-col items-center ${isArabic ? 'text-right' : 'text-left'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActiveStatus(order.status, 'received') ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <FaHome className={`${isActiveStatus(order.status, 'received') ? 'text-green-500' : 'text-gray-400'}`} />
                          </div>
                          <span className={`text-xs mt-1 ${isActiveStatus(order.status, 'received') ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                            {isArabic ? 'تم الاستلام' : 'Received'}
                          </span>
                        </div>

                        <div className={`flex flex-col items-center ${isArabic ? 'text-right' : 'text-left'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActiveStatus(order.status, 'prepared') ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <FaBox className={`${isActiveStatus(order.status, 'prepared') ? 'text-green-500' : 'text-gray-400'}`} />
                          </div>
                          <span className={`text-xs mt-1 ${isActiveStatus(order.status, 'prepared') ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                            {isArabic ? 'تم التحضير' : 'Prepared'}
                          </span>
                        </div>

                        <div className={`flex flex-col items-center ${isArabic ? 'text-right' : 'text-left'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActiveStatus(order.status, 'collected') ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <FaTruck className={`${isActiveStatus(order.status, 'collected') ? 'text-green-500' : 'text-gray-400'}`} />
                          </div>
                          <span className={`text-xs mt-1 ${isActiveStatus(order.status, 'collected') ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                            {isArabic ? 'مع المندوب' : 'With Delivery'}
                          </span>
                        </div>

                        <div className={`flex flex-col items-center ${isArabic ? 'text-right' : 'text-left'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActiveStatus(order.status, 'delivered') ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <FaCheckCircle className={`${isActiveStatus(order.status, 'delivered') ? 'text-green-500' : 'text-gray-400'}`} />
                          </div>
                          <span className={`text-xs mt-1 ${isActiveStatus(order.status, 'delivered') ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                            {isArabic ? 'تم التسليم' : 'Delivered'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-200">
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isArabic ? 'text-right' : 'text-left'}`}>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">
                          {isArabic ? ': العنوان' : 'Address:'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {order.address}, {order.city}, {order.zone}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">
                          {isArabic ? ': مصدر الطلب' : 'Order Source:'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {order.order_source === 'Phone' ? (isArabic ? 'هاتف' : 'Phone') :
                            order.order_source === 'Whatsapp' ? (isArabic ? 'واتساب' : 'Whatsapp') :
                              order.order_source === 'Instagram' ? (isArabic ? 'انستجرام' : 'Instagram') :
                                order.order_source}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}