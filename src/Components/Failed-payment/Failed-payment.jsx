import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const FailedPayment = () => {
  const navigate = useNavigate();
  const isArabic = localStorage.getItem('isArabic') === 'true';

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/cart');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 `}>
      <div className={`bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center `} dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="flex justify-center mb-6">
          <span className="flex items-center justify-center rounded-full bg-red-500 bg-opacity-20 p-4">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500" />
          </span>
        </div>
        <h1 className="text-2xl sm:text-2xl text-lg font-bold text-gray-800 mb-2">
          {isArabic ? 'فشل في عملية الدفع' : 'Payment Failed'}
        </h1>
        <p className="text-gray-600 mb-6 text-base sm:text-base text-sm font-light">
          {isArabic 
            ? 'عذراً، لم يتمكن النظام من معالجة دفعتك. يرجى المحاولة مرة أخرى.'
            : 'Sorry, we couldn\'t process your payment. Please try again.'}
        </p>
        <p className="text-gray-500 text-sm sm:text-sm text-xs font-light">
          {isArabic 
            ? 'سيتم إعادة توجيهك إلى صفحة السلة تلقائياً...' 
            : 'You will be redirected to your cart shortly...'}
        </p>
        
        <button 
          onClick={() => navigate('/cart')}
          className={`mt-6 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-light`}
        >
          {isArabic ? 'العودة إلى السلة الآن' : 'Return to Cart Now'}
        </button>
      </div>
    </div>
  );
};

export default FailedPayment;