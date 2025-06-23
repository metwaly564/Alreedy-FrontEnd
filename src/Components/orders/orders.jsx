/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../Context/UserContext';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import style from './Orders.module.css';
import { FaCheckCircle, FaBox, FaTruck, FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Orders() {
  const { isArabic } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setIsOrdersLoading } = useContext(UserContext);
  const navigate = useNavigate();

  // Function to decode JWT token
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  };

  // Function to validate token and check for phone number
  const validateToken = () => {
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
      toast.error(isArabic ? 'يجب عليك تسجيل الدخول' : 'You should sign in.');
      navigate('/login');
      return false;
    }
    const decodedToken = decodeJWT(userToken);
    if (!decodedToken) {
      localStorage.removeItem('userToken');
      navigate('/login');
      return false;
    }
    if (!decodedToken.phone) {
      localStorage.removeItem('userToken');
      toast.error(isArabic ? 'جلسة غير صالحة. الرجاء تسجيل الدخول مرة أخرى.' : 'Invalid session. Please login again.');
      navigate('/login');
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!validateToken()) {
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsOrdersLoading(true);
    setLoading(true);
    
    try {
      const userToken = localStorage.getItem('userToken');
      
      if (!userToken) {
        setLoading(false);
        setIsOrdersLoading(false);
        return;
      }

      console.log('Fetching orders with token:', userToken);

      const response = await axios.get('https://admin.reedyph.com/api/orders/by_phone', {
        headers: {
          'Content-Type': 'application/json',
          'token': userToken
        }
      });

      console.log('API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);

      // Handle different response structures
      let ordersData = [];
      
      if (response.data) {
        // Check if response.data is an array
        if (Array.isArray(response.data)) {
          ordersData = response.data;
        }
        // Check if response.data has a data property that's an array
        else if (response.data.data && Array.isArray(response.data.data)) {
          ordersData = response.data.data;
        }
        // Check if response.data has an orders property that's an array
        else if (response.data.orders && Array.isArray(response.data.orders)) {
          ordersData = response.data.orders;
        }
        // Check if response.data has a results property that's an array
        else if (response.data.results && Array.isArray(response.data.results)) {
          ordersData = response.data.results;
        }
        else {
          console.warn('Unexpected response format:', response.data);
          console.warn('Response data type:', typeof response.data);
          console.warn('Response data keys:', Object.keys(response.data));
        }
      }

      console.log('Processed orders data:', ordersData);
      console.log('Orders count:', ordersData.length);

      setOrders(ordersData);

      if (ordersData.length === 0) {
        console.log('No orders found in the response');
      }

    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
      
      if (error.response) {
        if (error.response.status === 401) {
          toast.error(isArabic ? 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى' : 'Session expired, please login again');
        } else if (error.response.status === 404) {
          toast.error(isArabic ? 'لم يتم العثور على الطلبات' : 'No orders found');
        } else if (error.response.status === 500) {
          toast.error(isArabic ? 'خطأ في الخادم، يرجى المحاولة مرة أخرى' : 'Server error, please try again');
        } else {
          toast.error(isArabic ? `حدث خطأ في جلب بيانات الطلبات (${error.response.status})` : `Error fetching orders data (${error.response.status})`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        toast.error(isArabic ? 'تعذر الاتصال بالخادم' : 'Could not connect to server');
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', error.message);
        toast.error(isArabic ? 'حدث خطأ في إعداد الطلب' : 'Error setting up request');
      }
      
      // Set empty array on error to show "no orders" message
      setOrders([]);
    } finally {
      setLoading(false);
      setIsOrdersLoading(false);
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
            {orders.map((order, orderIndex) => {
              try {
                // Validate order structure
                if (!order || typeof order !== 'object') {
                  console.warn('Invalid order data at index', orderIndex, order);
                  return null;
                }

                // Ensure required properties exist
                const safeOrder = {
                  id: order.id || `order-${orderIndex}`,
                  created_at: order.created_at || new Date().toISOString(),
                  total_amount: order.total_amount || 0,
                  payment_method: order.payment_method || 'cash',
                  status: order.status || 'pending',
                  address: order.address || '',
                  city: order.city || '',
                  zone: order.zone || '',
                  order_source: order.order_source || '',
                  items: Array.isArray(order.items) ? order.items : []
                };

                const progressScale =
                  safeOrder.status === 'pending' ? 0 :
                    safeOrder.status === 'received' ? 0.25 :
                      safeOrder.status === 'prepared' ? 0.5 :
                        safeOrder.status === 'dispatched' || safeOrder.status === 'collected' ? 0.75 :
                          1;

                return (
                  <div key={safeOrder.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <div className={`flex justify-between items-center ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
                        <h2 className="text-lg font-semibold text-gray-800">
                          {isArabic ? 'طلب #' : 'Order #'}{safeOrder.id}
                        </h2>
                        <span className="text-sm text-gray-500">{formatDate(safeOrder.created_at)}</span>
                      </div>
                      <div className={`flex justify-between items-center mt-2 ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-sm font-medium">
                          {isArabic ? 'المجموع:' : 'Total:'} {safeOrder.total_amount} {isArabic ? 'جنية' : 'EGP'}
                        </span>
                        <span className="text-sm font-medium">
                          {isArabic ? 'طريقة الدفع:' : 'Payment:'}
                          {safeOrder.payment_method === 'card' ? (isArabic ? 'بطاقة' : 'Card') :
                            safeOrder.payment_method === 'online' ? (isArabic ? 'اونلاين' : 'Online') :
                              safeOrder.payment_method === 'wallet' ? (isArabic ? 'محفظة' : 'Wallet') :
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
                            {safeOrder.items.map((item, index) => {
                              try {
                                const safeItem = {
                                  product_name: item?.product_name || `Product ${index + 1}`,
                                  quantity: item?.quantity || 1,
                                  total_price: item?.total_price || 0
                                };

                                return (
                                  <tr key={index} className={`flex ${isArabic ? 'flex-row-reverse' : 'flex-row'} border-t border-gray-100`}>
                                    <td className={`py-2 ${isArabic ? 'text-right' : 'text-left'} flex-1`}>
                                      {safeItem.product_name}
                                    </td>
                                    <td className={`py-2 ${isArabic ? 'text-right' : 'text-left'} flex-1 flex-[0.48]`}>
                                      {safeItem.quantity}
                                    </td>
                                    <td className={`py-2 ${isArabic ? 'text-right' : 'text-left'} flex-3 flex-row-reverse`}>
                                      <span className="text-sm font-medium">
                                        <span className='text-[1px]'>ـ</span>
                                        {isArabic ? ` ${safeItem.total_price} جنية` : `${safeItem.total_price} EGP`}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              } catch (itemError) {
                                console.error('Error rendering order item:', itemError, item);
                                return null;
                              }
                            })}
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
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActiveStatus(safeOrder.status, 'received') ? 'bg-green-100' : 'bg-gray-100'}`}>
                              <FaHome className={`${isActiveStatus(safeOrder.status, 'received') ? 'text-green-500' : 'text-gray-400'}`} />
                            </div>
                            <span className={`text-xs mt-1 ${isActiveStatus(safeOrder.status, 'received') ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                              {isArabic ? 'تم الاستلام' : 'Received'}
                            </span>
                          </div>

                          <div className={`flex flex-col items-center ${isArabic ? 'text-right' : 'text-left'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActiveStatus(safeOrder.status, 'prepared') ? 'bg-green-100' : 'bg-gray-100'}`}>
                              <FaBox className={`${isActiveStatus(safeOrder.status, 'prepared') ? 'text-green-500' : 'text-gray-400'}`} />
                            </div>
                            <span className={`text-xs mt-1 ${isActiveStatus(safeOrder.status, 'prepared') ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                              {isArabic ? 'تم التحضير' : 'Prepared'}
                            </span>
                          </div>

                          <div className={`flex flex-col items-center ${isArabic ? 'text-right' : 'text-left'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActiveStatus(safeOrder.status, 'collected') ? 'bg-green-100' : 'bg-gray-100'}`}>
                              <FaTruck className={`${isActiveStatus(safeOrder.status, 'collected') ? 'text-green-500' : 'text-gray-400'}`} />
                            </div>
                            <span className={`text-xs mt-1 ${isActiveStatus(safeOrder.status, 'collected') ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                              {isArabic ? 'مع المندوب' : 'With Delivery'}
                            </span>
                          </div>

                          <div className={`flex flex-col items-center ${isArabic ? 'text-right' : 'text-left'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActiveStatus(safeOrder.status, 'delivered') ? 'bg-green-100' : 'bg-gray-100'}`}>
                              <FaCheckCircle className={`${isActiveStatus(safeOrder.status, 'delivered') ? 'text-green-500' : 'text-gray-400'}`} />
                            </div>
                            <span className={`text-xs mt-1 ${isActiveStatus(safeOrder.status, 'delivered') ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
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
                            {safeOrder.address}, {safeOrder.city}, {safeOrder.zone}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">
                            {isArabic ? ': مصدر الطلب' : 'Order Source:'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {safeOrder.order_source === 'Phone' ? (isArabic ? 'هاتف' : 'Phone') :
                              safeOrder.order_source === 'Whatsapp' ? (isArabic ? 'واتساب' : 'Whatsapp') :
                                safeOrder.order_source === 'Instagram' ? (isArabic ? 'انستجرام' : 'Instagram') :
                                  safeOrder.order_source}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } catch (orderError) {
                console.error('Error rendering order:', orderError, order);
                return null;
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}