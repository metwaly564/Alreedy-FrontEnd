import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { UserContext } from '../../Context/UserContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { isArabic } = useContext(UserContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 mt-24 sm:mt-0">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="flex justify-center mb-6">
          <span className="flex items-center justify-center rounded-full bg-green-500 bg-opacity-20 p-4">
            <CheckCircleIcon className="h-16 w-16 text-green-500" />
          </span>
        </div>
        <h1 className="text-2xl sm:text-2xl text-lg font-bold text-gray-800 mb-2">
          {isArabic ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
        </h1>
        <p className="text-gray-600 mb-6 text-base sm:text-base text-sm font-light">
          {isArabic 
            ? 'شكراً لشرائك. تمت معالجة دفعتك بنجاح.' 
            : 'Thank you for your purchase. Your payment has been processed successfully.'}
        </p>
        <p className="text-gray-500 text-sm sm:text-sm text-xs font-light">
          {isArabic 
            ? 'سيتم تحويلك إلى الصفحة الرئيسية قريباً...' 
            : 'You will be redirected to the home page shortly...'}
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;