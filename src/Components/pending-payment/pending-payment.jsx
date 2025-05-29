import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon } from '@heroicons/react/24/solid';
import { UserContext } from '../../Context/UserContext';

const PendingPayment = () => {
  const navigate = useNavigate();
  const { isArabic } = useContext(UserContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/orders');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 mt-24 sm:mt-0">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="flex justify-center mb-6">
          <span className="flex items-center justify-center rounded-full bg-yellow-500 bg-opacity-20 p-4">
            <ClockIcon className="h-16 w-16 text-yellow-500" />
          </span>
        </div>
        <h1 className="text-2xl sm:text-2xl text-lg font-bold text-gray-800 mb-2">
          {isArabic ? 'الدفع قيد المعالجة' : 'Payment Pending'}
        </h1>
        <p className="text-gray-600 mb-6 text-base sm:text-base text-sm font-light">
          {isArabic 
            ? 'طلبك قيد المعالجة. سنقوم بتحديث حالة الدفع قريباً.' 
            : 'Your order is being processed. We will update your payment status shortly.'}
        </p>
        <p className="text-gray-500 text-sm sm:text-sm text-xs font-light">
          {isArabic 
            ? 'سيتم تحويلك إلى صفحة الطلبات تلقائياً...' 
            : 'You will be redirected to your orders page shortly...'}
        </p>
        
        <button 
          onClick={() => navigate('/orders')}
          className={`mt-6 px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition font-light`}
        >
          {isArabic ? 'الذهاب إلى الطلبات الآن' : 'Go to Orders Now'}
        </button>
      </div>
    </div>
  );
};

export default PendingPayment;